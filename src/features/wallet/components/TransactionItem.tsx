import React from "react";
import { View, Text, StyleSheet } from "react-native";
import BuildingsSvg from "@assets/Buildings.svg";
import ArrowRightDownSvg from "@assets/Arrow Right Down.svg";

export interface Transaction {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  type: "credit" | "debit";
  date: string;
}

interface TransactionItemProps {
  item: Transaction;
}

export function TransactionItem({ item }: TransactionItemProps) {
  const isCredit = item.type === "credit";

  return (
    <View style={styles.row}>
      {/* Left: icon + text */}
      <View style={styles.leftSection}>
        {/* Frame 2147226133/134 — 36×36, #E7F1FF, borderRadius 12 */}
        <View style={styles.iconBox}>
          {isCredit ? (
            <ArrowRightDownSvg width={18} height={18} />
          ) : (
            <BuildingsSvg width={18} height={18} />
          )}
        </View>

        {/* Frame 864 — column, gap 4px */}
        <View style={styles.textCol}>
          {/* Ubuntu Regular 400, 16px/18px, #0C0C0C, letterSpacing -0.02em */}
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>

          {/* Frame 2147226134 — subtitle row: text • ellipse • text */}
          <View style={styles.subtitleRow}>
            <Text style={styles.subtitle} numberOfLines={1}>{item.subtitle}</Text>
            {/* Ellipse 592 — 3×3, #838383 */}
            <View style={styles.ellipse} />
            <Text style={styles.subtitle} numberOfLines={1}>{item.date}</Text>
          </View>
        </View>
      </View>

      {/* Ubuntu Medium 500, 18px/21px, #0C0C0C, letterSpacing -0.02em */}
      <Text style={styles.amount}>{item.amount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  /**
   * Frame 883/881/886…
   * padding: 15px 18px → paddingVertical 15 only (parent has paddingHorizontal 18)
   * border-bottom: 1px solid #E4E4E4
   * justify-content: space-between; align-items: center
   */
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E4E4",
  },

  /**
   * Frame 2147226165 — row, align-items center, gap 10px
   */
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },

  /**
   * Frame 2147226133/2147226134
   * width 36, height 36, background #E7F1FF, border-radius 12px
   */
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#E7F1FF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  /**
   * Frame 864 — column, justify-content center, gap 4px
   */
  textCol: {
    flexDirection: "column",
    justifyContent: "center",
    gap: 4,
    flex: 1,
    marginRight: 8,
  },

  /**
   * "Transfer to Ahmed Farid" / "Campaign deposit"
   * Ubuntu Regular 400, 16px, lineHeight 14px, letterSpacing -0.02em, #0C0C0C
   */
  title: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 16,
    lineHeight: 18,
    letterSpacing: -0.32,
    color: "#0C0C0C",
  },

  /**
   * Frame 2147226134 — subtitle row: row, align-items center, gap 4px
   */
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  /**
   * "First bank" / "12:35 PM, 3 july 2026"
   * Ubuntu Regular 400, 12px, lineHeight 14px, letterSpacing -0.02em, #838383
   */
  subtitle: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: -0.24,
    color: "#838383",
  },

  /**
   * Ellipse 592 — width 3, height 3, background #838383
   */
  ellipse: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#838383",
  },

  /**
   * "#43,000"
   * Ubuntu Medium 500, 18px, lineHeight 21px, letterSpacing -0.02em, #0C0C0C
   */
  amount: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 18,
    lineHeight: 21,
    letterSpacing: -0.36,
    color: "#0C0C0C",
  },
});
