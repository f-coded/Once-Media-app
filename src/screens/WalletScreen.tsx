import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Modal,
  TextInput,
  Animated,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  ScrollView,
} from "react-native";
import Svg, { Path, Rect, Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomNav } from "../components/BottomNav";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type Tab = "home" | "market" | "chat" | "wallet";

interface Transaction {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  type: "credit" | "debit";
  date: string;
}

interface WalletScreenProps {
  onTabPress?: (tab: Tab) => void;
}

/* ─── Premium SVG Custom Line Decoration ─── */
function CardDecorativeLines() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 339 140"
      style={StyleSheet.absoluteFillObject}
      pointerEvents="none"
    >
      <Defs>
        <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#ffffff" stopOpacity={0.15} />
          <Stop offset="100%" stopColor="#ffffff" stopOpacity={0.0} />
        </LinearGradient>
      </Defs>
      {/* Decorative Wave 1 */}
      <Path
        d="M-20 80 C 60 140, 180 40, 360 110"
        fill="none"
        stroke="url(#grad)"
        strokeWidth={3}
      />
      {/* Decorative Wave 2 */}
      <Path
        d="M-40 40 C 90 10, 160 120, 380 50"
        fill="none"
        stroke="url(#grad)"
        strokeWidth={1.5}
      />
      {/* Decorative Circle accents */}
      <Circle cx={280} cy={30} r={40} fill="none" stroke="url(#grad)" strokeWidth={1} />
      <Circle cx={60} cy={120} r={25} fill="none" stroke="url(#grad)" strokeWidth={1} />
    </Svg>
  );
}

/* ─── Custom empty state Svg illustration ─── */
function EmptyStateIllustration() {
  return (
    <Svg width="46" height="46" viewBox="0 0 46 46" fill="none">
      <Rect width="46" height="46" rx="12" fill="#F2F2F2" />
      <Path
        d="M17 19.5 C 17 17.568, 18.568 16, 20.5 16 H 25.5 C 27.432 16, 29 17.568, 29 19.5 V 26.5 C 29 28.432, 27.432 30, 25.5 30 H 20.5 C 18.568 30, 17 28.432, 17 26.5 Z"
        stroke="#838383"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M21 21.5 H 25"
        stroke="#838383"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M21 24.5 H 23.5"
        stroke="#838383"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Circle cx={27.5} cy={18.5} r={2} fill="#E85454" />
    </Svg>
  );
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
    const rewards = [50.0, 100.0, 150.0, 200.0];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    const campaignNames = ["House Tour Campaign", "First Viewing Reward", "Partner Referrals", "Special Beta Reward"];
    const name = campaignNames[Math.floor(Math.random() * campaignNames.length)];

    const newTx: Transaction = {
      id: Math.random().toString(),
      title: name,
      subtitle: "Campaign Winner Payout",
      amount: `+$${reward.toFixed(2)}`,
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
      amount: `-$${amt.toFixed(2)}`,
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
    <View style={styles.txRow}>
      <View style={styles.txLeft}>
        <View style={[styles.txIconBox, item.type === "credit" ? styles.creditIconBox : styles.debitIconBox]}>
          <Text style={styles.txIconSymbol}>{item.type === "credit" ? "+" : "-"}</Text>
        </View>
        <View>
          <Text style={styles.txTitle}>{item.title}</Text>
          <Text style={styles.txSubtitle}>{item.subtitle} • {item.date}</Text>
        </View>
      </View>
      <Text style={[styles.txAmount, item.type === "credit" ? styles.creditText : styles.debitText]}>
        {item.amount}
      </Text>
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Main Container */}
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header Profile Section */}
        <View style={styles.header}>
          <View style={styles.profileWrapper}>
            <View style={styles.avatar}>
              {/* Fallback elegant monogram profile */}
              <Text style={styles.avatarText}>F</Text>
            </View>
            <View style={styles.titleWrapper}>
              <Text style={styles.headerTitle}>Wallet</Text>
              <Text style={styles.headerSubtitle}>Reward account activity</Text>
            </View>
          </View>

          {/* Quick Mock Campaign Trigger */}
          <Pressable
            style={({ pressed }) => [styles.triggerBtn, pressed && styles.btnPressed]}
            onPress={handleCampaignReward}
          >
            <Text style={styles.triggerBtnText}>Mock Campaign Win</Text>
          </Pressable>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <CardDecorativeLines />
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text style={styles.balanceValue}>${displayBalance}</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.withdrawBtn, pressed && styles.btnPressed]}
            onPress={handleWithdrawPress}
          >
            <Text style={styles.withdrawBtnText}>Withdraw</Text>
          </Pressable>
        </View>

        {/* Section Header: Transaction History */}
        <Text style={styles.sectionTitle}>Transaction history</Text>

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
      <Modal
        animationType="slide"
        transparent={true}
        visible={withdrawModalVisible}
        onRequestClose={() => setWithdrawModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setWithdrawModalVisible(false)} />
          
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <View style={styles.dragBar} />
              <Text style={styles.modalTitle}>Withdraw Payout</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              {balance <= 0 ? (
                <View style={styles.emptyBalanceState}>
                  <Text style={styles.errorMessage}>You don't have any funds to withdraw yet!</Text>
                  <Text style={styles.modalHelpText}>
                    Earn rewards by participating in tours and campaigns in your feed!
                  </Text>
                  <Pressable
                    style={styles.closeBtn}
                    onPress={() => setWithdrawModalVisible(false)}
                  >
                    <Text style={styles.closeBtnText}>Close</Text>
                  </Pressable>
                </View>
              ) : (
                <View>
                  <Text style={styles.inputLabel}>Available Balance: ${balance.toFixed(2)}</Text>

                  {/* Input Amount */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.currencyPrefix}>$</Text>
                    <TextInput
                      style={styles.amountInput}
                      placeholder="0.00"
                      placeholderTextColor="#BEBEBE"
                      keyboardType="numeric"
                      value={withdrawAmount}
                      onChangeText={(txt) => {
                        setWithdrawAmount(txt);
                        setErrorMessage("");
                      }}
                      autoFocus
                    />
                  </View>

                  {errorMessage ? (
                    <Text style={styles.modalError}>{errorMessage}</Text>
                  ) : null}

                  {/* Bank Picker */}
                  <Text style={styles.inputLabel}>Destination Bank</Text>
                  <View style={styles.bankPicker}>
                    {["Access Bank", "GTBank", "Zenith Bank"].map((bank) => {
                      const selected = selectedBank === bank;
                      return (
                        <Pressable
                          key={bank}
                          style={[styles.bankOption, selected && styles.bankOptionSelected]}
                          onPress={() => setSelectedBank(bank)}
                        >
                          <Text style={[styles.bankOptionText, selected && styles.bankOptionTextSelected]}>
                            {bank}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {/* Submit Button */}
                  <Pressable
                    style={({ pressed }) => [styles.confirmWithdrawBtn, pressed && styles.btnPressed]}
                    onPress={handleConfirmWithdrawal}
                  >
                    <Text style={styles.confirmWithdrawBtnText}>Confirm Withdrawal</Text>
                  </Pressable>
                </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 20,
  },
  profileWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "#1B17B3",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: "Ubuntu_700Bold",
    fontSize: 15,
    color: "#FFFFFF",
  },
  titleWrapper: {
    gap: 2,
  },
  headerTitle: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 22,
    letterSpacing: -0.44,
    color: "#0C0B0B",
  },
  headerSubtitle: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    letterSpacing: -0.28,
    color: "#838383",
  },
  triggerBtn: {
    borderWidth: 1,
    borderColor: "#E7E7E7",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#F8F8F8",
  },
  triggerBtnText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 11,
    color: "#1B17B3",
  },
  balanceCard: {
    width: "100%",
    height: 140,
    borderRadius: 22,
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
    marginBottom: 14,
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
    fontSize: 30,
    letterSpacing: -0.6,
    color: "#FFFFFF",
  },
  withdrawBtn: {
    width: "100%",
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  withdrawBtnText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 16,
    letterSpacing: -0.32,
    color: "#1B17B3",
  },
  sectionTitle: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 16,
    letterSpacing: -0.32,
    color: "#0C0B0B",
    marginTop: 24,
    marginBottom: 12,
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
    fontSize: 18,
    color: "#1A1A1A",
  },
  txTitle: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 15,
    color: "#1A1A1A",
  },
  txSubtitle: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 12,
    color: "#8A8A8A",
  },
  txAmount: {
    fontFamily: "Ubuntu_700Bold",
    fontSize: 15,
  },
  creditText: {
    color: "#34C759",
  },
  debitText: {
    color: "#FF3B30",
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  /* ─── Payout Modal Styles ─── */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  dragBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E7E7E7",
    marginBottom: 12,
  },
  modalTitle: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 20,
    color: "#1A1A1A",
  },
  modalScroll: {
    paddingBottom: 20,
  },
  inputLabel: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    color: "#8A8A8A",
    marginBottom: 8,
    marginTop: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: "#1B17B3",
    paddingBottom: 4,
    marginBottom: 12,
  },
  currencyPrefix: {
    fontFamily: "Ubuntu_700Bold",
    fontSize: 32,
    color: "#1A1A1A",
    marginRight: 6,
  },
  amountInput: {
    fontFamily: "Ubuntu_700Bold",
    fontSize: 32,
    color: "#1A1A1A",
    flex: 1,
    padding: 0,
  },
  modalError: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 13,
    color: "#FF3B30",
    marginBottom: 12,
  },
  bankPicker: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  bankOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E7E7E7",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  bankOptionSelected: {
    borderColor: "#1B17B3",
    backgroundColor: "#EAE9FC",
  },
  bankOptionText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 13,
    color: "#8A8A8A",
  },
  bankOptionTextSelected: {
    fontFamily: "Ubuntu_500Medium",
    color: "#1B17B3",
  },
  confirmWithdrawBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1B17B3",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  confirmWithdrawBtnText: {
    fontFamily: "Ubuntu_700Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  emptyBalanceState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    gap: 12,
  },
  errorMessage: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
  },
  modalHelpText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 13,
    color: "#8A8A8A",
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  closeBtn: {
    height: 44,
    width: 120,
    borderRadius: 22,
    backgroundColor: "#F3F3F3",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  closeBtnText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    color: "#1A1A1A",
  },
});
