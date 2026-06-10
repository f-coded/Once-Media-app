import { useState } from "react";
import { View } from "react-native";

import {
  AuthLayout,
  InputField,
  PrimaryButton,
  ScreenHeader,
} from "@/features/auth/components/AuthUI";

type ConfirmPasswordScreenProps = {
  onBackPress: () => void;
  onConfirmPasswordPress: () => void;
};

export function ConfirmPasswordScreen({ 
  onBackPress, 
  onConfirmPasswordPress,
}: ConfirmPasswordScreenProps) {
  const [password, setPassword] = useState("");

  return (
    <AuthLayout>
      <ScreenHeader
        showBack
        onBackPress={onBackPress}
        totalSteps={4}
        activeStep={4}
        largeTitle
        title="Re-Enter Pin"
        subtitle="Re-enter pin to confirm your pin."
      />

      <View style={{ marginTop: 21, gap: 24 }}>
        <InputField
          label="Enter password"
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          marginTop={0}
        />

        <PrimaryButton label="Confirm Password" onPress={onConfirmPasswordPress} />
      </View>
    </AuthLayout>
  );
}
