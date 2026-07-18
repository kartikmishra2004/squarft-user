import { useEffect, useRef } from "react";
import { AppState } from "react-native";

export function useRefetchOnForeground(callback) {
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      const wasBackgrounded = appStateRef.current.match(/inactive|background/);
      if (wasBackgrounded && nextState === "active") {
        callback();
      }
      appStateRef.current = nextState;
    });

    return () => subscription.remove();
  }, [callback]);
}
