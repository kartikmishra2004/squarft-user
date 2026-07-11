import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, AppState, Image, Pressable, StatusBar, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  authenticateBiometric,
  getBiometricLockEnabled,
} from "../utils/biometricLock";

const APP_LOGO = require("../assets/icons/app-icon.png");

export default function BiometricLockGate({ children }) {
  const [enabled, setEnabled] = useState(false);
  const [checked, setChecked] = useState(false);
  const [locked, setLocked] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    let active = true;
    (async () => {
      const isEnabled = await getBiometricLockEnabled();
      if (!active) return;
      setEnabled(isEnabled);
      setLocked(isEnabled);
      setChecked(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      const wasActive = appStateRef.current === "active";
      const goingBackground = nextState === "background" || nextState === "inactive";
      if (wasActive && goingBackground && enabled) {
        setLocked(true);
      }
      appStateRef.current = nextState;
    });

    return () => subscription.remove();
  }, [enabled]);

  const unlock = async () => {
    if (authenticating) return;
    setAuthenticating(true);
    const success = await authenticateBiometric("Unlock SquarFT");
    setAuthenticating(false);
    if (success) {
      setLocked(false);
    }
  };

  useEffect(() => {
    if (checked && locked) {
      unlock();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked, locked]);

  if (!checked) return null;

  if (locked) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <StatusBar barStyle="dark-content" />
        <Image
          source={APP_LOGO}
          style={{ width: 64, height: 64, borderRadius: 16 }}
          resizeMode="contain"
        />
        <View className="mt-10 h-20 w-20 items-center justify-center rounded-full bg-[#EDEBFF]">
          <MaterialCommunityIcons name="fingerprint" size={40} color="#4A43EC" />
        </View>
        <Text className="mt-6 text-center text-[17px] font-manrope-extrabold text-[#111827]">
          App Locked
        </Text>
        <Text className="mt-2 text-center text-[13px] font-manrope-medium text-[#6B7280]">
          Use your fingerprint or face ID to continue.
        </Text>
        <Pressable
          onPress={unlock}
          disabled={authenticating}
          className="mt-8 flex-row items-center rounded-full bg-[#4A43EC] px-6 py-3"
        >
          {authenticating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="lock-open-outline" size={18} color="#fff" />
              <Text className="ml-2 text-[13px] font-manrope-bold text-white">Unlock</Text>
            </>
          )}
        </Pressable>
      </View>
    );
  }

  return children;
}
