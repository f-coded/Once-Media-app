import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { CardDecorativeLines } from "./CardDecorativeLines";

interface BalanceCardProps {
  balance: string;
  onWithdrawPress: () => void;
}

export function BalanceCard({ balance, onWithdrawPress }: BalanceCardProps) {
  return (
    <View style={styles.balanceCard}>
      {/* Wave Decorative Pattern overlay */}
      <View style={styles.patternWrapper}>
        <CardDecorativeLines />
      </View>
      
      {/* Content wrapper */}
      <View style={styles.contentWrapper}>
        <View style={styles.balanceInfo}>
          <Text style={styles.balanceLabel}>Balance</Text>
          {/* Render Naira symbol exactly matching the mockup design */}
          <Text style={styles.balanceValue}>₦{balance}</Text>
        </View>
        <TouchableOpacity
          style={styles.withdrawBtn}
          onPress={onWithdrawPress}
          activeOpacity={0.85}
        >
          <Text style={styles.withdrawBtnText}>Withdraw</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    width: "auto",
    height: 140,
    borderRadius: 22,
    backgroundColor: "#1B17B3",
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",

  },
  patternWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    elevation: 0,
  },
  contentWrapper: {
    width: "100%",
    alignItems: "center",
    zIndex: 10,
    elevation: 10,
  },
  balanceInfo: {
    alignItems: "center",
    gap: 4,
    marginBottom: 20,
  },
  balanceLabel: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    letterSpacing: -0.28,
    color: "#f2f2f2",
  },
  balanceValue: {
    fontFamily: "Ubuntu_700Bold",
    fontSize: 32,
    letterSpacing: -0.64,
    color: "#FFFFFF",
    lineHeight: 36,
  },
  pressableWrapper: {
    width: "100%",
  },
  withdrawBtn: {
    width: "100%",
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  withdrawBtnText: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 15,
    letterSpacing: -0.3,
    color: "#1B17B3",
  },
  btnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});
