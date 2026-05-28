import React, { useRef, useEffect } from "react";
import { Animated, View, Text, Pressable, StyleSheet, useWindowDimensions, Platform } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type Tab = "home" | "market" | "chat" | "wallet";

const PRIMARY = "#1B17B3";
const INACTIVE = "#838383";
// iOS 26+ needs extra height for the new tab-bar region
const isIOS26 = Platform.OS === "ios" && parseInt(String(Platform.Version), 10) >= 26;
export const NAV_HEIGHT = isIOS26 ? 72 : 75;

/* ─────────────────────────────────────────────────────────────
   HOME  —  linear    (inactive) vs bold (active)
───────────────────────────────────────────────────────────── */
function HomeLinear({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M1.77305 9.71856C1.48847 7.74077 1.34618 6.75187 1.75152 5.90637C2.15687 5.06086 3.01964 4.54691 4.74518 3.51901L5.78381 2.90031C7.35078 1.96687 8.13427 1.50016 9 1.50016C9.86573 1.50016 10.6492 1.96687 12.2162 2.90031L13.2548 3.51901C14.9804 4.54691 15.8431 5.06086 16.2485 5.90637C16.6538 6.75187 16.5115 7.74077 16.2269 9.71856L16.0179 11.1716C15.6523 13.7121 15.4695 14.9824 14.5882 15.7413C13.7069 16.5002 12.4145 16.5002 9.82956 16.5002H8.17044C5.58553 16.5002 4.29307 16.5002 3.41177 15.7413C2.53047 14.9824 2.34769 13.7121 1.98213 11.1716L1.77305 9.71856Z"
        stroke={color}
        strokeWidth={1.125}
      />
      <Path
        d="M6.75 12C7.38778 12.4727 8.16342 12.75 9 12.75C9.83658 12.75 10.6122 12.4727 11.25 12"
        stroke={color}
        strokeWidth={1.125}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function HomeBold({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 15 15" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.32956 15H6.67044C4.08553 15 2.79307 15 1.91177 14.2411C1.03047 13.4823 0.847691 12.212 0.482128 9.67142L0.273054 8.2184C-0.0115292 6.24061 -0.153821 5.25172 0.251525 4.40621C0.65687 3.5607 1.51964 3.04675 3.24518 2.01886L4.28381 1.40015C5.85078 0.466718 6.63427 0 7.5 0C8.36573 0 9.14922 0.466717 10.7162 1.40015L11.7548 2.01886C13.4804 3.04675 14.3431 3.5607 14.7485 4.40621C15.1538 5.25172 15.0115 6.24061 14.7269 8.2184L14.5179 9.67142C14.1523 12.212 13.9695 13.4823 13.0882 14.2411C12.2069 15 10.9145 15 8.32956 15ZM4.79818 10.1649C4.98317 9.91531 5.33546 9.86296 5.58503 10.0479C6.13129 10.4529 6.79065 10.6873 7.50007 10.6873C8.2095 10.6873 8.86886 10.4529 9.41512 10.0479C9.66469 9.86296 10.017 9.91531 10.202 10.1649C10.387 10.4145 10.3346 10.7667 10.085 10.9517C9.35573 11.4923 8.4638 11.8123 7.50007 11.8123C6.53635 11.8123 5.64442 11.4923 4.91512 10.9517C4.66554 10.7667 4.61319 10.4145 4.79818 10.1649Z"
        fill={color}
      />
    </Svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   MARKET  —  linear (inactive) vs bold (active)
───────────────────────────────────────────────────────────── */
function MarketLinear({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M2.625 8.25V10.5C2.625 13.3284 2.625 14.7426 3.50368 15.6213C4.38236 16.5 5.79657 16.5 8.625 16.5H9.375C12.2034 16.5 13.6176 16.5 14.4963 15.6213C15.375 14.7426 15.375 13.3284 15.375 10.5V8.25"
        stroke={color}
        strokeWidth={1.125}
      />
      <Path
        d="M7.12485 1.5H10.8748L11.3636 6.38803C11.5035 7.7865 10.4053 9 8.99985 9C7.59439 9 6.4962 7.7865 6.63604 6.38803L7.12485 1.5Z"
        stroke={color}
        strokeWidth={1.125}
      />
      <Path
        d="M2.49719 4.01349C2.63075 3.3457 2.69753 3.0118 2.83331 2.74113C3.11942 2.17079 3.63422 1.74876 4.24959 1.58006C4.54163 1.5 4.88214 1.5 5.56316 1.5H7.12489L6.5815 6.93395C6.46421 8.10682 5.47726 9 4.29854 9C2.8507 9 1.76481 7.67542 2.04875 6.2557L2.49719 4.01349Z"
        stroke={color}
        strokeWidth={1.125}
      />
      <Path
        d="M15.5027 4.01349C15.3691 3.3457 15.3024 3.0118 15.1666 2.74113C14.8805 2.17079 14.3657 1.74876 13.7503 1.58006C13.4583 1.5 13.1178 1.5 12.4367 1.5H10.875L11.4184 6.93395C11.5357 8.10682 12.5226 9 13.7014 9C15.1492 9 16.2351 7.67542 15.9511 6.2557L15.5027 4.01349Z"
        stroke={color}
        strokeWidth={1.125}
      />
      <Path
        d="M7.125 16.125V13.875C7.125 13.174 7.125 12.8236 7.27572 12.5625C7.37446 12.3915 7.51648 12.2495 7.6875 12.1507C7.94856 12 8.29904 12 9 12C9.70096 12 10.0514 12 10.3125 12.1507C10.4835 12.2495 10.6255 12.3915 10.7243 12.5625C10.875 12.8236 10.875 13.174 10.875 13.875V16.125"
        stroke={color}
        strokeWidth={1.125}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function MarketBold({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      {/* Awning top — exact Figma path */}
      <Path
        d="M2.83343 2.74113C2.69765 3.0118 2.63087 3.3457 2.49732 4.01349L2.04887 6.2557C1.76493 7.67542 2.85083 9 4.29866 9C5.47738 9 6.46433 8.10682 6.58162 6.93395L6.63338 6.41636C6.51106 7.80286 7.6039 9 8.99985 9C10.4053 9 11.5035 7.7865 11.3636 6.38803L11.4184 6.93395C11.5357 8.10682 12.5226 9 13.7014 9C15.1492 9 16.2351 7.67542 15.9511 6.2557L15.5027 4.01349C15.3691 3.34571 15.3024 3.0118 15.1666 2.74113C14.8805 2.17079 14.3657 1.74876 13.7503 1.58006C13.4583 1.5 13.1178 1.5 12.4367 1.5H10.8748H5.56328C4.88226 1.5 4.54175 1.5 4.24971 1.58006C3.63434 1.74876 3.11954 2.17079 2.83343 2.74113Z"
        fill={color}
      />
      {/* Shop body + door — exact Figma path */}
      <Path
        d="M13.7014 10.125C14.3142 10.125 14.8836 9.96571 15.375 9.68919V10.5C15.375 13.3284 15.375 14.7426 14.4963 15.6213C13.789 16.3286 12.7347 16.4666 10.875 16.4935V13.875C10.875 13.174 10.875 12.8236 10.7243 12.5625C10.6255 12.3915 10.4835 12.2495 10.3125 12.1507C10.0514 12 9.70096 12 9 12C8.29904 12 7.94856 12 7.6875 12.1507C7.51648 12.2495 7.37446 12.3915 7.27572 12.5625C7.125 12.8236 7.125 13.174 7.125 13.875V16.4935C5.26532 16.4666 4.21099 16.3286 3.50368 15.6213C2.625 14.7426 2.625 13.3284 2.625 10.5V9.68917C3.11643 9.96571 3.68579 10.125 4.29868 10.125C5.19648 10.125 6.01963 9.77728 6.63326 9.20395C7.25376 9.77405 8.08237 10.125 8.99986 10.125C9.91741 10.125 10.7461 9.77398 11.3666 9.2038C11.9803 9.77722 12.8035 10.125 13.7014 10.125Z"
        fill={color}
      />
    </Svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   CHAT  —  linear (inactive) vs bold (active)
───────────────────────────────────────────────────────────── */
function ChatLinear({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M9.81499 16.0408L10.2216 15.3539C10.5369 14.8211 10.6946 14.5547 10.9479 14.4074C11.2011 14.2601 11.52 14.2546 12.1578 14.2436C13.0993 14.2274 13.6898 14.1697 14.1851 13.9645C15.1039 13.5839 15.8339 12.8539 16.2145 11.9351C16.5 11.2459 16.5 10.3723 16.5 8.625V7.875C16.5 5.41993 16.5 4.19239 15.9474 3.29063C15.6382 2.78605 15.214 2.36181 14.7094 2.0526C13.8076 1.5 12.5801 1.5 10.125 1.5H7.875C5.41993 1.5 4.19239 1.5 3.29063 2.0526C2.78605 2.36181 2.36181 2.78605 2.0526 3.29063C1.5 4.19239 1.5 5.41993 1.5 7.875V8.625C1.5 10.3723 1.5 11.2459 1.78545 11.9351C2.16605 12.8539 2.89608 13.5839 3.81494 13.9645C4.31017 14.1697 4.90066 14.2274 5.84218 14.2436C6.47994 14.2546 6.79882 14.2601 7.05209 14.4074C7.30537 14.5547 7.46305 14.8211 7.7784 15.3539L8.18498 16.0408C8.54735 16.653 9.45262 16.653 9.81499 16.0408Z"
        stroke={color}
        strokeWidth={1.125}
        fill="none"
      />
      <Circle cx={6} cy={8.25} r={0.75} fill={color} />
      <Circle cx={9} cy={8.25} r={0.75} fill={color} />
      <Circle cx={12} cy={8.25} r={0.75} fill={color} />
    </Svg>
  );
}

function ChatBold({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.81499 16.0408L10.2216 15.3539C10.5369 14.8211 10.6946 14.5547 10.9479 14.4074C11.2011 14.2601 11.52 14.2546 12.1578 14.2436C13.0993 14.2274 13.6898 14.1697 14.1851 13.9645C15.1039 13.5839 15.8339 12.8539 16.2145 11.9351C16.5 11.2459 16.5 10.3723 16.5 8.625V7.875C16.5 5.41993 16.5 4.19239 15.9474 3.29063C15.6382 2.78605 15.214 2.36181 14.7094 2.0526C13.8076 1.5 12.5801 1.5 10.125 1.5H7.875C5.41993 1.5 4.19239 1.5 3.29063 2.0526C2.78605 2.36181 2.36181 2.78605 2.0526 3.29063C1.5 4.19239 1.5 5.41993 1.5 7.875V8.625C1.5 10.3723 1.5 11.2459 1.78545 11.9351C2.16605 12.8539 2.89608 13.5839 3.81494 13.9645C4.31017 14.1697 4.90066 14.2274 5.84218 14.2436C6.47994 14.2546 6.79882 14.2601 7.05209 14.4074C7.30537 14.5547 7.46305 14.8211 7.7784 15.3539L8.18498 16.0408C8.54735 16.653 9.45262 16.653 9.81499 16.0408Z"
        fill={color}
      />
      <Circle cx={6} cy={8.25} r={1.125} fill="#FFFFFF" />
      <Circle cx={9} cy={8.25} r={1.125} fill="#FFFFFF" />
      <Circle cx={12} cy={8.25} r={1.125} fill="#FFFFFF" />
    </Svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   WALLET  —  linear (inactive) vs bold (active)
───────────────────────────────────────────────────────────── */
function WalletLinear({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 18 18" fill="none">
      <Path
        d="M4.5 6H7.5"
        stroke={color}
        strokeWidth={1.125}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.625 6.75H13.6731C12.3348 6.75 11.25 7.75736 11.25 9C11.25 10.2426 12.3348 11.25 13.6731 11.25H15.625C15.6875 11.25 15.7187 11.25 15.7451 11.2484C16.1496 11.2238 16.4718 10.9246 16.4983 10.5491C16.5 10.5246 16.5 10.4955 16.5 10.4375V7.5625C16.5 7.50447 16.5 7.47545 16.4983 7.45095C16.4718 7.07538 16.1496 6.77622 15.7451 6.75161C15.7187 6.75 15.6875 6.75 15.625 6.75Z"
        stroke={color}
        strokeWidth={1.125}
      />
      <Circle cx={13.5} cy={9} r={0.375} fill={color} stroke={color} strokeWidth={0.75} />
      <Path
        d="M15.7238 6.75C15.6655 5.34577 15.4775 4.48481 14.8713 3.87868C13.9926 3 12.5784 3 9.75 3L7.5 3C4.67157 3 3.25736 3 2.37868 3.87868C1.5 4.75736 1.5 6.17157 1.5 9C1.5 11.8284 1.5 13.2426 2.37868 14.1213C3.25736 15 4.67157 15 7.5 15H9.75C12.5784 15 13.9926 15 14.8713 14.1213C15.4775 13.5152 15.6655 12.6542 15.7238 11.25"
        stroke={color}
        strokeWidth={1.125}
      />
    </Svg>
  );
}

function WalletBold({ color }: { color: string }) {
  return (
    <Svg width={21} height={21} viewBox="0 0 18 18" fill="none">
      {/* Filled card body */}
      <Path
        d="M15.7238 6.75C15.6655 5.34577 15.4775 4.48481 14.8713 3.87868C13.9926 3 12.5784 3 9.75 3L7.5 3C4.67157 3 3.25736 3 2.37868 3.87868C1.5 4.75736 1.5 6.17157 1.5 9C1.5 11.8284 1.5 13.2426 2.37868 14.1213C3.25736 15 4.67157 15 7.5 15H9.75C12.5784 15 13.9926 15 14.8713 14.1213C15.4775 13.5152 15.6655 12.6542 15.7238 11.25H13.6731C12.3348 11.25 11.25 10.2426 11.25 9C11.25 7.75736 12.3348 6.75 13.6731 6.75H15.7238Z"
        fill={color}
      />
      {/* Filled pocket */}
      <Path
        d="M15.625 6.75H13.6731C12.3348 6.75 11.25 7.75736 11.25 9C11.25 10.2426 12.3348 11.25 13.6731 11.25H15.625C15.6875 11.25 15.7187 11.25 15.7451 11.2484C16.1496 11.2238 16.4718 10.9246 16.4983 10.5491C16.5 10.5246 16.5 10.4955 16.5 10.4375V7.5625C16.5 7.50447 16.5 7.47545 16.4983 7.45095C16.4718 7.07538 16.1496 6.77622 15.7451 6.75161C15.7187 6.75 15.6875 6.75 15.625 6.75Z"
        fill={color}
        stroke="#FFFFFF"
        strokeWidth={1}
      />
      {/* White dot */}
      <Circle cx={13.5} cy={9} r={0.75} fill="#FFFFFF" />
      {/* White line top */}
      <Path
        d="M4.5 6H7.5"
        stroke="#FFFFFF"
        strokeWidth={1.125}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   Tab definitions
───────────────────────────────────────────────────────────── */
const TABS: {
  key: Tab;
  label: string;
  LinearIcon: React.FC<{ color: string }>;
  BoldIcon: React.FC<{ color: string }>;
}[] = [
  { key: "home",   label: "Home",   LinearIcon: HomeLinear,   BoldIcon: HomeBold   },
  { key: "market", label: "Market", LinearIcon: MarketLinear, BoldIcon: MarketBold },
  { key: "chat",   label: "Chat",   LinearIcon: ChatLinear,   BoldIcon: ChatBold   },
  { key: "wallet", label: "Wallet", LinearIcon: WalletLinear, BoldIcon: WalletBold },
];

/* ─────────────────────────────────────────────────────────────
   TabItem — owns its own ripple animation
───────────────────────────────────────────────────────────── */
type TabItemProps = {
  tabKey: Tab;
  label: string;
  active: boolean;
  LinearIcon: React.FC<{ color: string }>;
  BoldIcon: React.FC<{ color: string }>;
  onPress: (tab: Tab) => void;
  badgeCount?: number;
};

function TabItem({ tabKey, label, active, LinearIcon, BoldIcon, onPress, badgeCount }: TabItemProps) {
  const rippleScale = useRef(new Animated.Value(0.3)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    // Fire navigation immediately on touch-down — no lift delay
    onPress(tabKey);
    // Kick off ripple at the same time
    rippleScale.setValue(0.5);
    rippleOpacity.setValue(0.12); 
    Animated.parallel([
      Animated.timing(rippleScale, {
        toValue: 1.5,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(rippleOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const color = active ? PRIMARY : INACTIVE;

  return (
    <Pressable
      style={[
          styles.tab,
          tabKey === "wallet" && active && { gap: 0.3 },   // bold (active)
          tabKey === "wallet" && !active && { gap: 1.0 },   // linear (inactive)
        ]}
      onPressIn={handlePressIn}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      {/* Ripple circle — centered behind both the icon and label */}
      <View style={styles.rippleContainer} pointerEvents="none">
        <Animated.View
          style={[
            styles.ripple,
            {
              transform: [{ scale: rippleScale }],
              opacity: rippleOpacity,
              backgroundColor: active ? PRIMARY : INACTIVE,
            },
          ]}
        />
      </View>

      <View style={styles.iconWrapper}>
        {/* Icon */}
        {active ? <BoldIcon color={color} /> : <LinearIcon color={color} />}

        {/* Badge */}
        {!!badgeCount && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeCount}</Text>
          </View>
        )}
      </View>

      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────── */
export type BottomNavProps = {
  activeTab: Tab;
  isLoading?: boolean;
  onTabPress?: (tab: Tab) => void;
  badge?: Partial<Record<Tab, number>>;
};

export function BottomNav({ activeTab, isLoading = false, onTabPress, badge }: BottomNavProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const loadingProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isLoading) {
      loadingProgress.stopAnimation();
      loadingProgress.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.timing(loadingProgress, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => animation.stop();
  }, [isLoading, loadingProgress]);

  const loadingTranslateX = loadingProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-110, width],
  });

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom },
        { backgroundColor: activeTab === "home" ? "#000000" : "#FFFFFF" },
      ]}
    >
      {/* Top border */}
      <View style={styles.topBorder} />

      {isLoading && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.loadingStroke,
            { transform: [{ translateX: loadingTranslateX }] },
          ]}
        />
      )}

      <View style={styles.tabRow}>
        {TABS.map(({ key, label, LinearIcon, BoldIcon }) => (
          <TabItem
            key={key}
            tabKey={key}
            label={label}
            active={key === activeTab}
            LinearIcon={LinearIcon}
            BoldIcon={BoldIcon}
            onPress={(tab) => onTabPress?.(tab)}
            badgeCount={badge?.[key]}
          />
        ))}
      </View>
    </View>
  );
}

/* ─────────────────────────────────────────────────────────────
   Styles
───────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: NAV_HEIGHT,
    backgroundColor: "#FFFFFF",
    zIndex: 20,
  },
  loadingStroke: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 110,
    height: 2,
    borderRadius: 2,
    backgroundColor: "#1B17B3",
    shadowColor: "#1B17B3",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },
  topBorder: {
    height: .3,
    backgroundColor: "#85858557",
  },
  tabRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    position: "relative",
  },
  label: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 13,
    lineHeight: 15,
    letterSpacing: -0.26,
  },
  iconWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  rippleContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: -1,
  },
  ripple: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#E85454",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 10,
    color: "#FFFFFF",
    lineHeight: 12,
  },
});
