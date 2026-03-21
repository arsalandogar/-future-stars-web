# Text System Reference

## Text Detection

**File:** `utils/extract-svg-texts.ts`

### How text nodes are found

`extractSvgTexts(nodeMap)`:

1. First pass: collect IDs of `<tspan>` nodes whose parent `<text>` is also in nodeMap → `childTspanIds`
2. Second pass: for each node that `isTextNode()` and is NOT in childTspanIds:
   - Get text content via `collectTextContent()` (recursive)
   - Skip if empty
   - Return `{ nodeId, textContent, tagName }`

**Why skip child tspans:** Design tools (Illustrator, Figma) export text with many individual `<tspan>` children. Annotating the parent `<text>` captures all of them — annotating individual tspans would be redundant and fragile.

### Text content collection

`collectTextContent(node)` in `svg-node-helpers.ts`:

- If `node.type === 'text'` (svgson text node, not SVG `<text>`): return `node.value`
- Otherwise: recursively join children's text content

## Text Dimensions

**File:** `utils/measure-text-bounds.ts`

### Why dimensions matter

`maxWidth` and `maxHeight` tell the card engine how much space a text field has. The engine's text compression system uses these to fit text by adjusting letter-spacing, adding line breaks, or scaling.

### How text is measured

`measureTextBounds(textNode, svgTree)`:

1. Creates offscreen SVG element with matching viewBox
2. Converts `SvgJsonNode` to real SVG DOM element
3. **Strips the element's transform** — dimensions are in local text space, not rendered space
4. Appends to document, calls `getBBox()`
5. Returns `{ width, height }` (rounded integers)

### Local text bounds for rotated elements

`measureLocalTextBounds()` in `get-element-bbox.ts`:

- Clones the text element and removes its transform
- Copies computed font properties (font-size, font-family, font-weight, font-style) from live DOM
- Copies `<style>` elements from source SVG so CSS rules apply
- Measures in offscreen SVG

### Dimension normalization for 90/270 rotations

`normalizeImportedTextAreaDimensions()` in `svg-transform-helpers.ts`:

When a text element is rotated 90 or 270 degrees, the stored width/height might correspond to either the element's local frame or its rendered (axis-aligned) frame. This function detects which and swaps if needed:

1. Compare stored dimensions to rendered bounds and local bounds
2. If stored is closer to rendered bounds (which are swapped due to rotation), swap width/height
3. Otherwise keep as-is

## Text Alignment

### Mapping

```typescript
const ALIGN_TO_TEXT_ANCHOR = { left: 'start', center: 'middle', right: 'end' };
const TEXT_ANCHOR_TO_ALIGN = { start: 'left', middle: 'center', end: 'right' };
```

### How alignment is read

`getComputedTextAnchor(nodeId)` in `svg-overlay-helpers.ts`:

1. Queries live DOM for element with `data-node-id`
2. Uses `getComputedStyle(el).getPropertyValue('text-anchor')`
3. Returns 'start' | 'middle' | 'end'

This handles CSS `<style>` blocks, inheritance from parent `<g>`, inline styles, and SVG attributes.

### How alignment is changed

`setTextAlign()` in the store:

1. Snapshots current state: `snapshotTextAlign(node, computedAnchor)` — saves text-anchor, x, and children
2. **Collapses kerned tspans:** If the `<text>` has multiple `<tspan>` children with individual positioning (common in Illustrator exports), they are collapsed into a single text node. This prevents garbled text when the anchor point changes.
3. Sets new `text-anchor` attribute on the `<text>` element
4. Pushes `textAlignChange` undo entry with snapshot for rollback

### Kerned tspan handling

Design tools often export text like:

```xml
<text><tspan x="10">H</tspan><tspan x="22">e</tspan><tspan x="33">l</tspan>...</text>
```

Each character has an individual x position (kerning). Changing text-anchor on such elements garbles the text because the x positions are relative to the original anchor. The store detects this pattern and collapses all tspans into one text node with the combined content.

The original children are preserved in the undo snapshot, so undo restores the kerned structure.

## Text Multiline

`setTextMultiline()` toggles the `multiline` flag on a FieldAssignment.

When multiline is true:

- `data-text-multiline="true"` is written to the SVG
- The card engine's text compression system will wrap text across lines when it exceeds `maxWidth`
- Uses `MULTILINE_ATTR = 'data-text-multiline'` constant in card-engine

## Font Size

`setFontSize()` in the store:

1. Reads current `font-size` attribute and `style` attribute
2. Sets new font-size as attribute, also strips any `font-size` from inline style
3. Pushes `fontSizeChange` undo entry

## Text Data Attributes

```
data-text-field="firstName"
data-max-width="200"
data-max-height="40"
data-text-multiline="true"        (omitted if false)
data-text-align="center"          (omitted if not set)
```

## Card Engine Text Compression

At render time, `@fs-card-engine/text-compression.ts` handles fitting text into annotated dimensions:

1. Resolves fonts via `FontResolver` (family + weight + style → font data)
2. Measures text width using opentype.js glyph metrics
3. If text exceeds `maxWidth`:
   - Applies letter-spacing compression
   - If multiline: adds line breaks
   - If still too wide: scales text down
4. Returns stats: `{ compressedCount, wrappedCount, modifiedCount, warningCount }`
