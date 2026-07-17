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
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 16.5V14.5M7 10V8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8V10M5 10H19C19.5523 10 20 10.4477 20 11V20C20 20.5523 19.5523 21 19 21H5C4.44772 21 4 20.5523 4 20V11C4 10.4477 4.44772 10 5 10Z"
      stroke="rgba(0,0,0,0.91)" strokeWidth={1.5} strokeLinecap="round"
    />
  </Svg>
);

const IconPin = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={9} stroke="rgba(0,0,0,0.91)" strokeWidth={1.5} />
    <Circle cx={8.5} cy={12} r={1} fill="rgba(0,0,0,0.91)" />
    <Circle cx={12} cy={12} r={1} fill="rgba(0,0,0,0.91)" />
    <Circle cx={15.5} cy={12} r={1} fill="rgba(0,0,0,0.91)" />
  </Svg>
);

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
    fontSize: 18,
    color: "#262525",
    letterSpacing: -0.3,
  },
  list: {
    gap: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F5F5F8",
    borderRadius: 16,
    paddingHorizontal: 20,
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
