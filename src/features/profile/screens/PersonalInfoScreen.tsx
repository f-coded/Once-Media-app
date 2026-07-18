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
  Alert,
  Easing,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import Svg, { Path, Rect } from "react-native-svg";
import {
  PanGestureHandler,
  State,
  PanGestureHandlerStateChangeEvent,
} from "react-native-gesture-handler";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const AVATAR_KELECHI = require("../../../../assets/avatar-kelechi.png");

interface PersonalInfoScreenProps {
  isActive?: boolean;
  onBackPress?: () => void;
}

const IconCalendar = () => (
  <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
    <Path
      d="M1.5 9C1.5 6.17157 1.5 4.75736 2.37868 3.87868C3.25736 3 4.67157 3 7.5 3H10.5C13.3284 3 14.7426 3 15.6213 3.87868C16.5 4.75736 16.5 6.17157 16.5 9V10.5C16.5 13.3284 16.5 14.7426 15.6213 15.6213C14.7426 16.5 13.3284 16.5 10.5 16.5H7.5C4.67157 16.5 3.25736 16.5 2.37868 15.6213C1.5 14.7426 1.5 13.3284 1.5 10.5V9Z"
      stroke="#262525"
      strokeWidth={1.125}
    />
    <Path
      d="M13.5 12L12 12M12 12L10.5 12M12 12L12 10.5M12 12L12 13.5"
      stroke="#1C274C"
      strokeWidth={1.125}
      strokeLinecap="round"
    />
    <Path
      d="M5.25 3V1.875"
      stroke="#1C274C"
      strokeWidth={1.125}
      strokeLinecap="round"
    />
    <Path
      d="M12.75 3V1.875"
      stroke="#1C274C"
      strokeWidth={1.125}
      strokeLinecap="round"
    />
    <Path
      d="M1.875 6.75H16.125"
      stroke="#1C274C"
      strokeWidth={1.125}
      strokeLinecap="round"
    />
  </Svg>
);

const CustomInputBox = ({
  label,
  value,
  onChangeText,
  trailing,
  hint,
  style,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  trailing?: React.ReactNode;
  hint?: string;
  style?: any;
}) => (
  <View style={[fi.fieldWrap, style]}>
    <Text style={fi.fieldLabel}>{label}</Text>
    <View style={fi.inputContainer}>
      <TextInput
        style={fi.input}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#B0B0B0"
      />
      {trailing && <View style={fi.trailingContainer}>{trailing}</View>}
    </View>
    {hint ? <Text style={fi.hint}>{hint}</Text> : null}
  </View>
);

export const PersonalInfoScreen = React.memo(
  function PersonalInfoScreen({ isActive, onBackPress }: PersonalInfoScreenProps) {
    const insets = useSafeAreaInsets();
    const screenX = useRef(new Animated.Value(SCREEN_WIDTH)).current;
    const NAV_BAR_HEIGHT = insets.top + 56;

    const [firstName, setFirstName] = useState("Kelechi");
    const [surname, setSurname] = useState("Obi");
    const [email, setEmail] = useState("olafarid12@gmail.com");
    const [dob, setDob] = useState("22/03/1992");
    const [phone, setPhone] = useState("09025730919");

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
        { transform: [{ translateX: screenX }], backgroundColor: "#FFFFFF", zIndex: 120 },
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
        {/* Change Display Picture Section */}
        <View style={fi.avatarSection}>
          <Text style={fi.sectionLabel}>Change Display Picture</Text>
          <View style={fi.avatarRow}>
            <Image source={AVATAR_KELECHI} style={fi.avatar} contentFit="cover" />
            <Pressable
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
              onPress={() => {}}
            >
              <View style={fi.changeBtn}>
                <Text style={fi.changeBtnText}>Change</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* First name and Surname adjacent row */}
        <View style={fi.row}>
          <CustomInputBox
            label="First name"
            value={firstName}
            onChangeText={setFirstName}
            style={{ flex: 1 }}
          />
          <CustomInputBox
            label="Surname"
            value={surname}
            onChangeText={setSurname}
            style={{ flex: 1 }}
          />
        </View>

        {/* Full width inputs */}
        <CustomInputBox
          label="Email address"
          value={email}
          onChangeText={setEmail}
          style={fi.marginTop}
        />
        <CustomInputBox
          label="Date of birth"
          value={dob}
          onChangeText={setDob}
          trailing={<IconCalendar />}
          hint="You'd be the only one to see this"
          style={[fi.marginTop, { fontStyle: "italic" }]}
        />
        <CustomInputBox
          label="Phone number"
          value={phone}
          onChangeText={setPhone}
          style={fi.marginTop}
        />

        {/* Delete account */}
        <Pressable
          style={fi.deleteBtn}
          onPress={() =>
            Alert.alert(
              "Delete account",
              "Are you sure you want to delete your account? This action cannot be undone.",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive" },
              ]
            )
          }
        >
          <Text style={fi.deleteText}>Delete account</Text>
        </Pressable>

        {/* Save button */}
        <Pressable
          style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
          onPress={handleBack}
        >
          <View style={fi.saveBtn}>
            <Text style={fi.saveBtnText}>Save</Text>
          </View>
        </Pressable>
      </ScrollView>

      {/* Nav Header */}
      <PanGestureHandler
        onHandlerStateChange={onSwipeStateChange}
        activeOffsetX={[-1000, 15]}
        failOffsetY={[-12, 12]}
      >
        <View style={[fi.navBar, { height: NAV_BAR_HEIGHT }]}>
          <BlurView
            intensity={Platform.OS === "ios" ? 80 : 30}
            tint="light"
            experimentalBlurMethod="dimezisBlurView"
            style={StyleSheet.absoluteFill}
          />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(255,255,255,0.3)" }]} />
          <View style={[fi.navContent, { marginTop: insets.top }]}>
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
            <Text style={fi.navTitle}>Personal information</Text>
          </View>
        </View>
      </PanGestureHandler>
    </Animated.View>
  );
}, (prev, next) => prev.isActive === next.isActive);

const fi = StyleSheet.create({
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
    fontSize: 16,
    color: "#262525",
    letterSpacing: -0.3,
  },
  avatarSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    color: "rgba(12, 12, 12, 1)",
    marginBottom: 10,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  avatar: {
    width: 79,
    height: 79,
    borderRadius: 60,
    backgroundColor: "#F5F5F8",
  },
  changeBtn: {
    backgroundColor: "rgba(27, 23, 179, 0.08)",
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 22,
  },
  changeBtnText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 13,
    color: "#1B17B3",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  fieldWrap: {
    flexDirection: "column",
  },
  marginTop: {
    marginTop: 14,
  },
  fieldLabel: {
    fontFamily: "Ubuntu_400Regular", 
    color: "#262525",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F8",
    borderRadius: 30,
    height: 52,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontFamily: "Ubuntu_400Regular",
    fontSize: 13,
    color: "rgba(0,0,0,0.91)",
    padding: 0,
  },
  trailingContainer: {
    marginLeft: 8,
  },
  hint: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 11,
    fontStyle: "italic",
    color: "#9B9B9B",
    marginTop: 6,
  },
  deleteBtn: { 
    alignItems: "center",
    marginTop: 27,
    // marginBottom: 24,
  },
  deleteText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    color: "#FF3B30",
  },
  saveBtn: {
    backgroundColor: "#1B17B3",
    borderRadius: 24,
    height: 50                ,
    alignItems: "center",
    justifyContent: "center",
    marginTop: "30%",
  },
  saveBtnText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 16,
    color: "#FFFFFF",
  },
});
 