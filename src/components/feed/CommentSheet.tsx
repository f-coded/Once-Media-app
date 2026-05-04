import React, { forwardRef, useCallback, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetTextInput,
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

const COMMENT_SHEET_SNAP_RATIO = 0.30;
const COMMENT_HEADER_HEIGHT = 48;
const COMMENT_COMPOSER_ESTIMATED_HEIGHT = 82;
const COMMENT_LIST_PLATFORM_MODIFIER = Platform.select({
  android: {
    contentBottomPadding: 0,
    endSpacerBoost: 0,
    minEndSpacer: 0,
  },
  ios: {
    contentBottomPadding: 5,
    endSpacerBoost: 0,
    minEndSpacer: 100,
  },
  default: {
    contentBottomPadding: 5,
    endSpacerBoost: 0,
    minEndSpacer: 10,
  },
})!;

type CommentSheetProps = {
  onClose: () => void;
};

type ReplyType = "post author" | "comment by";

type ComposerHandle = {
  focusReply: (type: ReplyType, name: string) => void;
  blur: () => void;
};

type CommentComposerFooterProps = BottomSheetFooterProps & {
  controllerRef: React.Ref<ComposerHandle>;
  onFocusChange?: (focused: boolean) => void;
};

const CommentComposerFooter = React.memo(function CommentComposerFooter({
  controllerRef,
  onFocusChange,
  ...footerProps
}: CommentComposerFooterProps) {
  const { bottom: bottomInset } = useSafeAreaInsets(); 
  const inputRef = useRef<any>(null);
  const [commentText, setCommentText] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [replyType, setReplyType] = useState<ReplyType>("post author");
  const [replyName, setReplyName] = useState("Kelechi Obi");

  React.useImperativeHandle(controllerRef, () => ({
    focusReply: (type: ReplyType, name: string) => {
      setReplyType(type);
      setReplyName(name);
      setIsAdding(true);
      requestAnimationFrame(() => inputRef.current?.focus());
    },
    blur: () => inputRef.current?.blur(),
  }), [controllerRef]);

  const blurComposer = useCallback(() => {
    onFocusChange?.(false);
    if (!commentText.trim()) {
      setIsAdding(false);
      setReplyType("post author");
      setReplyName("Kelechi Obi");
    }
  }, [commentText, onFocusChange]);

  const sendComment = useCallback(() => {
    if (!commentText.trim()) return;
    setCommentText("");
    setIsAdding(false);
    setReplyType("post author");
    setReplyName("Kelechi Obi");
    onFocusChange?.(false);
    inputRef.current?.blur();
  }, [commentText, onFocusChange]);

  return (
    <BottomSheetFooter {...footerProps} bottomInset={Platform.OS === "ios" ? 0 : bottomInset}>
      <View style={styles.composer}>
        {isAdding && (
          <Text style={styles.replying}>
            Replying to {replyType}{" "}
            <Text style={styles.replyName}>~{replyName}</Text>
          </Text>
        )}
        <View style={styles.inputPill}>
          <BottomSheetTextInput
            ref={inputRef as any}
            style={styles.input}
            placeholder="Add Comment"
            placeholderTextColor="#8E8E8E"
            value={commentText}
            onChangeText={setCommentText}
            onFocus={() => {
              setIsAdding(true);
              onFocusChange?.(true);
            }}
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
      </View>
    </BottomSheetFooter>
  );
});

export const CommentSheet = forwardRef<BottomSheet, CommentSheetProps>(({ onClose }, ref) => {
  const { height: screenHeight } = useWindowDimensions();
  const snapPoints = useMemo(() => ["65%"], []);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const composerRef = useRef<ComposerHandle>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [sheetReady, setSheetReady] = useState(false); // ← gate for scroll fix

  const listEndSpacerHeight = useMemo(() => {
    const visibleSheetHeight = screenHeight * COMMENT_SHEET_SNAP_RATIO;
    const visibleListHeight = visibleSheetHeight - COMMENT_HEADER_HEIGHT - COMMENT_COMPOSER_ESTIMATED_HEIGHT;
    return Math.max(
      COMMENT_LIST_PLATFORM_MODIFIER.minEndSpacer,
      Math.round(visibleListHeight + COMMENT_LIST_PLATFORM_MODIFIER.endSpacerBoost)
    );
  }, [screenHeight]);

  React.useImperativeHandle(ref, () => bottomSheetRef.current!);

  // Track keyboard visibility for blur effect
  React.useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const focusComposer = useCallback((type: ReplyType, name: string) => {
    composerRef.current?.focusReply(type, name);
  }, []);

  const handleClose = useCallback(() => {
    composerRef.current?.blur();
    Keyboard.dismiss();
    onClose();
  }, [onClose]);

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

  const handleFocusChange = useCallback((focused: boolean) => {
    setKeyboardVisible(focused);
  }, []);

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <CommentComposerFooter {...props} controllerRef={composerRef} onFocusChange={handleFocusChange} />
    ),
    [handleFocusChange]
  );

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        enableOverDrag={false}
        animateOnMount={true}
        enableContentPanningGesture={false}
        enableHandlePanningGesture={false}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        backgroundStyle={{ backgroundColor: "transparent" }}
        handleComponent={() => null}
        backdropComponent={renderBackdrop}
        footerComponent={renderFooter}
        onChange={(index) => {
          // Only allow FlatList to render once sheet has fully settled at snap point
          // This prevents Android gesture bridge race condition on cold start
          if (index === 0 && !sheetReady) setSheetReady(true);
        }}
      >
        {Platform.OS === "ios" ? (
          <BlurView
            intensity={60}
            tint="extraLight"
            style={[styles.sheetContent]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Comments</Text>
              <Pressable
                style={styles.close}
                onPress={handleClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <CloseIcon size={20} />
              </Pressable>
            </View> 

            {sheetReady && (
              <BottomSheetFlatList
                style={styles.scroll}
                data={COMMENTS}
                renderItem={renderComment}
                keyExtractor={(item) => item.id}
                bounces={false}
                removeClippedSubviews={false}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                overScrollMode="never"
                contentContainerStyle={styles.scrollContent}
                ListFooterComponent={
                  <View style={[styles.scrollFooterSpacer, { height: listEndSpacerHeight }]} />
                }
              />
            )}

            {keyboardVisible && (
              <BlurView
                intensity={15}
                tint="light"
                experimentalBlurMethod="dimezisBlurView"
                pointerEvents="none"
                style={styles.commentsBlur}
              />
            )}
          </BlurView>
        ) : (
          <View style={styles.sheetContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Comments</Text>
              <Pressable
                style={styles.close}
                onPress={handleClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <CloseIcon size={20} />
              </Pressable>
            </View>

            {/* FlatList only mounts after sheet is settled — fixes Android cold start scroll bug */}
            {sheetReady && (
              <BottomSheetFlatList
                style={styles.scroll}
                data={COMMENTS}
                renderItem={renderComment}
                keyExtractor={(item) => item.id}
                bounces={false}
                removeClippedSubviews={false}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                overScrollMode="never"
                contentContainerStyle={styles.scrollContent}
                ListFooterComponent={
                  <View style={[styles.scrollFooterSpacer, { height: listEndSpacerHeight }]} />
                }
              />
            )}

            {keyboardVisible && (
              <BlurView
                intensity={10}
                tint="light"
                experimentalBlurMethod="dimezisBlurView"
                pointerEvents="none"
                style={styles.commentsBlur}
              />
            )}
          </View>
        )}
      </BottomSheet>
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
    backgroundColor: "rgba(255, 255, 255, 0.82)",
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
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    zIndex: 10,
    shadowColor: "#1f1e1eff",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: Platform.OS === "android" ? 0 : 3,
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
    paddingBottom: COMMENT_LIST_PLATFORM_MODIFIER.contentBottomPadding,
  },
  scrollFooterSpacer: {
    flexShrink: 0,
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
  commentsBlur: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
});