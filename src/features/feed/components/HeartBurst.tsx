import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import { HeartIcon } from "./FeedIcons";

type HeartBurstProps = {
  visible: boolean;
  onFinish: () => void;
};

export function HeartBurst({ visible, onFinish }: HeartBurstProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSequence(
        withTiming(1.3, { duration: 200 }),
        withTiming(1, { duration: 150 })
      );
      opacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withDelay(400, withTiming(0, { duration: 300 }))
      );

      const timeout = setTimeout(() => {
        onFinish();
      }, 800);

      return () => clearTimeout(timeout);
    } else {
      scale.value = 0;
      opacity.value = 0;
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none">
      <HeartIcon size={80} filled color="#FF3B30" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
});
