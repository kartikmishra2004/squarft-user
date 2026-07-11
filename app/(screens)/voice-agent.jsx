import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  LogBox,
  Platform,
  Pressable,
  StatusBar,
  Text,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { AudioSession } from "@livekit/react-native";
import { ConnectionState, DisconnectReason, Room, RoomEvent } from "livekit-client";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { voiceApi } from "../../services/voiceApi";

LogBox.ignoreLogs([
  "could not createOffer with closed peer connection",
  "Cannot read property 'Closing' of undefined",
  "Uncaught (in promise, id: 0) TypeError: Cannot read property 'Closing' of undefined",
]);

function getParam(value, fallback = "") {
  if (Array.isArray(value)) return value[0] || fallback;
  return value || fallback;
}

async function requestMicrophonePermission() {
  if (Platform.OS !== "android") return true;

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    {
      title: "Microphone access",
      message: "SquarFT needs microphone access for AI voice calls.",
      buttonPositive: "Allow",
      buttonNegative: "Not now",
    }
  );

  return result === PermissionsAndroid.RESULTS.GRANTED;
}

function getStatusText(connectionState, isStarting, error) {
  if (error) return "Call failed";
  if (isStarting) return "Starting voice...";
  if (connectionState === ConnectionState.Connected) return "Connected";
  if (connectionState === ConnectionState.Reconnecting) return "Reconnecting...";
  if (connectionState === ConnectionState.Connecting) return "Connecting...";
  return "Disconnected";
}

function getDisconnectMessage(reason) {
  if (reason === DisconnectReason.CLIENT_INITIATED || reason === undefined) {
    return "";
  }

  if (reason === DisconnectReason.DUPLICATE_IDENTITY) {
    return "This call was opened from another device or session.";
  }

  if (reason === DisconnectReason.STATE_MISMATCH) {
    return "Connection was interrupted. Please end and start the call again.";
  }

  if (reason === DisconnectReason.JOIN_FAILURE) {
    return "Could not fully join the voice room. Please try again.";
  }

  return "Voice room disconnected. Please try again.";
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

export default function VoiceAgentScreen() {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const phoneNumber = getParam(params.phoneNumber);
  const name = getParam(params.name, "App User");
  const roomRef = useRef(null);
  const mountedRef = useRef(true);
  const endingRef = useRef(false);
  const disconnectPromiseRef = useRef(null);

  const [connectionState, setConnectionState] = useState(ConnectionState.Disconnected);
  const [isStarting, setIsStarting] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [remoteCount, setRemoteCount] = useState(0);
  const [roomName, setRoomName] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState("");

  const statusText = useMemo(
    () => getStatusText(connectionState, isStarting, error),
    [connectionState, isStarting, error]
  );

  const isCallActive = () => mountedRef.current && !endingRef.current;

  const disconnectRoom = async () => {
    if (disconnectPromiseRef.current) {
      return disconnectPromiseRef.current;
    }

    endingRef.current = true;
    const room = roomRef.current;
    roomRef.current = null;

    disconnectPromiseRef.current = Promise.resolve()
      .then(async () => {
        if (room && room.state !== ConnectionState.Disconnected) {
          await room.disconnect(true).catch(() => {});
        }
      })
      .finally(async () => {
        await AudioSession.stopAudioSession().catch(() => {});
      });

    return disconnectPromiseRef.current;
  };

  useEffect(() => {
    mountedRef.current = true;
    endingRef.current = false;
    disconnectPromiseRef.current = null;

    const startCall = async () => {
      try {
        if (!phoneNumber) {
          throw new Error("Phone number is missing. Please update your profile and try again.");
        }

        const hasPermission = await requestMicrophonePermission();
        if (!hasPermission) {
          throw new Error("Microphone permission is required for voice calls.");
        }

        const tokenResponse = await voiceApi.requestVoiceCallToken(phoneNumber, name);
        if (!isCallActive()) return;

        setRoomName(tokenResponse.room_name);

        const room = new Room({
          adaptiveStream: false,
          dynacast: false,
          stopLocalTrackOnUnpublish: true,
        });
        roomRef.current = room;

        const updateRemoteCount = () => {
          if (isCallActive()) {
            setRemoteCount(room.remoteParticipants.size);
          }
        };

        room
          .on(RoomEvent.ConnectionStateChanged, (nextState) => {
            if (isCallActive()) {
              setConnectionState(nextState);
            }
          })
          .on(RoomEvent.ParticipantConnected, updateRemoteCount)
          .on(RoomEvent.ParticipantDisconnected, updateRemoteCount)
          .on(RoomEvent.Disconnected, (reason) => {
            if (mountedRef.current) {
              setConnectionState(ConnectionState.Disconnected);
              setRemoteCount(0);
              const message = endingRef.current ? "" : getDisconnectMessage(reason);
              if (message) {
                setError(message);
              }
            }
          })
          .on(RoomEvent.Reconnecting, () => {
            if (isCallActive()) {
              setConnectionState(ConnectionState.Reconnecting);
            }
          })
          .on(RoomEvent.Reconnected, () => {
            if (isCallActive()) {
              setConnectionState(ConnectionState.Connected);
              setError("");
              updateRemoteCount();
            }
          })
          .on(RoomEvent.MediaDevicesError, (mediaError) => {
            if (isCallActive()) {
              setError(mediaError?.message || "Could not access microphone.");
            }
          });

        setConnectionState(ConnectionState.Connecting);
        await AudioSession.startAudioSession();
        if (!isCallActive()) {
          await disconnectRoom();
          return;
        }

        await room.connect(tokenResponse.url, tokenResponse.token, { autoSubscribe: true });
        if (!isCallActive()) {
          await disconnectRoom();
          return;
        }

        await room.startAudio();
        if (!isCallActive()) {
          await disconnectRoom();
          return;
        }

        await room.localParticipant.setMicrophoneEnabled(true);

        if (!isCallActive()) return;
        setIsMicEnabled(room.localParticipant.isMicrophoneEnabled);
        setConnectionState(room.state);
        updateRemoteCount();
      } catch (callError) {
        if (isCallActive()) {
          setError(
            callError.message === "Network request failed"
              ? "Cannot connect to the AI service. Please check that the voice backend is running."
              : callError.message || "Voice call failed."
          );
        }
      } finally {
        if (isCallActive()) {
          setIsStarting(false);
        }
      }
    };

    startCall();

    return () => {
      mountedRef.current = false;
      disconnectRoom();
    };
  }, [name, phoneNumber]);

  useEffect(() => {
    if (connectionState !== ConnectionState.Connected) return undefined;

    const interval = setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [connectionState]);

  const toggleMic = async () => {
    const room = roomRef.current;
    if (!room || connectionState !== ConnectionState.Connected) return;

    try {
      const nextValue = !room.localParticipant.isMicrophoneEnabled;
      await room.localParticipant.setMicrophoneEnabled(nextValue);
      setIsMicEnabled(room.localParticipant.isMicrophoneEnabled);
    } catch (micError) {
      Alert.alert("Microphone error", micError.message || "Could not update microphone.");
    }
  };

  const endCall = async () => {
    mountedRef.current = false;
    await disconnectRoom();
    router.back();
  };

  return (
    <View className="flex-1 bg-[#0F172A]">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />

      <View
        className="flex-row items-center justify-between px-5 pb-4"
        style={{ paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 14 : 58 }}
      >
        <Pressable
          onPress={endCall}
          className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
          accessibilityRole="button"
          accessibilityLabel="Close voice call"
        >
          <Ionicons name="chevron-back" size={22} color="white" />
        </Pressable>
        <View className="items-center">
          <Text className="text-[17px] font-lato-bold text-white">Sasha AI</Text>
          <Text className="mt-0.5 text-[11px] font-manrope-semibold text-[#A7F3D0]">{statusText}</Text>
        </View>
        <View className="h-10 w-10" />
      </View>

      <View className="flex-1 items-center justify-center px-8">
        <View className="h-36 w-36 items-center justify-center rounded-full bg-[#4A43EC]">
          <MaterialCommunityIcons name="robot-outline" size={64} color="white" />
        </View>

        <Text className="mt-8 text-center text-[25px] font-manrope-extrabold text-white">Sasha AI</Text>
        <Text className="mt-2 text-center text-[13px] font-manrope-medium text-slate-300">
          {error || (connectionState === ConnectionState.Connected ? formatDuration(elapsedSeconds) : "Preparing your call")}
        </Text>

        <View className="mt-7 flex-row items-center rounded-full bg-white/10 px-4 py-2">
          <View className={`mr-2 h-2.5 w-2.5 rounded-full ${connectionState === ConnectionState.Connected ? "bg-[#22C55E]" : "bg-[#F59E0B]"}`} />
          <Text className="text-[12px] font-manrope-bold text-white">
            {remoteCount > 0 ? `${remoteCount} participant${remoteCount > 1 ? "s" : ""} connected` : "Waiting for agent audio"}
          </Text>
        </View>

        {!!roomName && (
          <Text className="mt-3 text-center text-[10px] font-manrope-medium text-slate-500" numberOfLines={1}>
            {roomName}
          </Text>
        )}
      </View>

      <View
        className="flex-row items-center justify-center gap-5 px-8"
        style={{ paddingBottom: Math.max(insets.bottom, 40) }}
      >
        <Pressable
          onPress={toggleMic}
          disabled={connectionState !== ConnectionState.Connected}
          className={`h-16 w-16 items-center justify-center rounded-full ${isMicEnabled ? "bg-white/15" : "bg-white"}`}
          accessibilityRole="button"
          accessibilityLabel={isMicEnabled ? "Mute microphone" : "Unmute microphone"}
        >
          <Ionicons name={isMicEnabled ? "mic" : "mic-off"} size={24} color={isMicEnabled ? "white" : "#111827"} />
        </Pressable>

        <Pressable
          onPress={endCall}
          className="h-16 w-16 items-center justify-center rounded-full bg-[#EF4444]"
          accessibilityRole="button"
          accessibilityLabel="End voice call"
        >
          <Ionicons name="call" size={25} color="white" style={{ transform: [{ rotate: "135deg" }] }} />
        </Pressable>
      </View>

      {isStarting && (
        <View className="absolute bottom-32 left-0 right-0 items-center">
          <ActivityIndicator color="white" />
        </View>
      )}
    </View>
  );
}
