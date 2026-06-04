import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";

export function EmptyStateIllustration() {
  return (
    <View style={styles.container}>
      <Svg width="19" height="19" viewBox="0 0 18 18" fill="none">
        <Path
          d="M16.5 7.875V9C16.5 12.5355 16.5 14.3033 15.4017 15.4017C14.3033 16.5 12.5355 16.5 9 16.5C5.46447 16.5 3.6967 16.5 2.59835 15.4017C1.5 14.3033 1.5 12.5355 1.5 9C1.5 5.46447 1.5 3.6967 2.59835 2.59835C3.6967 1.5 5.46447 1.5 9 1.5H10.125"
          stroke="#0C0C0C"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <Path
          d="M5.25 10.5H12"
          stroke="#0C0C0C"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <Path
          d="M5.25 13.125H9.75"
          stroke="#0C0C0C"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <Path
          d="M16.5 1.5L12.75 5.24998M12.75 1.49998L16.5 5.24997"
          stroke="#0C0C0C"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
});
