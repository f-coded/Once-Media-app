import React, { useState, useRef, useEffect } from "react";
import {
  BackHandler,
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
  onPinCreated: (pin: string) => void;
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

function PasswordIcon({ size = 28, color = "#1B17B3" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Path d="M25.6667 14C25.6667 9.60018 25.6667 7.4003 24.2999 6.03346C22.9331 4.66663 20.7332 4.66663 16.3334 4.66663H11.6667C7.26697 4.66663 5.06709 4.66663 3.70025 6.03346C2.33342 7.4003 2.33342 9.60018 2.33342 14C2.33342 18.3997 2.33342 20.5996 3.70025 21.9665C5.06709 23.3333 7.26697 23.3333 11.6667 23.3333H16.3334C20.7332 23.3333 22.9331 23.3333 24.2999 21.9665C25.6667 20.5996 25.6667 18.3997 25.6667 14Z" stroke={color} strokeWidth="1.75"/>
      <Path d="M14.0001 11.6666V16.3333M16.0212 12.8333L11.9798 15.1666M11.98 12.8333L16.0215 15.1666" stroke={color} strokeWidth="1.75" strokeLinecap="round"/>
      <Path d="M20.1456 11.6666V16.3333M22.1667 12.8333L18.1253 15.1666M18.1255 12.8333L22.167 15.1666" stroke={color} strokeWidth="1.75" strokeLinecap="round"/>
      <Path d="M7.85384 11.6666V16.3333M9.875 12.8333L5.83355 15.1666M5.83382 12.8333L9.87528 15.1666" stroke={color} strokeWidth="1.75" strokeLinecap="round"/>
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

  // Modal open/close animation
  const [anim] = useState(() => new Animated.Value(0));
  const [renderModal, setRenderModal] = useState(visible);

  // Per-step transition animation (matches WithdrawModal viewAnim)
  const [viewAnim] = useState(() => new Animated.Value(1));

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

  // Per-step transition: fade + slide-up on every step change
  useEffect(() => {
    viewAnim.setValue(0);
    Animated.timing(viewAnim, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [step]);

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

  /* ── Android hardware back — mirrors the visible back/close controls
        instead of exiting the app (same pattern as the profile-stack
        screens). Confirm step steps back to Create, matching its back
        arrow; every other step closes the flow, matching its X. ── */
  const backActionRef = useRef<() => void>(() => {});
  backActionRef.current = () => {
    if (step === "confirm") {
      setStep("create");
      setConfirmPin("");
      setErrorMessage("");
    } else {
      handleClose();
    }
  };

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      backActionRef.current();
      return true;
    });
    return () => sub.remove();
  }, [visible]);

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
    onPinCreated(createPin);
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
    <View style={[StyleSheet.absoluteFillObject, ps.modalRoot]} pointerEvents="box-none">
      <View style={ps.overlay}>
        {/* Blur backdrop */}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: backdropOpacity }]}>
          {Platform.OS === "web" ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.45)" }]} />
          ) : (
            <>
              <BlurView
                intensity={2} 
                tint="dark"
                experimentalBlurMethod="dimezisBlurView"
                style={StyleSheet.absoluteFill}
              />
              <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0, 0, 0, 0.55)" }]} />
            </>
          )}
          {isBottomSheet && (
            <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
          )}
        </Animated.View>

        {isBottomSheet ? (
          <Animated.View style={[ps.bottomSheet, { transform: [{ translateY: sheetTranslateY }] }]}>
            <Animated.View
              style={{
                opacity: viewAnim,
                transform: [
                  {
                    translateY: viewAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [16, 0],
                    }),
                  },
                ],
              }}
            >
              {step === "prompt" && (
                <PromptView onCreatePress={() => setStep("create")} onClose={handleClose} />
              )}
              {step === "success" && (
                <SuccessView onDone={handleDone} onClose={handleClose} />
              )}
            </Animated.View>
          </Animated.View>
        ) : (
          <Animated.View
            style={[ps.fullScreen, { paddingTop: insets.top, opacity: anim }]}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={{ flex: 1 }}
            >
              <Animated.View
                style={{
                  flex: 1,
                  opacity: viewAnim,
                  transform: [
                    {
                      translateY: viewAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [16, 0],
                      }),
                    },
                  ],
                }}
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
              </Animated.View>
            </KeyboardAvoidingView>
          </Animated.View>
        )}
      </View>
    </View>
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
        <PasswordIcon size={28} color="#1B17B3" />
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
        <TickDoubleIcon size={28} color="#1B17B3" />
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
  modalRoot: {
  zIndex: 1000,
  elevation: 1000,
},
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
