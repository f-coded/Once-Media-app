import React, { useState, useRef, useEffect } from "react";
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
  Animated,
  TouchableOpacity,
} from "react-native";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type PinStep = "prompt" | "create" | "confirm" | "success";

interface WithdrawalPinFlowProps {
  visible: boolean;
  onClose: () => void;
  onPinCreated: () => void;
}

/* ── Inline SVG Icons ── */

function CloseIcon({ size = 24, color = "#4A4A4A" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path d="M4.5 4.5L13.5 13.5M13.5 4.5L4.5 13.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function BackArrowIcon({ size = 24, color = "#363636" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 19L8 12L15 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function LockGridIcon({ size = 28, color = "#1B17B3" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Rect x="3" y="3" width="8" height="8" rx="2" stroke={color} strokeWidth="1.5" />
      <Rect x="17" y="3" width="8" height="8" rx="2" stroke={color} strokeWidth="1.5" />
      <Rect x="3" y="17" width="8" height="8" rx="2" stroke={color} strokeWidth="1.5" />
      <Circle cx="21" cy="21" r="3" stroke={color} strokeWidth="1.5" />
      <Circle cx="21" cy="21" r="1" fill={color} />
    </Svg>
  );
}

/* ── PIN Input Boxes ── */

function PinBoxes({ pin, length = 4 }: { pin: string; length?: number }) {
  return (
    <View style={ps.pinRow}>
      {Array.from({ length }, (_, i) => {
        const filled = i < pin.length;
        return (
          <View key={i} style={[ps.pinBox, filled && ps.pinBoxFilled]}>
            {filled && <Text style={ps.pinDot}>*</Text>}
          </View>
        );
      })}
    </View>
  );
}

/* ── Progress Dots ── */

function ProgressDots({ step }: { step: number }) {
  return (
    <View style={ps.progressRow}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={[
            ps.progressDot,
            i <= step ? ps.progressDotActive : ps.progressDotInactive,
          ]}
        />
      ))}
    </View>
  );
}

/* ══════════════════════════════════════════════════════════
   WithdrawalPinFlow — 4-step modal component
   ══════════════════════════════════════════════════════════ */

export function WithdrawalPinFlow({ visible, onClose, onPinCreated }: WithdrawalPinFlowProps) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<PinStep>("prompt");
  const [createPin, setCreatePin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const createInputRef = useRef<TextInput>(null);
  const confirmInputRef = useRef<TextInput>(null);

  // Animation
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
        // Reset state when fully closed
        setStep("prompt");
        setCreatePin("");
        setConfirmPin("");
        setErrorMessage("");
      });
    }
  }, [visible]);

  // Focus the hidden input when step changes
  useEffect(() => {
    if (step === "create") {
      setTimeout(() => createInputRef.current?.focus(), 100);
    } else if (step === "confirm") {
      setTimeout(() => confirmInputRef.current?.focus(), 100);
    }
  }, [step]);

  const handleClose = () => {
    onClose();
  };

  const handleCreatePin = () => {
    if (createPin.length < 4) {
      setErrorMessage("Please enter a 4-digit PIN.");
      return;
    }
    setErrorMessage("");
    setStep("confirm");
  };

  const handleConfirmPin = () => {
    if (confirmPin.length < 4) {
      setErrorMessage("Please enter a 4-digit PIN.");
      return;
    }
    if (confirmPin !== createPin) {
      setErrorMessage("PINs do not match. Please try again.");
      setConfirmPin("");
      return;
    }
    setErrorMessage("");
    setStep("success");
  };

  const handleDone = () => {
    onPinCreated();
    onClose();
  };

  if (!renderModal) return null;

  const backdropOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const sheetTranslateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_HEIGHT, 0],
  });

  const isBottomSheet = step === "prompt" || step === "success";

  return (
    <Modal
      animationType="none"
      transparent
      visible={visible || renderModal}
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={ps.overlay}>
        {/* Blur backdrop */}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: backdropOpacity }]}>
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
          {isBottomSheet && (
            <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
          )}
        </Animated.View>

        {isBottomSheet ? (
          /* ── Bottom Sheet (Prompt / Success) ── */
          <Animated.View style={[ps.bottomSheet, { transform: [{ translateY: sheetTranslateY }] }]}>
            {step === "prompt" && (
              <PromptView
                onCreatePress={() => setStep("create")}
                onClose={handleClose}
              />
            )}
            {step === "success" && (
              <SuccessView onDone={handleDone} onClose={handleClose} />
            )}
          </Animated.View>
        ) : (
          /* ── Full Screen (Create / Confirm) ── */
          <Animated.View
            style={[
              ps.fullScreen,
              {
                paddingTop: insets.top,
                opacity: anim,
              },
            ]}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={{ flex: 1 }}
            >
              {step === "create" && (
                <CreatePinView
                  pin={createPin}
                  setPin={(t) => { setCreatePin(t); setErrorMessage(""); }}
                  errorMessage={errorMessage}
                  onBack={handleClose}
                  onCreatePress={handleCreatePin}
                  inputRef={createInputRef}
                />
              )}
              {step === "confirm" && (
                <ConfirmPinView
                  pin={confirmPin}
                  setPin={(t) => { setConfirmPin(t); setErrorMessage(""); }}
                  errorMessage={errorMessage}
                  onBack={() => { setStep("create"); setConfirmPin(""); setErrorMessage(""); }}
                  onConfirmPress={handleConfirmPin}
                  inputRef={confirmInputRef}
                />
              )}
            </KeyboardAvoidingView>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}

/* ══════════════════════════════════════════════════════════
   Step Views
   ══════════════════════════════════════════════════════════ */

/* ── Prompt View (Bottom Sheet) ── */
const PromptView = React.memo(({ onCreatePress, onClose }: { onCreatePress: () => void; onClose: () => void }) => (
  <View style={ps.promptContainer}>
    {/* Close button (absolute top-right) */}
    <Pressable style={ps.promptClose} onPress={onClose} hitSlop={12}>
      <CloseIcon size={24} color="#4A4A4A" />
    </Pressable>

    <View style={ps.promptBody}>
      <View style={ps.promptIconCircle}>
        <LockGridIcon size={28} color="#1B17B3" />
      </View>
      <Text style={ps.promptTitle}>Create Your Withdrawal PIN</Text>
      <Text style={ps.promptSubtitle}>
        {"You're one step away from your funds! To keep your account safe, please create a 4-digit PIN to authorize this and all future withdrawals."}
      </Text>
    </View>

    <TouchableOpacity style={ps.primaryBtn} activeOpacity={0.85} onPress={onCreatePress}>
      <Text style={ps.primaryBtnText}>Create Pin</Text>
    </TouchableOpacity>
  </View>
));

/* ── Success View (Bottom Sheet) ── */
const SuccessView = React.memo(({ onDone, onClose }: { onDone: () => void; onClose: () => void }) => (
  <View style={ps.promptContainer}>
    <Pressable style={ps.promptClose} onPress={onClose} hitSlop={12}>
      <CloseIcon size={24} color="#4A4A4A" />
    </Pressable>

    <View style={ps.promptBody}>
      <View style={ps.promptIconCircle}>
        <LockGridIcon size={28} color="#1B17B3" />
      </View>
      <Text style={ps.promptTitle}>PIN Created Successfully!</Text>
      <Text style={ps.promptSubtitle}>
        {"You've successfully secured your transactions.\nYou're now officially ready to cash out your earnings."}
      </Text>
    </View>

    <TouchableOpacity style={ps.primaryBtn} activeOpacity={0.85} onPress={onDone}>
      <Text style={ps.primaryBtnText}>Done</Text>
    </TouchableOpacity>
  </View>
));

/* ── Create PIN View (Full Screen) ── */
interface PinViewProps {
  pin: string;
  setPin: (val: string) => void;
  errorMessage: string;
  onBack: () => void;
  onCreatePress?: () => void;
  onConfirmPress?: () => void;
  inputRef: React.RefObject<TextInput | null>;
}

const CreatePinView = React.memo(({ pin, setPin, errorMessage, onBack, onCreatePress, inputRef }: PinViewProps) => (
  <View style={ps.fullContent}>
    {/* Header row */}
    <View style={ps.fullHeader}>
      <Pressable onPress={onBack} hitSlop={12}>
        <BackArrowIcon />
      </Pressable>
    </View>

    {/* Title block */}
    <View style={ps.titleBlock}>
      <Text style={ps.fullTitle}>Create Your Withdrawal PIN</Text>
      <Text style={ps.fullSubtitle}>
        please create a 4-digit PIN to authorize this and all future withdrawals.
      </Text>
    </View>

    {/* PIN input section */}
    <View style={ps.pinSection}>
      <Text style={ps.pinLabel}>Enter your 4 digit pin</Text>
      <Pressable onPress={() => inputRef.current?.focus()}>
        <PinBoxes pin={pin} />
      </Pressable>
      {/* Hidden TextInput */}
      <TextInput
        ref={inputRef}
        style={ps.hiddenInput}
        value={pin}
        onChangeText={(t) => setPin(t.replace(/[^0-9]/g, "").slice(0, 4))}
        keyboardType="numeric"
        maxLength={4}
        secureTextEntry
        autoFocus
      />
      {errorMessage ? <Text style={ps.errorText}>{errorMessage}</Text> : null}
    </View>

    {/* Button */}
    <TouchableOpacity style={ps.fullBtn} activeOpacity={0.85} onPress={onCreatePress}>
      <Text style={ps.primaryBtnText}>Create Pin</Text>
    </TouchableOpacity>
  </View>
));

/* ── Confirm PIN View (Full Screen) ── */
const ConfirmPinView = React.memo(({ pin, setPin, errorMessage, onBack, onConfirmPress, inputRef }: PinViewProps) => (
  <View style={ps.fullContent}>
    {/* Header row */}
    <View style={ps.fullHeader}>
      <Pressable onPress={onBack} hitSlop={12}>
        <BackArrowIcon />
      </Pressable>
      <ProgressDots step={1} />
    </View>

    {/* Title block */}
    <View style={ps.titleBlock}>
      <Text style={ps.fullTitle}>Confirm Withdrawal PIN</Text>
      <Text style={ps.fullSubtitle}>
        Just to be sure! Please re-enter the 4-digit PIN you just created.
      </Text>
    </View>

    {/* PIN input section */}
    <View style={ps.pinSection}>
      <Text style={ps.pinLabel}>Re-enter your 4 digit pin</Text>
      <Pressable onPress={() => inputRef.current?.focus()}>
        <PinBoxes pin={pin} />
      </Pressable>
      {/* Hidden TextInput */}
      <TextInput
        ref={inputRef}
        style={ps.hiddenInput}
        value={pin}
        onChangeText={(t) => setPin(t.replace(/[^0-9]/g, "").slice(0, 4))}
        keyboardType="numeric"
        maxLength={4}
        secureTextEntry
        autoFocus
      />
      {errorMessage ? <Text style={ps.errorText}>{errorMessage}</Text> : null}
    </View>

    {/* Button */}
    <TouchableOpacity style={ps.fullBtn} activeOpacity={0.85} onPress={onConfirmPress}>
      <Text style={ps.primaryBtnText}>Confirm pin</Text>
    </TouchableOpacity>
  </View>
));

/* ══════════════════════════════════════════════════════════
   STYLES
   ══════════════════════════════════════════════════════════ */

const ps = StyleSheet.create({
  /* ── Modal shell ── */
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.01)",
    justifyContent: "flex-end",
  },

  /* ── Bottom Sheet (Prompt + Success) ── */
  bottomSheet: {
    backgroundColor: "#FCFCFC",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  promptContainer: {
    alignItems: "center",
    gap: 20,
  },
  promptClose: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 10,
  },
  promptBody: {
    alignItems: "center",
    gap: 11,
  },
  promptIconCircle: {
    width: 45,
    height: 45,
    borderRadius: 60,
    backgroundColor: "#E7F1FF",
    alignItems: "center",
    justifyContent: "center",
  },
  promptTitle: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 18,
    letterSpacing: -0.36,
    color: "#262525",
    textAlign: "center",
  },
  promptSubtitle: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 15,
    lineHeight: 21,
    letterSpacing: -0.3,
    color: "#838383",
    textAlign: "center",
    maxWidth: 316,
  },

  /* ── Primary Button (shared) ── */
  primaryBtn: {
    width: "100%",
    height: 50,
    borderRadius: 30,
    backgroundColor: "#1B17B3",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 16,
    letterSpacing: -0.32,
    color: "#FFFFFF",
  },

  /* ── Full Screen (Create + Confirm) ── */
  fullScreen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  fullContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  fullHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20,
    marginBottom: 24,
  },
  fullTitle: {
    fontFamily: "Ubuntu_700Bold",
    fontSize: 22,
    letterSpacing: -0.44,
    color: "#0C0C0C",
  },
  fullSubtitle: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: -0.28,
    color: "#4A4A4A",
    maxWidth: 335,
  },
  titleBlock: {
    gap: 4,
    marginBottom: 16,
  },

  /* ── PIN Input ── */
  pinSection: {
    gap: 6,
    marginBottom: 16,
  },
  pinLabel: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: -0.28,
    color: "#0C0C0C",
  },
  pinRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    height: 45,
    width: 184,
    backgroundColor: "#F2F2F2",
    borderRadius: 20,
    gap: 8,
  },
  pinBox: {
    width: 36,
    height: 36,
    backgroundColor: "#FCFCFC",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pinBoxFilled: {
    backgroundColor: "#FCFCFC",
  },
  pinDot: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 16,
    color: "#4A4A4A",
    lineHeight: 18,
    textAlign: "center",
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 1,
    height: 1,
  },

  /* ── Full Screen Button ── */
  fullBtn: {
    width: "100%",
    height: 50,
    borderRadius: 30,
    backgroundColor: "#1B17B3",
    alignItems: "center",
    justifyContent: "center",
  },

  /* ── Progress Dots ── */
  progressRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  progressDot: {
    width: 20,
    height: 5,
    borderRadius: 3,
  },
  progressDotActive: {
    backgroundColor: "#1B17B3",
  },
  progressDotInactive: {
    backgroundColor: "#E4E4E4",
  },

  /* ── Error ── */
  errorText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 12,
    color: "#FF3B30",
    marginTop: 4,
  },
});
