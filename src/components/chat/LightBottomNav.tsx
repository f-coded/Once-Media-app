import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Svg, { Path, Circle, FillRule } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Tab = "home" | "market" | "chat" | "wallet";

/* ── Icons (from Figma SVG exports) ── */

function HomeIcon({ color = "#838383" }: { color?: string }) {
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

function MarketIcon({ color = "#838383" }: { color?: string }) {
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

function ChatDotsIcon({ color = "#838383" }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.81499 16.0408L10.2216 15.3539C10.5369 14.8211 10.6946 14.5547 10.9479 14.4074C11.2011 14.2601 11.52 14.2546 12.1578 14.2436C13.0993 14.2274 13.6898 14.1697 14.1851 13.9645C15.1039 13.5839 15.8339 12.8539 16.2145 11.9351C16.5 11.2459 16.5 10.3723 16.5 8.625V7.875C16.5 5.41993 16.5 4.19239 15.9474 3.29063C15.6382 2.78605 15.214 2.36181 14.7094 2.0526C13.8076 1.5 12.5801 1.5 10.125 1.5H7.875C5.41993 1.5 4.19239 1.5 3.29063 2.0526C2.78605 2.36181 2.36181 2.78605 2.0526 3.29063C1.5 4.19239 1.5 5.41993 1.5 7.875V8.625C1.5 10.3723 1.5 11.2459 1.78545 11.9351C2.16605 12.8539 2.89608 13.5839 3.81494 13.9645C4.31017 14.1697 4.90066 14.2274 5.84218 14.2436C6.47994 14.2546 6.79882 14.2601 7.05209 14.4074C7.30537 14.5547 7.46305 14.8211 7.7784 15.3539L8.18498 16.0408C8.54735 16.653 9.45262 16.653 9.81499 16.0408ZM12 9C12.4142 9 12.75 8.66421 12.75 8.25C12.75 7.83579 12.4142 7.5 12 7.5C11.5858 7.5 11.25 7.83579 11.25 8.25C11.25 8.66421 11.5858 9 12 9ZM9.75 8.25C9.75 8.66421 9.41421 9 9 9C8.58579 9 8.25 8.66421 8.25 8.25C8.25 7.83579 8.58579 7.5 9 7.5C9.41421 7.5 9.75 7.83579 9.75 8.25ZM6 9C6.41421 9 6.75 8.66421 6.75 8.25C6.75 7.83579 6.41421 7.5 6 7.5C5.58579 7.5 5.25 7.83579 5.25 8.25C5.25 8.66421 5.58579 9 6 9Z"
        fill={color}
      />
    </Svg>
  );
}

function WalletIcon({ color = "#838383" }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
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

const TABS: { key: Tab; label: string; icon: (c: string) => React.ReactNode }[] = [
  { key: "home", label: "Home", icon: (c) => <HomeIcon color={c} /> },
  { key: "market", label: "Market", icon: (c) => <MarketIcon color={c} /> },
  { key: "chat", label: "Chat", icon: (c) => <ChatDotsIcon color={c} /> },
  { key: "wallet", label: "Wallet", icon: (c) => <WalletIcon color={c} /> },
];

const PRIMARY = "#1B17B3";
const INACTIVE = "#838383";
export const LIGHT_NAV_HEIGHT = 80;

type LightBottomNavProps = {
  activeTab: Tab;
  onTabPress?: (tab: Tab) => void;
  badge?: Partial<Record<Tab, number>>;
};

export function LightBottomNav({ activeTab, onTabPress, badge }: LightBottomNavProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Top border line */}
      <View style={styles.topBorder} />

      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const active = tab.key === activeTab;
          const color = active ? PRIMARY : INACTIVE;
          const badgeCount = badge?.[tab.key];
          return (
            <Pressable
              key={tab.key}
              style={styles.tab}
              onPress={() => onTabPress?.(tab.key)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <View style={styles.iconWrapper}>
                {tab.icon(color)}
                {!!badgeCount && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badgeCount}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.label, { color }]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    height: LIGHT_NAV_HEIGHT,
    zIndex: 20,
  },
  topBorder: {
    height: 1,
    backgroundColor: "#F2F2F2",
  },
  tabRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 10,
    height: 60,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  label: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 13,
    letterSpacing: -0.26,
    lineHeight: 15,
  },
  iconWrapper: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#1B17B3",
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
