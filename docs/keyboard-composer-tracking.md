# Keyboard Tracking, the Composer & Reanimated Layout Props

> **Status**: Working (July 2026)
> **Files**: `CommentSheet.tsx`
> **Read this before**: animating anything against the keyboard, or adding
> animated styles to a component that lives inside the comment sheet.

---

## ⚠️ The rule that matters most

> **Animating a LAYOUT prop is a fundamentally different operation from
> animating a transform, even though the Reanimated API looks identical.**

| Style being animated | How it is applied | Cost |
|---|---|---|
| `transform`, `opacity` | Purely on the UI thread | Free — never touches React |
| `paddingBottom`, `bottom`, `width`, `height`, `margin*` | Requires a **shadow-tree commit** per update | Commits contend with every other animation in that tree |

This bit us for real: animating the composer's `paddingBottom` **visibly
regressed the comment sheet's open animation**. The composer is mounted for the
sheet's entire life, so its layout commits landed *during* the sheet's spring
and fought it for the same commit pipeline. Fixing one animation broke another,
several components away.

**The fix**: keep a *static* `paddingBottom` and ride upward on `translateY`.
Identical visual result, zero layout cost.

```tsx
// ❌ regressed the sheet's open animation
useAnimatedStyle(() => ({ paddingBottom: composerPadSV.value }))

// ✅ pure UI thread
useAnimatedStyle(() => ({
  transform: [{ translateY: -(composerPadSV.value - baseComposerPad) }],
}))
```

The gap the lifted composer leaves beneath itself is `#FFFFFF` on the
`#FFFFFF` sheet surface — invisible. The list no longer shrinks, but the scrim
already covers the whole list area while the keyboard is up, so nothing
readable is lost.

---

## Why the composer used to lag

`useKeyboardState` subscribes to exactly two events:

```js
const EVENTS = ["keyboardDidShow", "keyboardDidHide"];
```

Both are **`Did`** — they fire *after* the keyboard has finished animating. So
the composer held still for the entire ~300ms keyboard animation and then
snapped into place. On dismiss it was the mirror image: the keyboard vanished
while the composer sat up, then dropped.

It was never "a bit slow" — it was **doing nothing at all** for the whole
animation, then jumping.

**The fix**: read the keyboard height from a SharedValue updated every frame on
the UI thread, and keep the *exact same formula* so settled positions are
provably unchanged:

```tsx
const composerPadSV = useDerivedValue(() => {
  if (composerFrozenSV.value) return frozenComposerPadSV.value;
  return kbHeightSV.value > 0 ? kbHeightSV.value + 8 : baseComposerPad;
}, [baseComposerPad]);
```

---

## Hook choice: `useGenericKeyboardHandler`, not `useReanimatedKeyboardAnimation`

> `useReanimatedKeyboardAnimation()` **sets Android's resize mode on mount.**

This app already declares `android:windowSoftInputMode="adjustResize"` in
`AndroidManifest.xml`, so that hook makes the library re-assert a mode we have
already configured — a global side effect, app-wide, for no benefit.

`useGenericKeyboardHandler` is documented as the hook for exactly this case:
apps already on `adjustResize`.

```tsx
const kbHeightSV = useSharedValue(0);   // positive px

useGenericKeyboardHandler({
  onMove: (e) => { "worklet"; kbHeightSV.value = e.height; },
  onEnd:  (e) => { "worklet"; kbHeightSV.value = e.height; },
}, []);
```

**Sign convention warning**: `useReanimatedKeyboardAnimation()` reports height
as **negative** while raised (`heightSV.value = -event.height`), because it is
designed to be dropped straight into `translateY`. `useGenericKeyboardHandler`'s
`e.height` is **positive**. Don't mix them up.

---

## The close freeze (do not remove)

While the sheet is closing, the composer must **stop tracking** and hold its
last position:

```tsx
// in closeSheet()
frozenComposerPadSV.value = composerPadSV.value;
composerFrozenSV.value = true;
```

`closeSheet` calls `KeyboardController.dismiss()`, so without this the composer
would chase the dismissing keyboard downward *while the sheet is also animating
out* — two movements at once. This is the same "bottom hang" the original
`frozenBottom` ref existed to prevent (see
`comment-sheet-drag-physics.md`); it now snapshots the live animated value
instead of the last known keyboard height.

Reset it when the sheet becomes visible again.

---

## Keyboard state survives backgrounding — via the manifest, not JS

Minimise the app with the reply keyboard open, return, and it is still open.
There is **no JS implementing this**. It comes from:

```xml
android:configChanges="keyboard|keyboardHidden|orientation|screenSize|screenLayout|uiMode"
android:launchMode="singleTask"
android:windowSoftInputMode="adjustResize"
```

`configChanges` including `keyboard|keyboardHidden` stops Android recreating the
Activity on keyboard changes; `singleTask` resumes the same instance.

**Implication**: JS changes in `CommentSheet` cannot break this. Equally, don't
try to "fix" keyboard persistence in JS — look at the manifest first.

---

## Gotchas

1. **Renaming a shared value that a worklet captures requires a Metro cache
   clear.** Worklets are Babel-transformed and cached; Fast Refresh will swap
   the module but keep the stale worklet, producing a runtime
   `Property 'X' doesn't exist` for a symbol that no longer exists anywhere in
   source. `tsc` passes, `grep` finds nothing — and it is still broken. Fix:
   stop Metro, `npx expo start -c`, full reload (not Fast Refresh).
2. **The scrim still mounts on `keyboardVisible`**, which is a `Did` event, so
   the blur can pop in slightly late. Left deliberately — it's a mount gate, not
   a position. Fix by mounting it earlier and driving opacity from keyboard
   progress.
3. **The "Replying to" indicator still uses `LayoutAnimation`**, which is
   unreliable on Fabric/New Architecture. If it reads as janky, that's why —
   Reanimated layout transitions are the replacement.
4. **`composerPadSV` is read by the pan gesture's composer-zone detection**, so
   it must be declared *above* the pan handlers. Declaring it lower down throws
   a temporal-dead-zone `ReferenceError` at render, which `tsc` will not catch.

---

## Related

- `comment-sheet-drag-physics.md` — sheet architecture, drag/close physics,
  overlay timing and docking. Rewritten for the Reanimated architecture.
- `media-orientation-and-docking.md` — `layout` vs `aspectRatio`, and how
  landscape posts dock differently.
