import "./global.css";

import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { Ubuntu_400Regular } from "@expo-google-fonts/ubuntu/400Regular";
import { Ubuntu_500Medium } from "@expo-google-fonts/ubuntu/500Medium";
import { Ubuntu_700Bold } from "@expo-google-fonts/ubuntu/700Bold";

import { AccountSuccessScreen } from "./src/screens/AccountSuccessScreen";
import { ChooseRoleScreen } from "./src/screens/ChooseRoleScreen";
import { CompleteProfileScreen } from "./src/screens/CompleteProfileScreen";
import { ForgotPasswordScreen } from "./src/screens/ForgotPasswordScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { SignUpScreen } from "./src/screens/SignUpScreen";
import { AnimatedSplashScreen } from "./src/components/AnimatedSplashScreen";

type Route =
  | "login"
  | "signup"
  | "forgot-password"
  | "choose-role"
  | "complete-profile"
  | "account-success";

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
    <SafeAreaProvider>
      <StatusBar style="dark" />

      {showSplash && (
        <AnimatedSplashScreen onAnimationFinish={() => setShowSplash(false)} />
      )}

      {route === "login" ? (
        <LoginScreen
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
        <ForgotPasswordScreen onBackPress={() => setRoute("login")} />
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
        <AccountSuccessScreen onDashboardPress={() => setRoute("login")} />
      ) : null}
    </SafeAreaProvider>
  );
}
