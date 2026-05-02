import React, { useState, useRef, useCallback } from "react";
import { View, FlatList, Dimensions, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet from "@gorhom/bottom-sheet";

import { PostCard, PostData } from "../components/feed/PostCard";
import { FeedHeader } from "../components/feed/FeedHeader";
import { BottomNav, NAV_HEIGHT } from "../components/feed/BottomNav";
import { CommentSheet } from "../components/feed/CommentSheet";

const { height: SCREEN_H } = Dimensions.get("window");

/* Post height = full viewport */
const POST_HEIGHT = SCREEN_H;

/* Local property image */
const PROPERTY_IMG = require("../../assets/feed_property.jpg");

/* ─── Mock Data ─── */
const MOCK_POSTS: PostData[] = [
  {
    id: "1",
    user: { name: "Kelechi Obi", avatar: "https://i.pravatar.cc/100?img=3" },
    image: PROPERTY_IMG,
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
    image: PROPERTY_IMG,
    caption: "Just listed! This stunning 5-bedroom villa in Banana Island offers unparalleled luxury with private pool and lush gardens. Schedule a viewing today.",
    time: "2:30 PM",
    likes: 12,
    comments: 4,
    bookmarks: 6,
    shares: 2,
    layout: "horizontal",
  },
  {
    id: "3",
    user: { name: "Tunde Adebayo", avatar: "https://i.pravatar.cc/100?img=8" },
    image: PROPERTY_IMG,
    caption: "Contemporary living at its finest. This penthouse suite features floor-to-ceiling windows with panoramic city views, smart home integration, and designer finishes.",
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
    image: PROPERTY_IMG,
    caption: "Tour of this architectural masterpiece in Victoria Island. Every detail has been carefully crafted to blend elegance with functionality. Available for immediate viewing.",
    time: "8:10 PM",
    likes: 67,
    comments: 19,
    bookmarks: 33,
    shares: 11,
    layout: "horizontal",
  },
];

export function FeedScreen() {
  const [activeTab, setActiveTab] = useState<"home" | "market" | "chat" | "wallet">("home");
  const [showComments, setShowComments] = useState(false);
  const commentSheetRef = useRef<BottomSheet>(null);

  const handleCommentPress = useCallback(() => {
    setShowComments(true);
    // Small delay to let sheet mount before snapping
    setTimeout(() => commentSheetRef.current?.snapToIndex(0), 50);
  }, []);

  const handleCommentClose = useCallback(() => {
    commentSheetRef.current?.close();
    setShowComments(false);
  }, []);

  const renderPost = useCallback(({ item }: { item: PostData }) => (
    <PostCard
      post={item}
      height={POST_HEIGHT}
      onCommentPress={handleCommentPress}
    />
  ), [handleCommentPress]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.container}>
        {/* Feed header — floating */}
        <FeedHeader />

        {/* Posts feed */}
        <View style={{ height: POST_HEIGHT, overflow: "hidden" }}>
          <FlatList
            data={MOCK_POSTS}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={POST_HEIGHT}
            snapToAlignment="start"
            getItemLayout={(_, index) => ({
              length: POST_HEIGHT,
              offset: POST_HEIGHT * index,
              index,
            })}
          />
        </View>

        {/* Bottom nav */}
        <BottomNav activeTab={activeTab} onTabPress={setActiveTab} />

        {/* Comment sheet — only mounted when active so it doesn't block touches */}
        {showComments && (
          <CommentSheet ref={commentSheetRef} onClose={handleCommentClose} />
        )}
      </View>
    </GestureHandlerRootView>
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
