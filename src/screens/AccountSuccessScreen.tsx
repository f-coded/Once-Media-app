import { Text, View } from "react-native";

import { AuthLayout, PrimaryButton } from "../components/AuthUI";
import { colors } from "../theme/colors";

type AccountSuccessScreenProps = {
  onDashboardPress: () => void;
};

export function AccountSuccessScreen({
  onDashboardPress,
}: AccountSuccessScreenProps) {
  return (
    <AuthLayout>
      <View className="flex-1 items-center justify-center pb-16">
        <View className="h-28 w-28 items-center justify-center rounded-full bg-[#EEF2FF]">
          <View
            className="h-14 w-14 rounded-full"
            style={{ backgroundColor: colors.primary }}
          />
        </View>

        <Text className="mt-8 text-center text-[24px] font-semibold text-ink">
          Account created successfully
        </Text>
        <Text
          className="mt-3 text-center text-[16px] leading-[24px]"
          style={{ color: colors.muted }}
        >
          Your account has been created successfully.
        </Text>

        <View className="w-full pt-8">
          <PrimaryButton label="Go to dashboard" onPress={onDashboardPress} />
        </View>
      </View>
    </AuthLayout>
  );
}
