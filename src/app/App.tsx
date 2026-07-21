import "../../global.css";

import { useCallback, useEffect, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { Ubuntu_400Regular } from "@expo-google-fonts/ubuntu/400Regular";
import { Ubuntu_500Medium } from "@expo-google-fonts/ubuntu/500Medium";
import { Ubuntu_700Bold } from "@expo-google-fonts/ubuntu/700Bold";

import { AccountSuccessScreen } from "@/features/auth/screens/AccountSuccessScreen";
import { ChooseRoleScreen } from "@/features/auth/screens/ChooseRoleScreen";
import { CompleteProfileScreen } from "@/features/auth/screens/CompleteProfileScreen";
import { ForgotPasswordScreen } from "@/features/auth/screens/ForgotPasswordScreen";
import { LoginScreen } from "@/features/auth/screens/LoginScreen";
import { SignUpScreen } from "@/features/auth/screens/SignUpScreen";
import { OTPVerificationScreen } from "@/features/auth/screens/OTPVerificationScreen";
import { CreatePasswordScreen } from "@/features/auth/screens/CreatePasswordScreen";
import { ConfirmPasswordScreen } from "@/features/auth/screens/ConfirmPasswordScreen";
import { FeedScreen } from "@/features/feed/screens/FeedScreen";
import { ChatScreen } from "@/features/chat/screens/ChatScreen";
import { WalletScreen } from "@/features/wallet/screens/WalletScreen";
import { ProfileScreen } from "@/features/profile/screens/ProfileScreen";
import { SettingsScreen } from "@/features/profile/screens/SettingsScreen";
import { PersonalInfoScreen } from "@/features/profile/screens/PersonalInfoScreen";
import { SecurityScreen } from "@/features/profile/screens/SecurityScreen";
import { ChangePasswordScreen } from "@/features/profile/screens/ChangePasswordScreen";
import { ChangePinScreen } from "@/features/profile/screens/ChangePinScreen";
import { PaymentBankScreen } from "@/features/profile/screens/PaymentBankScreen";
import { ContactSupportScreen } from "@/features/profile/screens/ContactSupportScreen";
import { AnimatedSplashScreen } from "@/shared/components/loaders/AnimatedSplashScreen";

import * as  NavigationBar from "expo-navigation-bar";
import { BackHandler, InteractionManager, Platform, View, StyleSheet } from "react-native";

if (Platform.OS === "android") {
  NavigationBar.setPositionAsync("absolute");
  NavigationBar.setBackgroundColorAsync("#00000000"); // completely transparent
}

type Route =
  | "login"
  | "signup"
  | "forgot-password"
  | "otp-verification"
  | "create-password"
  | "confirm-password"
  | "choose-role"
  | "complete-profile"
  | "account-success"
  | "feed"
  | "chat"
  | "wallet"
  | "profile"
  | "settings"
  | "personal-info"
  | "security"
  | "change-password"
  | "change-pin"
  | "payment-bank"
  | "contact-support";

export default function App() {
  const [fontsLoaded] = useFonts({
    Ubuntu_400Regular,
    Ubuntu_500Medium,
    Ubuntu_700Bold,
  });

  const [route, setRoute] = useState<Route>("login");
  const [selectedRole, setSelectedRole] = useState("House Hunter");
  const [showSplash, setShowSplash] = useState(true);
  const [profileOrigin, setProfileOrigin] = useState<Route>("feed");

  // ── Android hardware back: auth-flow route graph ─────────────────
  // Mirrors the onBackPress wiring below. Registered ONCE on mount so it
  // stays lowest-priority: screens that register their own BackHandler
  // later (profile stack, comment sheet, chat dialogue, wallet modals)
  // always win, and unhandled routes (login/feed/etc.) fall through to
  // the default behavior (exit app).
  const routeRef = useRef(route);
  routeRef.current = route;

  useEffect(() => {
    const AUTH_BACK_MAP: Partial<Record<Route, Route>> = {
      signup: "login",
      "forgot-password": "login",
      "otp-verification": "forgot-password",
      "create-password": "otp-verification",
      "confirm-password": "create-password",
      "choose-role": "signup",
      "complete-profile": "choose-role",
    };

    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      const prev = AUTH_BACK_MAP[routeRef.current];
      if (prev) {
        setRoute(prev);
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, []);

  // ── Lazy first-visit mounting of tab screens ─────────────────────
  // Previously ALL tab-region screens (Feed, Chat, Wallet + the 7-screen
  // profile stack with its blur views) mounted in one frame the moment the
  // user left auth — that mount spike was the visible delay after pressing
  // Login. Now each screen mounts on its FIRST visit (in the same frame as
  // the navigation, via render-phase state derivation) and stays mounted
  // afterwards, so returning to it is as instant as before.
  const [feedMounted, setFeedMounted] = useState(false);
  const [chatMounted, setChatMounted] = useState(false);
  const [walletMounted, setWalletMounted] = useState(false);
  const [profileStackMounted, setProfileStackMounted] = useState(false);

  const PROFILE_ROUTES: Route[] = [
    "profile",
    "settings",
    "personal-info",
    "security",
    "change-password",
    "change-pin",
    "payment-bank",
    "contact-support",
  ];

  // Pre-warm the remaining tab screens in the background once the feed has
  // settled after login: staggered so no single frame pays the whole mount
  // cost, and behind InteractionManager so it never competes with the login
  // transition or an active touch. By the time the user taps Profile, the
  // stack is already mounted and the slide-in starts instantly. If they tap
  // sooner, the render-phase guards below still mount on demand.
  useEffect(() => {
    if (!feedMounted) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const task = InteractionManager.runAfterInteractions(() => {
      timers.push(setTimeout(() => setChatMounted(true), 300));
      timers.push(setTimeout(() => setWalletMounted(true), 700));
      timers.push(setTimeout(() => setProfileStackMounted(true), 1200));
    });
    return () => {
      task.cancel();
      timers.forEach(clearTimeout);
    };
  }, [feedMounted]);

  if ((route === "feed" || (route === "profile" && profileOrigin === "feed")) && !feedMounted) {
    setFeedMounted(true);
  }
  if ((route === "chat" || (route === "profile" && profileOrigin === "chat")) && !chatMounted) {
    setChatMounted(true);
  }
  if ((route === "wallet" || (route === "profile" && profileOrigin === "wallet")) && !walletMounted) {
    setWalletMounted(true);
  }
  if (PROFILE_ROUTES.includes(route) && !profileStackMounted) {
    setProfileStackMounted(true);
  }

  // ── Stable navigation callbacks ──────────────────────────────────
  // Inline arrows here made every mounted screen receive new props on every
  // route change, re-rendering all of them per tab press. Stable identities
  // + React.memo on the tab screens mean a tab switch only re-renders the
  // screens whose props actually changed.
  const handleChatPress = useCallback(() => setRoute("chat"), []);
  const handleWalletPress = useCallback(() => setRoute("wallet"), []);
  const handleProfileFromFeed = useCallback(() => {
    setProfileOrigin("feed");
    setRoute("profile");
  }, []);
  const handleChatTabPress = useCallback((tab: string) => {
    if (tab === "home") setRoute("feed");
    if (tab === "wallet") setRoute("wallet");
  }, []);
  const handleWalletTabPress = useCallback((tab: string) => {
    if (tab === "home") setRoute("feed");
    if (tab === "chat") setRoute("chat");
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <SafeAreaProvider>
        {/* Feed → light icons (white, no bg scrim); splash → light; auth screens → dark */}
        <StatusBar
          style={showSplash || route === "feed" ? "light" : "dark"}
          translucent
          backgroundColor="transparent"
        />

        {showSplash && (
          <AnimatedSplashScreen onAnimationFinish={() => setShowSplash(false)} />
        )}

        {route === "login" ? (
          <LoginScreen
            onLoginPress={() => setRoute("feed")}
            onForgotPasswordPress={() => setRoute("forgot-password")}
            onSignUpPress={() => setRoute("signup")}
          />
        ) : null}

        {route === "signup" ? (
          <SignUpScreen
            onContinuePress={() => setRoute("choose-role")}
            onLoginPress={() => setRoute("login")}
          />
        ) : null}

        {route === "forgot-password" ? (
          <ForgotPasswordScreen 
            onBackPress={() => setRoute("login")} 
            onContinuePress={() => setRoute("otp-verification")}
          />
        ) : null}

        {route === "otp-verification" ? (
          <OTPVerificationScreen 
            onBackPress={() => setRoute("forgot-password")}
            onVerifyPress={() => setRoute("create-password")}
            onTryAnotherMethod={() => setRoute("forgot-password")}
          />
        ) : null}

        {route === "create-password" ? (
          <CreatePasswordScreen 
            onBackPress={() => setRoute("otp-verification")}
            onCreatePasswordPress={() => setRoute("confirm-password")}
          />
        ) : null}

        {route === "confirm-password" ? (
          <ConfirmPasswordScreen 
            onBackPress={() => setRoute("create-password")}
            onConfirmPasswordPress={() => setRoute("login")}
          />
        ) : null}

        {route === "choose-role" ? (
          <ChooseRoleScreen
            selectedRole={selectedRole}
            onSelectRole={setSelectedRole}
            onBackPress={() => setRoute("signup")}
            onContinuePress={() => setRoute("complete-profile")}
          />
        ) : null}

        {route === "complete-profile" ? (
          <CompleteProfileScreen
            onBackPress={() => setRoute("choose-role")}
            onSkipPress={() => setRoute("account-success")}
            onFinishPress={() => setRoute("account-success")}
          />
        ) : null}

        {route === "account-success" ? (
          <AccountSuccessScreen onDashboardPress={() => setRoute("feed")} />
        ) : null}

        {/* ── Tab screens: always mounted, show/hide via display ─────────────
             Keeps each screen alive in memory (like React Navigation tabs)
             so switching back to Home is instant — no remount lag.       */}
        {(route === "feed" || route === "chat" || route === "wallet" || route === "profile" || route === "settings" || route === "personal-info" || route === "security" || route === "change-password" || route === "change-pin" || route === "payment-bank" || route === "contact-support") && (
          <>
            {feedMounted && (
              <View style={[StyleSheet.absoluteFill, { display: route === "feed" || (route === "profile" && profileOrigin === "feed") ? "flex" : "none" }]}>
                <FeedScreen
                  isScreenActive={route === "feed"}
                  onChatPress={handleChatPress}
                  onWalletPress={handleWalletPress}
                  onProfilePress={handleProfileFromFeed}
                />
              </View>
            )}

            {chatMounted && (
              <View style={[StyleSheet.absoluteFill, { display: route === "chat" || (route === "profile" && profileOrigin === "chat") ? "flex" : "none" }]}>
                <ChatScreen
                  activeTab="chat"
                  onTabPress={handleChatTabPress}
                />
              </View>
            )}

            {walletMounted && (
              <View style={[StyleSheet.absoluteFill, { display: route === "wallet" || (route === "profile" && profileOrigin === "wallet") ? "flex" : "none" }]}>
                <WalletScreen
                  onTabPress={handleWalletTabPress}
                />
              </View>
            )}

            {/* Profile and Settings screens wrapper (single z-indexed display layer) */}
            {profileStackMounted && (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  display: [
                    "profile",
                    "settings",
                    "personal-info",
                    "security",
                    "change-password",
                    "change-pin",
                    "payment-bank",
                    "contact-support",
                  ].includes(route)
                    ? "flex"
                    : "none",
                },
              ]}
            >
              <ProfileScreen
                isActive={[
                  "profile",
                  "settings",
                  "personal-info",
                  "security",
                  "change-password",
                  "change-pin",
                  "payment-bank",
                  "contact-support",
                ].includes(route)}
                isShifted={[
                  "settings",
                  "personal-info",
                  "security",
                  "change-password",
                  "change-pin",
                  "payment-bank",
                  "contact-support",
                ].includes(route)}
                onBackPress={() => setRoute(profileOrigin)}
                onSettingsPress={() => setRoute("settings")}
              />
              <SettingsScreen
                isActive={[
                  "settings",
                  "personal-info",
                  "security",
                  "change-password",
                  "change-pin",
                  "payment-bank",
                  "contact-support",
                ].includes(route)}
                isShifted={[
                  "personal-info",
                  "security",
                  "change-password",
                  "change-pin",
                  "payment-bank",
                  "contact-support",
                ].includes(route)}
                onBackPress={() => setRoute("profile")}
                onPersonalInfoPress={() => setRoute("personal-info")}
                onSecurityPress={() => setRoute("security")}
                onPaymentBankPress={() => setRoute("payment-bank")}
                onContactSupportPress={() => setRoute("contact-support")}
                onLogoutPress={() => setRoute("login")}
              />
              <PersonalInfoScreen
                isActive={route === "personal-info"}
                onBackPress={() => setRoute("settings")}
              />
              <SecurityScreen
                isActive={["security", "change-password", "change-pin"].includes(route)}
                isShifted={["change-password", "change-pin"].includes(route)}
                onBackPress={() => setRoute("settings")}
                onChangePasswordPress={() => setRoute("change-password")}
                onChangePinPress={() => setRoute("change-pin")}
              />
              <ChangePasswordScreen
                isActive={route === "change-password"}
                onBackPress={() => setRoute("security")}
              />
              <ChangePinScreen
                isActive={route === "change-pin"}
                onBackPress={() => setRoute("security")}
              />
              <PaymentBankScreen
                isActive={route === "payment-bank"}
                onBackPress={() => setRoute("settings")}
              />
              <ContactSupportScreen
                isActive={route === "contact-support"}
                onBackPress={() => setRoute("settings")}
              />
            </View>
            )}
          </>
        )}
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
