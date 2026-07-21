# Media Orientation, Aspect Ratio & Comment-Sheet Docking

> **Status**: Working (July 2026)
> **Files**: `PostCard.tsx`, `FeedScreen.tsx`
> **Read this before building**: Posting / Uploading / Clipping UI

---

## The one rule that matters

> **`layout` describes the ACTION CHROME. `aspectRatio` describes the MEDIA.
> They are completely independent. Never infer one from the other.**

This has already caused one real bug. `layout: "horizontal"` was assumed to mean
"landscape video", which broke every portrait clip that used the horizontal
action chrome — they rendered cropped and docked as wide banners.

`MOCK_POSTS[3]` is the proof: it is declared `layout: "horizontal"` and its clip
is **480 × 1070 — portrait**.

### `layout?: "vertical" | "horizontal"`

Selects how the post's controls are arranged. Nothing else.

| Value | Chrome |
|---|---|
| `"vertical"` (default) | Right-hand action rail; shows music row, location, Follow button; 34px avatar |
| `"horizontal"` | Bottom action row + Clip button; no music/location/follow; 28px avatar |

### `aspectRatio?: number`

The media's true `width / height`. **`> 1` = landscape, `<= 1` = portrait.**
Optional, but supplying it is what makes the *first* view correct.

---

## How the ratio is resolved

Two consumers, each with its own fallback chain.

**1. `PostCard` — picks `contentFit` for the media**

```
post.aspectRatio  →  mediaAspectCache.get(mediaKey)  →  "cover"
```

- `> 1` → `contentFit: "contain"` (letterboxed, nothing cropped)
- `<= 1` → `contentFit: "cover"` (fills the portrait card, edges cropped)

`mediaAspectCache` is a **module-level `Map`**, keyed by the media *source*
(`post.video ?? post.image`) rather than `post.id`. Two reasons: pagination
re-emits identical media under fresh ids, and FlashList recycles cards. Being
module-level lets it be read synchronously during render without a re-render.

**2. `FeedScreen` — picks the dock geometry**

```
mediaAspects[post.id]  →  post.aspectRatio  →  undefined (dock as portrait)
```

Measured wins here, so bad declared data self-corrects once the media loads.

**Measurement sources** (both call `reportAspect`, which writes the cache *and*
notifies FeedScreen):
- Video → `onFirstFrameRender` using `player.videoTrack.size` (authoritative)
- Image → `onLoad` using `e.source.width/height`

The video's *poster* image deliberately does **not** report — a poster's shape
often disagrees with its clip.

---

## Dock behaviour (opening the comment sheet)

| Media | Docked appearance | Transform |
|---|---|---|
| Portrait (`<= 1`) | Shrunken card, top of dock | `scaleY = dockHeight / POST_HEIGHT`, `scaleX = 0.45` ("breath width", intentionally non-uniform), centre-anchored shift |
| Landscape (`> 1`) | **Full-width banner**, top-aligned, true proportions, no shrink | uniform `scale`, pure translate so the media's *top edge* lands on `dockTop` |

Landscape posts intentionally **do not shrink** — they slide up until the media
band reaches the top of the dock. The card's black area above the media ends up
off-screen; the area below sits between the banner and the sheet.

### `LANDSCAPE_MAX_UPSCALE` (currently `1.12`)

The banner scales up toward filling the dock height to reduce the dark gap
beneath it, capped by this constant.

> **Values above `1` crop the video's left/right edges** (~6% per side at 1.12).
> Set to `1` for zero cropping at the cost of a larger gap. The sheet's top is
> fixed at 32% of screen height, so this is the only lever.

---

## What the Posting / Uploading / Clipping UI must do

**1. Capture and persist the media's real display dimensions at upload time.**
Store `aspectRatio` on the post. Without it, the first view of every clip has to
guess and may visibly flip fit once the video loads.

**2. ⚠️ Account for rotation metadata — the big trap for phone uploads.**

MP4 stores dimensions in the `tkhd` box *and* a 3×3 transform matrix. Phone
cameras very often record **1920 × 1080 with 90° rotation**, which **displays as
portrait**. Reading stored width/height alone gives the wrong orientation.

```
rotation = atan2(matrix[1], matrix[0]) in degrees
if |rotation| is 90 or 270  →  swap width and height
```

Compute `aspectRatio` from **display** dimensions, never raw stored ones.
(Both current assets happen to have rotation `0`, so this trap is *not* covered
by existing test data — user uploads will hit it.)

**3. Don't let the clipping/crop UI write `layout`.** Choosing a crop changes
`aspectRatio`. `layout` is a separate editorial choice about chrome.

**4. If clipping changes the crop, recompute `aspectRatio`** — a 16:9 clip
cropped to 1:1 must be re-declared, or the dock will misplace it.

**5. Prefer declaring the ratio over relying on measurement.** Measurement is a
correctness net, not a substitute — it only arrives after the first frame.

---

## Known asset dimensions

Parsed directly from the MP4 `tkhd` boxes:

| Asset | Stored | Rotation | Display | Aspect | Orientation |
|---|---|---|---|---|---|
| `WhatsApp Video 2026-04-29 at 12.45.35 PM.mp4` | 480×1070 | 0° | 480×1070 | 0.449 | **Portrait** |
| `WhatsApp Video 2026-04-30 at 8.44.46 PM.mp4` | 1280×720 | 0° | 1280×720 | 1.778 | **Landscape** (16:9) |

---

## Related feed geometry

- `POST_HEIGHT = feedViewportHeight - NAV_HEIGHT`, so the feed container is
  always **one nav-height taller than a single post**. It therefore always
  renders the current post *plus the top of the next one*; `BottomNav` covers
  that strip at rest.
- When docked the nav no longer covers it, so an opaque mask pinned to the
  frame's bottom `NAV_HEIGHT` hides it. **Do not remove that mask** — the next
  post bleeds into the docked card without it.
- Dock maths uses the **measured** `feedViewportHeight`, not `windowHeight`
  (they differ by the insets).

---

## Gotchas

1. **`BLACK_POSTS` in `PostCard.tsx`** replaces all media with a flat gradient.
   It masks the entire media path — orientation, fit, video recycling. Keep it
   `false` when testing anything media-related.
2. **Aspect arrives asynchronously.** With no declared `aspectRatio`, opening
   comments on a still-loading clip docks it as portrait and re-docks once
   measured.
3. **`mediaAspectCache` is never evicted.** Fine at current scale (one number
   per media source); revisit if the feed grows large.
