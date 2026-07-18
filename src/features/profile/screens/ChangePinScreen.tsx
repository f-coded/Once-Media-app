import React, { useRef, useEffect, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Pressable,
  ScrollView,
  TextInput,
  Platform,
  BackHandler,
  Easing,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import Svg, { Path } from "react-native-svg";
import {
  PanGestureHandler,  
  State,
  PanGestureHandlerStateChangeEvent,
} from "react-native-gesture-handler";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type Step = "old-pin" | "verify" | "new-pin";

interface ChangePinScreenProps {
  isActive?: boolean;
  onBackPress?: () => void;
}

// ── Eye icons (same as ChangePasswordScreen) ──────────────────────────────────

const EYE_OPEN_PATH_1 = "M10.75 5C8.67893 5 7 6.67893 7 8.75C7 10.8211 8.67893 12.5 10.75 12.5C12.8211 12.5 14.5 10.8211 14.5 8.75C14.5 6.67893 12.8211 5 10.75 5ZM8.5 8.75C8.5 7.50736 9.50736 6.5 10.75 6.5C11.9926 6.5 13 7.50736 13 8.75C13 9.99264 11.9926 11 10.75 11C9.50736 11 8.5 9.99264 8.5 8.75Z";

const EYE_OPEN_PATH_2 = "M10.75 0C6.23587 0 3.19529 2.7042 1.43057 4.99686L1.39874 5.0382C0.999638 5.55653 0.63206 6.03392 0.382687 6.5984C0.115645 7.20287 0 7.86169 0 8.75C0 9.63831 0.115645 10.2971 0.382687 10.9016C0.632062 11.4661 0.999641 11.9435 1.39875 12.4618L1.43057 12.5031C3.19529 14.7958 6.23587 17.5 10.75 17.5C15.2641 17.5 18.3047 14.7958 20.0694 12.5031L20.1012 12.4618C20.5004 11.9435 20.8679 11.4661 21.1173 10.9016C21.3844 10.2971 21.5 9.63831 21.5 8.75C21.5 7.86169 21.3844 7.20287 21.1173 6.5984C20.8679 6.03391 20.5004 5.55652 20.1012 5.03818L20.0694 4.99686C18.3047 2.7042 15.2641 0 10.75 0ZM2.61922 5.9118C4.24864 3.79492 6.90036 1.5 10.75 1.5C14.5996 1.5 17.2514 3.79492 18.8808 5.9118C19.3194 6.48159 19.5763 6.82206 19.7452 7.20455C19.9032 7.56202 20 7.99894 20 8.75C20 9.50107 19.9032 9.93798 19.7452 10.2955C19.5763 10.6779 19.3194 11.0184 18.8808 11.5882C17.2514 13.7051 14.5996 16 10.75 16C6.90036 16 4.24864 13.7051 2.61922 11.5882C2.18064 11.0184 1.92374 10.6779 1.75476 10.2955C1.59684 9.93798 1.5 9.50107 1.5 8.75C1.5 7.99894 1.59684 7.56202 1.75476 7.20455C1.92374 6.82206 2.18063 6.48159 2.61922 5.9118Z";

const EYE_CLOSED_PATH = "M2.68936 6.70456C2.52619 6.32384 2.08528 6.14747 1.70456 6.31064C1.32384 6.47381 1.14747 6.91472 1.31064 7.29544L2 7L2.68936 6.70456ZM15.5872 13.3287L15.3125 12.6308V12.6308L15.5872 13.3287ZM9.04145 13.7377C9.26736 13.3906 9.16904 12.926 8.82185 12.7001C8.47466 12.4742 8.01008 12.5725 7.78417 12.9197L8.41281 13.3287L9.04145 13.7377ZM6.37136 15.091C6.14545 15.4381 6.24377 15.9027 6.59096 16.1286C6.93815 16.3545 7.40273 16.2562 7.62864 15.909L7 15.5L6.37136 15.091ZM22.6894 7.29544C22.8525 6.91472 22.6762 6.47381 22.2954 6.31064C21.9147 6.14747 21.4738 6.32384 21.3106 6.70456L22 7L22.6894 7.29544ZM19 11.1288L18.4867 10.582V10.582L19 11.1288ZM19.9697 13.1592C20.2626 13.4521 20.7374 13.4521 21.0303 13.1592C21.3232 12.8663 21.3232 12.3914 21.0303 12.0985L20.5 12.6288L19.9697 13.1592ZM11.25 16.5C11.25 16.9142 11.5858 17.25 12 17.25C12.4142 17.25 12.75 16.9142 12.75 16.5H12H11.25ZM16.3714 15.909C16.5973 16.2562 17.0619 16.3545 17.409 16.1286C17.7562 15.9027 17.8545 15.4381 17.6286 15.091L17 15.5L16.3714 15.909ZM5.53033 11.6592C5.82322 11.3663 5.82322 10.8914 5.53033 10.5985C5.23744 10.3056 4.76256 10.3056 4.46967 10.5985L5 11.1288L5.53033 11.6592ZM2.96967 12.0985C2.67678 12.3914 2.67678 12.8663 2.96967 13.1592C3.26256 13.4521 3.73744 13.4521 4.03033 13.1592L3.5 12.6288L2.96967 12.0985ZM12 14V13.25C8.77611 13.25 6.46133 11.6446 4.9246 9.98966C4.15645 9.16243 3.59325 8.33284 3.22259 7.71014C3.03769 7.3995 2.90187 7.14232 2.8134 6.96537C2.76919 6.87696 2.73689 6.80875 2.71627 6.76411C2.70597 6.7418 2.69859 6.7254 2.69411 6.71533C2.69187 6.7103 2.69036 6.70684 2.68957 6.70503C2.68917 6.70413 2.68896 6.70363 2.68892 6.70355C2.68891 6.70351 2.68893 6.70357 2.68901 6.70374C2.68904 6.70382 2.68913 6.70403 2.68915 6.70407C2.68925 6.7043 2.68936 6.70456 2 7C1.31064 7.29544 1.31077 7.29575 1.31092 7.29609C1.31098 7.29624 1.31114 7.2966 1.31127 7.2969C1.31152 7.29749 1.31183 7.2982 1.31218 7.299C1.31287 7.30062 1.31376 7.30266 1.31483 7.30512C1.31698 7.31003 1.31988 7.31662 1.32353 7.32483C1.33083 7.34125 1.34115 7.36415 1.35453 7.39311C1.38127 7.45102 1.42026 7.5332 1.47176 7.63619C1.57469 7.84206 1.72794 8.13175 1.93366 8.47736C2.34425 9.16716 2.96855 10.0876 3.8254 11.0103C5.53867 12.8554 8.22389 14.75 12 14.75V14ZM15.5872 13.3287L15.3125 12.6308C14.3421 13.0128 13.2417 13.25 12 13.25V14V14.75C13.4382 14.75 14.7246 14.4742 15.8619 14.0266L15.5872 13.3287ZM8.41281 13.3287L7.78417 12.9197L6.37136 15.091L7 15.5L7.62864 15.909L9.04145 13.7377L8.41281 13.3287ZM22 7C21.3106 6.70456 21.3107 6.70441 21.3108 6.70427C21.3108 6.70423 21.3108 6.7041 21.3109 6.70402C21.3109 6.70388 21.311 6.70376 21.311 6.70368C21.3111 6.70352 21.3111 6.70349 21.3111 6.7036C21.311 6.7038 21.3107 6.70452 21.3101 6.70576C21.309 6.70823 21.307 6.71275 21.3041 6.71924C21.2983 6.73223 21.2889 6.75309 21.2758 6.78125C21.2495 6.83757 21.2086 6.92295 21.1526 7.03267C21.0406 7.25227 20.869 7.56831 20.6354 7.9432C20.1669 8.69516 19.4563 9.67197 18.4867 10.582L19 11.1288L19.5133 11.6757C20.6023 10.6535 21.3917 9.56587 21.9085 8.73646C22.1676 8.32068 22.36 7.9668 22.4889 7.71415C22.5533 7.58775 22.602 7.48643 22.6353 7.41507C22.6519 7.37939 22.6647 7.35118 22.6737 7.33104C22.6782 7.32097 22.6818 7.31292 22.6844 7.30696C22.6857 7.30398 22.6867 7.30153 22.6876 7.2996C22.688 7.29864 22.6883 7.29781 22.6886 7.29712C22.6888 7.29677 22.6889 7.29646 22.689 7.29618C22.6891 7.29604 22.6892 7.29585 22.6892 7.29578C22.6893 7.29561 22.6894 7.29544 22 7ZM19 11.1288L18.4867 10.582C17.6277 11.3882 16.5739 12.1343 15.3125 12.6308L15.5872 13.3287L15.8619 14.0266C17.3355 13.4466 18.5466 12.583 19.5133 11.6757L19 11.1288ZM19 11.1288L18.4697 11.6592L19.9697 13.1592L20.5 12.6288L21.0303 12.0985L19.5303 10.5985L19 11.1288ZM12 14H11.25V16.5H12H12.75V14H12ZM15.5872 13.3287L14.9586 13.7377L16.3714 15.909L17 15.5L17.6286 15.091L16.2158 12.9197L15.5872 13.3287ZM5 11.1288L4.46967 10.5985L2.96967 12.0985L3.5 12.6288L4.03033 13.1592L5.53033 11.6592L5 11.1288Z";

const IconEye = ({ visible }: { visible: boolean }) =>
  visible ? (
    <Svg width={20} height={20} viewBox="0 0 22 18" fill="none">
      <Path d={EYE_OPEN_PATH_1} fill="#1C274C" />
      <Path fillRule="evenodd" clipRule="evenodd" d={EYE_OPEN_PATH_2} fill="#1C274C" />
    </Svg>
  ) : (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d={EYE_CLOSED_PATH} fill="#1C274C" />
    </Svg>
  );

// ── Close icon for bottom sheet ───────────────────────────────────────────────

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

// ── Reusable pin field ────────────────────────────────────────────────────────

const PinField = ({
  label,
  placeholder,
  value,
  onChangeText,
  style,
  maxLength = 4,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (v: string) => void;
  style?: any;
  maxLength?: number;
}) => {
  const [secure, setSecure] = useState(true);
  return (
    <View style={[cp.fieldWrap, style]}>
      <Text style={cp.fieldLabel}>{label}</Text>
      <View style={cp.inputContainer}>
        <TextInput
          style={cp.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure}
          keyboardType="number-pad"
          maxLength={maxLength}
          placeholder={placeholder}
          placeholderTextColor="#B0B0B0"
        />
        <Pressable
          onPress={() => setSecure((v) => !v)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <IconEye visible={!secure} />
        </Pressable>
      </View>
    </View>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────

export const ChangePinScreen = React.memo(
  function ChangePinScreen({ isActive, onBackPress }: ChangePinScreenProps) {
    const insets = useSafeAreaInsets();
    const screenX = useRef(new Animated.Value(SCREEN_WIDTH)).current;
    const NAV_BAR_HEIGHT = insets.top + 56;

    // Step state
    const [step, setStep] = useState<Step>("old-pin");
    const [showSheet, setShowSheet] = useState(false);

    // Form fields
    const [oldPin, setOldPin] = useState("");
    const [newPin, setNewPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [verifyCode, setVerifyCode] = useState("");

    // Bottom sheet animation
    const sheetAnim = useRef(new Animated.Value(0)).current;

    // Reset state when screen becomes inactive
    useEffect(() => {
      if (!isActive) {
        setStep("old-pin");
        setShowSheet(false);
        sheetAnim.setValue(0);
        setOldPin("");
        setNewPin("");
        setConfirmPin("");
        setVerifyCode("");
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
      if (showSheet) {
        closeSheet();
        return;
      }
      // If on verify or new-pin, go back to the sheet or exit
      if (step === "new-pin") {
        setStep("verify");
        return;
      }
      onBackPress?.();
    }, [onBackPress, step, showSheet]);

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

    // ── Bottom sheet controls ──────────────────────────────────────────

    const openSheet = useCallback(() => {
      setShowSheet(true);
      Animated.timing(sheetAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, []);

    const closeSheet = useCallback(() => {
      Animated.timing(sheetAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => setShowSheet(false));
    }, []);

    const selectMethod = useCallback((method: "email" | "previous") => {
      closeSheet();
      setTimeout(() => {
        if (method === "email") {
          setVerifyCode("");
          setNewPin("");
          setConfirmPin("");
          setStep("verify");
        } else {
          setOldPin("");
          setNewPin("");
          setConfirmPin("");
          setStep("old-pin");
        }
      }, 260);
    }, []);

    const handleConfirmVerify = useCallback(() => {
      setNewPin("");
      setConfirmPin("");
      setStep("new-pin");
    }, []);

    // Sheet interpolations
    const backdropOpacity = sheetAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.45],
    });
    const sheetTranslateY = sheetAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [300, 0],
    });

    // ── Step content renderers ─────────────────────────────────────────

    const renderOldPinStep = () => (
      <>
        <Text style={cp.infoText}>
          IF changes! This will be set as your new transaction PIN to validate payment
        </Text>
        <PinField
          label="Old pin"
          placeholder="Enter old 4 digit pin"
          value={oldPin}
          onChangeText={setOldPin}
        />
        <PinField
          label="New pin"
          placeholder="Enter new 4 digit pin"
          value={newPin}
          onChangeText={setNewPin}
          style={cp.marginTop}
        />
        <PinField
          label="Confirm New password"
          placeholder="Re-enter new 4 digit pin"
          value={confirmPin}
          onChangeText={setConfirmPin}
          style={cp.marginTop}
        />

        <Pressable style={cp.anotherWayBtn} onPress={openSheet}>
          <Text style={cp.anotherWayText}>Try another way</Text>
        </Pressable>

        <View style={{ flex: 1 }} />

        <Pressable
          style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
          onPress={handleBack}
        >
          <View style={cp.btnBottom}>
            <Text style={cp.btnText}>Change password</Text>
          </View>
        </Pressable>
      </>
    );

    const renderVerifyStep = () => (
      <>
        <Text style={cp.infoText}>
          Enter 6 digit code sent to{" "}
          <Text style={cp.boldText}>ola...12@gmail.com</Text> to reset
          transaction pin.
        </Text>

        <PinField
          label="Enter verification code"
          placeholder="Enter 4-digit pin"
          value={verifyCode}
          onChangeText={setVerifyCode}
          maxLength={6}
        />

        <View style={cp.resendRow}>
          <Text style={cp.resendLabel}>Didn't receive code? </Text>
          <Pressable hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={cp.resendLink}>Resend</Text>
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
          onPress={handleConfirmVerify}
        >
          <View style={cp.btn}>
            <Text style={cp.btnText}>Confirm</Text>
          </View>
        </Pressable>

        <Pressable style={cp.anotherWayBtn} onPress={openSheet}>
          <Text style={cp.anotherWayText}>Try another way</Text>
        </Pressable>
      </>
    );

    const renderNewPinStep = () => (
      <>
        <PinField
          label="New pin"
          placeholder="Enter new 4 digit pin"
          value={newPin}
          onChangeText={setNewPin}
        />
        <PinField
          label="Confirm New password"
          placeholder="Re-enter new 4 digit pin"
          value={confirmPin}
          onChangeText={setConfirmPin}
          style={cp.marginTop}
        />

        <Pressable
          style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
          onPress={handleBack}
        >
          <View style={cp.btn}>
            <Text style={cp.btnText}>Confirm</Text>
          </View>
        </Pressable>

        <Pressable style={cp.anotherWayBtn} onPress={openSheet}>
          <Text style={cp.anotherWayText}>Try another way</Text>
        </Pressable>
      </>
    );

    return (
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { transform: [{ translateX: screenX }], backgroundColor: "#FFFFFF", zIndex: 150 },
        ]}
      >
        <ScrollView
          contentContainerStyle={[
            cp.scrollContent,
            {
              paddingTop: NAV_BAR_HEIGHT + 16,
              paddingBottom: insets.bottom + 24,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={true}
          alwaysBounceVertical={true}
          overScrollMode="always"
        >
          {step === "old-pin" && renderOldPinStep()}
          {step === "verify" && renderVerifyStep()}
          {step === "new-pin" && renderNewPinStep()}
        </ScrollView>

        {/* ── Nav bar ──────────────────────────────────────────────── */}
        <PanGestureHandler
          onHandlerStateChange={onSwipeStateChange}
          activeOffsetX={[-1000, 15]}
          failOffsetY={[-12, 12]}
        >
          <View style={[cp.navBar, { height: NAV_BAR_HEIGHT }]}>
            <BlurView
              intensity={Platform.OS === "ios" ? 80 : 30}
              tint="light"
              experimentalBlurMethod="dimezisBlurView"
              style={StyleSheet.absoluteFill}
            />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(255, 255, 255, 1)" }]} />
            <View style={[cp.navContent, { marginTop: insets.top }]}>
              <Pressable
                onPress={handleBack}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Svg width={14} height={11} viewBox="0 0 14 11" fill="none">
                  <Path
                    d="M12.5625 5.0625H0.5625M5.0625 9.5625L0.5625 5.0625L5.0625 0.5625"
                    stroke="#262525"
                    strokeWidth={1.25}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </Pressable>
              <Text style={cp.navTitle}>Reset Pin</Text>
            </View>
          </View>
        </PanGestureHandler>

        {/* ── Bottom sheet overlay ──────────────────────────────────── */}
        {showSheet && (
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            {/* Backdrop */}
            <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet}>
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  { opacity: backdropOpacity },
                ]}
              >
                <BlurView
                  intensity={Platform.OS === "ios" ? 25 : 50}
                  tint="dark"
                  experimentalBlurMethod="dimezisBlurView"
                  style={StyleSheet.absoluteFill}
                />
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: "rgba(0, 0, 0, 0.82)" },
                  ]}
                />
              </Animated.View>
            </Pressable>

            {/* Sheet */}
            <Animated.View
              style={[
                cp.sheet,
                {
                  paddingBottom: insets.bottom + 16,
                  transform: [{ translateY: sheetTranslateY }],
                },
              ]}
            >
              <View style={cp.sheetHeader}>
                <Text style={cp.sheetTitle}>Methods to Reset Transaction Pin</Text>
                <Pressable
                  onPress={closeSheet}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <IconClose />
                </Pressable>
              </View>

              <Pressable onPress={() => selectMethod("email")}>
                {({ pressed }) => (
                  <View style={[cp.sheetOption, pressed && { opacity: 0.7 }]}>
                    <Text style={cp.sheetOptionText}>Use Email/phone number</Text>
                  </View>
                )}
              </Pressable>

              <Pressable onPress={() => selectMethod("previous")}>
                {({ pressed }) => (
                  <View style={[cp.sheetOption, pressed && { opacity: 0.7 }]}>
                    <Text style={cp.sheetOptionText}>Use Previous Pin</Text>
                  </View>
                )}
              </Pressable>
            </Animated.View>
          </View>
        )}
      </Animated.View>
    );
  },
  (prev, next) => prev.isActive === next.isActive
);

// ── Styles ────────────────────────────────────────────────────────────────────

const cp = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
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
    justifyContent: "flex-start",
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
  infoText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    color: "#838383",
    lineHeight: 19,
    marginBottom: 12,
  },
  boldText: {
    fontFamily: "Ubuntu_500Medium",
    color: "#262525",
  },
  fieldWrap: {
    flexDirection: "column",
  },
  marginTop: {
    marginTop: 12,
  },
  fieldLabel: {
    fontFamily: "Ubuntu_500Regular",
    fontSize: 15,
    color: "#262525",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F8",
    borderRadius: 30,
    height: 45,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    color: "rgba(0,0,0,0.91)",
    padding: 0,
  },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  resendLabel: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 13,
    color: "#838383",
  },
  resendLink: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 13,
    color: "#1B17B3",
  },
  btn: {
    backgroundColor: "#1B17B3",
    borderRadius: 24,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  btnBottom: {
    backgroundColor: "#1B17B3",
    borderRadius: 24,
    height: 50,
    alignItems: "center",
    justifyContent: "center",

  },
  btnText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 16,
    color: "#FFFFFF",
  },
  anotherWayBtn: {
    alignItems: "flex-start",
    marginTop: 16,
    paddingVertical: 4,
  },
  anotherWayText: {
    fontFamily: "Ubuntu_700Bold",
    fontSize: 14,
    color: "#1B17B3",
  },

  /* ── Bottom sheet ────────────────────────────────────────── */
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
    marginBottom: 14,
  },
  sheetTitle: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 16,
    color: "#1A1A1A",
    letterSpacing: -0.3,
  },
  sheetOption: {
    backgroundColor: "rgba(242, 242, 242, 1)",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 18,
    marginBottom: 6,
  },
  sheetOptionText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 15,
    color: "#262525",
  },
});
