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

/* ── Avatar images (one per contact, from Figma imageRefs) ── */
const AVATAR_SAMANTHA  = require("../../assets/avatar-samantha.png");
const AVATAR_KELECHI   = require("../../assets/avatar-kelechi.png");
const AVATAR_OLUCHI    = require("../../assets/avatar-oluchi.png");
const AVATAR_NNAMDI    = require("../../assets/avatar-nnamdi.png");
const AVATAR_EREKOSIMA = require("../../assets/avatar-erekosima.png");

/* ── Gallery icon — Figma component 7:2862 ── */
function GalleryIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M1.5 10.5C1.5 7.67157 1.5 6.25736 2.37868 5.37868C3.25736 4.5 4.67157 4.5 7.5 4.5H10.5C13.3284 4.5 14.7426 4.5 15.6213 5.37868C16.5 6.25736 16.5 7.67157 16.5 10.5C16.5 13.3284 16.5 14.7426 15.6213 15.6213C14.7426 16.5 13.3284 16.5 10.5 16.5H7.5C4.67157 16.5 3.25736 16.5 2.37868 15.6213C1.5 14.7426 1.5 13.3284 1.5 10.5Z"
        stroke="#1B17B3"
        strokeWidth="1.125"
      />
      <Circle cx="6.75" cy="8.25" r="1.5" stroke="#1B17B3" strokeWidth="1.125" />
      <Path
        d="M1.5 11.25L4.08579 8.66421C4.86684 7.88317 6.13317 7.88317 6.91421 8.66421L10.5 12.25"
        stroke="#1B17B3"
        strokeWidth="1.125"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10.5 12.25L11.8358 10.9142C12.6168 10.1332 13.8832 10.1332 14.6642 10.9142L16.5 12.75"
        stroke="#1B17B3"
        strokeWidth="1.125"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.5 4.5V1.5M12 3H15"
        stroke="#1B17B3"
        strokeWidth="1.125"
        strokeLinecap="round"
      />
    </Svg>
  );
}

/* ── Types ── */
export type ChatConversation = {
  id: string;
  name: string;
  avatarSource: any;
  /** background color behind avatar (fallback if image fails) */
  avatarBg?: string;
  time: string;
  timeColor: string;
  preview: string;
  previewColor: string;
  isPhoto?: boolean;
};

/* ── Conversation data — exact text & colors from Figma ── */
const CONVERSATIONS: ChatConversation[] = [
  {
    id: "1",
    name: "Oladapo Samantha",
    avatarSource: AVATAR_SAMANTHA,
    avatarBg: "#1B17B3",
    time: "12:54 PM",
    timeColor: "#1B17B3",   // Primary/100 — Figma: fills: Primary/100
    preview: "You: Hi, I'd like to make an inquiry about the Sea Watch Mansion in Onipan.",
    previewColor: "#1B17B3", // Primary/100
  },
  {
    id: "2",
    name: "Kelechi Obi",
    avatarSource: AVATAR_KELECHI,
    time: "12:54 PM",
    timeColor: "#838383",   // Black/400
    preview: "Sea Watch Mansion in Onipan is available",
    previewColor: "#838383",
  },
  {
    id: "3",
    name: "Oluchi Ibe",
    avatarSource: AVATAR_OLUCHI,
    avatarBg: "#1B17B3",
    time: "12:54 PM",
    timeColor: "#838383",
    preview: "Sent a photo",
    previewColor: "#1B17B3",
    isPhoto: true,
  },
  {
    id: "4",
    name: "Nnamdi Agbasi",
    avatarSource: AVATAR_NNAMDI,
    avatarBg: "#1B17B3",
    time: "12:54 PM",
    timeColor: "#838383",
    preview: "Good day, I'm interested in the Sea Watch Mansion property. Could you provide more information on the price and viewing schedule",
    previewColor: "#838383",
  },
  {
    id: "5",
    name: "Erekosima Taribo",
    avatarSource: AVATAR_EREKOSIMA,
    avatarBg: "#1B17B3",
    time: "12:54 PM",
    timeColor: "#838383",
    preview: "Could you please share more details about the property and its availability",
    previewColor: "#838383",
  },
];

/* ── Single conversation row ── */
function ConversationRow({
  item,
  onPress,
}: {
  item: ChatConversation;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      {/* Avatar — 45×45, borderRadius 22.5 (= 60px in Figma which renders as circle) */}
      <View style={[styles.avatar, { backgroundColor: item.avatarBg ?? "#E4E4E4" }]}>
        <Image source={item.avatarSource} style={styles.avatarImg} />
      </View>

      {/* Right content */}
      <View style={styles.rowContent}>
        {/* Name + time row */}
        <View style={styles.rowHeader}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.time, { color: item.timeColor }]}>
            {item.time}
          </Text>
        </View>

        {/* Preview — photo row or text */}
        {item.isPhoto ? (
          <View style={styles.photoRow}>
            <GalleryIcon />
            <Text style={styles.photoLabel}>Sent a photo</Text>
          </View>
        ) : (
          <Text
            style={[styles.preview, { color: item.previewColor }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.preview}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

/* ── Screen ── */
export type ChatListScreenProps = {
  onTabPress?: (tab: "home" | "market" | "chat" | "wallet") => void;
  onConversationPress?: (conversation: ChatConversation) => void;
};

export function ChatListScreen({ onTabPress, onConversationPress }: ChatListScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      {/* "Chats" heading — Figma: x:18, y:48, fontSize:26, Ubuntu Medium, color:rgba(0,0,0,0.91) */}
      <View style={[styles.headerArea, { paddingTop: insets.top }]}>
        <Text style={styles.title}>Chats</Text>
      </View>

      {/* Conversation list — starts at y:79 per Figma layout_M11QP9 */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 100 }}
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

      {/* Bottom nav */}
      <LightBottomNav activeTab="chat" onTabPress={onTabPress} />
    </View>
  );
}

/* ── Styles — all values from Figma ── */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  /* Header */
  headerArea: {
    paddingHorizontal: 18,
    paddingBottom: 4,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 26,
    letterSpacing: 26 * -0.02,   // -2% per Figma
    color: "rgba(0,0,0,0.91)",    // Black/0000
    marginTop: 4,
    lineHeight: 30,
  },

  /* List */
  list: {
    flex: 1,
  },

  /* Row — Figma: mode:row, alignItems:center, gap:11, padding:15 18 */
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E4E4",  // White/300
    backgroundColor: "#FFFFFF",
  },

  /* Avatar — Figma: 45×45, borderRadius:60px → fully round */
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    overflow: "hidden",
    flexShrink: 0,
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  /* Right content column — gap:7 between name-row and preview */
  rowContent: {
    flex: 1,
    gap: 7,
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  /* Name — Ubuntu Medium 16, -2%, Black/200 */
  name: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 16,
    letterSpacing: 16 * -0.02,
    color: "#262525",
    flexShrink: 1,
    marginRight: 8,
  },

  /* Time — Ubuntu Regular 14, -2% */
  time: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    letterSpacing: 14 * -0.02,
    flexShrink: 0,
  },

  /* Preview — Ubuntu Regular 15, -2% */
  preview: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 15,
    letterSpacing: 15 * -0.02,
  },

  /* Photo row — Figma: mode:row, alignItems:center, gap:7 */
  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  photoLabel: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 15,
    letterSpacing: 15 * -0.02,
    color: "#1B17B3",
  },
});
