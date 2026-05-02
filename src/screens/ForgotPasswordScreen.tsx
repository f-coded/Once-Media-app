import { useState } from "react";

import {
  AuthLayout,
  InputField,
  LinkText,
  PrimaryButton,
  ScreenHeader,
  SegmentControl,
} from "../components/AuthUI";

type ForgotPasswordScreenProps = {
  onBackPress: () => void;
};

export function ForgotPasswordScreen({
  onBackPress,
}: ForgotPasswordScreenProps) {
  const [method, setMethod] = useState("Email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <AuthLayout>
      <ScreenHeader showBack title="Forgot Password" onBackPress={onBackPress} />

      <SegmentControl
        options={["Email", "Phone number"]}
        selected={method}
        onSelect={setMethod}
      />

      {method === "Email" ? (
        <InputField
          label="Enter Email"
          placeholder="Enter your Email"
          value={email}
          onChangeText={setEmail}
        />
      ) : (
        <InputField
          label="Enter phone number"
          placeholder="Enter your phone number"
          value={phone}
          onChangeText={setPhone}
        />
      )}

      <PrimaryButton label="Continue" />

      <LinkText center label="Try another method" />
    </AuthLayout>
  );
}
