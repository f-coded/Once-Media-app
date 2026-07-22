import React from "react";
import { Text, Pressable } from "react-native";
import { font } from "@/features/auth/components/AuthUI";

type ActionButtonProps = {
  icon: React.ReactNode;
  count?: number;
  label?: string;
  onPress?: () => void;
};

const formatCount = (num?: number) => {
  if (num === undefined) return null;
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

/**
 * A plain Pressable — deliberately.
 *
 * This used to be `Animated.createAnimatedComponent(Pressable)` with a
 * `useSharedValue` + `useAnimatedStyle` press-scale. That put FOUR Reanimated
 * animated views inside PostCard's overlay, which is the subtree the comment
 * sheet scales and fades on open.
 *
 * That was the entire reason vertical-layout posts hitched while the
 * horizontal ones (posts 3 & 5) were perfectly smooth: the horizontal action
 * row is built from plain Pressables, so its overlay contains ZERO animated
 * views. Same media, same sheet, same everything else — only this differed.
 *
 * It also explains why the earlier attempts missed:
 *   - `renderToHardwareTextureAndroid` can't cache a subtree whose children
 *     are animated views, so the rasterization bought nothing.
 *   - Shortening the overlay fade window did nothing, because the cost was
 *     spread across the whole transform, not just the fade.
 *
 * Press feedback is now a static `pressed` style: applied once on press-down
 * and once on release, never per-frame, and it creates no animated node. Keep
 * it that way — reintroducing Reanimated here brings the hitch back.
 */
export function ActionButton({ icon, count, label, onPress }: ActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={({ pressed }) => [
        // minWidth fixes the column: without it each button sized to its own
        // count ("3" vs "18.2K"), so the icons drifted horizontally relative to
        // one another and the numbers sat off-centre under them. 44 clears the
        // 28px icon and the widest formatted count, so icons and numbers share
        // one centre line down the rail.
        { alignItems: "center", justifyContent: "center", gap: 2, minWidth: 44 },
        pressed && { transform: [{ scale: 0.88 }] },
      ]}
    >
      {icon}
      {count !== undefined && (
        <Text style={{ ...font("Ubuntu_400Regular", 16, "#FFFFFF"), textAlign: "center", textShadowColor: "rgba(0,0,0,1)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }}>
          {formatCount(count)}
        </Text>
      )}
      {label && (
        <Text style={{ ...font("Ubuntu_400Regular", 10, "#FFFFFF"), textAlign: "center", textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
