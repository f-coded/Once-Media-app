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
import { Image } from "expo-image";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
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
  {
    id: "6",
    user: "Kelechi Obi",
    avatar: "https://i.pravatar.cc/100?img=20",
    text: "This looks like a beautiful property. Is it still available for viewing?",
    time: "12:58 PM",
    replies: 12,
  },
  {
    id: "7",
    user: "Kelechi Obi",
    avatar: "https://i.pravatar.cc/100?img=24",
    text: "This looks like a beautiful property. Is it still available for viewing?",
    time: "12:58 PM",
    replies: 12,
  },
  {
    id: "8",
    user: "Bukunmi Israel",
    avatar: "https://i.pravatar.cc/100?img=30",
    text: "The interior design looks great. Is the property newly built?",
    time: "12:58 PM",
    replies: 12,
  },
];

type CommentSheetProps = {
  onClose: () => void;
};

export const CommentSheet = forwardRef<BottomSheet, CommentSheetProps>(({ onClose }, ref) => {
  const snapPoints = useMemo(() => ["65%"], []);   
  const bottomSheetRef = useRef<BottomSheet>(null);
  const inputRef = useRef<TextInput>(null);
  const [commentText, setCommentText] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [replyType, setReplyType] = useState<"post author" | "comment by">("post author");
  const [replyName, setReplyName] = useState("Kelechi Obi");

  // Sync internal ref with forwarded ref
  React.useImperativeHandle(ref, () => bottomSheetRef.current!);

  // Guarantee the sheet snaps to the first point on mount
  React.useEffect(() => {
    const timer = setTimeout(() => {
      bottomSheetRef.current?.snapToIndex(0);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

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
        pressBehavior="none"
      />
    ),
    []
  );

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        animateOnMount={true}
        enableContentPanningGesture={false}
        enableHandlePanningGesture={false}
        backgroundStyle={{ backgroundColor: "transparent" }}
        handleComponent={() => null}
        backdropComponent={renderBackdrop}
        onClose={onClose}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
      >
        <BottomSheetView style={styles.sheetContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Comments</Text>
            <Pressable
              style={styles.close}
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <CloseIcon size={20} />
            </Pressable>
          </View>

          <BottomSheetScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {COMMENTS.map((comment) => (
              <View key={comment.id}>
                {renderComment({ item: comment })}
              </View>
            ))}
          </BottomSheetScrollView>
        </BottomSheetView>
      </BottomSheet>

      {/* Composer pinned OUTSIDE the sheet at the very bottom */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
        style={styles.composer}
      >
        {isAdding && (
          <Text style={styles.replying}>
            Replying to 
            <Text style={styles.replyName}>
              ~ {replyName}
            </Text>
          </Text>
        )}

        <View style={styles.inputPill}>
          <TextInput
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
        </View>
      </KeyboardAvoidingView>
    </View>
  );
});

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  sheetContent: {
    flex: 1,
    backgroundColor: Platform.select({
      android: "rgba(255, 255, 255, 0.78)",
      default: "rgba(255, 255, 255, 0.78)",
    }),
    marginHorizontal: Platform.select({
      android: 0,
      default: 0,
    }),
    borderTopWidth: 0,

    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    overflow: "hidden",
  },
  header: {
    position: "absolute",
    top: 0,
    paddingTop: 15,
    left: 0,
    right: 0,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    // paddingBottom: -10, 
    backgroundColor: "rgba(255, 255, 255, 0.81)",
    zIndex: 10,
    // Tiny shadow for header
    shadowColor: "#1f1e1eff",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    // shadowRadius: 2,
    // elevation: 2,
    elevation: Platform.OS === 'android' ? 0 : 2,
  },
  title: {
    ...font("Ubuntu_500Medium", 18, "#0C0C0C"), 
  },
  close: {
    marginLeft: "auto",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 64,
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
    width: 24,
    height: 24,
    borderRadius: 60,
    backgroundColor: "#F2F2F2",
  },
  name: {
    ...font("Ubuntu_500Medium", 16, "#434343"),
    maxWidth: 190,
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 1.5,
    backgroundColor: "#353540ff",
  },
  time: {
    ...font("Ubuntu_400Regular", 12, "#434343"),
  },
  bubble: {
    alignSelf: "flex-start",
    maxWidth: "100%",
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
    ...font("Ubuntu_500Medium", 14, "#1B17B3"),
  },
  replyDot: {
    width: 4, 
    height: 4,
    borderRadius: 1.5,
    backgroundColor: "#777777e7",
  },
  replyCount: {
    ...font("Ubuntu_400Regular", 12, "#555555"),
  },
  composer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F2F2F2",
  },
  replying: {
    ...font("Ubuntu_400Regular", 14, "#1B17B3"),
    marginBottom: 10,
    marginLeft: 12,
  },
  replyName: {
      ...font("Ubuntu_400Regular", 14, "#0f0e0eff"),
       marginBottom: 10,
       marginLeft: 3,
       
    },

  inputPill: {
    minHeight: 45,
    marginHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 50,
    backgroundColor: "#f2f2f2",
  },
  input: {
    flex: 1,
    minHeight: 40,
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
