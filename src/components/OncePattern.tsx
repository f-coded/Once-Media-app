import React from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import Svg, { Text as SvgText, Defs, LinearGradient, Stop, Rect } from "react-native-svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/**
 * Renders the repeating "once" text pattern watermark
 * positioned in the bottom portion with a fade toward the top.
 */
export function OncePattern() {
  const text = "once  ";
  const fontSize = 42;
  const lineHeight = 48;
  const patternHeight = SCREEN_HEIGHT * 0.65;
  const rows = Math.ceil(patternHeight / lineHeight) + 2;
  const cols = 5;

  const lines: { x: number; y: number; label: string }[] = [];

  for (let row = 0; row < rows; row++) {
    const y = row * lineHeight;
    const offset = row % 2 === 0 ? 0 : -40;
    for (let col = 0; col < cols; col++) {
      lines.push({
        x: col * (SCREEN_WIDTH / cols) + offset,
        y,
        label: text,
      });
    }
  }

  return (
    <View style={[styles.container, { top: SCREEN_HEIGHT - patternHeight }]} pointerEvents="none">
      <Svg width={SCREEN_WIDTH} height={patternHeight}>
        <Defs>
          <LinearGradient id="fadeGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="white" stopOpacity="1" />
            <Stop offset="0.5" stopColor="white" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {lines.map((item, i) => (
          <SvgText
            key={i}
            x={item.x}
            y={item.y}
            fontSize={fontSize}
            fontWeight="700"
            fill="#D4D4D4"
            opacity={0.6}
          >
            {item.label}
          </SvgText>
        ))}

        {/* Gradient overlay — fades text out toward the top */}
        <Rect
          x="0"
          y="0"
          width={SCREEN_WIDTH}
          height={patternHeight}
          fill="url(#fadeGrad)"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 0,
  },
});
