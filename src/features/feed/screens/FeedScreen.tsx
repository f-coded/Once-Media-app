import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  InteractionManager,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  RefreshControl,
  View,
  StyleSheet,
  useWindowDimensions,
  StatusBar,
} from "react-native";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withSpring,
} from "react-native-reanimated";
import { FlashList } from "@shopify/flash-list";
import { PostCard, PostData, OVERLAY_FADE_END } from "@/features/feed/components/PostCard";
import { FeedHeader } from "@/features/feed/components/FeedHeader";
import { BottomNav, NAV_HEIGHT } from "@/shared/components/layout/BottomNav";
import { CommentSheet } from "@/features/feed/components/CommentSheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";


/* Local property images */
const PROPERTY_IMG = require("../../../../assets/feed_property.jpg");
const PROPERTY_IMG_2 = require("../../../../assets/feed_property_2.jpg");
const PROPERTY_IMG_3 = require("../../../../assets/feed_property 01.jpg");
const PROPERTY_IMG_4 = require("../../../../assets/feed_property 02.jpg");
const PROPERTY_IMG_5 = require("../../../../assets/feed_property 03.jpg");
const PROPERTY_IMG_6 = require("../../../../assets/feed_property 04.jpg");
const PROPERTY_VIDEO_1 = require("../../../../assets/WhatsApp Video 2026-04-29 at 12.45.35 PM.mp4");
const PROPERTY_VIDEO_2 = require("../../../../assets/WhatsApp Video 2026-04-30 at 8.44.46 PM.mp4");

/* Reanimated equivalent of the old RN Animated.spring({ bounciness: 0, speed: 16 }):
   RN converts bounciness/speed via fromBouncinessAndSpeed → origami
   tension/friction ≈ 94.4/13.4, which it uses directly as stiffness/damping
   with mass 1 — same curve, now driven from the UI thread. */
/* How far a docked landscape banner may be scaled UP to close the dark gap
   between it and the sheet. Values >1 crop the video's left/right edges, so
   keep this modest — 1.12 trims ~6% per side. Set to 1 for zero cropping at
   the cost of a larger gap. */
const LANDSCAPE_MAX_UPSCALE = 1.12;

const SHEET_OPEN_SPRING = {
  stiffness: 94.4,
  damping: 13.4,
  mass: 1,
  restDisplacementThreshold: 0.001,
  restSpeedThreshold: 0.001,
};

/* ─── Mock Data ─── */
const MOCK_POSTS: PostData[] = [
  {
    id: "1",
    user: { name: "Kelechi Obi", avatar: "https://i.pravatar.cc/100?img=3" },
    image: PROPERTY_IMG_4,
    caption: "Sea Watch Mansion is a luxurious waterfront residence located in the serene neighborhood of Lekki Phase 1, featuring modern architecture and breathtaking views.",
    time: "12:58 PM",
    likes: 3,
    comments: 1,
    bookmarks: 1,
    shares: 1,
    location: "Lagos State Polytechnic, First Gate, Lagos State",
    music: "Lovely",
    musicArtist: "Khaleed & SIA",
    layout: "vertical",
  },
  {
    id: "2",
    user: { name: "Amara Eze", avatar: "https://i.pravatar.cc/100?img=5" },
    image: PROPERTY_IMG_2,
    caption: "Just listed! This stunning 5-bedroom villa in Banana Island offers unparalleled luxury with private pool and lush gardens. Schedule a viewing today.",
    time: "2:30 PM",
    likes: 18200,
    comments: 892,
    bookmarks: 3100,
    shares: 8400,
  },
  {
    id: "3",
    user: { name: "David O", avatar: "https://i.pravatar.cc/100?img=8" },
    image: PROPERTY_IMG, // fallback image if video doesn't load
    video: PROPERTY_VIDEO_1,
    caption: "Video tour preview: see how this property walkthrough feels directly inside the Once feed.",
    time: "4:15 PM",
    likes: 28,
    comments: 7,
    bookmarks: 15,
    shares: 5,
    // 480x1070 — a portrait clip. Media shape is independent of `layout`.
    aspectRatio: 480 / 1070,
  },
  {
    id: "4",
    user: { name: "Chioma Nweze", avatar: "https://i.pravatar.cc/100?img=9" },
    image: PROPERTY_IMG,
    caption: "Luxury redefined. 4-bed duplex in Ikoyi with rooftop terrace, infinity pool, and state-of-the-art gym. Premium finishes from Italian marble to German engineering.",
    time: "6:42 PM",
    likes: 45,
    comments: 12,
    bookmarks: 22,
    shares: 8,
    location: "Ikoyi, Lagos",
    music: "Essence",
    musicArtist: "Wizkid ft. Tems",
    layout: "vertical",
  },
  {
    id: "5",
    user: { name: "Emeka Okafor", avatar: "https://i.pravatar.cc/100?img=12" },
    image: PROPERTY_IMG_3,
    video: PROPERTY_VIDEO_2,
    caption: "A second feed video test with the same full-screen layout, actions, captions, and navbar loading stroke.",
    time: "8:10 PM",
    likes: 67,
    comments: 19,
    bookmarks: 33,
    shares: 11,
    // 1280x720 — a genuine 16:9 landscape clip. Still docks as a wide banner:
    // that is driven by aspectRatio, not by `layout`.
    aspectRatio: 1280 / 720,
  },
  {
    id: "6",
    user: { name: "Sarah Jenkins", avatar: "https://i.pravatar.cc/100?img=15" },
    image: PROPERTY_IMG,
    caption: "Incredible modern interior design with minimalist aesthetics. Perfect for content creators looking for a spacious studio vibe.",
    time: "Yesterday",
    likes: 1204,
    comments: 45,
    bookmarks: 302,
    shares: 88,
  },
  {
    id: "7",
    user: { name: "Tunde Ednut", avatar: "https://i.pravatar.cc/100?img=22" },
    image: PROPERTY_IMG_5,
    caption: "Beautiful evening skyline from the penthouse view. Nothing beats this golden hour lighting! ✨",
    time: "Yesterday",
    likes: 8500,
    comments: 312,
    bookmarks: 1400,
    shares: 520,
    layout: "vertical",
    music: "Golden Hour",
    musicArtist: "JVKE",
  },
  {
    id: "8",
    user: { name: "Linda Ikeji", avatar: "https://i.pravatar.cc/100?img=33" },
    image: PROPERTY_IMG_6,
    caption: "Exclusive look at the new residential development in Victoria Island. High-end amenities and 24/7 concierge service.",
    time: "2 days ago",
    likes: 420,
    comments: 18,
    bookmarks: 75,
    shares: 12,
  },
];

// Memoized: with stable callbacks from App, a tab switch only re-renders this
// screen when isScreenActive actually flips (feed ↔ other tab), and not at all
// for chat ↔ wallet switches.
export const FeedScreen = React.memo(function FeedScreen({ isScreenActive = true, onChatPress, onWalletPress, onProfilePress }: { isScreenActive?: boolean; onChatPress?: () => void; onWalletPress?: () => void; onProfilePress?: () => void }) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [feedViewportHeight, setFeedViewportHeight] = useState(0);
  const hasMeasuredFeed = feedViewportHeight > 0;
  const POST_HEIGHT = Math.max(1, (hasMeasuredFeed ? feedViewportHeight : windowHeight) - NAV_HEIGHT);

  const [posts, setPosts] = useState(MOCK_POSTS);
  const [activeTab, setActiveTab] = useState<"home" | "market" | "chat" | "wallet">("home");

  // Reset to "home" when returning to this screen after navigating away
  useEffect(() => {
    if (isScreenActive) setActiveTab("home");
  }, [isScreenActive]);

  const handleTabPress = (tab: "home" | "market" | "chat" | "wallet") => {
    setActiveTab(tab);           // flip Home's active→false BEFORE leaving
    if (tab === "chat") {
      onChatPress?.();
      return;
    }
    if (tab === "wallet") {
      onWalletPress?.();
      return;
    }
  };
  const [activePostId, setActivePostId] = useState(MOCK_POSTS[0]?.id ?? "");
  const [loadingPostId, setLoadingPostId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  // NOTE: `isMinimized` used to live here. It was set on every open/close but
  // never read in render and never passed to PostCard (whose `minimized` prop
  // is separate and unused from this screen) — a pure wasted re-render inside
  // the open commit. Removed.
  const [isBlurActive, setIsBlurActive] = useState(false);

  // Defer the CommentSheet's initial mount until after the feed's first paint
  // settles — it's invisible at launch, but mounting it (gesture handlers,
  // comment list) with the rest of the feed added to the login-tap cost.
  // Once mounted it stays mounted, preserving the zero-mount-lag open that
  // handleCommentPress relies on. showComments in the render condition covers
  // the edge where the user opens comments before the idle callback fires.
  const [sheetWarm, setSheetWarm] = useState(false);
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => setSheetWarm(true));
    return () => task.cancel();
  }, []);

  // Intrinsic aspect ratio per post, reported by PostCard once the media
  // loads. Only used for docking landscape posts.
  const [mediaAspects, setMediaAspects] = useState<Record<string, number>>({});
  const handleMediaAspect = useCallback((postId: string, aspect: number) => {
    setMediaAspects((prev) => (prev[postId] === aspect ? prev : { ...prev, [postId]: aspect }));
  }, []);

  const activePost = posts.find((post) => post.id === activePostId);
  const isActiveVideoLoading = Boolean(activePost?.video && loadingPostId === activePostId);

  // Parallax docking (TikTok/Reels style), driven by a SHARED Reanimated value handed to the
  // CommentSheet. The sheet writes this value on every drag frame (in worklets, on the UI
  // thread) and on close - the feed only READS it. So the post resizes live as you drag the
  // sheet with zero JS-bridge hops per frame, and follows the exact same close curve.
  const sheetProgress = useSharedValue(0);

  // The CommentSheet covers the bottom 68%, so its top edge sits at 32% of the screen. The docked
  // post fills from the very top (status bar) down to that edge (minus a small breathing gap), so
  // it sits ON the sheet with no empty band. The transform scales the full-screen feed around its
  // center, so we solve scale + translateY to land the scaled frame in [dockTop, dockBottom].
  const SHEET_TOP = windowHeight * (1 - 0.68); // matches CommentSheet's 0.68 height ratio
  const GAP = 6; // small breathing room between the docked post and the sheet's rounded top
  const dockTop = 0; // surpass status bar, start at the extreme top
  const dockBottom = SHEET_TOP - GAP;
  const dockHeight = Math.max(0, dockBottom - dockTop);

  // The feed container is NAV_HEIGHT TALLER than a single post: POST_HEIGHT is
  // (viewport - NAV_HEIGHT), because the BottomNav sits opaquely over that
  // bottom strip at rest. So the container always renders the current post
  // PLUS the top ~55px of the next one. Scaling the whole container into the
  // dock therefore dragged that next-post strip into the docked card (the flat
  // band along the card's bottom edge).
  //
  // Solve the scale/shift for the POST region instead, so exactly one post
  // spans [dockTop, dockBottom]. The leftover strip scales to ~18px and lands
  // below the dock, where the sheet covers it; the mask in the render hides
  // the few px that fall inside GAP.
  const feedFrameHeight = hasMeasuredFeed ? feedViewportHeight : windowHeight;
  const minimizedScale = POST_HEIGHT > 0 ? dockHeight / POST_HEIGHT : 1;
  // Scale is center-anchored, so solve translateY for: post top (local y=0)
  // lands on dockTop  →  T = dockTop - (frameHeight/2) * (1 - scale)
  const minimizedShift = dockTop - (feedFrameHeight / 2) * (1 - minimizedScale);

  /* ── Landscape posts dock as a full-width banner, NOT a shrunken card ──
     A horizontal post's media is letterboxed inside the portrait card
     (contentFit "contain"), so scaling that card into the dock left the video
     as a tiny strip surrounded by black. Instead, landscape posts are not
     scaled at all (scale 1, full width, true proportions) — the card is only
     SLID up until the media's top edge lands on dockTop. The card's black
     region above the media ends up off-screen; the region below sits between
     the banner and the sheet. Vertical posts are untouched. */
  // Orientation comes from the MEASURED media ratio, never from post.layout —
  // `layout` selects the action chrome (vertical rail vs horizontal row), not
  // the media's shape, so a "horizontal" post can hold a portrait clip. Until
  // the real ratio arrives the post docks as a normal (portrait) card, which
  // is the safe default.
  // Measured ratio wins once it arrives; the post's declared aspectRatio makes
  // the very first dock correct before any media has loaded.
  const activeAspect = activePost
    ? mediaAspects[activePost.id] ?? activePost.aspectRatio
    : undefined;
  const isLandscapePost = activeAspect !== undefined && activeAspect > 1;
  const landscapeAspect = activeAspect ?? 16 / 9;
  // Media is letterboxed to the card's width, so its on-card height is w / aspect.
  const landscapeMediaHeight = windowWidth / landscapeAspect;
  const landscapeMediaTop = (POST_HEIGHT - landscapeMediaHeight) / 2;
  // Scale up toward filling the dock height so less dark space is left under
  // the banner, capped by LANDSCAPE_MAX_UPSCALE so the sides aren't badly cropped.
  const landscapeScale = Math.min(
    Math.max(landscapeMediaHeight > 0 ? dockHeight / landscapeMediaHeight : 1, 1),
    LANDSCAPE_MAX_UPSCALE
  );
  // Scale is centre-anchored, so solve translateY for: media top → dockTop.
  const landscapeShift =
    dockTop - feedFrameHeight / 2 - (landscapeMediaTop - feedFrameHeight / 2) * landscapeScale;

  const dockScaleY = isLandscapePost ? landscapeScale : minimizedScale;
  const dockScaleX = isLandscapePost ? landscapeScale : 0.45; // 0.45 = vertical "breath width"
  const dockShift = isLandscapePost ? landscapeShift : minimizedShift;

  // Same interpolations as before ([0,1] → dock transform), now evaluated in
  // a worklet on the UI thread. minimizedScale/Shift are plain captured
  // numbers; the deps array rebuilds the worklet when the viewport changes.
  const feedTransformStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(sheetProgress.value, [0, 1], [0, dockShift]) },
      { scaleY: interpolate(sheetProgress.value, [0, 1], [1, dockScaleY]) },
      { scaleX: interpolate(sheetProgress.value, [0, 1], [1, dockScaleX]) },
    ],
  }), [dockShift, dockScaleY, dockScaleX]);

  // Shares PostCard's overlay curve (and its constant) so the header and the
  // post's own overlays fade as one group.
  const headerFadeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(sheetProgress.value, [0, OVERLAY_FADE_END, 1], [1, 0, 0], Extrapolation.CLAMP),
  }));

  const handleCommentPress = useCallback(() => {
    setShowComments(true);
    setIsBlurActive(true);
    StatusBar.setHidden(true, "slide");
    // Drive the open animation from HERE, in the same tick as the state above,
    // instead of waiting for CommentSheet to mount and fire its own effect.
    // That mount-lag was the "little bit of delay" before the post shrunk.
    sheetProgress.value = withSpring(1, SHEET_OPEN_SPRING);
  }, [sheetProgress]);

  const handleCommentCloseStart = useCallback(() => {
    // start expanding postcard and show overlays immediately!
    setIsBlurActive(false);
    StatusBar.setHidden(false, "slide");
  }, []);

  const handleCommentClose = useCallback(() => {
    setShowComments(false);
    setIsBlurActive(false);
    StatusBar.setHidden(false, "slide");
  }, []);

  const handleScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.y / POST_HEIGHT);
    const nextPost = posts[nextIndex];

    if (nextPost) {
      setActivePostId(nextPost.id);
    }
  }, [POST_HEIGHT, posts]);

  // Drag-end is only a FALLBACK for the no-momentum case (finger released at
  // rest, so no snap/fling follows and onMomentumScrollEnd never fires). When
  // there IS velocity, the offset at drag-end is not the settled page yet —
  // committing it here briefly activated the wrong post, so we skip and let
  // onMomentumScrollEnd finalize.
  const handleScrollEndDrag = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const velocityY = event.nativeEvent.velocity?.y ?? 0;
    if (Math.abs(velocityY) > 0.1) return;
    handleScrollEnd(event);
  }, [handleScrollEnd]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPosts(MOCK_POSTS);
    setActivePostId(MOCK_POSTS[0]?.id ?? "");
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const handleEndReached = useCallback(() => {
    setPosts((currentPosts) => {
      const nextPage = MOCK_POSTS.map((post, index) => ({
        ...post,
        id: `${post.id}-${Math.floor(currentPosts.length / MOCK_POSTS.length)}-${index}`,
      }));

      return [...currentPosts, ...nextPage];
    });
  }, []);

  const handleVideoLoadingChange = useCallback((postId: string, isLoading: boolean) => {
    setLoadingPostId((currentPostId) => {
      if (isLoading) return postId;
      return currentPostId === postId ? null : currentPostId;
    });
  }, []);

  const handleFeedLayout = useCallback((event: LayoutChangeEvent) => {
    const nextHeight = Math.round(event.nativeEvent.layout.height);

    setFeedViewportHeight((currentHeight) => (
      Math.abs(currentHeight - nextHeight) > 1 ? nextHeight : currentHeight
    ));
  }, []);

  const renderPost = useCallback(({ item }: { item: PostData }) => (
    <View style={{ height: POST_HEIGHT }}>
      <PostCard
        post={item}
        height={POST_HEIGHT}
        isActive={item.id === activePostId}
        isScreenActive={isScreenActive}
        sheetProgress={sheetProgress}
        onCommentPress={handleCommentPress}
        onVideoLoadingChange={handleVideoLoadingChange}
        onMediaAspect={handleMediaAspect}
      />
    </View>
  ), [activePostId, isScreenActive, sheetProgress, handleCommentPress, handleVideoLoadingChange, handleMediaAspect, POST_HEIGHT]);

  return (
    <View style={styles.root}>
      <View style={styles.container}>

        {/* Feed header — floating. Stays MOUNTED and fades with the sheet.
            Unmounting it on open tore down its BlurView and rebuilt it at
            close-start, mid-animation — the header "pop". Same fade curve as
            PostCard's overlays, so they move as one. */}
        <FeedHeader
          onProfilePress={onProfilePress}
          style={headerFadeStyle}
          pointerEvents={isBlurActive ? "none" : "box-none"}
        />
       
        {/* <Animated.View style={[isBlurActive && Platform.OS === "android" ? { filter: [{ blur: 2 }] } : null]}>
          <FeedHeader />
        </Animated.View> */}
        {/* Posts feed */}
        <Reanimated.View
          style={[
            {
              flex: 1,
              overflow: "hidden",
              borderRadius: isBlurActive ? 20 : 0,
            },
            feedTransformStyle,
            // NOTE: a `filter: [{ blur: 2 }]` (Android) and a full-cover
            // BlurView (iOS) used to be applied here while the comment sheet
            // was open. Both sat on the whole feed container, so they blurred
            // the post MEDIA — with real video that turned the docked card
            // into an unreadable smear, defeating the point of keeping the
            // post visible while commenting. Hiding the post's own contents
            // (username, location, caption, like/comment/share) is already
            // handled by the overlay opacity fade inside PostCard, so the
            // blur was removed rather than rescoped. The dim layer below is
            // kept — it de-emphasises the card without destroying the image.
          ]}
          onLayout={handleFeedLayout}
        >
          {hasMeasuredFeed && (
            <FlashList
              data={posts}
              renderItem={renderPost}
              keyExtractor={(item) => item.id}
              pagingEnabled={Platform.OS === "ios"}
              disableIntervalMomentum={true}
              bounces
              alwaysBounceVertical
              overScrollMode="always"
              showsVerticalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={POST_HEIGHT}
              snapToAlignment="start"
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.8}
              onMomentumScrollEnd={handleScrollEnd}
              onScrollEndDrag={handleScrollEndDrag}
              ListFooterComponent={<View style={{ height: NAV_HEIGHT + insets.bottom }} />}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor="#1B17B3"
                  colors={["#1B17B3"]}
                />
              }
            />
          )}

          {/* Masks the top edge of the NEXT post, which lives in the
              NAV_HEIGHT strip the BottomNav covers at rest. Invisible when
              expanded (the opaque nav already sits over it); essential when
              minimized, where the nav no longer lines up with it. Scales with
              the frame, so it stays exactly over that strip. */}
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: NAV_HEIGHT,
              backgroundColor: "#0C0C0C",
            }}
            pointerEvents="none"
          />

           {/* dim overlay for both platforms */}
          {isBlurActive && (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: "rgba(0, 0, 0, 0.45)" },
              ]}
              pointerEvents="none"
            />
          )}
        </Reanimated.View>

        {/* Keep BottomNav MOUNTED always - unmounting it on open made it rebuild all four SVG
            icon sets at close-start, adding JS jank right as the sheet slid past it (the bottom
            "hang"). The sheet covers it while open; we just disable its touches then. */}
        <View
          pointerEvents={isBlurActive ? "none" : "auto"}
          style={styles.bottomNavWrapper}
        >
          <BottomNav
            activeTab={activeTab}
            isLoading={isActiveVideoLoading}
            onTabPress={handleTabPress}
          />
        </View>

        {/* Comment sheet — mount deferred to post-first-paint (sheetWarm),
            then kept mounted so opening it has zero mount lag */}
        {(sheetWarm || showComments) && (
          <CommentSheet
            visible={showComments}
            onClose={handleCommentClose}
            onCloseStart={handleCommentCloseStart}
            progress={sheetProgress}
          />
        )}

      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#0C0C0C",
  },
  bottomNavWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
});