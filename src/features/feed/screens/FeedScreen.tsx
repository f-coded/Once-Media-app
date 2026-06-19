import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  RefreshControl,
  View,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { BlurView } from "expo-blur";
import { PostCard, PostData } from "@/features/feed/components/PostCard";
import { FeedHeader } from "@/features/feed/components/FeedHeader";
import { BottomNav, NAV_HEIGHT } from "@/shared/components/layout/BottomNav";
import { CommentSheet } from "@/features/feed/components/CommentSheet";


/* Local property images */
const PROPERTY_IMG = require("../../../../assets/feed_property.jpg");
const PROPERTY_IMG_2 = require("../../../../assets/feed_property_2.jpg");
const PROPERTY_IMG_3 = require("../../../../assets/feed_property 01.jpg");
const PROPERTY_IMG_4 = require("../../../../assets/feed_property 02.jpg");
const PROPERTY_IMG_5 = require("../../../../assets/feed_property 03.jpg");
const PROPERTY_IMG_6 = require("../../../../assets/feed_property 04.jpg");
const PROPERTY_VIDEO_1 = require("../../../../assets/WhatsApp Video 2026-04-29 at 12.45.35 PM.mp4");
const PROPERTY_VIDEO_2 = require("../../../../assets/WhatsApp Video 2026-04-30 at 8.44.46 PM.mp4");

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
    layout: "horizontal",
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
    layout: "horizontal",
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

export function FeedScreen({ onChatPress, onWalletPress }: { onChatPress?: () => void; onWalletPress?: () => void }) {
  const { height: windowHeight } = useWindowDimensions();
  const [containerHeight, setContainerHeight] = useState(windowHeight);
  const POST_HEIGHT = containerHeight - NAV_HEIGHT;

  const [posts, setPosts] = useState(MOCK_POSTS);
  const [activeTab, setActiveTab] = useState<"home" | "market" | "chat" | "wallet">("home");

  const handleTabPress = (tab: "home" | "market" | "chat" | "wallet") => {
    if (tab === "chat") {
      onChatPress?.();
      return;
    }
    if (tab === "wallet") {
      onWalletPress?.();
      return;
    }
    setActiveTab(tab);
  };
  const [activePostId, setActivePostId] = useState(MOCK_POSTS[0]?.id ?? "");
  const [loadingPostId, setLoadingPostId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isBlurActive, setIsBlurActive] = useState(false);

  const activePost = posts.find((post) => post.id === activePostId);
  const isActiveVideoLoading = Boolean(activePost?.video && loadingPostId === activePostId);

  // Parallax: as the comment sheet opens, the feed (active post) recedes and lifts,
  // staying docked at the top of the sheet. Driven by showComments so it returns to
  // full when the sheet is dragged/closed. Same 300ms as the sheet to stay connected.
  const sheetProgress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(sheetProgress, {
      toValue: showComments ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showComments, sheetProgress]);

  // When the sheet opens it covers the bottom 75%, leaving a ~25% band at the top. The active post
  // shrinks into that band and rests on the sheet's top edge. Only the post frame minimizes — its
  // overlay UI (actions, caption, gradients) is hidden via the `minimized` prop on PostCard.
  // MIN_FRAME_RATIO = how much of the 25% band the shrunken frame fills (tune to taste).
  const TOP_BAND = windowHeight * 0.25;
  const MIN_FRAME_RATIO = 0.85;
  const minimizedScale = (TOP_BAND * MIN_FRAME_RATIO) / windowHeight;
  const minimizedShift = TOP_BAND / 2 - windowHeight / 2; // center the frame within the top band

  const feedScale = sheetProgress.interpolate({ inputRange: [0, 1], outputRange: [1, minimizedScale] });
  const feedTranslateY = sheetProgress.interpolate({ inputRange: [0, 1], outputRange: [0, minimizedShift] });

  const handleCommentPress = useCallback(() => {
    setShowComments(true);
    setIsBlurActive(true);
  }, []);

  const handleCommentCloseStart = useCallback(() => {
    setIsBlurActive(false);
  }, []);

  const handleCommentClose = useCallback(() => {
    setShowComments(false);
    setIsBlurActive(false);
  }, []);

  const handleScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.y / POST_HEIGHT);
    const nextPost = posts[nextIndex];

    if (nextPost) {
      setActivePostId(nextPost.id);
    }
  }, [POST_HEIGHT, posts]);

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

  const renderPost = useCallback(({ item }: { item: PostData }) => (
    <View style={{ height: POST_HEIGHT }}>
      <PostCard
        post={item}
        height={POST_HEIGHT}
        isActive={item.id === activePostId}
        minimized={showComments}
        onCommentPress={handleCommentPress}
        onVideoLoadingChange={handleVideoLoadingChange}
      />
    </View>
  ), [activePostId, showComments, handleCommentPress, handleVideoLoadingChange, POST_HEIGHT]);

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        {/* Feed header — floating */}
        <FeedHeader />

        {/* Posts feed */}
        <Animated.View
          style={[
            {
              flex: 1,
              overflow: "hidden",
              borderRadius: isBlurActive ? 20 : 0,
              transform: [{ translateY: feedTranslateY }, { scale: feedScale }],
            },
            // Android: use the RN 0.76+ filter array (works great)
            // iOS: we use a BlurView overlay instead (filter not reliable on iOS)
            isBlurActive && Platform.OS === "android"
              ? ({
                  filter: [{ blur: 2 }],
                } as any)
              : null,
          ]}
          onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
        >
          <FlashList
            data={posts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
            pagingEnabled
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
            onScrollEndDrag={handleScrollEnd}
            ListFooterComponent={<View style={{ height: NAV_HEIGHT }} />}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#1B17B3"
                colors={["#1B17B3"]}
              />
            }
          />

          {/* iOS feed blur overlay — sits above the feed, below the sheet */}
          {isBlurActive && Platform.OS === "ios" && (
            <BlurView
              intensity={20}
              tint="dark"
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
          )}

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
        </Animated.View>

        {!isBlurActive && (
          <BottomNav
            activeTab={activeTab}
            isLoading={isActiveVideoLoading}
            onTabPress={handleTabPress}
          />
        )}

        {/* Comment sheet — only mounted when active so it doesn't block touches */}
        {showComments && (
          <CommentSheet onClose={handleCommentClose} onCloseStart={handleCommentCloseStart} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#0C0C0C",
  },
});
