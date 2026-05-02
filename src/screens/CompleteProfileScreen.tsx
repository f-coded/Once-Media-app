import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  AuthLayout,
  InputField,
  PrimaryButton,
  ScreenHeader,
} from "../components/AuthUI";
import { colors } from "../theme/colors";

type CompleteProfileScreenProps = {
  onBackPress: () => void;
  onSkipPress: () => void;
  onFinishPress: () => void;
};

export function CompleteProfileScreen({
  onBackPress,
  onSkipPress,
  onFinishPress,
}: CompleteProfileScreenProps) {
  const [name, setName] = useState("Kelechi Obi");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [bio, setBio] = useState("");

  return (
    <AuthLayout>
      <ScreenHeader
        showBack
        title="Complete your profile"
        subtitle="Your account has been created successfully. Set up your profile to standout."
        onBackPress={onBackPress}
        rightAction={
          <View className="items-end gap-3">
            <Pressable onPress={onSkipPress}>
              <Text className="text-[16px] font-medium" style={{ color: colors.primary }}>
                Skip
              </Text>
            </Pressable>
            <View className="flex-row gap-2">
              <View className="h-1.5 w-8 rounded-full bg-primary" />
              <View className="h-1.5 w-8 rounded-full bg-primary" />
              <View className="h-1.5 w-8 rounded-full bg-primary" />
              <View className="h-1.5 w-8 rounded-full bg-line" />
            </View>
          </View>
        }
      />

      <View className="mt-8 flex-row items-end">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-input">
          <Text className="text-[28px] font-semibold text-ink">KO</Text>
        </View>
        <Pressable
          className="-ml-4 h-10 w-10 items-center justify-center rounded-full border-2 border-white"
          style={{ backgroundColor: "#111111" }}
        >
          <Text className="text-[24px] text-white">+</Text>
        </Pressable>
      </View>

      <InputField
        label="Name"
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />
      <InputField
        label="Date of birth"
        placeholder="Select date of birth"
        value={dateOfBirth}
        onChangeText={setDateOfBirth}
      />

      <Text className="mt-2 text-[13px]" style={{ color: colors.muted }}>
        You'd be the only one to see this
      </Text>

      <InputField
        label="Bio"
        placeholder="Enter a description about self"
        value={bio}
        onChangeText={setBio}
        multiline
      />

      <View className="mt-auto pt-10">
        <PrimaryButton label="Finish" onPress={onFinishPress} />
      </View>
    </AuthLayout>
  );
}
