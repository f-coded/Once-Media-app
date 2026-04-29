import { useState } from "react";
import { View } from "react-native";

import {
  AuthLayout,
  InputField,
  PrimaryButton,
  ScreenHeader,
} from "../components/AuthUI";

type CreatePasswordScreenProps = {
  onBackPress: () => void;
  onCreatePasswordPress: () => void;
};

export function CreatePasswordScreen({ 
  onBackPress, 
  onCreatePasswordPress,
}: CreatePasswordScreenProps) {
  const [password, setPassword] = useState("");

  return (
    <AuthLayout>
      <ScreenHeader
        showBack
        onBackPress={onBackPress}
        totalSteps={4}
        activeStep={3}
        largeTitle
        title="Almost there! Create Your Pin"
        subtitle="Create a new secure password for your account."
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

        <PrimaryButton label="Create password" onPress={onCreatePasswordPress} />
      </View>
    </AuthLayout>
  );
}
