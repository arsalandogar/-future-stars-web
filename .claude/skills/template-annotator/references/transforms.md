# Transform & Geometry Reference

## SVG Transform Fundamentals

SVG transforms compose right-to-left. When we "prepend" a transform (e.g., `translate(10,20) existing-transform`), the prepended operation applies **after** all existing transforms in rendering order.

All transform helper functions in `svg-transform-helpers.ts` prepend to an existing transform string.

## Transform Helper Functions

**File:** `utils/svg-transform-helpers.ts`

### Basic operations

```typescript
applyTranslate(existing, dx, dy);
// → "translate(dx,dy) existing"

applyScaleAroundPoint(existing, ax, ay, sx, sy);
// → "translate(ax,ay) scale(sx,sy) translate(-ax,-ay) existing"
// Scales relative to anchor point (ax, ay)

applyRotateAroundPoint(existing, angleDeg, cx, cy);
// → "rotate(angleDeg,cx,cy) existing"

applyMatrixPrepend(existing, matrix);
// → "matrix(a,b,c,d,e,f) existing"
```

### Scale removal

`removeScaleFromTransform(transform)`:

- Tokenizes transform string into individual functions
- Detects scale triplets: `translate(ax,ay) scale(sx,sy) translate(-ax,-ay)`
  - Verified by checking the two translates are inverse (sum < 0.001)
- Also removes bare `scale()` calls
- Returns remaining transforms joined, or undefined if empty

### Scale parsing

`parseScaleValues(transform)` → `{ sx, sy } | null`

- Extracts first `scale(sx, sy)` from transform string
- If only one value, `sy = sx` (uniform scale)

## Coordinate Space Conversions

### Point/vector transforms

```typescript
transformPoint(matrix, x, y); // Full affine transform (translation + rotation + scale)
transformVector(matrix, dx, dy); // Linear part only (no translation) — for deltas
```

### Conjugation (space conversion)

`conjugateTransform(svgToParent, svgOp)`:

- Converts an operation defined in SVG root space to the element's parent space
- Formula: `svgToParent * svgOp * svgToParent⁻¹`
- Used when an element is inside a rotated `<g>` group — operations need to be expressed in the parent's coordinate system

### Transform basis

`getTransformBasis(matrix)` → `{ rotation }`:

- Extracts rotation angle from a DOMMatrix
- Uses `atan2` of the x-axis direction vector
- Normalized to 0-360 degrees

## Element Geometry

**File:** `utils/get-element-bbox.ts`

### getElementGeometryInSvgRoot(svgEl, nodeId)

Returns comprehensive geometry for an SVG element:

```typescript
interface ElementGeometryInSvgRoot {
  bounds: TouchBounds; // Axis-aligned bounding box in SVG root space
  localBounds: TouchBounds; // Unrotated bounds in element's own coordinate space
  localToSvg: DOMMatrix; // Transform from element space → SVG root space
  svgToLocal: DOMMatrix; // Inverse: SVG root → element space
  rotation: number; // Total rotation (including parent groups)
  ownRotation: number; // Element's own rotation only
}
```

**How it works:**

1. Queries DOM for `[data-node-id="..."]`
2. For text elements: measures local bounds via offscreen clone (strips transform, copies fonts and CSS)
3. For other elements: uses `getBBox()`
4. Gets CTM (Current Transformation Matrix) from element and SVG root
5. `localToSvg = svgCtm⁻¹ * elCtm`
6. Transforms local bounds corners through localToSvg to get axis-aligned bounds
7. Computes own rotation by factoring out parent CTM

### computeSvgToParent(svgEl, nodeId)

Returns the matrix that converts SVG root space → element's parent space:

- `parentCtm⁻¹ * svgCtm`
- Returns identity if element has no parent or parent is the SVG root
- Used by TransformOverlay to express drag/resize deltas in parent coordinates

## Rotated Parent Groups

The most complex scenario: an element sits inside a `<g transform="rotate(...)">`.

### The problem

When the user drags a resize handle on the canvas, the mouse delta is in SVG root space. But the element's transform attribute is in its parent's coordinate space. If the parent is rotated, a horizontal drag in root space becomes a diagonal in parent space.

### The solution

1. Get `svgToParent` via `computeSvgToParent()`
2. Convert the root-space operation to parent space via `conjugateTransform(svgToParent, rootSpaceOp)`
3. Apply the parent-space operation to the element's transform

For translate operations specifically, `transformVector(svgToParent, dx, dy)` is simpler than full conjugation.

## Overlay Helpers

**File:** `utils/svg-overlay-helpers.ts`

### Coordinate conversion

`clientToSvgPoint(svg, clientX, clientY)`:

- Gets SVG's screen CTM via `getScreenCTM()`
- Inverts to convert screen coordinates to SVG viewBox coordinates
- Returns `{ svgPt, ctmInverse }`

### Viewport helpers

```typescript
parseViewBox(viewBox); // "0 0 750 1050" → { x, y, width, height }
clampToViewBox(bounds, vb); // Constrain bounds within viewBox
```

### Handle system

8 resize handles: nw, n, ne, e, se, s, sw, w

`getHandleCursor(handle, rotation)`:

- Rotates the cursor direction by the element's rotation
- Snaps to nearest 45-degree increment
- Returns CSS cursor string (e.g., 'nwse-resize')

`applyResizeDelta(handle, startBounds, dx, dy)`:

- Adjusts bounds based on which handle is being dragged
- Enforces minimum size of 10 units

### SVG element query

`querySvgElement()` → finds the SVG element via `.annotator-svg-wrapper svg` selector

## Angle Helpers

`normalizeAngle(angle)`:

- Normalizes to 0-360 range
- Handles negative values

`normalizeImportedTextAreaDimensions(params)`:

- For 90/270 degree rotations, swaps width/height if the stored dimensions match rendered (rotated) bounds rather than local bounds
- Uses 1-degree tolerance for rotation detection

## Card Dimensions

From `@fs-card-engine`:

```
CARD_WIDTH = 750        CARD_HEIGHT = 1050       (safe zone)
CARD_BLEED_WIDTH = 833.34   CARD_BLEED_HEIGHT = 1133.34  (with print bleeds)
```

`hasBleeds(viewBox)` — checks if viewBox exceeds safe zone
`getCardBounds(viewBox)` — extracts safe zone from larger viewBox (centered)
