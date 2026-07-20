import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Dimensions,
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
  Gesture,
  GestureDetector,
  type GestureType,
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
  useAnimatedStyle,
  interpolate,
  withSpring,
  withTiming,
  runOnJS,
  Easing as ReanimatedEasing,
  type SharedValue,
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
// Sits BELOW the header row (topOffset), with a rounded U-shaped belly.
// ---------------------------------------------------------------------------
const AnimatedPath = Reanimated.createAnimatedComponent(Path);

type ElasticWaveProps = {
  width: number;
  /** 0 = invisible, 1 = fully extended */
  depth: SharedValue<number>;
  /** Finger X position in absolute screen coords */
  fingerX: SharedValue<number>;
  /** How deep the drip grows at depth=1 (in px) */
  maxDepth?: number;
  /** Vertical offset so the wave renders below the header title row, not over it */
  topOffset?: number;
};

function ElasticWave({
  width,
  depth,
  fingerX,
  maxDepth = 56,
  topOffset = 0,
}: ElasticWaveProps) {
  const animatedProps = useAnimatedProps(() => {
    const d = depth.value;
    if (d <= 0.01) {
      return { d: `M0 0 L${width} 0 Z`, opacity: 0 };
    }

    const amplitude = d * maxDepth;
    // Clamp finger within safe bounds so the path never goes off-edge
    const cx = Math.max(width * 0.08, Math.min(width * 0.92, fingerX.value));

    // Shoulders stay close to the top edge (small shoulderY) while the second
    // control point sits near the tip height (amplitude) — this flattens the
    // tangent at the belly so it reads as a rounded "U" instead of a pointed "V".
    const spread = width * 0.34 * (1 - d * 0.2);
    const shoulderY = amplitude * 0.12;
    const controlY = amplitude * 0.96;

    const pathD = [
      `M 0 0`,
      `L ${width} 0`,
      `C ${width} ${shoulderY}, ${cx + spread} ${controlY}, ${cx} ${amplitude}`,
      `C ${cx - spread} ${controlY}, 0 ${shoulderY}, 0 0`,
      `Z`,
    ].join(" ");

    // Brighter / more visible than before — ramps up faster and reaches a
    // higher ceiling so the stretch actually reads on screen.
    const opacity = Math.min(0.62, 0.18 + d * 0.55);
    return { d: pathD, opacity };
  });

  return (
    <Svg
      width={width}
      height={maxDepth + 8}
      style={{ position: "absolute", top: topOffset, left: 0, zIndex: 4 }}
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
// Total pull before the whole sheet starts dragging down (only used once
// hasStretchedOnce is true, on the "direct drag" pass)
const BODY_SHEET_DRAG_START_DISTANCE = 80;
const DRAG_SENSITIVITY = 1.4;
const CLOSE_PROGRESS_THRESHOLD = 0.85;
const CLOSE_VELOCITY_THRESHOLD = 500;
// Header row height (paddingTop 8 + row height 30) — wave renders starting here
const HEADER_CONTENT_HEIGHT = 38;

/* Reanimated equivalent of the old RN Animated.spring({ bounciness: 0 }) with
   default speed 12: RN maps those via fromBouncinessAndSpeed → origami
   tension/friction ≈ 70.9/12.0, used directly as stiffness/damping (mass 1).
   Same settle curve as before, now started from the UI thread. */
const REOPEN_SPRING = {
  stiffness: 70.9,
  damping: 12.0,
  mass: 1,
  restDisplacementThreshold: 0.001,
  restSpeedThreshold: 0.001,
};
// Same params the old resetBodyPullCue passed to withSpring — unchanged.
const WAVE_RELEASE_SPRING = { damping: 16, stiffness: 200, mass: 0.5 };

type ReplyType = "post author" | "comment by";
type SheetDragZone = "header" | "body" | "composer";

// ---------------------------------------------------------------------------
// CommentSheet
// ---------------------------------------------------------------------------
type CommentSheetProps = {
  onClose: () => void;
  onCloseStart?: () => void;
  progress: SharedValue<number>;
  visible: boolean;
};

export function CommentSheet({ onClose, onCloseStart, progress, visible }: CommentSheetProps) {

  useEffect(() => {
    if (visible) {
      isClosingSV.value = false;
      setClosing(false);
    }
  }, [visible]);
  
  const { bottom: bottomInset } = useSafeAreaInsets();

  // Fixed sheet geometry: 68% of the INITIAL screen height, captured once via a ref.
  const initialHeight = useRef(Dimensions.get("window").height).current;
  const SHEET_HEIGHT = Math.round(initialHeight * 0.68);
  const TOP_OFFSET = initialHeight - SHEET_HEIGHT;
  const SHEET_WIDTH = Dimensions.get("window").width;

  // Gesture bookkeeping lives in shared values now: the pan handlers run as
  // worklets on the UI thread, so every per-frame read/write below happens
  // without touching the JS bridge. Semantics are 1:1 with the old refs.
  const scrollOffsetSV = useSharedValue(0);
  const composerPadBottomSV = useSharedValue(0);
  const isAddingSV = useSharedValue(false);
  const sheetPanRef = useRef<GestureType | undefined>(undefined);
  const commentListRef = useRef<any>(null);
  const sheetDragZone = useSharedValue<SheetDragZone>("body");
  const sheetDragActive = useSharedValue(false);
  const sheetDragStartProgress = useSharedValue(1);
  const sheetDragStartTranslationY = useSharedValue(0);
  const bodyPullPrimed = useSharedValue(false);
  const bodyPullBaseTranslationY = useSharedValue(0);
  const pastDeadZone = useSharedValue(false);
  // Two-stage pull cue: first pull-at-top only shows the stretch (no drag).
  // Once released, this flips true so the NEXT pull drags immediately.
  const hasStretchedOnce = useSharedValue(false);
  // Guards against the list's own momentum/deceleration fighting the pan
  // gesture at the top edge, which is what caused the "shaky" feel.
  const listMomentumActive = useSharedValue(false);
  // Tracks whether the pan actually activated, so release logic only runs
  // after activation (old code's oldState === ACTIVE check).
  const didActivate = useSharedValue(false);

  // Reanimated shared values for the elastic SVG wave
  const waveDepth = useSharedValue(0);   // 0 = flat, 1 = fully extended
  const waveFingerX = useSharedValue(SHEET_WIDTH / 2); // belly tracks thumb

  const isClosingSV = useSharedValue(false);
  const [closing, setClosing] = useState(false);
  const frozenBottom = useRef(0);

  const [commentText, setCommentText] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [replyType, setReplyType] = useState<ReplyType>("post author");
  const [replyName, setReplyName] = useState("Kelechi Obi");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    isAddingSV.value = isAdding;
  }, [isAdding, isAddingSV]);

  const [comments, setComments] = useState<Comment[]>(COMMENTS);
  const [expandedCommentIds, setExpandedCommentIds] = useState<Set<string>>(new Set());
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  // Freezes the list so it can't shift/jitter while the sheet is being dragged
  const [listScrollEnabled, setListScrollEnabled] = useState(true);

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

  // These still arrive via JS scroll events (same source and cadence the old
  // ref-based checks used) — they only feed the arbitration guards, while the
  // per-frame drag path itself is fully on the UI thread.
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffsetSV.value = Math.max(0, event.nativeEvent.contentOffset.y);
  }, [scrollOffsetSV]);

  const handleMomentumScrollBegin = useCallback(() => {
    listMomentumActive.value = true;
  }, [listMomentumActive]);

  const handleMomentumScrollEnd = useCallback(() => {
    listMomentumActive.value = false;
  }, [listMomentumActive]);

  const keyboardVisible = useKeyboardState((s) => s.isVisible);
  const keyboardHeight = useKeyboardState((s) => s.height);

  //Animate in on mount
  // useEffect(() => {
  //   Animated.timing(progress, {
  //     toValue: 1,
  //     duration: 300,
  //     easing: Easing.out(Easing.cubic),
  //     useNativeDriver: true,
  //   }).start();
  // }, [progress]);

// NOTE: the open animation is no longer started here. FeedScreen fires it
  // in the same tick it flips isMinimized/isBlurActive, so the post and the
  // sheet move together with zero mount-lag between them. The shared value is
  // readable on both threads, so the old progress-listener mirror is gone.

  const finalizeClose = useCallback(() => {
    if (!isClosingSV.value) return; // reopened before this finished — ignore stale close
    progress.value = 0;
    onClose();
  }, [isClosingSV, progress, onClose]);

  const closeSheet = useCallback(() => {
    if (isClosingSV.value) return;
    isClosingSV.value = true;
    frozenBottom.current = keyboardHeight;
    setClosing(true);
    onCloseStart?.();
    KeyboardController.dismiss();
    inputRef.current?.blur();

    const remaining = progress.value;
    if (remaining <= 0.05) {
      progress.value = 0;
      onClose();
      return;
    }

    const duration = Math.max(80, Math.round(remaining * 200));
    progress.value = withTiming(
      0,
      { duration, easing: ReanimatedEasing.in(ReanimatedEasing.quad) },
      (finished) => {
        if (finished) {
          runOnJS(finalizeClose)();
        }
      }
    );
  }, [progress, onClose, onCloseStart, keyboardHeight, isClosingSV, finalizeClose]);

  const closeSheetRef = useRef(closeSheet);
  closeSheetRef.current = closeSheet;
  // Stable JS entry point for runOnJS from the release worklet.
  const requestClose = useCallback(() => {
    closeSheetRef.current();
  }, []);

  /* ── Pan gesture — all handlers are worklets on the UI thread. Zone
        detection, dead-zone/bloom staging, hasStretchedOnce two-stage pull,
        DRAG_SENSITIVITY mapping and close/reopen thresholds are ported 1:1
        from the old JS handlers; only the execution thread changed. ── */

  const prepareSheetDragW = useCallback((absoluteY: number, translationY: number) => {
    "worklet";
    const composerTop =
      initialHeight - composerPadBottomSV.value - (isAddingSV.value ? 80 : 58);
    sheetDragZone.value =
      absoluteY < TOP_OFFSET + 60
        ? "header"
        : absoluteY > composerTop
        ? "composer"
        : "body";
    sheetDragActive.value = false;
    sheetDragStartProgress.value = progress.value;
    sheetDragStartTranslationY.value = translationY;
    // resetBodyPullCue(animated: false)
    bodyPullPrimed.value = false;
    pastDeadZone.value = false;
    waveDepth.value = 0;
  }, [initialHeight, TOP_OFFSET, composerPadBottomSV, isAddingSV, sheetDragZone, sheetDragActive, sheetDragStartProgress, sheetDragStartTranslationY, bodyPullPrimed, pastDeadZone, waveDepth, progress]);

  const panGesture = Gesture.Pan()
    .withRef(sheetPanRef)
    .minDistance(2)
    .averageTouches(true)
    .simultaneousWithExternalGesture(commentListRef)
    .onBegin((event) => {
      "worklet";
      // Old BEGAN-state prepare.
      prepareSheetDragW(event.absoluteY, event.translationY);
    })
    .onStart((event) => {
      "worklet";
      // Old ACTIVE-transition re-prepare (re-captures translation at
      // activation, ~minDistance later than BEGAN).
      didActivate.value = true;
      if (!sheetDragActive.value) {
        prepareSheetDragW(event.absoluteY, event.translationY);
      }
    })
    .onUpdate((event) => {
      "worklet";
      if (isClosingSV.value) return;

      // Always update finger X — the wave belly tracks thumb even when just hovering
      waveFingerX.value = event.absoluteX;

      if (!sheetDragActive.value) {
        const zone = sheetDragZone.value;
        if (zone === "composer") return;

        const isPullingDown = event.translationY > 0 || event.velocityY > 80;
        if (!isPullingDown) return;

        if (zone === "body") {
          if (scrollOffsetSV.value > LIST_TOP_THRESHOLD) {
            // resetBodyPullCue(animated: false)
            bodyPullPrimed.value = false;
            pastDeadZone.value = false;
            waveDepth.value = 0;
            return;
          }

          // The list may still be settling from a fling — ignore pulls until it's
          // fully at rest so the gesture doesn't fight the scroll deceleration
          // (this was the source of the shaky/jittery feel).
          if (listMomentumActive.value) {
            return;
          }

          if (!bodyPullPrimed.value) {
            bodyPullPrimed.value = true;
            bodyPullBaseTranslationY.value = event.translationY;
            sheetDragStartProgress.value = progress.value;
            runOnJS(setListScrollEnabled)(false);
          }

          const pullDistance = Math.max(0, event.translationY - bodyPullBaseTranslationY.value);

          if (!hasStretchedOnce.value) {
            // STAGE 1 — first pull at the top this session: hold the sheet's
            // position and only show the stretch cue. Never drag the sheet,
            // no matter how far the user pulls.
            if (pullDistance < BODY_PULL_DEAD_ZONE) {
              waveDepth.value = 0;
              return;
            }
            pastDeadZone.value = true;
            waveDepth.value = Math.min(
              1,
              (pullDistance - BODY_PULL_DEAD_ZONE) / BODY_PULL_BLOOM_DISTANCE
            );
            return;
          }

          // STAGE 2 — user already saw the stretch cue once: drag the sheet
          // immediately, no stretch shown this time.
          sheetDragActive.value = true;
          sheetDragStartProgress.value = progress.value;
          sheetDragStartTranslationY.value = bodyPullBaseTranslationY.value;
          runOnJS(setListScrollEnabled)(false);
        } else {
          // resetBodyPullCue(animated: false)
          bodyPullPrimed.value = false;
          pastDeadZone.value = false;
          waveDepth.value = 0;
          sheetDragActive.value = true;
          sheetDragStartProgress.value = progress.value;
          sheetDragStartTranslationY.value = event.translationY;
          runOnJS(setListScrollEnabled)(false);
        }
      }

      if (sheetDragActive.value) {
        // Old applySheetDrag — the per-frame hot path, now bridge-free.
        const dy = event.translationY - sheetDragStartTranslationY.value;
        const delta = (Math.max(0, dy) * DRAG_SENSITIVITY) / SHEET_HEIGHT;
        progress.value = Math.max(0, Math.min(1, sheetDragStartProgress.value - delta));
      }
    })
    .onFinalize((event) => {
      "worklet";
      // Old release only ran after ACTIVE; onFinalize covers END, CANCELLED
      // and FAILED alike, so gate on actual activation.
      if (!didActivate.value) return;
      didActivate.value = false;

      const shouldFinishDrag = sheetDragActive.value;
      // If this release was the first-ever stretch-only pull, unlock direct
      // dragging for the next pull.
      const wasFirstStretch = pastDeadZone.value && !hasStretchedOnce.value;
      if (wasFirstStretch) {
        hasStretchedOnce.value = true;
      }

      sheetDragActive.value = false;
      // resetBodyPullCue(animated: true) — bouncy spring release
      bodyPullPrimed.value = false;
      pastDeadZone.value = false;
      waveDepth.value = withSpring(0, WAVE_RELEASE_SPRING);
      runOnJS(setListScrollEnabled)(true);

      if (shouldFinishDrag) {
        // Old finishSheetDrag.
        if (event.velocityY < -CLOSE_VELOCITY_THRESHOLD) {
          progress.value = withSpring(1, REOPEN_SPRING);
        } else if (
          progress.value < CLOSE_PROGRESS_THRESHOLD ||
          event.velocityY > CLOSE_VELOCITY_THRESHOLD
        ) {
          runOnJS(requestClose)();
        } else {
          progress.value = withSpring(1, REOPEN_SPRING);
        }
      }
    });

  // Android hardware back closes the sheet
useEffect(() => {
  const sub = BackHandler.addEventListener("hardwareBackPress", () => {
    if (!visible) return false;
    closeSheet();
    return true;
  });
  return () => sub.remove();
}, [closeSheet, visible]);
  
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
    <View style={styles.overlay} pointerEvents={visible ? "auto" : "none"}>
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

              {/* The elastic bezier drip — sits BELOW the header row, belly
                  follows thumb left/right */}
              <ElasticWave
                width={SHEET_WIDTH}
                depth={waveDepth}
                fingerX={waveFingerX}
                maxDepth={56}
                topOffset={HEADER_CONTENT_HEIGHT}
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
              scrollEnabled={listScrollEnabled}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
              onScroll={handleScroll}
              onMomentumScrollBegin={handleMomentumScrollBegin}
              onMomentumScrollEnd={handleMomentumScrollEnd}
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