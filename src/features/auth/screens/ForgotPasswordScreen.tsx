import { useState } from "react";
import { View } from "react-native";

import {
  AuthLayout,
  InputField,
  PhoneInputField,
  PrimaryButton,
  ScreenHeader,
  TabSelector,
} from "@/features/auth/components/AuthUI";

type ForgotPasswordScreenProps = {
  onBackPress: () => void;
  onContinuePress: () => void;
};

export function ForgotPasswordScreen({ onBackPress, onContinuePress }: ForgotPasswordScreenProps) {
  const [method, setMethod] = useState("Email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // The swap is animated by the field wrapper's Reanimated transitions below.
  // LayoutAnimation used to do this, but it is a no-op on Fabric, so the tab
  // swap jump-cut on Android while animating on iOS.
  const handleTabChange = (newMethod: string) => {
    setMethod(newMethod);
  };

  return (
    <AuthLayout>
      <ScreenHeader
        showBack
        onBackPress={onBackPress}
        totalSteps={4}
        activeStep={1}
        title="Forgot Password"
        subtitle="Choose either of the verification method to reset your password."
      />

      <View style={{ marginTop: 24 }}>
        <TabSelector
          options={["Email", "Phone number"]}
          activeOption={method}
          onSelect={handleTabChange}
          marginTop={0}
        />

        {method === "Email" ? (
          <InputField
            label="Enter Email"
            placeholder="Enter your Email"
            value={email}
            onChangeText={setEmail}
            marginTop={12}
          />
        ) : (
          <PhoneInputField
            label="Enter phone number"
            placeholder="Enter your phone number"
            value={phone}
            onChangeText={setPhone}
            marginTop={12}
          />
        )}

        <View style={{ marginTop: 12 }}>
          <PrimaryButton label="Continue" onPress={onContinuePress} />
        </View>
      </View>
    </AuthLayout>
  );
}
