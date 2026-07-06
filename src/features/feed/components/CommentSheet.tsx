import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  LayoutAnimation,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from "react-native";
import {
  FlatList,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  PanGestureHandlerStateChangeEvent,
  State,
} from "react-native-gesture-handler";
import {
  KeyboardController,
  useKeyboardState,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import Svg, { Path } from "react-native-svg";
import Reanimated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
} from "react-native-reanimated";

if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}
import { BlurView } from "expo-blur";
import { font } from "@/features/auth/components/AuthUI";
import { CloseIcon, EmptyCommentIcon } from "./FeedIcons";

// ---------------------------------------------------------------------------
// ElasticWave — mimics the Android 12 stretch-overscroll effect.
// A translucent black bezier drip whose belly tracks the finger's X position.
// Powered by Reanimated useAnimatedProps so the SVG `d` string updates on the
// UI thread at 60fps with no JS bridge round-trips.
// ---------------------------------------------------------------------------
const AnimatedPath = Reanimated.createAnimatedComponent(Path);

type ElasticWaveProps = {
  width: number;
  /** 0 = invisible, 1 = fully extended */
  depth: Reanimated.SharedValue<number>;
  /** Finger X position in absolute screen coords */
  fingerX: Reanimated.SharedValue<number>;
  /** How deep the drip grows at depth=1 (in px) */
  maxDepth?: number;
};

function ElasticWave({ width, depth, fingerX, maxDepth = 56 }: ElasticWaveProps) {
  const animatedProps = useAnimatedProps(() => {
    const d = depth.value;
    if (d <= 0.01) {
      return { d: `M0 0 L${width} 0 Z`, opacity: 0 };
    }

    const amplitude = d * maxDepth;
    // Clamp finger within safe bounds so the path never goes off-edge
    const cx = Math.max(width * 0.08, Math.min(width * 0.92, fingerX.value));

    // How wide the "shoulders" of the drip are — narrows as depth increases for a
    // more pointed tip at full extension, looser/flatter when barely bloomed
    const spread = width * 0.32 * (1 - d * 0.25);
    const shoulderY = amplitude * 0.48;

    // Two cubic bezier arcs:
    // 1. Right edge → belly tip (right shoulder as control point)
    // 2. Belly tip → left edge  (left shoulder as control point)
    const pathD = [
      `M 0 0`,
      `L ${width} 0`,
      `C ${width} ${shoulderY}, ${cx + spread} ${shoulderY}, ${cx} ${amplitude}`,
      `C ${cx - spread} ${shoulderY}, 0 ${shoulderY}, 0 0`,
      `Z`,
    ].join(" ");

    // Opacity ramps up quickly then plateaus — feels like the surface is being
    // pulled off rather than fading in uniformly
    const opacity = Math.min(0.46, 0.1 + d * 0.48);
    return { d: pathD, opacity };
  });

  return (
    <Svg
      width={width}
      height={maxDepth + 8}
      style={{ position: "absolute", top: 0, left: 0, zIndex: 4 }}
      pointerEvents="none"
    >
      <AnimatedPath animatedProps={animatedProps} fill="#000000" />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// ChevronDownIcon
// ---------------------------------------------------------------------------
function ChevronDownIcon({
  size = 14,
  color = "#434343",
  isExpanded = false,
}: {
  size?: number;
  color?: string;
  isExpanded?: boolean;
}) {
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

// ---------------------------------------------------------------------------
// Types & data
// ---------------------------------------------------------------------------
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
  {
    id: "5",
    user: "Bimbola Kasimawo",
    avatar: "https://i.pravatar.cc/100?img=11",
    text: "Interesting listing. Does the house come with parking and security?",
    time: "12:58 PM",
    repliesCount: 12,
  },
  {
    id: "6",
    user: "Bimbola Kasimawo",
    avatar: "https://i.pravatar.cc/100?img=11",
    text: "Interesting listing. Does the house come with parking and security?",
    time: "12:58 PM",
    repliesCount: 12,
  },
  {
    id: "7",
    user: "Bimbola Kasimawo",
    avatar: "https://i.pravatar.cc/100?img=11",
    text: "Interesting listing. Does the house come with parking and security?",
    time: "12:58 PM",
    repliesCount: 12,
  },
];

// ---------------------------------------------------------------------------
// Pull-to-dismiss constants
// ---------------------------------------------------------------------------
const LIST_TOP_THRESHOLD = 1;
// Phase 1: dead zone — no visual for the first N px of downward pull
const BODY_PULL_DEAD_ZONE = 18;
// Phase 2: bloom — wave grows 0→1 over the next N px
const BODY_PULL_BLOOM_DISTANCE = 44;
// Total pull before the whole sheet starts dragging down
const BODY_SHEET_DRAG_START_DISTANCE = 80;
const DRAG_SENSITIVITY = 1.4;
const CLOSE_PROGRESS_THRESHOLD = 0.85;
const CLOSE_VELOCITY_THRESHOLD = 500;

type ReplyType = "post author" | "comment by";
type SheetDragZone = "header" | "body" | "composer";

// ---------------------------------------------------------------------------
// CommentSheet
// ---------------------------------------------------------------------------
type CommentSheetProps = {
  onClose: () => void;
  onCloseStart?: () => void;
  // Shared 0→1 open progress, owned by FeedScreen. The sheet drives it (mount,
  // drag, close) and the feed reads it so the post resizes LIVE with the sheet.
  progress: Animated.Value;
};

export function CommentSheet({ onClose, onCloseStart, progress }: CommentSheetProps) {
  const { bottom: bottomInset } = useSafeAreaInsets();

  // Fixed sheet geometry: 68% of the INITIAL screen height, captured once via a ref.
  const initialHeight = useRef(Dimensions.get("window").height).current;
  const SHEET_HEIGHT = Math.round(initialHeight * 0.68);
  const TOP_OFFSET = initialHeight - SHEET_HEIGHT;
  const SHEET_WIDTH = Dimensions.get("window").width;

  const currentProgressVal = useRef(1);
  const scrollOffset = useRef(0);
  const composerPadBottomRef = useRef(0);
  const sheetPanRef = useRef<any>(null);
  const commentListRef = useRef<any>(null);
  const sheetDragZone = useRef<SheetDragZone>("body");
  const sheetDragActive = useRef(false);
  const sheetDragStartProgress = useRef(1);
  const sheetDragStartTranslationY = useRef(0);
  const bodyPullPrimed = useRef(false);
  const bodyPullBaseTranslationY = useRef(0);
  const pastDeadZone = useRef(false);

  // Reanimated shared values for the elastic SVG wave
  const waveDepth = useSharedValue(0);   // 0 = flat, 1 = fully extended
  const waveFingerX = useSharedValue(SHEET_WIDTH / 2); // belly tracks thumb

  const isClosing = useRef(false);
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

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffset.current = Math.max(0, event.nativeEvent.contentOffset.y);
  }, []);

  const keyboardVisible = useKeyboardState((s) => s.isVisible);
  const keyboardHeight = useKeyboardState((s) => s.height);

  // Animate in on mount
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
    frozenBottom.current = keyboardHeight;
    setClosing(true);
    onCloseStart?.();
    KeyboardController.dismiss();
    inputRef.current?.blur();

    const remaining = currentProgressVal.current;
    if (remaining <= 0.05) {
      progress.setValue(0);
      onClose();
      return;
    }

    const duration = Math.max(80, Math.round(remaining * 200));
    Animated.timing(progress, {
      toValue: 0,
      duration,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      progress.setValue(0);
      onClose();
    });
  }, [progress, onClose, onCloseStart, keyboardHeight]);

  const closeSheetRef = useRef(closeSheet);
  closeSheetRef.current = closeSheet;

  const applySheetDrag = useCallback((dy: number, startProgress: number) => {
    const delta = (Math.max(0, dy) * DRAG_SENSITIVITY) / SHEET_HEIGHT;
    const next = startProgress - delta;
    const clamped = Math.max(0, Math.min(1, next));
    progress.setValue(clamped);
    currentProgressVal.current = clamped;
  }, [SHEET_HEIGHT, progress]);

  const springSheetOpen = useCallback(() => {
    Animated.spring(progress, {
      toValue: 1,
      useNativeDriver: true,
      bounciness: 0,
    }).start(() => {
      currentProgressVal.current = 1;
    });
  }, [progress]);

  const finishSheetDrag = useCallback((velocityY: number) => {
    if (velocityY < -CLOSE_VELOCITY_THRESHOLD) {
      springSheetOpen();
    } else if (
      currentProgressVal.current < CLOSE_PROGRESS_THRESHOLD ||
      velocityY > CLOSE_VELOCITY_THRESHOLD
    ) {
      closeSheetRef.current();
    } else {
      springSheetOpen();
    }
  }, [springSheetOpen]);

  const resetBodyPullCue = useCallback((animated = true) => {
    bodyPullPrimed.current = false;
    pastDeadZone.current = false;

    if (!animated) {
      waveDepth.value = 0;
      return;
    }
    // Bouncy spring release — the wave snaps back with a little wobble
    waveDepth.value = withSpring(0, { damping: 16, stiffness: 200, mass: 0.5 });
  }, [waveDepth]);

  const getSheetDragZone = useCallback((absoluteY: number): SheetDragZone => {
    if (absoluteY < TOP_OFFSET + 60) return "header";
    const composerTop = initialHeight - composerPadBottomRef.current - (isAddingRef.current ? 80 : 58);
    if (absoluteY > composerTop) return "composer";
    return "body";
  }, [TOP_OFFSET, initialHeight]);

  const prepareSheetDrag = useCallback((event: PanGestureHandlerStateChangeEvent) => {
    const { absoluteY, translationY } = event.nativeEvent;
    sheetDragZone.current = getSheetDragZone(absoluteY);
    sheetDragActive.current = false;
    sheetDragStartProgress.current = currentProgressVal.current;
    sheetDragStartTranslationY.current = translationY;
    resetBodyPullCue(false);
  }, [getSheetDragZone, resetBodyPullCue]);

  const handleSheetGesture = useCallback((event: PanGestureHandlerGestureEvent) => {
    if (isClosing.current) return;

    const { translationY, velocityY, absoluteY, absoluteX } = event.nativeEvent;

    // Always update finger X — the wave belly tracks thumb even when just hovering
    waveFingerX.value = absoluteX;

    if (!sheetDragActive.current) {
      const zone = sheetDragZone.current || getSheetDragZone(absoluteY);
      if (zone === "composer") return;

      const isPullingDown = translationY > 0 || velocityY > 80;
      if (!isPullingDown) return;

      if (zone === "body") {
        if (scrollOffset.current > LIST_TOP_THRESHOLD) {
          resetBodyPullCue(false);
          return;
        }

        if (!bodyPullPrimed.current) {
          bodyPullPrimed.current = true;
          bodyPullBaseTranslationY.current = translationY;
          sheetDragStartProgress.current = currentProgressVal.current;
        }

        const pullDistance = Math.max(0, translationY - bodyPullBaseTranslationY.current);

        // Phase 1 — dead zone: silent, no visual yet
        if (pullDistance < BODY_PULL_DEAD_ZONE) {
          waveDepth.value = 0;
          return;
        }

        // Phase 2 — bloom: wave grows 0→1
        if (!pastDeadZone.current) {
          pastDeadZone.current = true;
        }
        const bloomProgress = Math.min(
          1,
          (pullDistance - BODY_PULL_DEAD_ZONE) / BODY_PULL_BLOOM_DISTANCE
        );
        waveDepth.value = bloomProgress;

        if (pullDistance < BODY_SHEET_DRAG_START_DISTANCE) return;

        // Phase 3 — sheet drag kicks in
        sheetDragActive.current = true;
        sheetDragStartProgress.current = currentProgressVal.current;
        sheetDragStartTranslationY.current =
          bodyPullBaseTranslationY.current + BODY_SHEET_DRAG_START_DISTANCE;
      } else {
        resetBodyPullCue(false);
        sheetDragActive.current = true;
        sheetDragStartProgress.current = currentProgressVal.current;
        sheetDragStartTranslationY.current = translationY;
      }
    }

    applySheetDrag(
      translationY - sheetDragStartTranslationY.current,
      sheetDragStartProgress.current
    );
  }, [applySheetDrag, getSheetDragZone, waveDepth, waveFingerX, resetBodyPullCue]);

  const handleSheetGestureStateChange = useCallback((event: PanGestureHandlerStateChangeEvent) => {
    const { state, oldState, velocityY } = event.nativeEvent;

    if (state === State.BEGAN) {
      prepareSheetDrag(event);
      return;
    }

    if (state === State.ACTIVE && oldState !== State.ACTIVE && !sheetDragActive.current) {
      prepareSheetDrag(event);
      return;
    }

    if (
      oldState === State.ACTIVE &&
      (state === State.END || state === State.CANCELLED || state === State.FAILED)
    ) {
      const shouldFinishDrag = sheetDragActive.current;
      sheetDragActive.current = false;
      resetBodyPullCue(true);

      if (shouldFinishDrag) {
        finishSheetDrag(velocityY);
      }
    }
  }, [finishSheetDrag, prepareSheetDrag, resetBodyPullCue]);

  // Android hardware back closes the sheet
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

  const addReply = useCallback(
    (commentsList: Comment[], parentId: string, newReply: Comment): Comment[] => {
      return commentsList.map((c) => {
        if (c.id === parentId) {
          return {
            ...c,
            repliesCount: c.repliesCount + 1,
            replies: [...(c.replies || []), newReply],
          };
        } else if (c.replies) {
          return { ...c, replies: addReply(c.replies, parentId, newReply) };
        }
        return c;
      });
    },
    []
  );

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

  // Sheet position: progress 1 → translateY 0 (open), 0 → initialHeight (off-screen)
  const translateY = progress.interpolate({
    inputRange: [0, 0.1, 1],
    outputRange: [initialHeight, SHEET_HEIGHT * 0.9 + 6, 0],
  });

  const renderCommentItem = useCallback(
    (comment: Comment, isReply = false, parentCommentId?: string) => {
      const isExpanded = expandedCommentIds.has(comment.id);
      const hasReplies = comment.replies && comment.replies.length > 0;

      return (
        <View style={[styles.commentRow, isReply && styles.replyCommentRow]} key={comment.id}>
          <Image source={{ uri: comment.avatar }} style={styles.commentAvatar} contentFit="cover" />

          <View style={styles.commentDetail}>
            <Pressable
              onPress={() => focusReply("comment by", comment.user, parentCommentId || comment.id)}
              style={({ pressed }) => pressed && { opacity: 0.7 }}
            >
              <View style={styles.commentMeta}>
                <Text style={styles.name} numberOfLines={1}>{comment.user}</Text>
                <View style={styles.metaDot} />
                <Text style={styles.time}>{comment.time}</Text>
              </View>
              <Text style={styles.commentText}>{comment.text}</Text>
            </Pressable>

            <View style={styles.actionsRow}>
              <Pressable
                style={styles.leftActions}
                onPress={() => comment.repliesCount > 0 && toggleReplies(comment.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.actionText}>
                  {comment.repliesCount > 0
                    ? isExpanded
                      ? "Hide replies"
                      : `View ${comment.repliesCount} replies`
                    : "0 replies"}
                </Text>
                <ChevronDownIcon size={14} color="#434343" isExpanded={isExpanded} />
              </Pressable>

              <Pressable
                onPress={() => focusReply("comment by", comment.user, parentCommentId || comment.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.actionText}>Reply</Text>
              </Pressable>
            </View>

            {isExpanded && hasReplies && (
              <View style={styles.nestedRepliesContainer}>
                {comment.replies!.map((reply) =>
                  renderCommentItem(reply, true, parentCommentId || comment.id)
                )}
              </View>
            )}
          </View>
        </View>
      );
    },
    [expandedCommentIds, toggleReplies, focusReply]
  );

  const composerPadBottom = closing
    ? frozenBottom.current
      ? frozenBottom.current + 8
      : Math.max(12, bottomInset)
    : keyboardVisible
    ? keyboardHeight + 8
    : Math.max(12, bottomInset);

  composerPadBottomRef.current = composerPadBottom;

  const composerHeightOffset = isAdding ? 80 : 58;

  const SheetSurface = View;

  return (
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />

      <PanGestureHandler
        ref={sheetPanRef}
        minDist={2}
        avgTouches
        simultaneousHandlers={commentListRef}
        onGestureEvent={handleSheetGesture}
        onHandlerStateChange={handleSheetGestureStateChange}
      >
        <Animated.View
          style={[
            styles.sheet,
            { top: TOP_OFFSET, bottom: 0, transform: [{ translateY }] },
          ]}
        >
          <SheetSurface style={styles.surface}>
            {/* Header — the ElasticWave SVG sits absolutely inside here */}
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

              {/* The elastic bezier drip — belly follows thumb left/right */}
              <ElasticWave
                width={SHEET_WIDTH}
                depth={waveDepth}
                fingerX={waveFingerX}
                maxDepth={56}
              />
            </View>

            <FlatList
              ref={commentListRef}
              simultaneousHandlers={sheetPanRef}
              style={styles.scroll}
              data={comments}
              renderItem={({ item }) => renderCommentItem(item)}
              keyExtractor={(item: Comment) => item.id}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              bounces={false}
              alwaysBounceVertical={false}
              overScrollMode="never"
            />

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

            {/* Composer */}
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
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    justifyContent: "flex-end",
  },
  sheet: {
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
    // Give the header enough height so the wave SVG (maxDepth 56 + 8 buffer = 64px)
    // doesn't clip. The SVG is positioned absolutely inside.
    overflow: "visible",
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
  actionText: {
    ...font("Ubuntu_400Regular", 14, "#434343"),
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
