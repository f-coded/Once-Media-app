import { useState } from "react";
import { View, Text, Pressable } from "react-native";

import {
  AuthLayout,
  OTPInput,
  PrimaryButton,
  ScreenHeader,
} from "../components/AuthUI";

type OTPVerificationScreenProps = {
  onBackPress: () => void;
  onVerifyPress: () => void;
  onTryAnotherMethod: () => void;
  contactMethod?: string;
};

export function OTPVerificationScreen({ 
  onBackPress, 
  onVerifyPress,
  onTryAnotherMethod,
  contactMethod = "+234 916...919" 
}: OTPVerificationScreenProps) {
  const [code, setCode] = useState("");

  return (
    <AuthLayout>
      <ScreenHeader
        showBack
        onBackPress={onBackPress}
        totalSteps={4}
        activeStep={2}
        largeTitle
        title="OTP Verification"
        subtitle={
          <Text style={{ fontFamily: "Ubuntu_400Regular", fontSize: 14, color: "#838383", lineHeight: 21, letterSpacing: -0.28 }}>
            Enter 6 digit code sent to <Text style={{ fontFamily: "Ubuntu_700Bold", color: "#0C0C0C" }}>{contactMethod}</Text>
          </Text>
        }
      />

      <View style={{ marginTop: 24, gap: 16 }}>
        <OTPInput
          label="Enter verification code"
          code={code}
          onCodeChange={setCode}
          length={4}
        />

        <View style={{ marginTop: 8 }}>
          <PrimaryButton label="Verify" onPress={onVerifyPress} />
        </View>

        <Text style={{ fontFamily: "Ubuntu_400Regular", fontSize: 14, color: "#4A4A4A", marginTop: 8 }}>
          Didn't receive code?{" "}
          <Text style={{ color: "#1B17B3", fontFamily: "Ubuntu_500Medium" }}>Resend</Text>
        </Text>
      </View>

      <View style={{ flex: 1, justifyContent: "flex-end", alignItems: "center", marginBottom: 20, marginTop: 40 }}>
        <Pressable onPress={onTryAnotherMethod}>
          <Text style={{ fontFamily: "Ubuntu_500Medium", fontSize: 16, color: "#1B17B3" }}>
            Try another method
          </Text>
        </Pressable>
      </View>
    </AuthLayout>
  );
}
