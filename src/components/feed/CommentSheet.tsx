import React, { forwardRef, useCallback, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

import { font } from "../AuthUI";
import { CloseIcon, SendIcon } from "./FeedIcons";

type Comment = {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  replies: number;
};

const COMMENTS: Comment[] = [
  {
    id: "1",
    user: "Kelechi Obi",
    avatar: "https://i.pravatar.cc/100?img=3",
    text: "This looks like a beautiful property. Is it still available for viewing?",
    time: "12:58 PM",
    replies: 12,
  },
  {
    id: "2",
    user: "Dominic Sobozlai",
    avatar: "https://i.pravatar.cc/100?img=5",
    text: "I really like the layout and the outdoor space. Could you share the price and location details",
    time: "12:58 PM",
    replies: 12,
  },
  {
    id: "3",
    user: "Bukunmi Israel",
    avatar: "https://i.pravatar.cc/100?img=9",
    text: "The interior design looks great. Is the property newly built?",
    time: "12:58 PM",
    replies: 12,
  },
  {
    id: "4",
    user: "Bimbola Kasimawo",
    avatar: "https://i.pravatar.cc/100?img=11",
    text: "Love this listing. Can the agent arrange a weekend inspection?",
    time: "12:58 PM",
    replies: 5,
  },
  {
    id: "5",
    user: "Amara Eze",
    avatar: "https://i.pravatar.cc/100?img=15",
    text: "The lighting in this home is gorgeous. The balcony view is a serious plus.",
    time: "1:05 PM",
    replies: 3,
  },
];

type CommentSheetProps = {
  onClose: () => void;
};

export const CommentSheet = forwardRef<BottomSheet, CommentSheetProps>(({ onClose }, ref) => {
  const snapPoints = useMemo(() => ["55%", "90%"], []);
  const inputRef = useRef<TextInput>(null);
  const [commentText, setCommentText] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [replyType, setReplyType] = useState<"post author" | "comment by">("post author");
  const [replyName, setReplyName] = useState("Kelechi Obi");

  const focusComposer = useCallback((type: "post author" | "comment by", name: string) => {
    setReplyType(type);
    setReplyName(name);
    setIsAdding(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const blurComposer = useCallback(() => {
    if (!commentText.trim()) {
      setIsAdding(false);
      setReplyType("post author");
      setReplyName("Kelechi Obi");
    }
  }, [commentText]);

  const sendComment = useCallback(() => {
    if (!commentText.trim()) return;
    setCommentText("");
    setIsAdding(false);
    setReplyType("post author");
    setReplyName("Kelechi Obi");
    inputRef.current?.blur();
  }, [commentText]);

  const renderComment = useCallback(({ item }: { item: Comment }) => (
    <View style={styles.commentBlock}>
      <View style={styles.commentMeta}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} contentFit="cover" />
        <Text style={styles.name} numberOfLines={1}>{item.user}</Text>
        <View style={styles.metaDot} />
        <Text style={styles.time}>{item.time}</Text>
      </View>

      <View style={styles.bubble}>
        <Text style={styles.commentText}>{item.text}</Text>
      </View>

      <Pressable
        style={styles.replyRow}
        onPress={() => focusComposer("comment by", item.user)}
        hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
      >
        <Text style={styles.reply}>Reply</Text>
        <View style={styles.replyDot} />
        <Text style={styles.replyCount}>{item.replies} Replies</Text>
      </Pressable>
    </View>
  ), [focusComposer]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      enableDynamicSizing={false}
      backdropComponent={renderBackdrop}
      onClose={onClose}
      backgroundStyle={styles.sheetBg}
      handleComponent={() => null}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetView style={styles.panel}>
        <View style={styles.commentsLayer}>
          <View style={styles.header}>
            <Text style={styles.title}>Comment</Text>
            <Pressable
              style={styles.close}
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <CloseIcon size={20} />
            </Pressable>
          </View>

          <BottomSheetFlatList
            data={COMMENTS}
            keyExtractor={(item) => item.id}
            renderItem={renderComment}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        </View>

        {isAdding && (
          <BlurView
            intensity={14}
            tint="light"
            experimentalBlurMethod="dimezisBlurView"
            blurReductionFactor={1}
            pointerEvents="none"
            style={styles.innerBlur}
          />
        )}

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={10}
          style={styles.composer}
        >
          {isAdding && (
            <Text style={styles.replying}>
              Replying to {replyType} ~{replyName}
            </Text>
          )}

          <Pressable
            style={styles.inputPill}
            onPress={() => focusComposer("post author", "Kelechi Obi")}
          >
            <BottomSheetTextInput
              ref={inputRef as any}
              style={styles.input}
              placeholder="Add Comment"
              placeholderTextColor="#8E8E8E"
              value={commentText}
              onChangeText={setCommentText}
              onFocus={() => setIsAdding(true)}
              onBlur={blurComposer}
              returnKeyType="send"
              onSubmitEditing={sendComment}
            />
            {commentText.trim() ? (
              <Pressable style={styles.send} onPress={sendComment}>
                <SendIcon size={18} />
              </Pressable>
            ) : null}
          </Pressable>
        </KeyboardAvoidingView>
      </BottomSheetView>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  panel: {
    flex: 1,
    overflow: "hidden",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#FFFFFF",
  },
  commentsLayer: {
    flex: 1,
  },
  header: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    ...font("Ubuntu_700Bold", 18, "#0C0C0C"),
  },
  close: {
    marginLeft: "auto",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 98,
  },
  commentBlock: {
    paddingBottom: 12,
  },
  commentMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 6,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#F2F2F2",
  },
  name: {
    ...font("Ubuntu_500Medium", 16, "#555555"),
    maxWidth: 190,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#9A9A9A",
  },
  time: {
    ...font("Ubuntu_400Regular", 12, "#777777"),
  },
  bubble: {
    alignSelf: "flex-start",
    maxWidth: "94%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#F0F0F0",
  },
  commentText: {
    ...font("Ubuntu_400Regular", 14, "#282828", 19),
  },
  replyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },
  reply: {
    ...font("Ubuntu_700Bold", 14, "#1B17B3"),
  },
  replyDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#777777",
  },
  replyCount: {
    ...font("Ubuntu_400Regular", 12, "#555555"),
  },
  innerBlur: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  composer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
  },
  replying: {
    ...font("Ubuntu_400Regular", 14, "#1B17B3"),
    marginBottom: 10,
  },
  inputPill: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: "#F0F0F0",
  },
  input: {
    flex: 1,
    minHeight: 44,
    paddingVertical: 10,
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    color: "#0C0C0C",
  },
  send: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E7F1FF",
  },
});
