import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PlusIcon } from "./FeedIcons";

export function FeedHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 9 }]}>
      <Text style={styles.title}>Posts</Text>
      <Pressable style={styles.newPostBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <BlurView
          intensity={20}
          tint="dark"
          experimentalBlurMethod="dimezisBlurView"
          blurReductionFactor={1}
          style={StyleSheet.absoluteFill}
        />
        <View pointerEvents="none" style={styles.newPostTint} />
        <View style={styles.newPostContent}>
          <PlusIcon size={16} color="#FFFFFF" />
          <Text style={styles.newPostText}>New Post</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  title: {
    fontFamily: "Ubuntu_500Medium",
    fontSize: 22,
    color: "#FFFFFF",
    letterSpacing: -0.44,
  },
  newPostBtn: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(241,241,241,0.3)",
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.18)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.09,
    shadowRadius: 10,
    elevation: 3,
  },
  newPostTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  newPostContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  newPostText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    color: "#FFFFFF",
    letterSpacing: -0.28,
    textShadowColor: "rgba(0,0,0,0.65)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 13,
  },
});
