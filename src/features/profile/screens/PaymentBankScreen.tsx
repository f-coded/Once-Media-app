import React, { useRef, useEffect, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Pressable,
  ScrollView,
  TouchableOpacity,
  Platform,
  BackHandler,
  Easing,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import Svg, { Path, Circle } from "react-native-svg";
import {
  PanGestureHandler,
  State,
  PanGestureHandlerStateChangeEvent,
} from "react-native-gesture-handler";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  isDefault: boolean;
}

interface PaymentBankScreenProps {
  isActive?: boolean;
  onBackPress?: () => void;
}

// ── Icons (adapted from WithdrawModal) ────────────────────────────────────────

const IconBack = () => (
  <Svg width={14} height={11} viewBox="0 0 14 11" fill="none">
    <Path
      d="M12.5625 5.0625H0.5625M5.0625 9.5625L0.5625 5.0625L5.0625 0.5625"
      stroke="#262525"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const IconBuildings = () => (
  <Svg width={20.57} height={20.57} viewBox="0 0 24 24" fill="none">
    <Path d="M22 22L2 22" stroke="#0C0C0C" strokeWidth={1.5} strokeLinecap="round" />
    <Path
      d="M17 22V6C17 4.11438 17 3.17157 16.4142 2.58579C15.8284 2 14.8856 2 13 2H11C9.11438 2 8.17157 2 7.58579 2.58579C7 3.17157 7 4.11438 7 6V22"
      stroke="#0C0C0C"
      strokeWidth={1.5}
    />
    <Path
      d="M21 22V8.5C21 7.09554 21 6.39331 20.6629 5.88886C20.517 5.67048 20.3295 5.48298 20.1111 5.33706C19.6067 5 18.9045 5 17.5 5"
      stroke="#0C0C0C"
      strokeWidth={1.5}
    />
    <Path
      d="M3 22V8.5C3 7.09554 3 6.39331 3.33706 5.88886C3.48298 5.67048 3.67048 5.48298 3.88886 5.33706C4.39331 5 5.09554 5 6.5 5"
      stroke="#0C0C0C"
      strokeWidth={1.5}
    />
    <Path d="M12 22V19" stroke="#0C0C0C" strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M10 12H14" stroke="#0C0C0C" strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M5.5 11H7" stroke="#0C0C0C" strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M5.5 14H7" stroke="#0C0C0C" strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M17 11H18.5" stroke="#0C0C0C" strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M17 14H18.5" stroke="#0C0C0C" strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M5.5 8H7" stroke="#0C0C0C" strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M17 8H18.5" stroke="#0C0C0C" strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M10 15H14" stroke="#0C0C0C" strokeWidth={1.5} strokeLinecap="round" />
    <Circle cx={12} cy={7} r={2} stroke="#0C0C0C" strokeWidth={1.5} />
  </Svg>
);

const IconPlus = () => (
  <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
    <Path d="M8 3V13M3 8H13" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" />
  </Svg>
);

const IconThreeDots = () => (
  <Svg width={18} height={18} viewBox="0 0 16 16" fill="none">
    <Circle cx={3} cy={8} r={1.5} fill="#838383" />
    <Circle cx={8} cy={8} r={1.5} fill="#838383" />
    <Circle cx={13} cy={8} r={1.5} fill="#838383" />
  </Svg>
);

const IconClose = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke="#262525"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── Bank logo options ─────────────────────────────────────────────────────────

const BANK_OPTIONS = [
  { name: "OPay", color: "#1DC45E", initials: "OP" },
  { name: "Moniepoint MFB", color: "#1B17B3", initials: "MP" },
  { name: "Access Bank", color: "#F47920", initials: "AB" },
  { name: "GTBank", color: "#E35205", initials: "GT" },
  { name: "Zenith Bank", color: "#E2121B", initials: "ZB" },
  { name: "UBA", color: "#CE1126", initials: "UB" },
  { name: "First Bank", color: "#003366", initials: "FB" },
];

function BankLogo({ bankName, size = 40 }: { bankName: string; size?: number }) {
  const bank = BANK_OPTIONS.find((b) => b.name === bankName);
  const bg = bank?.color ?? "#838383";
  const initials = bank?.initials ?? bankName.substring(0, 2).toUpperCase();
  return (
    <View
      style={[
        pb.bankLogo,
        { width: size, height: size, borderRadius: 10, backgroundColor: bg },
      ]}
    >
      <Text style={[pb.bankLogoText, { fontSize: size * 0.32 }]}>{initials}</Text>
    </View>
  );
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_ACCOUNTS: BankAccount[] = [
  { id: "1", bankName: "OPay", accountNumber: "0235199782", isDefault: true },
  { id: "2", bankName: "Moniepoint MFB", accountNumber: "9876540919", isDefault: false },
];

// ── Empty state ───────────────────────────────────────────────────────────────

const EmptyState = ({ onAddPress }: { onAddPress: () => void }) => (
  <View style={pb.emptyContainer}>
    <View style={pb.emptyIconCircle}>
      <IconBuildings />
    </View>
    <Text style={pb.emptyTitle}>No payment bank yet</Text>
    <Text style={pb.emptySubtitle}>Click the button below to add a new bank.</Text>

    <TouchableOpacity style={pb.addBtn} activeOpacity={0.85} onPress={onAddPress}>
      <IconPlus />
      <Text style={pb.addBtnText}>Add new bank</Text>
    </TouchableOpacity>
  </View>
);

// ── Account card with popover menu ────────────────────────────────────────────

const AccountCard = ({
  account,
  openMenuId,
  setOpenMenuId,
  onSetDefault,
  onDelete,
  onViewDetails,
}: {
  account: BankAccount;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  onSetDefault: (id: string) => void;
  onDelete: (id: string) => void;
  onViewDetails: (account: BankAccount) => void;
}) => {
  const isMenuOpen = openMenuId === account.id;

  return (
    <Pressable
      style={[pb.accountCard, { zIndex: isMenuOpen ? 20 : 1 }]}
      onPress={() => onViewDetails(account)}
    >
      {/* Left: logo + info */}
      <View style={pb.accountCardLeft}>
        <BankLogo bankName={account.bankName} size={40} />
        <View style={pb.accountInfo}>
          <Text style={pb.accountBankName}>{account.bankName}</Text>
          <Text style={pb.accountNumber}>****{account.accountNumber.slice(-4)}</Text>
        </View>
      </View>

      {/* Right: default badge + three dots */}
      <View style={pb.accountCardRight}>
        {account.isDefault && (
          <View style={pb.defaultBadge}>
            <Text style={pb.defaultText}>Default</Text>
          </View>
        )}
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            setOpenMenuId(isMenuOpen ? null : account.id);
          }}
          hitSlop={10}
          style={pb.dotsBtn}
        >
          <IconThreeDots />
        </Pressable>

        {/* Popover */}
        {isMenuOpen && (
          <View style={pb.popover}>
            <TouchableOpacity
              style={pb.popoverItem}
              activeOpacity={0.7}
              onPress={() => {
                onViewDetails(account);
                setOpenMenuId(null);
              }}
            >
              <Text style={pb.popoverText}>View details</Text>
            </TouchableOpacity>

            {!account.isDefault && (
              <TouchableOpacity
                style={pb.popoverItem}
                activeOpacity={0.7}
                onPress={() => {
                  onSetDefault(account.id);
                  setOpenMenuId(null);
                }}
              >
                <Text style={pb.popoverText}>Set as default account</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={pb.popoverItem}
              activeOpacity={0.7}
              onPress={() => {
                onDelete(account.id);
                setOpenMenuId(null);
              }}
            >
              <Text style={[pb.popoverText, pb.popoverTextDelete]}>Delete account</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Pressable>
  );
};

// ── Accounts list state ───────────────────────────────────────────────────────

const AccountsList = ({
  accounts,
  openMenuId,
  setOpenMenuId,
  onSetDefault,
  onDelete,
  onAddPress,
  onViewDetails,
}: {
  accounts: BankAccount[];
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  onSetDefault: (id: string) => void;
  onDelete: (id: string) => void;
  onAddPress: () => void;
  onViewDetails: (account: BankAccount) => void;
}) => {
  return (
    <View style={pb.accountsContainer}>
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
          onSetDefault={onSetDefault}
          onDelete={onDelete}
          onViewDetails={onViewDetails}
        />
      ))}

      <TouchableOpacity style={pb.addNewLink} activeOpacity={0.8} onPress={onAddPress}>
        <Svg width={18} height={18} viewBox="0 0 16 16" fill="none">
          <Path d="M8 3V13M3 8H13" stroke="#1B17B3" strokeWidth={1.5} strokeLinecap="round" />
        </Svg>
        <Text style={pb.addNewLinkText}>Add new bank</Text>
      </TouchableOpacity>
    </View>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────

export const PaymentBankScreen = React.memo(
  function PaymentBankScreen({ isActive, onBackPress }: PaymentBankScreenProps) {
    const insets = useSafeAreaInsets();
    const screenX = useRef(new Animated.Value(SCREEN_WIDTH)).current;
    const NAV_BAR_HEIGHT = insets.top + 56;

    const [accounts, setAccounts] = useState<BankAccount[]>(MOCK_ACCOUNTS);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // Details sheet state
    const [showDetails, setShowDetails] = useState(false);
    const [detailsAccount, setDetailsAccount] = useState<BankAccount | null>(null);
    const detailsSheetAnim = useRef(new Animated.Value(0)).current;

    // Reset when screen becomes inactive
    useEffect(() => {
      if (!isActive) {
        setOpenMenuId(null);
        setShowDetails(false);
        setDetailsAccount(null);
        detailsSheetAnim.setValue(0);
      }
    }, [isActive]);

    // Slide animation
    useEffect(() => {
      if (isActive) {
        screenX.stopAnimation();
        Animated.timing(screenX, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      } else {
        screenX.stopAnimation();
        Animated.timing(screenX, {
          toValue: SCREEN_WIDTH,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
      }
    }, [isActive]);

    const handleBack = useCallback(() => {
      if (showDetails) {
        closeDetailsSheet();
        return;
      }
      if (openMenuId !== null) {
        setOpenMenuId(null);
        return;
      }
      onBackPress?.();
    }, [onBackPress, showDetails, openMenuId]);

    useEffect(() => {
      if (!isActive) return;
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        handleBack();
        return true;
      });
      return () => sub.remove();
    }, [isActive, handleBack]);

    const onSwipeStateChange = useCallback(
      (e: PanGestureHandlerStateChangeEvent) => {
        const { state, translationX, velocityX } = e.nativeEvent;
        if (state === State.END && (translationX > 28 || velocityX > 480)) handleBack();
      },
      [handleBack]
    );

    const handleSetDefault = useCallback((id: string) => {
      setAccounts((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    }, []);

    const handleDelete = useCallback((id: string) => {
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    }, []);

    const handleAddPress = useCallback(() => {
      // TODO: navigate to add bank screen
    }, []);

    const openDetailsSheet = useCallback((account: BankAccount) => {
      setDetailsAccount(account);
      setShowDetails(true);
      Animated.timing(detailsSheetAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, []);

    const closeDetailsSheet = useCallback(() => {
      Animated.timing(detailsSheetAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setShowDetails(false);
        setDetailsAccount(null);
      });
    }, []);

    // Interpolations
    const backdropOpacity = detailsSheetAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    const sheetTranslateY = detailsSheetAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [320, 0],
    });

    const hasAccounts = accounts.length > 0;

    return (
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [{ translateX: screenX }],
            backgroundColor: "#FFFFFF",
            zIndex: 155,
          },
        ]}
      >
        {/* Transparent overlay to close popover when clicking anywhere else */}
        {openMenuId !== null && (
          <Pressable
            style={[StyleSheet.absoluteFill, { zIndex: 10 }]}
            onPress={() => setOpenMenuId(null)}
          />
        )}

        <ScrollView
          contentContainerStyle={[
            pb.scrollContent,
            {
              paddingTop: NAV_BAR_HEIGHT + 20,
              paddingBottom: insets.bottom + 32,
              flexGrow: 1,
            },
          ]}
          style={{ zIndex: 20 }}   // 👈 add this — must be higher than overlay's zIndex: 10
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {hasAccounts ? (
            <AccountsList
              accounts={accounts}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              onSetDefault={handleSetDefault}
              onDelete={handleDelete}
              onAddPress={handleAddPress}
              onViewDetails={openDetailsSheet}
            />
          ) : (
            <EmptyState onAddPress={handleAddPress} />
          )}
        </ScrollView>

        {/* Nav bar */}
        <PanGestureHandler
          onHandlerStateChange={onSwipeStateChange}
          activeOffsetX={[-1000, 15]}
          failOffsetY={[-12, 12]}
        >
          <View style={[pb.navBar, { height: NAV_BAR_HEIGHT }]}>
            <BlurView
              intensity={Platform.OS === "ios" ? 80 : 30}
              tint="light"
              experimentalBlurMethod="dimezisBlurView"
              style={StyleSheet.absoluteFill}
            />
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(255,255,255,1)" }]}
            />
            <View style={[pb.navContent, { marginTop: insets.top }]}>
              <Pressable
                onPress={handleBack}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <IconBack />
              </Pressable>
              <Text style={pb.navTitle}>Payment Bank</Text>
            </View>
          </View>
        </PanGestureHandler>

        {/* ── View Details Bottom Sheet ── */}
        {showDetails && detailsAccount && (
          <View style={[StyleSheet.absoluteFill, { zIndex: 200 }]} pointerEvents="box-none">
            {/* Backdrop with blur & glassmorphism overlay */}
            <Pressable style={StyleSheet.absoluteFill} onPress={closeDetailsSheet}>
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  { opacity: backdropOpacity },
                ]}
              >
                <BlurView
                  intensity={Platform.OS === "ios" ? 25 : .5}
                  tint="dark"
                  experimentalBlurMethod="dimezisBlurView"
                  style={StyleSheet.absoluteFill}
                />
                <View
                  style={[
                    StyleSheet.absoluteFill,
                   { backgroundColor: `rgba(0, 0, 0, ${Platform.OS === "android" ? 0.4 : 0.82})` },
                  ]}
                />
              </Animated.View>
            </Pressable>

            {/* Bottom Sheet content container */}
            <Animated.View
              style={[
                pb.sheet,
                {
                  paddingBottom: insets.bottom + 24,
                  transform: [{ translateY: sheetTranslateY }],
                },
              ]}
            >
              <View style={pb.sheetHeader}>
                <Text style={pb.sheetTitle}>Payment Bank</Text>
                <Pressable
                  onPress={closeDetailsSheet}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <IconClose />
                </Pressable>
              </View>

              {/* Account Number Box */}
              <View style={pb.fieldBlock}>
                <Text style={pb.fieldLabel}>Account number</Text>
                <View style={pb.fieldBox}>
                  <Text style={pb.fieldText}>{detailsAccount.accountNumber}</Text>
                </View>
              </View>

              {/* Bank Name Box */}
              <View style={[pb.fieldBlock, { marginTop: 12 }]}>
                <Text style={pb.fieldLabel}>Bank name</Text>
                <View style={pb.fieldBox}>
                  <Text style={pb.fieldText}>{detailsAccount.bankName}</Text>
                </View>
              </View>

              {/* Owner Name Pill Card */}
              <View style={pb.ownerCard}>
                <Text style={pb.ownerText}>Kelechi Obi</Text>
              </View>
            </Animated.View>
          </View>
        )}
      </Animated.View>
    );
  },
  (prev, next) => prev.isActive === next.isActive
);

// ── Styles ────────────────────────────────────────────────────────────────────

const pb = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
  },

  /* ── Nav ── */
  navBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  navContent: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    paddingHorizontal: 18,
    gap: 11,
  },
  navTitle: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 16,
    color: "#262525",
    letterSpacing: -0.3,
  },

  /* ── Empty state ── */
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 11,
    paddingTop: 166,
  },
  emptyIconCircle: {
    width: 45,
    height: 45,
    borderRadius: 60,
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 18,
    color: "#0D0F16",
    letterSpacing: -0.36,
    marginBottom: 0,
  },
  emptySubtitle: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    color: "#838383",
    textAlign: "center",
    lineHeight: 20,
    letterSpacing: -0.1,
    marginBottom: 0,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: 30,
    backgroundColor: "#1B17B3",
    paddingHorizontal: 40,
    marginTop: "108%",
    alignSelf: "stretch",
  },
  addBtnText: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 15,
    color: "#FFFFFF",
  },

  /* ── Accounts list ── */
  accountsContainer: {
    gap: 10,
  },

  /* ── Account card ── */
  accountCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F2F2F2",
    borderRadius: 22,
    paddingVertical: 8,
    paddingHorizontal: 10,
    height: 60,
    overflow: "visible",
  },
  accountCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  accountInfo: {
    gap: 3,
  },
  accountBankName: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    color: "#0C0C0C",
    letterSpacing: -0.28,
  },
  accountNumber: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 12,
    color: "#434343",
    letterSpacing: -0.24,
  },
  accountCardRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    position: "relative",
  },

  /* ── Default badge ── */
  defaultBadge: {
    backgroundColor: "#E4E4E4",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  defaultText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 12,
    color: "#0C0C0C",
    letterSpacing: -0.24,
  },

  /* ── Three dots ── */
  dotsBtn: {
    padding: 6,
  },

  /* ── Popover ── */
  popover: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: 6,
    width: 180,
    backgroundColor: "#fffffff4",
    borderWidth: 0.6,
    borderColor: "#E4E4E4",
    borderRadius: 16,
    paddingVertical: 4,
    shadowColor: "#C7C7C7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
  popoverItem: {
    height: 40,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  popoverText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    color: "#191919",
    letterSpacing: -0.28,
  },
  popoverTextDelete: {
    color: "#FF3B3B",
  },

  /* ── Add new link ── */
  addNewLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    marginTop: 4,
  },
  addNewLinkText: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 14,
    color: "#1B17B3",
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

  /* ── Details Bottom Sheet ── */
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 18,
    paddingTop: 15,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  sheetTitle: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 16,
    color: "#1A1A1A",
    letterSpacing: -0.3,
  },
  fieldBlock: {
    flexDirection: "column",
  },
  fieldLabel: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 15,
    color: "#262525",
    marginBottom: 8,
  },
  fieldBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F8",
    borderRadius: 30,
    height: 45,
    paddingHorizontal: 16,
  },
  fieldText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    color: "rgba(0,0,0,0.91)",
  },
  ownerCard: {
    backgroundColor: "rgba(27, 21, 179, 0.08)",
    borderRadius: 30,
    height: 45,
    paddingHorizontal: 16,
    justifyContent: "center",
    marginTop: 16,
    alignSelf: "stretch",
  },
  ownerText: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 14,
    color: "#1B17B3",
  },
});