import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";

const AVATAR_SAMANTHA = require("../../../assets/avatar-samantha.png");

export function WalletHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.profileWrapper}>
        {/* Row for avatar and title */}
        <View style={styles.avatarRow}>
          <Image
            source={AVATAR_SAMANTHA}
            style={styles.avatar}
            contentFit="cover"
            transition={200}
          />
          <Text style={styles.headerTitle}>Wallet</Text>
        </View>
        {/* Subtitle aligns at the left directly under the avatar */}
        <Text style={styles.headerSubtitle}>Reward account activity</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 10,
    marginBottom: 14,
  },
  profileWrapper: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 2,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F2F2F2",
  },
  headerTitle: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 24,
    letterSpacing: 22 * -0.02,  // Figma: -2%  → fontSize × -0.02 = -0.44
    color: "#0C0C0C",
    lineHeight: 22 * 1.0,       // Figma: 100% → fontSize × 1.0  = 22
  },
  headerSubtitle: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    letterSpacing: -0.28,
    color: "#838383",
    lineHeight: 16,
    marginTop: 2,
  },
});
