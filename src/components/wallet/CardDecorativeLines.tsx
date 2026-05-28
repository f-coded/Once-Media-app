import React from "react";
import { StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";

export function CardDecorativeLines() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 339 146"
      style={StyleSheet.absoluteFillObject}
      pointerEvents="none"
    >
      {/* 
        Horizontal organic wavy strokes matching the organic ribbon-paint-stroke
        style in the Figma design mockup. We use thick strokes with 
        alternating colors and smooth cubic bezier curves.
      */}
      <Path
        d="M-20,25 C40,5 100,55 170,30 C240,5 300,55 380,25"
        fill="none"
        stroke="rgba(255, 255, 255, 0.16)"
        strokeWidth={14}
        strokeLinecap="round"
      />
      <Path
        d="M-20,55 C40,35 100,85 170,60 C240,35 300,85 380,55"
        fill="none"
        stroke="rgba(255, 255, 255, 0.08)"
        strokeWidth={16}
        strokeLinecap="round"
      />
      <Path
        d="M-20,85 C40,65 100,115 170,90 C240,65 300,115 380,85"
        fill="none"
        stroke="rgba(255, 255, 255, 0.22)"
        strokeWidth={12}
        strokeLinecap="round"
      />
      <Path
        d="M-20,115 C40,95 100,145 170,120 C240,95 300,145 380,115"
        fill="none"
        stroke="rgba(255, 255, 255, 0.10)"
        strokeWidth={14}
        strokeLinecap="round"
      />
    </Svg>
  );
}
