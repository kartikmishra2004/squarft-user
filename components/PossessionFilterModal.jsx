import { useEffect, useRef, useCallback } from "react";
import { View, Text, TouchableOpacity, Switch } from "react-native";
import { BottomSheetModal, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { togglePossession, toggleReraOnly } from "../store/slices/filterSlice";

const POSSESSION_OPTIONS = [
    {
        key: 'Ready to Move',
        icon: 'home-outline',
        color: '#4A43EC',
        bg: '#F5F3FF',
        activeBorder: '#4A43EC',
    },
    {
        key: 'Under Construction',
        icon: 'crane',
        color: '#4A43EC',
        bg: '#F5F3FF',
        activeBorder: '#4A43EC',
    },
];

export default function PossessionFilterModal({ visible, onClose }) {
    const dispatch = useDispatch();
    const possessionStatus = useSelector((s) => s.filter.possessionStatus);
    const reraOnly = useSelector((s) => s.filter.reraOnly);
    const sheetRef = useRef(null);

    useEffect(() => {
        if (visible) sheetRef.current?.present();
        else sheetRef.current?.dismiss();
    }, [visible]);

    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                onPress={onClose}
            />
        ),
        [onClose],
    );

    return (
        <BottomSheetModal
            ref={sheetRef}
            index={0}
            snapPoints={['52%']}
            enableDynamicSizing={false}
            enablePanDownToClose
            onDismiss={onClose}
            backdropComponent={renderBackdrop}
            handleIndicatorStyle={{ backgroundColor: '#D1D5DB', width: 40 }}
            backgroundStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: '#fff' }}
        >
            <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 }}>
                <Text style={{ fontSize: 17, fontWeight: '600', color: '#111827', marginBottom: 16, textAlign: 'center' }}>
                    Possession Status
                </Text>

                {POSSESSION_OPTIONS.map((opt) => {
                    const isSelected = possessionStatus.includes(opt.key);
                    return (
                        <TouchableOpacity
                            key={opt.key}
                            onPress={() => dispatch(togglePossession(opt.key))}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                paddingVertical: 14,
                                paddingHorizontal: 16,
                                borderWidth: 1,
                                borderColor: isSelected ? opt.activeBorder : '#E5E7EB',
                                borderRadius: 12,
                                marginBottom: 10,
                                backgroundColor: isSelected ? opt.bg : '#fff',
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <View style={{
                                    backgroundColor: isSelected ? opt.color : '#F3F4F6',
                                    borderRadius: 8,
                                    padding: 6,
                                }}>
                                    <MaterialCommunityIcons
                                        name={opt.icon}
                                        size={16}
                                        color={isSelected ? '#fff' : '#9CA3AF'}
                                    />
                                </View>
                                <Text style={{
                                    fontSize: 15,
                                    color: isSelected ? opt.color : '#374151',
                                    fontWeight: isSelected ? '600' : '400',
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

                {/* RERA Toggle */}
                <TouchableOpacity
                    onPress={() => dispatch(toggleReraOnly())}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingVertical: 10,
                        paddingHorizontal: 16,
                        borderWidth: 1,
                        borderColor: reraOnly ? '#00B67A' : '#E5E7EB',
                        borderRadius: 12,
                        marginBottom: 14,
                        
                        backgroundColor: reraOnly ? '#F0FDF8' : '#fff',
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                        <View style={{
                            backgroundColor: reraOnly ? '#00B67A' : '#F3F4F6',
                            borderRadius: 8,
                            padding: 6,
                        }}>
                            <MaterialCommunityIcons
                                name="check-decagram"
                                size={16}
                                color={reraOnly ? '#fff' : '#9CA3AF'}
                            />
                        </View>
                        <View>
                            <Text style={{ fontSize: 15, color: reraOnly ? '#00B67A' : '#374151', fontWeight: reraOnly ? '600' : '400' }}>
                                RERA Approved Only
                            </Text>
                            <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>
                                Show only RERA registered projects
                            </Text>
                        </View>
                    </View>
                    <Switch
                        value={reraOnly}
                        onValueChange={() => dispatch(toggleReraOnly())}
                        trackColor={{ false: '#E5E7EB', true: '#6EE7B7' }}
                        thumbColor={reraOnly ? '#00B67A' : '#fff'}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onClose}
                    style={{ backgroundColor: '#4A43EC', borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
                >
                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Apply</Text>
                </TouchableOpacity>
            </View>
        </BottomSheetModal>
    );
}
