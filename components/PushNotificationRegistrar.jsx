import { useEffect } from "react";
import { useSelector } from "react-redux";
import { registerForPushNotificationsAsync } from "../services/pushNotifications";

export default function PushNotificationRegistrar() {
    const { isLoggedIn, token } = useSelector((state) => state.auth);

    useEffect(() => {
        console.log("[PushNotificationRegistrar] Auth state changed", {
            isLoggedIn,
            hasToken: Boolean(token),
        });

        if (!isLoggedIn || !token) {
            console.log("[PushNotificationRegistrar] Registration skipped", {
                reason: !isLoggedIn ? "not-logged-in" : "missing-auth-token",
            });
            return;
        }

        let cancelled = false;

        registerForPushNotificationsAsync(token)
            .then((expoPushToken) => {
                if (!cancelled) {
                    console.log("[PushNotificationRegistrar] Registration flow completed", {
                        registered: Boolean(expoPushToken),
                    });
                }
            })
            .catch((error) => {
                if (!cancelled) {
                    console.warn("[PushNotificationRegistrar] Registration flow failed", {
                        message: error.message,
                    });
                }
            });

        return () => {
            cancelled = true;
            console.log("[PushNotificationRegistrar] Registration effect cleaned up");
        };
    }, [isLoggedIn, token]);

    return null;
}
