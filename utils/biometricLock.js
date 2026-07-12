import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";

const STORAGE_KEY = "@squarft/biometric_lock_enabled";

// Module-level (not React state) so it survives BiometricLockGate remounting
// mid-session — e.g. when a native view (Google Maps) forces the JS context
// to reload. Only resets when the app process itself is killed and restarted.
let sessionUnlocked = false;

export function isSessionUnlocked() {
  return sessionUnlocked;
}

export function markSessionUnlocked() {
  sessionUnlocked = true;
}

export async function isBiometricHardwareAvailable() {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  } catch {
    return false;
  }
}

export async function getBiometricLabel() {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return "Face ID";
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return "Fingerprint";
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return "Iris";
    }
    return "Biometric";
  } catch {
    return "Biometric";
  }
}

export async function getBiometricLockEnabled() {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    return value === "true";
  } catch {
    return false;
  }
}

export async function setBiometricLockEnabled(enabled) {
  await AsyncStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
}

export async function authenticateBiometric(promptMessage = "Authenticate to continue") {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: "Cancel",
      disableDeviceFallback: false,
    });
    return result.success;
  } catch {
    return false;
  }
}
