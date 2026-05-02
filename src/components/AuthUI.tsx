import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { colors } from "../theme/colors";

/* ─── Shared typography style helper ─── */
const font = (
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

/* ─── Layout ─── */

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
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
        >
          <View style={{ flex: 1, paddingHorizontal: 18, paddingBottom: 10, paddingTop: 16 }}>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ─── Screen Header ─── */

type ScreenHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: ReactNode;
};

export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  showBack,
  onBackPress,
  rightAction,
}: ScreenHeaderProps) {
  return (
    <View style={{ marginTop: showBack ? 4 : 20 }}>
      {showBack ? (
        <View style={{ marginBottom: 24, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Pressable
            style={{ height: 40, width: 40, alignItems: "flex-start", justifyContent: "center" }}
            onPress={onBackPress}
          >
            <Text style={font("Ubuntu_400Regular", 24, "#0C0C0C")}>{`<`}</Text>
          </Pressable>
          {rightAction ?? <View style={{ width: 40 }} />}
        </View>
      ) : null}

      {eyebrow ? (
        <Text style={font("Ubuntu_400Regular", 13, "#838383")}>{eyebrow}</Text>
      ) : null}
      <Text style={{ ...font("Ubuntu_500Medium", 20, "#0C0C0C"), marginTop: 5 }}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={{ ...font("Ubuntu_400Regular", 15, "#838383"), marginTop: 5 }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

/* ─── Input Field ─── */

type InputFieldProps = {
  label: string;
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  marginTop?: number;
};

export function InputField({
  label,
  placeholder,
  secureTextEntry,
  value,
  onChangeText,
  multiline,
  marginTop = 12,
}: InputFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isSecure = secureTextEntry && !isPasswordVisible;

  return (
    <View style={{ marginTop }}>
      <Text style={{ ...font("Ubuntu_400Regular", 16, "#0C0C0C", 14.4), marginBottom: 8 }}>
        {label}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: multiline ? "flex-start" : "center",
          justifyContent: secureTextEntry ? "space-between" : "flex-start",
          backgroundColor: "#F2F2F2",
          borderRadius: 30,
          paddingHorizontal: 14,
          paddingVertical: 10,
          height: multiline ? undefined : 45,
          minHeight: multiline ? 100 : 45,
          ...(multiline ? { borderRadius: 24 } : {}),
        }}
      >
        <TextInput
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
        />
        {secureTextEntry ? (
          <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            {isPasswordVisible ? <EyeOpenIcon /> : <EyeClosedIcon />}
          </Pressable>
        ) : null}
      </View>
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
};

export function PrimaryButton({ label, onPress }: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1B17B3",
        borderRadius: 30,
        paddingVertical: 9,
      }}
    >
      <Text style={font("Ubuntu_400Regular", 16, "#FFFFFF", 18)}>{label}</Text>
    </Pressable>
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
  return (
    <Pressable
      style={{
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
      }}
    >
      {badge === "google" ? <GoogleIcon /> : badge === "apple" ? <AppleIcon /> : (
        <View style={{ width: 24, height: 24, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#F2F2F2" }}>
          <Text style={font("Ubuntu_700Bold", 14, "#0C0C0C")}>{badge}</Text>
        </View>
      )}
      <Text style={font("Ubuntu_400Regular", 16, "#262525")}>{label}</Text>
    </Pressable>
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
      <Pressable onPress={onPress}>
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
    <View style={{ flexDirection: "row", gap: 8 }}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={{
            height: 6,
            width: 32,
            borderRadius: 3,
            backgroundColor: index < active ? "#1B17B3" : "#E7E7E7",
          }}
        />
      ))}
    </View>
  );
}
