import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

/* ── Types ── */

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  isDefault: boolean;
}

type ModalView = "no_accounts" | "with_accounts" | "add_account" | "manage_accounts" | "enter_pin" | "success";

interface WithdrawModalProps {
  visible: boolean;
  balance: number;
  onClose: () => void;
  onConfirmWithdrawal: (amount: number, bankName: string, accountNumber: string) => void;
  correctPin: string;
}

/* ── Inline SVG Icons ── */

function CloseIcon({ size = 20, color = "#0C0C0C" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path d="M4.5 4.5L13.5 13.5M13.5 4.5L4.5 13.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function TickDoubleIcon({ size = 28, color = "#1B17B3" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Path d="M25.5459 7.7359C25.9194 8.78295 25.3956 9.49982 24.3815 10.206C23.5634 10.7757 22.5211 11.3929 21.4166 12.4482C20.3338 13.4827 19.2771 14.7287 18.338 15.9551C17.2 17.4412 16.1239 18.9934 15.1767 20.6097C14.8195 21.2219 14.1773 21.5924 13.4887 21.5832C12.8 21.5738 12.1674 21.1863 11.8256 20.5644C10.9521 18.9746 10.278 18.3468 9.96819 18.1213C9.10859 17.4956 8.1665 17.3874 8.1665 16.0224C8.1665 14.9055 9.03711 14.0002 10.111 14.0002C10.8796 14.031 11.5831 14.3602 12.1984 14.8081C12.5976 15.0987 13.0204 15.4829 13.4603 15.9888C13.9764 15.2261 14.5985 14.3462 15.2957 13.4356C16.3083 12.1133 17.5036 10.6947 18.7854 9.47001C20.0454 8.26615 21.5022 7.13927 23.0464 6.54346C24.0532 6.15498 25.1723 6.68884 25.5459 7.7359Z" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M5.17971 14.088C4.99486 14.0275 4.82778 13.9893 4.68144 13.9665C4.60844 13.955 4.54113 13.9475 4.47988 13.9428L4.31551 13.9363C3.22087 13.9363 2.3335 14.8493 2.3335 15.9755C2.3335 16.9947 3.06026 17.8392 4.0097 17.9905C4.0429 18.008 4.09676 18.0394 4.16991 18.0922C4.48569 18.3195 5.17278 18.9527 6.06317 20.5558C6.41149 21.183 7.05629 21.5737 7.7583 21.5832C8.23919 21.5896 8.69787 21.4161 9.05613 21.1078M17.5002 6.41663C15.9262 7.01746 14.4413 8.15384 13.157 9.36786C12.7085 9.79178 12.2705 10.2388 11.8467 10.6969" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
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

export function WithdrawModal({ visible, balance, onClose, onConfirmWithdrawal, correctPin }: WithdrawModalProps) {
  const insets = useSafeAreaInsets();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [view, setView] = useState<ModalView>("no_accounts");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const tempWithdrawal = useRef<{
    amount: number;
    bankName: string;
    accountNumber: string;
    isNewAccount: boolean;
    newAccountObj?: BankAccount;
  } | null>(null);

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
    setPinInput("");
    setPinError(false);
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

    // Store in ref for confirmation after PIN check
    tempWithdrawal.current = {
      amount: amt,
      bankName: newBankName,
      accountNumber: newAccountNumber,
      isNewAccount: true,
      newAccountObj: newAccount,
    };

    setNewBankName("");
    setNewAccountNumber("");
    setAmount("");
    setErrorMessage("");
    setPinInput("");
    setPinError(false);
    setView("enter_pin");
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

    // Store in ref for confirmation after PIN check
    tempWithdrawal.current = {
      amount: amt,
      bankName: selectedAccount.bankName,
      accountNumber: selectedAccount.accountNumber,
      isNewAccount: false,
    };

    setAmount("");
    setErrorMessage("");
    setPinInput("");
    setPinError(false);
    setView("enter_pin");
  };

  /* ── PIN Keypress and confirm handlers ── */
  const handlePinKeyPress = (val: string) => {
    setPinError(false);
    if (val === "backspace") {
      setPinInput((prev) => prev.slice(0, -1));
    } else {
      if (pinInput.length < 4) {
        setPinInput((prev) => prev + val);
      }
    }
  };

  const handlePinConfirm = () => {
    if (pinInput.length < 4) {
      setPinError(true);
      return;
    }

    if (pinInput === correctPin) {
      if (tempWithdrawal.current) {
        const { amount: amt, bankName, accountNumber, isNewAccount, newAccountObj } = tempWithdrawal.current;
        if (isNewAccount && newAccountObj) {
          // Commit the new account creation to our accounts list
          setAccounts((prev) => [...prev, newAccountObj]);
          setSelectedAccountId(newAccountObj.id);
        }
        onConfirmWithdrawal(amt, bankName, accountNumber);
      }
      setPinInput("");
      setPinError(false);
      setView("success");
    } else {
      setPinError(true);
      setPinInput("");
    }
  };

  const handleSuccessDone = () => {
    handleClose();
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
    outputRange: [SCREEN_HEIGHT * 0.88, 0],
  });

  const isCompactSheet = currentView === "no_accounts" || currentView === "success";
  const isPinSheet = currentView === "enter_pin";
  const sheetStyle = [
    isPinSheet 
      ? [s.pinSheet, { minHeight: 492 + insets.bottom, paddingBottom: insets.bottom }] 
      : [
          isCompactSheet ? s.noAccountsSheet : s.sheet,
          { paddingBottom: Math.max(16, insets.bottom) }
        ],
    { transform: [{ translateY: sheetTranslateY }] }
  ];

  return (
     <View 
      style={[StyleSheet.absoluteFillObject, s.modalRoot]} 
      pointerEvents="box-none"
    >
    
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: backdropOpacity }]}>
          {Platform.OS === "web" ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.45)" }]} />
          ) : (
            <>
              <BlurView
                intensity={3}
                tint="dark"
                experimentalBlurMethod="dimezisBlurView"
                style={StyleSheet.absoluteFill}
              />
              <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0, 0, 0, 0.55)" }]} />
            </>
          )}
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>

        <Animated.View style={[{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 999, elevation: 999 }, sheetStyle]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ width: "100%" }}
          >
            {currentView === "no_accounts" && (
              <NoAccountsView navigateTo={navigateTo} handleClose={handleClose} />
            )}
            {currentView === "enter_pin" && (
              <EnterPinView
                pin={pinInput}
                pinError={pinError}
                onKeyPress={handlePinKeyPress}
                onConfirm={handlePinConfirm}
                handleClose={handleClose}
              />
            )}
            {currentView === "success" && (
              <WithdrawalSuccessView
                onDone={handleSuccessDone}
                handleClose={handleClose}
              />
            )}
            {(currentView === "with_accounts" || currentView === "add_account" || currentView === "manage_accounts") && (
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

/* ── Enter PIN View (Bottom Sheet with custom numpad) ── */

interface EnterPinViewProps {
  pin: string;
  pinError: boolean;
  onKeyPress: (val: string) => void;
  onConfirm: () => void;
  handleClose: () => void;
}

function BackspaceIcon({ size = 22, color = "#0C0C0C" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 9L9 15M9 9L15 15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M7.686 2.792A2 2 0 0 1 9.172 2.1H19.5A2.5 2.5 0 0 1 22 4.6v14.8a2.5 2.5 0 0 1-2.5 2.5H9.172a2 2 0 0 1-1.486-.664l-5.32-5.936a2.5 2.5 0 0 1 0-3.364l5.32-5.344Z" stroke={color} strokeWidth="1.5" />
    </Svg>
  );
}

const EnterPinView = React.memo(({ pin, pinError, onKeyPress, onConfirm, handleClose }: EnterPinViewProps) => {
  return (
    <View style={{ position: "relative", width: "100%"}}>
      <View style={s.content}>
        <Text style={s.title}>Enter Pin</Text>

        <View style={s.nameImageContainer}>
          {[0, 1, 2, 3].map((i) => {
            const filled = i < pin.length;
            return (
              <View key={i} style={s.pinSlot}>
                <Text style={s.pinSlotText}>{filled ? "*" : " "}</Text>
              </View>
            );
          })}
        </View>

        <View style={s.pinErrorContainer}>
          {pinError ? (
            <Text style={s.pinErrorText}>Pin incorrect</Text>
          ) : (
            <Text style={s.pinErrorPlaceholder}> </Text>
          )}
        </View>

        <View style={s.keypad}>
          <View style={s.row}>
            {["1", "2", "3"].map((item) => (
              <TouchableOpacity key={item} style={s.key} activeOpacity={0.7} onPress={() => onKeyPress(item)}>
                <Text style={s.keyLabel}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={s.row}>
            {["4", "5", "6"].map((item) => (
              <TouchableOpacity key={item} style={s.key} activeOpacity={0.7} onPress={() => onKeyPress(item)}>
                <Text style={s.keyLabel}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={s.row}>
            {["7", "8", "9"].map((item) => (
              <TouchableOpacity key={item} style={s.key} activeOpacity={0.7} onPress={() => onKeyPress(item)}>
                <Text style={s.keyLabel}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={s.row}>
            <TouchableOpacity style={s.key} activeOpacity={0.7} onPress={() => onKeyPress("0")}>
              <Text style={s.keyLabel}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.key} activeOpacity={0.7} onPress={() => onKeyPress("backspace")}>
              <BackspaceIcon size={22} color="#0C0C0C" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={s.confirmButton} activeOpacity={0.85} onPress={onConfirm}>
          <Text style={s.confirmLabel}>Confirm</Text>
        </TouchableOpacity>
      </View>

      <Pressable style={s.closeButton} onPress={handleClose} hitSlop={12}>
        <CloseIcon size={24} color="#0C0C0C" />
      </Pressable>
    </View>
  );
});

/* ── Withdrawal Success View ── */

interface WithdrawalSuccessViewProps {
  onDone: () => void;
  handleClose: () => void;
}

const WithdrawalSuccessView = React.memo(({ onDone, handleClose }: WithdrawalSuccessViewProps) => (
  <View style={s.successContainer}>
    <Pressable style={s.successCloseBtn} onPress={handleClose} hitSlop={12}>
      <CloseIcon size={24} color="#4A4A4A" />
    </Pressable>

    <View style={s.successBody}>
      <View style={s.successIconCircle}>
        <TickDoubleIcon size={28} color="#1B17B3" />
      </View>
      <View style={s.successTextBlock}>
        <Text style={s.successTitle}>Withdrawal Successfully!</Text>
        <Text style={s.successSubtitle}>
          Your request is being processed and the funds should reflect in your account shortly.
        </Text>
      </View>
    </View>

    <TouchableOpacity style={s.successDoneBtn} activeOpacity={0.85} onPress={onDone}>
      <Text style={s.successDoneBtnText}>Done</Text>
    </TouchableOpacity>
  </View>
));

/* ══════════════════════════════════════════════════════════
   STYLES
   ══════════════════════════════════════════════════════════ */

const s = StyleSheet.create({
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
    lineHeight: 16,
    color: "#838383",
    letterSpacing: -0.28,
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

  /* ── Add Account View ── */
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
  /* ── Active accounts list ── */
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

  /* ── Enter PIN Sheet ── */
  pinSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    minHeight: 492,
    width: "100%",
  },
  content: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 30,
    width: "100%",
  },
  title: {
    color: "#0C0C0C",
    fontFamily: "Ubuntu_700Bold",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.32,
    lineHeight: 21.6,
    position: "relative",
  },
  nameImageContainer: {
    height: 56,
    width: 196,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderWidth: 1.2,
    borderColor: "#efefef",
    borderRadius: 20,
    backgroundColor: "#fcfcfcdc",
    gap: 8,
  },
  pinSlot: {
    backgroundColor: "#ffffff",
    borderWidth: .5,
    borderColor: "#efefef",
    borderRadius: 12,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  pinSlotText: {
    fontFamily: "Ubuntu_700Bold",
    fontSize: 22,
    color: "#0C0C0C",
  },
  pinErrorContainer: {
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  pinErrorText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 13,
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: -4,
  },
  keypad: {
    alignItems: "stretch",
    backgroundColor: "#fcfcfc",
    borderWidth: 0.5,
    borderColor: "#efefef",
    borderRadius: 30,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: 8,
    position: "relative",
    width: "100%",
  },
  row: {
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "row",
    gap: 8,
    position: "relative",
    width: "100%",
  },
  key: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 0.5,
    borderColor: "#efefef",
    borderRadius: 20,
    display: "flex",
    flex: 1,
    height: 56,
    justifyContent: "center",
    position: "relative",
  },
  keyLabel: {
    color: "#0C0C0C",
    fontFamily: "Ubuntu_700Bold",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.32,
    lineHeight: 21.6,
  },
  confirmButton: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "#1B17B3",
    borderRadius: 22,
    display: "flex",
    height: 56,
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    position: "relative",
    width: "100%",
  },
  confirmLabel: {
    color: "#ffffff",
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    fontWeight: "400",
    letterSpacing: -0.28,
  },
  closeButton: {
    display: "flex",
    height: 24,
    position: "absolute",
    right: 20,
    top: 20,
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  /* ── Modal shell ── */
  modalRoot: {
    zIndex: 999,
    elevation: 999,
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FCFCFC",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 15,
    maxHeight: SCREEN_HEIGHT * 0.88,
  },
  sheetScrollView: {
    flexShrink: 1,
  },
  noAccountsSheet: {
    backgroundColor: "#FCFCFC",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
    paddingHorizontal: 18,
  }, 

  /* ── Withdrawal Success ── */
  successContainer: {
      alignItems: "center",
    gap: 20,
  },
  successCloseBtn: {
    position: "absolute",
    top:  0,
    right: 0,
    zIndex: 10,
  },
  successBody: {
    alignItems: "center",
    gap: 11,
  },
  successTextBlock: {
    alignItems: "center",
    gap: 7,
  },
  successIconCircle: {
    width: 45,
    height: 45,
    borderRadius: 60,
    backgroundColor: "#E7F1FF",
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 18,
    letterSpacing: -0.36,
    color: "#262525",
    textAlign: "center",
  },
  successSubtitle: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 15,
    lineHeight: 21,
    letterSpacing: -0.3,
    color: "#838383",
    textAlign: "center",
    width: 316,
  },
  successDoneBtn: {
    width: "100%",
    height: 50,
    borderRadius: 30,
    backgroundColor: "#1B17B3",
    alignItems: "center",
    justifyContent: "center",
  },
  successDoneBtnText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 16,
    color: "#FFFFFF",
    letterSpacing: -0.32,
  },
});
