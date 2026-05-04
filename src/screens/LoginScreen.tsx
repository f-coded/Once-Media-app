import { useState } from "react";
import { Text, View } from "react-native";

import {
  AuthLayout,
  Divider,
  FooterPrompt,
  InputField,
  LinkText,
  PrimaryButton,
  ScreenHeader,
  SocialButton,
} from "../components/AuthUI";
import { BrandMark } from "../components/BrandMark";
import { colors } from "../theme/colors";

type LoginScreenProps = {
  onLoginPress: () => void;
  onForgotPasswordPress: () => void;
  onSignUpPress: () => void;
};

export function LoginScreen({
  onLoginPress,
  onForgotPasswordPress,
  onSignUpPress,
}: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AuthLayout>
      <BrandMark />

      <ScreenHeader eyebrow="Welcome back!" title="Enter details to login" />

      <InputField
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        marginTop={22}
      />
      <InputField
        label="Password"
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        marginTop={12}
      />

      <Text
        style={{
          fontFamily: "Ubuntu_400Regular",
          fontSize: 13,
          lineHeight: 15,
          letterSpacing: -0.26,
          color: "#838383",
          marginTop: 8,
          width: 339,
        }}
      >
        By signing in you are agreeing to our terms and services
      </Text>

      <View style={{ marginTop: 20 }}>
        <PrimaryButton label="Login" onPress={onLoginPress} />
        <LinkText center label="Forgot Password" onPress={onForgotPasswordPress} />
      </View>

      <View style={{ marginTop: 13 }}>
        <Divider />
      </View>

      <View style={{ marginTop: 13, gap: 12 }}>
        <SocialButton label="Continue with Google" badge="google" />
        <SocialButton label="Continue with Apple" badge="apple" />
      </View>

      <View style={{ marginTop: 22 }}>
        <FooterPrompt
          prompt="Don't have an account?"
          action="Sign up"
          onPress={onSignUpPress}
        />
      </View>
    </AuthLayout>
  );
}
