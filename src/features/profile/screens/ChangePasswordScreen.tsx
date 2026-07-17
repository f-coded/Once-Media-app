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

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ChangePasswordScreenProps {
  isActive?: boolean;
  onBackPress?: () => void;
}

const IconEye = ({ visible }: { visible: boolean }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    {visible ? (
      <>
        <Path
          d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
          stroke="#9B9B9B"
          strokeWidth={1.5}
        />
        <Path
          d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
          stroke="#9B9B9B"
          strokeWidth={1.5}
        />
      </>
    ) : (
      <>
        <Path
          d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
          stroke="#9B9B9B"
          strokeWidth={1.5}
        />
        <Path
          d="M2 2L22 22"
          stroke="#9B9B9B"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <Path
          d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
          stroke="#9B9B9B"
          strokeWidth={1.5}
        />
      </>
    )}
  </Svg>
);

const PasswordField = ({
  label,
  value,
  onChangeText,
  style,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  style?: any;
}) => {
  const [secure, setSecure] = useState(true);
  return (
    <View style={[pw.fieldWrap, style]}>
      <Text style={pw.fieldLabel}>{label}</Text>
      <View style={pw.inputContainer}>
        <TextInput
          style={pw.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure}
          placeholderTextColor="#B0B0B0"
        />
        <Pressable
          onPress={() => setSecure((v) => !v)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <IconEye visible={!secure} />
        </Pressable>
      </View>
    </View>
  );
};

export const ChangePasswordScreen = React.memo(
  function ChangePasswordScreen({ isActive, onBackPress }: ChangePasswordScreenProps) {
    const insets = useSafeAreaInsets();
    const screenX = useRef(new Animated.Value(SCREEN_WIDTH)).current;
    const NAV_BAR_HEIGHT = insets.top + 56;

    const [oldPw, setOldPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");

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
    onBackPress?.();
  }, [onBackPress]);

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

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { transform: [{ translateX: screenX }], backgroundColor: "#FFFFFF", zIndex: 140 },
      ]}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: NAV_BAR_HEIGHT + 16,
          paddingBottom: insets.bottom + 16,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={true}
        alwaysBounceVertical={true}
        overScrollMode="always"
      >
        <PasswordField label="Old password" value={oldPw} onChangeText={setOldPw} />
        <PasswordField
          label="New password"
          value={newPw}
          onChangeText={setNewPw}
          style={pw.marginTop}
        />
        <PasswordField
          label="Confirm new password"
          value={confirmPw}
          onChangeText={setConfirmPw}
          style={pw.marginTop}
        />

        <Pressable
          style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
          onPress={handleBack}
        >
          <View style={pw.btn}>
            <Text style={pw.btnText}>Change password</Text>
          </View>
        </Pressable>
      </ScrollView>

      {/* Nav */}
      <PanGestureHandler
        onHandlerStateChange={onSwipeStateChange}
        activeOffsetX={[-1000, 15]}
        failOffsetY={[-12, 12]}
      >
        <View style={[pw.navBar, { height: NAV_BAR_HEIGHT }]}>
          <BlurView
            intensity={Platform.OS === "ios" ? 80 : 30}
            tint="light"
            experimentalBlurMethod="dimezisBlurView"
            style={StyleSheet.absoluteFill}
          />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(255,255,255,0.3)" }]} />
          <View style={[pw.navContent, { marginTop: insets.top }]}>
            <Pressable onPress={handleBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
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
            <Text style={pw.navTitle}>Change Password</Text>
          </View>
        </View>
      </PanGestureHandler>
    </Animated.View>
  );
}, (prev, next) => prev.isActive === next.isActive);

const pw = StyleSheet.create({
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
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 16,
  },
  navTitle: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 18,
    color: "#262525",
    letterSpacing: -0.3,
  },
  fieldWrap: {
    flexDirection: "column",
  },
  marginTop: {
    marginTop: 14,
  },
  fieldLabel: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 13,
    color: "#262525",
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F8",
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontFamily: "Ubuntu_400Regular",
    fontSize: 15,
    color: "rgba(0,0,0,0.91)",
    padding: 0,
  },
  btn: {
    marginTop: 36,
    backgroundColor: "#1B17B3",
    borderRadius: 24,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 16,
    color: "#FFFFFF",
  },
});
