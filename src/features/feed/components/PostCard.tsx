import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, Pressable, Dimensions, StyleSheet } from "react-native";
import Reanimated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  type SharedValue,
} from "react-native-reanimated";
import { useRecyclingState } from "@shopify/flash-list";
import { useEvent } from "expo";
import { Image } from "expo-image";
import { useVideoPlayer, VideoView, type VideoPlayer } from "expo-video";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Circle } from "react-native-svg";
import { font } from "@/features/auth/components/AuthUI";
import { ActionButton } from "./ActionButton";
import { HeartBurst } from "./HeartBurst";
import {
  HeartIcon,
  CommentIcon,
  BookmarkIcon,
  ShareIcon,
  ClipIcon,
} from "./FeedIcons";

const { width: SCREEN_W } = Dimensions.get("window");

/* Progress at which the post overlays finish fading out (and, in reverse,
   begin fading in).

   Opacity is ONLY expensive while strictly between 0 and 1: at 1 Android skips
   the layer entirely, at 0 it skips the view, but in between it must render the
   whole subtree to an offscreen buffer and alpha-blend it every frame. The
   vertical action rail makes that subtree costly — four Reanimated
   ActionButtons, SVG icons, text shadows, and an elevation shadow on Clip —
   which is exactly why vertical posts hitched on sheet-open while the much
   lighter horizontal chrome stayed smooth.

   Shortening this to ~1 frame was tried as a fix for the vertical layout's
   hitch and made NO measurable difference — the real cause was a native
   haptics call sitting in front of onPress in ActionButton, i.e. before the
   animation started at all. Restored to the original 0.15 for the softer fade.

   Raise it for a softer fade, lower it for less compositing. */
export const OVERLAY_FADE_END = 0.15;

/* Measured media aspect ratios, keyed by the media SOURCE rather than post.id —
   pagination re-emits the same media under fresh ids, and FlashList recycles
   cards, so keying by source lets both reuse a known ratio. Module-level on
   purpose: read synchronously during render without triggering re-renders. */
const mediaAspectCache = new Map<string | number, number>();

// TEMP (parallax dev): render every post as solid black instead of its image/video.
// Flip back to true to restore the flat gradient placeholders.
const BLACK_POSTS = false;

/* Map pin icon — exact outlined style from user's SVG */
function MapPinIcon({ size = 16, color = "rgba(255,255,255,0.6)" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M8 8.66671C9.10457 8.66671 10 7.77128 10 6.66671C10 5.56214 9.10457 4.66671 8 4.66671C6.89543 4.66671 6 5.56214 6 6.66671C6 7.77128 6.89543 8.66671 8 8.66671Z" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M8 14.6667C8 14.6667 13.3333 10.6667 13.3333 6.66671C13.3333 3.72119 10.9455 1.33337 8 1.33337C5.05448 1.33337 2.66667 3.72119 2.66667 6.66671C2.66667 10.6667 8 14.6667 8 14.6667Z" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function PlayIcon({ size = 64 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 76 76" fill="none">
      <Circle cx="38" cy="38" r="38" fill="rgba(0,0,0,0.36)" />
      <Path d="M34 27.5L50 38L34 48.5V27.5Z" fill="#FFFFFF" />
    </Svg>
  );
}

function PauseIcon({ size = 64 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 76 76" fill="none">
      <Circle cx="38" cy="38" r="38" fill="rgba(0,0,0,0.36)" />
      <Path d="M31 28H36.5V48H31V28Z" fill="#FFFFFF" />
      <Path d="M39.5 28H45V48H39.5V28Z" fill="#FFFFFF" />
    </Svg>
  );
}

export type PostData = {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  image: string | number;
  video?: string | number;
  caption: string;
  time: string;
  likes: number;
  comments: number;
  bookmarks: number;
  shares: number;
  location?: string;
  music?: string;
  musicArtist?: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  /** Selects the action chrome — "vertical" = right-hand rail with
   *  music/location/follow, "horizontal" = bottom action row.
   *  NOTE: this says nothing about the media's shape. Use `aspectRatio`. */
  layout?: "vertical" | "horizontal";
  /** Intrinsic media aspect ratio (width / height), when known ahead of load.
   *  Lets the card pick the right fit on FIRST view instead of briefly
   *  rendering a cropped frame while the video reports its dimensions.
   *  A backend would supply this; measured values still override it. */
  aspectRatio?: number;
};

type PostCardProps = {
  post: PostData;
  height: number;
  bottomInset?: number;
  isActive?: boolean;
  /** False when the Home tab itself is hidden (user is on another tab) — gates video playback only. */
  isScreenActive?: boolean;
  minimized?: boolean;
  sheetProgress?: SharedValue<number>;
  onCommentPress?: () => void;
  onVideoLoadingChange?: (postId: string, isLoading: boolean) => void;
  /** Intrinsic media aspect ratio (width / height), reported once known.
   *  FeedScreen needs it to dock landscape posts as a correctly-proportioned
   *  banner — only this component sees the real dimensions. */
  onMediaAspect?: (postId: string, aspect: number) => void;
};

/* Isolated so the 4Hz timeUpdate subscription re-renders only this tiny bar —
   previously it lived in PostCard and re-rendered the entire card (SVGs,
   gradients, text) 4×/sec for the whole playback. Same 0.25s cadence and
   identical styles/markup. */
const VideoProgressBar = React.memo(function VideoProgressBar({ player }: { player: VideoPlayer }) {
  const timeUpdateEvent = useEvent(player, "timeUpdate", {
    currentTime: player.currentTime,
    currentLiveTimestamp: null,
    currentOffsetFromLive: null,
    bufferedPosition: 0,
  });
  const duration = player.duration;
  const progress = duration > 0 ? Math.min(timeUpdateEvent.currentTime / duration, 1) : 0;

  return (
    <View style={styles.videoProgressTrack} pointerEvents="none">
      <View style={[styles.videoProgressFill, { width: `${progress * 100}%` }]} />
      {progress > 0 && <View style={[styles.videoProgressThumb, { left: `${progress * 100}%` }]} />}
    </View>
  );
});

export const PostCard = React.memo(function PostCard({
  post,
  height,
  bottomInset = 0,
  isActive = false,
  isScreenActive = true,
  minimized = false,
  sheetProgress,
  onCommentPress,
  onVideoLoadingChange,
  onMediaAspect,
}: PostCardProps) {
  // Per-post interaction state keyed by post.id via useRecyclingState:
  // FlashList recycles card instances across posts, so plain useState here
  // would leak liked/paused/etc. state from the previous post into the new one.
  const [liked, setLiked] = useRecyclingState(post.isLiked ?? false, [post.id]);
  const [bookmarked, setBookmarked] = useRecyclingState(post.isBookmarked ?? false, [post.id]);
  const [likeCount, setLikeCount] = useRecyclingState(post.likes, [post.id]);
  const [showHeart, setShowHeart] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useRecyclingState(false, [post.id]);
  const [isManuallyPaused, setIsManuallyPaused] = useRecyclingState(false, [post.id]);
  const [showPlaybackCue, setShowPlaybackCue] = useState(false);
  const [hasRenderedFrame, setHasRenderedFrame] = useRecyclingState(false, [post.id]);
  // Seed from a previously measured aspect for this exact media, so a clip
  // that has been seen once renders at the right fit immediately instead of
  // flashing full-bleed portrait and then snapping to letterboxed.
  //
  // NOTE: deliberately NOT keyed off post.layout — that selects the action
  // chrome (vertical rail vs horizontal row), not the media's shape, so a
  // "horizontal" post can hold a portrait clip. The load handlers below remain
  // the source of truth and correct this from real dimensions.
  const mediaKey = post.video ?? post.image;
  const [mediaFit, setMediaFit] = useRecyclingState<"cover" | "contain">(
    () => {
      // Declared ratio wins on first view; the cache covers repeat views of
      // media whose ratio was never declared.
      const known = post.aspectRatio ?? mediaAspectCache.get(mediaKey);
      return known !== undefined && known > 1 ? "contain" : "cover";
    },
    [post.id]
  );
  const layout = post.layout ?? "vertical";

  // Overlays (actions, captions, gradients) fade out as comment sheet opens (progress 0→1).
  // On close, the fade-in is delayed (inputRange [0, 0.15, 1]) so the post card lands back
  // to its normal full size first, then the overlays smoothly fade in. Evaluated in a
  // worklet on the UI thread from the shared sheet progress.
  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: sheetProgress
      ? interpolate(sheetProgress.value, [0, OVERLAY_FADE_END, 1], [1, 0, 0], Extrapolation.CLAMP)
      : 1,
  }), [sheetProgress]);

  const player = useVideoPlayer(post.video || null, (player) => {
    player.loop = true;
    player.timeUpdateEventInterval = 0.25;
  });

  // useVideoPlayer ignores source changes after creation, so when FlashList
  // recycles this card onto a different post the player would keep the old
  // post's video. Swap the source explicitly on recycle.
  const videoSourceRef = useRef<string | number | null>(post.video ?? null);
  useEffect(() => {
    const nextSource = post.video ?? null;
    if (videoSourceRef.current === nextSource) return;
    videoSourceRef.current = nextSource;
    player.replaceAsync(nextSource);
  }, [post.video, player]);
  const statusEvent = useEvent(player, "statusChange", { status: player.status });

  const singleTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playbackCueTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTimedPlaybackCue = useCallback((keepVisible = false) => {
    if (playbackCueTimer.current) {
      clearTimeout(playbackCueTimer.current);
      playbackCueTimer.current = null;
    }

    setShowPlaybackCue(true);

    if (!keepVisible) {
      playbackCueTimer.current = setTimeout(() => {
        setShowPlaybackCue(false);
        playbackCueTimer.current = null;
      }, 520);
    }
  }, []);

  useEffect(() => {
    if (!post.video) return;

    if (isActive && isScreenActive && !isManuallyPaused) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, isScreenActive, isManuallyPaused, player, post.video]);

  useEffect(() => {
    if (isActive || !post.video) return;
    setIsManuallyPaused(false);
    setShowPlaybackCue(false);
  }, [isActive, post.video]);

  useEffect(() => {
    setHasRenderedFrame(false);
    setIsManuallyPaused(false);
    setShowPlaybackCue(false);
  }, [post.video]);

  useEffect(() => {
    if (!post.video) return;

    const status = statusEvent?.status;
    const isLoading = isActive && (!hasRenderedFrame || status === "loading");
    onVideoLoadingChange?.(post.id, isLoading);

    return () => onVideoLoadingChange?.(post.id, false);
  }, [hasRenderedFrame, isActive, onVideoLoadingChange, post.id, post.video, statusEvent?.status]);

  useEffect(() => {
    return () => {
      if (singleTapTimer.current) clearTimeout(singleTapTimer.current);
      if (playbackCueTimer.current) clearTimeout(playbackCueTimer.current);
    };
  }, []);

  const handleVideoToggle = useCallback(() => {
    if (!post.video) return;

    setIsManuallyPaused((paused) => {
      const nextPaused = !paused;

      if (nextPaused) {
        player.pause();
        showTimedPlaybackCue(true);
      } else {
        if (isActive) {
          player.play();
        }
        showTimedPlaybackCue(false);
      }

      return nextPaused;
    });
  }, [isActive, player, post.video, showTimedPlaybackCue]);

  const handleTap = useCallback(() => {
    if (singleTapTimer.current) {
      // Double tap!
      clearTimeout(singleTapTimer.current);
      singleTapTimer.current = null;

      if (!liked) {
        setLiked(true);
        setLikeCount((c) => c + 1);
      }
      setShowHeart(true);
      
      // Smart recovery: undo the pause from the first tap
      if (post.video) {
        setIsManuallyPaused(false);
        if (isActive) player.play();
        setShowPlaybackCue(false);
      }
      return;
    }

    // First tap. Act immediately for a "very fast" response.
    if (post.video) {
      handleVideoToggle();
    }

    // Start 300ms window to wait for a potential second tap
    singleTapTimer.current = setTimeout(() => {
      singleTapTimer.current = null;
    }, 300);
  }, [handleVideoToggle, liked, post.video, isActive, player]);

  const reportAspect = useCallback((width?: number, height?: number) => {
    if (!width || !height || height <= 0) return;
    const aspect = width / height;
    mediaAspectCache.set(mediaKey, aspect);
    onMediaAspect?.(post.id, aspect);
  }, [onMediaAspect, post.id, mediaKey]);

  const handleLikePress = useCallback(() => {
    setLiked((prev) => {
      setLikeCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  }, []);

  const handleBookmarkPress = useCallback(() => {
    setBookmarked((prev) => !prev);
  }, []);

  return (
    <View style={[styles.container, { height }]}>
      {/* Background Media — tappable for double-tap */}
      <Pressable onPress={handleTap} style={StyleSheet.absoluteFill}>
        {BLACK_POSTS ? (
          <LinearGradient
            colors={["#09072A", "#15127D", "#04040F"]}
            style={StyleSheet.absoluteFill}
          />
        ) : post.video ? (
          <>
            {!hasRenderedFrame && (
              <Image
                source={typeof post.image === "string" ? { uri: post.image } : post.image}
                style={StyleSheet.absoluteFill}
                contentFit={mediaFit}
                transition={200}
                onLoad={(e) => {
                  if (e.source.width > e.source.height) {
                    setMediaFit("contain");
                  } else {
                    setMediaFit("cover");
                  }
                }}
              />
            )}
            <VideoView
              player={player}
              style={StyleSheet.absoluteFill}
              nativeControls={false}
              contentFit={mediaFit}
              surfaceType="textureView"
              onFirstFrameRender={() => {
                setHasRenderedFrame(true);
                const track = player.videoTrack;
                if (track && track.size) {
                  setMediaFit(track.size.width > track.size.height ? "contain" : "cover");
                  // Video track is authoritative — the poster image may differ.
                  reportAspect(track.size.width, track.size.height);
                }
              }}
            />
          </>
        ) : (
          <Image
            source={typeof post.image === "string" ? { uri: post.image } : post.image}
            style={StyleSheet.absoluteFill}
            contentFit={mediaFit}
            transition={300}
            onLoad={(e) => {
              if (e.source.width > e.source.height) {
                setMediaFit("contain");
              } else {
                setMediaFit("cover");
              }
              reportAspect(e.source.width, e.source.height);
            }}
          />
        )}
      </Pressable>

      {/* Overlays (actions, caption, gradients, cues) — fade out/in with the comment sheet
          via sheetProgress-driven opacity on the native thread. */}
      <Reanimated.View
        style={[StyleSheet.absoluteFill, overlayAnimatedStyle]}
        pointerEvents={minimized ? "none" : "box-none"}
        // Rasterize this subtree into a single GPU texture so the sheet-open
        // fade blends a cached bitmap instead of re-rendering the whole
        // overlay every frame.
        //
        // Opacity only forces offscreen alpha compositing while it is
        // strictly between 0 and 1 — which, given the [0, 0.15, 1] curve
        // above, happens ONLY during progress 0→0.15. That is why opening
        // (which sweeps the full range) hitched early while dragging (which
        // stays near progress 1, opacity pinned at 0) stayed smooth. The
        // subtree is expensive to composite: two full-size gradients, four
        // SVG action buttons, and several Texts with large textShadowRadius.
        //
        // Gated on isActive so only the on-screen card holds a texture,
        // rather than every card FlashList keeps mounted.
        renderToHardwareTextureAndroid={isActive}
        shouldRasterizeIOS={isActive}
      >
      <HeartBurst visible={showHeart} onFinish={() => setShowHeart(false)} />

      {post.video && (isManuallyPaused || showPlaybackCue) && (
        <View style={styles.playbackCue} pointerEvents="none">
          {isManuallyPaused ? <PlayIcon /> : <PauseIcon />}
        </View>
      )}

      {post.video && isActive && <VideoProgressBar player={player} />}

      {/* Gradient overlays — pointerEvents none so they don't block touches */}
      <LinearGradient
        colors={["rgba(0,0,0,0.51)", "transparent"]}
        locations={[0, 1]}
        style={styles.topGradient}
        pointerEvents="none"
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,1)"]}
        locations={[0, 1]}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      {/* Bottom content area — 264px wide per Figma */}
      <View
        style={[styles.bottomContent, { width: 264, bottom: bottomInset + 18 }]}
        pointerEvents="box-none"
      >
        {/* User row */}
        <View style={styles.userRow}>
          <Image 
            source={{ uri: post.user.avatar }} 
            style={[styles.avatar, { width: layout === "vertical" ? 34 : 28, height: layout === "vertical" ? 34 : 28 }]} 
            contentFit="cover" 
          />
          <View style={{ flexShrink: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
              <Text style={[styles.username, { flexShrink: 1 }]} numberOfLines={1}>{post.user.name}</Text>
              <View style={styles.dot} />
              <Text style={styles.time}>{post.time}</Text>
            </View>
            {layout === "vertical" && post.music && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 1 }}>
                <Text style={styles.musicText}>{post.music}</Text>
                <View style={styles.smallDot} />
                <Text style={styles.musicText}>{post.musicArtist}</Text>
              </View>
            )}
          </View>
          {layout === "vertical" && (
            <Pressable style={styles.followBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.followText}>Follow</Text>
            </Pressable>
          )}
        </View>

        {/* Caption */}
        <Text style={styles.caption}>
          {captionExpanded ? post.caption : (post.caption.length > 65 ? `${post.caption.substring(0, 65)}... ` : post.caption)}
          {!captionExpanded && post.caption.length > 65 && (
            <Text style={styles.seeMoreInline} onPress={() => setCaptionExpanded(true)}>See more</Text>
          )}
        </Text>

        {/* Location tag */}
        {layout === "vertical" && post.location && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: -2 }}>
            <MapPinIcon size={16} color="#D2D2D2" />
            <Text style={styles.locationText}>{post.location}</Text>
          </View>
        )}

        {/* Horizontal actions */}
        {layout === "horizontal" && (
          <View style={styles.horizontalActions}>
            <View style={styles.horizontalLeft}>
              <Pressable style={styles.hAction} onPress={handleLikePress}>
                <HeartIcon size={20} filled={liked} />
                <Text style={styles.hActionText}>{likeCount} Like</Text>
              </Pressable>
              <Pressable style={styles.hAction} onPress={onCommentPress}>
                <CommentIcon size={20} />
                <Text style={styles.hActionText}>{post.comments} Comment</Text>
              </Pressable>
            </View>
            <Pressable style={styles.clipBtn}>
              <ClipIcon size={20} />
              <Text style={styles.clipText}>Clip</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Right-side vertical actions — aligned right, not centered */}
      {layout === "vertical" && (
        <View
          style={[styles.verticalActions, { bottom: bottomInset + 18 }]}
          pointerEvents="box-none"
        >
          {/* Grouped: Heart, Comment, Bookmark, Share */}
          <View style={styles.actionGroup}>
            <ActionButton
              icon={<HeartIcon size={28} filled={liked} />}
              count={likeCount}
              onPress={handleLikePress}
            />
            <ActionButton
              icon={<CommentIcon size={28} />}
              count={post.comments}
              onPress={onCommentPress}
            />
            <ActionButton
              icon={<BookmarkIcon size={28} filled={bookmarked} />}
              count={post.bookmarks}
              onPress={handleBookmarkPress}
            />
            <ActionButton
              icon={<ShareIcon size={28} />}
              count={post.shares}
            />
          </View>
          {/* Clip — separate */}
          <Pressable style={styles.clipBtn} onPress={() => {}}>
            <ClipIcon size={20} />
            <Text style={styles.clipText}>Clip</Text>
          </Pressable>
        </View>
      )}
      </Reanimated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: SCREEN_W,
    position: "relative",
    backgroundColor: "#000000",
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "40%",
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  playbackCue: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 64,
    height: 64,
    marginLeft: -32,
    marginTop: -32,
    alignItems: "center",
    justifyContent: "center",
  },
  videoProgressTrack: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.35)",
    zIndex: 12,
  },
  videoProgressFill: {
    height: 3,
    backgroundColor: "#1B17B3",
  },
  videoProgressThumb: {
    position: "absolute",
    top: -4,
    width: 11,
    height: 11,
    marginLeft: -5.5,
    borderRadius: 5.5,
    backgroundColor: "#1B17B3",
  },
  bottomContent: {
    position: "absolute",
    bottom: 18, /* 18px from the bottom of the PostCard (which now stops at the top of the navbar) */
    left: 18,
    gap: 6,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  avatar: {
    borderRadius: 60,
    backgroundColor: "#1B17B3",
  },
  username: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 16,
    color: "#FFFFFF",
    letterSpacing: -0.32,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#D9D9D9",
  },
  smallDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#D9D9D9",
  },
  time: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 12,
    color: "#D2D2D2",
    letterSpacing: -0.24,
  },
  musicText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 12,
    color: "#D2D2D2",
    letterSpacing: -0.24,
    lineHeight: 16.2,
  },
  followBtn: {
    height: 32,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E7F1FF",
    borderRadius: 22,
  },
  followText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 13,
    color: "#1B17B3",
    letterSpacing: -0.26,
  },
  caption: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: -0.28,
    lineHeight: 18.2,
    textShadowColor: "rgba(0,0,0,0.65)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 13,
  },
  seeMoreInline: {
    fontFamily: "Ubuntu_700Bold",
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: -0.28,
  },
  locationText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 12,
    color: "#D2D2D2",
    letterSpacing: -0.24,
    lineHeight: 16.2,
  },
  /* ─── Vertical (TikTok) actions — right-aligned ─── */
  verticalActions: {
    position: "absolute",
    right: 14,
    bottom: 18,
    alignItems: "flex-end",
    gap: 15,
  },
  actionGroup: {
    alignItems: "center",
    gap: 15,
  },
  /* ─── Horizontal (bottom row) actions ─── */
  horizontalActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  horizontalLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  hAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 20,
  },
  hActionText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: -0.28,
    textShadowColor: "rgba(0,0,0,1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  clipBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 6,
    paddingVertical: 6,
    backgroundColor: "rgba(184,184,184,0.2)",
    borderRadius: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  clipText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: -0.28,
    textShadowColor: "rgba(0,0,0,0.65)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 13,
  },
});
