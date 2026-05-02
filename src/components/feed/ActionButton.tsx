import React, { useCallback } from "react";
import { Text, Pressable } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { font } from "../AuthUI";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ActionButtonProps = {
  icon: React.ReactNode;
  count?: number;
  label?: string;
  onPress?: () => void;
};

export function ActionButton({ icon, count, label, onPress }: ActionButtonProps) {
  const formatCount = (num?: number) => {
    if (num === undefined) return null;
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.85, { duration: 80 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: 120 });
  }, [scale]);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  }, [onPress]);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[
        { alignItems: "center", gap: 2 },
        animatedStyle,
      ]}
    >
      {icon}
      {count !== undefined && (
        <Text style={{ ...font("Ubuntu_400Regular", 16, "#FFFFFF"), textShadowColor: "rgba(0,0,0,1)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }}>
          {formatCount(count)}
        </Text>
      )}
      {label && (
        <Text style={{ ...font("Ubuntu_400Regular", 10, "#FFFFFF"), textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
          {label}
        </Text>
      )}
    </AnimatedPressable>
  );
}
