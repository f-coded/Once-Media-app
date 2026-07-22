# Comment Sheet Physics, Docking & PostCard Overlay Timing

> **Status**: Working (July 2026) — rewritten after the Reanimated migration
> **Files**: `CommentSheet.tsx`, `PostCard.tsx`, `FeedScreen.tsx`
> **See also**: `keyboard-composer-tracking.md`, `media-orientation-and-docking.md`

---

## Architecture Overview

The comment sheet and post card are connected through a **single shared
Reanimated `SharedValue<number>`** called `sheetProgress`, owned by `FeedScreen`.
`0` = closed, `1` = fully open.

| Component | Role |
|---|---|
| `FeedScreen` | **Owns** it. Fires the open spring. Reads it for the post-card dock transform. |
| `CommentSheet` | Drives it during drag and close. Reads it for the sheet's `translateY`. |
| `PostCard` | Reads it to fade the overlays. |

Everything runs **on the UI thread** — the gesture handlers are worklets, and
every consumer is a `useAnimatedStyle`. There is no JS-bridge hop per frame, no
timer, and no second animation to keep in sync. The sheet and post card move in
lockstep because they are literally reading the same number.

> Historical note: this was originally an RN `Animated.Value` driven by
> `PanResponder`, with a JS-side mirror ref (`currentProgressVal`) so JS could
> read the value. A SharedValue is readable from both threads, so that mirror
> is gone.

---

## Sheet position — LINEAR, deliberately

```tsx
translateY: interpolate(progress.value, [0, 1], [initialHeight, 0])
```

**Do not reintroduce a corner in this curve.** It was previously piecewise —
`[0, 0.1, 1] → [initialHeight, SHEET_HEIGHT * 0.9 + 6, 0]` — which put a knee at
`progress 0.1`:

| Segment | progress | covers | speed |
|---|---|---|---|
| 1 | `0 → 0.1` | ~39% of the travel | ~`3.88H` per unit progress |
| 2 | `0.1 → 1` | the other ~61% | ~`0.68H` per unit progress |

A **5.5× instantaneous velocity drop** at ~39% of the travel. It read as the
sheet lurching up, hanging mid-rise, then continuing — and on close as a whoosh
near the end, crossing the same corner in reverse.

It also **desynced the sheet from the post card**, because the card's dock
transform is a plain `[0, 1]` map: the sheet lurched ahead, then stalled while
the card kept gliding.

**To make the entry punchier, raise `stiffness` in `SHEET_OPEN_SPRING`
(FeedScreen) — never by adding stops to this interpolation.**

---

## Drag physics

The pan is a single `Gesture.Pan()` whose `onBegin` / `onStart` / `onUpdate` /
`onFinalize` are **worklets**. RNGH's lifecycle callbacks replaced the old
manual `State.BEGAN/ACTIVE/END` machine; `onFinalize` covers END, CANCELLED and
FAILED alike.

### Zones

On `onBegin` the touch is classified once into `header`, `body`, or `composer`:

- **`composer`** — ignored entirely (you're typing, not dragging)
- **`header`** — drags immediately
- **`body`** — only drags under the conditions below

The composer boundary is computed from `composerPadSV`, which tracks the
keyboard (see `keyboard-composer-tracking.md`).

### Body-drag guards (both intentional — do not remove)

```tsx
if (scrollOffsetSV.value > LIST_TOP_THRESHOLD) return;  // only from the top
if (listMomentumActive.value) return;                    // not mid-fling
```

The momentum guard exists because the list's own deceleration fought the pan at
the top edge — that was the original "shaky/jittery" feel.

### Two-stage pull (`hasStretchedOnce`)

The **first** pull-at-top of a session only shows the elastic wave cue and never
drags the sheet, no matter how far you pull:

- `pullDistance < BODY_PULL_DEAD_ZONE (18px)` → nothing
- then bloom over `BODY_PULL_BLOOM_DISTANCE (44px)` → wave grows 0→1

On release, `hasStretchedOnce` flips true and **every subsequent pull drags
immediately**, with no stretch cue.

> Caveat worth knowing: `hasStretchedOnce` lives on an always-mounted component,
> so "first" means once per app session, not once per sheet open. First-time
> users may read the non-dragging first pull as a broken dismiss.

### Sensitivity & thresholds

```tsx
const DRAG_SENSITIVITY = 1.4;         // gesture px → progress multiplier
const CLOSE_PROGRESS_THRESHOLD = 0.85;
const CLOSE_VELOCITY_THRESHOLD = 500; // px/s
```

`1.4` makes the sheet feel loose — less finger travel to move it. Without it the
sheet felt stiff and heavy on Android.

**Release is progress-based, not pixel-based.** With a gesture multiplier, raw
`translationY` desyncs from where the sheet visually is, so testing pixels was
unreliable. Closing at `progress < 0.85` (dragged 15% down) is consistent.

> ⚠️ **Unit change**: the old `PanResponder` implementation used
> `g.vy > 0.5` — a normalised velocity. RNGH reports **px/s**, hence `500`.
> Don't port the old number.

### Springs

RN's `bounciness`/`speed` were converted to Reanimated stiffness/damping via
RN's own `fromBouncinessAndSpeed` → origami mapping, so the settle curves are
unchanged from the pre-migration feel:

| Spring | Params | Was |
|---|---|---|
| `SHEET_OPEN_SPRING` (FeedScreen) | stiffness 94.4, damping 13.4, mass 1 | `bounciness: 0, speed: 16` |
| `REOPEN_SPRING` (drag released, stays open) | stiffness 70.9, damping 12.0, mass 1 | `bounciness: 0` (default speed 12) |
| `WAVE_RELEASE_SPRING` | damping 16, stiffness 200, mass 0.5 | unchanged |

---

## Close animation

```tsx
const duration = Math.max(80, Math.round(remaining * 200));
progress.value = withTiming(0, { duration, easing: Easing.in(Easing.quad) }, cb);
```

- **Proportional duration** — released near the bottom, it doesn't feel sluggish.
- **`Easing.in` (accelerating)** — an exit should speed up as it leaves.
  `Easing.out` decelerates into the edge and reads as hanging.
- **Instant bypass** — if `remaining <= 0.05`, skip the animation entirely.

`onCloseStart` fires immediately so the post card starts expanding while the
sheet is still animating out.

### Do not `setState` in the completion callback

The original "bottom hang" was `setClosing(false)` in the completion callback:
it triggered one more render, flipping the composer's padding for a single
frame before unmount. The component is about to be unmounted by `onClose()`
anyway — reset nothing there.

---

## Open animation

Fired from **`FeedScreen.handleCommentPress`**, not from a mount effect inside
the sheet:

```tsx
setShowComments(true);
setIsBlurActive(true);
StatusBar.setHidden(true, "slide");
sheetProgress.value = withSpring(1, SHEET_OPEN_SPRING);
```

Starting it in the same tick as the state flip removes the mount-lag that used
to delay the post card's shrink. The sheet is also **kept mounted** after first
use (`sheetWarm`), so opening never pays a mount cost.

---

## PostCard overlay timing

```tsx
opacity: interpolate(sheetProgress.value, [0, 0.15, 1], [1, 0, 0], CLAMP)
```

- **Opening**: overlays fade out fast, over the first 15% of progress
- **Closing**: they stay at `0` for the first 85%, then fade in over the final
  15% — so the card **lands at full size first**, then the buttons appear

### Rasterization (required)

```tsx
renderToHardwareTextureAndroid={isActive}
shouldRasterizeIOS={isActive}
```

Opacity only forces offscreen alpha compositing while it is **strictly between
0 and 1** — i.e. only during `progress 0 → 0.15`. That subtree is expensive
(two full-size gradients, four SVG action buttons, several `Text`s with large
`textShadowRadius`), and re-compositing it every frame caused a hitch early in
the open. Rasterizing caches it as one texture.

This also explains why **dragging always felt smooth while opening didn't**:
a drag sits near `progress 1`, where opacity is pinned at `0` and costs nothing.

Gated on `isActive` so only the on-screen card holds a texture.

---

## FeedScreen docking

Portrait and landscape posts dock differently — see
`media-orientation-and-docking.md` for the full rules. In summary:

- **Portrait** — shrinks: `scaleY = dockHeight / POST_HEIGHT`, `scaleX = 0.45`
  (a deliberately non-uniform "breath width")
- **Landscape** — does **not** shrink: slides up into a full-width banner at
  true proportions

### The next-post mask (do not remove)

`POST_HEIGHT = feedViewportHeight - NAV_HEIGHT`, so the feed container is always
one nav-height taller than a single post and always renders the top of the
*next* post. `BottomNav` covers that strip at rest — but not when docked, where
it bled into the docked card as a visible band. An opaque strip pinned to the
frame's bottom `NAV_HEIGHT` hides it.

---

## Changed since the first version of this doc

| Then | Now |
|---|---|
| RN `Animated.Value` + `currentProgressVal` mirror ref | Reanimated `SharedValue`, readable on both threads |
| `PanResponder`, `g.dy` / `g.vy` | `Gesture.Pan()` worklets, `translationY` / `velocityY` (px/s) |
| Feed **blur** behind the sheet | **Removed** — it blurred the post media itself, unreadable with real video. Only the dim remains |
| `isMinimized` state | **Removed** — it was set on every open/close but never read |
| Piecewise sheet `translateY` | Linear |
| `estimatedItemSize` on FlashList | Not present (FlashList v2) |

---

## Key lessons

1. **Animating a layout prop is not the same as animating a transform.** Layout
   props force shadow-tree commits that contend with other animations in the
   same tree. This is the single highest-value lesson in this codebase — see
   `keyboard-composer-tracking.md`.
2. **Never put a corner in a curve two components share.** The knee at
   `progress 0.1` desynced the sheet from the post card. Change the spring, not
   the interpolation stops.
3. **Use `Easing.in` for exits, `Easing.out` for entrances.**
4. **Use progress-based thresholds, not pixel-based**, whenever a gesture
   multiplier is involved.
5. **Opacity between 0 and 1 costs offscreen compositing.** If a complex subtree
   fades, rasterize it.
6. **Never `setState` in an animation completion callback if the component
   unmounts right after** — one-frame layout flash.
7. **Check the units when porting thresholds between gesture systems.**
