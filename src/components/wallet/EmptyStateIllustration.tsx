import React from "react";
import Svg, { Rect, Path, Circle } from "react-native-svg";

export function EmptyStateIllustration() {
  return (
    <Svg width="46" height="46" viewBox="0 0 46 46" fill="none">
      {/* Light gray rounded circular/square container matching Figma exactly */}
      <Rect width="46" height="46" rx="23" fill="#F5F5F5" />
      
      {/* Clean document/page outline path */}
      <Path
        d="M17 18.5 C17 16.8 18.2 15.5 19.8 15.5 H 24.2 C 24.6 15.5 25.0 15.7 25.3 16.0 L 28.5 19.2 C 28.8 19.5 29 19.9 29 20.3 V 27.5 C 29 29.2 27.8 30.5 26.2 30.5 H 19.8 C 18.2 30.5 17 29.2 17 27.5 Z"
        stroke="#838383"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Document Fold line at top right */}
      <Path
        d="M24.5 15.8 V 19.0 C 24.5 19.6 24.9 20.0 25.5 20.0 H 28.7"
        stroke="#838383"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Rounded reload arrow inside the page */}
      <Path
        d="M20.5 23.5 C 20.5 21.8 21.8 20.5 23.5 20.5 C 24.6 20.5 25.5 21.1 26.0 22.0"
        stroke="#838383"
        strokeWidth={1.25}
        strokeLinecap="round"
      />
      <Path
        d="M25.5 23.5 L 26.0 22.0 L 24.5 21.5"
        stroke="#838383"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Subtle indicator dot representing campaigns / active states */}
      <Circle cx={29} cy={17.5} r={2} fill="#E85454" />
    </Svg>
  );
}
