import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Animated,
  TouchableOpacity,
} from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { BlurView } from "expo-blur";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

/* ── Types ── */

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  isDefault: boolean;
}

type ModalView = "no_accounts" | "with_accounts" | "add_account" | "manage_accounts";

interface WithdrawModalProps {
  visible: boolean;
  balance: number;
  onClose: () => void;
  onConfirmWithdrawal: (amount: number, bankName: string, accountNumber: string) => void;
}

/* ── Inline SVG Icons ── */

function CloseIcon({ size = 20, color = "#0C0C0C" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path d="M4.5 4.5L13.5 13.5M13.5 4.5L4.5 13.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}
function Buildings3Icon({ size = 28, color = "#0C0C0C" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M22 22L2 22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M17 22V6C17 4.11438 17 3.17157 16.4142 2.58579C15.8284 2 14.8856 2 13 2H11C9.11438 2 8.17157 2 7.58579 2.58579C7 3.17157 7 4.11438 7 6V22" stroke={color} strokeWidth="1.5" />
      <Path d="M21 22V8.5C21 7.09554 21 6.39331 20.6629 5.88886C20.517 5.67048 20.3295 5.48298 20.1111 5.33706C19.6067 5 18.9045 5 17.5 5" stroke={color} strokeWidth="1.5" />
      <Path d="M3 22V8.5C3 7.09554 3 6.39331 3.33706 5.88886C3.48298 5.67048 3.67048 5.48298 3.88886 5.33706C4.39331 5 5.09554 5 6.5 5" stroke={color} strokeWidth="1.5" />
      <Path d="M12 22V19" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M10 12H14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M5.5 11H7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M5.5 14H7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M17 11H18.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M17 14H18.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M5.5 8H7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M17 8H18.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M10 15H14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="12" cy="7" r="2" stroke={color} strokeWidth="1.5" />
    </Svg>
  );
}

function InfoCircleIcon({ size = 18, color = "#1B17B3" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Circle cx="9" cy="9" r="7.5" stroke={color} strokeWidth="1.125" />
      <Path d="M9 8.25V12.75" stroke={color} strokeWidth="1.125" strokeLinecap="round" />
      <Circle cx="9" cy="6" r="0.75" fill={color} />
    </Svg>
  );
}

function ChevronDownIcon({ size = 16, color = "#838383" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M4 6L8 10L12 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function UserIcon({ size = 18, color = "#838383" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Circle cx="9" cy="4.5" r="3" stroke={color} strokeWidth="1.125" />
      <Path d="M15 13.125C15 14.989 15 16.5 9 16.5C3 16.5 3 14.989 3 13.125C3 11.261 5.68629 9.75 9 9.75C12.3137 9.75 15 11.261 15 13.125Z" stroke={color} strokeWidth="1.125" />
    </Svg>
  );
}

function RadioOuter({ selected }: { selected: boolean }) {
  return (
    <View style={[s.radioOuter, selected && s.radioOuterSelected]}>
      {selected && <View style={s.radioInner} />}
    </View>
  );
}

function PlusIcon({ size = 16, color = "#1B17B3" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M8 3V13M3 8H13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function SettingsIcon({ size = 20, color = "#1B17B3" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="10" r="2.5" stroke={color} strokeWidth="1.25" />
      <Path d="M11.471 1.79349C11.1648 1.66663 10.7765 1.66663 9.99991 1.66663C9.22334 1.66663 8.83505 1.66663 8.52877 1.79349C8.12039 1.96265 7.79593 2.28711 7.62678 2.69549C7.54956 2.88191 7.51934 3.09871 7.50751 3.41495C7.49013 3.87969 7.2518 4.30987 6.84904 4.5424C6.44628 4.77493 5.95458 4.76624 5.54341 4.54892C5.26362 4.40104 5.06076 4.31881 4.8607 4.29247C4.42245 4.23478 3.97924 4.35354 3.62855 4.62263C3.36554 4.82444 3.1714 5.16071 2.78311 5.83324C2.39483 6.50576 2.20069 6.84203 2.15741 7.17071C2.09972 7.60896 2.21848 8.05218 2.48757 8.40286C2.61039 8.56292 2.783 8.69748 3.05091 8.86581C3.44475 9.11328 3.69816 9.53484 3.69813 9.99998C3.69811 10.4651 3.44471 10.8866 3.05091 11.134C2.78296 11.3024 2.61032 11.4369 2.48748 11.597C2.21839 11.9477 2.09964 12.3909 2.15733 12.8291C2.2006 13.1578 2.39475 13.4941 2.78303 14.1666C3.17132 14.8392 3.36546 15.1754 3.62847 15.3772C3.97915 15.6463 4.42237 15.7651 4.86062 15.7074C5.06066 15.6811 5.26352 15.5988 5.54328 15.451C5.95448 15.2336 6.44622 15.2249 6.849 15.4575C7.25178 15.69 7.49013 16.1202 7.50751 16.585C7.51934 16.9012 7.54956 17.118 7.62678 17.3044C7.79593 17.7128 8.12039 18.0373 8.52877 18.2064C8.83505 18.3333 9.22334 18.3333 9.99991 18.3333C10.7765 18.3333 11.1648 18.3333 11.471 18.2064C11.8794 18.0373 12.2039 17.7128 12.373 17.3044C12.4503 17.118 12.4805 16.9012 12.4923 16.5849C12.5097 16.1202 12.748 15.69 13.1507 15.4575C13.5535 15.2249 14.0453 15.2336 14.4565 15.4509C14.7362 15.5988 14.9391 15.681 15.1391 15.7073C15.5774 15.765 16.0206 15.6463 16.3713 15.3772C16.6343 15.1754 16.8284 14.8391 17.2167 14.1666C17.605 13.494 17.7991 13.1578 17.8424 12.8291C17.9001 12.3908 17.7813 11.9476 17.5123 11.5969C17.3894 11.4369 17.2168 11.3023 16.9489 11.134C16.555 10.8865 16.3017 10.465 16.3017 9.99988C16.3017 9.53483 16.5551 9.11336 16.9489 8.86595C17.2168 8.69758 17.3895 8.56301 17.5123 8.40292C17.7814 8.05223 17.9002 7.60902 17.8425 7.17077C17.7992 6.84209 17.6051 6.50582 17.2168 5.83329C16.8285 5.16076 16.6344 4.8245 16.3713 4.62268C16.0207 4.35359 15.5774 4.23483 15.1392 4.29253C14.9392 4.31887 14.7363 4.40109 14.4565 4.54896C14.0453 4.76629 13.5536 4.77497 13.1508 4.54243C12.748 4.30988 12.5097 3.87968 12.4923 3.41491C12.4805 3.09869 12.4503 2.8819 12.373 2.69549C12.2039 2.28711 11.8794 1.96265 11.471 1.79349Z" stroke={color} strokeWidth="1.25" />
    </Svg>
  );
}

function ThreeDotsIcon({ size = 16, color = "#838383" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Circle cx="3" cy="8" r="1.5" fill={color} />
      <Circle cx="8" cy="8" r="1.5" fill={color} />
      <Circle cx="13" cy="8" r="1.5" fill={color} />
    </Svg>
  );
}

/* ── Bank logos (simple colored circles with initials) ── */

const BANK_OPTIONS = [
  { name: "OPay", color: "#1DC45E", initials: "OP" },
  { name: "Moniepoint MFB", color: "#1B17B3", initials: "MP" },
  { name: "Access Bank", color: "#F47920", initials: "AB" },
  { name: "GTBank", color: "#E35205", initials: "GT" },
  { name: "Zenith Bank", color: "#E2121B", initials: "ZB" },
  { name: "UBA", color: "#CE1126", initials: "UB" },
  { name: "First Bank", color: "#003366", initials: "FB" },
];

function BankLogo({ bankName, size = 32, borderRadius }: { bankName: string; size?: number; borderRadius?: number }) {
  const bank = BANK_OPTIONS.find((b) => b.name === bankName);
  const bg = bank?.color ?? "#838383";
  const initials = bank?.initials ?? bankName.substring(0, 2).toUpperCase();
  const radius = borderRadius !== undefined ? borderRadius : size / 2;
  return (
    <View style={[s.bankLogo, { width: size, height: size, borderRadius: radius, backgroundColor: bg }]}>
      <Text style={[s.bankLogoText, { fontSize: size * 0.35 }]}>{initials}</Text>
    </View>
  );
}

/* ══════════════════════════════════════════════════════════
   WithdrawModal — self-contained multi-state bottom sheet
   ══════════════════════════════════════════════════════════ */

export function WithdrawModal({ visible, balance, onClose, onConfirmWithdrawal }: WithdrawModalProps) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [view, setView] = useState<ModalView>("no_accounts");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Add-account form state
  const [newBankName, setNewBankName] = useState("");
  const [newAccountNumber, setNewAccountNumber] = useState("");
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);


  const amountInputRef = useRef<TextInput>(null);
  const addAccNumberRef = useRef<TextInput>(null);
  const addAccAmountRef = useRef<TextInput>(null);

  // Animation values for smooth fading backdrop & sliding sheet
  const [anim] = useState(() => new Animated.Value(0));
  const [renderModal, setRenderModal] = useState(visible);

  useEffect(() => {
    if (visible) {
      setRenderModal(true);
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(anim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setRenderModal(false);
      });
    }
  }, [visible]);

  /* ── Derived ── */
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) ?? null;

  /* ── Reset when modal opens/closes ── */
  const handleClose = () => {
    setView(accounts.length > 0 ? "with_accounts" : "no_accounts");
    setAmount("");
    setErrorMessage("");
    setNewBankName("");
    setNewAccountNumber("");
    setBankDropdownOpen(false);
    onClose();
  };

  /* ── Helpers ── */
  const formatBalance = (val: number) =>
    val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const navigateTo = (v: ModalView) => {
    setErrorMessage("");
    setAmount("");
    setBankDropdownOpen(false);
    setView(v);
  };

  /* ── Add account + withdraw ── */
  const handleAddAccountAndWithdraw = () => {
    if (!newBankName) {
      setErrorMessage("Please select a bank.");
      return;
    }
    if (newAccountNumber.length < 10) {
      setErrorMessage("Please enter a valid 10-digit account number.");
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 1) {
      setErrorMessage("Minimum per transaction is NGN 1.00.");
      return;
    }
    if (amt > balance) {
      setErrorMessage("Amount exceeds available balance.");
      return;
    }
    if (amt > 9999999) {
      setErrorMessage("Maximum per transaction is NGN 9,999,999.00.");
      return;
    }

    const newAccount: BankAccount = {
      id: Math.random().toString(36).slice(2),
      bankName: newBankName,
      accountNumber: newAccountNumber,
      isDefault: accounts.length === 0,
    };
    const updatedAccounts = [...accounts, newAccount];
    setAccounts(updatedAccounts);
    setSelectedAccountId(newAccount.id);

    // Execute withdrawal
    onConfirmWithdrawal(amt, newBankName, newAccountNumber);

    // Reset form and go to with_accounts
    setNewBankName("");
    setNewAccountNumber("");
    setAmount("");
    setErrorMessage("");
    setView("with_accounts");
  };

  /* ── Withdraw from existing account ── */
  const handleWithdrawFromAccount = () => {
    if (!selectedAccount) {
      setErrorMessage("Please select an account.");
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 1) {
      setErrorMessage("Minimum per transaction is NGN 1.00.");
      return;
    }
    if (amt > balance) {
      setErrorMessage("Amount exceeds available balance.");
      return;
    }
    if (amt > 9999999) {
      setErrorMessage("Maximum per transaction is NGN 9,999,999.00.");
      return;
    }

    onConfirmWithdrawal(amt, selectedAccount.bankName, selectedAccount.accountNumber);
    setAmount("");
    setErrorMessage("");
  };

  /* ── Manage accounts helpers ── */
  const handleSetDefault = (id: string) => {
    setAccounts((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
  };

  const handleDeleteAccount = (id: string) => {
    const updated = accounts.filter((a) => a.id !== id);
    setAccounts(updated);
    if (selectedAccountId === id) {
      setSelectedAccountId(updated.find((a) => a.isDefault)?.id ?? updated[0]?.id ?? null);
    }
    if (updated.length === 0) {
      setView("no_accounts");
    }
  };


  /* ── Determine which view to show when modal opens ── */
  const currentView = (() => {
    if (view === "no_accounts" && accounts.length > 0) return "with_accounts";
    if (view === "with_accounts" && accounts.length === 0) return "no_accounts";
    return view;
  })();

  if (!renderModal) return null;

  const backdropOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const sheetTranslateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_HEIGHT, 0],
  });

  const sheetStyle = [
    currentView === "no_accounts" ? s.noAccountsSheet : s.sheet,
    { transform: [{ translateY: sheetTranslateY }] }
  ];

  return (
    <>
      <Modal
        animationType="none"
        transparent
        visible={visible || renderModal}
        onRequestClose={handleClose}
        statusBarTranslucent
      >
        <View style={s.overlay}>
          <Animated.View
            style={[StyleSheet.absoluteFill, { opacity: backdropOpacity }]}
          >
            {Platform.OS === "web" ? (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.45)" }]} />
            ) : (
              <>
                <BlurView
                  intensity={7}
                  tint="dark"
                  experimentalBlurMethod="dimezisBlurView"
                  style={StyleSheet.absoluteFill}
                />
                <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0, 0, 0, 0.67)" }]} />
              </>
            )}
            <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
          </Animated.View>

          <Animated.View style={sheetStyle}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={{ width: "100%" }}
            >
              {currentView === "no_accounts" ? (
                <NoAccountsView navigateTo={navigateTo} handleClose={handleClose} />
              ) : (
                <ScrollView
                  style={s.sheetScrollView}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={s.sheetScroll}
                  keyboardShouldPersistTaps="handled"
                >
                  {currentView === "with_accounts" && (
                    <WithAccountsView
                      accounts={accounts}
                      selectedAccountId={selectedAccountId}
                      setSelectedAccountId={setSelectedAccountId}
                      amount={amount}
                      setAmount={setAmount}
                      balance={balance}
                      errorMessage={errorMessage}
                      setErrorMessage={setErrorMessage}
                      handleWithdrawFromAccount={handleWithdrawFromAccount}
                      navigateTo={navigateTo}
                      handleClose={handleClose}
                      amountInputRef={amountInputRef}
                      formatBalance={formatBalance}
                    />
                  )}
                  {currentView === "add_account" && (
                    <AddAccountView
                      accounts={accounts}
                      newBankName={newBankName}
                      setNewBankName={setNewBankName}
                      newAccountNumber={newAccountNumber}
                      setNewAccountNumber={setNewAccountNumber}
                      bankDropdownOpen={bankDropdownOpen}
                      setBankDropdownOpen={setBankDropdownOpen}
                      amount={amount}
                      setAmount={setAmount}
                      balance={balance}
                      errorMessage={errorMessage}
                      setErrorMessage={setErrorMessage}
                      handleAddAccountAndWithdraw={handleAddAccountAndWithdraw}
                      navigateTo={navigateTo}
                      addAccNumberRef={addAccNumberRef}
                      addAccAmountRef={addAccAmountRef}
                      formatBalance={formatBalance}
                    />
                  )}
                  {currentView === "manage_accounts" && (
                    <ManageAccountsView
                      accounts={accounts}
                      handleSetDefault={handleSetDefault}
                      handleDeleteAccount={handleDeleteAccount}
                      navigateTo={navigateTo}
                    />
                  )}
                </ScrollView>
              )}
            </KeyboardAvoidingView>
          </Animated.View>
        </View>
      </Modal>


    </>
  );
}

/* ══════════════════════════════════════════════════════════
   Extracted View Components (for performance & instant typing response)
   ══════════════════════════════════════════════════════════ */

interface NoAccountsViewProps {
  navigateTo: (v: ModalView) => void;
  handleClose: () => void;
}

const NoAccountsView = React.memo(({ navigateTo, handleClose }: NoAccountsViewProps) => {
  return (
    <View style={s.stateContainer}>
      <View style={s.sheetHeader}>
        <Text style={s.sheetTitle}>Withdraw</Text>
        <Pressable onPress={handleClose} hitSlop={12}>
          <CloseIcon />
        </Pressable>
      </View>
      <View style={s.emptyBody}>
        <View style={s.emptyIconCircle}>
          <Buildings3Icon size={20} color="#0C0C0C" />
        </View>
        <Text style={s.emptyTitle}>No Bank</Text>
        <Text style={s.emptySubtitle}>
          {"Add withdrawal bank account and you will find\nthem here after you activate them by withdrawing."}
        </Text>
      </View>
      <TouchableOpacity
        style={s.addBeneficiaryBtn}
        activeOpacity={0.85}
        onPress={() => navigateTo("add_account")}
      >
        <PlusIcon size={16} color="#FFFFFF" />
        <Text style={s.addBeneficiaryBtnText}>Add beneficiary account</Text>
      </TouchableOpacity>
    </View>
  );
});

interface WithAccountsViewProps {
  accounts: BankAccount[];
  selectedAccountId: string | null;
  setSelectedAccountId: (id: string | null) => void;
  amount: string;
  setAmount: (val: string) => void;
  balance: number;
  errorMessage: string;
  setErrorMessage: (msg: string) => void;
  handleWithdrawFromAccount: () => void;
  navigateTo: (v: ModalView) => void;
  handleClose: () => void;
  amountInputRef: React.RefObject<TextInput | null>;
  formatBalance: (val: number) => string;
}

const WithAccountsView = React.memo(({
  accounts,
  selectedAccountId,
  setSelectedAccountId,
  amount,
  setAmount,
  balance,
  errorMessage,
  setErrorMessage,
  handleWithdrawFromAccount,
  navigateTo,
  handleClose,
  amountInputRef,
  formatBalance,
}: WithAccountsViewProps) => {
  return (
    <View style={s.stateContainer}>
      <View style={s.sheetHeader}>
        <Text style={s.sheetTitle}>Withdraw</Text>
        <Pressable onPress={handleClose} hitSlop={12}>
          <CloseIcon />
        </Pressable>
      </View>

      <View style={s.addAccContent}>
        <View style={s.addAccSection}>
          <View style={s.subHeaderRow}>
            <Text style={s.selectLabel}>Select Your bank account</Text>
            <Pressable onPress={() => navigateTo("manage_accounts")} hitSlop={8} style={s.manageLinkRow}>
              <SettingsIcon size={20} color="#1B17B3" />
              <Text style={s.manageLink}>Manage account</Text>
            </Pressable>
          </View>

          {accounts.map((account) => {
            const isSelected = selectedAccountId === account.id;
            return (
              <Pressable
                key={account.id}
                style={s.activeAccountCard}
                onPress={() => setSelectedAccountId(account.id)}
              >
                <View style={s.activeAccountCardLeft}>
                  <View style={s.activeAccountLogoContainer}>
                    <BankLogo bankName={account.bankName} size={46} borderRadius={12} />
                  </View>
                  <View style={s.activeAccountTextContainer}>
                    <Text style={s.activeAccountBankName}>{account.bankName}</Text>
                    <Text style={s.activeAccountAccountNumberMask}>
                      ****{account.accountNumber.slice(-4)}
                    </Text>
                  </View>
                </View>
                <View style={s.activeAccountCardRight}>
                  {account.isDefault && (
                    <View style={s.activeAccountDefaultBadge}>
                      <Text style={s.activeAccountDefaultText}>Default</Text>
                    </View>
                  )}
                  <RadioOuter selected={isSelected} />
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={s.addAccSection}>
          <Pressable style={s.addAccAmountRow} onPress={() => amountInputRef.current?.focus()}>
            <View style={s.addAccAmountLeft}>
              <Text style={s.addAccAmountPrefix}>₦</Text>
              <TextInput
                ref={amountInputRef}
                style={s.addAccAmountInput}
                placeholder="Enter Amount"
                placeholderTextColor="#434343"
                keyboardType="numeric"
                value={amount}
                onChangeText={(t) => { setAmount(t); setErrorMessage(""); }}
              />
            </View>
            <Text style={s.addAccMinLabel}>Min. 1.00</Text>
          </Pressable>

          {errorMessage ? <Text style={s.errorText}>{errorMessage}</Text> : null}

          <View style={s.addAccBalanceCard}>
            <View style={s.addAccBalanceRows}>
              <View style={s.addAccBalanceRow}>
                <Text style={s.addAccSmallText}>Balance (NGN)</Text>
                <Text style={s.addAccSmallText}>{formatBalance(balance)}</Text>
              </View>
              <View style={s.addAccBalanceRow}>
                <Text style={s.addAccLargeText}>Withdrawable Balance</Text>
                <Text style={s.addAccLargeText}>{formatBalance(balance)}</Text>
              </View>
            </View>
            <View style={s.addAccDivider} />
            <Text style={s.addAccLimitsText}>
              {"1. Minimum per transaction is NGN 1.00.\n2. Maximum per transaction is NGN 9,999,999.00."}
            </Text>
          </View>

          <TouchableOpacity
            style={s.addAccWithdrawBtn}
            activeOpacity={0.85}
            onPress={handleWithdrawFromAccount}
          >
            <Text style={s.addAccWithdrawBtnText}>Withdraw</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

interface AddAccountViewProps {
  accounts: BankAccount[];
  newBankName: string;
  setNewBankName: (name: string) => void;
  newAccountNumber: string;
  setNewAccountNumber: (num: string) => void;
  bankDropdownOpen: boolean;
  setBankDropdownOpen: (open: boolean) => void;
  amount: string;
  setAmount: (val: string) => void;
  balance: number;
  errorMessage: string;
  setErrorMessage: (msg: string) => void;
  handleAddAccountAndWithdraw: () => void;
  navigateTo: (v: ModalView) => void;
  addAccNumberRef: React.RefObject<TextInput | null>;
  addAccAmountRef: React.RefObject<TextInput | null>;
  formatBalance: (val: number) => string;
}

const AddAccountView = React.memo(({
  accounts,
  newBankName,
  setNewBankName,
  newAccountNumber,
  setNewAccountNumber,
  bankDropdownOpen,
  setBankDropdownOpen,
  amount,
  setAmount,
  balance,
  errorMessage,
  setErrorMessage,
  handleAddAccountAndWithdraw,
  navigateTo,
  addAccNumberRef,
  addAccAmountRef,
  formatBalance,
}: AddAccountViewProps) => {
  return (
    <View style={s.stateContainer}>
      <View style={s.sheetHeader}>
        <Text style={s.sheetTitle}>Add a new account</Text>
        <Pressable onPress={() => navigateTo(accounts.length > 0 ? "with_accounts" : "no_accounts")} hitSlop={12}>
          <CloseIcon size={20} color="#262525" />
        </Pressable>
      </View>

      <View style={s.addAccContent}>
        <View style={s.addAccSection}>
          <View style={s.addAccInfoBanner}>
            <InfoCircleIcon size={18} color="#1B17B3" />
            <Text style={s.addAccInfoText}>Withdraw once to activate this account.</Text>
          </View>

          <Pressable
            style={s.addAccFieldRow}
            onPress={() => setBankDropdownOpen(!bankDropdownOpen)}
          >
            <Buildings3Icon size={18} color="#0C0C0C" />
            <Text style={[s.addAccFieldText, { flex: 1 }, !newBankName && s.addAccFieldPlaceholder]}>
              {newBankName || "Select a bank"}
            </Text>
            <ChevronDownIcon size={18} color="#262525" />
          </Pressable>

          {bankDropdownOpen && (
            <View style={s.dropdownMenu}>
              <ScrollView style={s.dropdownScroll} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                {BANK_OPTIONS.map((bank) => (
                  <Pressable
                    key={bank.name}
                    style={s.dropdownItem}
                    onPress={() => {
                      setNewBankName(bank.name);
                      setBankDropdownOpen(false);
                    }}
                  >
                    <BankLogo bankName={bank.name} size={28} />
                    <Text style={s.dropdownItemText}>{bank.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          <Pressable style={s.addAccFieldRow} onPress={() => addAccNumberRef.current?.focus()}>
            <UserIcon size={18} color="#262525" />
            <TextInput
              ref={addAccNumberRef}
              style={s.addAccFieldInput}
              placeholder="Account number"
              placeholderTextColor="#838383"
              keyboardType="numeric"
              maxLength={10}
              value={newAccountNumber}
              onChangeText={(t) => { setNewAccountNumber(t); setErrorMessage(""); }}
            />
          </Pressable>
        </View>

        <View style={s.addAccSection}>
          <Pressable style={s.addAccAmountRow} onPress={() => addAccAmountRef.current?.focus()}>
            <View style={s.addAccAmountLeft}>
              <Text style={s.addAccAmountPrefix}>₦</Text>
              <TextInput
                ref={addAccAmountRef}
                style={s.addAccAmountInput}
                placeholder="Enter Amount"
                placeholderTextColor="#434343"
                keyboardType="numeric"
                value={amount}
                onChangeText={(t) => { setAmount(t); setErrorMessage(""); }}
              />
            </View>
            <Text style={s.addAccMinLabel}>Min. 1.00</Text>
          </Pressable>

          {errorMessage ? <Text style={s.errorText}>{errorMessage}</Text> : null}

          <View style={s.addAccBalanceCard}>
            <View style={s.addAccBalanceRows}>
              <View style={s.addAccBalanceRow}>
                <Text style={s.addAccSmallText}>Balance (NGN)</Text>
                <Text style={s.addAccSmallText}>{formatBalance(balance)}</Text>
              </View>
              <View style={s.addAccBalanceRow}>
                <Text style={s.addAccLargeText}>Withdrawable Balance</Text>
                <Text style={s.addAccLargeText}>{formatBalance(balance)}</Text>
              </View>
            </View>
            <View style={s.addAccDivider} />
            <Text style={s.addAccLimitsText}>
              {"1. Minimum per transaction is NGN 1.00.\n2. Maximum per transaction is NGN 9,999,999.00."}
            </Text>
          </View>

          <TouchableOpacity
            style={s.addAccWithdrawBtn}
            activeOpacity={0.85}
            onPress={handleAddAccountAndWithdraw}
          >
            <Text style={s.addAccWithdrawBtnText}>Withdraw</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

interface ManageAccountsViewProps {
  accounts: BankAccount[];
  handleSetDefault: (id: string) => void;
  handleDeleteAccount: (id: string) => void;
  navigateTo: (v: ModalView) => void;
}

const ManageAccountsView = React.memo(({
  accounts,
  handleSetDefault,
  handleDeleteAccount,
  navigateTo,
}: ManageAccountsViewProps) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
    <View style={s.stateContainer}>
      <View style={s.sheetHeader}>
        <Text style={s.sheetTitle}>Manage account</Text>
        <Pressable onPress={() => navigateTo("with_accounts")} hitSlop={12}>
          <CloseIcon />
        </Pressable>
      </View>

      <View style={s.addAccContent}>
        <View style={s.addAccSection}>
          {accounts.map((account) => (
            <View
              key={account.id}
              style={[s.activeAccountCard, { position: "relative", overflow: "visible", zIndex: openMenuId === account.id ? 10 : 1 }]}
            >
              <View style={s.activeAccountCardLeft}>
                <View style={s.activeAccountLogoContainer}>
                  <BankLogo bankName={account.bankName} size={46} borderRadius={12} />
                </View>
                <View style={s.activeAccountTextContainer}>
                  <Text style={s.activeAccountBankName}>{account.bankName}</Text>
                  <Text style={s.activeAccountAccountNumberMask}>
                    ****{account.accountNumber.slice(-4)}
                  </Text>
                </View>
              </View>
              <View style={[s.activeAccountCardRight, { position: "relative" }]}>
                {account.isDefault && (
                  <View style={s.activeAccountDefaultBadge}>
                    <Text style={s.activeAccountDefaultText}>Default</Text>
                  </View>
                )}
                <Pressable
                  onPress={() => setOpenMenuId(openMenuId === account.id ? null : account.id)}
                  hitSlop={10}
                  style={s.threeDotsBtn}
                >
                  <ThreeDotsIcon size={18} color="#838383" />
                </Pressable>

                {openMenuId === account.id && (
                  <View style={s.inlinePopover}>
                    {!account.isDefault && (
                      <TouchableOpacity
                        style={s.popoverItem}
                        activeOpacity={0.7}
                        onPress={() => {
                          handleSetDefault(account.id);
                          setOpenMenuId(null);
                        }}
                      >
                        <Text style={s.popoverItemText}>Set as default account</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={s.popoverItem}
                      activeOpacity={0.7}
                      onPress={() => {
                        handleDeleteAccount(account.id);
                        setOpenMenuId(null);
                      }}
                    >
                      <Text style={[s.popoverItemText, s.popoverItemDelete]}>Delete account</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={s.addNewAccountLink}
          activeOpacity={0.85}
          onPress={() => navigateTo("add_account")}
        >
          <PlusIcon size={20} color="#1B17B3" />
          <Text style={s.addNewAccountLinkText}>Add new account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

/* ══════════════════════════════════════════════════════════
   STYLES
   ══════════════════════════════════════════════════════════ */

const s = StyleSheet.create({
  /* ── Modal shell ── */
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 15,
    maxHeight: SCREEN_HEIGHT * 0.88,
  },
  sheetScrollView: {
    flexShrink: 1,
  },
  noAccountsSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 15,
    paddingBottom: Platform.OS === "ios" ? 30 : 14,
    paddingHorizontal: 18,
  },
  sheetScroll: {
    paddingHorizontal: 18,
    paddingBottom: Platform.OS === "ios" ? 30 : 14,
  },
  stateContainer: {
    paddingTop: 4,
  },

  /* ── Sheet header ── */
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14, 
  },
  headerLeftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sheetTitle: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 20,
    lineHeight: 23,
    letterSpacing: -0.4,
    color: "#0C0C0C",
  },

  /* ── Sub header ── */
  subHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectLabel: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 12,
    lineHeight: 15,
    color: "#838383",
    letterSpacing: -0.24,
  },
  manageLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  manageLink: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    lineHeight: 16,
    color: "#1B17B3",
    letterSpacing: -0.28,
  },

  /* ── Account list container card ── */
  accountsCardContainer: {
    backgroundColor: "#F8F8F8",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
  },
  accountsCardDivider: {
    height: 1,
    backgroundColor: "#ECECEC",
  },
  accountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  accountRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  accountInfo: {
    gap: 2,
  },
  accountBankName: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 14,
    color: "#0C0C0C",
    letterSpacing: -0.28,
  },
  accountNumberMask: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 12,
    color: "#838383",
    letterSpacing: -0.24,
  },
  accountRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  defaultBadge: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 11,
    color: "#838383",
    backgroundColor: "#F2F2F2",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: "hidden",
  },

  /* ── Radio ── */
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.125,
    borderColor: "#838383",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: "#1B17B3",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#1B17B3",
  },

  /* ── Bank logo ── */
  bankLogo: {
    alignItems: "center",
    justifyContent: "center",
  },
  bankLogoText: {
    fontFamily: "Ubuntu_700Bold",
    color: "#FFFFFF",
  },

  /* ── Amount input row ── */
  amountInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E4E4E4",
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  amountPrefix: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 16,
    color: "#0C0C0C",
    marginRight: 6,
  },
  amountInput: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    color: "#0C0C0C",
    flex: 1,
    padding: 0,
  },
  amountMinLabel: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 12,
    color: "#838383",
  },

  /* ── Error ── */
  errorText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 12,
    color: "#FF3B30",
    marginBottom: 8,
  },

  /* ── Balance info ── */
  balanceInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  balanceInfoLabel: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 13,
    color: "#838383",
    letterSpacing: -0.26,
  },
  balanceInfoValue: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 13,
    color: "#0C0C0C",
    letterSpacing: -0.26,
  },

  /* ── Limits ── */
  limitsBlock: {
    marginTop: 12,
    marginBottom: 20,
    gap: 2,
  },
  limitText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 11,
    color: "#838383",
    lineHeight: 16,
  },

  /* ── Withdraw button ── */
  withdrawBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1B17B3",
    alignItems: "center",
    justifyContent: "center",
  },
  withdrawBtnText: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 16,
    color: "#FFFFFF",
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  emptyBody: {
    alignItems: "center",
    gap: 11,
  },
  emptyIconCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
   
  },
  emptyTitle: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 20,
    color: "#0C0C0C",
    letterSpacing: -0.36,
  },
  emptySubtitle: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 15,
    color: "#838383",
    textAlign: "center",
    lineHeight: 20,
    letterSpacing: -0.100,
  },
  addBeneficiaryBtn: {
    width: "100%",
    height: 56,
    borderRadius: 22,
    backgroundColor: "#1B17B3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 14,
  },
  addBeneficiaryBtnText: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 15,
    color: "#FFFFFF",
    
  },

  /* ── Add account ── */
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E7F1FF",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  infoBannerText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 13,
    color: "#1B17B3",
    flex: 1,
    letterSpacing: -0.26,
  },

  /* Dropdown */
  dropdownTrigger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E4E4E4",
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  dropdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dropdownText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    color: "#0C0C0C",
  },
  dropdownPlaceholder: {
    color: "#BEBEBE",
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: "#E4E4E4",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
    overflow: "hidden",
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F8F8F8",
  },
  dropdownItemText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    color: "#0C0C0C",
  },

  /* Input row (account number) */
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E4E4E4",
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
    marginBottom: 12,
    gap: 10,
  },
  inputField: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    color: "#0C0C0C",
    flex: 1,
    padding: 0,
  },

  /* ── Manage accounts ── */
  manageActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  threeDotsBtn: {
    padding: 4,
  },
  addNewAccountLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    marginTop: -3,
  },
  addNewAccountLinkText: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 14,
    color: "#1B17B3",
  },

  /* ── Add Account View (Figma-matched) ── */
  addAccContent: {
    gap: 18, 
  },
  addAccSection: {
    marginBottom: 0,
    gap: 6,
  },
  addAccInfoBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 11,
    height: 35,
    backgroundColor: "#E7F1FF",
    borderRadius: 16,
  },
  addAccInfoText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: -0.28,
    color: "#1B17B3",
    flex: 1,
  },
  addAccFieldRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 12,
    height: 45,
    backgroundColor: "#F2F2F2",
    borderRadius: 30,
  },
  addAccFieldText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 13,
    lineHeight: 15,
    letterSpacing: -0.26,
    color: "#0C0C0C",
  },
  addAccFieldPlaceholder: {
    color: "#838383",
  },
  addAccFieldInput: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 13,
    letterSpacing: -0.26,
    color: "#0C0C0C",
    flex: 1,
    padding: 0,
  },
  addAccAmountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    height: 56,
    borderWidth: 1,
    borderColor: "#E4E4E4",
    borderRadius: 22,
  },
  addAccAmountLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  addAccAmountPrefix: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    lineHeight: 16,
    letterSpacing: -0.28,
    color: "#0C0C0C",
  },
  addAccAmountInput: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    letterSpacing: -0.28,
    color: "#434343",
    flex: 1,
    padding: 0,
  },
  addAccMinLabel: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    lineHeight: 16,
    letterSpacing: -0.28,
    color: "#838383",
  },
  addAccBalanceCard: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 11,
    backgroundColor: "#F2F2F2",
    borderRadius: 16,
  },
  addAccBalanceRows: {
    gap: 6,
  },
  addAccBalanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addAccSmallText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: -0.24,
    color: "#434343",
  },
  addAccLargeText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    lineHeight: 16,
    letterSpacing: -0.28,
    color: "#434343",
  },
  addAccDivider: {
    height: 1,
    backgroundColor: "#838383",
    opacity: 0.2,
  },
  addAccLimitsText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: -0.28,
    color: "#434343",
  },
  addAccWithdrawBtn: {
    height: 56,
    borderRadius: 22,
    backgroundColor: "#1B17B3",
    alignItems: "center",
    justifyContent: "center",
  },
  addAccWithdrawBtnText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    lineHeight: 16,
    letterSpacing: -0.28,
    color: "#FFFFFF",
  },
  /* ── Active accounts list (separate cards matching Figma) ── */
  activeAccountCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    height: 56,
    backgroundColor: "#F2F2F2",
    borderRadius: 22,
    alignSelf: "stretch",
  },
  activeAccountCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  activeAccountLogoContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    overflow: "hidden",
  },
  activeAccountTextContainer: {
    justifyContent: "center",
    gap: 4,
  },
  activeAccountBankName: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    lineHeight: 16,
    color: "#0C0C0C",
    letterSpacing: -0.28,
  },
  activeAccountAccountNumberMask: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 12,
    lineHeight: 14,
    color: "#434343",
    letterSpacing: -0.24,
  },
  activeAccountCardRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  activeAccountDefaultBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    height: 32,
    backgroundColor: "#E4E4E4",
    borderRadius: 16,
  },
  activeAccountDefaultText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 12,
    lineHeight: 16,
    color: "#0C0C0C",
    letterSpacing: -0.24,
  },
  inlinePopover: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: -15,
    width: 167,
    backgroundColor: "#FFFFFF",
    borderWidth: 0.6,
    borderColor: "#E4E4E4",
    borderRadius: 16,
    paddingVertical: 4,
    shadowColor: "#C7C7C7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 11,
    elevation: 6,
    zIndex: 100,
  },
  popoverItem: {
    height: 36,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  popoverItemText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    color: "#191919",
    letterSpacing: -0.28,
  },
  popoverItemDelete: {
    color: "#FF3B3B",
  },
});
