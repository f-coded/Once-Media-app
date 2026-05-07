import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LightBottomNav } from "../components/chat/LightBottomNav";

/* ── Avatar placeholder colours (Figma fills) ── */
const AVATAR_SAMANTHA = require("../../assets/avatar-samantha.png");
const AVATAR_KELECHI = require("../../assets/avatar-kelechi.png");

/* ── Gallery icon (sent photo indicator) ── */
function GalleryIcon() {
  return (
    <Svg width={15} height={15} viewBox="0 0 18 18" fill="none">
      <Path
        d="M1.5 10.5C1.5 7.67157 1.5 6.25736 2.37868 5.37868C3.25736 4.5 4.67157 4.5 7.5 4.5H10.5C13.3284 4.5 14.7426 4.5 15.6213 5.37868C16.5 6.25736 16.5 7.67157 16.5 10.5C16.5 13.3284 16.5 14.7426 15.6213 15.6213C14.7426 16.5 13.3284 16.5 10.5 16.5H7.5C4.67157 16.5 3.25736 16.5 2.37868 15.6213C1.5 14.7426 1.5 13.3284 1.5 10.5Z"
        stroke="#1B17B3"
        strokeWidth="1.125"
      />
      <Circle cx="6.75" cy="8.25" r="1.5" stroke="#1B17B3" strokeWidth="1.125" />
      <Path
        d="M1.5 11.2501L4.08579 8.66426C4.86684 7.88321 6.13317 7.88321 6.91421 8.66426L10.5 12.2501"
        stroke="#1B17B3"
        strokeWidth="1.125"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10.5 12.2498L11.8358 10.9141C12.6168 10.133 13.8832 10.133 14.6642 10.9141L16.5 12.7498"
        stroke="#1B17B3"
        strokeWidth="1.125"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.5 4.5L13.5 1.5M12 3H15"
        stroke="#1B17B3"
        strokeWidth="1.125"
        strokeLinecap="round"
      />
    </Svg>
  );
}

/* ── Data ── */
export type ChatConversation = {
  id: string;
  name: string;
  avatar?: "samantha" | "kelechi" | string;
  avatarBg?: string;
  time: string;
  preview: string;
  previewColor?: string;
  isPhoto?: boolean;
  badge?: number;
};

const CONVERSATIONS: ChatConversation[] = [
  {
    id: "1",
    name: "Oladapo Samantha",
    avatar: "samantha",
    time: "12:54 PM",
    preview:
      "You: Hi, I'd like to make an inquiry about the Sea Watch Mansion in Onipan.",
    previewColor: "#434343",
  },
  {
    id: "2",
    name: "Kelechi Obi",
    avatar: "kelechi",
    time: "12:54 PM",
    preview: "Sea Watch Mansion in Onipan is available",
    previewColor: "#838383",
  },
  {
    id: "3",
    name: "Oluchi Ibe",
    avatar: "kelechi",
    avatarBg: "#1B17B3",
    time: "12:54 PM",
    preview: "Sent a photo",
    isPhoto: true,
  },
  {
    id: "4",
    name: "Nnamdi Agbasi",
    avatar: "kelechi",
    avatarBg: "#1B17B3",
    time: "12:54 PM",
    preview:
      "Good day, I'm interested in the Sea Watch...",
    previewColor: "#838383",
  },
  {
    id: "5",
    name: "Erekosima Taribo",
    avatar: "kelechi",
    avatarBg: "#1B17B3",
    time: "12:54 PM",
    preview: "Could you please share more details abo...",
    previewColor: "#838383",
  },
];

/* ── Avatar component ── */
function Avatar({ item }: { item: ChatConversation }) {
  const src =
    item.avatar === "samantha" ? AVATAR_SAMANTHA : AVATAR_KELECHI;
  return (
    <View style={[styles.avatarContainer, item.avatarBg ? { backgroundColor: item.avatarBg } : undefined]}>
      <Image source={src} style={styles.avatarImage} />
    </View>
  );
}

/* ── Row component ── */
function ConversationRow({
  item,
  onPress,
}: {
  item: ChatConversation;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Avatar item={item} />
      <View style={styles.rowContent}>
        {/* Name + time */}
        <View style={styles.rowHeader}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        {/* Preview */}
        {item.isPhoto ? (
          <View style={styles.photoRow}>
            <GalleryIcon />
            <Text style={styles.photoLabel}>Sent a photo</Text>
          </View>
        ) : (
          <Text
            style={[styles.preview, { color: item.previewColor ?? "#838383" }]}
            numberOfLines={1}
          >
            {item.preview}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

/* ── Screen ── */
type ChatListScreenProps = {
  onTabPress?: (tab: "home" | "market" | "chat" | "wallet") => void;
  onConversationPress?: (conversation: ChatConversation) => void;
};

export function ChatListScreen({ onTabPress, onConversationPress }: ChatListScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.title}>Chats</Text>
      </View>

      {/* Conversation list */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 90 }}
        showsVerticalScrollIndicator={false}
      >
        {CONVERSATIONS.map((item) => (
          <ConversationRow
            key={item.id}
            item={item}
            onPress={() => onConversationPress?.(item)}
          />
        ))}
      </ScrollView>

      {/* Bottom nav — Chat badge */}
      <LightBottomNav
        activeTab="chat"
        onTabPress={onTabPress}
        badge={{ chat: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingHorizontal: 18,
    paddingBottom: 4,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 26,
    letterSpacing: -0.52,
    color: "rgba(0,0,0,0.91)",
  },
  list: {
    flex: 1,
  },
  /* Row */
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E4E4",
  },
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    overflow: "hidden",
    backgroundColor: "#E4E4E4",
    flexShrink: 0,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  rowContent: {
    flex: 1,
    gap: 7,
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 16,
    letterSpacing: -0.32,
    color: "#262525",
    flexShrink: 1,
  },
  time: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    letterSpacing: -0.28,
    color: "#434343",
    flexShrink: 0,
    marginLeft: 8,
  },
  preview: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 15,
    letterSpacing: -0.3,
    color: "#838383",
  },
  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  photoLabel: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 15,
    letterSpacing: -0.3,
    color: "#1B17B3",
  },
});
