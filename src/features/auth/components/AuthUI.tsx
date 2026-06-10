import { ReactNode, useState, useRef, useCallback } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  FadeInUp,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { colors } from "@/app/theme/colors";

/* ─── Shared typography style helper ─── */
export const font = (
  weight: "Ubuntu_400Regular" | "Ubuntu_500Medium" | "Ubuntu_700Bold" = "Ubuntu_400Regular",
  size: number = 16,
  color: string = "#0C0C0C",
  lineHeight?: number
) => ({
  fontFamily: weight,
  fontSize: size,
  lineHeight: lineHeight ?? Math.round(size * 1.125),
  letterSpacing: size * -0.02,
  color,
});

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/* ─── Animated Screen Wrapper ─── */

export function AnimatedScreenWrapper({ children }: { children: ReactNode }) {
  return (
    <Animated.View
      entering={FadeInUp.duration(350).damping(20).stiffness(90)}
      style={{ flex: 1 }}
    >
      {children}
    </Animated.View>
  );
}

/* ─── Layout ─── */

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={true}
          overScrollMode="always"
          alwaysBounceVertical={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#1B17B3"
              colors={["#1B17B3"]}
            />
          }
        >
          <AnimatedScreenWrapper>
            <View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 10, paddingTop: 16 }}>
              {children}
            </View>
          </AnimatedScreenWrapper>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ─── Screen Header ─── */

type ScreenHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: React.ReactNode;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: ReactNode;
  largeTitle?: boolean;
};

export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  showBack,
  onBackPress,
  totalSteps,
  activeStep,
  centered,
  largeTitle,
  rightAction,
}: ScreenHeaderProps & { totalSteps?: number; activeStep?: number; centered?: boolean }) {
  return (
    <View style={{ marginTop: showBack ? 12 : 22, width: "100%" }}>
      {showBack && (
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Pressable onPress={onBackPress} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={{ width: 24, height: 24, justifyContent: "center" }}>
            <BackArrowIcon />
          </Pressable>
          {totalSteps ? <StepDots total={totalSteps} active={activeStep || 0} /> : rightAction}
        </View>
      )}
      {eyebrow && (
        <Text style={{ ...font("Ubuntu_400Regular", 13, "#838383", 15), textAlign: centered ? "center" : "left" }}>{eyebrow}</Text>
      )}
      <Text 
        style={{ 
          ...font(largeTitle ? "Ubuntu_700Bold" : "Ubuntu_500Medium", largeTitle ? 22 : 20, "#0C0C0C"), 
          marginTop: eyebrow ? 5 : 0,
          letterSpacing: largeTitle ? -0.44 : -2,
          textAlign: centered ? "center" : "left"
        }}
      >
        {title}
      </Text>
      {subtitle && (
        typeof subtitle === "string" ? (
          <Text style={{ ...font("Ubuntu_400Regular", largeTitle ? 14 : 13, largeTitle ? "#4A4A4A" : "#838383", largeTitle ? 21 : 15.6), marginTop: largeTitle ? 4 : 8, letterSpacing: largeTitle ? -0.28 : -0.26, textAlign: centered ? "center" : "left" }}>
            {subtitle}
          </Text>
        ) : (
          <View style={{ marginTop: largeTitle ? 4 : 8 }}>
            {subtitle}
          </View>
        )
      )}
    </View>
  );
}

export function TabSelector({
  options,
  activeOption,
  onSelect,
  marginTop = 20,
}: {
  options: string[];
  activeOption: string;
  onSelect: (option: string) => void;
  marginTop?: number;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: "#F2F2F2",
        borderRadius: 20,
        paddingHorizontal: 6,
        paddingVertical: 4,
        marginTop,
        height: 48,
        width: "100%",
        gap: 8,
        alignItems: "center",
      }}
    >
      {options.map((option) => {
        const active = option === activeOption;
        return (
          <Pressable
            key={option}
            style={{
              flex: 1,
              height: 40,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: active ? "#FFFFFF" : "transparent",
            }}
            onPress={() => onSelect(option)}
          >
            <Text
              style={font("Ubuntu_400Regular", 14, active ? "#1B17B3" : "#4A4A4A", 18)}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function PhoneInputField({
  label,
  placeholder,
  value,
  onChangeText,
  marginTop = 12,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  marginTop?: number;
}) {
  return (
    <View style={{ marginTop, width: "100%" }}>
      <Text style={{ ...font("Ubuntu_500Medium", 14, "#0C0C0C", 21), marginBottom: 6, letterSpacing: -0.28 }}>
        {label}
      </Text>
      <View style={{ flexDirection: "row", gap: 6, width: "100%", height: 45 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#FFFFFF",
            borderWidth: 1,
            borderColor: "#E7E7E7",
            borderRadius: 30,
            paddingHorizontal: 12,
            paddingVertical: 7,
            width: 79,
            height: 45,
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 16 }}>🇳🇬</Text>
          <Text style={font("Ubuntu_400Regular", 14, "#4A4A4A", 19)}>+234</Text>
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F2F2F2",
            borderRadius: 30,
            paddingHorizontal: 12,
            paddingVertical: 7,
            height: 45,
            gap: 16,
          }}
        >
          <TextInput
            style={{ flex: 1, ...font("Ubuntu_400Regular", 13, "#4A4A4A", 19), padding: 0 }}
            placeholder={placeholder}
            placeholderTextColor="#838383"
            keyboardType="phone-pad"
            value={value}
            onChangeText={onChangeText}
          />
        </View>
      </View>
    </View>
  );
}

type InputFieldProps = {
  label: string;
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  marginTop?: number;
  rightIcon?: React.ReactNode;
  helperText?: string;
  error?: boolean;
};

export function InputField({
  label,
  placeholder,
  secureTextEntry,
  value,
  onChangeText,
  multiline,
  marginTop = 12,
  rightIcon,
  helperText,
  error,
}: InputFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isSecure = secureTextEntry && !isPasswordVisible;
  const inputRef = useRef<TextInput>(null);

  // Focus glow animation
  const borderProgress = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const eyeScale = useSharedValue(1);

  const containerStyle = useAnimatedStyle(() => ({
    borderWidth: borderProgress.value * 1.5,
    borderColor: error ? "#FF3B30" : `rgba(27, 23, 179, ${borderProgress.value})`,
    transform: [{ translateX: shakeX.value }],
  }));

  const handleFocus = useCallback(() => {
    borderProgress.value = withSpring(1, { damping: 15, stiffness: 150 });
  }, [borderProgress]);

  const handleBlur = useCallback(() => {
    borderProgress.value = withSpring(0, { damping: 15, stiffness: 150 });
  }, [borderProgress]);

  // Trigger shake when error changes to true
  const triggerShake = useCallback(() => {
    shakeX.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  }, [shakeX]);

  // Eye toggle animation
  const togglePasswordVisibility = useCallback(() => {
    eyeScale.value = withSequence(
      withSpring(0.7, { damping: 10, stiffness: 300 }),
      withSpring(1, { damping: 8, stiffness: 200 })
    );
    setIsPasswordVisible((prev) => !prev);
  }, [eyeScale]);

  const eyeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: eyeScale.value }],
  }));

  // Trigger shake on error
  if (error) {
    triggerShake();
  }

  return (
    <View style={{ marginTop }}>
      <Text style={{ ...font("Ubuntu_500Medium", 14, "#0C0C0C", 21), marginBottom: 6, letterSpacing: -0.28 }}>
        {label}
      </Text>
      <Pressable onPress={() => inputRef.current?.focus()}>
        <Animated.View
          style={[
            {
              flexDirection: "row",
              alignItems: multiline ? "flex-start" : "center",
              justifyContent: (secureTextEntry || rightIcon) ? "space-between" : "flex-start",
              backgroundColor: "#F2F2F2",
              borderRadius: multiline ? 24 : 30,
              paddingHorizontal: 14,
              paddingVertical: 10,
              height: multiline ? undefined : 45,
              minHeight: multiline ? 100 : 45,
            },
            containerStyle,
          ]}
        >
          <TextInput
            ref={inputRef}
            style={{
              flex: 1,
              ...font("Ubuntu_400Regular", 13, "#0C0C0C", 15),
              padding: 0,
            }}
            multiline={multiline}
            placeholder={placeholder}
            placeholderTextColor="#838383"
            secureTextEntry={isSecure}
            textAlignVertical={multiline ? "top" : "center"}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          {secureTextEntry ? (
            <Pressable onPress={togglePasswordVisibility} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Animated.View style={eyeAnimatedStyle}>
                {isPasswordVisible ? <EyeOpenIcon /> : <EyeClosedIcon />}
              </Animated.View>
            </Pressable>
          ) : rightIcon ? (
            rightIcon
          ) : null}
        </Animated.View>
      </Pressable>
      {helperText && (
        <Text style={{ ...font("Ubuntu_400Regular", 13, "#434343", 15), marginTop: 8, letterSpacing: -0.26 }}>
          {helperText}
        </Text>
      )}
    </View>
  );
}

export function OTPInput({
  label,
  code,
  onCodeChange,
  length = 4,
  error,
}: {
  label: string;
  code: string;
  onCodeChange: (code: string) => void;
  length?: number;
  error?: boolean;
}) {
  const inputRef = useRef<TextInput>(null);

  return (
    <View style={{ width: "100%" }}>
      <Text style={{ ...font("Ubuntu_500Medium", 14, "#0C0C0C", 21), marginBottom: 6, letterSpacing: -0.28 }}>
        {label}
      </Text>
      <Pressable onPress={() => inputRef.current?.focus()}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F2F2F2",
            borderRadius: 20,
            paddingHorizontal: 8,
            paddingVertical: 4.5,
            width: 184,
            height: 45,
            gap: 8,
          }}
        >
          {Array.from({ length }).map((_, index) => {
            const digit = code[index] || "";
            return (
              <View
                key={index}
                style={{
                  width: 36,
                  height: 36,
                  backgroundColor: "#FCFCFC",
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: error ? 1 : 0,
                  borderColor: "red",
                }}
              >
                <Text style={font("Ubuntu_400Regular", 18, "#4A4A4A")}>
                  {digit ? "*" : ""}
                </Text>
              </View>
            );
          })}
        </View>
        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={(text) => onCodeChange(text.slice(0, length))}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          maxLength={length}
          style={{
            position: "absolute",
            width: 184,
            height: 45,
            opacity: 0,
          }}
        />
      </Pressable>
      {error && (
        <Text style={{ ...font("Ubuntu_400Regular", 12, "red"), marginTop: 8 }}>
          Invalid code
        </Text>
      )}
    </View>
  );
}

/* ─── Eye Icons ─── */

function EyeOpenIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke="#262525"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 15a3 3 0 100-6 3 3 0 000 6z"
        stroke="#262525"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function EyeClosedIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17.5 11C17.5 11 16 15 12 15C8 15 6.5 11 6.5 11"
        stroke="#262525"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M12 15V17.5" stroke="#262525" strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M9 14.5L7.5 16.5" stroke="#262525" strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M15 14.5L16.5 16.5" stroke="#262525" strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

/* ─── Primary Button ─── */

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  loading?: boolean;
};

export function PrimaryButton({ label, onPress, loading }: PrimaryButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.97, { duration: 100 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: 150 });
  }, [scale]);

  const handlePress = useCallback(() => {
    if (loading) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  }, [loading, onPress]);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      disabled={loading}
      style={[
        {
          height: 50,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: loading ? "#3530C9" : "#1B17B3",
          borderRadius: 30,
          paddingVertical: 9,
        },
        animatedStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text style={font("Ubuntu_400Regular", 16, "#FFFFFF", 18)}>{label}</Text>
      )}
    </AnimatedPressable>
  );
}

/* ─── Link Text ─── */

type LinkTextProps = {
  label: string;
  onPress?: () => void;
  center?: boolean;
};

export function LinkText({ label, onPress, center }: LinkTextProps) {
  return (
    <Pressable
      style={center ? { height: 50, alignItems: "center", justifyContent: "center" } : undefined}
      onPress={onPress}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <Text style={font("Ubuntu_400Regular", 16, "#1B17B3", 18)}>{label}</Text>
    </Pressable>
  );
}

/* ─── Divider ─── */

export function Divider() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", height: 18, gap: 8, justifyContent: "center" }}>
      <View style={{ flex: 1, height: 1, backgroundColor: "#D2D2D2" }} />
      <Text style={font("Ubuntu_400Regular", 16, "#838383", 18)}>
        or
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: "#D2D2D2" }} />
    </View>
  );
}

/* ─── Social Button ─── */

type SocialButtonProps = {
  label: string;
  badge: "google" | "apple" | string;
};

export function SocialButton({ label, badge }: SocialButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => { scale.value = withTiming(0.97, { duration: 100 }); }}
      onPressOut={() => { scale.value = withTiming(1, { duration: 150 }); }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[
        {
          height: 50,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 30,
          borderWidth: 1,
          borderColor: "#D2D2D2",
          backgroundColor: "#FFFFFF",
          paddingVertical: 9,
          gap: 8,
        },
        animatedStyle,
      ]}
    >
      {badge === "google" ? <GoogleIcon /> : badge === "apple" ? <AppleIcon /> : (
        <View style={{ width: 24, height: 24, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#F2F2F2" }}>
          <Text style={font("Ubuntu_700Bold", 14, "#0C0C0C")}>{badge}</Text>
        </View>
      )}
      <Text style={font("Ubuntu_400Regular", 16, "#262525")}>{label}</Text>
    </AnimatedPressable>
  );
}

/* ─── Google Icon (24x24) ─── */

function GoogleIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#FFC107" />
      <Path d="M3.15283 7.3455L6.43833 9.755C7.32733 7.554 9.48033 6 12.0003 6C13.5298 6 14.9213 6.577 15.9808 7.5195L18.8093 4.691C17.0233 3.0265 14.6343 2 12.0003 2C8.15883 2 4.82783 4.1685 3.15283 7.3455Z" fill="#FF3D00" />
      <Path d="M12.0002 22C14.5832 22 16.9302 21.0115 18.7047 19.404L15.6097 16.785C14.5719 17.5742 13.3039 18.001 12.0002 18C9.39916 18 7.19066 16.3415 6.35866 14.027L3.09766 16.5395C4.75266 19.778 8.11366 22 12.0002 22Z" fill="#4CAF50" />
      <Path d="M21.8055 10.0415H21V10H12V14H17.6515C17.2571 15.1082 16.5467 16.0766 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#1976D2" />
    </Svg>
  );
}

/* ─── Apple Icon (24x24) ─── */

function AppleIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17.05 20.28C16.07 21.23 15 21.08 13.97 20.63C12.88 20.17 11.88 20.15 10.73 20.63C9.29 21.25 8.53 21.07 7.67 20.28C2.79 15.25 3.51 7.59 9.05 7.31C10.4 7.38 11.34 8.05 12.13 8.11C13.31 7.87 14.44 7.18 15.71 7.27C17.22 7.39 18.36 7.99 19.12 9.07C15.98 10.94 16.68 15.05 19.55 16.2C18.96 17.83 18.19 19.45 17.04 20.29L17.05 20.28ZM12.03 7.25C11.88 5.02 13.69 3.18 15.77 3C16.06 5.58 13.43 7.5 12.03 7.25Z"
        fill="#000000"
      />
    </Svg>
  );
}

/* ─── Footer Prompt ─── */

type FooterPromptProps = {
  prompt: string;
  action: string;
  onPress?: () => void;
};

export function FooterPrompt({ prompt, action, onPress }: FooterPromptProps) {
  return (
    <View
      style={{
        height: 50,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 30,
        paddingHorizontal: 9,
        paddingVertical: 9,
        gap: 8,
      }}
    >
      <Text
        style={{
          fontFamily: "Ubuntu_400Regular",
          fontSize: 16,
          lineHeight: 18,
          letterSpacing: -0.32,
          color: "#0C0C0C",
        }}
      >
        {prompt}
      </Text>
      <Pressable onPress={onPress} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
        <Text
          style={{
            fontFamily: "Ubuntu_400Regular",
            fontSize: 16,
            lineHeight: 18,
            letterSpacing: -0.32,
            color: "#1B17B3",
          }}
        >
          {action}
        </Text>
      </Pressable>
    </View>
  );
}

/* ─── Segment Control ─── */

type SegmentControlProps = {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
};

export function SegmentControl({
  options,
  selected,
  onSelect,
}: SegmentControlProps) {
  return (
    <View style={{ marginTop: 24, flexDirection: "row", borderRadius: 30, backgroundColor: "#F2F2F2", padding: 4 }}>
      {options.map((option) => {
        const active = option === selected;

        return (
          <Pressable
            key={option}
            style={{ flex: 1, borderRadius: 30, paddingVertical: 12, backgroundColor: active ? "#FFFFFF" : "transparent" }}
            onPress={() => onSelect(option)}
          >
            <Text
              style={{ ...font("Ubuntu_500Medium", 15, active ? "#1B17B3" : "#838383"), textAlign: "center" }}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ─── Step Dots ─── */

type StepDotsProps = {
  total: number;
  active: number;
};

export function StepDots({ total, active }: StepDotsProps) {
  return (
    <View style={{ flexDirection: "row", gap: 4, width: 84, alignItems: "center" }}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={{
            height: 6,
            width: 18,
            borderRadius: 40,
            backgroundColor: index < active ? "#1B17B3" : "#E7E7E7",
          }}
        />
      ))}
    </View>
  );
}

export function BackArrowIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.75 12H3.25M3.25 12L10 5.25M3.25 12L10 18.75"
        stroke="#363636"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
