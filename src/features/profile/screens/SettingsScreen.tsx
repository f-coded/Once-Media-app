import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Pressable,
  ScrollView,
  Platform,
  BackHandler,
  Easing,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import {
  PanGestureHandler,
  State,
  PanGestureHandlerStateChangeEvent,
} from "react-native-gesture-handler";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface SettingsScreenProps {
  onBackPress?: () => void;
  isActive?: boolean;
  isShifted?: boolean;
  onPersonalInfoPress?: () => void;
  onSecurityPress?: () => void;
}

// ── Inline SVG icons ──────────────────────────────────────────────────────────

const IconUser = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={6} r={4} stroke="rgba(0,0,0,0.91)" strokeWidth={1.5} />
    <Path
      d="M20 17.5C20 19.9853 20 22 12 22C4 22 4 19.9853 4 17.5C4 15.0147 7.58172 13 12 13C16.4183 13 20 15.0147 20 17.5Z"
      stroke="rgba(0,0,0,0.91)" strokeWidth={1.5}
    />
  </Svg>
);

const IconPaymentBank = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M9 19C6.19108 19 4.78661 19 3.77772 18.3259C3.34096 18.034 2.96596 17.659 2.67412 17.2223C2 16.2134 2 14.8089 2 12C2 9.19108 2 7.78661 2.67412 6.77772C2.96596 6.34096 3.34096 5.96596 3.77772 5.67412C4.78661 5 6.19108 5 9 5L15 5C17.8089 5 19.2134 5 20.2223 5.67412C20.659 5.96596 21.034 6.34096 21.3259 6.77772C22 7.78661 22 9.19108 22 12C22 14.8089 22 16.2134 21.3259 17.2223C21.034 17.659 20.659 18.034 20.2223 18.3259C19.2134 19 17.8089 19 15 19H9Z" stroke="#0C0C0C" strokeWidth={1.5} />
    <Path d="M12 9C13.6569 9 15 10.3431 15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9Z" stroke="#0C0C0C" strokeWidth={1.5} />
    <Path d="M5.5 15L5.5 9" stroke="#0C0C0C" strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M18.5 15L18.5 9" stroke="#0C0C0C" strokeWidth={1.5} strokeLinecap="round" />
  </Svg>
);

const IconSecurity = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 10.4167C3 7.21907 3 5.62028 3.37752 5.08241C3.75503 4.54454 5.25832 4.02996 8.26491 3.00079L8.83772 2.80472C10.405 2.26824 11.1886 2 12 2C12.8114 2 13.595 2.26824 15.1623 2.80472L15.7351 3.00079C18.7417 4.02996 20.245 4.54454 20.6225 5.08241C21 5.62028 21 7.21907 21 10.4167C21 10.8996 21 11.4234 21 11.9914C21 17.6294 16.761 20.3655 14.1014 21.5273C13.38 21.8424 13.0193 22 12 22C10.9807 22 10.62 21.8424 9.89856 21.5273C7.23896 20.3655 3 17.6294 3 11.9914C3 11.4234 3 10.8996 3 10.4167Z"
      stroke="rgba(0,0,0,0.91)" strokeWidth={1.5}
    />
    <Path
      d="M11.5 16H12.5C13.0523 16 13.5 15.5523 13.5 15V13.5987C14.3967 13.0799 15 12.1104 15 11C15 9.34315 13.6569 8 12 8C10.3431 8 9 9.34315 9 11C9 12.1104 9.6033 13.0799 10.5 13.5987V15C10.5 15.5523 10.9477 16 11.5 16Z"
      stroke="rgba(0,0,0,0.91)" strokeWidth={1.5} strokeLinejoin="round"
    />
  </Svg>
);

const IconMoon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21.0672 11.8568L20.4253 11.469V11.469L21.0672 11.8568ZM12.1432 2.93276L11.7553 2.29085V2.29085L12.1432 2.93276ZM22 12H21.25C21.25 17.1086 17.1086 21.25 12 21.25V22V22.75C17.9371 22.75 22.75 17.9371 22.75 12H22ZM12 22V21.25C6.89137 21.25 2.75 17.1086 2.75 12H2H1.25C1.25 17.9371 6.06294 22.75 12 22.75V22ZM2 12H2.75C2.75 6.89137 6.89137 2.75 12 2.75V2V1.25C6.06294 1.25 1.25 6.06294 1.25 12H2ZM15.5 15V14.25C12.3244 14.25 9.75 11.6756 9.75 8.5H9H8.25C8.25 12.5041 11.4959 15.75 15.5 15.75V15ZM21.0672 11.8568L20.4253 11.469C19.4172 13.1373 17.5882 14.25 15.5 14.25V15V15.75C18.1349 15.75 20.4407 14.3439 21.7092 12.2447L21.0672 11.8568ZM9 8.5H9.75C9.75 6.41182 10.8627 4.5828 12.531 3.57467L12.1432 2.93276L11.7553 2.29085C9.65609 3.5593 8.25 5.86509 8.25 8.5H9ZM12 2V2.75C11.9115 2.75 11.8077 2.71008 11.7324 2.63168C11.6686 2.56527 11.6538 2.50244 11.6503 2.47703C11.6461 2.44587 11.6482 2.35557 11.7553 2.29085L12.1432 2.93276L12.531 3.57467C13.0342 3.27065 13.196 2.71398 13.1368 2.27627C13.0754 1.82126 12.7166 1.25 12 1.25V2ZM21.0672 11.8568L21.7092 12.2447C21.6444 12.3518 21.5541 12.3539 21.523 12.3497C21.4976 12.3462 21.4347 12.3314 21.3683 12.2676C21.2899 12.1923 21.25 12.0885 21.25 12H22H22.75C22.75 11.2834 22.1787 10.9246 21.7237 10.8632C21.286 10.804 20.7293 10.9658 20.4253 11.469L21.0672 11.8568Z"
      fill="rgba(0,0,0,0.91)"
    />
  </Svg>
);

const IconRate = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M10.8613 3.36335C11.3679 2.45445 11.6213 2 12 2C12.3787 2 12.6321 2.45445 13.1387 3.36335L13.2698 3.59849C13.4138 3.85677 13.4858 3.98591 13.598 4.07112C13.7103 4.15633 13.8501 4.18796 14.1296 4.25122L14.3842 4.30881C15.3681 4.53142 15.86 4.64273 15.977 5.01909C16.0941 5.39546 15.7587 5.78763 15.088 6.57197L14.9144 6.77489C14.7238 6.99777 14.6285 7.10922 14.5857 7.24709C14.5428 7.38496 14.5572 7.53364 14.586 7.83102L14.6122 8.10176C14.7136 9.14824 14.7644 9.67148 14.4579 9.90409C14.1515 10.1367 13.6909 9.92462 12.7697 9.50047L12.5314 9.39073C12.2696 9.2702 12.1387 9.20994 12 9.20994C11.8613 9.20994 11.7304 9.2702 11.4686 9.39073L11.2303 9.50047C10.3091 9.92462 9.84847 10.1367 9.54206 9.90409C9.23565 9.67148 9.28635 9.14824 9.38776 8.10176L9.41399 7.83102C9.44281 7.53364 9.45722 7.38496 9.41435 7.24709C9.37147 7.10922 9.27617 6.99777 9.08557 6.77489L8.91204 6.57197C8.2413 5.78763 7.90593 5.39546 8.02297 5.01909C8.14001 4.64273 8.63194 4.53142 9.61581 4.30881L9.87035 4.25122C10.1499 4.18796 10.2897 4.15633 10.402 4.07112C10.5142 3.98591 10.5862 3.85677 10.7302 3.59849L10.8613 3.36335Z" stroke="rgba(0,0,0,0.91)" strokeWidth={1.5} />
    <Path d="M19.4306 7.68168C19.684 7.22723 19.8106 7 20 7C20.1894 7 20.316 7.22722 20.5694 7.68167L20.6349 7.79925C20.7069 7.92839 20.7429 7.99296 20.799 8.03556C20.8551 8.07817 20.925 8.09398 21.0648 8.12561L21.1921 8.15441C21.684 8.26571 21.93 8.32136 21.9885 8.50955C22.047 8.69773 21.8794 8.89381 21.544 9.28598L21.4572 9.38744C21.3619 9.49889 21.3143 9.55461 21.2928 9.62354C21.2714 9.69248 21.2786 9.76682 21.293 9.91551L21.3061 10.0509C21.3568 10.5741 21.3822 10.8357 21.229 10.952C21.0758 11.0683 20.8455 10.9623 20.3849 10.7502L20.2657 10.6954C20.1348 10.6351 20.0694 10.605 20 10.605C19.9306 10.605 19.8652 10.6351 19.7343 10.6954L19.6151 10.7502C19.1545 10.9623 18.9242 11.0683 18.771 10.952C18.6178 10.8357 18.6432 10.5741 18.6939 10.0509L18.707 9.91551C18.7214 9.76682 18.7286 9.69248 18.7072 9.62354C18.6857 9.55461 18.6381 9.49889 18.5428 9.38744L18.456 9.28599C18.1206 8.89381 17.953 8.69773 18.0115 8.50955C18.07 8.32136 18.316 8.26571 18.8079 8.15441L18.9352 8.12561C19.075 8.09398 19.1449 8.07817 19.201 8.03556C19.2571 7.99296 19.2931 7.92839 19.3651 7.79925L19.4306 7.68168Z" stroke="rgba(0,0,0,0.91)" strokeWidth={1.5} />
    <Path d="M3.43063 7.68168C3.68396 7.22723 3.81063 7 4 7C4.18937 7 4.31604 7.22722 4.56937 7.68167L4.63491 7.79925C4.7069 7.92839 4.74289 7.99296 4.79901 8.03556C4.85513 8.07817 4.92503 8.09398 5.06482 8.12561L5.19209 8.15441C5.68403 8.26571 5.93 8.32136 5.98852 8.50955C6.04703 8.69773 5.87935 8.89381 5.54398 9.28598L5.45722 9.38744C5.36191 9.49889 5.31426 9.55461 5.29283 9.62354C5.27139 9.69248 5.27859 9.76682 5.293 9.91551L5.30612 10.0509C5.35682 10.5741 5.38218 10.8357 5.22897 10.952C5.07576 11.0683 4.84546 10.9623 4.38487 10.7502L4.2657 10.6954C4.13481 10.6351 4.06937 10.605 4 10.605C3.93063 10.605 3.86519 10.6351 3.7343 10.6954L3.61513 10.7502C3.15453 10.9623 2.92424 11.0683 2.77103 10.952C2.61782 10.8357 2.64318 10.5741 2.69388 10.0509L2.707 9.91551C2.72141 9.76682 2.72861 9.69248 2.70717 9.62354C2.68574 9.55461 2.63809 9.49889 2.54278 9.38744L2.45602 9.28599C2.12065 8.89381 1.95296 8.69773 2.01148 8.50955C2.07 8.32136 2.31597 8.26571 2.80791 8.15441L2.93518 8.12561C3.07497 8.09398 3.14487 8.07817 3.20099 8.03556C3.25711 7.99296 3.2931 7.92839 3.36509 7.79925L3.43063 7.68168Z" stroke="rgba(0,0,0,0.91)" strokeWidth={1.5} />
    <Path d="M5 20.3884H7.25993C8.27079 20.3884 9.29253 20.4937 10.2763 20.6964C12.0166 21.0549 13.8488 21.0983 15.6069 20.8138C16.4738 20.6734 17.326 20.4589 18.0975 20.0865C18.7939 19.7504 19.6469 19.2766 20.2199 18.7459C20.7921 18.216 21.388 17.3487 21.8109 16.6707C22.1736 16.0894 21.9982 15.3762 21.4245 14.943C20.7873 14.4619 19.8417 14.462 19.2046 14.9433L17.3974 16.3084C16.697 16.8375 15.932 17.3245 15.0206 17.4699C14.911 17.4874 14.7962 17.5033 14.6764 17.5172M12.7518 17.5326C13.4312 17.5968 14.0434 17.5829 14.5668 17.5292C14.6038 17.5254 14.6403 17.5214 14.6764 17.5172M14.6764 17.5172C14.8222 17.486 14.9669 17.396 15.1028 17.2775C15.746 16.7161 15.7866 15.77 15.2285 15.1431C15.0991 14.9977 14.9475 14.8764 14.7791 14.7759C11.9817 13.1074 7.62942 14.3782 5 16.2429M14.6764 17.5172C14.6399 17.525 14.6033 17.5292 14.5668 17.5292" stroke="rgba(0,0,0,0.91)" strokeWidth={1.5} strokeLinecap="round" />
    <Rect x={2} y={14} width={3} height={8} rx={1.5} stroke="rgba(0,0,0,0.91)" strokeWidth={1.5} />
  </Svg>
);

const IconSupport = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M21 17V12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12V17" stroke="rgba(0,0,0,0.91)" strokeWidth={1.5} />
    <Path d="M22 15.5V17.5" stroke="rgba(0,0,0,0.91)" strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M2 15.5V17.5" stroke="rgba(0,0,0,0.91)" strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M8 13.8446C8 13.0802 8 12.698 7.82526 12.4323C7.73733 12.2985 7.62061 12.188 7.4844 12.1095C7.21371 11.9535 6.84812 11.9896 6.11694 12.0617C4.88487 12.1831 4.26884 12.2439 3.82737 12.5764C3.60394 12.7448 3.41638 12.9593 3.27646 13.2067C3 13.6955 3 14.3395 3 15.6276V17.1933C3 18.4685 3 19.1061 3.28198 19.5986C3.38752 19.7829 3.51981 19.9491 3.67416 20.0913C4.08652 20.4714 4.68844 20.5901 5.89227 20.8275C6.73944 20.9945 7.16302 21.078 7.47564 20.9021C7.591 20.8372 7.69296 20.7493 7.77572 20.6434C8 20.3565 8 19.9078 8 19.0104V13.8446Z" stroke="rgba(0,0,0,0.91)" strokeWidth={1.5} />
    <Path d="M16 13.8446C16 13.0802 16 12.698 16.1747 12.4323C16.2627 12.2985 16.3794 12.188 16.5156 12.1095C16.7863 11.9535 17.1519 11.9896 17.8831 12.0617C19.1151 12.1831 19.7312 12.2439 20.1726 12.5764C20.3961 12.7448 20.5836 12.9593 20.7235 13.2067C21 13.6955 21 14.3395 21 15.6276V17.1933C21 18.4685 21 19.1061 20.718 19.5986C20.6125 19.7829 20.4802 19.9491 20.3258 20.0913C19.9135 20.4714 19.3116 20.5901 18.1077 20.8275C17.2606 20.9945 16.837 21.078 16.5244 20.9021C16.409 20.8372 16.307 20.7493 16.2243 20.6434C16 20.3565 16 19.9078 16 19.0104V13.8446Z" stroke="rgba(0,0,0,0.91)" strokeWidth={1.5} />
  </Svg>
);

const IconLogout = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4"
      stroke="#E20010"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Path
      d="M20 12H10M13 15L10 12L13 9"
      stroke="#E20010"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const IconArrowRight = () => (
  <Svg width={16} height={16} viewBox="0 0 20 20" fill="none">
    <Path
      d="M3.3335 10H16.6668M11.6668 15L16.6668 10L11.6668 5"
      stroke="rgba(0,0,0,0.91)" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round"
    />
  </Svg>
);

// ── Toggle Switch ─────────────────────────────────────────────────────────────

const ToggleSwitch = ({ value, onToggle }: { value: boolean; onToggle: () => void }) => {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [2, 20] });
  const bgColor = anim.interpolate({ inputRange: [0, 1], outputRange: ["#E5E5EA", "#0F1EAB"] });
  const thumbColor = anim.interpolate({ inputRange: [0, 1], outputRange: ["rgba(131, 131, 131, 1)", "#FFFFFF"] });

  return (
    <Pressable onPress={onToggle} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
      <Animated.View style={[s.toggleTrack, { backgroundColor: bgColor }]}>
        <Animated.View style={[s.toggleThumb, { transform: [{ translateX }], backgroundColor: thumbColor }]} />
      </Animated.View>
    </Pressable>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────

export const SettingsScreen = React.memo(
  function SettingsScreen({
    onBackPress,
    isActive,
    isShifted,
    onPersonalInfoPress,
    onSecurityPress,
  }: SettingsScreenProps) {
    const insets = useSafeAreaInsets();
    const screenTranslateX = useRef(new Animated.Value(SCREEN_WIDTH)).current;
    const [darkMode, setDarkMode] = useState(false);

    const NAV_BAR_HEIGHT = insets.top + 56;

    // Slide in / out / shift
    useEffect(() => {
      if (isActive) {
        screenTranslateX.stopAnimation();
        const targetValue = isShifted ? -SCREEN_WIDTH * 0.25 : 0;
        Animated.timing(screenTranslateX, {
          toValue: targetValue,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      } else {
        screenTranslateX.stopAnimation();
        Animated.timing(screenTranslateX, {
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

  // Hardware back button
  useEffect(() => {
    if (!isActive) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      handleBack();
      return true;
    });
    return () => sub.remove();
  }, [isActive, handleBack]);

  // Swipe to close
  const onSwipeStateChange = useCallback(
    (event: PanGestureHandlerStateChangeEvent) => {
      const { state, translationX, velocityX } = event.nativeEvent;
      if (state === State.END && (translationX > 28 || velocityX > 480)) {
        handleBack();
      }
    },
    [handleBack]
  );

  const GLASS_BLUR = Platform.OS === "ios" ? 80 : 30;
  const GLASS_TINT = 0.3;

  const menuItems = [
    {
      icon: <IconUser />,
      label: "Personal information",
      trailing: <IconArrowRight />,
      onPress: onPersonalInfoPress,
    },
    {
      icon: <IconPaymentBank />,
      label: "Payment bank",
      trailing: <IconArrowRight />,
      onPress: () => {},
    },
    {
      icon: <IconSecurity />,
      label: "Security",
      trailing: <IconArrowRight />,
      onPress: onSecurityPress,
    },
    {
      icon: <IconMoon />,
      label: "Dark mode",
      trailing: (
        <ToggleSwitch value={darkMode} onToggle={() => setDarkMode((v) => !v)} />
      ),
      onPress: undefined,
    },
    {
      icon: <IconRate />,
      label: "Rate ONCE app",
      trailing: <IconArrowRight />,
      onPress: () => {},
    },
    {
      icon: <IconSupport />,
      label: "Contact support",
      trailing: <IconArrowRight />,
      onPress: () => {},
    },
  ];

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { transform: [{ translateX: screenTranslateX }], backgroundColor: "#FFFFFF", zIndex: 110 },
      ]}
    >
      {/* Scrollable content */}
      <ScrollView
        contentContainerStyle={{ paddingTop: NAV_BAR_HEIGHT + 16, paddingBottom: 40, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={true}
        overScrollMode="always"
      >
        <View style={s.list}>
          {menuItems.map((item, index) => (
            <Pressable
              key={index}
              onPress={item.onPress}
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
              <View style={s.menuItem}>
                <View style={s.menuLeft}>
                  <View style={s.iconWrap}>{item.icon}</View>
                  <Text style={s.menuLabel}>{item.label}</Text>
                </View>
                {item.trailing}
              </View>
            </Pressable>
          ))}
        </View>

        {/* Standalone Logout Row */}
        <Pressable
          onPress={() => {}}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <View style={s.logoutRow}>
            <View style={s.iconWrap}>
              <IconLogout />
            </View>
            <Text style={s.logoutLabel}>Log out</Text>
          </View>
        </Pressable>
      </ScrollView>

      {/* Nav Bar */}
      <PanGestureHandler
        onHandlerStateChange={onSwipeStateChange}
        activeOffsetX={[-1000, 15]}
        failOffsetY={[-12, 12]}
      >
        <View style={[s.navBar, { height: NAV_BAR_HEIGHT }]}>
          <BlurView
            intensity={GLASS_BLUR}
            tint="light"
            experimentalBlurMethod="dimezisBlurView"
            style={StyleSheet.absoluteFill}
          />
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: `rgba(255,255,255,${GLASS_TINT})` },
            ]}
          />
          <View style={[s.navContent, { marginTop: insets.top }]}>
            {/* Left Back Arrow and Title aligned together */}
            <Pressable
              onPress={handleBack}
              style={s.navLeftButton}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              {/* Vector.svg back arrow */}
              <Svg width={14} height={11} viewBox="0 0 14 11" fill="none">
                <Path
                  d="M12.5625 5.0625H0.5625M5.0625 9.5625L0.5625 5.0625L5.0625 0.5625"
                  stroke="#262525"
                  strokeWidth={1.125}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={s.navTitle}>Settings</Text>
            </Pressable>
          </View>
        </View>
      </PanGestureHandler>
    </Animated.View>
  );
}, (prev, next) => prev.isActive === next.isActive && prev.isShifted === next.isShifted);

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    height: 56,
    paddingHorizontal: 18,
    position: "relative",
  },
  navLeftButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    zIndex: 2,
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
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(242, 242, 242, 1)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 18,
  },
  menuLeft: {
    gap: 11,
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  }, 
  menuLabel: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 16,
    color: "rgba(0,0,0,0.91)",
    letterSpacing: -0.2,
  },
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 12,
  },
  logoutLabel: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 15,
    color: "#FF3B30",
    letterSpacing: -0.2,
  },
  toggleTrack: {
    width: 44,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(131, 131, 131, 1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
});
