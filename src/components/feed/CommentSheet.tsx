import React, { forwardRef, useCallback, useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import BottomSheet, { BottomSheetFlatList, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { font } from "../AuthUI";
import { CloseIcon, SendIcon } from "./FeedIcons";

type Comment = {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  replies?: Comment[];
};

const MOCK_COMMENTS: Comment[] = [
  {
    id: "1",
    user: "Adaeze N.",
    avatar: "https://i.pravatar.cc/100?img=1",
    text: "This property is absolutely stunning! The waterfront view is breathtaking 😍",
    time: "2h ago",
    replies: [
      { id: "1a", user: "Kelechi Obi", avatar: "https://i.pravatar.cc/100?img=3", text: "Thank you! The sunset view is even better 🌅", time: "1h ago" },
    ],
  },
  {
    id: "2",
    user: "Emeka C.",
    avatar: "https://i.pravatar.cc/100?img=5",
    text: "What's the asking price for this? Very interested.",
    time: "4h ago",
  },
  {
    id: "3",
    user: "Ngozi A.",
    avatar: "https://i.pravatar.cc/100?img=9",
    text: "Beautiful architecture! Is this in Lekki or Victoria Island?",
    time: "5h ago",
  },
  {
    id: "4",
    user: "Chidi O.",
    avatar: "https://i.pravatar.cc/100?img=11",
    text: "The interior design is world class 🔥",
    time: "6h ago",
  },
];

type CommentSheetProps = {
  onClose: () => void;
};

export const CommentSheet = forwardRef<BottomSheet, CommentSheetProps>(({ onClose }, ref) => {
  const snapPoints = useMemo(() => ["60%", "90%"], []);
  const [commentText, setCommentText] = useState("");

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );

  const renderComment = useCallback(({ item, indent = false }: { item: Comment; indent?: boolean }) => (
    <View style={[styles.commentRow, indent && styles.replyIndent]}>
      <View style={[styles.commentAvatar, { width: indent ? 28 : 34, height: indent ? 28 : 34, borderRadius: indent ? 14 : 17 }]}>
        <Text style={{ fontSize: indent ? 12 : 14 }}>👤</Text>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={font("Ubuntu_500Medium", indent ? 12 : 13, "#0C0C0C")}>{item.user}</Text>
          <Text style={font("Ubuntu_400Regular", 11, "#838383")}>{item.time}</Text>
        </View>
        <Text style={font("Ubuntu_400Regular", 13, "#4A4A4A", 18)}>{item.text}</Text>
        {!indent && (
          <Pressable hitSlop={{ top: 4, bottom: 4 }}>
            <Text style={{ ...font("Ubuntu_500Medium", 11, "#838383"), marginTop: 4 }}>Reply</Text>
          </Pressable>
        )}
      </View>
    </View>
  ), []);

  // Flatten comments with replies for FlatList
  const flatComments = useMemo(() => {
    const result: { item: Comment; indent: boolean }[] = [];
    MOCK_COMMENTS.forEach((comment) => {
      result.push({ item: comment, indent: false });
      comment.replies?.forEach((reply) => {
        result.push({ item: reply, indent: true });
      });
    });
    return result;
  }, []);

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      enableDynamicSizing={false}
      backdropComponent={renderBackdrop}
      onClose={onClose}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={font("Ubuntu_700Bold", 16, "#0C0C0C")}>Comments</Text>
        <Text style={font("Ubuntu_400Regular", 13, "#838383")}>{MOCK_COMMENTS.length}</Text>
        <View style={{ flex: 1 }} />
        <Pressable onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <CloseIcon size={20} />
        </Pressable>
      </View>

      {/* Comments list */}
      <BottomSheetFlatList
        data={flatComments}
        keyExtractor={(item, index) => item.item.id + (item.indent ? "-reply" : "") + index}
        renderItem={({ item }) => renderComment(item)}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Input bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={10}
      >
        <View style={styles.inputBar}>
          <View style={styles.inputAvatar}>
            <Text style={{ fontSize: 14 }}>👤</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            placeholderTextColor="#838383"
            value={commentText}
            onChangeText={setCommentText}
          />
          <Pressable
            style={[styles.sendBtn, { opacity: commentText.trim() ? 1 : 0.4 }]}
            disabled={!commentText.trim()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <SendIcon size={18} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: {
    backgroundColor: "#D2D2D2",
    width: 36,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
  },
  commentRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  replyIndent: {
    paddingLeft: 64,
  },
  commentAvatar: {
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  inputBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F2F2F2",
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: "#F2F2F2",
    borderRadius: 20,
    paddingHorizontal: 14,
    fontFamily: "Ubuntu_400Regular",
    fontSize: 13,
    color: "#0C0C0C",
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F7FF",
    alignItems: "center",
    justifyContent: "center",
  },
});
