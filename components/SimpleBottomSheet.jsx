import { Modal, Pressable, View, StyleSheet } from "react-native";

export default function SimpleBottomSheet({ visible, onClose, maxHeightPercent = "90%", children }) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <Pressable style={styles.backdrop} onPress={onClose} />
                <View style={[styles.sheet, { maxHeight: maxHeightPercent }]}>
                    <View style={styles.handleRow}>
                        <View style={styles.handle} />
                    </View>
                    {children}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "flex-end" },
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
    sheet: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: "hidden",
    },
    handleRow: { alignItems: "center", paddingTop: 10, paddingBottom: 4 },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#D1D5DB" },
});
