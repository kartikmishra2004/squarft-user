import { createContext, useContext, useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet } from "react-native";

const BackdropContext = createContext(false);

export function SettledModal({ visible, onShow, children, ...props }) {
    const [mounted, setMounted] = useState(visible);
    const [backdropVisible, setBackdropVisible] = useState(false);

    useEffect(() => {
        if (visible) {
            setMounted(true);
            setBackdropVisible(false);
            return undefined;
        }

        setBackdropVisible(false);
        const frame = requestAnimationFrame(() => setMounted(false));
        return () => cancelAnimationFrame(frame);
    }, [visible]);

    return (
        <Modal
            {...props}
            visible={mounted}
            onShow={() => {
                setBackdropVisible(true);
                onShow?.();
            }}
        >
            <BackdropContext.Provider value={backdropVisible && visible}>
                {children}
            </BackdropContext.Provider>
        </Modal>
    );
}

export function SettledBackdrop({ style, ...props }) {
    const visible = useContext(BackdropContext);
    return (
        <Pressable
            {...props}
            pointerEvents={visible ? "auto" : "none"}
            style={[style, !visible && styles.hidden]}
        />
    );
}

const styles = StyleSheet.create({
    hidden: { backgroundColor: "transparent" },
});
