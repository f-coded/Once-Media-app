import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  FlatList,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  KeyboardController,
  useKeyboardState,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";

import { font } from "@/features/auth/components/AuthUI";
import { CloseIcon, SendIcon, EmptyCommentIcon } from "./FeedIcons";

type Comment = {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  replies: number;
};

// Kept for when real comment data is wired in. The list currently renders the
// empty state on purpose (data={[]}).
const COMMENTS: Comment[] = [
  // PLACEHOLDER_COMMENTS
];

type ReplyType = "post author" | "comment by";

type CommentSheetProps = {
  onClose: () => void;
  onCloseStart?: () => void;
  // Shared 0->1 open progress, owned by FeedScreen. The sheet drives it (mount, drag, close)
  // and the feed reads it so the post resizes LIVE with the sheet - connected, not on a timer.
  progress: Animated.Value;
};
export function CommentSheet({ onClose, onCloseStart, progress }: CommentSheetProps) {
  const { bottom: bottomInset } = useSafeAreaInsets();

  // Fixed sheet geometry: 65% of the INITIAL screen height, captured once via a ref.
  // The sheet's TOP is pinned at TOP_OFFSET (the remaining 30%) and its bottom tracks
  // the window bottom, so it can never grow past the top of the screen. When the keyboard
  // shrinks the window (Android adjustResize), only the bottom rises — the top stays put.
  const initialHeight = useRef(Dimensions.get("window").height).current;
  const SHEET_HEIGHT = Math.round(initialHeight * 0.65);
  const TOP_OFFSET = initialHeight - SHEET_HEIGHT;

  // The sheet position is derived entirely from the shared `progress` value (0 = closed,
  // 1 = fully open). Mount animates it 0->1, drag scrubs it live, close drives it ->0.
  const isClosing = useRef(false);
  // During close we FREEZE the sheet's bottom at whatever keyboard height it had, so dismissing
  // the keyboard doesn't thrash layout (bottom) while the native slide-down plays - that JS/layout
  // collision was the "hang" at the bottom of the screen right before it finished closing.
  const [closing, setClosing] = useState(false);
  const frozenBottom = useRef(0);

  const [commentText, setCommentText] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [replyType, setReplyType] = useState<ReplyType>("post author");
  const [replyName, setReplyName] = useState("Kelechi Obi");
  const inputRef = useRef<TextInput>(null);

  // Keyboard visibility for the composer's bottom padding. react-native-keyboard-controller
  // tracks the real keyboard frame on the UI thread, so this stays correct across app
  // background/resume — unlike the old manual Keyboard listeners, which desynced on resume
  // (keyboard restored by the OS without re-firing show events, leaving the composer stuck).
  const keyboardVisible = useKeyboardState((s) => s.isVisible);
  const keyboardHeight = useKeyboardState((s) => s.height);

  // Animate in on mount (ease-out so it settles softly without overshoot).
  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [progress]);

  const closeSheet = useCallback(() => {
    if (isClosing.current) return;
    isClosing.current = true;
    // Snapshot the current keyboard lift and freeze it for the whole close, so the bottom
    // style stays constant while we slide down (no layout thrash from the keyboard collapsing).
    frozenBottom.current = keyboardHeight;
    setClosing(true);
    onCloseStart?.();
    KeyboardController.dismiss();
    inputRef.current?.blur();

    Animated.timing(progress, {
      toValue: 0,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      progress.setValue(0);
      onClose();
    });
  }, [progress, onClose, onCloseStart, keyboardHeight]);


  // Android hardware back closes the sheet.
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      closeSheet();
      return true;
    });
    return () => sub.remove();
  }, [closeSheet]);

  const focusReply = useCallback((type: ReplyType, name: string) => {
    setReplyType(type);
    setReplyName(name);
    setIsAdding(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const sendComment = useCallback(() => {
    if (!commentText.trim()) return;
    setCommentText("");
    setIsAdding(false);
    setReplyType("post author");
    setReplyName("Kelechi Obi");
    inputRef.current?.blur();
  }, [commentText]);
  // Drag-to-close on the header only, so it never fights the list scroll. As you drag down we
  // scrub the shared `progress` live (1 at rest -> 0 when dragged a full sheet-height down), so
  // the feed post grows back IN STEP with your finger - connected and flexible, not on a timer.
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => g.dy > 6 && Math.abs(g.dy) > Math.abs(g.dx),
        onPanResponderMove: (_, g) => {
          if (g.dy > 0) {
            const next = 1 - g.dy / SHEET_HEIGHT;
            progress.setValue(next < 0 ? 0 : next);
          }
        },
        onPanResponderRelease: (_, g) => {
          if (g.dy > 120 || g.vy > 0.8) {
            closeSheet();
          } else {
            // Spring back to fully-open; the feed follows the same value back up.
            Animated.spring(progress, {
              toValue: 1,
              useNativeDriver: true,
              bounciness: 0,
            }).start();
          }
        },
      }),
    [closeSheet, progress, SHEET_HEIGHT]
  );

  // Sheet slides on the SAME shared value: progress 1 -> translateY 0 (open), 0 -> initialHeight (off).
  // Using initialHeight (full window height) instead of SHEET_HEIGHT guarantees that the sheet
  // slides completely off-screen, preventing it from hanging above the bottom nav bar on Android.
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [initialHeight, 0],
  });

  const renderComment = useCallback(
    ({ item }: { item: Comment }) => (
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
          onPress={() => focusReply("comment by", item.user)}
          hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
        >
          <Text style={styles.reply}>Reply</Text>
          <View style={styles.replyDot} />
          <Text style={styles.replyCount}>{item.replies} Replies</Text>
        </Pressable>
      </View>
    ),
    [focusReply]
  );

  // Adjust the composer's padding bottom dynamically by the keyboard height to push the text input
  // above the keyboard. During closure, freeze the padding bottom at the snapshotted height.
  // This keeps the sheet container's bottom at 0 permanently, allowing the white background to
  // extend all the way to the bottom edge of the screen and preventing the feed from being seen behind.
  const composerPadBottom = closing
    ? (frozenBottom.current ? frozenBottom.current + 8 : Math.max(12, bottomInset))
    : (keyboardVisible ? keyboardHeight + 8 : Math.max(12, bottomInset));

  // Plain View surface on BOTH platforms - exactly like the smooth wallet sheet. Previously this
  // was a BlurView on iOS, which had to re-composite the live blur of the (also-scaling) feed every
  // frame as the sheet slid; the rounded header was the costliest part to recomposite, which is why
  // it stuttered right where the title/X sit. The dim/blur behind the sheet is already owned by
  // FeedScreen (isBlurActive), so the sheet's own blur was redundant as well as expensive.
  const SheetSurface = View;
  const surfaceProps = {};

  return (
    <View style={styles.overlay}>
      {/* Transparent tap-to-close backdrop. The feed dim/blur is owned by FeedScreen. */}
      <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />

      <Animated.View
        style={[
          styles.sheet,
          { top: TOP_OFFSET, bottom: 0, transform: [{ translateY }] },
        ]}
      >
        <SheetSurface {...(surfaceProps as any)} style={styles.surface}>
          {/* Header — also the drag handle */}
          <View style={styles.header} {...panResponder.panHandlers}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Comments</Text>
              <Pressable
                style={styles.close}
                onPress={closeSheet}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <CloseIcon size={20} />
                </Pressable>
              </View>
            </View>

            <FlatList
              style={styles.scroll}
              data={[]} // Empty on purpose — shows the empty state until real data is wired in.
              renderItem={renderComment}
              keyExtractor={(item: Comment) => item.id}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            />

            {/* Empty state — pinned to a fixed offset from the sheet top (which is itself pinned at
                ~25% from the screen top), so it never shifts when the keyboard lifts the composer/list.
                pointerEvents none so taps still reach the list/composer underneath. */}
            {COMMENTS.length === 0 && (
              <View
                style={[styles.emptyOverlay, { top: Math.round(SHEET_HEIGHT * 0.18) }]}
                pointerEvents="none"
              >
                <View style={styles.emptyIconWrapper}>
                  <EmptyCommentIcon />
                </View>
                <Text style={styles.emptyTitle}>Be the First to Comment</Text>
                <Text style={styles.emptySubtitle}>No Comments Yet</Text>
              </View>
            )}

            {/* Composer — normal flow, sits on top of the keyboard natively */}
            <View style={[styles.composer, { paddingBottom: composerPadBottom }]}>
              {isAdding && (
                <Text style={styles.replying}>
                  Replying to {replyType}{" "}
                  <Text style={styles.replyName}>~{replyName}</Text>
                </Text>
              )}
              <View style={styles.inputPill}>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  placeholder="Add Comment"
                  placeholderTextColor="#8E8E8E"
                  value={commentText}
                  onChangeText={setCommentText}
                  keyboardAppearance="light"
                  onFocus={() => setIsAdding(true)}
                  onBlur={() => {
                    if (!commentText.trim()) {
                      setIsAdding(false);
                      setReplyType("post author");
                      setReplyName("Kelechi Obi");
                    }
                  }}
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
          </SheetSurface>
        </Animated.View>
    </View>
  );
}
const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    justifyContent: "flex-end",
  },
  kav: {
    justifyContent: "flex-end",
  },
  sheet: {
    // Absolute is required for the inline top/bottom anchors to take effect. The top is pinned
    // at TOP_OFFSET (~25% from the top) and the bottom tracks the keyboard, so the sheet height
    // is (containerHeight - top - bottom) and can never grow past the 25% line.
    position: "absolute",
    left: 0,
    right: 0,
    
  },
  surface: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    overflow: "hidden",
  },
  header: {
    paddingTop: 8,
    paddingBottom: 6,
    paddingHorizontal: 18,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    zIndex: 5,
  },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D9D9D9",
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 30,
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
    paddingTop: 12,
    paddingBottom: 12,
    flexGrow: 1,
  },
  emptyOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyIconWrapper: {
    marginBottom: 16,
  },
  emptyTitle: {
    ...font("Ubuntu_500Medium", 16, "#282828"),
    marginBottom: 6,
  },
  emptySubtitle: {
    ...font("Ubuntu_400Regular", 14, "#8E8E8E"),
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
    backgroundColor: "#F2F2F2",
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
    paddingTop: 12,
    paddingHorizontal: 12,
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
});




