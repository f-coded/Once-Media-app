import React, { useState, useRef, useEffect } from "react";
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
  BackHandler,
  Keyboard,
} from "react-native";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AVATAR_KELECHI = require("../../../../assets/avatar-kelechi.png");
const PROPERTY_IMG   = require("../../../../assets/chat-property-card.png");
const PROPERTY_IMG_2 = require("../../../../assets/feed_property_2.jpg");

/* ─────────────────────────────────────────────
   SVG Icons
───────────────────────────────────────────── */

/** Back arrow */
export function BackArrowIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.75 12H3.25M3.25 12L10 5.25M3.25 12L10 18.75"
        stroke="#363636"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Video camera */
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

/** Phone*/
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

/** Map pin */
function MapPinIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      {/* Map fold background */}
      <Path
        d="M18 8L18.9487 8.31623C19.9387 8.64624 20.4337 8.81124 20.7169 9.20407C21 9.5969 21 10.1187 21 11.1623V16.829C21 18.1199 21 18.7653 20.6603 19.18C20.5449 19.3208 20.4048 19.4394 20.247 19.5301C19.7821 19.797 19.1455 19.6909 17.8721 19.4787C16.6157 19.2693 15.9875 19.1646 15.3648 19.2167C15.1463 19.235 14.9292 19.2676 14.715 19.3144C14.1046 19.4477 13.5299 19.735 12.3806 20.3097C10.8809 21.0596 10.131 21.4345 9.33284 21.5501C9.09242 21.5849 8.8498 21.6021 8.60688 21.6016C7.80035 21.6001 7.01186 21.3373 5.43488 20.8116L5.05132 20.6838C4.06129 20.3538 3.56627 20.1888 3.28314 19.7959C3 19.4031 3 18.8813 3 17.8377V12.908C3 11.2491 3 10.4197 3.48841 9.97358C3.57388 9.89552 3.66809 9.82762 3.76917 9.77122C4.34681 9.44894 5.13369 9.71123 6.70746 10.2358"
        stroke="#434343"
        strokeWidth={1.5}
      />
      {/* Pin shape */}
      <Path
        d="M6 7.70031C6 4.55211 8.68629 2 12 2C15.3137 2 18 4.55211 18 7.70031C18 10.8238 16.085 14.4687 13.0972 15.7721C12.4007 16.076 11.5993 16.076 10.9028 15.7721C7.91499 14.4687 6 10.8238 6 7.70031Z"
        stroke="#434343"
        strokeWidth={1.5}
      />
      {/* Center dot */}
      <Circle cx={12} cy={8} r={2} stroke="#434343" strokeWidth={1.5} />
    </Svg>
  );
}

/** Send / paper plane */
function SendIcon() {
  return (
    <Svg width={22} height={22} viewBox="28 14 24 24" fill="none">
      {/* Paper plane body */}
      <Path
        d="M45.0829 28.3643L46.6563 23.6441C48.0308 19.5205 48.718 17.4588 47.6297 16.3705C46.5414 15.2821 44.4796 15.9694 40.3561 17.3439L35.6359 18.9173C32.3078 20.0267 30.6438 20.5813 30.1709 21.3947C29.721 22.1685 29.721 23.1242 30.1709 23.898C30.6438 24.7114 32.3078 25.2661 35.6359 26.3755C36.1702 26.5536 36.4374 26.6426 36.6608 26.7922C36.8772 26.937 37.0631 27.123 37.208 27.3394C37.3575 27.5627 37.4466 27.8299 37.6247 28.3643C38.7341 31.6924 39.2887 33.3564 40.1021 33.8293C40.8759 34.2791 41.8316 34.2791 42.6054 33.8293C43.4188 33.3564 43.9735 31.6924 45.0829 28.3643Z"
        stroke="white"
        strokeWidth={1.375}
      />
      {/* Diagonal line */}
      <Path
        d="M42.8605 22.1112C43.1305 21.8442 43.1329 21.4089 42.8659 21.1389C42.5989 20.8689 42.1636 20.8665 41.8936 21.1335L42.377 21.6223L42.8605 22.1112ZM37.2905 26.6528L37.774 27.1416L42.8605 22.1112L42.377 21.6223L41.8936 21.1335L36.8071 26.164L37.2905 26.6528Z"
        fill="white"
      />
    </Svg>
  );
}

/* ─────────────────────────────────────────────
   Types & mock data
───────────────────────────────────────────── */
type MessageBase   = { id: string; time: string };
type SentMessage   = MessageBase & { from: "you"; text: string };
type ReceivedMessage = MessageBase & { from: "them"; senderName: string; text: string };
type PropertyCardMessage = MessageBase & { type: "property"; from?: never };
type ImageMessage  = MessageBase & { from: "them"; senderName: string; images: any[] };
type Message = SentMessage | ReceivedMessage | PropertyCardMessage | ImageMessage;

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

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */

/** Sender label: avatar (22×22) · Name · dot · time */
function SenderLabel({ name, time }: { name: string; time: string }) {
  return (
    <View style={styles.senderRow}>
      <View style={styles.senderAvatar}>
        <Image source={AVATAR_KELECHI} style={styles.fillImg} />
      </View>
      <Text style={styles.senderName}>{name}</Text>
      {/* dot — Figma: 4×4, fill #D9D9D9 */}
      <View style={styles.dot} />
      <Text style={styles.msgTime}>{time}</Text>
    </View>
  );
}

/** Property card (231×auto) */
function PropertyCard() {
  return (
    <View style={styles.propertyCard}>
      <Image source={PROPERTY_IMG} style={styles.propertyImage} />
      {/* info row*/}
      <View style={styles.propertyInfo}>
        <View style={styles.propertyLeft}>
          <Text style={styles.propertyName}>Sea Watch Mansion</Text>
          {/* location row — gap: 1px */}
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

/** Message bubble dispatcher */
function MessageBubble({ msg }: { msg: Message }) {
  /* Property card + first "you" message */
  if ("type" in msg && msg.type === "property") {
    return (
      <View style={styles.youGroup}>
        <PropertyCard />
        {/* the sent bubble that comes with the card */}
        <View style={styles.youBubble}>
          <Text style={styles.bubbleText}>
            Hi, I'd like to make an inquiry about the Sea Watch Mansion in Onipan.
          </Text>
        </View>
        {/* meta */}
        <View style={styles.metaRow}>
          <Text style={styles.metaName}>You</Text>
          <View style={styles.dot} />
          <Text style={styles.msgTime}>12:54 PM</Text>
        </View>
      </View>
    );
  }

  /* Image grid message */
  if ("images" in msg) {
    const m = msg as ImageMessage;
    return (
      <View style={styles.themGroup}>
        <SenderLabel name={m.senderName} time={m.time} />
        <View style={styles.imageGrid}>
          {m.images.map((src, i) => (
            <Image key={i} source={src} style={styles.gridImage} />
          ))}
        </View>
      </View>
    );
  }

  /* Sent */
  if (msg.from === "you") {
    const m = msg as SentMessage;
    return (
      <View style={styles.youGroup}>
        <View style={styles.youBubble}>
          <Text style={styles.bubbleText}>{m.text}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaName}>You</Text>
          <View style={styles.dot} />
          <Text style={styles.msgTime}>{m.time}</Text>
        </View>
      </View>
    );
  }

  /* Received */
  if (msg.from === "them") {
    const m = msg as ReceivedMessage;
    return (
      <View style={styles.themGroup}>
        <SenderLabel name={m.senderName} time={m.time} />
        <View style={styles.themBubble}>
          <Text style={styles.themText}>{m.text}</Text>
        </View>
      </View>
    );
  }

  return null;
}

/* ─────────────────────────────────────────────
   Screen
───────────────────────────────────────────── */
type ChatDialogueScreenProps = {
  contactName?: string;
  onBack?: () => void;
};

export const LIGHT_NAV_HEIGHT = 70;
export function ChatDialogueScreen({
  contactName = "Kelechi Obi",
  onBack,
}: ChatDialogueScreenProps) {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  /* Keyboard visibility listener */
  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  /* Android hardware back button */
  useEffect(() => {
    if (!onBack) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack]);

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
    <View style={styles.root}>

      {/* Header — stays fixed at top, unaffected by keyboard */}
      <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
        {/* Left: back + avatar (35×35) + name */}
        <View style={styles.headerLeft}>
          <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
            <BackArrowIcon/>
          </Pressable>

          {/* Avatar  */}
          <View style={styles.headerAvatar}>
            <Image source={AVATAR_KELECHI} style={styles.fillImg} />
          </View>

          {/* Name — Ubuntu Medium 16, Black/100 (#0C0C0C) */}
          <Text style={styles.headerName}>{contactName}</Text>
        </View>

        {/* Right: video + phone*/}
        <View style={styles.headerActions}>
          <Pressable hitSlop={10}><VideoCamIcon /></Pressable>
          <Pressable hitSlop={10}><PhoneIcon /></Pressable>
        </View>
      </View>

      {/* Separator line */}
      <View style={styles.separator} />

      <KeyboardAvoidingView
        style={styles.keyboardArea}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {/* ── Messages ── */}
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
        <View
          style={[
            styles.inputBar,  
            {
              paddingBottom: keyboardVisible
                ? 10
                : insets.bottom > 0
                ? insets.bottom + 6
                : 12,
            },
          ]}
        >
          {/* Input field  */}
          <Pressable
            style={styles.inputWrapper}
            onPress={() => inputRef.current?.focus()}
          >
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              placeholder="Enter you Message here"
              placeholderTextColor="#838383"
              value={inputText}
              onChangeText={setInputText}
              multiline={false}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
            />
          </Pressable>

          {/* Send button */}
          <Pressable style={styles.sendBtn} onPress={sendMessage}>
            <SendIcon />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ────────────────────────────────────────────
   Styles
───────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardArea: {
    flex: 1,
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 15,
    backgroundColor: "#FFFFFF",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  backBtn: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  /* Avatar  */
  headerAvatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    overflow: "hidden",
    backgroundColor: "#1B17B3",
  },
  fillImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  /* Name */
  headerName: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 16,
    letterSpacing: 16 * -0.02,
    color: "#0C0C0C",
  },
  /* Actions row — gap 16 */
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  separator: {
    height: 1,
    backgroundColor: "#E4E4E4",
  },

  /* Messages scroll */
  messages: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 16,
  },

  /* Sender label row: avatar 22×22, gap 3 */
  senderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  senderAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    overflow: "hidden",
    backgroundColor: "#1B17B3",
  },
  senderName: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 16,
    letterSpacing: 16 * -0.02,
    color: "#0C0C0C",
  },
  /* Dot separator  */
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D9D9D9",
  },
  /* Time*/
  msgTime: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 12,
    letterSpacing: 12 * -0.02,
    color: "#434343",
  },

  /* Property card*/
  propertyCard: {
    width: 231,
    borderRadius: 16,
    backgroundColor: "#F2F2F2",
    overflow: "hidden",
    alignSelf: "flex-end",
  },
  /* Image */
  propertyImage: {
    width: "100%",
    height: 137,
    resizeMode: "cover",
  },
  /* Info row  */
  propertyInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start", // Changed from center to align with top line
    padding: 8,
  },
  propertyLeft: {
    gap: 6,
  },
  /* Property name  */
  propertyName: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 14,
    letterSpacing: 14 * -0.02,
    color: "#262525",
  },
  /* Location*/
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
  },
  /* Location text */
  locationText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 13,
    letterSpacing: 13 * -0.02,
    color: "#434343",
  },
  /* Price */
  propertyPrice: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 16,
    letterSpacing: 16 * -0.02,
    color: "#0C0C0C",
  },

  /* Sent (you) group */
  youGroup: {
    alignItems: "flex-end",
    gap: 6,
  },
  /* Sent bubble */
  youBubble: {
    backgroundColor: "#1B17B3",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    maxWidth: 272,
  },
  /* Bubble text */
  bubbleText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    lineHeight: 14 * 1.35,
    letterSpacing: 14 * -0.02,
    color: "#FFFFFF",
  },
  /* Meta row: You · dot · time */
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  /* "You" label  */
  metaName: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 12,
    letterSpacing: 12 * -0.02,
    color: "#262525",
  },

  /* Received (them) group */
  themGroup: {
    alignItems: "flex-start",
    maxWidth: 272,
    gap: 6,
  },
  /* Received bubble  */
  themBubble: {
    backgroundColor: "#F2F2F2",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  /* Received text */
  themText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    lineHeight: 14 * 1.35,
    letterSpacing: 14 * -0.02,
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
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F2",
    backgroundColor: "#FFFFFF",
  },
  /* Input field */
  inputWrapper: {
    flex: 1,
    height: 50,
    backgroundColor: "#F2F2F2",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#E4E4E4",
    paddingHorizontal: 14,
    paddingVertical: 9,
    justifyContent: "center",   
  },
  textInput: {
    flex: 1,
    fontFamily: "Ubuntu_400Regular",
    fontSize: 13,
    letterSpacing: 13 * -0.02,
    color: "#262525",
    padding: 0,
    margin: 0,
  },
  /* Send button */
  sendBtn: {
    width: 78,
    height: 50,
    borderRadius: 30,
    backgroundColor: "#1B17B3",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});
