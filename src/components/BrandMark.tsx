import { Text, View } from "react-native";

import { colors } from "../theme/colors";

export function BrandMark() {
  return (
    <View className="flex-row items-center gap-3">
      <View
        className="h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: colors.primary }}
      >
        <View className="h-5 w-5 items-center justify-center rounded-full border border-white">
          <View className="h-2 w-2 rounded-full bg-white" />
        </View>
      </View>
      <Text
        className="text-[20px] font-medium"
        style={{ color: colors.primary }}
      >
        Once Media
      </Text>
    </View>
  );
}
