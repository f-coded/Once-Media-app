 import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomNav } from "../components/BottomNav";

// Import modular premium wallet components
import { WalletHeader } from "../components/wallet/WalletHeader";
import { BalanceCard } from "../components/wallet/BalanceCard";
import { EmptyStateIllustration } from "../components/wallet/EmptyStateIllustration";
import { WithdrawModal } from "../components/wallet/WithdrawModal";
import { TransactionItem, Transaction } from "../components/wallet/TransactionItem";

type Tab = "home" | "market" | "chat" | "wallet";

interface WalletScreenProps {
  onTabPress?: (tab: Tab) => void;
}

export function WalletScreen({ onTabPress }: WalletScreenProps) {
  const insets = useSafeAreaInsets();
  const [balance, setBalance] = useState(0.0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState("Access Bank");
  const [errorMessage, setErrorMessage] = useState("");

  /* ─── Balance Counter Anim ─── */
  const animatedBalanceVal = useRef(new Animated.Value(0)).current;
  const [displayBalance, setDisplayBalance] = useState("0.00");

  useEffect(() => {
    const listenerId = animatedBalanceVal.addListener(({ value }) => {
      setDisplayBalance(value.toFixed(2));
    });
    return () => {
      animatedBalanceVal.removeListener(listenerId);
    };
  }, []);

  const animateToBalance = (target: number) => {
    Animated.timing(animatedBalanceVal, {
      toValue: target,
      duration: 800,
      useNativeDriver: false,
    }).start();
  };

  const handleCampaignReward = () => {
    // Large, realistic payouts in Naira
    const rewards = [5000.0, 10000.0, 15000.0, 20000.0];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    const campaignNames = ["House Tour Campaign", "First Viewing Reward", "Partner Referrals", "Special Beta Reward"];
    const name = campaignNames[Math.floor(Math.random() * campaignNames.length)];

    const newTx: Transaction = {
      id: Math.random().toString(),
      title: name,
      subtitle: "Campaign Winner Payout",
      amount: `+₦${reward.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      type: "credit",
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    const newBalance = balance + reward;
    setBalance(newBalance);
    animateToBalance(newBalance);
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleWithdrawPress = () => {
    if (balance <= 0) {
      setErrorMessage("No balance available to withdraw.");
      setWithdrawModalVisible(true);
      return;
    }
    setErrorMessage("");
    setWithdrawAmount("");
    setWithdrawModalVisible(true);
  };

  const handleConfirmWithdrawal = () => {
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      setErrorMessage("Please enter a valid amount.");
      return;
    }
    if (amt > balance) {
      setErrorMessage("Amount exceeds available balance.");
      return;
    }

    const newTx: Transaction = {
      id: Math.random().toString(),
      title: `Payout to ${selectedBank}`,
      subtitle: "Bank Transfer Out",
      amount: `-₦${amt.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      type: "debit",
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    const newBalance = balance - amt;
    setBalance(newBalance);
    animateToBalance(newBalance);
    setTransactions((prev) => [newTx, ...prev]);
    setWithdrawModalVisible(false);
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <TransactionItem item={item} />
  );

  return (
    <View style={styles.root}>
      {/* Main Container */}
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header Profile Section matching mockup */}
        <WalletHeader />

        {/* Balance Card Section */}
        <BalanceCard
          balance={Number(displayBalance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          onWithdrawPress={handleWithdrawPress}
        />

        {/* Section Header: Transaction History */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Transaction history</Text>
          {/* Subtle developer action link keeping the header visually identical to the Figma screen */}
          <Pressable
            style={({ pressed }) => [styles.triggerBtn, pressed && styles.btnPressed]}
            onPress={handleCampaignReward}
          >
            <Text style={styles.triggerBtnText}>+ Add Mock Payout</Text>
          </Pressable>
        </View>

        {/* Transactions List or Empty State */}
        {transactions.length === 0 ? (
          <View style={styles.emptyWrapper}>
            <EmptyStateIllustration />
            <Text style={styles.emptyTitle}>No transaction history yet</Text>
            <Text style={styles.emptySubtitle}>
              You will see your transactions here. Participate in campaigns to get started
            </Text>
          </View>
        ) : (
          <FlatList
            data={transactions}
            renderItem={renderTransactionItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Navigation */}
      <BottomNav activeTab="wallet" onTabPress={onTabPress} />

      {/* Withdrawal Bottom-Sheet Modal */}
      <WithdrawModal
        visible={withdrawModalVisible}
        balance={balance}
        withdrawAmount={withdrawAmount}
        selectedBank={selectedBank}
        errorMessage={errorMessage}
        onClose={() => setWithdrawModalVisible(false)}
        onAmountChange={(txt) => {
          setWithdrawAmount(txt);
          setErrorMessage("");
        }}
        onBankSelect={setSelectedBank}
        onConfirm={handleConfirmWithdrawal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 16,
    letterSpacing: -0.32,
    color: "#0C0B0B",
  },
  triggerBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  triggerBtnText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 12,
    color: "#1B17B3",
    letterSpacing: -0.24,
  },
  emptyWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 11,
    paddingBottom: 80,
  },
  emptyTitle: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 16,
    letterSpacing: -0.32,
    color: "#262525",
  },
  emptySubtitle: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 12,
    letterSpacing: -0.24,
    color: "#838383",
    textAlign: "center",
    paddingHorizontal: 30,
    lineHeight: 18,
  },
  listContainer: {
    paddingBottom: 100,
  },
  btnPressed: {
    opacity: 0.7,
  },
});
