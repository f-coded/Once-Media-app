import React, { useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Pressable,
  Platform,
  BackHandler,
  Easing,
  Linking,
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

interface ContactSupportScreenProps {
  isActive?: boolean;
  onBackPress?: () => void;
}

// ── Inline SVG icons ────────────────────────────────────────────────────────

const IconWhatsApp = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22.0001C17.5228 22.0001 22 17.5229 22 12.0001C22 6.47727 17.5228 2.00012 12 2.00012C6.47715 2.00012 2 6.47727 2 12.0001C2 13.379 2.27907 14.6927 2.78382 15.8878C3.06278 16.5482 3.20226 16.8785 3.21953 17.1281C3.2368 17.3777 3.16334 17.6522 3.01642 18.2013L2 22.0001L5.79877 20.9837C6.34788 20.8368 6.62244 20.7633 6.87202 20.7806C7.12161 20.7978 7.45185 20.9373 8.11235 21.2163C9.30745 21.721 10.6211 22.0001 12 22.0001Z"
      stroke="#1B17B3"
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
    <Path
      d="M8.58815 12.3772L9.45909 11.2955C9.82616 10.8396 10.2799 10.4152 10.3155 9.80814C10.3244 9.65482 10.2166 8.96645 10.0008 7.58974C9.91601 7.04869 9.41086 6.99988 8.97332 6.99988C8.40314 6.99988 8.11805 6.99988 7.83495 7.12919C7.47714 7.29263 7.10979 7.75219 7.02917 8.13721C6.96539 8.44184 7.01279 8.65175 7.10759 9.07157C7.51023 10.8547 8.45481 12.6157 9.91948 14.0804C11.3842 15.5451 13.1452 16.4897 14.9283 16.8923C15.3481 16.9871 15.558 17.0345 15.8627 16.9707C16.2477 16.8901 16.7072 16.5228 16.8707 16.1649C17 15.8818 17 15.5968 17 15.0266C17 14.589 16.9512 14.0839 16.4101 13.9991C15.0334 13.7833 14.3451 13.6755 14.1917 13.6844C13.5847 13.72 13.1603 14.1737 12.7044 14.5408L11.6227 15.4117"
      stroke="#1B17B3"
      strokeWidth={1.5}
    />
  </Svg>
);

const IconLetter = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2 12C2 8.22876 2 6.34315 3.17157 5.17157C4.34315 4 6.22876 4 10 4H14C17.7712 4 19.6569 4 20.8284 5.17157C22 6.34315 22 8.22876 22 12C22 15.7712 22 17.6569 20.8284 18.8284C19.6569 20 17.7712 20 14 20H10C6.22876 20 4.34315 20 3.17157 18.8284C2 17.6569 2 15.7712 2 12Z"
      stroke="#1B17B3"
      strokeWidth={1.5}
    />
    <Path
      d="M6 8L8.1589 9.79908C9.99553 11.3296 10.9139 12.0949 12 12.0949C13.0861 12.0949 14.0045 11.3296 15.8411 9.79908L18 8"
      stroke="#1B17B3"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

const IconTwitter = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 21L9.63636 14.3636"
      stroke="#1B17B3"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M21.0005 3L17.8274 6.17308L14.6543 9.34615"
      stroke="#1B17B3"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M13.4516 10.5484L21 21H16L10.5484 13.4516L3 3H8L13.4516 10.5484ZM10.5484 13.4516L9.63636 14.3636M14.6538 9.34615L13.4516 10.5484"
      stroke="#1B17B3"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const IconInstagram = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z"
      stroke="#1B17B3"
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
    <Path
      d="M16.5 12C16.5 14.4853 14.4853 16.5 12 16.5C9.51472 16.5 7.5 14.4853 7.5 12C7.5 9.51472 9.51472 7.5 12 7.5C14.4853 7.5 16.5 9.51472 16.5 12Z"
      stroke="#1B17B3"
      strokeWidth={1.5}
    />
    <Path
      d="M17.508 6.5H17.499"
      stroke="#1B17B3"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const IconGlobe = () => (
  <Svg width={24} height={24} viewBox="0 0 28 28" fill="none">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.79199 13.9883C3.79199 13.7562 3.88418 13.5337 4.04827 13.3696C4.21237 13.2055 4.43493 13.1133 4.66699 13.1133L23.3337 13.1273C23.5657 13.1273 23.7883 13.2195 23.9524 13.3836C24.1165 13.5477 24.2087 13.7702 24.2087 14.0023C24.2087 14.2343 24.1165 14.4569 23.9524 14.621C23.7883 14.7851 23.5657 14.8773 23.3337 14.8773L4.66699 14.8644C4.43493 14.8644 4.21237 14.7723 4.04827 14.6082C3.88418 14.4441 3.79199 14.2215 3.79199 13.9894"
      fill="#1B17B3"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.262 7.72001C11.6576 9.28451 11.2645 11.5058 11.2645 14.0025C11.2645 16.4992 11.6576 18.7205 12.2631 20.285C12.5665 21.0702 12.9071 21.6453 13.2408 22.0093C13.5745 22.3733 13.8311 22.4585 14.0003 22.4585C14.1695 22.4585 14.4273 22.3733 14.761 22.0093C15.0935 21.6453 15.4341 21.0702 15.7375 20.285C16.3441 18.7205 16.7361 16.4992 16.7361 14.0025C16.7361 11.5058 16.343 9.28451 15.7375 7.72001C15.4341 6.93484 15.0935 6.35968 14.7598 5.99568C14.4261 5.63168 14.1695 5.54651 14.0003 5.54651C13.8311 5.54651 13.5733 5.63168 13.2408 5.99568C12.9083 6.35968 12.5653 6.93484 12.262 7.72001ZM11.9505 4.81501C12.4813 4.23284 13.1731 3.79651 14.0015 3.79651C14.8298 3.79651 15.5216 4.23284 16.0525 4.81384C16.5833 5.39368 17.0208 6.18468 17.3708 7.08884C18.072 8.90068 18.4873 11.346 18.4873 14.0025C18.4873 16.659 18.072 19.1043 17.3708 20.9162C17.0208 21.8192 16.5833 22.6113 16.0525 23.1912C15.5216 23.771 14.8298 24.2085 14.0015 24.2085C13.1731 24.2085 12.4813 23.771 11.9505 23.1912C11.4196 22.6113 10.9821 21.8203 10.6321 20.9162C9.93096 19.1043 9.51562 16.659 9.51562 14.0025C9.51562 11.346 9.93096 8.90068 10.6321 7.08884C10.9821 6.18468 11.4196 5.39484 11.9505 4.81501Z"
      fill="#1B17B3"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.0003 5.53711C12.8896 5.53711 11.7897 5.75589 10.7635 6.18096C9.73725 6.60603 8.80481 7.22907 8.01938 8.0145C7.23395 8.79993 6.61092 9.73237 6.18584 10.7586C5.76077 11.7848 5.54199 12.8847 5.54199 13.9954C5.54199 15.1062 5.76077 16.2061 6.18584 17.2323C6.61092 18.2585 7.23395 19.191 8.01938 19.9764C8.80481 20.7618 9.73725 21.3849 10.7635 21.8099C11.7897 22.235 12.8896 22.4538 14.0003 22.4538C16.2436 22.4538 18.395 21.5626 19.9813 19.9764C21.5675 18.3901 22.4587 16.2387 22.4587 13.9954C22.4587 11.7522 21.5675 9.60074 19.9813 8.0145C18.395 6.42825 16.2436 5.53711 14.0003 5.53711ZM3.79199 13.9954C3.79199 11.288 4.86751 8.69149 6.78194 6.77706C8.69638 4.86263 11.2929 3.78711 14.0003 3.78711C16.7077 3.78711 19.3043 4.86263 21.2187 6.77706C23.1331 8.69149 24.2087 11.288 24.2087 13.9954C24.2087 16.7029 23.1331 19.2994 21.2187 21.2138C19.3043 23.1283 16.7077 24.2038 14.0003 24.2038C11.2929 24.2038 8.69638 23.1283 6.78194 21.2138C4.86751 19.2994 3.79199 16.7029 3.79199 13.9954Z"
      fill="#1B17B3"
    />
  </Svg>
);

const IconChevronRight = () => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Path
      d="M7.5 15L12.5 10L7.5 5"
      stroke="#4A4A4A"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── Main Screen ─────────────────────────────────────────────────────────────

export const ContactSupportScreen = React.memo(
  function ContactSupportScreen({ isActive, onBackPress }: ContactSupportScreenProps) {
    const insets = useSafeAreaInsets();
    const screenX = useRef(new Animated.Value(SCREEN_WIDTH)).current;
    const NAV_BAR_HEIGHT = insets.top + 56;

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

    const openLink = (url: string) => {
      Linking.openURL(url).catch(() => {});
    };

    /* ── Elastic rubber-band drag ────────────────────────────────────────── */
    const dragY = useRef(new Animated.Value(0)).current;

    const rubberBand = (value: number, constant = 0.55) => {
      const sign = value < 0 ? -1 : 1;
      return sign * (1 - 1 / (Math.abs(value) / 200 + 1)) * 200 * constant;
    };

    const onDragGestureEvent = useCallback((event: any) => {
      const { translationY } = event.nativeEvent;
      dragY.setValue(rubberBand(translationY));
    }, []);

    const onDragStateChange = useCallback((event: any) => {
      const { state } = event.nativeEvent;
      if (state === State.END || state === State.CANCELLED || state === State.FAILED) {
        Animated.spring(dragY, {
          toValue: 0,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }).start();
      }
    }, []);

    return (
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { transform: [{ translateX: screenX }], backgroundColor: "#FFFFFF", zIndex: 120 },
        ]}
      >
        {/* Draggable content area with rubber-band physics */}
        <View style={{ flex: 1, width: "100%" }}>
          <PanGestureHandler
            onGestureEvent={onDragGestureEvent}
            onHandlerStateChange={onDragStateChange}
            activeOffsetY={[-10, 10]}
            failOffsetX={[-12, 12]}
          >
          <Animated.View
            style={{
              flex: 1,
              width: "100%",
              transform: [{ translateY: dragY }],
              paddingTop: NAV_BAR_HEIGHT + 24,
              paddingBottom: 40,
              paddingHorizontal: 20,
            }}
          >
            {/* Greeting Section */}
            <View style={cs.greetingSection}>
              <Text style={cs.greetingText}>
                Hello,{" "}
                <Text style={cs.greetingBold}>Ibraheem</Text>
              </Text>
              <Text style={cs.greetingSub}>We'd love to hear from you</Text>
            </View>

            {/* Outer Card Container */}
            <View style={cs.quickActionCard}>
              {/* Top Row: WhatsApp + Email */}
              <View style={cs.topRow}>
                <Pressable
                  style={({ pressed }) => [cs.actionTilePressable, { opacity: pressed ? 0.85 : 1 }]}
                  onPress={() => openLink("https://wa.me/2349000000000")}
                >
                  <View style={cs.actionTile}>
                    <IconWhatsApp />
                    <View style={cs.actionTileText}>
                      <Text style={cs.actionTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>App Support</Text>
                      <Text style={cs.actionSub} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>Instant chat with us</Text>
                    </View>
                  </View>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [cs.actionTilePressable, { opacity: pressed ? 0.85 : 1 }]}
                  onPress={() => openLink("mailto:ONCE@info.com")}
                >
                  <View style={cs.actionTile}>
                    <IconLetter />
                    <View style={cs.actionTileText}>
                      <Text style={cs.actionTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>Send us an email</Text>
                      <Text style={cs.actionSub} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>ONCE@info.com</Text>
                    </View>
                  </View>
                </Pressable>
              </View>

              {/* Bottom Section: Disclaimer + Social Links */}
              <View style={cs.cardBottomSection}>
                <Text style={cs.disclaimerText}>
                  Make sure to follow/chat us from here as to avoid chatting with wrong support channel
                </Text>

                <View style={cs.socialLinksContainer}>
                  {/* X (Twitter) */}
                  <Pressable
                    style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
                    onPress={() => openLink("https://x.com/Once01")}
                  >
                    <View style={cs.socialRow}>
                      <View style={cs.socialLeft}>
                        <IconTwitter />
                        <View style={cs.socialTextCol}>
                          <Text style={cs.socialTitle}>X (Twitter)</Text>
                          <Text style={cs.socialHandle}>@Once01</Text>
                        </View>
                      </View>
                      <IconChevronRight />
                    </View>
                  </Pressable>

                  {/* Instagram */}
                  <Pressable
                    style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
                    onPress={() => openLink("https://instagram.com/Once_01")}
                  >
                    <View style={cs.socialRow}>
                      <View style={cs.socialLeft}>
                        <IconInstagram />
                        <View style={cs.socialTextCol}>
                          <Text style={cs.socialTitle}>Instagram</Text>
                          <Text style={cs.socialHandle}>@Once_01</Text>
                        </View>
                      </View>
                      <IconChevronRight />
                    </View>
                  </Pressable>

                  {/* Website */}
                  <Pressable
                    style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
                    onPress={() => openLink("https://once.com")}
                  >
                    <View style={cs.socialRow}>
                      <View style={cs.socialLeft}>
                        <IconGlobe />
                        <View style={cs.socialTextCol}>
                          <Text style={cs.socialTitle}>Website</Text>
                          <Text style={cs.socialHandle}>once.com</Text>
                        </View>
                      </View>
                      <IconChevronRight />
                    </View>
                  </Pressable>
                </View>
              </View>
            </View>
          </Animated.View>
        </PanGestureHandler>
      </View>

        {/* Glassmorphism Nav Header */}
        <PanGestureHandler
          onHandlerStateChange={onSwipeStateChange}
          activeOffsetX={[-1000, 15]}
          failOffsetY={[-12, 12]}
        >
          <View style={[cs.navBar, { height: NAV_BAR_HEIGHT }]}>
            <BlurView
              intensity={Platform.OS === "ios" ? 80 : 30}
              tint="light"
              experimentalBlurMethod="dimezisBlurView"
              style={StyleSheet.absoluteFill}
            />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(255,255,255,0.3)" }]} />
            <View style={[cs.navContent, { marginTop: insets.top }]}>
              <Pressable
                onPress={handleBack}
                style={cs.navLeftButton}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                {/* Back arrow */}
                <Svg width={14} height={11} viewBox="0 0 14 11" fill="none">
                  <Path
                    d="M12.5625 5.0625H0.5625M5.0625 9.5625L0.5625 5.0625L5.0625 0.5625"
                    stroke="#262525"
                    strokeWidth={1.125}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text style={cs.navTitle}>Contact support</Text>
              </Pressable>
            </View>
          </View>
        </PanGestureHandler>
      </Animated.View>
    );
  },
  (prev, next) => prev.isActive === next.isActive
);

// ── Styles ──────────────────────────────────────────────────────────────────

const cs = StyleSheet.create({
  /* Nav Bar */
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
    position: "relative",
  },
  navLeftButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    zIndex: 2,
  },
  navTitle: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 16,
    color: "#262525",
    letterSpacing: -0.3,
  },

  /* Greeting */
  greetingSection: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  greetingText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 18,
    color: "#4A4A4A",
    letterSpacing: -0.36,
    lineHeight: 22,
    textAlign: "center",
  },
  greetingBold: {
    fontFamily: "Ubuntu_700Bold",
    color: "#0C0C0C",
  },
  greetingSub: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 12,
    color: "#4A4A4A",
    letterSpacing: -0.24,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 4,
  },

  /* Outer Card Container */
  quickActionCard: {
    width: "100%",
    alignSelf: "stretch",
    borderWidth: 1,
    borderColor: "#EFEFEF",
    borderRadius: 30,
    padding: 8,
    gap: 24,
    backgroundColor: "#FFFFFF",
  },

  /* Card sections */
  cardTopSection: {
    width: "100%",
  },
  cardBottomSection: {
    width: "100%",
    gap: 16,
  },

  /* Top Row (WhatsApp + Email) */
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    width: "100%",
    height: 137,
  },
  actionTilePressable: {
    flex: 1,
    height: 137,
  },
  actionTile: {
    width: "100%",
    height: 137,
    backgroundColor: "#F2F2F2",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EFEFEF",
    padding: 12,
    paddingLeft: 12,
    paddingRight: 32,
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  actionTileText: {
    gap: 6,
    height: 46,
    justifyContent: "center",
  },
  actionTitle: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 16,
    color: "#0C0C0C",
    letterSpacing: -0.32,
    lineHeight: 19.2,
  },
  actionSub: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 12,
    color: "#4A4A4A",
    letterSpacing: -0.24,
    lineHeight: 19.2,
  },

  /* Disclaimer */
  disclaimerText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    lineHeight: 18.2,
    color: "#4A4A4A",
    letterSpacing: -0.28,
  },

  /* Social Links */
  socialLinksContainer: {
    gap: 8,
  },
  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F2F2F2",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: "100%",
  },
  socialLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  socialTextCol: {
    gap: 2,
  },
  socialTitle: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 16,
    color: "#0C0C0C",
    letterSpacing: -0.32,
    lineHeight: 19.2,
  },
  socialHandle: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 12,
    color: "#4A4A4A",
    letterSpacing: -0.24,
    lineHeight: 19.2,
  },
});
