import React, { useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Pressable,
  Platform,
  BackHandler,
  Easing,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import Svg, { Path, Circle } from "react-native-svg";
import {
  PanGestureHandler,
  State,
  PanGestureHandlerStateChangeEvent,
} from "react-native-gesture-handler";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface SecurityScreenProps {
  isActive?: boolean;
  isShifted?: boolean;
  onBackPress?: () => void;
  onChangePasswordPress?: () => void;
  onChangePinPress?: () => void;
}

const IconLock = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2 16C2 13.1716 2 11.7574 2.87868 10.8787C3.75736 10 5.17157 10 8 10H16C18.8284 10 20.2426 10 21.1213 10.8787C22 11.7574 22 13.1716 22 16C22 18.8284 22 20.2426 21.1213 21.1213C20.2426 22 18.8284 22 16 22H8C5.17157 22 3.75736 22 2.87868 21.1213C2 20.2426 2 18.8284 2 16Z"
      stroke="#0C0C0C"
      strokeWidth={1.5}
    />
    <Path
      d="M6 10V8C6 4.68629 8.68629 2 12 2C14.7958 2 17.1449 3.91216 17.811 6.5"
      stroke="#0C0C0C"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Path
      d="M8 16H8.009M11.991 16H12M15.991 16H16"
      stroke="#0C0C0C"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

function IconPin ({ size = 24, color = "#0C0C0C" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Path d="M25.6667 14C25.6667 9.60018 25.6667 7.4003 24.2999 6.03346C22.9331 4.66663 20.7332 4.66663 16.3334 4.66663H11.6667C7.26697 4.66663 5.06709 4.66663 3.70025 6.03346C2.33342 7.4003 2.33342 9.60018 2.33342 14C2.33342 18.3997 2.33342 20.5996 3.70025 21.9665C5.06709 23.3333 7.26697 23.3333 11.6667 23.3333H16.3334C20.7332 23.3333 22.9331 23.3333 24.2999 21.9665C25.6667 20.5996 25.6667 18.3997 25.6667 14Z" stroke={color} strokeWidth="1.75"/>
      <Path d="M14.0001 11.6666V16.3333M16.0212 12.8333L11.9798 15.1666M11.98 12.8333L16.0215 15.1666" stroke={color} strokeWidth="1.75" strokeLinecap="round"/>
      <Path d="M20.1456 11.6666V16.3333M22.1667 12.8333L18.1253 15.1666M18.1255 12.8333L22.167 15.1666" stroke={color} strokeWidth="1.75" strokeLinecap="round"/>
      <Path d="M7.85384 11.6666V16.3333M9.875 12.8333L5.83355 15.1666M5.83382 12.8333L9.87528 15.1666" stroke={color} strokeWidth="1.75" strokeLinecap="round"/>
    </Svg>
  );
}

const IconArrowRight = () => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Path
      d="M3.3335 10H16.6668M11.6668 15L16.6668 10L11.6668 5"
      stroke="rgba(0,0,0,0.91)" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round"
    />
  </Svg>
);

export const SecurityScreen = React.memo(
  function SecurityScreen({
    isActive,
    isShifted,
    onBackPress,
    onChangePasswordPress,
    onChangePinPress,
  }: SecurityScreenProps) {
    const insets = useSafeAreaInsets();
    const screenX = useRef(new Animated.Value(SCREEN_WIDTH)).current;
    const NAV_BAR_HEIGHT = insets.top + 56;

    useEffect(() => {
      if (isActive) {
        screenX.stopAnimation();
        const targetValue = isShifted ? -SCREEN_WIDTH * 0.25 : 0;
        Animated.timing(screenX, {
          toValue: targetValue,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      } else {
        screenX.stopAnimation();
        Animated.timing(screenX, {
          toValue: SCREEN_WIDTH,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
      }
    }, [isActive, isShifted]);

  const handleBack = useCallback(() => {
    onBackPress?.();
  }, [onBackPress]);

  useEffect(() => {
    if (!isActive) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      handleBack();
      return true;
    });
    return () => sub.remove();
  }, [isActive, handleBack]);

  const onSwipeStateChange = useCallback(
    (e: PanGestureHandlerStateChangeEvent) => {
      const { state, translationX, velocityX } = e.nativeEvent;
      if (state === State.END && (translationX > 28 || velocityX > 480)) handleBack();
    },
    [handleBack]
  );

  const items = [
    { icon: <IconLock />, label: "Change Password", onPress: onChangePasswordPress },
    { icon: <IconPin />, label: "Change Pin", onPress: onChangePinPress },
  ];

  /* ── Elastic drag for Android bounce feel ──────────────────── */
  const dragY = useRef(new Animated.Value(0)).current;

  // Rubber-band resistance: the further you drag, the less it moves
  const rubberBand = (value: number, constant = 0.55) => {
    const sign = value < 0 ? -1 : 1;
    return sign * (1 - 1 / (Math.abs(value) / 200 + 1)) * 200 * constant;
  };

  const onDragGestureEvent = useCallback((event: any) => {
    const { translationY } = event.nativeEvent;
    dragY.setValue(rubberBand(translationY));
  }, []);

  const onDragStateChange = useCallback((event: any) => {
    const { state } = event.nativeEvent;
    if (state === State.END || state === State.CANCELLED || state === State.FAILED) {
      Animated.spring(dragY, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }).start();
    }
  }, []);

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { transform: [{ translateX: screenX }], backgroundColor: "#FFFFFF", zIndex: 130 },
      ]}
    >
      <PanGestureHandler
        onGestureEvent={onDragGestureEvent}
        onHandlerStateChange={onDragStateChange}
        activeOffsetY={[-10, 10]}
        failOffsetX={[-12, 12]}
      >
        <Animated.View
          style={{
            flex: 1,
            transform: [{ translateY: dragY }],
            paddingTop: NAV_BAR_HEIGHT + 24,
            paddingHorizontal: 20,
            paddingBottom: 40,
          }}
        >
          <View style={sc.list}>
            {items.map((item, i) => (
              <Pressable
                key={i}
                onPress={item.onPress}
                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
              >
                <View style={sc.item}>
                  <View style={sc.left}>
                    <View style={sc.iconWrap}>{item.icon}</View>
                    <Text style={sc.label}>{item.label}</Text>
                  </View>
                  <IconArrowRight />
                </View>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </PanGestureHandler>

      {/* Nav */}
      <PanGestureHandler
        onHandlerStateChange={onSwipeStateChange}
        activeOffsetX={[-1000, 15]}
        failOffsetY={[-12, 12]}
      >
        <View style={[sc.navBar, { height: NAV_BAR_HEIGHT }]}>
          <BlurView
            intensity={Platform.OS === "ios" ? 80 : 30}
            tint="light"
            experimentalBlurMethod="dimezisBlurView"
            style={StyleSheet.absoluteFill}
          />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(255,255,255,0.3)" }]} />
          <View style={[sc.navContent, { marginTop: insets.top }]}>
            <Pressable onPress={handleBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Svg width={14} height={11} viewBox="0 0 14 11" fill="none">
                <Path
                  d="M12.5625 5.0625H0.5625M5.0625 9.5625L0.5625 5.0625L5.0625 0.5625"
                  stroke="#262525"
                  strokeWidth={1.25}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </Pressable>
            <Text style={sc.navTitle}>Security</Text>
          </View>
        </View>
      </PanGestureHandler>
    </Animated.View>
  );
}, (prev, next) => prev.isActive === next.isActive && prev.isShifted === next.isShifted);

const sc = StyleSheet.create({
  navBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  navContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 16,
  },
  navTitle: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 16,
    color: "#262525",
    letterSpacing: -0.3,
  },
  list: {
    gap: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F5F5F8",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 18,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconWrap: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 15,
    color: "rgba(0,0,0,0.91)",
    letterSpacing: -0.2,
  },
});
