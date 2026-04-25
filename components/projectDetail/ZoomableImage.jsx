import React from "react";
import { Modal, View, TouchableOpacity, Dimensions, StatusBar, StyleSheet } from "react-native";
import { GestureHandlerRootView, GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function ZoomableImage({ visible, onClose, source }) {
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);

    // RESET FUNCTION
    const resetTransform = () => {
        'worklet';
        scale.value = withSpring(1);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedScale.value = 1;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
    };

    // PINCH GESTURE
    const pinchGesture = Gesture.Pinch()
        .onUpdate((e) => {
            scale.value = savedScale.value * e.scale;
        })
        .onEnd(() => {
            if (scale.value < 1) {
                resetTransform();
            } else {
                savedScale.value = scale.value;
            }
        });

    // PAN GESTURE
    const panGesture = Gesture.Pan()
        .minPointers(1) // Ek finger se bhi pan ho sake
        .onUpdate((e) => {
            if (scale.value > 1) {
                translateX.value = savedTranslateX.value + e.translationX;
                translateY.value = savedTranslateY.value + e.translationY;
            }
        })
        .onEnd(() => {
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        });

    // Merge gestures
    const composed = Gesture.Simultaneous(pinchGesture, panGesture);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    const handleClose = () => {
        resetTransform();
        onClose();
    };

    return (
        <Modal 
            visible={visible} 
            transparent={true} 
            animationType="fade" 
            onRequestClose={handleClose}
        >
            <StatusBar hidden />
            {/* CRITICAL: GestureHandlerRootView must be inside Modal for Android */}
            <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'black' }}>
                <View style={styles.container}>
                    
                    <GestureDetector gesture={composed}>
                        <Animated.View style={styles.imageWrapper}>
                            <Animated.Image
                                source={source}
                                style={[styles.image, animatedStyle]}
                                resizeMode="contain"
                            />
                        </Animated.View>
                    </GestureDetector>

                    {/* Close Button UI */}
                    <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                        <MaterialCommunityIcons name="close" size={28} color="white" />
                    </TouchableOpacity>

                </View>
            </GestureHandlerRootView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageWrapper: {
        width: width,
        height: height,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: width,
        height: height * 0.8,
    },
    closeBtn: {
        position: 'absolute',
        top: 40,
        right: 20,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 25,
        zIndex: 999,
    }
});