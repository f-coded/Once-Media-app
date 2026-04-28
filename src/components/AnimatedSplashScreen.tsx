import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import Svg, { Path } from "react-native-svg";
import { OncePattern } from "./OncePattern";

interface Props {
  onAnimationFinish: () => void;
}

export function AnimatedSplashScreen({ onAnimationFinish }: Props) {
  // Icon animation
  const iconScale = useRef(new Animated.Value(0)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;

  // Text animation
  const textTranslateX = useRef(new Animated.Value(-60)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  // Pattern
  const patternOpacity = useRef(new Animated.Value(0)).current;

  // Exit
  const exitScale = useRef(new Animated.Value(1)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  const iconRotateInterpolate = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  useEffect(() => {
    // 1) Pattern fades in
    Animated.timing(patternOpacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // 2) Icon spins in
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(iconScale, {
          toValue: 1,
          friction: 4,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(iconRotate, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, 300);

    // 3) Text slides in from left
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(textTranslateX, {
          toValue: 0,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, 900);

    // 4) Zoom out + fade — COMMENTED OUT to preview splash screen
    // setTimeout(() => {
    //   Animated.parallel([
    //     Animated.timing(exitScale, {
    //       toValue: 1.5,
    //       duration: 500,
    //       easing: Easing.in(Easing.cubic),
    //       useNativeDriver: true,
    //     }),
    //     Animated.timing(exitOpacity, {
    //       toValue: 0,
    //       duration: 500,
    //       easing: Easing.in(Easing.cubic),
    //       useNativeDriver: true,
    //     }),
    //   ]).start(() => onAnimationFinish());
    // }, 2400);
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: exitOpacity, transform: [{ scale: exitScale }] },
      ]}
    >
      {/* Pattern watermark — bottom half */}
      <Animated.View style={[styles.patternWrap, { opacity: patternOpacity }]}>
        <OncePattern />
      </Animated.View>

      {/* Logo + text in a horizontal row, centered */}
      <View style={styles.center}>
        <View style={styles.brandRow}>
          <Animated.View
            style={{
              opacity: iconOpacity,
              transform: [
                { scale: iconScale },
                { rotate: iconRotateInterpolate },
              ],
            }}
          >
            <Svg width={44} height={44} viewBox="0 0 44 44" fill="none">
              <Path
                d="M32.8686 0.0324707H11.1903C5.02795 0.0324707 0.0323486 5.02807 0.0323486 11.1905V32.8688C0.0323486 39.0311 5.02795 44.0267 11.1903 44.0267H32.8686C39.031 44.0267 44.0266 39.0311 44.0266 32.8688V11.1905C44.0266 5.02807 39.031 0.0324707 32.8686 0.0324707Z"
                fill="#1B17B3"
              />
              <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M29.4641 18.0606H32.5704C30.9658 13.7695 26.8265 10.7141 21.9732 10.7141C15.7271 10.7141 10.6637 15.7746 10.6637 22.0171C10.6637 28.2597 15.7271 33.3202 21.9732 33.3202C26.8265 33.3202 30.9658 30.2648 32.5704 25.9737H29.4641C28.0428 28.656 25.2215 30.4833 21.9731 30.4833C17.2947 30.4833 13.5021 26.6928 13.5021 22.0171C13.5021 17.3413 17.2947 13.5509 21.9731 13.5509C25.2215 13.5509 28.0428 15.3782 29.4641 18.0604V18.0606Z"
                fill="#FEFEFE"
              />
              <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M30.1459 20.3118L33.0151 22.0172L30.1459 23.7227V20.3118Z"
                fill="#FEFEFE"
              />
              <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M22.0706 15.218C25.828 15.218 28.8739 18.2622 28.8739 22.0174C28.8739 25.7727 25.828 28.8168 22.0706 28.8168C18.3132 28.8168 15.2673 25.7727 15.2673 22.0174C15.2673 18.2622 18.3132 15.218 22.0706 15.218ZM17.8166 21.2651V24.9786C17.8166 25.4058 18.3645 25.968 18.7806 25.968C19.1631 25.968 20.4809 25.9848 20.7631 25.9569C20.799 25.7829 20.7769 24.1352 20.7769 23.8181C20.7769 23.4565 20.7309 23.1514 20.8862 22.8783C21.1724 22.3752 21.8486 22.4864 22.4416 22.4864C22.7527 22.4864 23.0056 22.676 23.1212 22.8583C23.2836 23.1145 23.2612 23.4531 23.2612 23.7923C23.2612 24.1144 23.2386 25.7798 23.2753 25.9537C23.5128 25.995 25.0012 25.9682 25.3606 25.9679C25.7754 25.9679 26.3246 25.4121 26.3246 24.9786V21.265C26.3246 21.1113 26.2328 21.0433 26.14 20.9754C26.044 20.9052 25.9631 20.8421 25.8772 20.7738L23.2422 18.7654C22.8797 18.4926 22.4346 18.0578 22.0578 18.0578C21.7213 18.0578 21.1632 18.5598 20.899 18.7653L19.8477 19.5719C19.6737 19.7126 19.5018 19.8331 19.3205 19.9732C19.1394 20.1133 18.9789 20.2367 18.7942 20.3752L18.003 20.9773C17.915 21.0452 17.8167 21.1155 17.8167 21.265L17.8166 21.2651Z"
                fill="#FEFEFE"
              />
            </Svg>
          </Animated.View>

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
    fontFamily: "Ubuntu_700Bold",
    fontSize: 22,
    color: "#1B17B3",
    marginLeft: 10,
    letterSpacing: 0.3,
  },
});
