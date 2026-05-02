import { Text, View } from "react-native";
import { OnceLogoIcon } from "./OnceLogoIcon";

export function BrandMark() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
      <OnceLogoIcon size={36} />
      <Text
        style={{
          fontFamily: "Ubuntu_400Regular",
          fontSize: 24,
          lineHeight: 28,
          letterSpacing: 24 * -0.02,
          color: "#1B17B3",
        }}
      >
        Once Media
      </Text>
    </View>
  );
}
