import { Pressable, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import {
  AuthLayout,
  PrimaryButton,
  ScreenHeader,
  font,
} from "../components/AuthUI";
import {
  HouseHunterIcon,
  PropertyOwnerIcon,
  ProfessionalIcon,
  ContentCreatorIcon,
} from "../components/RoleIcons";

type ChooseRoleScreenProps = {
  selectedRole: string;
  onSelectRole: (value: string) => void;
  onBackPress: () => void;
  onContinuePress: () => void;
};

const roles = [
  {
    key: "House Hunter",
    icon: <HouseHunterIcon />,
    description: "People looking for their next home or a cool community.",
  },
  {
    key: "Property Owner",
    icon: <PropertyOwnerIcon />,
    description: "Individual landlords or homeowners.",
  },
  {
    key: "Professional",
    icon: <ProfessionalIcon />,
    description: "Agents, Realtors, and Property Managers.",
  },
  {
    key: "Content Creators",
    icon: <ContentCreatorIcon />,
    description: "Share posts, grow your audience, and earn from your activity.",
  },
];

function CheckCircleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Circle cx={9} cy={9} r={9} fill="#1B17B3" />
      <Path
        d="M5.5 9.5L8 12L13 6"
        stroke="#FFFFFF"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChooseRoleScreen({
  selectedRole,
  onSelectRole,
  onBackPress,
  onContinuePress,
}: ChooseRoleScreenProps) {
  return (
    <AuthLayout>
      <ScreenHeader
        showBack
        largeTitle
        title="Choose Who You Are"
        subtitle="Choose how you'd like to use the platform. You can always switch later."
        onBackPress={onBackPress}
      />

      <View style={{ marginTop: 24, gap: 12, flexDirection: "column" }}>
        {roles.map((role) => {
          const active = role.key === selectedRole;

          return (
            <Pressable
              key={role.key}
              onPress={() => onSelectRole(role.key)}
              style={{
                width: "100%",
                minHeight: 97,
                backgroundColor: active ? "#e7f1ff" : "#F2F2F2",
                borderColor: active ? "#1b17b3" : "transparent",
                borderWidth: 1,
                borderRadius: 20,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
              }}
            >
              <View style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
                {role.icon}
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ ...font("Ubuntu_500Medium", 16, "#0c0c0c"), letterSpacing: -0.32 }}>
                  {role.key}
                </Text>
                <Text
                  style={{
                    ...font("Ubuntu_400Regular", 14, "#4a4a4a", 21),
                    letterSpacing: -0.28,
                  }}
                >
                  {role.description}
                </Text>
              </View>
              <View style={{ width: 18, height: 18, alignSelf: "flex-start" }}>
                {active && <CheckCircleIcon />}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={{ flex: 1, justifyContent: "flex-end", marginTop: 40, marginBottom: 20 }}>
        <PrimaryButton label="Continue" onPress={onContinuePress} />
      </View>
    </AuthLayout>
  );
}
