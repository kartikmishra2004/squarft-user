import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

export const Shimmer = ({ style, className }) => {
  const anim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.7] });
  
  return <Animated.View style={[{ backgroundColor: '#E5E7EB', borderRadius: 6, opacity }, style]} className={className} />;
};

export const PropertyCardSkeleton = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-4">
      {/* Image skeleton */}
      <View className="flex-row h-36 w-full">
        <Animated.View 
          style={{ opacity }} 
          className="flex-[2] bg-gray-200 border-r-2 border-white"
        />
        <Animated.View 
          style={{ opacity }} 
          className="flex-[1] bg-gray-200"
        />
      </View>

      {/* Content skeleton */}
      <View className="px-3 pt-3 pb-2">
        <Animated.View 
          style={{ opacity }} 
          className="h-3 bg-gray-200 rounded w-3/4 mb-2"
        />
        <Animated.View 
          style={{ opacity }} 
          className="h-4 bg-gray-200 rounded w-full mb-2"
        />
        <Animated.View 
          style={{ opacity }} 
          className="h-3 bg-gray-200 rounded w-1/2"
        />
      </View>

      <View className="mx-3 mb-2" style={{ borderBottomWidth: 1, borderStyle: 'dashed', borderColor: '#E5E7EB' }} />

      {/* Footer skeleton */}
      <View className="px-3 pb-3">
        <Animated.View 
          style={{ opacity }} 
          className="h-3 bg-gray-200 rounded w-1/3 mb-2"
        />
        <Animated.View 
          style={{ opacity }} 
          className="h-5 bg-gray-200 rounded w-1/4 mb-3"
        />
        <Animated.View 
          style={{ opacity }} 
          className="h-10 bg-gray-200 rounded-xl w-full"
        />
      </View>
    </View>
  );
};

export const SearchHistoryItemSkeleton = () => (
  <View className="flex-row items-center py-3 px-4 border-b border-gray-100">
    <Shimmer style={{ width: 36, height: 36, borderRadius: 18, marginRight: 12 }} />
    <View className="flex-1">
      <Shimmer style={{ height: 14, width: '70%', marginBottom: 6 }} />
      <Shimmer style={{ height: 10, width: '40%' }} />
    </View>
    <Shimmer style={{ width: 24, height: 24, borderRadius: 12 }} />
  </View>
);

export const HomeSectionSkeleton = ({ count = 2 }) => (
  <View className="flex-row">
    {Array.from({ length: count }).map((_, index) => (
      <View
        key={index}
        className="bg-white rounded-2xl overflow-hidden p-2.5"
        style={{ width: 166, height: 228, marginRight: index < count - 1 ? 12 : 0 }}
      >
        <Shimmer style={{ width: 144, height: 148, borderRadius: 12, marginBottom: 12 }} />
        <Shimmer style={{ height: 14, width: '80%', marginBottom: 8 }} />
        <Shimmer style={{ height: 12, width: '60%', marginBottom: 8 }} />
        <View className="flex-row items-center">
          <Shimmer style={{ width: 16, height: 16, borderRadius: 8, marginRight: 6 }} />
          <Shimmer style={{ height: 10, width: '35%', marginRight: 10 }} />
          <Shimmer style={{ width: 16, height: 16, borderRadius: 8, marginRight: 6 }} />
          <Shimmer style={{ height: 10, width: '20%' }} />
        </View>
      </View>
    ))}
  </View>
);

export const ProfileSkeleton = () => (
  <View className="flex-1 bg-[#F3F4F6]">
    <View className="items-center pt-8 pb-4">
      <Shimmer style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 12 }} />
      <Shimmer style={{ height: 18, width: 150, marginBottom: 8 }} />
      <Shimmer style={{ height: 20, width: 120, marginBottom: 6, borderRadius: 25 }} />
      <Shimmer style={{ height: 12, width: 180 }} />
    </View>
  </View>
);
