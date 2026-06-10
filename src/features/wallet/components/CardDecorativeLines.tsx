import React from "react";
import { StyleSheet, Image, View } from "react-native";

export function CardDecorativeLines() {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Image
        source={require("../../../../assets/wallet_pattern.png")}
        style={styles.pattern}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pattern: {
    ...StyleSheet.absoluteFillObject, 
    width: "auto",
    height: "auto",
    resizeMode: "cover", 
  },
});
