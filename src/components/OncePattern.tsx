import React from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import PatternSvg from "../../assets/Pattern.svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/**
 * Renders the actual Pattern.svg asset as a background watermark.
 */
export function OncePattern() {
  return (
    <View style={styles.container} pointerEvents="none">
      <PatternSvg
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT * 0.55}
        preserveAspectRatio="xMidYMid slice"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
});
