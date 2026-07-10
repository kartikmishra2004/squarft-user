import { Switch, Text, TouchableOpacity, View } from "react-native";
import { SettledBackdrop, SettledModal } from "./SettledModal";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { toggleReraOnly, toggleSubType } from "../store/slices/filterSlice";

const BHK_OPTIONS = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5+ BHK"];

export default function BHKFilterModal({ visible, onClose }) {
    const dispatch = useDispatch();
    const insets = useSafeAreaInsets();
    const selectedBHKs = useSelector((state) => state.filter.propertySubTypes);
    const reraOnly = useSelector((state) => state.filter.reraOnly);

    return (
        <SettledModal
            visible={visible}
            transparent
            animationType="slide"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={{ flex: 1, justifyContent: "flex-end" }}>
                <SettledBackdrop
                    onPress={onClose}
                    style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(0,0,0,0.35)" }}
                />
                <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 10, paddingBottom: insets.bottom + 24 }}>
                    <View style={{ alignItems: "center", marginBottom: 14 }}>
                        <View style={{ width: 40, height: 4, borderRadius: 999, backgroundColor: "#D1D5DB" }} />
                    </View>
                    <Text style={{ fontSize: 17, fontWeight: "600", color: "#111827", marginBottom: 16, textAlign: "center" }}>
                        Select BHK
                    </Text>

                    {BHK_OPTIONS.map((bhk) => {
                        const isSelected = selectedBHKs.includes(bhk);
                        return (
                            <TouchableOpacity
                                key={bhk}
                                onPress={() => dispatch(toggleSubType(bhk))}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    paddingVertical: 13,
                                    paddingHorizontal: 15,
                                    borderWidth: 1,
                                    borderColor: isSelected ? "#4A43EC" : "#E5E7EB",
                                    borderRadius: 12,
                                    marginBottom: 10,
                                    backgroundColor: isSelected ? "#F5F3FF" : "#fff",
                                }}
                            >
                                <Text style={{ fontSize: 14, color: isSelected ? "#4A43EC" : "#374151", fontWeight: isSelected ? "600" : "400" }}>
                                    {bhk}
                                </Text>
                                {isSelected && <Ionicons name="checkmark-circle" size={20} color="#4A43EC" />}
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
                            paddingHorizontal: 15,
                            borderWidth: 1,
                            borderColor: reraOnly ? "#00B67A" : "#E5E7EB",
                            borderRadius: 12,
                            marginBottom: 14,
                            backgroundColor: reraOnly ? "#F0FDF8" : "#fff",
                        }}
                    >
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                            <View style={{
                                backgroundColor: reraOnly ? "#00B67A" : "#F3F4F6",
                                borderRadius: 8,
                                padding: 5,
                            }}>
                                <MaterialCommunityIcons name="check-decagram" size={16} color={reraOnly ? "#fff" : "#9CA3AF"} />
                            </View>
                            <View>
                                <Text style={{ fontSize: 15, color: reraOnly ? "#00B67A" : "#374151", fontWeight: reraOnly ? "600" : "400" }}>
                                    RERA Approved Only
                                </Text>
                                <Text style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>Show only RERA registered projects</Text>
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
                        style={{ backgroundColor: "#4A43EC", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 2 }}
                    >
                        <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}>Apply</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SettledModal>
    );
}
