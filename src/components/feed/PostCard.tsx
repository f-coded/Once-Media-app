import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, Pressable, Dimensions, StyleSheet } from "react-native";
import { useEvent } from "expo";
import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Circle } from "react-native-svg";
import { font } from "../AuthUI";
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

/* Map pin icon — exact outlined style from user's SVG */
function MapPinIcon({ size = 16, color = "rgba(255,255,255,0.6)" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M8 8.66671C9.10457 8.66671 10 7.77128 10 6.66671C10 5.56214 9.10457 4.66671 8 4.66671C6.89543 4.66671 6 5.56214 6 6.66671C6 7.77128 6.89543 8.66671 8 8.66671Z" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M8 14.6667C8 14.6667 13.3333 10.6667 13.3333 6.66671C13.3333 3.72119 10.9455 1.33337 8 1.33337C5.05448 1.33337 2.66667 3.72119 2.66667 6.66671C2.66667 10.6667 8 14.6667 8 14.6667Z" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function PlayIcon({ size = 76 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 76 76" fill="none">
      <Circle cx="38" cy="38" r="38" fill="rgba(0,0,0,0.3)" />
      <Path d="M31 22 L 45 22 L 54 31 L 54 45 L 45 54 L 31 54 L 22 45 L 22 31 Z" fill="rgba(255,255,255,0.2)" />
      <Path d="M34 29 L 46 38 L 34 47 Z" fill="#FFFFFF" />
    </Svg>
  );
}

function PauseIcon({ size = 76 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 76 76" fill="none">
      <Circle cx="38" cy="38" r="38" fill="rgba(0,0,0,0.3)" />
      <Path d="M31 22 L 45 22 L 54 31 L 54 45 L 45 54 L 31 54 L 22 45 L 22 31 Z" fill="rgba(255,255,255,0.2)" />
      <Path d="M32 30 H 36 V 46 H 32 Z M 40 30 H 44 V 46 H 40 Z" fill="#FFFFFF" />
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
  layout?: "vertical" | "horizontal";
};

type PostCardProps = {
  post: PostData;
  height: number;
  isActive?: boolean;
  onCommentPress?: () => void;
  onVideoLoadingChange?: (postId: string, isLoading: boolean) => void;
};

export function PostCard({
  post,
  height,
  isActive = false,
  onCommentPress,
  onVideoLoadingChange,
}: PostCardProps) {
  const [liked, setLiked] = useState(post.isLiked ?? false);
  const [bookmarked, setBookmarked] = useState(post.isBookmarked ?? false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showHeart, setShowHeart] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [showPlaybackCue, setShowPlaybackCue] = useState(false);
  const [hasRenderedFrame, setHasRenderedFrame] = useState(false);
  const [mediaFit, setMediaFit] = useState<"cover" | "contain">("cover");
  const layout = post.layout ?? "vertical";

  const player = useVideoPlayer(post.video || null, (player) => {
    player.loop = true;
  });
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

    if (isActive && !isManuallyPaused) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, isManuallyPaused, player, post.video]);

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
        {post.video ? (
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
              onFirstFrameRender={() => {
                setHasRenderedFrame(true);
                const track = player.videoTrack;
                if (track && track.size) {
                  setMediaFit(track.size.width > track.size.height ? "contain" : "cover");
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
            }}
          />
        )}
      </Pressable>

      {/* Heart burst overlay */}
      <HeartBurst visible={showHeart} onFinish={() => setShowHeart(false)} />

      {post.video && (isManuallyPaused || showPlaybackCue) && (
        <View style={styles.playbackCue} pointerEvents="none">
          {isManuallyPaused ? <PlayIcon /> : <PauseIcon />}
        </View>
      )}

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
      <View style={[styles.bottomContent, { width: 264 }]} pointerEvents="box-none">
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
        <View style={styles.verticalActions} pointerEvents="box-none">
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
    </View>
  );
}

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
    width: 76,
    height: 76,
    marginLeft: -38,
    marginTop: -38,
    alignItems: "center",
    justifyContent: "center",
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
