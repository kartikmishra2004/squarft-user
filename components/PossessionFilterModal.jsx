import { Modal, Pressable, Switch, Text, TouchableOpacity, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { togglePossession, toggleReraOnly } from "../store/slices/filterSlice";

const POSSESSION_OPTIONS = [
    {
        key: "Ready to Move",
        icon: "home-outline",
        color: "#4A43EC",
        bg: "#F5F3FF",
        activeBorder: "#4A43EC",
    },
    {
        key: "Under Construction",
        icon: "crane",
        color: "#4A43EC",
        bg: "#F5F3FF",
        activeBorder: "#4A43EC",
    },
];

export default function PossessionFilterModal({ visible, onClose }) {
    const dispatch = useDispatch();
    const possessionStatus = useSelector((s) => s.filter.possessionStatus);
    const reraOnly = useSelector((s) => s.filter.reraOnly);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={{ flex: 1, justifyContent: "flex-end" }}>
                <Pressable
                    onPress={onClose}
                    style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(0,0,0,0.35)" }}
                />
                <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24 }}>
                    <View style={{ alignItems: "center", marginBottom: 14 }}>
                        <View style={{ width: 40, height: 4, borderRadius: 999, backgroundColor: "#D1D5DB" }} />
                    </View>
                    <Text style={{ fontSize: 17, fontWeight: "600", color: "#111827", marginBottom: 16, textAlign: "center" }}>
                        Possession Status
                    </Text>

                    {POSSESSION_OPTIONS.map((opt) => {
                        const isSelected = possessionStatus.includes(opt.key);
                        return (
                            <TouchableOpacity
                                key={opt.key}
                                onPress={() => dispatch(togglePossession(opt.key))}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    paddingVertical: 14,
                                    paddingHorizontal: 16,
                                    borderWidth: 1,
                                    borderColor: isSelected ? opt.activeBorder : "#E5E7EB",
                                    borderRadius: 12,
                                    marginBottom: 10,
                                    backgroundColor: isSelected ? opt.bg : "#fff",
                                }}
                            >
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                    <View style={{
                                        backgroundColor: isSelected ? opt.color : "#F3F4F6",
                                        borderRadius: 8,
                                        padding: 6,
                                    }}>
                                        <MaterialCommunityIcons
                                            name={opt.icon}
                                            size={16}
                                            color={isSelected ? "#fff" : "#9CA3AF"}
                                        />
                                    </View>
                                    <Text style={{
                                        fontSize: 15,
                                        color: isSelected ? opt.color : "#374151",
                                        fontWeight: isSelected ? "600" : "400",
                                    }}>
                                        {opt.key}
                                    </Text>
                                </View>
                                {isSelected && (
                                    <Ionicons name="checkmark-circle" size={20} color={opt.color} />
                                )}
                            </TouchableOpacity>
                        );
                    })}

                    <TouchableOpacity
                        onPress={() => dispatch(toggleReraOnly())}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingVertical: 10,
                            paddingHorizontal: 16,
                            borderWidth: 1,
                            borderColor: reraOnly ? "#00B67A" : "#E5E7EB",
                            borderRadius: 12,
                            marginBottom: 14,
                            backgroundColor: reraOnly ? "#F0FDF8" : "#fff",
                        }}
                    >
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                            <View style={{
                                backgroundColor: reraOnly ? "#00B67A" : "#F3F4F6",
                                borderRadius: 8,
                                padding: 6,
                            }}>
                                <MaterialCommunityIcons
                                    name="check-decagram"
                                    size={16}
                                    color={reraOnly ? "#fff" : "#9CA3AF"}
                                />
                            </View>
                            <View>
                                <Text style={{ fontSize: 15, color: reraOnly ? "#00B67A" : "#374151", fontWeight: reraOnly ? "600" : "400" }}>
                                    RERA Approved Only
                                </Text>
                                <Text style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>
                                    Show only RERA registered projects
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={reraOnly}
                            onValueChange={() => dispatch(toggleReraOnly())}
                            trackColor={{ false: "#E5E7EB", true: "#6EE7B7" }}
                            thumbColor={reraOnly ? "#00B67A" : "#fff"}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onClose}
                        style={{ backgroundColor: "#4A43EC", borderRadius: 12, paddingVertical: 14, alignItems: "center" }}
                    >
                        <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}>Apply</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
