# Comment Sheet Drag-to-Close Physics & PostCard Overlay Timing

> **Status**: Working & Pushed to `staging` (June 29, 2026)
> **Files**: `CommentSheet.tsx`, `PostCard.tsx`, `FeedScreen.tsx`

---

## Architecture Overview

The comment sheet and post card are connected through a **single shared `Animated.Value`** called `sheetProgress` (owned by `FeedScreen`). Both components read the same value:

- **CommentSheet** drives it (mount animation 0→1, drag scrub, close animation →0)
- **PostCard** reads it (scale/translate the post, fade overlays in/out)
- **FeedScreen** reads it (blur/dim feed behind the sheet)

This architecture means the post card and comment sheet always move **in lockstep** — no timers, no separate animations, just one shared native-driven value.

---

## CommentSheet Drag Physics

### Drag Sensitivity (1.4x multiplier)
```typescript
const next = 1 - (g.dy * 1.4) / SHEET_HEIGHT;
```
The raw gesture displacement `g.dy` is multiplied by `1.4` before mapping to progress. This makes the sheet feel **loose and light** — less finger travel is needed to drag it down. Without this, the sheet felt "stiff" and "heavy" to move on Android.

### Release Threshold (progress-based, not pixel-based)
```typescript
if (currentProgressVal.current < 0.85 || g.vy > 0.5) {
  closeSheet();
}
```
**Why progress-based**: With the 1.4x multiplier, the actual gesture `g.dy` pixels don't map 1:1 to how far the sheet has moved. Testing `g.dy > 120` (the old approach) was unreliable — sometimes the sheet had moved far but the raw gesture hadn't crossed the pixel threshold. Using the actual progress value (`< 0.85` = dragged 15% down) makes the release feel consistently responsive.

**Low velocity threshold**: `g.vy > 0.5` (lowered from 0.8) catches quick flicks even if the drag distance is small.

### Spring-Back
If the drag doesn't cross the threshold, the sheet springs back with `bounciness: 0` (no overshoot):
```typescript
Animated.spring(progress, { toValue: 1, bounciness: 0, useNativeDriver: true })
```

---

## Close Animation — The "Bottom Hang" Fix

### Root Cause 1: `setClosing(false)` layout flash

**The bug**: In the animation completion callback, calling `setClosing(false)` before `onClose()` triggered a React re-render. This flipped `composerPadBottom` from the frozen keyboard height to `0` for **one single frame** before the component unmounted. That one-frame layout jump was the visible "hang" at the bottom edge.

**The fix**: Don't call `setClosing(false)` or `isClosing.current = false` in the completion callback. The component is about to be unmounted by `onClose()` → `setShowComments(false)` anyway, so these resets are unnecessary.

```typescript
// ❌ BAD — causes layout flash
.start(() => {
  progress.setValue(0);
  isClosing.current = false;  // unnecessary
  setClosing(false);           // CAUSES THE HANG — composerPadBottom recalculates
  onClose();                   // unmounts the component
});

// ✅ GOOD — clean exit
.start(() => {
  progress.setValue(0);
  // Do NOT reset closing state here — component unmounts via onClose
  onClose();
});
```

### Root Cause 2: `translateY` output range too small

**The bug**: `outputRange: [SHEET_HEIGHT + 6, 0]` placed the sheet's top edge only 6px past the screen bottom at progress=0. With shadows, border radius, or safe-area mismatches, the rounded header could peek above the bottom edge.

**The fix**: Use `[initialHeight, 0]` — the full window height — to guarantee the sheet slides **way** offscreen:

```typescript
// ❌ BAD — barely offscreen, can peek
outputRange: [SHEET_HEIGHT + 6, 0]

// ✅ GOOD — fully offscreen with margin
outputRange: [initialHeight, 0]
```

### Proportional Duration Scaling

The close animation duration scales linearly with the remaining distance:
```typescript
const duration = Math.max(80, Math.round(remaining * 200));
```
- Dragged 70% down (remaining=0.3) → 60ms (min 80ms)
- Dragged 50% down (remaining=0.5) → 100ms
- Released from top (remaining=1.0) → 200ms

This prevents the sheet from feeling sluggish when released near the bottom.

### Accelerating Exit Curve

```typescript
easing: Easing.in(Easing.quad)
```
`Easing.in` means the animation **starts slow and accelerates**. For a close/exit gesture, this is critical:
- ❌ `Easing.out` (decelerate) → slows down at the bottom → looks like it's "hanging"
- ✅ `Easing.in` (accelerate) → speeds up as it exits → flies away cleanly

### Instant Unmount Bypass

If the user has already dragged the sheet 95%+ offscreen, skip the animation entirely:
```typescript
if (remaining <= 0.05) {
  progress.setValue(0);
  onClose();
  return;
}
```

---

## PostCard Overlay Timing

### Delayed Fade-In (Post Lands First, Then Buttons Appear)

```typescript
const overlayOpacity = sheetProgress
  ? sheetProgress.interpolate({
      inputRange: [0, 0.15, 1],
      outputRange: [1, 0, 0],
    })
  : 1;
```

**How it works**:
- `progress 1 → 0.15`: Overlays stay at opacity `0` (hidden)
- `progress 0.15 → 0`: Overlays fade from `0` → `1` (visible)

Since the post card's scale is driven by the same `sheetProgress`, by the time progress reaches `0.15`, the post card is already ~85% expanded. The action buttons then fade in during the final 15%, giving the visual impression that the post "lands" first, then the buttons "pop in."

### `pointerEvents` Toggle
```typescript
pointerEvents={minimized ? "none" : "box-none"}
```
While the comment sheet is open (`minimized=true`), overlay touches are disabled so the transparent action buttons don't intercept taps meant for the sheet backdrop.

---

## FeedScreen Scroll Snapping

### FlashList Configuration
```typescript
<FlashList
  pagingEnabled={Platform.OS === "ios"}
  disableIntervalMomentum={true}
  decelerationRate="fast"
  snapToInterval={POST_HEIGHT}
  snapToAlignment="start"
  estimatedItemSize={POST_HEIGHT}
/>
```

**Key props**:
- `disableIntervalMomentum={true}` — prevents momentum from carrying the scroll past the snap point (fixes the "aggressive scrolling past multiple posts" issue on Android)
- `decelerationRate="fast"` — scroll decelerates quickly, making snaps feel responsive
- `snapToInterval={POST_HEIGHT}` — locks scroll positions to exact multiples of the post height
- `estimatedItemSize={POST_HEIGHT}` — FlashList optimization for cell recycling performance

### `isMinimized` State

Controls the postcard overlay visibility and feed blur independently from the sheet's mount lifecycle:

```
Comment open:   setIsMinimized(true)  → overlays fade out, feed blurs
Close START:    setIsMinimized(false) → overlays start fading in, blur clears
Close END:      setShowComments(false) → sheet unmounts
```

This separation ensures the post card starts expanding at close-START (smooth visual transition) while the sheet stays mounted until it finishes animating offscreen.

---

## Key Lessons

1. **Never call `setState` in an animation completion callback if the component unmounts immediately after** — it causes a one-frame layout flash.
2. **Use `Easing.in` for exit animations, `Easing.out` for entrance animations** — exit should accelerate away, entrance should decelerate to settle.
3. **Test `translateY` output ranges on actual devices** — `SHEET_HEIGHT + 6` looks correct on paper but can peek on devices with edge-to-edge mode or non-standard safe areas.
4. **Multiply gesture displacement for lighter feel** — raw `PanResponder` gesture values often feel too heavy/stiff on Android. A 1.2–1.5x multiplier makes drawers feel native.
5. **Use progress-based thresholds instead of pixel-based** — especially when using gesture multipliers, the raw pixel values desync from the visual position.
