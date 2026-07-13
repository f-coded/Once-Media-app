import React, { useEffect } from "react";
import { View } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
  runOnJS,
} from "react-native-reanimated";

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface WavyProgressRingProps {
  /** 0–1 — how much of the ring is "filled" (use 0.75 for a spinner feel) */
  progress?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  waveAmplitude?: number;
  waveFrequency?: number;
  onComplete?: () => void;
}

/**
 * Builds an SVG path string that traces an arc with a sine wave
 * rippling along its radial direction.
 */
function buildWavyArcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
  amplitude: number,
  frequency: number,
  wavePhase: number,
  steps = 180 // High resolution for smooth vectors
): string {
  "worklet";
  const totalDeg = endDeg - startDeg;
  if (Math.abs(totalDeg) < 0.5) return "";

  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const deg = startDeg + t * totalDeg;
    const rad = (deg * Math.PI) / 180;

    // Fade the wave in/out at the tips so it meets the track cleanly
    const edgeFade = Math.min(t / 0.08, 1) * Math.min((1 - t) / 0.08, 1);
    
    // Wave formula using absolute degrees to prevent stretching/squeezing
    const wave =
      Math.sin((deg / 360) * frequency * Math.PI * 2 - wavePhase * Math.PI * 2) *
      amplitude *
      edgeFade;

    const rWave = r + wave;
    const x = cx + rWave * Math.cos(rad);
    const y = cy + rWave * Math.sin(rad);

    d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  return d;
}

export default function WavyProgressRing({
  progress = 0.75,
  size = 72,
  strokeWidth = 5,
  color = "#1B17B3",
  trackColor = "#e0e1f1ff", // Keep user's preferred trackColor default
  waveAmplitude = 3.0,    // High amplitude wave matching the mockup
  waveFrequency = 8,      // 8 cycles around 360 degrees for correct wave spacing
  onComplete,
}: WavyProgressRingProps) {
  const cx = size / 2;
  const cy = size / 2;
  // Reduce base radius by the wave amplitude to prevent the wave peaks from being clipped at the boundaries
  const r = (size - strokeWidth - waveAmplitude * 2 - 2) / 2;

  // Animates the progress value itself
  const animProgress = useSharedValue(0);
  // Rotates the whole ring (spin) - 1.8s for smooth elegant rotation
  const rotation = useSharedValue(0);
  // Drives the sine wave phase - 1.2s for gentle fluid wave movement
  const wavePhase = useSharedValue(0);
  // Drives the breathing loop (growing/shrinking arcs) - 1.6s for fluid movement
  const arcBreath = useSharedValue(0);

  useEffect(() => {
    animProgress.value = 0;
    animProgress.value = withTiming(
      progress,
      { duration: 1800, easing: Easing.bezier(0.4, 0, 0.2, 1) },
      (finished) => {
        if (finished && onComplete) {
          runOnJS(onComplete)();
        }
      }
    );

    rotation.value = withRepeat(
      withTiming(360, { duration: 1800, easing: Easing.linear }),
      -1,
      false
    );
    wavePhase.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.linear }),
      -1,
      false
    );
    arcBreath.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true // Reverse true makes it oscillate: 0 -> 1 -> 0 -> 1 ...
    );
    return () => {
      cancelAnimation(animProgress);
      cancelAnimation(rotation);
      cancelAnimation(wavePhase);
      cancelAnimation(arcBreath);
    };
  }, [progress, onComplete]);

  const waveAnimatedProps = useAnimatedProps(() => {
    const startDeg = -90; // top of circle
    
    // Wave length breathes between 20 and 300 degrees (allowing them to shrink much further)
    const currentMaxWaveAngle = 20 + 280 * arcBreath.value;
    const waveLength = currentMaxWaveAngle * animProgress.value;
    const endDeg = startDeg + waveLength;

    const d = buildWavyArcPath(
      cx,
      cy,
      r,
      startDeg + rotation.value,
      endDeg + rotation.value,
      waveAmplitude,
      waveFrequency,
      wavePhase.value
    );
    return { d };
  });

  const trackAnimatedProps = useAnimatedProps(() => {
    const startDeg = -90;
    
    // Total available arc space is 320 degrees (360 minus two 20-degree gaps)
    const currentMaxWaveAngle = 20 + 280 * arcBreath.value;
    const currentMaxTrackAngle = 320 - currentMaxWaveAngle; // Reciprocally shrinks/grows!

    const waveLength = currentMaxWaveAngle * animProgress.value;
    const trackLength = currentMaxTrackAngle * animProgress.value;
    const gap = 20 * animProgress.value;

    const trackStart = startDeg + waveLength + gap;
    const trackEnd = trackStart + trackLength;

    // A smooth track has amplitude = 0
    const d = buildWavyArcPath(
      cx,
      cy,
      r,
      trackStart + rotation.value,
      trackEnd + rotation.value,
      0,
      0,
      0
    );
    return { d };
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Track arc (smooth, white) */}
        <AnimatedPath
          animatedProps={trackAnimatedProps}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />
        {/* Wavy progress arc (blue) */}
        <AnimatedPath
          animatedProps={waveAnimatedProps}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}