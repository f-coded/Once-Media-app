import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { CardDecorativeLines } from "./CardDecorativeLines";

interface BalanceCardProps {
  balance: string;
  onWithdrawPress: () => void;
}

export function BalanceCard({ balance, onWithdrawPress }: BalanceCardProps) {
  return (
    <View style={styles.balanceCard}>
      {/* Wave Decorative Pattern overlay */}
      <CardDecorativeLines />
      
      {/* Content wrapper */}
      <View style={styles.balanceInfo}>
        <Text style={styles.balanceLabel}>Balance</Text>
        {/* Render Naira symbol exactly matching the mockup design */}
        <Text style={styles.balanceValue}>₦{balance}</Text>
      </View>
      
      <Pressable
        style={({ pressed }) => [
          styles.withdrawBtn,
          pressed && styles.btnPressed,
        ]}
        onPress={onWithdrawPress}
      >
        <Text style={styles.withdrawBtnText}>Withdraw</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    width: "100%",
    height: 146,
    borderRadius: 24,
    backgroundColor: "#1B17B3",
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    shadowColor: "#1B17B3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  balanceInfo: {
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
    zIndex: 2,
  },
  balanceLabel: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    letterSpacing: -0.28,
    color: "#BEBEBE",
  },
  balanceValue: {
    fontFamily: "Ubuntu_700Bold",
    fontSize: 32,
    letterSpacing: -0.64,
    color: "#FFFFFF",
    lineHeight: 36,
  },
  withdrawBtn: {
    width: "100%",
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
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
