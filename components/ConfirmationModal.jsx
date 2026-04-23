import React from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function ConfirmationModal({
  visible,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  cancelText = "Cancel",
  confirmText = "Confirm",
  icon = "alert-triangle",
  iconColor = "#EF4444",
  iconBgColor = "#FFF1F2",
  confirmButtonColor = "bg-[#EF4444]"
}) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/40 justify-center items-center px-4">
        <View className="bg-white rounded-[20px] p-6 w-full max-w-[340px] items-center">
          <View 
            className="w-14 h-14 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: iconBgColor }}
          >
            <Feather name={icon} size={24} color={iconColor} />
          </View>
          <Text className="text-[18px] font-manrope-extrabold text-[#111827] mb-2 text-center">
            {title}
          </Text>
          <Text className="text-[14px] font-manrope text-[#6B7280] text-center mb-6">
            {message}
          </Text>
          <View className="flex-row gap-3 w-full">
            <Pressable
              onPress={onClose}
              className="flex-1 border border-gray-200 rounded-[12px] py-3.5 items-center justify-center"
            >
              <Text className="text-[#4B5563] font-manrope-bold text-[14px]">{cancelText}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              className={`flex-1 rounded-[12px] py-3.5 items-center justify-center ${confirmButtonColor}`}
            >
              <Text className="text-white font-manrope-bold text-[14px]">{confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
