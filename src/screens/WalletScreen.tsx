 import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Animated,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomNav } from "../components/BottomNav";

// Import modular premium wallet components
import { WalletHeader } from "../components/wallet/WalletHeader";
import { BalanceCard } from "../components/wallet/BalanceCard";
import { EmptyStateIllustration } from "../components/wallet/EmptyStateIllustration";
import { WithdrawModal } from "../components/wallet/WithdrawModal";
import { TransactionItem, Transaction } from "../components/wallet/TransactionItem";
import { WithdrawalPinFlow } from "../components/wallet/WithdrawalPinFlow";

type Tab = "home" | "market" | "chat" | "wallet";

interface WalletScreenProps {
  onTabPress?: (tab: Tab) => void;
}

const formatDate = (date: Date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
  
  const day = date.getDate();
  const months = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
  ];
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${formattedHours}:${formattedMinutes} ${ampm}, ${day} ${monthName} ${year}`;
};

export function WalletScreen({ onTabPress }: WalletScreenProps) {
  const insets = useSafeAreaInsets();
  const [balance, setBalance] = useState(40200.0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [pinFlowVisible, setPinFlowVisible] = useState(false);

  /* ─── Balance Counter Anim ─── */
  const animatedBalanceVal = useRef(new Animated.Value(40200)).current;
  const [displayBalance, setDisplayBalance] = useState("40200");

  useEffect(() => {
    const listenerId = animatedBalanceVal.addListener(({ value }) => {
      setDisplayBalance(value.toFixed(0));
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

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  }, []);

  const handleCampaignReward = () => {
    const reward = 43000;
    const newTx: Transaction = {
      id: Math.random().toString(),
      title: "Campaign deposit",
      subtitle: "Adron Homes...",
      amount: `₦${reward.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      type: "credit",
      date: formatDate(new Date()),
    };

    const newBalance = balance + reward;
    setBalance(newBalance);
    animateToBalance(newBalance);
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleWithdrawPress = () => {
    if (!hasPin) {
      setPinFlowVisible(true);
    } else {
      setWithdrawModalVisible(true);
    }
  };

  const handlePinCreated = () => {
    setHasPin(true);
    setPinFlowVisible(false);
    // Auto-open withdraw modal after setup for premium UX
    setWithdrawModalVisible(true);
  };

  const handleConfirmWithdrawal = (amt: number, bankName: string, accountNumber: string) => {
    const newTx: Transaction = {
      id: Math.random().toString(),
      title: `Transfer to ••••${accountNumber.slice(-4)}`,
      subtitle: bankName,
      amount: `₦${amt.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      type: "debit",
      date: formatDate(new Date()),
    };

    const newBalance = balance - amt;
    setBalance(newBalance);
    animateToBalance(newBalance);
    setTransactions((prev) => [newTx, ...prev]);
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <TransactionItem item={item} />
  );

  return (
    <View style={styles.root}>
      {/* Main Container */}
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Padded wrapper for header and balance card to align with mockups */}
        <View style={styles.headerWrapper}>
          {/* Header Profile Section matching mockup */}
          <WalletHeader />

          {/* Balance Card Section */}
          <BalanceCard
            balance={Number(displayBalance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            onWithdrawPress={handleWithdrawPress}
          />
        </View>

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

        {/* Transactions List with refresh control - only this section scrolls */}
        <FlatList
          data={transactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContainer, { flexGrow: 1 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#1B17B3"
              colors={["#1B17B3"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrapper}>
              <EmptyStateIllustration />
              <Text style={styles.emptyTitle}>No transaction history yet</Text>
              <Text style={styles.emptySubtitle}>
                You will see your transactions here. Participate in campaigns to get started
              </Text>
            </View>
          }
        />
      </View>

      {/* Navigation */}
      <BottomNav activeTab="wallet" onTabPress={onTabPress} />

      {/* Withdrawal Bottom-Sheet Modal */}
      <WithdrawModal
        visible={withdrawModalVisible}
        balance={balance}
        onClose={() => setWithdrawModalVisible(false)}
        onConfirmWithdrawal={handleConfirmWithdrawal}
      />

      {/* Withdrawal PIN flow */}
      <WithdrawalPinFlow
        visible={pinFlowVisible}
        onClose={() => setPinFlowVisible(false)}
        onPinCreated={handlePinCreated}
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
  },
  headerWrapper: {
    paddingHorizontal: 18,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: 8,
    paddingHorizontal: 18,
  },
  sectionTitle: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 16,
    lineHeight:18,
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
    paddingBottom: 180,
  },
  emptyTitle: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 18,
    letterSpacing: -0.36,
    color: "#0C0C0C",
    marginTop: 16,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 13,
    letterSpacing: -0.26,
    color: "#838383",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 19,
  },
  listContainer: {
    paddingTop: 0,
    paddingBottom: 100,
  },
  btnPressed: {
    opacity: 0.7,
  },
});
