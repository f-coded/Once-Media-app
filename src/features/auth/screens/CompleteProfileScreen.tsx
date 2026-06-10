import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

import {
  AuthLayout,
  InputField,
  PrimaryButton,
  ScreenHeader,
  font,
} from "@/features/auth/components/AuthUI";

type CompleteProfileScreenProps = {
  onBackPress: () => void;
  onSkipPress: () => void;
  onFinishPress: () => void;
};

function CalendarIcon() {
  return (
    <View style={{ width: 18, height: 18, borderRadius: 3.75 }}>
      <View style={{ width: 15, height: 13.5, borderColor: '#262525', borderWidth: 1.125, position: 'absolute', left: 1.5, top: 3 }}/>
      <View style={{ width: 3, height: 3, borderColor: '#1c274c', borderWidth: 1.125, position: 'absolute', left: 10.5, top: 10.5 }}/>
      <View style={{ width: 0, height: 1.13, borderColor: '#1c274c', borderWidth: 1.125, position: 'absolute', left: 5.25, top: 1.875 }}/>
      <View style={{ width: 0, height: 1.13, borderColor: '#1c274c', borderWidth: 1.125, position: 'absolute', left: 12.75, top: 1.875 }}/>
      <View style={{ width: 14.25, height: 0, borderColor: '#1c274c', borderWidth: 1.125, position: 'absolute', left: 1.875, top: 6.75 }}/>
    </View>
  );
}

function AvatarPlaceholder() {
  return (
    <View style={{ width: 89, height: 89, backgroundColor: '#262525', borderRadius: 45, alignSelf: 'flex-start', marginBottom: 8 }}>
      <View style={{ 
        width: 26, height: 26, backgroundColor: '#0c0c0c', borderColor: '#ffffff', borderWidth: 2, 
        borderRadius: 13, position: 'absolute', bottom: 0, right: 0, alignItems: 'center', justifyContent: 'center' 
      }}>
        <View style={{ width: 14, height: 14, position: 'relative' }}>
          <View style={{ width: 14, height: 0, borderColor: '#ffffff', borderWidth: 1, position: 'absolute', left: 0, top: 6 }}/>
          <View style={{ width: 0, height: 14, borderColor: '#ffffff', borderWidth: 1, position: 'absolute', left: 6, top: 0 }}/>
        </View>
      </View>
    </View>
  );
}

export function CompleteProfileScreen({
  onBackPress,
  onSkipPress,
  onFinishPress,
}: CompleteProfileScreenProps) {
  const [name, setName] = useState("Kelechi Obi");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [bio, setBio] = useState("");

  const SkipButton = (
    <Pressable onPress={onSkipPress} style={{ padding: 4 }}>
      <Text style={{ ...font("Ubuntu_400Regular", 14, "#1b17b3", 21), letterSpacing: -0.28 }}>
        Skip
      </Text>
    </Pressable>
  );

  return (
    <AuthLayout>
      <ScreenHeader
        showBack
        largeTitle
        title="Complete your profile"
        subtitle="Your account has been created successfully. Set up your profile to standout."
        onBackPress={onBackPress}
        rightAction={SkipButton}
      />

      <View style={{ marginTop: 24, gap: 16 }}>
        <AvatarPlaceholder />

        <InputField
          label="Name"
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
          marginTop={0}
        />

        <InputField
          label="Date of birth"
          placeholder="Select date of birth"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          marginTop={0}
          rightIcon={<CalendarIcon />}
          helperText="You'd be the only one to see this"
        />

        <InputField
          label="Bio"
          placeholder="Enter a description about self"
          value={bio}
          onChangeText={setBio}
          marginTop={0}
          multiline
        />
      </View>

      <View style={{ flex: 1, justifyContent: "flex-end", marginTop: 40, marginBottom: 20 }}>
        <PrimaryButton label="Finish" onPress={onFinishPress} />
      </View>
    </AuthLayout>
  );
}
