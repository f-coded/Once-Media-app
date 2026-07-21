import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
  Animated,
  ScrollView,
  BackHandler,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Easing,
} from "react-native";
import {
  PanGestureHandler,
  State,
  PanGestureHandlerStateChangeEvent,
} from "react-native-gesture-handler";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Circle } from "react-native-svg";
import { BlurView } from "expo-blur";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
// 3 columns, 1px divider between items (2 vertical gaps total)
const GRID_ITEM_SIZE = (SCREEN_WIDTH - 2) / 3;

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
  { id: "2", image: PROPERTY_IMG_2, views: "837" },
  { id: "3", image: PROPERTY_IMG_3, views: "837" },
  { id: "4", image: PROPERTY_IMG, views: "837" },
  { id: "5", image: PROPERTY_IMG_5, views: "837" },
  { id: "6", image: PROPERTY_IMG_6, views: "837" },
  { id: "7", image: PROPERTY_IMG_2, views: "837" },
  { id: "8", image: PROPERTY_IMG_3, views: "837" },
  { id: "9", image: PROPERTY_IMG_4, views: "837" },
  { id: "10", image: PROPERTY_IMG_5, views: "837" },
  { id: "11", image: PROPERTY_IMG_6, views: "837" },
  { id: "12", image: PROPERTY_IMG, views: "837" },
  { id: "13", image: PROPERTY_IMG_4, views: "837" },
  { id: "14", image: PROPERTY_IMG_5, views: "837" },
  { id: "15", image: PROPERTY_IMG_6, views: "837" },
  { id: "16", image: PROPERTY_IMG, views: "837" },
  { id: "17", image: PROPERTY_IMG_4, views: "837" },
  { id: "18", image: PROPERTY_IMG_5, views: "837" },
  { id: "19", image: PROPERTY_IMG_6, views: "837" },
  { id: "20", image: PROPERTY_IMG, views: "837" },
];

const MOCK_SAVED_POSTS: PostGridItem[] = [
  { id: "s1", image: PROPERTY_IMG, views: "837" },
  { id: "s2", image: PROPERTY_IMG_5, views: "837" },
  { id: "s3", image: PROPERTY_IMG_6, views: "837" },
];

interface ProfileScreenProps {
  isActive?: boolean;
  isShifted?: boolean;
  onBackPress?: () => void;
  onSettingsPress?: () => void;
}

// Fixed dimensions for tab line sliding calculations
const TAB_CONTAINER_WIDTH = SCREEN_WIDTH - 172; // width of tabs row with 86px margins
const TAB_WIDTH = (TAB_CONTAINER_WIDTH - 29) / 2; // two tabs with a 29px gap between them
// const INDICATOR_TRAVEL_DISTANCE = TAB_WIDTH + 29; // translation range between tab centers

interface StableProfileHeaderProps {
  activeTab: "posts" | "saved";
  setActiveTab: (tab: "posts" | "saved") => void;
  tabIndicatorX: Animated.Value | Animated.AnimatedInterpolation<number>;
}

// Stable header component to prevent avatar unmounting/re-rendering glitch on tab toggling
const StableProfileHeader = React.memo(({
  activeTab,
  setActiveTab,
  tabIndicatorX,
}: StableProfileHeaderProps) => {
  return (
    <View style={s.headerContainer}>
      <View style={s.profileHeader}>
        <View style={s.avatarContainer}>
          <Image source={AVATAR_KELECHI} style={s.avatar} contentFit="cover" />
          <Pressable style={s.addStoryBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
              <Path d="M6 12H18" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <Path d="M12 18V6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
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
      </View>

      {/* Tabs */}
      <View style={s.tabsWrapper}>
        <View style={s.tabsContainer}>
          <Pressable
            style={s.tabButton}
            onPress={() => setActiveTab("posts")}
          >
            {/* Posts Carousel Vertical icon */}
            <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
              <Path
                d="M4.1665 9.58333C4.1665 8.01198 4.1665 7.22631 4.65466 6.73816C5.14281 6.25 5.92849 6.25 7.49984 6.25H12.4998C14.0712 6.25 14.8569 6.25 15.345 6.73816C15.8332 7.22631 15.8332 8.01198 15.8332 9.58333V10.4167C15.8332 11.988 15.8332 12.7737 15.345 13.2618C14.8569 13.75 14.0712 13.75 12.4998 13.75H7.49984C5.92849 13.75 5.14281 13.75 4.65466 13.2618C4.1665 12.7737 4.1665 11.988 4.1665 10.4167V9.58333Z"
                stroke={activeTab === "posts" ? "#262525" : "#838383"}
                strokeWidth={1.25}
              />
              <Path
                d="M15.8332 1.66663V2.08329C15.8332 3.23389 14.9004 4.16663 13.7498 4.16663H6.24984C5.09924 4.16663 4.1665 3.23389 4.1665 2.08329V1.66663"
                stroke={activeTab === "posts" ? "#262525" : "#838383"}
                strokeWidth={1.25}
                strokeLinecap="round"
              />
              <Path
                d="M15.8332 18.3334V17.9167C15.8332 16.7661 14.9004 15.8334 13.7498 15.8334H6.24984C5.09924 15.8334 4.1665 16.7661 4.1665 17.9167V18.3334"
                stroke={activeTab === "posts" ? "#262525" : "#838383"}
                strokeWidth={1.25}
                strokeLinecap="round"
              />
            </Svg>
            <Text style={[s.tabText, activeTab === "posts" && s.activeTabText]}>
              Your Posts
            </Text>
          </Pressable>

          <Pressable
            style={s.tabButton}
            onPress={() => setActiveTab("saved")}
          >
            {/* Bookmark icon */}
            <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
              <Path
                d="M17.5 13.409V9.24789C17.5 5.67405 17.5 3.88713 16.4017 2.77688C15.3033 1.66663 13.5355 1.66663 10 1.66663C6.46447 1.66663 4.6967 1.66663 3.59835 2.77688C2.5 3.88713 2.5 5.67405 2.5 9.24789V13.409C2.5 15.9895 2.5 17.2798 3.11176 17.8435C3.40351 18.1124 3.77179 18.2813 4.1641 18.3262C4.98668 18.4204 5.94728 17.5707 7.86847 15.8715C8.71768 15.1204 9.14229 14.7448 9.63356 14.6458C9.87548 14.5971 10.1245 14.5971 10.3664 14.6458C10.8577 14.7448 11.2823 15.1204 12.1315 15.8715C14.0527 17.5707 15.0133 18.4204 15.8359 18.3262C16.2282 18.2813 16.5965 18.1124 16.8882 17.8435C17.5 17.2798 17.5 15.9895 17.5 13.409Z"
                stroke={activeTab === "saved" ? "#262525" : "#838383"}
                strokeWidth={1.25}
              />
              <Path
                d="M12.5 5H7.5"
                stroke={activeTab === "saved" ? "#262525" : "#838383"}
                strokeWidth={1.25}
                strokeLinecap="round"
              />
            </Svg>
            <Text style={[s.tabText, activeTab === "saved" && s.activeTabText]}>
              Saved Posts
            </Text>
          </Pressable>

          {/* Smooth sliding indicator line */}
          <Animated.View
            style={[
              s.activeLineIndicator,
              {
                width: TAB_WIDTH,
                transform: [{ translateX: tabIndicatorX }],
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
});
StableProfileHeader.displayName = "StableProfileHeader";

export const ProfileScreen = React.memo(
  function ProfileScreen({ onBackPress, isActive, isShifted, onSettingsPress }: ProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");

  // Ref pointers and anim values
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollX = useRef(new Animated.Value(0)).current;
  const pagerRef = useRef<ScrollView>(null);

  // Custom mount entry slide from right to left
  const screenTranslateX = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  // Track if scroll was initiated programmatically by tapping a tab button
  const isManualTapRef = useRef(false);

  // Whenever the active or shifted states change, we slide reactively
  useEffect(() => {
    if (isActive) {
      screenTranslateX.stopAnimation();
      const targetValue = isShifted ? -SCREEN_WIDTH * 0.25 : 0;
      Animated.timing(screenTranslateX, {
        toValue: targetValue,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      screenTranslateX.stopAnimation();
      Animated.timing(screenTranslateX, {
        toValue: SCREEN_WIDTH,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }
  }, [isActive, isShifted]);

  const handleBack = useCallback(() => {
    onBackPress?.();
  }, [onBackPress]);

  // ── Hardware back button support ──────────────────────────────────
  useEffect(() => {
    if (!isActive) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      handleBack();
      return true;
    });
    return () => {
      subscription.remove();
    };
  }, [isActive, handleBack]);

  // ── Swipe-to-close: decisive, no proportional drag ──────────────────────
  // Wrapped structurally around ONLY the header/navbar/sticky-tabs views below
  // (never the grid pager), so it can't compete with grid paging or vertical
  // scroll. activeOffsetX/failOffsetY let taps and vertical scrolls pass
  // straight through to their normal handlers untouched.
  const onHeaderSwipeStateChange = useCallback(
    (event: PanGestureHandlerStateChangeEvent) => {
      const { state, translationX, velocityX } = event.nativeEvent;
      if (state === State.END) {
        const isDecisiveSwipe = translationX > 28 || velocityX > 480;
        if (isDecisiveSwipe) {
          handleBack();
        }
      }
    },
    [handleBack]
  );

  // Calculate dynamic grid heights so parent ScrollView scrolls them fully
  const postsGridHeight = Math.ceil(MOCK_POSTS.length / 3) * (GRID_ITEM_SIZE * 1.19 + 1);
  const savedGridHeight = Math.ceil(MOCK_SAVED_POSTS.length / 3) * (GRID_ITEM_SIZE * 1.19 + 1);
  const activeGridHeight = activeTab === "posts" ? postsGridHeight : savedGridHeight;

  // Smooth height transition when swapping tabs.
  // NOTE: activeTab now only changes at a committed moment (tap, or drag-end
  // commit below) — never mid-drag — so this never races against a live
  // native scroll gesture anymore.
  const pagerHeightAnim = useRef(new Animated.Value(postsGridHeight)).current;
  useEffect(() => {
    Animated.timing(pagerHeightAnim, {
      toValue: activeGridHeight,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [activeGridHeight]);

  // Tab indicator — state-driven, snaps to discrete positions on activeTab changes.
  // The indicator line does not follow raw scroll position during swiping;
  // instead, it only animates when the target page switches/commits.
  // const tabIndicatorX = useRef(new Animated.Value(0)).current;

  // useEffect(() => {
  //   Animated.timing(tabIndicatorX, {
  //     toValue: activeTab === "posts" ? 0 : INDICATOR_TRAVEL_DISTANCE,
  //     duration: 220,
  //     useNativeDriver: true,
  //   }).start();
  // }, [activeTab]);
    
  // Replace with a direct interpolation of scrollX (moveing together with the hand):
  const tabIndicatorX = scrollX.interpolate({
    inputRange: [0, SCREEN_WIDTH],
    outputRange: [0, TAB_WIDTH + 29], 
    extrapolate: "clamp",
  });

  // Tapping tab button initiates smooth pager scroll (reference-memoized)
  const handleTabChange = useCallback((tab: "posts" | "saved") => {
    isManualTapRef.current = true;
    setActiveTab(tab);
    if (pagerRef.current) {
      pagerRef.current.scrollTo({
        x: tab === "posts" ? 0 : SCREEN_WIDTH,
        animated: true,
      });
    }
  }, []);



  // ==========================================
  // CONFIGURABLE GLASSMORPHISM & TRANSITION SETTINGS
  // ==========================================
  const GLASS_BLUR_INTENSITY_IOS = 80;      // Blur intensity on iOS (0 to 100)
  const GLASS_BLUR_INTENSITY_ANDROID = 30;  // Blur intensity on Android
  const GLASS_WHITE_TINT_OPACITY = 0.30;    // Transparency of white overlay (0.30 = 30%)

  const SCROLL_START_Y = 120;
  const SCROLL_END_Y = 170;
  const STICKY_TABS_Y = 290;
  // ==========================================

  const NAV_BAR_HEIGHT = insets.top + 56;

  const [isSticky, setIsSticky] = useState(false);
  const isStickyRef = useRef(false);

  useEffect(() => {
    const listenerId = scrollY.addListener(({ value }) => {
      const active = value >= STICKY_TABS_Y;
      if (active !== isStickyRef.current) {
        isStickyRef.current = active;
        setIsSticky(active);
      }
    });
    return () => {
      scrollY.removeListener(listenerId);
    };
  }, []);

  // Scroll animations
  const profileOpacity = scrollY.interpolate({
    inputRange: [0, Math.max(0, SCROLL_START_Y - 40)],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [SCROLL_START_Y, SCROLL_END_Y],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const headerTitleTranslateY = scrollY.interpolate({
    inputRange: [SCROLL_START_Y, SCROLL_END_Y],
    outputRange: [12, 0],
    extrapolate: "clamp",
  });

  const stickyTabsOpacity = scrollY.interpolate({
    inputRange: [STICKY_TABS_Y - 5, STICKY_TABS_Y],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const renderGridItem = (item: PostGridItem) => (
    <View key={item.id} style={s.gridItem}>
      <Image source={item.image} style={s.gridImage} contentFit="cover" />
      <View style={s.viewsOverlay}>
        <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
          <Path
            d="M13.469 5.69754C16.1563 7.52436 17.5 8.43778 17.5 10C17.5 11.5623 16.1563 12.4757 13.469 14.3025C12.7272 14.8068 11.9914 15.2816 11.3153 15.6773C10.7221 16.0244 10.0503 16.3834 9.35484 16.7359C6.67383 18.0945 5.33332 18.7738 4.13104 18.0217C2.92875 17.2696 2.81949 15.6951 2.60095 12.5462C2.53915 11.6557 2.5 10.7827 2.5 10C2.5 9.2174 2.53915 8.3444 2.60095 7.45388C2.81949 4.30493 2.92875 2.73046 4.13104 1.97836C5.33332 1.22625 6.67383 1.90556 9.35484 3.26417C10.0503 3.61662 10.7221 3.97567 11.3153 4.32277C11.9914 4.71842 12.7272 5.19323 13.469 5.69754Z"
            stroke="white"
            strokeWidth={1.25}
          />
        </Svg>
        <Text style={s.viewsText}>{item.views}</Text>
      </View>
    </View>
  );

  return (
    <Animated.View
      style={[
        s.container,
        {
          transform: [{ translateX: screenTranslateX }],
          backgroundColor: "#FFFFFF",
        },
      ]}
    >
      {/* Outer vertical scroll frame containing header, inline tabs, and the horizontal post grids */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: NAV_BAR_HEIGHT, paddingBottom: 40 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <PanGestureHandler
          onHandlerStateChange={onHeaderSwipeStateChange}
          activeOffsetX={[-1000, 15]}
          failOffsetY={[-12, 12]}
        >
          <View>
            <StableProfileHeader
              activeTab={activeTab}
              setActiveTab={handleTabChange}
              tabIndicatorX={tabIndicatorX}
            />
          </View>
        </PanGestureHandler>

        {/* Dynamic height container wrapping the horizontal grid pager */}
        <Animated.View style={{ height: pagerHeightAnim, overflow: "hidden" }}>
          <Animated.ScrollView
            ref={pagerRef}
            horizontal
            directionalLockEnabled={true}
            // pagingEnabled={false}              // ❌ dissabled/remove this — it's the source of the correction jump
            snapToInterval={SCREEN_WIDTH}      // ✅ native snap points
            snapToAlignment="start"
            // snapToOffsets={[0, SCREEN_WIDTH]}
            disableIntervalMomentum={true}     // ✅ prevents multi-page flings, keeps it 1:1 with gesture
            decelerationRate={Platform.OS === "android" ? 0.985 : "normal"}
            bounces={false}
            overScrollMode="never"
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={1}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              {
                useNativeDriver: true,
                listener: (event: any) => {
                  if (isManualTapRef.current) return;
                  const offsetX = event.nativeEvent.contentOffset.x;
                  const threshold = SCREEN_WIDTH / 2;
                  const target = offsetX < threshold ? "posts" : "saved";
                  if (target !== activeTab) {
                    setActiveTab(target);
                  }
                }
              }
            )}
            onScrollBeginDrag={() => {
              isManualTapRef.current = false;
            }}
            onMomentumScrollEnd={() => {
              isManualTapRef.current = false;
            }}
         
          >
            {/* Grid Pane: Your Posts */}
            <View style={{ width: SCREEN_WIDTH }}>
              <View style={s.gridContainer}>
                {MOCK_POSTS.map(renderGridItem)}
              </View>
            </View>

            {/* Grid Pane: Saved Posts */}
            <View style={{ width: SCREEN_WIDTH }}>
              <View style={s.gridContainer}>
                {MOCK_SAVED_POSTS.map(renderGridItem)}
              </View>
            </View>
          </Animated.ScrollView>
        </Animated.View>
      </Animated.ScrollView>

      {/* Floating Sticky Tabs (placed under the floating navbar) — solid white background */}
      <PanGestureHandler
        onHandlerStateChange={onHeaderSwipeStateChange}
        activeOffsetX={[-1000, 15]}
        failOffsetY={[-12, 12]}
      >
        <Animated.View
          style={[
            s.stickyTabsWrapper,
            {
              top: NAV_BAR_HEIGHT,
              opacity: stickyTabsOpacity,
              backgroundColor: "#ffffffd6",
            },
          ]}
          pointerEvents={isSticky ? "auto" : "none"}
        >

          <View style={s.tabsContainer}>
            <Pressable style={s.tabButton} onPress={() => handleTabChange("posts")}>
              <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
                <Path
                  d="M4.1665 9.58333C4.1665 8.01198 4.1665 7.22631 4.65466 6.73816C5.14281 6.25 5.92849 6.25 7.49984 6.25H12.4998C14.0712 6.25 14.8569 6.25 15.345 6.73816C15.8332 7.22631 15.8332 8.01198 15.8332 9.58333V10.4167C15.8332 11.988 15.8332 12.7737 15.345 13.2618C14.8569 13.75 14.0712 13.75 12.4998 13.75H7.49984C5.92849 13.75 5.14281 13.75 4.65466 13.2618C4.1665 12.7737 4.1665 11.988 4.1665 10.4167V9.58333Z"
                  stroke={activeTab === "posts" ? "#262525" : "#838383"}
                  strokeWidth={1.25}
                />
                <Path
                  d="M15.8332 1.66663V2.08329C15.8332 3.23389 14.9004 4.16663 13.7498 4.16663H6.24984C5.09924 4.16663 4.1665 3.23389 4.1665 2.08329V1.66663"
                  stroke={activeTab === "posts" ? "#262525" : "#838383"}
                  strokeWidth={1.25}
                  strokeLinecap="round"
                />
                <Path
                  d="M15.8332 18.3334V17.9167C15.8332 16.7661 14.9004 15.8334 13.7498 15.8334H6.24984C5.09924 15.8334 4.1665 16.7661 4.1665 17.9167V18.3334"
                  stroke={activeTab === "posts" ? "#262525" : "#838383"}
                  strokeWidth={1.25}
                  strokeLinecap="round"
                />
              </Svg>
              <Text style={[s.tabText, activeTab === "posts" && s.activeTabText]}>
                Your Posts
              </Text>
            </Pressable>

            <Pressable style={s.tabButton} onPress={() => handleTabChange("saved")}>
              <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
                <Path
                  d="M17.5 13.409V9.24789C17.5 5.67405 17.5 3.88713 16.4017 2.77688C15.3033 1.66663 13.5355 1.66663 10 1.66663C6.46447 1.66663 4.6967 1.66663 3.59835 2.77688C2.5 3.88713 2.5 5.67405 2.5 9.24789V13.409C2.5 15.9895 2.5 17.2798 3.11176 17.8435C3.40351 18.1124 3.77179 18.2813 4.1641 18.3262C4.98668 18.4204 5.94728 17.5707 7.86847 15.8715C8.71768 15.1204 9.14229 14.7448 9.63356 14.6458C9.87548 14.5971 10.1245 14.5971 10.3664 14.6458C10.8577 14.7448 11.2823 15.1204 12.1315 15.8715C14.0527 17.5707 15.0133 18.4204 15.8359 18.3262C16.2282 18.2813 16.5965 18.1124 16.8882 17.8435C17.5 17.2798 17.5 15.9895 17.5 13.409Z"
                  stroke={activeTab === "saved" ? "#262525" : "#838383"}
                  strokeWidth={1.25}
                />
                <Path
                  d="M12.5 5H7.5"
                  stroke={activeTab === "saved" ? "#262525" : "#838383"}
                  strokeWidth={1.25}
                  strokeLinecap="round"
                />
              </Svg>
              <Text style={[s.tabText, activeTab === "saved" && s.activeTabText]}>
                Saved Posts
              </Text>
            </Pressable>

            {/* Smooth sliding indicator line */}
            <Animated.View
              style={[
                s.activeLineIndicator,
                {
                  width: TAB_WIDTH,
                  transform: [{ translateX: tabIndicatorX }],
                },
              ]}
            />
          </View>
        </Animated.View>
      </PanGestureHandler>

      {/* Floating Glassmorphism Navigation Header */}
      <PanGestureHandler
        onHandlerStateChange={onHeaderSwipeStateChange}
        activeOffsetX={[-1000, 15]}
        failOffsetY={[-12, 12]}
      >
        <View style={[s.navBar, { height: NAV_BAR_HEIGHT }]}>
          <BlurView
            intensity={Platform.OS === "ios" ? GLASS_BLUR_INTENSITY_IOS : GLASS_BLUR_INTENSITY_ANDROID}
            tint="light"
            experimentalBlurMethod="dimezisBlurView"
            style={StyleSheet.absoluteFill}
          />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(255, 255, 255, ${GLASS_WHITE_TINT_OPACITY})` }]} />

          {/* Status Bar safe area spacing container + centered content row */}
          <View style={[s.navContent, { marginTop: insets.top }]}>
            <Pressable onPress={handleBack} style={s.navLeft} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
              {/* Vector.svg back arrow */}
              <Svg width={14} height={11} viewBox="0 0 14 11" fill="none">
                <Path
                  d="M12.5625 5.0625H0.5625M5.0625 9.5625L0.5625 5.0625L5.0625 0.5625"
                  stroke="#262525"
                  strokeWidth={1.125}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Animated.Text style={[s.navTitle, { opacity: profileOpacity }]}>
                Profile
              </Animated.Text>
            </Pressable>

            {/* Centered User Name Transition (centered in navContent space) */}
            <View style={s.navCenterContainer} pointerEvents="none">
              <Animated.Text
                style={[
                  s.navCenterTitle,
                  {
                    opacity: headerTitleOpacity,
                    transform: [{ translateY: headerTitleTranslateY }],
                  },
                ]}
              >
                Kelechi Obi
              </Animated.Text>
            </View>

            <Pressable style={s.settingsBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }} onPress={onSettingsPress}>
              {/* Settings Minimalistic.svg */}
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M7.84308 3.80211C9.8718 2.6007 10.8862 2 12 2C13.1138 2 14.1282 2.6007 16.1569 3.80211L16.8431 4.20846C18.8718 5.40987 19.8862 6.01057 20.4431 7C21 7.98943 21 9.19084 21 11.5937V12.4063C21 14.8092 21 16.0106 20.4431 17C19.8862 17.9894 18.8718 18.5901 16.8431 19.7915L16.1569 20.1979C14.1282 21.3993 13.1138 22 12 22C10.8862 22 9.8718 21.3993 7.84308 20.1979L7.15692 19.7915C5.1282 18.5901 4.11384 17.9894 3.55692 17C3 16.0106 3 14.8092 3 12.4063V11.5937C3 9.19084 3 7.98943 3.55692 7C4.11384 6.01057 5.1282 5.40987 7.15692 4.20846L7.84308 3.80211Z"
                  stroke="#262525"
                  strokeWidth={1.5}
                />
                <Circle cx={12} cy={12} r={3} stroke="#1C274C" strokeWidth={1.5} />
              </Svg>
            </Pressable>
          </View>
        </View>
      </PanGestureHandler>
    </Animated.View>
  );
}, (prev, next) => prev.isActive === next.isActive && prev.isShifted === next.isShifted);

const s = StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  navBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: "transparent",
  },
  navContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    paddingHorizontal: 18,
    position: "relative",
  },
  navLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    zIndex: 2,
  },
  navTitle: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 16,
    color: "#262525",
    letterSpacing: -0.32,
  },
  navCenterContainer: {
    position: "absolute",
    left: 60,
    right: 60,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  navCenterTitle: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 16,
    color: "#262525",
    letterSpacing: -0.32,
  },
  stickyTabsWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#D2D2D2",
    paddingHorizontal: 86,
    height: 48,
    justifyContent: "center",
  },
  settingsBtn: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  headerContainer: {
    width: "100%",
  },
  profileHeader: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 18,
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
    backgroundColor: "#000000dd",
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
  },
  tabsWrapper: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#D2D2D2",
    paddingHorizontal: 86,
  },
  tabsContainer: {
    flexDirection: "row",
    gap: 29,
    width: "100%",
    position: "relative",
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
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
  activeLineIndicator: {
    position: "absolute",
    bottom: 0,
    height: 2,
    backgroundColor: "#000000",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 1,
    width: SCREEN_WIDTH,
  },
  gridItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE * 1.19, // Keep approximately 125x149 aspect ratio
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
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewsText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 12,
    color: "#FFFFFF",
    letterSpacing: -0.24,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
});  