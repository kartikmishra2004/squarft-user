/**
 * Notification Icon Renderer
 * Returns appropriate icon component based on notification category
 */

import { View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NOTIFICATION_CATEGORIES } from '../constants/notificationTypes';

/**
 * Get icon component for notification
 * @param {string} category - Notification category from NOTIFICATION_CATEGORIES
 * @returns {JSX.Element} Icon component
 */
export const getNotificationIcon = (category) => {
  switch (category) {
    case NOTIFICATION_CATEGORIES.SUCCESS:
      return (
        <View className="w-12 h-12 rounded-full bg-[#E8EAFD] items-center justify-center">
          <Ionicons name="checkmark-circle" size={28} color="#4A43EC" />
        </View>
      );

    case NOTIFICATION_CATEGORIES.ERROR:
      return (
        <View className="w-12 h-12 rounded-full bg-[#FEEBF0] items-center justify-center">
          <Ionicons name="close-circle" size={28} color="#FF3B30" />
        </View>
      );

    case NOTIFICATION_CATEGORIES.WARNING:
      return (
        <View className="w-12 h-12 rounded-full bg-[#FFF3D6] items-center justify-center">
          <Ionicons name="warning" size={24} color="#FFB800" />
        </View>
      );

    case NOTIFICATION_CATEGORIES.INFO:
      return (
        <View className="w-12 h-12 rounded-full bg-[#EBF1FF] items-center justify-center">
          <Ionicons name="information-circle" size={28} color="#4A43EC" />
        </View>
      );

    case NOTIFICATION_CATEGORIES.PROPERTY:
      return (
        <View className="w-12 h-12 rounded-full bg-[#E8F5E8] items-center justify-center">
          <MaterialCommunityIcons name="office-building" size={24} color="#10B981" />
        </View>
      );

    case NOTIFICATION_CATEGORIES.VISIT:
      return (
        <View className="w-12 h-12 rounded-full bg-[#FFF3D6] items-center justify-center">
          <Ionicons name="calendar" size={24} color="#FFB800" />
        </View>
      );

    case NOTIFICATION_CATEGORIES.DEAL:
      return (
        <View className="w-12 h-12 rounded-full bg-[#E0F2F1] items-center justify-center">
          <MaterialCommunityIcons name="handshake" size={24} color="#00897B" />
        </View>
      );

    case NOTIFICATION_CATEGORIES.PAYMENT:
      return (
        <View className="w-12 h-12 rounded-full bg-[#FFF3E0] items-center justify-center">
          <MaterialCommunityIcons name="currency-inr" size={24} color="#F57C00" />
        </View>
      );

    case NOTIFICATION_CATEGORIES.DOCUMENT:
      return (
        <View className="w-12 h-12 rounded-full bg-[#F3E5F5] items-center justify-center">
          <Ionicons name="document-text" size={24} color="#7B1FA2" />
        </View>
      );

    case NOTIFICATION_CATEGORIES.PROFILE:
      return (
        <View className="w-12 h-12 rounded-full bg-[#E1F5FE] items-center justify-center">
          <Ionicons name="person" size={24} color="#0277BD" />
        </View>
      );

    default:
      return (
        <View className="w-12 h-12 rounded-full bg-[#EBF1FF] items-center justify-center">
          <Ionicons name="notifications" size={24} color="#4A43EC" />
        </View>
      );
  }
};
