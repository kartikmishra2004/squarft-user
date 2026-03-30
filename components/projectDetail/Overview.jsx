import { View, Text } from "react-native";

export default function Overview({ project }) {
    return (
        <View className="mx-4 mb-4">
            <Text className="text-base font-bold text-gray-900 mb-2">About Project</Text>
            <Text className="text-sm text-gray-500 leading-6">
                {project.name} by {project.builder} is a premium residential project located at {project.location}. Offering {project.subTypes.join(", ")} BHK configurations with possession by {project.possession}.
            </Text>
        </View>
    );
}
