import { useState } from "react";
import { Text } from "react-native";

import {
  AuthLayout,
  Divider,
  FooterPrompt,
  InputField,
  PrimaryButton,
  ScreenHeader,
  SocialButton,
} from "../components/AuthUI";
import { BrandMark } from "../components/BrandMark";
import { colors } from "../theme/colors";

type SignUpScreenProps = {
  onContinuePress: () => void;
  onLoginPress: () => void;
};

export function SignUpScreen({
  onContinuePress,
  onLoginPress,
}: SignUpScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [createPassword, setCreatePassword] = useState("");

  return (
    <AuthLayout>
      <BrandMark />

      <ScreenHeader eyebrow="Welcome!" title="Create an account to get started" />

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
      <InputField
        label="Create password"
        placeholder="Enter your password"
        secureTextEntry
        value={createPassword}
        onChangeText={setCreatePassword}
      />

      <Text className="mt-3 text-[13px] leading-[18px]" style={{ color: colors.muted }}>
        By signing in you are agreeing to our terms and services
      </Text>

      <PrimaryButton label="Login" onPress={onContinuePress} />

      <Divider />

      <SocialButton label="Continue with Google" badge="G" />
      <SocialButton label="Continue with Apple" badge="A" />

      <FooterPrompt prompt="Have an account?" action="Login" onPress={onLoginPress} />
    </AuthLayout>
  );
}
