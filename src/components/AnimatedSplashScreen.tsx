import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { OnceLogoIcon } from "./OnceLogoIcon";
import { OncePattern } from "./OncePattern";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

interface Props {
  onAnimationFinish: () => void;
}

/* ─── White "once®" wordmark for the blue splash ─── */
function OnceWordmark({ opacity }: { opacity: Animated.Value }) {
  return (
    <Animated.View style={{ opacity }}>
      <Svg width={163} height={39} viewBox="0 0 163 39" fill="none">
        <Path d="M44.6647 34.8595V18.3581C44.6647 9.58959 49.0145 4.54947 57.2997 4.54947C65.1016 4.54947 68.4847 8.62296 68.4847 15.6655V34.8595H73.3869V14.9751C73.3869 6.89696 68.6228 0.0616607 59.0259 0.0616607C50.5334 0.0616607 45.7005 5.65425 44.5267 11.4538H44.1816V0.752166H39.7628V34.8595H44.6649H44.6647ZM97.6902 35.5499C107.218 35.5499 114.675 29.8884 114.675 21.6724V21.1199H109.842V21.5342C109.842 27.6101 105.423 31.0621 97.6211 31.0621C88.5074 31.0621 84.5719 26.1599 84.5719 17.8058C84.5719 9.45138 88.5074 4.54947 97.6211 4.54947C105.423 4.54947 109.842 8.00162 109.842 14.0774V14.4917H114.675V13.9392C114.675 5.723 107.218 0.0615234 97.6902 0.0615234C86.7814 0.0615234 79.6699 7.44928 79.6699 17.8058C79.6699 28.1623 86.7814 35.5499 97.6902 35.5499ZM137.459 35.5499C146.987 35.5499 154.03 30.6478 154.03 23.5364V23.053H149.128V23.5364C149.128 28.5074 145.399 31.4763 137.39 31.4763C128.345 31.4763 124.41 26.8504 124.134 19.1867H154.168C154.375 18.2891 154.513 17.2533 154.513 16.0106C154.513 5.86118 147.401 0.0616607 137.39 0.0616607C126.412 0.0616607 119.508 7.44944 119.508 17.8059C119.508 28.6457 126.481 35.5501 137.459 35.5501V35.5499ZM137.321 4.13517C145.33 4.13517 149.887 7.9326 149.887 15.1132C149.887 15.4583 149.887 15.8035 149.887 16.1487H124.134C124.479 8.692 128.484 4.13504 137.321 4.13504L137.321 4.13517Z" fill="#FEFEFE" />
        <Path fillRule="evenodd" clipRule="evenodd" d="M29.5102 11.538H34.3861C31.8674 4.79847 25.37 0 17.7521 0C7.94798 0 0 7.94771 0 17.752C0 27.5562 7.94784 35.5042 17.7521 35.5042C25.3702 35.5042 31.8674 30.7055 34.3861 23.966H29.5102C27.2794 28.1787 22.8508 31.0486 17.752 31.0486C10.4085 31.0486 4.45547 25.0955 4.45547 17.752C4.45547 10.4085 10.4085 4.45546 17.752 4.45546C22.8508 4.45546 27.2792 7.32536 29.5102 11.538Z" fill="#FEFEFE" />
        <Path fillRule="evenodd" clipRule="evenodd" d="M30.5804 15.0735L35.084 17.7519L30.5804 20.4305V15.0735Z" fill="#FEFEFE" />
        <Path d="M17.9053 7.07324C23.8028 7.07348 28.584 11.8544 28.584 17.752C28.584 23.6495 23.8028 28.4304 17.9053 28.4307C12.0076 28.4307 7.22656 23.6496 7.22656 17.752C7.22656 11.8543 12.0076 7.07324 17.9053 7.07324ZM17.8838 11.5332C17.3557 11.5336 16.48 12.3221 16.0654 12.6445L14.415 13.9111C14.1418 14.1321 13.8724 14.3219 13.5879 14.542C13.3037 14.7618 13.0516 14.9553 12.7617 15.1729L11.5195 16.1182C11.3815 16.2249 11.2275 16.3355 11.2275 16.5703V22.4023C11.2275 23.0732 12.087 23.9567 12.7402 23.957C13.3405 23.957 15.4096 23.9833 15.8525 23.9395C15.9089 23.666 15.874 21.078 15.874 20.5801C15.874 20.0121 15.8022 19.5333 16.0459 19.1045C16.495 18.3143 17.5558 18.4882 18.4863 18.4883C18.9748 18.4883 19.3723 18.7861 19.5537 19.0723C19.8087 19.4746 19.7734 20.0072 19.7734 20.54C19.7734 21.0467 19.7381 23.6615 19.7959 23.9346C20.1702 23.9992 22.5036 23.9575 23.0684 23.957C23.7195 23.957 24.582 23.0833 24.582 22.4023V16.5703C24.582 16.329 24.4376 16.2218 24.292 16.1152C24.1414 16.0048 24.0137 15.9061 23.8789 15.7988L19.7432 12.6445C19.1739 12.2162 18.4754 11.5332 17.8838 11.5332Z" fill="#FEFEFE" />
        <Path d="M158.738 35.4604C158.103 35.4604 157.52 35.3064 156.988 34.9984C156.456 34.6811 156.031 34.2611 155.714 33.7384C155.397 33.2064 155.238 32.6184 155.238 31.9744C155.238 31.3304 155.397 30.7471 155.714 30.2244C156.031 29.6924 156.456 29.2724 156.988 28.9644C157.52 28.6564 158.103 28.5024 158.738 28.5024C159.382 28.5024 159.97 28.6564 160.502 28.9644C161.034 29.2724 161.459 29.6924 161.776 30.2244C162.093 30.7471 162.252 31.3304 162.252 31.9744C162.252 32.6184 162.093 33.2064 161.776 33.7384C161.459 34.2611 161.034 34.6811 160.502 34.9984C159.97 35.3064 159.382 35.4604 158.738 35.4604ZM158.738 34.5224C159.205 34.5224 159.629 34.4104 160.012 34.1864C160.395 33.9531 160.698 33.6451 160.922 33.2624C161.146 32.8704 161.258 32.4411 161.258 31.9744C161.258 31.5078 161.146 31.0831 160.922 30.7004C160.698 30.3178 160.395 30.0144 160.012 29.7904C159.629 29.5571 159.205 29.4404 158.738 29.4404C158.281 29.4404 157.861 29.5571 157.478 29.7904C157.095 30.0144 156.792 30.3178 156.568 30.7004C156.344 31.0831 156.232 31.5078 156.232 31.9744C156.232 32.4411 156.344 32.8704 156.568 33.2624C156.792 33.6451 157.095 33.9531 157.478 34.1864C157.861 34.4104 158.281 34.5224 158.738 34.5224ZM157.394 33.7804V30.1544H158.85C159.261 30.1544 159.583 30.2478 159.816 30.4344C160.049 30.6211 160.166 30.8918 160.166 31.2464C160.166 31.5358 160.087 31.7691 159.928 31.9464C159.779 32.1238 159.569 32.2451 159.298 32.3104L160.306 33.7804H159.41L158.626 32.6324C158.589 32.5858 158.561 32.5391 158.542 32.4924C158.533 32.4364 158.519 32.3944 158.5 32.3664H158.164V33.7804H157.394ZM158.164 31.6944H158.752C159.153 31.6944 159.354 31.5498 159.354 31.2604C159.354 30.9711 159.153 30.8264 158.752 30.8264H158.164V31.6944Z" fill="#FEFEFE" />
      </Svg>
    </Animated.View>
  );
}

export function AnimatedSplashScreen({ onAnimationFinish }: Props) {
  /* ═══════════════════════════════════════════
   * PHASE 1: Blue splash with "once®" wordmark
   * ═══════════════════════════════════════════ */
  const wordmarkOpacity = useRef(new Animated.Value(0)).current;
  const wordmarkScale = useRef(new Animated.Value(0.85)).current;

  /* ═══════════════════════════════════════════
   * PHASE 2: Blue → White transition
   * The blue BG fades away cleanly, revealing white underneath
   * ═══════════════════════════════════════════ */
  const blueOpacity = useRef(new Animated.Value(1)).current;

  /* ═══════════════════════════════════════════
   * PHASE 3: Brand row (icon + "Once Media") appears
   * ═══════════════════════════════════════════ */
  const iconScale = useRef(new Animated.Value(0.3)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateX = useRef(new Animated.Value(40)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const patternOpacity = useRef(new Animated.Value(0)).current;

  /* Exit */
  const exitScale = useRef(new Animated.Value(1)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // ── PHASE 1: Wordmark fades in on blue (0→1200ms) ──
    Animated.parallel([
      Animated.timing(wordmarkOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(wordmarkScale, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // ── PHASE 2: Blue shrinks to zero, wordmark fades, white reveals (1400→2400ms) ──
    setTimeout(() => {
      // Wordmark fades + shrinks out
      Animated.parallel([
        Animated.timing(wordmarkOpacity, {
          toValue: 0,
          duration: 400,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(wordmarkScale, {
          toValue: 0.6,
          duration: 500,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      // Blue overlay fades away smoothly
      setTimeout(() => {
        Animated.timing(blueOpacity, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();

        // Pattern fades in as blue fades
        Animated.timing(patternOpacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      }, 200);
    }, 1400);

    // ── PHASE 3: Brand row appears (2200→3000ms) ──
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(iconScale, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, 2200);

    // Text slides in
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(textTranslateX, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, 2500);

    // ── EXIT: Zoom out + fade (3800ms) ──
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(exitScale, {
          toValue: 1.15,
          duration: 450,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(exitOpacity, {
          toValue: 0,
          duration: 450,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => onAnimationFinish());
    }, 3800);
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: exitOpacity, transform: [{ scale: exitScale }] },
      ]}
    >
      {/* ── Layer 1: White base + Pattern (underneath blue) ── */}
      <View style={styles.whiteBase}>
        <Animated.View style={[styles.patternWrap, { opacity: patternOpacity }]}>
          <OncePattern />
        </Animated.View>

        {/* Brand row — appears in phase 3 */}
        <View style={styles.center}>
          <View style={styles.brandRow}>
            <Animated.View
              style={{
                opacity: iconOpacity,
                transform: [{ scale: iconScale }],
              }}
            >
              <OnceLogoIcon size={44} />
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
      </View>

      {/* ── Layer 2: Blue overlay that contracts away ── */}
      <Animated.View
        style={[
          styles.blueOverlay,
          {
            opacity: blueOpacity,
          },
        ]}
      >
        {/* Wordmark centered on blue */}
        <View style={styles.center}>
          <Animated.View
            style={{
              transform: [{ scale: wordmarkScale }],
            }}
          >
            <OnceWordmark opacity={wordmarkOpacity} />
          </Animated.View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  whiteBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
  },
  blueOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#1B17B3",
    overflow: "hidden",
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
