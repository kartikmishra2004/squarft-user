import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useMemo } from 'react';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { selectSeenProjects } from '../../store/slices/projectViewTrackingSlice';

/**
 * SeenTabContent Component
 * 
 * Displays projects that have been viewed 5+ times within the last 7 days.
 * Uses memoized selector to derive filtered data from Redux state.
 */
export default function SeenTabContent() {
  const dispatch = useDispatch();
  
  // Select all qualified "seen" projects (count >= 5, not expired)
  const seenTrackers = useSelector(selectSeenProjects);
  
  // Memoize the display data
  const displayProjects = useMemo(() => {
    // Here you would typically enrich the tracker data with actual project details
    // For now, we'll return the trackers with placeholder data
    // In a real app, you'd fetch project details for these IDs
    return seenTrackers.map(tracker => ({
      id: tracker.id,
      viewCount: tracker.count,
      firstQualifiedAt: tracker.firstQualifiedAt,
      // You would fetch these from your project store or API:
      // name: project.name,
      // image: project.cover_image_url,
      // location: project.location,
      // price: project.price_range,
    }));
  }, [seenTrackers]);

  const renderSeenProject = ({ item }) => {
    // Calculate days remaining
    const daysRemaining = item.firstQualifiedAt 
      ? Math.ceil((7 * 24 * 60 * 60 * 1000 - (Date.now() - item.firstQualifiedAt)) / (24 * 60 * 60 * 1000))
      : 0;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push({
          pathname: '/(screens)/project-detail',
          params: { id: item.id, slug: 'none' }
        })}
        className="mx-4 mb-3 bg-white rounded-2xl border border-gray-100 overflow-hidden"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <View className="flex-row">
          {/* Image Placeholder */}
          <View className="w-[120px] h-[120px] bg-gray-100 items-center justify-center">
            <MaterialCommunityIcons name="office-building-outline" size={40} color="#9CA3AF" />
          </View>

          {/* Content */}
          <View className="flex-1 p-3 justify-between">
            <View>
              <Text className="text-[15px] font-manrope-bold text-gray-900" numberOfLines={1}>
                Project {item.id.slice(0, 8)}...
              </Text>
              <Text className="text-[12px] text-gray-500 mt-1">
                Viewed {item.viewCount} times
              </Text>
            </View>

            {/* Badge */}
            <View className="flex-row items-center justify-between mt-2">
              <View className="bg-purple-50 rounded-lg px-2 py-1">
                <Text className="text-[11px] text-purple-700 font-manrope-bold">
                  {daysRemaining} days left
                </Text>
              </View>
              <MaterialCommunityIcons name="eye-check-outline" size={20} color="#8B5CF6" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center px-8 py-20">
      <MaterialCommunityIcons name="eye-off-outline" size={64} color="#D1D5DB" />
      <Text className="text-[16px] font-manrope-bold text-gray-700 mt-4 text-center">
        No Seen Projects Yet
      </Text>
      <Text className="text-[13px] text-gray-500 mt-2 text-center">
        Projects you view 5+ times will appear here for 7 days
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={displayProjects}
        keyExtractor={(item) => item.id}
        renderItem={renderSeenProject}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
