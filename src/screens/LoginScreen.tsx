import { useState } from "react";
import { Text } from "react-native";

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
  onForgotPasswordPress: () => void;
  onSignUpPress: () => void;
};

export function LoginScreen({
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
      />
      <InputField
        label="Password"
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Text className="mt-3 text-[13px] leading-[18px]" style={{ color: colors.muted }}>
        By signing in you are agreeing to our terms and services
      </Text>

      <PrimaryButton label="Login" />

      <LinkText center label="Forgot Password" onPress={onForgotPasswordPress} />

      <Divider />

      <SocialButton label="Continue with Google" badge="G" />
      <SocialButton label="Continue with Apple" badge="A" />

      <FooterPrompt
        prompt="Don't have an account?"
        action="Sign up"
        onPress={onSignUpPress}
      />
    </AuthLayout>
  );
}
