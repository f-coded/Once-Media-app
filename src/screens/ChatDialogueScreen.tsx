import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AVATAR_KELECHI = require("../../assets/avatar-kelechi.png");
const PROPERTY_IMG = require("../../assets/chat-property-card.png");
const PROPERTY_IMG_2 = require("../../assets/feed_property_2.jpg");

/* ── Icons ── */
function BackIcon() {
  return (
    <Svg width={18} height={36} viewBox="0 0 18 36" fill="none">
      <Path
        d="M15 18H3M7.5 22.5L3 18L7.5 13.5"
        stroke="#262525"
        strokeWidth={1.125}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function VideoCamIcon() {
  return (
    <Svg width={22} height={18} viewBox="0 0 22 18" fill="none">
      <Path
        d="M1 9.5C1 6.96 1 5.69 1.77 4.72C1.9 4.56 2.04 4.41 2.2 4.27C3.12 3.5 4.48 3.5 7.21 3.5C9.94 3.5 11.3 3.5 12.22 4.27C12.38 4.41 12.52 4.56 12.65 4.72C13.42 5.69 13.42 6.96 13.42 9.5V10.33C13.42 12.87 13.42 14.14 12.65 15.11C12.52 15.27 12.38 15.42 12.22 15.56C11.3 16.33 9.94 16.33 7.21 16.33C4.48 16.33 3.12 16.33 2.2 15.56C2.04 15.42 1.9 15.27 1.77 15.11C1 14.14 1 12.87 1 10.33V9.5Z"
        stroke="#434343"
        strokeWidth={1.25}
      />
      <Path
        d="M13.42 8L14 7.72C15.64 6.89 16.46 6.47 17.06 6.83C17.67 7.18 17.67 8.08 17.67 9.87V10.12C17.67 11.91 17.67 12.81 17.06 13.17C16.46 13.53 15.64 13.1 14 12.28L13.42 12V8Z"
        stroke="#434343"
        strokeWidth={1.25}
      />
    </Svg>
  );
}

function PhoneIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M2.25 3.75C2.25 2.92 2.92 2.25 3.75 2.25H5.5C5.87 2.25 6.2 2.49 6.32 2.85L7.32 5.85C7.46 6.26 7.29 6.7 6.92 6.92L5.59 7.72C6.43 9.56 7.94 11.07 9.78 11.91L10.58 10.58C10.8 10.21 11.24 10.04 11.65 10.18L14.65 11.18C15.01 11.3 15.25 11.63 15.25 12V13.75C15.25 14.58 14.58 15.25 13.75 15.25H13C7.06 15.25 2.25 10.44 2.25 4.5V3.75Z"
        stroke="#434343"
        strokeWidth={1.125}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function MapPinIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path
        d="M12 5.33C12 3.03 10.21 1.33 8 1.33C5.79 1.33 4 3.03 4 5.13C4 7.22 5.28 9.65 7.27 10.51C7.73 10.72 8.27 10.72 8.73 10.51C10.72 9.65 12 7.22 12 5.13V5.33Z"
        stroke="#434343"
        strokeWidth={1}
      />
      <Circle cx={8} cy={5.33} r={1.33} stroke="#434343" strokeWidth={1} />
    </Svg>
  );
}

function SendIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/* ── Types ── */
type MessageBase = { id: string; time: string };
type SentMessage = MessageBase & { from: "you"; text: string };
type ReceivedMessage = MessageBase & { from: "them"; senderName: string; text: string };
type PropertyCardMessage = MessageBase & { type: "property" };
type ImageMessage = MessageBase & { from: "them"; senderName: string; images: any[] };

type Message = SentMessage | ReceivedMessage | PropertyCardMessage | ImageMessage;

/* ── Mock thread (matches Figma dialogue screens) ── */
const INITIAL_MESSAGES: Message[] = [
  { id: "prop", type: "property", time: "" },
  {
    id: "1",
    from: "you",
    text: "Hi, I'd like to make an inquiry about the Sea Watch Mansion in Onipan.",
    time: "12:54 PM",
  },
  {
    id: "2",
    from: "them",
    senderName: "Kelechi Obi",
    text: "Hello, thank you for your interest in Sea Watch Mansion. I'd be happy to share more details about the property, including pricing and viewing arrangements.",
    time: "12:58 PM",
  },
  {
    id: "3",
    from: "you",
    text: "Can i get some image of the gate?",
    time: "01:00 PM",
  },
  {
    id: "4",
    from: "them",
    senderName: "Kelechi Obi",
    text: "Yes",
    time: "12:58 PM",
  },
  {
    id: "5",
    from: "them",
    senderName: "Kelechi Obi",
    images: [PROPERTY_IMG, PROPERTY_IMG_2],
    time: "12:58 PM",
  } as ImageMessage,
];

/* ── Sender label row ── */
function SenderLabel({ name, time }: { name: string; time: string }) {
  return (
    <View style={styles.senderRow}>
      <View style={styles.avatarSmall}>
        <Image source={AVATAR_KELECHI} style={{ width: "100%", height: "100%", resizeMode: "cover" }} />
      </View>
      <Text style={styles.senderName}>{name}</Text>
      <View style={styles.dot} />
      <Text style={styles.msgTime}>{time}</Text>
    </View>
  );
}

/* ── Message bubbles ── */
function PropertyCard() {
  return (
    <View style={styles.propertyCard}>
      <Image source={PROPERTY_IMG} style={styles.propertyImage} />
      <View style={styles.propertyInfo}>
        <View>
          <Text style={styles.propertyName}>Sea Watch Mansion</Text>
          <View style={styles.locationRow}>
            <MapPinIcon />
            <Text style={styles.locationText}>Onipanu, Lagos</Text>
          </View>
        </View>
        <Text style={styles.propertyPrice}>₦300,000</Text>
      </View>
    </View>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  if ("type" in msg && msg.type === "property") {
    return (
      <View style={styles.propertyWrapper}>
        <PropertyCard />
        {/* The "you" bubble below the card */}
        <View style={styles.youBubble}>
          <Text style={styles.youText}>
            Hi, I'd like to make an inquiry about the Sea Watch Mansion in Onipan.
          </Text>
        </View>
        <View style={styles.youMeta}>
          <Text style={styles.youMetaName}>You</Text>
          <View style={styles.dot} />
          <Text style={styles.msgTime}>12:54 PM</Text>
        </View>
      </View>
    );
  }

  if ("images" in msg) {
    const imgMsg = msg as ImageMessage;
    return (
      <View style={styles.receivedGroup}>
        <SenderLabel name={imgMsg.senderName} time={imgMsg.time} />
        <View style={styles.imageGrid}>
          {imgMsg.images.map((src, i) => (
            <Image key={i} source={src} style={styles.gridImage} />
          ))}
        </View>
      </View>
    );
  }

  if (msg.from === "you") {
    const m = msg as SentMessage;
    return (
      <View style={styles.youGroup}>
        <View style={styles.youBubble}>
          <Text style={styles.youText}>{m.text}</Text>
        </View>
        <View style={styles.youMeta}>
          <Text style={styles.youMetaName}>You</Text>
          <View style={styles.dot} />
          <Text style={styles.msgTime}>{m.time}</Text>
        </View>
      </View>
    );
  }

  if (msg.from === "them") {
    const m = msg as ReceivedMessage;
    return (
      <View style={styles.receivedGroup}>
        <SenderLabel name={m.senderName} time={m.time} />
        <View style={styles.themBubble}>
          <Text style={styles.themText}>{m.text}</Text>
        </View>
      </View>
    );
  }

  return null;
}

/* ── Screen ── */
type ChatDialogueScreenProps = {
  contactName?: string;
  onBack?: () => void;
};

export function ChatDialogueScreen({
  contactName = "Kelechi Obi",
  onBack,
}: ChatDialogueScreenProps) {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  const sendMessage = () => {
    const text = inputText.trim();
    if (!text) return;
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), from: "you", text, time } as SentMessage,
    ]);
    setInputText("");
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerLeft}>
          <Pressable onPress={onBack} style={styles.backBtn} hitSlop={12}>
            <BackIcon />
          </Pressable>
          <View style={styles.headerAvatar}>
            <Image source={AVATAR_KELECHI} style={{ width: "100%", height: "100%", resizeMode: "cover" }} />
          </View>
          <Text style={styles.headerName}>{contactName}</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.actionBtn} hitSlop={10}>
            <VideoCamIcon />
          </Pressable>
          <Pressable style={styles.actionBtn} hitSlop={10}>
            <PhoneIcon />
          </Pressable>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
      </ScrollView>

      {/* Input bar */}
      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 6 }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Enter you Message here"
            placeholderTextColor="#838383"
            value={inputText}
            onChangeText={setInputText}
            multiline
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />
        </View>
        <Pressable style={styles.sendBtn} onPress={sendMessage}>
          <SendIcon />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

/* ── Styles ── */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E4E4",
    backgroundColor: "#FFFFFF",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#1B17B3",
  },
  headerName: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 16,
    letterSpacing: -0.32,
    color: "#0C0C0C",
  },
  headerActions: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  actionBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  /* Messages */
  messages: {
    flex: 1,
  },
  messagesContent: {
    padding: 18,
    gap: 16,
    paddingBottom: 12,
  },
  /* Sender label */
  senderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 4,
  },
  avatarSmall: {
    width: 22,
    height: 22,
    borderRadius: 11,
    overflow: "hidden",
    backgroundColor: "#1B17B3",
  },
  senderName: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 16,
    letterSpacing: -0.32,
    color: "#0C0C0C",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D9D9D9",
    marginHorizontal: 1,
  },
  msgTime: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 12,
    letterSpacing: -0.24,
    color: "#434343",
  },
  /* Property card */
  propertyWrapper: {
    alignItems: "flex-end",
    gap: 6,
  },
  propertyCard: {
    width: 231,
    borderRadius: 16,
    backgroundColor: "#F2F2F2",
    overflow: "hidden",
  },
  propertyImage: {
    width: "100%",
    height: 137,
    resizeMode: "cover",
  },
  propertyInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
  },
  propertyName: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 14,
    letterSpacing: -0.28,
    color: "#262525",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
    marginTop: 6,
  },
  locationText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 13,
    letterSpacing: -0.26,
    color: "#434343",
  },
  propertyPrice: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 16,
    letterSpacing: -0.32,
    color: "#0C0C0C",
  },
  /* You bubble */
  youGroup: {
    alignItems: "flex-end",
    gap: 4,
  },
  youBubble: {
    backgroundColor: "#1B17B3",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    maxWidth: 272,
  },
  youText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    lineHeight: 14 * 1.35,
    letterSpacing: -0.28,
    color: "#FFFFFF",
  },
  youMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  youMetaName: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 12,
    letterSpacing: -0.24,
    color: "#262525",
  },
  /* Them bubble */
  receivedGroup: {
    alignItems: "flex-start",
    gap: 2,
    maxWidth: 272,
  },
  themBubble: {
    backgroundColor: "#F2F2F2",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignSelf: "stretch",
  },
  themText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    lineHeight: 14 * 1.35,
    letterSpacing: -0.28,
    color: "#262525",
  },
  /* Image grid */
  imageGrid: {
    flexDirection: "row",
    gap: 6,
  },
  gridImage: {
    flex: 1,
    height: 133,
    borderRadius: 16,
    resizeMode: "cover",
  },
  /* Input bar */
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F2",
    backgroundColor: "#FFFFFF",
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#E4E4E4",
    paddingHorizontal: 14,
    paddingVertical: 9,
    height: 50,
    justifyContent: "center",
  },
  textInput: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 13,
    letterSpacing: -0.26,
    color: "#262525",
    padding: 0,
    margin: 0,
  },
  sendBtn: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: "#1B17B3",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});
