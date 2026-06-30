import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  FlatList,
  LayoutAnimation,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from "react-native";
import {
  KeyboardController,
  useKeyboardState,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";

if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}
import { BlurView } from "expo-blur";

import { font } from "@/features/auth/components/AuthUI";
import { CloseIcon, SendIcon, EmptyCommentIcon } from "./FeedIcons";

import Svg, { Path } from "react-native-svg";

function ChevronDownIcon({ size = 14, color = "#434343", isExpanded = false }: { size?: number; color?: string; isExpanded?: boolean }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ transform: [{ rotate: isExpanded ? "180deg" : "0deg" }] }}
    >
      <Path
        d="M6 9L12 15L18 9"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

type Comment = {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  repliesCount: number;
  replies?: Comment[];
};

const COMMENTS: Comment[] = [
  {
    id: "1",
    user: "Kelechi Obi",
    avatar: "https://i.pravatar.cc/100?img=3",
    text: "This looks like a beautiful property. Is it still available for viewing?",
    time: "12:58 PM",
    repliesCount: 0,
  },
  {
    id: "2",
    user: "Dominic Sobozlai",
    avatar: "https://i.pravatar.cc/100?img=5",
    text: "How much for this",
    time: "12:58 PM",
    repliesCount: 2,
    replies: [
      {
        id: "2-1",
        user: "Kelechi Obi",
        avatar: "https://i.pravatar.cc/100?img=3",
        text: "13k",
        time: "12:58 PM",
        repliesCount: 0,
      },
      {
        id: "2-2",
        user: "Manigan Hasusu",
        avatar: "https://i.pravatar.cc/100?img=12",
        text: "13k",
        time: "12:58 PM",
        repliesCount: 0,
      },
    ],
  },
  {
    id: "3",
    user: "Bukunmi Israel",
    avatar: "https://i.pravatar.cc/100?img=9",
    text: "The interior design looks great. Is the property newly built?",
    time: "12:58 PM",
    repliesCount: 12,
  },
  {
    id: "4",
    user: "Bimbola Kasimawo",
    avatar: "https://i.pravatar.cc/100?img=11",
    text: "Interesting listing. Does the house come with parking and security?",
    time: "12:58 PM",
    repliesCount: 12,
  },
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

  // Fixed sheet geometry: 68% of the INITIAL screen height, captured once via a ref.
  // The sheet's TOP is pinned at TOP_OFFSET (the remaining 32%) and its bottom tracks
  // the window bottom, so it can never grow past the top of the screen. When the keyboard
  // shrinks the window (Android adjustResize), only the bottom rises — the top stays put.
  const initialHeight = useRef(Dimensions.get("window").height).current;
  const SHEET_HEIGHT = Math.round(initialHeight * 0.68);
  const TOP_OFFSET = initialHeight - SHEET_HEIGHT;

  const currentProgressVal = useRef(1); // track drag progress to scale closing animation duration
  const panStartProgress = useRef(1);    // track drag progress at the start of a gesture
  const scrollOffset = useRef(0);        // track FlatList scroll position
  const composerPadBottomRef = useRef(0);

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

  const isAddingRef = useRef(false);
  isAddingRef.current = isAdding;

  const [comments, setComments] = useState<Comment[]>(COMMENTS);
  const [expandedCommentIds, setExpandedCommentIds] = useState<Set<string>>(new Set());
  const [replyParentId, setReplyParentId] = useState<string | null>(null);

  const toggleReplies = useCallback((commentId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCommentIds((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  }, []);

  const handleScroll = useCallback((event: any) => {
    scrollOffset.current = event.nativeEvent.contentOffset.y;
  }, []);

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

    const remaining = currentProgressVal.current;

    // If the user has already dragged the sheet nearly all the way down, skip the
    // animation entirely and unmount instantly — no hang, no extra frames.
    if (remaining <= 0.05) {
      progress.setValue(0);
      onClose();
      return;
    }

    // Scale closing duration by the remaining distance to feel snappy and native.
    const duration = Math.max(80, Math.round(remaining * 200));

    Animated.timing(progress, {
      toValue: 0,
      duration,
      easing: Easing.in(Easing.quad), // accelerate offscreen — fast exit, no bottom decel
      useNativeDriver: true,
    }).start(() => {
      progress.setValue(0);
      // Do NOT call setClosing(false) here. That would flip composerPadBottom from
      // frozenBottom to 0 for one frame before unmount, causing a visible layout
      // jump (the "hang" at the bottom edge). The component is about to unmount
      // via onClose → setShowComments(false), so the state reset is unnecessary.
      onClose();
    });
  }, [progress, onClose, onCloseStart, keyboardHeight]);

  const closeSheetRef = useRef(closeSheet);
  closeSheetRef.current = closeSheet;


  // Android hardware back closes the sheet.
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      closeSheet();
      return true;
    });
    return () => sub.remove();
  }, [closeSheet]);

  const focusReply = useCallback((type: ReplyType, name: string, parentId?: string) => {
    setReplyType(type);
    setReplyName(name);
    setReplyParentId(parentId || null);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsAdding(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const addReply = useCallback((commentsList: Comment[], parentId: string, newReply: Comment): Comment[] => {
    return commentsList.map((c) => {
      if (c.id === parentId) {
        return {
          ...c,
          repliesCount: c.repliesCount + 1,
          replies: [...(c.replies || []), newReply],
        };
      } else if (c.replies) {
        return {
          ...c,
          replies: addReply(c.replies, parentId, newReply),
        };
      }
      return c;
    });
  }, []);

  const sendComment = useCallback(() => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: Math.random().toString(),
      user: "Kelechi Obi",
      avatar: "https://i.pravatar.cc/100?img=3",
      text: commentText,
      time: "Just now",
      repliesCount: 0,
    };

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (replyParentId) {
      setComments((prev) => addReply(prev, replyParentId, newComment));
      setExpandedCommentIds((prev) => {
        const next = new Set(prev);
        next.add(replyParentId);
        return next;
      });
    } else {
      setComments((prev) => [newComment, ...prev]);
    }

    setCommentText("");
    setIsAdding(false);
    setReplyType("post author");
    setReplyName("Kelechi Obi");
    setReplyParentId(null);
    inputRef.current?.blur();
  }, [commentText, replyParentId, addReply]);
  // Drag-to-close handler enabled on the entire container, intelligently coordinate with scrolling.
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (e, g) => {
          const dy = g.dy;
          const dx = g.dx;
          const isVertical = Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 2;

          if (!isVertical) return false;

          // If the sheet is already partially dragged down, capture all vertical gestures (both up and down)
          if (currentProgressVal.current < 0.99) {
            return true;
          }

          // If fully open, only capture downward dragging
          const isDraggingDown = dy > 0;
          if (!isDraggingDown) return false;

          const touchY = e.nativeEvent.pageY;

          // 1. Header touch: always draggable down
          const isHeaderTouch = touchY < TOP_OFFSET + 60;
          if (isHeaderTouch) return true;

          // 2. Composer touch: never draggable to avoid interfering with inputs/buttons
          const composerTop = initialHeight - composerPadBottomRef.current - (isAddingRef.current ? 80 : 58);
          const isComposerTouch = touchY > composerTop;
          if (isComposerTouch) return false;

          // 3. Body/List: only drag down if FlatList is scrolled to the top
          return scrollOffset.current <= 0;
        },
        onMoveShouldSetPanResponder: (e, g) => {
          const dy = g.dy;
          const dx = g.dx;
          const isVertical = Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 2;

          if (!isVertical) return false;

          if (currentProgressVal.current < 0.99) {
            return true;
          }

          const isDraggingDown = dy > 0;
          if (!isDraggingDown) return false;

          const touchY = e.nativeEvent.pageY;
          const isHeaderTouch = touchY < TOP_OFFSET + 60;
          if (isHeaderTouch) return true;

          const composerTop = initialHeight - composerPadBottomRef.current - (isAddingRef.current ? 80 : 58);
          const isComposerTouch = touchY > composerTop;
          if (isComposerTouch) return false;

          return scrollOffset.current <= 0;
        },
        onPanResponderGrant: () => {
          panStartProgress.current = currentProgressVal.current;
        },
        onPanResponderMove: (_, g) => {
          const delta = (g.dy * 1.4) / SHEET_HEIGHT;
          const next = panStartProgress.current - delta;
          const clamped = Math.max(0, Math.min(1, next));
          progress.setValue(clamped);
          currentProgressVal.current = clamped;
        },
        onPanResponderRelease: (_, g) => {
          if (g.vy < -0.5) {
            // Swipe up fast: spring back to fully-open
            Animated.spring(progress, {
              toValue: 1,
              useNativeDriver: true,
              bounciness: 0,
            }).start(() => {
              currentProgressVal.current = 1;
            });
          } else if (currentProgressVal.current < 0.85 || g.vy > 0.5) {
            // Dragged down past 15% or swiped down fast: close
            closeSheetRef.current();
          } else {
            // Otherwise spring back to fully-open
            Animated.spring(progress, {
              toValue: 1,
              useNativeDriver: true,
              bounciness: 0,
            }).start(() => {
              currentProgressVal.current = 1;
            });
          }
        },
      }),
    [SHEET_HEIGHT, TOP_OFFSET, initialHeight, progress]
  );

  // Sheet slides on the SAME shared value: progress 1 -> translateY 0 (open), 0 -> initialHeight (off).
  // Between 0.1 and 1.0 (the active drag range), it moves in perfect lockstep with the postcard
  // to maintain a constant 6px gap. Below 0.1, it accelerates off-screen to initialHeight to be
  // completely hidden below the bottom navigation bar.
  const translateY = progress.interpolate({
    inputRange: [0, 0.1, 1],
    outputRange: [initialHeight, SHEET_HEIGHT * 0.9 + 6, 0],
  });

  const renderCommentItem = useCallback((comment: Comment, isReply = false) => {
    const isExpanded = expandedCommentIds.has(comment.id);
    const hasReplies = comment.replies && comment.replies.length > 0;

    return (
      <View style={[styles.commentRow, isReply && styles.replyCommentRow]} key={comment.id}>
        {/* Left Column: Avatar */}
        <Image source={{ uri: comment.avatar }} style={styles.commentAvatar} contentFit="cover" />

        {/* Right Column: Content Detail */}
        <View style={styles.commentDetail}>
          {/* Header row: name, dot, time */}
          <View style={styles.commentMeta}>
            <Text style={styles.name} numberOfLines={1}>{comment.user}</Text>
            <View style={styles.metaDot} />
            <Text style={styles.time}>{comment.time}</Text>
          </View>

          {/* Text content */}
          <Text style={styles.commentText}>{comment.text}</Text>

          {/* Action Row */}
          <View style={styles.actionsRow}>
            {/* Left side: Chevron + View replies */}
            <Pressable
              style={styles.leftActions}
              onPress={() => comment.repliesCount > 0 && toggleReplies(comment.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ChevronDownIcon size={14} color="#434343" isExpanded={isExpanded} />
              <Text style={styles.actionText}>
                {comment.repliesCount > 0 
                  ? (isExpanded ? "Hide replies" : `View ${comment.repliesCount} replies`) 
                  : "0 replies"
                }
              </Text>
            </Pressable>

            {/* Right side: Reply link */}
            <Pressable
              onPress={() => focusReply("comment by", comment.user, comment.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.actionText}>Reply</Text>
            </Pressable>
          </View>

          {/* Nested Replies: Render inside parent's right column to indent them by exactly 28px */}
          {isExpanded && hasReplies && (
            <View style={styles.nestedRepliesContainer}>
              {comment.replies!.map((reply) => renderCommentItem(reply, true))}
            </View>
          )}
        </View>
      </View>
    );
  }, [expandedCommentIds, toggleReplies, focusReply]);

  // Adjust the composer's padding bottom dynamically by the keyboard height to push the text input
  // above the keyboard. During closure, freeze the padding bottom at the snapshotted height.
  // This keeps the sheet container's bottom at 0 permanently, allowing the white background to
  // extend all the way to the bottom edge of the screen and preventing the feed from being seen behind.
  const composerPadBottom = closing
    ? (frozenBottom.current ? frozenBottom.current + 8 : Math.max(12, bottomInset))
    : (keyboardVisible ? keyboardHeight + 8 : Math.max(12, bottomInset));

  composerPadBottomRef.current = composerPadBottom;

  // Dynamically calculate the offset needed to keep the replying state text clear of the blur/dim overlays
  const composerHeightOffset = isAdding ? 80 : 58;

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
        {...panResponder.panHandlers}
      >
        <SheetSurface {...(surfaceProps as any)} style={styles.surface}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Comment</Text>
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
            data={comments}
            renderItem={({ item }) => renderCommentItem(item)}
            keyExtractor={(item: Comment) => item.id}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          />

          {/* Empty state — pinned to a fixed offset from the sheet top (which is itself pinned at
              ~25% from the screen top), so it never shifts when the keyboard lifts the composer/list.
              pointerEvents none so taps still reach the list/composer underneath. */}
          {comments.length === 0 && (
            <View
              style={[styles.emptyOverlay, { top: Math.round(SHEET_HEIGHT * 0.16) }]}
              pointerEvents="none"
            >
              <View style={styles.emptyIconWrapper}>
                <EmptyCommentIcon />
              </View>
              <Text style={styles.emptyTitle}>Be the First to Comment</Text>
              <Text style={styles.emptySubtitle}>No Comments Yet</Text>
            </View>
          )}

          {keyboardVisible && (
            <>
              <BlurView
                intensity={Platform.OS === "ios" ? 15 : 1}
                tint="dark"
                experimentalBlurMethod="dimezisBlurView"
                style={[
                  StyleSheet.absoluteFillObject,
                  {
                    top: 0,
                    bottom: composerPadBottom + composerHeightOffset,
                    zIndex: 8,
                    borderTopLeftRadius: 35,
                    borderTopRightRadius: 35,
                  },
                ]}
                pointerEvents="none"
              />
              <View
                style={[
                  StyleSheet.absoluteFillObject,
                  {
                    top: 0,
                    bottom: composerPadBottom + composerHeightOffset,
                    backgroundColor: "rgba(20, 20, 20, 0.44)",
                    zIndex: 9,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 25,
                  },
                ]}
                pointerEvents="none"
              />
            </>
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
                placeholderTextColor="#838383"
                value={commentText}
                onChangeText={setCommentText}
                keyboardAppearance="light"
                onFocus={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setIsAdding(true);
                }}
                onBlur={() => {
                  if (!commentText.trim()) {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setIsAdding(false);
                    setReplyType("post author");
                    setReplyName("Kelechi Obi");
                  }
                }}
                returnKeyType="send"
                onSubmitEditing={sendComment}
              />
              {(isAdding || commentText.trim().length > 0) ? (
                <Pressable style={styles.sendTextButton} onPress={sendComment}>
                  <Text style={styles.sendText}>Send</Text>
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
  commentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 15,
    width: "100%",
  },
  replyCommentRow: {
    marginTop: 15,
    marginBottom: 0,
  },
  commentAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#1B17B3",
  },
  commentDetail: {
    flex: 1,
  },
  commentMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
  },
  name: {
    ...font("Ubuntu_500Medium", 14, "#838383"),
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#838383",
  },
  time: {
    ...font("Ubuntu_400Regular", 12, "#838383"),
  },
  commentText: {
    ...font("Ubuntu_400Regular", 16, "#262525", 21),
    letterSpacing: -0.32,
    marginBottom: 6,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  leftActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  leftActionsPlaceholder: {
    width: 1,
    height: 1,
  },
  actionText: {
    ...font("Ubuntu_500Medium", 14, "#434343"),
    letterSpacing: -0.28,
  },
  composer: {
    paddingTop: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F2F2F2",
    zIndex: 10,
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
    height: 45,
    marginHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#F2F2F2",
    borderWidth: 1,
    borderColor: "rgba(242, 242, 242, 0.3)",
  },
  input: {
    flex: 1,
    height: 45,
    fontFamily: "Ubuntu_400Regular",
    fontSize: 13,
    color: "#0C0C0C",
  },
  sendTextButton: {
    paddingLeft: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  sendText: {
    ...font("Ubuntu_500Medium", 14, "#1B17B3"),
  },
  nestedRepliesContainer: {
    width: "100%",
  },
});




