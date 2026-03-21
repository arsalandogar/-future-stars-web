# Color System Reference

## Color Detection

**File:** `utils/extract-svg-colors.ts`

### How colors are found

`extractSvgColors(nodeMap)` iterates every node in the nodeMap:

- For `<stop>` elements → checks `stop-color` attribute
- For all other elements → checks `fill` and `stroke` attributes
- Both inline attributes and `style` property values are checked (via `getStyleProp()`)

### Color normalization

`normalizeColor(raw)` converts any CSS color to 6-digit lowercase hex:

| Input format                  | Example                | Normalized |
| ----------------------------- | ---------------------- | ---------- |
| CSS named color               | `black`                | `#000000`  |
| 3-digit hex                   | `#fff`                 | `#ffffff`  |
| 4-digit hex (alpha discarded) | `#fffa`                | `#ffffff`  |
| 6-digit hex                   | `#FF0000`              | `#ff0000`  |
| 8-digit hex (alpha discarded) | `#ff0000ff`            | `#ff0000`  |
| rgb()                         | `rgb(255, 0, 0)`       | `#ff0000`  |
| rgba()                        | `rgba(255, 0, 0, 0.5)` | `#ff0000`  |

**Skipped values** (return null): `none`, `inherit`, `currentcolor`, `transparent`, `url(...)`.

60+ CSS named colors are mapped (black, white, red, green, blue, yellow, cyan, magenta, gray, silver, maroon, olive, lime, aqua, teal, navy, fuchsia, purple, orange, pink, brown, coral, crimson, etc.)

### Return format

Returns `DetectedColor[]` sorted by occurrence count (most frequent first):

```typescript
{ hex: string, occurrences: { nodeId: string, colorTarget: ColorTarget }[] }
```

## Color Clustering

**File:** `utils/extract-svg-colors.ts` (calls `clusterColors` from `@fs-card-engine`)

### How clustering works

`extractColorClusters(nodeMap, threshold?)`:

1. Calls `extractSvgColors()` to get all unique colors
2. Passes to `clusterColors(detectedColors, threshold)` from card-engine
3. Returns `ColorCluster[]`

### Agglomerative clustering algorithm (in card-engine `color-math.ts`)

1. Each unique color starts as its own cluster
2. Find the two closest clusters (by OKLAB Euclidean distance)
3. If distance < threshold, merge them (base = most-frequent member)
4. Repeat until no pair is closer than threshold
5. Compute OKLAB offsets for each member relative to cluster base

**Distance scale:** Raw OKLAB Euclidean (~0-0.5) is multiplied by 200 to give 0-100 for the UI slider.

**Default threshold:** 30 (0-100 scale)

### ColorCluster output

```typescript
interface ColorCluster {
  baseHex: string; // Most-frequent color in cluster
  members: ClusterMember[];
}
interface ClusterMember {
  hex: string;
  offset: OklabOffset; // { deltaL, deltaA, deltaB } relative to baseHex
  occurrences: { nodeId: string; colorTarget: ColorTarget }[];
}
```

## OKLAB Offset System

The offset system allows shade variations to survive color changes. When a user picks a new team color, each node gets `applyOklabOffset(newColor, storedOffset)`.

### Computing offsets

`computeOklabOffset(baseHex, shadeHex)` → `{ deltaL, deltaA, deltaB }`:

- Converts both to OKLAB color space
- Returns the component-wise difference

### Applying offsets (hue-preserving)

`applyOklabOffset(baseHex, offset)`:

1. **Lightness:** Always applied directly. `newL = clamp(base.l + deltaL, 0, 1)`
2. **Chromaticity (a/b):** Projected onto base color's chromaticity direction
   - Gets base color's chroma angle: `ua = baseA/chroma`, `ub = baseB/chroma`
   - Projects offset: `proj = deltaA * ua + deltaB * ub`
   - Applies along same direction: `newA = baseA + proj * ua * chromaFactor`
   - **Attenuation:** For near-achromatic colors (chroma < 0.03), chromatic shifts are smoothly reduced to prevent grays/whites gaining unwanted color tints
3. **Achromatic colors** (chroma ≈ 0): Only lightness is modified, a/b unchanged

### Serialization

- `serializeOffset(offset)` → `"0.05,-0.02,0.01"` (4 decimal precision)
- `parseOffset(raw)` → `{ deltaL, deltaA, deltaB }` or null
- `isZeroOffset(offset)` → true if all deltas < 1e-4 (not stored in data-\* attrs)

## Color Assignment in the Store

### Single assignment (`assignField()`)

For color fields:

- One color field per node (replaces existing if same node)
- Same color field can appear on multiple nodes
- `colorTarget` defaults to 'fill'; can be 'stroke' or 'stop-color'

### Bulk assignment (`bulkAssignColors()`)

From detection wizard:

- Input: `{ fieldId, members: ClusterMember[] }[]`
- Creates one FieldAssignment per member occurrence
- Stores per-member `colorOffset` (OKLAB delta from cluster base)
- Zero offsets are not stored (saved as undefined, omitted from data-\* attrs)

### Data attributes produced

```
data-color-field="colorOne"
data-color-target="fill"           (omitted if not set)
data-color-offset="0.05,-0.02,0.01"  (omitted if zero)
```
