import React from "react";
import { View, Text, StyleSheet } from "react-native";

export interface Transaction {
  id: string;
  title: string;
  subtitle: string;
  amount: string; // e.g. "+₦150.00" or "-₦50.00"
  type: "credit" | "debit";
  date: string;
}

interface TransactionItemProps {
  item: Transaction;
}

export function TransactionItem({ item }: TransactionItemProps) {
  const isCredit = item.type === "credit";

  return (
    <View style={styles.txRow}>
      <View style={styles.txLeft}>
        {/* Dynamic circular indicator for credit (+ green) vs debit (- red) */}
        <View style={[styles.txIconBox, isCredit ? styles.creditIconBox : styles.debitIconBox]}>
          <Text style={styles.txIconSymbol}>{isCredit ? "+" : "-"}</Text>
        </View>
        <View style={styles.textWrapper}>
          <Text style={styles.txTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.txSubtitle} numberOfLines={1}>
            {item.subtitle} • {item.date}
          </Text>
        </View>
      </View>
      <Text style={[styles.txAmount, isCredit ? styles.creditText : styles.debitText]}>
        {item.amount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E7E7E7",
  },
  txLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  txIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  creditIconBox: {
    backgroundColor: "#E2FCD4",
  },
  debitIconBox: {
    backgroundColor: "#FFE5E5",
  },
  txIconSymbol: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 16,
    color: "#1A1A1A",
    lineHeight: 18,
  },
  textWrapper: {
    flex: 1,
    gap: 2,
    marginRight: 8,
  },
  txTitle: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 15,
    color: "#1A1A1A",
    lineHeight: 18,
  },
  txSubtitle: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 12,
    color: "#8A8A8A",
    lineHeight: 15,
  },
  txAmount: {
    fontFamily: "Ubuntu_700Bold",
    fontSize: 15,
    letterSpacing: -0.3,
  },
  creditText: {
    color: "#34C759",
  },
  debitText: {
    color: "#FF3B30",
  },
});
