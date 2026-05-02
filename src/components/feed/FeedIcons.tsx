import React from "react";
import Svg, { Path, Circle, G, Rect } from "react-native-svg";

/* ── Heart (outline) — from Heart.svg, filters stripped ── */
export function HeartIcon({ size = 28, filled = false }: { size?: number; filled?: boolean }) {
  if (filled) {
    return (
      <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
        <Path d="M2.3335 10.6598C2.3335 16.3332 7.02283 19.3565 10.4555 22.0626C11.6668 23.0175 12.8335 23.9165 14.0002 23.9165C15.1668 23.9165 16.3335 23.0175 17.5448 22.0626C20.9775 19.3565 25.6668 16.3332 25.6668 10.6598C25.6668 4.9864 19.25 0.962919 14.0002 6.41728C8.75035 0.962919 2.3335 4.9864 2.3335 10.6598Z" fill="#FF5C6F"/>
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Path d="M2.3335 10.6598C2.3335 16.3332 7.02283 19.3565 10.4555 22.0626C11.6668 23.0175 12.8335 23.9165 14.0002 23.9165C15.1668 23.9165 16.3335 23.0175 17.5448 22.0626C20.9775 19.3565 25.6668 16.3332 25.6668 10.6598C25.6668 4.9864 19.25 0.962919 14.0002 6.41728C8.75035 0.962919 2.3335 4.9864 2.3335 10.6598Z" stroke="white" strokeWidth="1.75"/>
    </Svg>
  );
}

/* ── Comment (Chat Round Dots) — from Chat Round Dots.svg ── */
export function CommentIcon({ size = 28, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Path d="M13.9998 25.6667C20.4432 25.6667 25.6665 20.4434 25.6665 14C25.6665 7.55672 20.4432 2.33337 13.9998 2.33337C7.55651 2.33337 2.33317 7.55672 2.33317 14C2.33317 15.8663 2.77139 17.6303 3.55054 19.1946C3.7576 19.6103 3.82651 20.0855 3.70647 20.5341L3.0116 23.1311C2.70995 24.2585 3.74135 25.2899 4.86874 24.9883L7.46579 24.2934C7.91442 24.1734 8.38958 24.2423 8.80529 24.4493C10.3696 25.2285 12.1335 25.6667 13.9998 25.6667Z" stroke={color} strokeWidth="1.75"/>
      <Circle cx="9.333" cy="14" r="1.167" fill={color}/>
      <Circle cx="14" cy="14" r="1.167" fill={color}/>
      <Circle cx="18.667" cy="14" r="1.167" fill={color}/>
    </Svg>
  );
}

/* ── Bookmark — from Bookmark.svg ── */
export function BookmarkIcon({ size = 28, filled = false }: { size?: number; filled?: boolean }) {
  if (filled) {
    return (
      <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
        <Path d="M24.5 18.7728V12.9471C24.5 7.94377 24.5 5.44208 22.9623 3.88773C21.4246 2.33337 18.9497 2.33337 14 2.33337C9.05025 2.33337 6.57538 2.33337 5.03769 3.88773C3.5 5.44208 3.5 7.94377 3.5 12.9471V18.7728C3.5 22.3854 3.5 24.1918 4.35646 24.9811C4.76492 25.3575 5.28051 25.594 5.82973 25.6568C6.98136 25.7886 8.32619 24.5991 11.0159 22.2202C12.2048 21.1686 12.7992 20.6428 13.487 20.5043C13.8257 20.4361 14.1743 20.4361 14.513 20.5043C15.2008 20.6428 15.7952 21.1686 16.9841 22.2202C19.6738 24.5991 21.0186 25.7886 22.1703 25.6568C22.7195 25.594 23.2351 25.3575 23.6435 24.9811C24.5 24.1918 24.5 22.3854 24.5 18.7728Z" fill="#1B17B3" stroke="#1B17B3" strokeWidth="1.75"/>
        <Path d="M17.5 7H10.5" stroke="white" strokeWidth="1.75" strokeLinecap="round"/>
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Path d="M24.5 18.7727V12.9471C24.5 7.94372 24.5 5.44203 22.9623 3.88768C21.4246 2.33333 18.9497 2.33333 14 2.33333C9.05025 2.33333 6.57538 2.33333 5.03769 3.88768C3.5 5.44203 3.5 7.94372 3.5 12.9471V18.7727C3.5 22.3854 3.5 24.1917 4.35646 24.981C4.76492 25.3574 5.28051 25.5939 5.82973 25.6568C6.98136 25.7886 8.32619 24.5991 11.0159 22.2201C12.2048 21.1686 12.7992 20.6428 13.487 20.5042C13.8257 20.436 14.1743 20.436 14.513 20.5042C15.2008 20.6428 15.7952 21.1686 16.9841 22.2201C19.6738 24.5991 21.0186 25.7886 22.1703 25.6568C22.7195 25.5939 23.2351 25.3574 23.6435 24.981C24.5 24.1917 24.5 22.3854 24.5 18.7727Z" stroke="white" strokeWidth="1.75"/>
      <Path d="M17.5 7H10.5" stroke="white" strokeWidth="1.75" strokeLinecap="round"/>
    </Svg>
  );
}

/* ── Share (Forward) — from Forward.svg ── */
export function ShareIcon({ size = 28, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Path d="M17.1083 6.39269L21.7426 10.5121C23.5727 12.1388 24.4877 12.9522 24.4877 14C24.4877 15.0478 23.5727 15.8612 21.7426 17.4879L17.1083 21.6073C16.2729 22.3499 15.8552 22.7211 15.5109 22.5665C15.1665 22.4119 15.1665 21.853 15.1665 20.7354V18C10.9665 18 6.4165 20 4.6665 23.3334C4.6665 12.6667 10.8887 10 15.1665 10V7.26467C15.1665 6.14701 15.1665 5.58818 15.5109 5.43354C15.8552 5.27889 16.2729 5.65016 17.1083 6.39269Z" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

/* ── Clip (Video Frame Cut) — from Video Frame Cut.svg ── */
export function ClipIcon({ size = 20, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path d="M12.0833 2.50282C14.4116 2.5198 15.6864 2.63905 16.5237 3.47631C17.5 4.45262 17.5 6.02397 17.5 9.16667V10.8333C17.5 13.976 17.5 15.5474 16.5237 16.5237C15.6864 17.3609 14.4116 17.4802 12.0833 17.4972M7.91659 17.4972C5.58841 17.4802 4.31356 17.3609 3.47631 16.5237C2.5 15.5474 2.5 13.976 2.5 10.8333V9.16667C2.5 6.02397 2.5 4.45262 3.47631 3.47631C4.31356 2.63906 5.58841 2.51981 7.91659 2.50282" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M14.1665 3.33333V16.6667" stroke={color} strokeWidth="1.25" strokeLinecap="round"/>
      <Path d="M10 1.66667V18.3333" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeDasharray="2.5 2.5"/>
      <Path d="M5.8335 3.33333V16.6667" stroke={color} strokeWidth="1.25" strokeLinecap="round"/>
      <Path d="M2.9165 7.08333L5.83317 7.08333M17.0832 7.08333L14.1665 7.08333" stroke={color} strokeWidth="1.25" strokeLinecap="round"/>
      <Path d="M2.9165 12.9167H5.83317M17.0832 12.9167H14.1665" stroke={color} strokeWidth="1.25" strokeLinecap="round"/>
    </Svg>
  );
}

/* ── Utility icons ── */
export function PlusIcon({ size = 16, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2} strokeLinecap="round"/>
    </Svg>
  );
}

export function SendIcon({ size = 20, color = "#1B17B3" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

export function CloseIcon({ size = 20, color = "#0C0C0C" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth={2} strokeLinecap="round"/>
    </Svg>
  );
}
