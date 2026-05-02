import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Text, Animated, Easing } from "react-native";
import { OnceLogoIcon } from "./OnceLogoIcon";
import { OncePattern } from "./OncePattern";

interface Props {
  onAnimationFinish: () => void;
}

export function AnimatedSplashScreen({ onAnimationFinish }: Props) {
  // Icon entrance
  const iconScale = useRef(new Animated.Value(0.3)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;

  // Text entrance (slides in from right)
  const textTranslateX = useRef(new Animated.Value(40)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  // Pattern entrance
  const patternOpacity = useRef(new Animated.Value(0)).current;

  // Exit
  const exitScale = useRef(new Animated.Value(1)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1) Pattern fades in gently
    Animated.timing(patternOpacity, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // 2) Logo icon pops in with a soft spring (no spin)
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(iconScale, {
          toValue: 1,
          friction: 6,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, 200);

    // 3) "Once Media" text slides in from right
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(textTranslateX, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, 600);

    // 4) Exit: zoom out + fade
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(exitScale, {
          toValue: 1.3,
          duration: 400,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(exitOpacity, {
          toValue: 0,
          duration: 400,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => onAnimationFinish());
    }, 2400);
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: exitOpacity, transform: [{ scale: exitScale }] },
      ]}
    >
      {/* Actual Pattern.svg as background watermark */}
      <Animated.View style={[styles.patternWrap, { opacity: patternOpacity }]}>
        <OncePattern />
      </Animated.View>

      {/* Logo icon + text side by side */}
      <View style={styles.center}>
        <View style={styles.brandRow}>
          {/* Icon — springs in */}
          <Animated.View
            style={{
              opacity: iconOpacity,
              transform: [{ scale: iconScale }],
            }}
          >
            <OnceLogoIcon size={44} />
          </Animated.View>

          {/* Text — slides in from right */}
          <Animated.Text
            style={[
              styles.brandText,
              {
                opacity: textOpacity,
                transform: [{ translateX: textTranslateX }],
              },
            ]}
          >
            Once Media
          </Animated.Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#ffffff",
    zIndex: 999,
  },
  patternWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandText: {
    fontFamily: "Ubuntu_400Regular",
    fontSize: 22,
    color: "#1B17B3",
    marginLeft: 10,
    letterSpacing: 0.3,
  },
});
