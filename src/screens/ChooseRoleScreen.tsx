import { Pressable, Text, View } from "react-native";

import {
  AuthLayout,
  PrimaryButton,
  ScreenHeader,
  StepDots,
} from "../components/AuthUI";
import { colors } from "../theme/colors";

type ChooseRoleScreenProps = {
  selectedRole: string;
  onSelectRole: (value: string) => void;
  onBackPress: () => void;
  onContinuePress: () => void;
};

const roles = [
  {
    key: "House Hunter",
    icon: "HH",
    description: "People looking for their next home or a cool community.",
  },
  {
    key: "Property Owner",
    icon: "PO",
    description: "Individual landlords or homeowners.",
  },
  {
    key: "Professional",
    icon: "PR",
    description: "Agents, Realtors, and Property Managers.",
  },
  {
    key: "Content Creators",
    icon: "CC",
    description: "Share posts, grow your audience, and earn from your activity.",
  },
];

export function ChooseRoleScreen({
  selectedRole,
  onSelectRole,
  onBackPress,
  onContinuePress,
}: ChooseRoleScreenProps) {
  return (
    <AuthLayout>
      <ScreenHeader
        showBack
        title="Choose Who You Are"
        subtitle="Choose how you'd like to use the platform. You can always switch later."
        onBackPress={onBackPress}
        rightAction={<StepDots total={4} active={2} />}
      />

      <View className="mt-6 gap-3">
        {roles.map((role) => {
          const active = role.key === selectedRole;

          return (
            <Pressable
              key={role.key}
              className="rounded-[24px] border p-4"
              onPress={() => onSelectRole(role.key)}
              style={{
                backgroundColor: active ? "#EEF2FF" : colors.background,
                borderColor: active ? colors.primary : colors.line,
              }}
            >
              <View className="flex-row items-start">
                <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-input">
                  <Text className="text-[12px] font-semibold text-ink">{role.icon}</Text>
                </View>
                <View className="flex-1 pr-3">
                  <Text className="text-[16px] font-semibold text-ink">{role.key}</Text>
                  <Text
                    className="mt-1 text-[15px] leading-[22px]"
                    style={{ color: colors.muted }}
                  >
                    {role.description}
                  </Text>
                </View>
                <View
                  className="mt-1 h-5 w-5 rounded-full border"
                  style={{
                    backgroundColor: active ? colors.primary : colors.background,
                    borderColor: active ? colors.primary : colors.line,
                  }}
                />
              </View>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-auto pt-10">
        <PrimaryButton label="Continue" onPress={onContinuePress} />
      </View>
    </AuthLayout>
  );
}
