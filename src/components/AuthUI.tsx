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

import { colors } from "../theme/colors";

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pb-10 pt-4">{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
    <View className={showBack ? "mt-1" : "mt-8"}>
      {showBack ? (
        <View className="mb-8 flex-row items-center justify-between">
          <Pressable
            className="h-10 w-10 items-start justify-center"
            onPress={onBackPress}
          >
            <Text className="text-[24px] text-ink">{`<`}</Text>
          </Pressable>
          {rightAction ?? <View className="w-10" />}
        </View>
      ) : null}

      {eyebrow ? (
        <Text className="text-[15px]" style={{ color: colors.muted }}>
          {eyebrow}
        </Text>
      ) : null}
      <Text className="mt-2 text-[36px] font-semibold leading-[42px] text-ink">
        {title}
      </Text>
      {subtitle ? (
        <Text
          className="mt-2 text-[16px] leading-[24px]"
          style={{ color: colors.muted }}
        >
          {subtitle}
        </Text>
      ) : null}
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
};

export function InputField({
  label,
  placeholder,
  secureTextEntry,
  value,
  onChangeText,
  multiline,
}: InputFieldProps) {
  return (
    <View className="mt-5">
      <Text className="mb-3 text-[16px] font-medium text-ink">{label}</Text>
      <View
        className={`flex-row rounded-pill bg-input px-5 ${multiline ? "min-h-[100px] rounded-[24px] py-4" : "min-h-[56px] items-center"}`}
      >
        <TextInput
          className="flex-1 text-[16px] text-ink"
          multiline={multiline}
          placeholder={placeholder}
          placeholderTextColor={colors.subtle}
          secureTextEntry={secureTextEntry}
          textAlignVertical={multiline ? "top" : "center"}
          value={value}
          onChangeText={onChangeText}
        />
        {secureTextEntry ? (
          <Text className="ml-3 text-[16px]" style={{ color: colors.muted }}>
            oo
          </Text>
        ) : null}
      </View>
    </View>
  );
}

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
};

export function PrimaryButton({ label, onPress }: PrimaryButtonProps) {
  return (
    <Pressable
      className="mt-6 min-h-[56px] items-center justify-center rounded-pill"
      onPress={onPress}
      style={{ backgroundColor: colors.primary }}
    >
      <Text className="text-[20px] font-medium text-white">{label}</Text>
    </Pressable>
  );
}

type LinkTextProps = {
  label: string;
  onPress?: () => void;
  center?: boolean;
};

export function LinkText({ label, onPress, center }: LinkTextProps) {
  return (
    <Pressable className={center ? "mt-5 self-center" : undefined} onPress={onPress}>
      <Text className="text-[16px] font-medium" style={{ color: colors.primary }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Divider() {
  return (
    <View className="mt-8 flex-row items-center">
      <View className="h-px flex-1 bg-line" />
      <Text className="mx-4 text-[16px]" style={{ color: colors.muted }}>
        or
      </Text>
      <View className="h-px flex-1 bg-line" />
    </View>
  );
}

type SocialButtonProps = {
  label: string;
  badge: string;
};

export function SocialButton({ label, badge }: SocialButtonProps) {
  return (
    <Pressable className="mt-4 min-h-[54px] flex-row items-center justify-center rounded-pill border border-line bg-white px-5">
      <View className="mr-3 h-7 w-7 items-center justify-center rounded-full bg-input">
        <Text className="text-[14px] font-semibold text-ink">{badge}</Text>
      </View>
      <Text className="text-[18px] font-medium text-ink">{label}</Text>
    </Pressable>
  );
}

type FooterPromptProps = {
  prompt: string;
  action: string;
  onPress?: () => void;
};

export function FooterPrompt({ prompt, action, onPress }: FooterPromptProps) {
  return (
    <View className="mt-auto flex-row items-center justify-center pb-2 pt-16">
      <Text className="text-[16px] text-ink">{prompt} </Text>
      <LinkText label={action} onPress={onPress} />
    </View>
  );
}

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
    <View className="mt-8 flex-row rounded-pill bg-input p-1">
      {options.map((option) => {
        const active = option === selected;

        return (
          <Pressable
            key={option}
            className="flex-1 rounded-pill py-3"
            onPress={() => onSelect(option)}
            style={{ backgroundColor: active ? colors.background : "transparent" }}
          >
            <Text
              className="text-center text-[15px] font-medium"
              style={{ color: active ? colors.primary : colors.muted }}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type StepDotsProps = {
  total: number;
  active: number;
};

export function StepDots({ total, active }: StepDotsProps) {
  return (
    <View className="flex-row gap-2">
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          className="h-1.5 w-8 rounded-full"
          style={{
            backgroundColor: index < active ? colors.primary : colors.line,
          }}
        />
      ))}
    </View>
  );
}
