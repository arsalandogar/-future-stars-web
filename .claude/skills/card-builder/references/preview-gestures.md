# Preview Gestures

The `usePreviewGestures` hook attaches three gesture types to the card preview container. Gestures only activate on image fields that have a user-uploaded image (not template defaults).

## Gesture Types

### Wheel Zoom

- Sensitivity: `deltaY * 0.001`
- Clamped between `ZOOM_MIN` and `ZOOM_MAX` (from card-engine)
- Resolves field by walking DOM upward from event target

### Pointer Drag-to-Pan

- Activates on primary button (`button === 0`) only
- 3px movement threshold before drag starts (`DRAG_THRESHOLD`)
- Converts screen-pixel deltas to SVG user-units via `getSvgScale()`
- Uses `setPointerCapture()` for reliable tracking outside the element
- After drag ends, sets `wasDragRef = true` for one animation frame to suppress the click

### Touch Pinch-to-Zoom

- Activates when exactly 2 touches are detected
- Tracks distance between touch points via `Math.hypot()`
- Delta sensitivity: `0.005`
- Resets when touches drop below 2

## Field Resolution

`resolveFieldId(target, container)` walks from the event target up to the container, checking for:

1. `data-image-field-id` attribute (set by `useCardPreviewRenderOptions`)
2. Touch target rects: `data-touch-target` attribute where `data-touch-target-type === 'image'`

## Upload Check

`fieldHasUpload(fieldId)` reads the editor store directly (outside React) to check if the field's current edit value differs from its original template value. Gestures are no-ops on fields without uploads.

## SVG Scale Conversion

`getSvgScale(container)` finds the `<svg>` element, reads `viewBox.baseVal.width`, and divides by the element's `getBoundingClientRect().width`. This ratio converts screen pixels to SVG user-units for accurate panning.

## Integration with Click Handlers

The `wasDragRef` pattern prevents clicks from firing after drags:

1. On pointer-up after a drag: `wasDragRef.current = true`
2. `requestAnimationFrame` clears it after the click event fires
3. `useCardPreviewRenderOptions` checks `wasDragRef.current` before handling clicks
