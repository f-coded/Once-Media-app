import React from "react";
import { StyleSheet, Image, View } from "react-native";

// Memoized: BalanceCard re-renders per frame during the balance count-up;
// this static pattern has no props and never needs to re-render with it.
export const CardDecorativeLines = React.memo(function CardDecorativeLines() {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Image
        source={require("../../../../assets/wallet_pattern.png")}
        style={styles.pattern}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  pattern: {
    ...StyleSheet.absoluteFillObject, 
    width: "auto",
    height: "auto",
    resizeMode: "cover", 
  },
});
