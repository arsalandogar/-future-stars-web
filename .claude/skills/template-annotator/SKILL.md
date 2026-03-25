---
name: template-annotator
description: >
  Guide for working on the template annotator feature — the SVG annotation tool that maps
  editable fields (text, color, image) onto SVG template nodes using data-* attributes.
  Use this skill whenever the task involves: annotating templates, SVG node assignment,
  color detection/clustering/OKLAB offsets, text annotation/alignment/dimensions,
  image annotation, touch bounds, transform overlays, the detection wizard,
  the annotator store, field assignments, or any code under src/features/template-annotator/.
  Also use when working on @fs-card-engine types/utilities that feed into annotation
  (SvgJsonNode, ColorTarget, OklabOffset, vocabulary, parseTouchBounds, cloneWithStableIds).
---

# Template Annotator

The template annotator converts raw SVG designs into interactive, personalizable card templates. It does this by letting an admin select SVG elements and assign them to **editable fields** (firstName, colorOne, imageTwo, etc.), then persisting those assignments as `data-*` attributes in the SVG JSON tree.

The card engine later reads those attributes to discover what's editable and apply user-chosen values at render time.

## Architecture Overview

```
Route: /admin/templates/$id/annotate
  └─ TemplateAnnotatePage         (saves via useUpdateTemplateSvgJson)
       └─ AnnotatorPage           (layout: toolbar + tree + canvas + right panel)
            ├─ AnnotatorToolbar    (export, detect, text settings, save)
            ├─ ElementTree         (left panel — SVG node hierarchy)
            ├─ AnnotatorCanvas     (center — interactive SVG rendering)
            │   ├─ SvgRenderer     (renders SvgJsonNode tree)
            │   ├─ TouchBoundsOverlay
            │   └─ TransformOverlay
            ├─ FieldAssignmentPanel (right "Assign" tab)
            ├─ AssignmentSummaryTable (right "Review" tab)
            ├─ BulkTextSettingsPanel (text settings side panel — color areas + text color)
            ├─ DetectionWizardModal (3-step auto-detection)
            └─ ExportModal
```

**Key directories:**

- `src/features/template-annotator/` — 41+ files (components, stores, utils, types, pages)
- `packages/card-engine/src/` — shared engine (types, SVG parsing, color math, field vocabulary)

## Core Data Model

### FieldAssignment (the central type)

Each annotation is a `FieldAssignment` linking one SVG node to one editable field:

```typescript
interface FieldAssignment {
  nodeId: string; // __nodeId attribute on the SVG element
  fieldId: EditableFieldId; // e.g. 'firstName', 'colorOne', 'imageTwo'
  colorTarget?: ColorTarget; // 'fill' | 'stroke' | 'stop-color'
  colorOffset?: OklabOffset; // { deltaL, deltaA, deltaB } shade variation
  maxWidth?: number; // text bounding box width
  maxHeight?: number; // text bounding box height
  multiline?: boolean; // wrap text across lines
  touchBounds?: TouchBounds; // { x, y, width, height } interactive tap area
  textAlign?: TextAlign; // 'left' | 'center' | 'right'
  textColorArea?: EditableFieldId; // links text to a color area for fg color
}
```

### Editable Fields Vocabulary (from @fs-card-engine vocabulary.ts)

| Category       | Fields                        |
| -------------- | ----------------------------- |
| **Names**      | firstName, lastName, fullName |
| **Details**    | team, position, number        |
| **Text slots** | textOne through textThirteen  |
| **Images**     | imageOne through imageFive    |
| **Colors**     | colorOne through colorFive    |

Each field has a `type` ('text' \| 'color' \| 'image') and `label`.

### NodeMeta (per-node metadata)

Built by `buildNodeIndex()` which walks the SVG tree:

```typescript
interface NodeMeta {
  nodeId: string;
  tagName: string;
  label: string; // Human-readable (includes text preview for <text>)
  hasFill: boolean;
  hasStroke: boolean;
  hasStopColor: boolean; // true for <stop> elements in gradients
  isTextElement: boolean; // <text> or <tspan>
  isImageElement: boolean; // <image>
  parentNodeId: string | null;
  depth: number;
}
```

**Non-interactive tags** (skipped during indexing): defs, clipPath, mask, linearGradient, radialGradient, pattern, filter, fe\* elements, symbol, metadata.

## State Management (Zustand Store)

**File:** `stores/annotator-store.ts`

The store holds the SVG tree, node indices, selection state, assignments, and undo/redo stacks.

### Key state shape:

- `svgTree`, `rawSvgString`, `fileName` — loaded SVG data
- `nodeIndex: Map<string, NodeMeta>`, `nodeMap: Map<string, SvgJsonNode>` — fast lookups
- `selectedNodeId`, `hoveredNodeId` — UI selection
- `editingTouchBoundsNodeId`, `editingTransformNodeId` — overlay mode
- `expandedNodeIds: Set<string>` — tree expand state
- `assignments: FieldAssignment[]` — all current annotations
- `undoStack`, `redoStack` — max 50 entries each

### Key actions:

- **Loading:** `loadSvg()` — hydrates store with parsed SVG + pre-extracted assignments
- **Assignment:** `assignField()`, `removeAssignment()` — single node
- **Bulk:** `bulkAssignColors()`, `bulkAssignTexts()`, `bulkAssignImages()` — from detection wizard
- **Text:** `setTextDimensions()`, `commitTextAreaResize()`, `setTextAlign()`, `setTextMultiline()`, `setTextColorArea()`, `setTextFillColor()`, `setFontSize()`
- **Transform:** `rotateNode()`, `commitNodeTransform()`, `resetNodeTransform()`, `removeNodeScale()`
- **Touch bounds:** `commitTouchBounds()`, `removeTouchBounds()`
- **Bulk editing:** `setBulkTouchBoundsEditing()`, `setBulkTransformEditing()` — for text settings panel
- **Node ops:** `deleteNode()`, `undo()`, `redo()`

### Assignment rules:

- **Colors:** One color field per node, but same color field can appear on multiple nodes
- **Text/Image:** One field per node AND one node per field (1:1 mapping)

### Undo entry types:

`assignments` | `transform` | `deleteNode` | `textAreaResize` | `textAlignChange` | `fontSizeChange`

## Complete Annotation Flow

### 1. SVG Loading

**From API (existing template):**
Route loader fetches SVG JSON → `loadSvgJson()` in `svg-json-loader.ts`:

1. `cloneWithStableIds(svgJson)` — adds `__nodeId` to every element node (nanoid)
2. `sanitizeSvgFontFamilies()` — normalize font names
3. `buildNodeIndex(tree)` → nodeIndex + nodeMap
4. `extractAssignments(nodeMap)` — reads existing `data-*` attrs back into FieldAssignment[]
5. `stripAnnotationAttrs(tree)` — removes data-\* so the working copy is clean
6. `useAnnotatorStore.getState().loadSvg(...)` — hydrates store

**From file upload:**
`useSvgFileReader` hook → `parseSvgString()` → same `cloneWithStableIds` + `buildNodeIndex` flow

### 2. Auto-Detection (Detection Wizard)

Auto-opens when SVG loaded with zero assignments. Three steps:

**Color step:**

1. `extractSvgColors(nodeMap)` — scans fill, stroke, stop-color attributes
2. `extractColorClusters(nodeMap, threshold)` — perceptual clustering in OKLAB space
3. User maps each cluster → colorOne/Two/Three etc.
4. → `bulkAssignColors()` creates assignments with per-member OKLAB offsets

**Text step:**

1. `extractSvgTexts(nodeMap)` — finds `<text>` elements (skips child `<tspan>`)
2. User maps each text → firstName/lastName/team etc.
3. → `bulkAssignTexts()`

**Image step:**

1. `extractSvgImages(nodeMap)` — finds `<image>` elements with href
2. User maps each image → imageOne/Two etc.
3. → `bulkAssignImages()`

### 3. Manual Assignment

1. Click SVG element on canvas → `selectNode()`
2. Right panel shows compatible fields via `isFieldCompatible()`
3. User picks field; for colors, picks color target (fill/stroke)
4. → `assignField()` adds to assignments array

### 4. Saving (Export)

`buildAnnotatedSvg(svgTree, assignments)`:

1. `structuredClone(svgTree)` — deep clone
2. Walk tree, inject `data-*` attributes per assignment
3. `stripInternalAttrs()` — removes `__nodeId` and other `__*` prefixed attrs
4. Result is clean SVG JSON ready for API

Injected attributes:

```
data-text-field="firstName"     data-color-field="colorOne"     data-image-field="imageOne"
data-color-target="fill"        data-color-offset="0.05,-0.02,0.01"
data-max-width="200"            data-max-height="40"
data-text-multiline="true"      data-text-align="center"
data-touch-bounds="100,50,200,100"
data-text-color-area="colorOne"
```

## Color System

For detailed color math reference, read `references/color-system.md`.

**Key concepts:**

- Colors are detected from SVG fill/stroke/stop-color attributes
- Colors are normalized to 6-digit lowercase hex (CSS named colors, rgb(), shorthand hex all handled)
- **OKLAB offsets** allow shade variations: when a team color is applied, each node gets the base color + its specific offset. This preserves lighter/darker shade relationships from the original design.
- Offsets are **hue-preserving** — the a/b delta is projected onto the base color's chromaticity direction
- **Clustering** uses agglomerative hierarchical clustering with a perceptual threshold (default 30, configurable via slider)
- `ColorTarget`: 'fill' (most common) | 'stroke' | 'stop-color' (gradient stops)

## Text System

For detailed text handling reference, read `references/text-system.md`.

**Key concepts:**

- Only parent `<text>` elements are annotated (child `<tspan>` are skipped)
- `maxWidth`/`maxHeight` are measured in the text's **local coordinate space** (transform stripped)
- Text alignment maps: left↔start, center↔middle, right↔end (text-anchor attribute)
- **Kerned tspans:** When changing alignment, individually positioned tspans (from Illustrator exports) are collapsed into a single text node to prevent garbling
- **Computed text-anchor** is read via `getComputedStyle()` to handle CSS `<style>` blocks and inheritance
- The card engine's text compression system handles font-aware fitting at render time

## Transform & Geometry

For detailed transform handling reference, read `references/transforms.md`.

**Key concepts:**

- SVG transforms compose right-to-left (prepend = apply after existing)
- `getElementGeometryInSvgRoot()` uses live DOM CTM for accurate measurements
- **Rotated parent groups** are handled via matrix conjugation: `svgToParent * svgOp * svgToParent⁻¹`
- `computeSvgToParent()` gives the matrix from SVG root → element's parent space
- `ownRotation` vs `rotation`: own = element's transform only; rotation = total including parents
- Scale triplets from `applyScaleAroundPoint()`: `translate(ax,ay) scale(sx,sy) translate(-ax,-ay)`
- `removeScaleFromTransform()` detects and strips these triplets

## Touch Bounds

Interactive tap areas for text and image fields on the final card.

- Supported for text and image field types only (`supportsTouchBounds()`)
- Auto-initialized from element's bounding box on double-click (`ensureTouchBounds()`)
- Overlay has 8 resize handles (nw, n, ne, e, se, s, sw, w) with drag-to-move
- Coordinates are in SVG viewBox space
- Serialized as `"x,y,width,height"` string in `data-touch-bounds` attribute

## Text-to-Color-Area Linking (Foreground Colors)

Connects text elements to color areas so team color palettes can apply the correct foreground color to text sitting on each colored area.

### How it works

1. **In the annotator:** Each text assignment can have a `textColorArea` linking it to a color field (e.g., `textColorArea: 'colorOne'`)
2. **Persisted as:** `data-text-color-area="colorOne"` attribute on the text SVG element
3. **At render time:** `withPresetTextColors(textFields, colorFields, colorPairs)` applies `fg` color from the matching `ColorPair` to the text element's fill

### Data flow

```
Annotator → data-text-color-area="colorOne" on <text> node
Card Engine → discoverEditableTextFields() reads it into EditableTextField.textColorArea
Team Colors → withPresetTextColors() finds colorOne's index, applies colorPairs[index].fg as text fill
```

### Key files

- `FieldAssignment.textColorArea` — annotator-side storage
- `EditableTextField.textColorArea` — card-engine-side discovery
- `withPresetTextColors()` in `edit-operations.ts` — applies fg colors at render time
- `data-text-color-area` constant in `export-annotated-svg.ts`

### Bulk Text Settings Panel

`BulkTextSettingsPanel` (`components/bulk-text-settings-modal.tsx`) is a side panel (replaces the right panel when active) toggled via the Palette icon in the toolbar. It provides:

- **Color area assignment** for all text fields at once, with color swatches showing each area's color
- **Auto-detect** button that uses spatial overlap (bounding boxes) to guess which color area each text sits on
- **Text color picker** to set each text element's default fill color
- **Bulk touch bounds / transform editing** modes

### Team Colors Integration

`ColoredTemplateThumbnail` receives full `ColorPair[]` (not just bg strings) and calls:

```typescript
const bgColors = colorPairs.map((p) => p.bg);
const edits = withPresetColors({}, fields.colorFields, bgColors);
withPresetTextColors(fields.textFields, fields.colorFields, colorPairs);
applyEditsForRender(fields, edits);
```

The `ColorPair { bg, fg, rank }` type is from `src/features/color-palettes/types/`.

## @fs-card-engine Dependencies

The template annotator imports these from `@fs-card-engine`:

| Import                       | Purpose                                            |
| ---------------------------- | -------------------------------------------------- |
| `cloneWithStableIds`         | Deep-clone SVG tree + assign `__nodeId` via nanoid |
| `parseTouchBounds`           | Parse `"x,y,w,h"` string → TouchBounds object      |
| `CARD_WIDTH/HEIGHT`          | 750×1050 safe zone dimensions                      |
| `CARD_BLEED_WIDTH/HEIGHT`    | 833.34×1133.34 with print bleeds                   |
| `hasBleeds`, `getCardBounds` | Viewport/bounds calculations                       |
| `withPresetTextColors`       | Apply fg colors from palette pairs to linked text  |

Types re-exported through `src/types/svg.ts`:

- `SvgJsonNode` (= svgson's `INode`)
- `ColorTarget`
- `TouchBounds`
- `OklabOffset`

Color math re-exported through `src/utils/color-math.ts`:

- `clusterColors`, `computeOklabOffset`, `applyOklabOffset`
- `serializeOffset`, `parseOffset`, `isZeroOffset`
- `colorDistance`, `ColorCluster`, `ClusterMember`

## File Map

### Pages & Route

- `pages/template-annotate-page.tsx` — Wraps AnnotatorPage, handles save mutation
- `pages/annotator-page.tsx` — Main layout with 4 panels + modals
- `routes/_authenticated/admin/templates/$id/annotate.tsx` — Route loader

### Store

- `stores/annotator-store.ts` — Zustand store (~500 lines)

### Types

- `types/index.ts` — FieldAssignment, NodeMeta, DetectedColor/Text/Image, TextAlign

### Core Utils

- `utils/export-annotated-svg.ts` — `buildAnnotatedSvg()`, data-\* constants
- `utils/extract-assignments.ts` — `extractAssignments()` reads data-\* back
- `utils/svg-json-loader.ts` — `loadSvgJson()` hydration from API
- `utils/svg-node-helpers.ts` — `buildNodeIndex()`, `isFieldCompatible()`, node type checks
- `utils/extract-svg-colors.ts` — `extractSvgColors()`, `extractColorClusters()`
- `utils/extract-svg-texts.ts` — `extractSvgTexts()`
- `utils/extract-svg-images.ts` — `extractSvgImages()`

### Color & Text Utils

- `utils/node-color-helpers.ts` — `getTextFillColor()`, `getNodeColor()` for extracting colors from SVG nodes
- `utils/detect-foreground-colors.ts` — Spatial overlap detection (text center inside color element bounds)

### Geometry & Transform Utils

- `utils/get-element-bbox.ts` — `getElementGeometryInSvgRoot()`, `computeSvgToParent()`
- `utils/svg-transform-helpers.ts` — Transform math (translate, scale, rotate, conjugate)
- `utils/svg-overlay-helpers.ts` — Handle cursors, resize deltas, coordinate conversions
- `utils/measure-text-bounds.ts` — Offscreen SVG measurement

### Hooks

- `hooks/use-color-area-options.ts` — Builds `ColorAreaOption[]` with bg/fg hex for color area selects
- `hooks/use-element-bounds.ts` — Element bounding box calculations
- `hooks/use-svg-file-reader.ts` — File upload parsing

### Components

- `components/annotator-canvas.tsx` — SVG rendering + click/hover + overlays
- `components/field-assignment-panel.tsx` — Right panel field picker
- `components/detection-wizard-modal.tsx` — 3-step auto-detection
- `components/fg-color-substep.tsx` — Detection wizard sub-step for setting default foreground colors
- `components/bulk-text-settings-modal.tsx` — Bulk text settings side panel (color areas, text color, auto-detect)
- `components/color-area-select.tsx` — Dropdown to link a text field to a color area
- `components/color-area-preview-list.tsx` — Color area palette preview with BG/FG swatches
- `components/transform-controls.tsx` — Per-node text controls (alignment, font size, multiline, color area select)
- `components/element-tree.tsx` — Left panel node hierarchy
- `components/touch-bounds-overlay.tsx` — Touch bounds editing
- `components/transform-overlay.tsx` — Scale/rotate/move editing
- `components/svg-upload-dropzone.tsx` — File/paste input

## Common Tasks

### Adding a new editable field type

1. Add to `EDITABLE_FIELDS` in `packages/card-engine/src/vocabulary.ts`
2. The annotator auto-discovers it via the vocabulary — field picker groups by type
3. Add discovery in card-engine's `svg-editable-fields.ts` if it needs custom rendering logic

### Adding a new data-\* annotation attribute

1. Add constant in `utils/export-annotated-svg.ts` (e.g., `DATA_ATTR_NEW_THING`)
2. Add to `ALL_ANNOTATION_ATTRS` array
3. Write it in `buildAnnotatedSvg()` → `injectAttributes()`
4. Read it back in `utils/extract-assignments.ts` → `extractAssignments()`
5. Add field to `FieldAssignment` type if needed
6. Add corresponding discovery in card-engine's `discoverEditable*Fields()`

### Debugging transform issues

1. Check `getElementGeometryInSvgRoot()` — it uses live DOM CTM
2. Distinguish `rotation` (total) from `ownRotation` (element's own)
3. For elements in rotated `<g>` groups, use `computeSvgToParent()` + `conjugateTransform()`
4. SVG elements need `data-node-id` attribute in DOM for querySelector to find them

### Debugging color clustering

1. `extractSvgColors()` handles normalization (named colors, rgb(), hex variants)
2. Skipped values: none, inherit, currentcolor, transparent, url()
3. `extractColorClusters()` uses OKLAB perceptual distance (0-100 scale)
4. Default threshold: 30. Lower = more clusters, higher = fewer
