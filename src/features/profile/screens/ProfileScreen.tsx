import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Platform,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Circle } from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_ITEM_SIZE = (SCREEN_WIDTH - 36) / 3; // 3 columns with padding

/* Local assets */
const AVATAR_KELECHI = require("../../../../assets/avatar-kelechi.png");
const PROPERTY_IMG = require("../../../../assets/feed_property.jpg");
const PROPERTY_IMG_2 = require("../../../../assets/feed_property_2.jpg");
const PROPERTY_IMG_3 = require("../../../../assets/feed_property 01.jpg");
const PROPERTY_IMG_4 = require("../../../../assets/feed_property 02.jpg");
const PROPERTY_IMG_5 = require("../../../../assets/feed_property 03.jpg");
const PROPERTY_IMG_6 = require("../../../../assets/feed_property 04.jpg");

interface PostGridItem {
  id: string;
  image: any;
  views: string;
}

const MOCK_POSTS: PostGridItem[] = [
  { id: "1", image: PROPERTY_IMG_4, views: "837" },
  { id: "2", image: PROPERTY_IMG_2, views: "1.2k" },
  { id: "3", image: PROPERTY_IMG_3, views: "945" },
  { id: "4", image: PROPERTY_IMG, views: "3.4k" },
  { id: "5", image: PROPERTY_IMG_5, views: "712" },
  { id: "6", image: PROPERTY_IMG_6, views: "1.8k" },
  { id: "7", image: PROPERTY_IMG_2, views: "2.1k" },
  { id: "8", image: PROPERTY_IMG_3, views: "530" },
  { id: "9", image: PROPERTY_IMG_4, views: "1.1k" },
  { id: "10", image: PROPERTY_IMG_5, views: "890" },
  { id: "11", image: PROPERTY_IMG_6, views: "1.5k" },
  { id: "12", image: PROPERTY_IMG, views: "320" },
];

const MOCK_SAVED_POSTS: PostGridItem[] = [
  { id: "s1", image: PROPERTY_IMG, views: "1.5k" },
  { id: "s2", image: PROPERTY_IMG_5, views: "820" },
  { id: "s3", image: PROPERTY_IMG_6, views: "2.3k" },
];

interface ProfileScreenProps {
  onBackPress?: () => void;
}

export function ProfileScreen({ onBackPress }: ProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");

  const currentPosts = activeTab === "posts" ? MOCK_POSTS : MOCK_SAVED_POSTS;

  const renderHeader = () => (
    <View style={s.profileHeader}>
      <View style={s.avatarContainer}>
        <Image source={AVATAR_KELECHI} style={s.avatar} contentFit="cover" />
        <Pressable style={s.addStoryBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 5V19M5 12H19"
              stroke="#FFFFFF"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>
      </View>

      <View style={s.nameRow}>
        <Text style={s.userName}>Kelechi Obi</Text>
        <Pressable style={s.editBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={s.editBtnText}>Edit</Text>
        </Pressable>
      </View>

      <View style={s.detailsRow}>
        <Text style={s.detailText}>Ikorodu, Lagos</Text>
        <View style={s.dot} />
        <Text style={s.detailText}>Olafarid12@gmail.com</Text>
      </View>

      <View style={s.statsContainer}>
        <View style={s.statCard}>
          <Text style={s.statLabel}>Posts</Text>
          <Text style={s.statValue}>327</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statLabel}>Likes</Text>
          <Text style={s.statValue}>1,572</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statLabel}>Followers</Text>
          <Text style={s.statValue}>1,572</Text>
        </View>
      </View>

      <Text style={s.bioText}>
        Sharing vibes, fashion, and everyday moments - life, unfiltered 🌟
      </Text>

      {/* Tabs */}
      <View style={s.tabsContainer}>
        <Pressable
          style={[s.tabButton, activeTab === "posts" && s.activeTabButton]}
          onPress={() => setActiveTab("posts")}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
              d="M4 5C4 4.44772 4.44772 4 5 4H9C9.55228 4 10 4.44772 10 5V9C10 9.55228 9.55228 10 9 10H5C4.44772 10 4 9.55228 4 9V5Z"
              stroke={activeTab === "posts" ? "#262525" : "#838383"}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M14 5C14 4.44772 14.4477 4 15 4H19C19.5523 4 20 4.44772 20 5V9C20 9.55228 19.5523 10 19 10H15C14.4477 10 14 9.55228 14 9V5Z"
              stroke={activeTab === "posts" ? "#262525" : "#838383"}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M4 15C4 14.4477 4.44772 14 5 14H9C9.55228 14 10 14.4477 10 15V19C10 19.5523 9.55228 20 9 20H5C4.44772 20 4 19.5523 4 19V15Z"
              stroke={activeTab === "posts" ? "#262525" : "#838383"}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M14 15C14 14.4477 14.4477 14 15 14H19C19.5523 14 20 14.4477 20 15V19C20 19.5523 19.5523 20 19 20H15C14.4477 20 14 19.5523 14 19V15Z"
              stroke={activeTab === "posts" ? "#262525" : "#838383"}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={[s.tabText, activeTab === "posts" && s.activeTabText]}>
            Your Posts
          </Text>
        </Pressable>

        <Pressable
          style={[s.tabButton, activeTab === "saved" && s.activeTabButton]}
          onPress={() => setActiveTab("saved")}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path
              d="M5 5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21L12 17.5L5 21V5Z"
              stroke={activeTab === "saved" ? "#262525" : "#838383"}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill={activeTab === "saved" ? "none" : "none"}
            />
          </Svg>
          <Text style={[s.tabText, activeTab === "saved" && s.activeTabText]}>
            Saved Posts
          </Text>
        </Pressable>
      </View>
    </View>
  );

  const renderGridItem = ({ item }: { item: PostGridItem }) => (
    <View style={s.gridItem}>
      <Image source={item.image} style={s.gridImage} contentFit="cover" />
      <View style={s.viewsOverlay}>
        <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" style={s.playIcon}>
          <Path
            d="M8 5V19L19 12L8 5Z"
            fill="#FFFFFF"
            stroke="#FFFFFF"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <Text style={s.viewsText}>{item.views}</Text>
      </View>
    </View>
  );

  return (
    <View style={[s.container, { backgroundColor: "#FFFFFF" }]}>
      {/* Navigation Header */}
      <View style={[s.navBar, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={onBackPress} style={s.navLeft} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 19L8 12L15 5"
              stroke="#262525"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={s.navTitle}>Profile</Text>
        </Pressable>

        <Pressable style={s.settingsBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
              stroke="#262525"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
              stroke="#262525"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </Pressable>
      </View>

      {/* Grid of posts */}
      <FlatList
        data={currentPosts}
        renderItem={renderGridItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.listContent}
        columnWrapperStyle={s.gridRow}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E4E4",
    backgroundColor: "#FFFFFF",
    zIndex: 10,
  },
  navLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  navTitle: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 18,
    color: "#262525",
    letterSpacing: -0.36,
  },
  settingsBtn: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 12,
  },
  avatarContainer: {
    position: "relative",
    width: 79,
    height: 79,
    marginBottom: 16,
  },
  avatar: {
    width: 79,
    height: 79,
    borderRadius: 40,
    backgroundColor: "#262525",
  },
  addStoryBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#1B17B3",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
  },
  userName: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 18,
    color: "#262525",
    letterSpacing: -0.36,
  },
  editBtn: {
    backgroundColor: "#E7F1FF",
    borderRadius: 22,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  editBtnText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 13,
    color: "#1B17B3",
    letterSpacing: -0.26,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 6,
  },
  detailText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 13,
    color: "#838383",
    letterSpacing: -0.26,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#838383",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    width: "100%",
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  statLabel: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 12,
    color: "#838383",
    letterSpacing: -0.24,
  },
  statValue: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 16,
    color: "#000000",
    letterSpacing: -0.32,
  },
  bioText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 13,
    lineHeight: 18.2,
    color: "#262525",
    textAlign: "center",
    letterSpacing: -0.26,
    marginTop: 16,
    paddingHorizontal: 12,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#D2D2D2",
    width: "100%",
    marginTop: 24,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTabButton: {
    borderBottomColor: "#000000",
  },
  tabText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 13,
    color: "#838383",
    letterSpacing: -0.26,
  },
  activeTabText: {
    fontFamily: "Ubuntu_500Medium",
    color: "#262525",
  },
  gridRow: {
    justifyContent: "flex-start",
    gap: 9,
    marginBottom: 9,
  },
  gridItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE * 1.19, // Keep approximately 125x149 aspect ratio
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#F2F2F2",
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  viewsOverlay: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 4,
  },
  playIcon: {
    marginTop: 0.5,
  },
  viewsText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 11,
    color: "#FFFFFF",
    letterSpacing: -0.22,
  },
});
