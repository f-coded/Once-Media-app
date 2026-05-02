import { useState } from "react";
import { Text, View } from "react-native";

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

type SignUpScreenProps = {
  onLoginPress: () => void;
  onContinuePress: () => void;
};

export function SignUpScreen({ onLoginPress, onContinuePress }: SignUpScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <AuthLayout>
      <BrandMark />

      <ScreenHeader eyebrow="Welcome!" title="Create an account to get started" />

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
      <InputField
        label="Create password"
        placeholder="Enter your password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
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
        <PrimaryButton label="Sign Up" onPress={onContinuePress} />
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
          prompt="Have an account?"
          action="Login"
          onPress={onLoginPress}
        />
      </View>
    </AuthLayout>
  );
}
