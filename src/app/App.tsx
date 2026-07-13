import "../../global.css";

import { useState } from "react";
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
import { AnimatedSplashScreen } from "@/shared/components/loaders/AnimatedSplashScreen";

import * as NavigationBar from "expo-navigation-bar";
import { Platform, View, StyleSheet } from "react-native";

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
  | "profile";

export default function App() {
  const [fontsLoaded] = useFonts({
    Ubuntu_400Regular,
    Ubuntu_500Medium,
    Ubuntu_700Bold,
  });

  const [route, setRoute] = useState<Route>("login");
  const [selectedRole, setSelectedRole] = useState("House Hunter");
  const [showSplash, setShowSplash] = useState(true);

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
        {(route === "feed" || route === "chat" || route === "wallet" || route === "profile") && (
          <>
            <View style={[StyleSheet.absoluteFill, { display: route === "feed" ? "flex" : "none" }]}>
              <FeedScreen
                onChatPress={() => setRoute("chat")}
                onWalletPress={() => setRoute("wallet")}
                onProfilePress={() => setRoute("profile")}
              />
            </View>

            <View style={[StyleSheet.absoluteFill, { display: route === "chat" ? "flex" : "none" }]}>
              <ChatScreen
                activeTab="chat"
                onTabPress={(tab) => {
                  if (tab === "home") setRoute("feed");
                  if (tab === "wallet") setRoute("wallet");
                }}
              />
            </View>

            <View style={[StyleSheet.absoluteFill, { display: route === "wallet" ? "flex" : "none" }]}>
              <WalletScreen
                onTabPress={(tab) => {
                  if (tab === "home") setRoute("feed");
                  if (tab === "chat") setRoute("chat");
                }}
              />
            </View>

            <View style={[StyleSheet.absoluteFill, { display: route === "profile" ? "flex" : "none" }]}>
              <ProfileScreen onBackPress={() => setRoute("feed")} />
            </View>
          </>
        )}
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
