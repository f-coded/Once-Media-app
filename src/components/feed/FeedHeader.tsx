import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PlusIcon } from "./FeedIcons";

export function FeedHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 9 }]}>
      <View style={styles.leftGroup}>
        <Image 
          source={{ uri: "https://i.pravatar.cc/100?img=9" }} 
          style={styles.profileAvatar} 
          contentFit="cover"
        />
        <Text style={styles.title}>Posts</Text>
      </View>
      <Pressable style={styles.newPostBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <View style={styles.addIconContainer}>
          <PlusIcon size={12} color="#FFFFFF" strokeWidth={1.25} />
        </View>
        <Text style={styles.newPostText}>New Post</Text>
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
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1B17B3",
  },
  newPostBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    gap: 4,
    width: 97,
    height: 32,
    backgroundColor: "rgba(242, 242, 242, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(242, 242, 242, 0.3)",
    borderRadius: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.09,
    shadowRadius: 10,
    elevation: 3,
  },
  addIconContainer: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  newPostText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 14,
    lineHeight: 16,
    letterSpacing: -0.28,
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.65)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 13,
  },
});
