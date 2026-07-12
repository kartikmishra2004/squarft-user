import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, StatusBar, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  authenticateBiometric,
  getBiometricLockEnabled,
  isSessionUnlocked,
  markSessionUnlocked,
} from "../utils/biometricLock";

const APP_LOGO = require("../assets/icons/app-icon.png");

export default function BiometricLockGate({ children }) {
  const [checked, setChecked] = useState(false);
  const [locked, setLocked] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (isSessionUnlocked()) {
        if (!active) return;
        setChecked(true);
        return;
      }
      const isEnabled = await getBiometricLockEnabled();
      if (!active) return;
      setLocked(isEnabled);
      setChecked(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  const unlock = async () => {
    if (authenticating) return;
    setAuthenticating(true);
    const success = await authenticateBiometric("Unlock SquarFT");
    setAuthenticating(false);
    if (success) {
      markSessionUnlocked();
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

  return (
    <View style={{ flex: 1 }}>
      {children}
      {locked && (
        <View
          className="absolute inset-0 items-center justify-center bg-white px-8"
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        >
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
      )}
    </View>
  );
}
