# @arsalandogar/fs-card-engine

Shared card editing engine for Future Stars. It handles SVG
parsing, field discovery, text/color/image edit application,
text compression for overlong fields, and serialization on a
plain JSON SVG tree — no DOM, no React, no browser APIs. The
public helpers mutate a prepared working copy in place, while
leaving the original parsed SVG untouched. This README covers
installation, the core pipeline, template annotation, platform
integration patterns, and the full API reference.

## Card dimensions

Card templates use two sizes:

- **750 × 1050** (`CARD_WIDTH` / `CARD_HEIGHT`) — standard
  card area (safe zone)
- **833.34 × 1133.34** (`CARD_BLEED_WIDTH` /
  `CARD_BLEED_HEIGHT`) — template with bleeds (extra area
  trimmed during printing)

When a template has bleeds, its SVG viewBox is larger than
750×1050. Use `hasBleeds(vb)` to check and
`getCardBounds(vb)` to get the safe zone within a larger
viewBox. The bleed region is the border between the viewBox
edge and the 750×1050 safe zone.

## Installation

Install the package from GitHub Packages:

```bash
npm install @arsalandogar/fs-card-engine
```

Your project needs a `.npmrc` that points the `@arsalandogar` scope to
GitHub Packages:

```
@arsalandogar:registry=https://npm.pkg.github.com
```

The package requires Node 20 or later. It has no DOM dependencies and
works in Node.js, browsers, and React Native (Hermes/JSC).

## Quick start

The engine follows a parse → prepare → edit → serialize pipeline.
Here is a minimal example that changes a player's name and team
color, then produces the final SVG string:

```typescript
import {
  parseSvgSync,
  prepareTemplate,
  withColorEdit,
  applyEdits,
  applyTextCompression,
  stringifySvg,
} from '@arsalandogar/fs-card-engine';

const svgNode = parseSvgSync(templateSvgString);
const { workingCopy, fields } = prepareTemplate(svgNode);

// Build edits
let edits = {};
edits = withColorEdit(edits, fields.colorFields[0], '#E63946');
// Text fields are plain strings, so direct assignment works
edits.firstName = 'Marcus';

// Apply all edits to the working copy
applyEdits(fields, edits);
// If an image edit also stores zoom/offset, replay that with
// applyImageZoom after applyEdits.

// Optional: compress overlong text fields (requires a FontResolver)
// await applyTextCompression(workingCopy, { fontResolver });

const finalSvg = stringifySvg(workingCopy);
```

## Why this package exists

A card is created from a **template SVG** + **user edits** (text,
colors, images). Three platforms need to produce the same result
from the same inputs:

- **React web app** — live preview in the editor
- **Node.js backend** — final SVG → PNG rendering
- **React Native app** — mobile editor

Separate implementations per platform drift over time.
A color that looks right on web could render differently on the
backend. The engine is the single source of truth.

## How it works

Templates are SVG files annotated with `data-*` attributes during
the design process (handled by the template annotator). These
attributes mark which elements are editable and what type of edit
they accept:

- `data-text-field="firstName"` — editable text
- `data-color-field="colorOne"` + `data-color-target="fill"` —
  editable color
- `data-color-offset="0.05,0,-0.01"` — derived shade (OKLAB
  perceptual math)
- `data-image-field="imageOne"` — editable image

Given a template SVG and a set of edits, the engine:

1. **Parses** the SVG string into a JSON tree
2. **Discovers** editable fields by walking the tree for `data-*`
   attributes
3. **Applies** each edit — replacing text content, computing derived
   colors, swapping image URLs, and adjusting image bounds
4. **Compresses** overlong text by measuring glyph widths with
   opentype.js and applying a horizontal scale transform when text
   exceeds its `data-max-width`
5. **Serializes** the modified tree back to an SVG string

All operations work on plain JSON. `prepareTemplate` creates an
isolated working copy, and the edit helpers mutate that copy in
place. No DOM, no React, no browser APIs.

## Template annotation reference

You annotate template SVGs with `data-*` attributes so the engine
can discover editable fields. Each field type uses a different set
of attributes.

### Text fields

Add `data-text-field` to any SVG element that contains editable
text. The value must be a valid text field ID from the
vocabulary (see the [Vocabulary](#vocabulary-vocabularyts)
table below for the full list).

```xml
<text data-text-field="firstName">
  <tspan x="100" y="200">John</tspan>
</text>
```

Multiple elements can share the same field ID. When the user edits
the field, the engine updates all elements with that ID. This is
useful when the same name appears in two places on the card.

#### Text fit constraints

Add `data-max-width` to a `<text>` element to enable automatic
text fitting. The value is the maximum allowed width in SVG user
units.

```xml
<text data-text-field="firstName" data-max-width="280">
  <tspan x="100" y="200">John</tspan>
</text>
```

When `applyTextCompression` runs, it measures the rendered text
width using opentype.js and applies a horizontal `scale()`
transform if the text exceeds the limit.

Add `data-max-height` and `data-text-multiline="true"` when you
want the engine to treat a field as multiline and keep the text
inside a fixed text area:

```xml
<text
  data-text-field="firstName"
  data-max-width="280"
  data-max-height="56"
  data-text-multiline="true"
>
  <tspan x="100" y="200">John Doe</tspan>
</text>
```

When the multiline flag is present, the engine first tries to wrap
text onto multiple `<tspan>` lines that fit inside the width and
height limits. The fitter now uses one stable solver: it finds the
largest feasible final scale inside the text area, then applies a
single wrapped layout and uniform scale for that result. If
wrapping is not possible, for example because a single word exceeds
the width, the engine falls back to the single-line horizontal
`scale()` transform.

If the multiline flag is absent, the engine keeps the field
single-line and only applies the width-based horizontal scale path,
even if `data-max-height` is present.

**Limitation:** Text nodes with mixed styles (child `<tspan>` or
`<textPath>` elements that override `font-family`, `font-size`,
`font-weight`, `font-style`, or `letter-spacing`) are skipped with
an `unsupported-mixed-style` warning. Only uniform-style text
elements are compressed.

### Color fields

Add `data-color-field` to mark an element's color as editable.
Pair it with `data-color-target` to specify which CSS property the
engine writes to. Valid targets are `fill`, `stroke`, and
`stop-color`. If you omit `data-color-target`, the engine defaults
to `fill`.

```xml
<rect
  data-color-field="colorOne"
  data-color-target="fill"
  fill="#1D3557"
  width="400"
  height="600"
/>
```

For derived shades, add `data-color-offset` with a comma-separated
OKLAB offset (`deltaL,deltaA,deltaB`). When the user picks a new
base color, the engine computes each derived shade by applying the
offset in OKLAB space:

```xml
<rect
  data-color-field="colorOne"
  data-color-target="fill"
  data-color-offset="0.15,0,-0.02"
  fill="#457B9D"
/>
```

### Image fields

Add `data-image-field` to an `<image>` element. The value must be a
valid image field ID (`imageOne` through `imageFive`).

```xml
<image
  data-image-field="imageOne"
  href="https://example.com/placeholder.png"
  x="50" y="100"
  width="300" height="400"
/>
```

The engine resolves clip bounds automatically. It checks the parent
`<g>` element's `clip-path` first, then falls back to the image
element's own `clip-path`. When a user replaces the image, the
engine expands it to fill the clip rectangle so no background bleeds
through.

### Touch bounds

Add `data-touch-bounds` to the first element of a text or image
field to define a custom touch target area. The value is a
comma-separated string of `x,y,width,height` in SVG user units:

```xml
<text data-text-field="firstName" data-touch-bounds="50,180,300,60">
  <tspan x="100" y="200">John</tspan>
</text>
```

When `prepareTemplate` runs, it injects a transparent `<rect>`
for each field that has touch bounds. These rects capture pointer
and touch events without affecting the visual output. This is
useful when the visible text or image element is too small for
comfortable tapping on mobile devices.

## Core workflow

This section walks through each step of the pipeline with code
examples.

### Parse

Convert an SVG string into a `SvgJsonNode` tree. Use `parseSvgSync`
for synchronous parsing or `parseSvg` for an async alternative:

```typescript
import { parseSvgSync, parseSvg } from '@arsalandogar/fs-card-engine';

const node = parseSvgSync(svgString);
// or
const node = await parseSvg(svgString);
```

`SvgJsonNode` is a re-export of svgson's `INode` type. Each node
has `name`, `type`, `value`, `attributes`, and `children` fields.

### Prepare

Clone the parsed SVG and discover all editable fields in one call:

```typescript
import { prepareTemplate } from '@arsalandogar/fs-card-engine';

const { workingCopy, fields } = prepareTemplate(svgNode);
// fields.textFields   — EditableTextField[]
// fields.colorFields  — EditableColorField[]
// fields.imageFields  — EditableImageField[]
```

`prepareTemplate` deep-clones the SVG tree with `cloneWithStableIds`
(which assigns a unique `__nodeId` to every element) and then runs
all three discovery functions. You keep the original `svgNode`
untouched and mutate only the `workingCopy`.

After field discovery, `prepareTemplate` injects transparent
`<rect>` elements at the end of the SVG tree for every field that
has `touchBounds`. These rects have `fill="transparent"` and
`pointer-events: all` so they capture clicks and touches without
being visible. Image field targets are injected first (lower in
paint order) so that a full-card image touch area doesn't block
text field targets above it. Each rect carries `TOUCH_TARGET_ATTR`
(set to the field ID) and `TOUCH_TARGET_TYPE_ATTR` (set to
`'image'` or `'text'`).

### Edit

Build an `Edits` record and apply it to the discovered fields.
`Edits` is `Partial<Record<EditableFieldId, EditValue>>`, where
`EditValue` is either a `string` (for text and color fields) or an
`ImageEdit` object (for image fields with zoom and offset).

For interactive editors, use the immutable helpers that return a new
`Edits` object:

```typescript
import { withColorEdit, withImageEdit } from '@arsalandogar/fs-card-engine';

let edits: Edits = {};
edits = withColorEdit(edits, fields.colorFields[0], '#E63946');
edits = withImageEdit(
  edits,
  fields.imageFields[0],
  'https://cdn.example.com/photo.jpg'
);
edits.firstName = 'Marcus';
edits.team = 'Thunder FC';
```

`withColorEdit`, `withImageEdit`, and `withTextEdit` mutate the SVG
nodes in place, so your renderer picks up changes without a separate
apply step.

For image positioning, use `withZoomEdit` and `withNudgeEdit` to
update the zoom level and pan offset. Apply the visual changes to
the SVG nodes with `applyImageZoom` and `nudgeImageNodes`:

```typescript
import {
  withZoomEdit,
  withNudgeEdit,
  applyImageZoom,
  nudgeImageNodes,
} from '@arsalandogar/fs-card-engine';

edits = withZoomEdit(edits, 'imageOne', 1.5, 0, 0);
applyImageZoom(fields.imageFields[0].elementNodes, 1.5, 0, 0);

edits = withNudgeEdit(edits, 'imageOne', 10, -5);
nudgeImageNodes(fields.imageFields[0].elementNodes, 10, -5);
```

Before saving, strip edits that reference fields the template does
not have:

```typescript
import { cleanEditsForSave } from '@arsalandogar/fs-card-engine';

const cleaned = cleanEditsForSave(edits, fields);
```

To re-apply a full set of edits (for example, when rendering on the
backend), use `applyEdits`:

```typescript
import { applyEdits } from '@arsalandogar/fs-card-engine';

applyEdits(fields, edits);
```

`applyEdits` replays text edits, color edits, and the image URL from
each `ImageEdit`. It does not replay `zoom`, `offsetX`, or `offsetY`.
If you persist image positioning, call `applyImageZoom` after
`applyEdits`.

### Compress

If the template uses `data-max-width` annotations on text fields,
run `applyTextCompression` after editing to fit any text that
exceeds the maximum width:

```typescript
import { applyTextCompression } from '@arsalandogar/fs-card-engine';

const fontCache = new Map(); // reuse across calls to avoid re-parsing fonts

const result = await applyTextCompression(workingCopy, {
  fontResolver, // platform-specific — see "Platform integration"
  fontCache,
  onWarning: (w) => console.warn(w.message),
});
// result.compressedCount — number of text nodes that ended scaled
// result.wrappedCount   — number of text nodes that ended wrapped
// result.modifiedCount  — number of text nodes whose layout changed
// result.warningCount   — number of warnings emitted
```

Font resolution is async because platforms load font binaries
differently (fetch on web, `readFile` on Node.js). The `fontCache`
map stores parsed `opentype.Font` promises keyed by
`family|weight|style`, so subsequent calls skip both loading and
parsing.

### Serialize

Convert the modified SVG tree back to a string:

```typescript
import { stringifySvg } from '@arsalandogar/fs-card-engine';

const svg = stringifySvg(workingCopy);
```

## What's shared vs platform-specific

This table separates the reusable engine behavior from the
platform-specific pieces that stay outside the package.

| Shared (this package)                    | Platform-specific                  |
| ---------------------------------------- | ---------------------------------- |
| SVG parsing and serialization            | SVG → PNG rendering (backend)      |
| Field discovery from `data-*` attributes | React DOM renderer (web)           |
| Text, color, and image edit application  | react-native-svg renderer (mobile) |
| Text compression and font matching       | Font file loading and registry     |
| OKLAB perceptual color math              | Zustand stores and UI components   |
| Field vocabulary and types               | Image upload and cropping          |

## Platform integration

The engine operates on a mutable working SVG tree stored as plain
JSON. Each platform wraps that behavior with its own state
management, rendering, and I/O layer. This section documents the
patterns used by the React web app and outlines how the backend and
React Native platforms integrate.

### React web app

The web editor uses Zustand for state and `createElement` for
rendering. The key patterns are described below.

#### Store structure

A Zustand store holds the engine state for both the front and back
sides of the card. Each side tracks the mutable `workingCopy` tree,
the discovered fields, the accumulated `edits` record, and a
`revision` counter:

```typescript
import { create } from 'zustand';
import {
  type SvgJsonNode,
  type Edits,
  type EditableTextField,
  type EditableColorField,
  type EditableImageField,
  prepareTemplate,
  applyEdits,
} from '@arsalandogar/fs-card-engine';

interface SideState {
  workingCopy: SvgJsonNode | null;
  editableFields: EditableTextField[];
  editableColorFields: EditableColorField[];
  editableImageFields: EditableImageField[];
  edits: Edits;
  revision: number;
}
```

When a template SVG arrives (from the API as a parsed JSON tree),
the store calls `prepareTemplate` to clone it and discover fields.
If the user already had edits from a previous session, the store
re-applies them with `applyEdits`:

```typescript
const { workingCopy, fields } = prepareTemplate(svgNode);
applyEdits(fields, previousEdits);
```

This restore path reapplies text, colors, and image URLs. If you also
persist image zoom or pan, replay those values separately with
`applyImageZoom` after `applyEdits`.

#### Triggering re-renders

The engine mutates the `SvgJsonNode` tree in place. React doesn't
detect in-place mutations on an unchanged object reference, so the
store bumps a `revision` counter after every edit. The preview
component passes `revision` through to `SvgRenderer`, which forces a
normal re-render without remounting the whole SVG tree:

```tsx
const revision = useCardEditorStore((s) => s.sides[s.activeSide].revision);

<SvgRenderer revision={revision} node={workingCopy} />;
```

Every store method that calls an engine mutation function (for
example, `applyTextEdit`, `applyColorEdit`, `applyImageZoom`)
must also commit a new `revision` to trigger the re-render.

#### SVG rendering

The web app renders the `SvgJsonNode` tree to React elements using
`createElement`. The renderer walks the tree recursively, converts
SVG attributes to React-compatible props, and uses the `__nodeId`
attribute (assigned by `cloneWithStableIds`) as the React `key` for
each element:

```typescript
function renderNode(node: SvgJsonNode, index: number): ReactNode {
  if (node.type === 'text') return node.value;

  const key = node.attributes['__nodeId'] ?? `${node.name}-${index}`;
  const props = { ...toReactAttributes(node.attributes), key };
  const children = node.children.map((child, i) => renderNode(child, i));

  return createElement(node.name, props, ...children);
}
```

The renderer also accepts a `getNodeProps` callback. The card
builder uses this to inject `data-image-field-id` attributes onto
image elements so the gesture system can identify which field the
user is interacting with.

#### Editing patterns

Store methods wrap engine functions and commit the result. Each
`with*` helper handles both the SVG mutation and the immutable edits
update in one call:

```typescript
updateTextField: (fieldId, value) => {
  const field = sideState.editableFields.find((f) => f.fieldId === fieldId);
  const newEdits = withTextEdit(sideState.edits, field, value);
  // commit newEdits and bump revision
};

updateColorField: (fieldId, color) => {
  const field = sideState.editableColorFields.find(
    (f) => f.fieldId === fieldId
  );
  const newEdits = withColorEdit(sideState.edits, field, color);
  // commit newEdits and bump revision
};
```

#### Image upload flow

Image uploads follow a two-phase pattern to keep the preview
responsive while the upload completes in the background:

1. The user picks a file and crops it in a modal. The cropped blob
   gets a local `blob:` URL via `URL.createObjectURL`.
2. The store calls `withImageEdit` with the blob URL to show an
   instant local preview (it mutates the SVG nodes internally).
3. The blob is uploaded to the CDN in the background.
4. On success, the store calls `withImageEdit` again with the CDN
   URL, replacing the blob URL.

Before saving, the app strips any remaining blob URLs so only
stable CDN URLs are persisted:

```typescript
import { cleanEditsForSave, getEditValue } from '@arsalandogar/fs-card-engine';

// Remove edits for fields not in this template
const cleaned = cleanEditsForSave(edits, fields);

// Remove edits that still reference local blob URLs
const final = Object.fromEntries(
  Object.entries(cleaned).filter(
    ([, value]) => value && !getEditValue(value)?.startsWith('blob:')
  )
);
```

#### Text compression

The store runs `applyTextCompression` after every text edit to
fit text nodes that exceed their `data-max-width`. When
`data-text-multiline="true"` is also present, the engine uses the
stable multiline solver and applies one final fitted layout per
edit. Because font resolution is async, the store uses a run-loop
pattern to coalesce rapid edits into a single compression pass:

```typescript
const compressionState = createCompressionState();
const fontCache = new Map<string, Promise<FontLookupResult>>();

const scheduleTextCompression = (side: Side): void => {
  const runState = compressionState[side];
  runState.pending = true;

  if (runState.running) return; // already in the loop

  runState.running = true;
  void (async () => {
    try {
      while (runState.pending) {
        runState.pending = false;

        const snapshot = get().sides[side];
        if (!snapshot.workingCopy) continue;
        const startRevision = snapshot.revision;

        const result = await applyTextCompression(snapshot.workingCopy, {
          fontResolver: resolveCardBuilderFont,
          fontCache,
          onWarning: (w) => reportTextCompressionWarning(side, w),
        });

        // If the revision changed while we were compressing, loop again
        const latest = get().sides[side];
        if (latest.revision !== startRevision) {
          if (latest.workingCopy) runState.pending = true;
          continue;
        }

        // Bump revision only when fitting modified the tree
        if (result.modifiedCount > 0) {
          set(commitSide(get(), side, {}));
        }
      }
    } finally {
      runState.running = false;
      if (runState.pending) scheduleTextCompression(side);
    }
  })();
};
```

Key details:

- **`fontCache`** lives outside the Zustand state so parsed
  `opentype.Font` objects are shared across all compression runs
  without triggering re-renders.
- **`pending`/`running` flags** ensure at most one compression loop
  runs per side. A new edit sets `pending = true`; if a loop is
  already running, it will pick up the change on its next iteration.
- **Revision check** — after the async `applyTextCompression` call,
  the store compares the current `revision` to the one captured
  before the call. If the user made another edit while compression
  was running, the loop restarts with the latest tree.
- **Warnings** are deduplicated by a `Set<string>` keyed on
  `side|reason|nodeId|message`. In dev mode, each unique warning
  shows a Mantine notification and a `console.warn`.

The `fontResolver` is created once with `createFontResolver` and
a `fetch`-based `loadFont`:

```typescript
import {
  createFontResolver,
  normalizeFileToken,
  type FontRegistryEntry,
} from '@arsalandogar/fs-card-engine';

const entries: FontRegistryEntry[] = [
  {
    family: 'Poppins',
    weight: 400,
    style: 'normal',
    locator: poppinsRegularUrl,
  },
  { family: 'Poppins', weight: 700, style: 'normal', locator: poppinsBoldUrl },
  // ...
];

export const resolveCardBuilderFont = createFontResolver({
  entries,
  loadFont: async (url) => {
    const response = await fetch(url);
    if (!response.ok) return null;
    return new Uint8Array(await response.arrayBuffer());
  },
  fileTokens, // optional fuzzy filename lookup map
});
```

#### Gesture handling

The preview supports wheel-to-zoom, pointer-drag-to-pan, and
pinch-to-zoom on image fields. A React hook attaches DOM event
listeners to the preview container and resolves the target field by
walking up the DOM tree looking for the `data-image-field-id`
attribute.

Gestures compute deltas in screen pixels and convert them to SVG
user units using the viewBox-to-viewport ratio. They call
`adjustImageZoom` and `nudgeImagePosition` on the store, which in
turn call `applyImageZoom`, `nudgeImageNodes`, `withZoomEdit`, and
`withNudgeEdit` from the engine. The store reads the current
position from the `edits` record using `isImageEdit` and
`DEFAULT_IMAGE_POSITION`:

```typescript
const edit = store.sides[side].edits[fieldId];
const pos = isImageEdit(edit) ? edit : DEFAULT_IMAGE_POSITION;
const newZoom = Math.max(0.5, Math.min(2, pos.zoom + delta));

store.adjustImageZoom(fieldId, newZoom, pos.offsetX, pos.offsetY);
```

### Node.js backend

The backend receives the `edits` JSON from the API and produces the
final PNG. Its pipeline is a single pass with no reactivity layer:

```typescript
import {
  parseSvgSync,
  prepareTemplate,
  applyEdits,
  stringifySvg,
} from '@arsalandogar/fs-card-engine';

// 1. Parse the template SVG (stored as a string in the database)
const svgNode = parseSvgSync(templateSvgString);

// 2. Clone and discover fields
const { workingCopy, fields } = prepareTemplate(svgNode);

// 3. Apply the user's saved edits
applyEdits(fields, savedEdits);

// 4. Serialize back to an SVG string
const finalSvg = stringifySvg(workingCopy);

// 5. Render to PNG with a platform-specific library
// (for example, sharp, resvg-js, or Puppeteer)
const png = await renderSvgToPng(finalSvg);
```

The backend doesn't need the `with*Edit` helpers, zoom/nudge
functions, or `cleanEditsForSave`. It receives already-cleaned
edits and applies them in one shot. Image URLs in the edits are
stable CDN URLs — the backend never sees blob URLs.

If you need to apply image zoom and offset on the backend (for
example, when the edits include `ImageEdit` objects with
`zoom`/`offsetX`/`offsetY`), call `applyImageZoom` on the image
field's `elementNodes` after `applyEdits`:

```typescript
import { applyImageZoom, isImageEdit } from '@arsalandogar/fs-card-engine';

for (const field of fields.imageFields) {
  const edit = savedEdits[field.fieldId];
  if (isImageEdit(edit)) {
    applyImageZoom(field.elementNodes, edit.zoom, edit.offsetX, edit.offsetY);
  }
}
```

#### Text compression on the backend

If the template uses `data-max-width` annotations, run
`applyTextCompression` after `applyEdits` so that overlong text
fields are fitted before rendering to PNG:

```typescript
import {
  parseSvgSync,
  prepareTemplate,
  applyEdits,
  applyTextCompression,
  createFontResolver,
  stringifySvg,
  type FontRegistryEntry,
} from '@arsalandogar/fs-card-engine';
import { readFile, readdir } from 'node:fs/promises';
import { join, basename, extname } from 'node:path';

// Build font entries from a directory of font files
const FONT_DIR = '/path/to/fonts';
const fontFiles = await readdir(FONT_DIR);
const entries: FontRegistryEntry[] = fontFiles
  .filter((f) => /\.(ttf|otf|woff)$/i.test(f))
  .map((f) => ({
    family: basename(f, extname(f)).replace(/-\w+$/, ''),
    weight: 400,
    style: 'normal' as const,
    locator: join(FONT_DIR, f),
  }));

const fontResolver = createFontResolver({
  entries,
  loadFont: async (locator) => {
    try {
      const buffer = await readFile(locator);
      return new Uint8Array(buffer);
    } catch {
      return null;
    }
  },
});

const svgNode = parseSvgSync(templateSvgString);
const { workingCopy, fields } = prepareTemplate(svgNode);
applyEdits(fields, savedEdits);
await applyTextCompression(workingCopy, { fontResolver });

const finalSvg = stringifySvg(workingCopy);
```

### React Native

The React Native app uses `react-native-svg` to render the
`SvgJsonNode` tree. The integration follows the same pattern as the
web app with these differences:

- **Rendering**: Replace `createElement('rect', ...)` with
  `createElement(Rect, ...)` from `react-native-svg`. You need a
  mapping from SVG tag names to the corresponding React Native SVG
  components.
- **Attribute conversion**: React Native SVG uses camelCase props
  (for example, `clipPath` instead of `clip-path`). Your renderer
  must convert the attribute names from the `SvgJsonNode` tree.
- **State management**: Use the same Zustand store structure and
  `revision` counter pattern as the web app. The engine functions
  are identical across platforms.
- **Gestures**: Use `react-native-gesture-handler` or the
  `PanResponder` API instead of DOM pointer events. Convert gesture
  deltas from screen points to SVG user units using the layout
  dimensions and viewBox ratio, then call the same `applyImageZoom`
  and `nudgeImageNodes` functions.
- **Image upload**: Use the device camera or photo library to pick
  images. Apply the same two-phase pattern (local preview → CDN
  URL) as the web app, using `Image.getSize` to determine aspect
  ratios.
- **Text compression**: Call `applyTextCompression` after each
  text edit, using the same coalescing pattern as the web app.
  For font loading, use `react-native-fs` or `expo-file-system`
  to read font files instead of `fetch` or Node.js `readFile`.

## API reference

Every public export is listed below, grouped by module.

### Types (`types.ts`)

These exports define the shared value shapes and utility helpers used
throughout the engine.

| Export                   | Kind     | Description                                   |
| ------------------------ | -------- | --------------------------------------------- |
| `SvgJsonNode`            | type     | Re-export of svgson's `INode`                 |
| `ColorTarget`            | type     | `'fill' \| 'stroke' \| 'stop-color'`          |
| `OklabOffset`            | type     | `{ deltaL, deltaA, deltaB }` — OKLAB deltas   |
| `TouchBounds`            | type     | `{ x, y, width, height }` — touch target area |
| `ImageEdit`              | type     | `{ url, zoom, offsetX, offsetY }`             |
| `EditValue`              | type     | `string \| ImageEdit`                         |
| `isImageEdit(value)`     | function | Type guard for `ImageEdit`                    |
| `getEditValue(value)`    | function | Extract string from a string or `ImageEdit`   |
| `DEFAULT_IMAGE_POSITION` | const    | `{ zoom: 1, offsetX: 0, offsetY: 0 }`         |
| `ZOOM_MIN`               | const    | `0.5` — minimum image zoom                    |
| `ZOOM_MAX`               | const    | `2` — maximum image zoom                      |
| `CARD_WIDTH`             | const    | `750` — standard card width (safe zone)       |
| `CARD_HEIGHT`            | const    | `1050` — standard card height (safe zone)     |
| `CARD_BLEED_WIDTH`       | const    | `833.34` — card width with bleeds             |
| `CARD_BLEED_HEIGHT`      | const    | `1133.34` — card height with bleeds           |
| `hasBleeds(vb)`          | function | Returns true when viewBox exceeds safe zone   |
| `getCardBounds(vb)`      | function | Returns safe zone within a larger viewBox     |

### Vocabulary (`vocabulary.ts`)

`EDITABLE_FIELDS` is a const record that defines every valid field
ID, its type, and its label:

| Field ID       | Type  | Label      |
| -------------- | ----- | ---------- |
| `firstName`    | text  | First Name |
| `lastName`     | text  | Last Name  |
| `fullName`     | text  | Full Name  |
| `team`         | text  | Team       |
| `position`     | text  | Position   |
| `number`       | text  | Number     |
| `textOne`      | text  | Text 1     |
| `textTwo`      | text  | Text 2     |
| `textThree`    | text  | Text 3     |
| `textFour`     | text  | Text 4     |
| `textFive`     | text  | Text 5     |
| `textSix`      | text  | Text 6     |
| `textSeven`    | text  | Text 7     |
| `textEight`    | text  | Text 8     |
| `textNine`     | text  | Text 9     |
| `textTen`      | text  | Text 10    |
| `textEleven`   | text  | Text 11    |
| `textTwelve`   | text  | Text 12    |
| `textThirteen` | text  | Text 13    |
| `imageOne`     | image | Image 1    |
| `imageTwo`     | image | Image 2    |
| `imageThree`   | image | Image 3    |
| `imageFour`    | image | Image 4    |
| `imageFive`    | image | Image 5    |
| `colorOne`     | color | Color 1    |
| `colorTwo`     | color | Color 2    |
| `colorThree`   | color | Color 3    |
| `colorFour`    | color | Color 4    |
| `colorFive`    | color | Color 5    |

`EditableFieldId` is `keyof typeof EDITABLE_FIELDS`.
`EditableFieldType` is `'text' | 'color' | 'image'`.

### SVG parsing (`parse-svg.ts`)

Use these helpers to convert between SVG strings and `SvgJsonNode`
trees.

| Export                    | Signature                                     |
| ------------------------- | --------------------------------------------- |
| `parseSvgSync(svgString)` | `(svgString: string) => SvgJsonNode`          |
| `parseSvg(svgString)`     | `(svgString: string) => Promise<SvgJsonNode>` |
| `stringifySvg(node)`      | `(node: SvgJsonNode) => string`               |

### SVG cloning (`svg-clone.ts`)

Use this helper to create a stable, editable working copy of a parsed
SVG tree.

| Export                     | Signature                            |
| -------------------------- | ------------------------------------ |
| `cloneWithStableIds(root)` | `(root: SvgJsonNode) => SvgJsonNode` |

Deep-clones the tree with `structuredClone` and assigns a unique
10-character `__nodeId` attribute (via nanoid) to every element
node. The IDs remain stable across re-renders as long as you reuse
the same clone.

### Field discovery (`svg-editable-fields.ts`)

These functions walk the SVG tree and return arrays of discovered
fields, sorted by their position in the vocabulary.

| Export                              | Returns                    |
| ----------------------------------- | -------------------------- |
| `discoverEditableTextFields(root)`  | `EditableTextField[]`      |
| `discoverEditableColorFields(root)` | `EditableColorField[]`     |
| `discoverEditableImageFields(root)` | `EditableImageField[]`     |
| `parseTouchBounds(value)`           | `TouchBounds \| undefined` |

`parseTouchBounds` parses a `"x,y,width,height"` string into a
`TouchBounds` object. It returns `undefined` if the input is
missing or malformed. The discovery functions call it internally,
but it's also exported for direct use.

**`EditableTextField`** — `{ fieldId, label, originalValue,
multiline, elementNodes, touchBounds? }`. The `multiline` flag is
`true` when the first annotated element has
`data-text-multiline="true"`. The `elementNodes` array contains
every SVG element annotated with that field ID. The optional
`touchBounds` is a `TouchBounds` parsed from the first element's
`data-touch-bounds` attribute.

**`ColorFieldElement`** — `{ node, colorTarget, colorOffset? }`.
A single SVG element participating in a color field, with an
optional OKLAB offset for derived shades.

**`EditableColorField`** — `{ fieldId, label, originalValue,
elements }`. The `originalValue` is read from the first element
without an offset (the true base color).

**`ImageClipBounds`** — `{ x, y, width, height }`. The bounding
rectangle of the resolved clip path.

**`EditableImageField`** — `{ fieldId, label, originalValue,
originalBounds, elementNodes, aspectRatio, clipBounds,
touchBounds? }`. The `aspectRatio` is computed from the clip
bounds (or the image's own dimensions if no clip path exists).
The optional `touchBounds` is a `TouchBounds` parsed from the
first element's `data-touch-bounds` attribute.

### Edit application (`svg-editable-fields.ts`)

These functions mutate SVG nodes in place:

| Export                            | Signature                                               |
| --------------------------------- | ------------------------------------------------------- |
| `applyTextEdit(field, value)`     | `(field: EditableTextField, value: string) => void`     |
| `applyColorEdit(field, color)`    | `(field: EditableColorField, color: string) => void`    |
| `applyImageEdit(field, imageUrl)` | `(field: EditableImageField, imageUrl: string) => void` |

`applyTextEdit` updates the text content in each annotated element.
`applyColorEdit` writes the color to each element's target property,
computing OKLAB-derived shades for elements with offsets.
`applyImageEdit` sets `href` and `xlink:href`, and resizes the image
to fill the clip bounds when replacing the original.

### Edit helpers (`edit-operations.ts`)

Higher-level functions for building and applying edits.

Constants for identifying touch target overlay elements:

| Export                   | Value                      | Description                                          |
| ------------------------ | -------------------------- | ---------------------------------------------------- |
| `TOUCH_TARGET_ATTR`      | `'data-touch-target'`      | Attribute on injected rects, value is the field ID   |
| `TOUCH_TARGET_TYPE_ATTR` | `'data-touch-target-type'` | Field type on injected rects (`'image'` or `'text'`) |

Functions:

| Export                                                 | Signature                                                                                           |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `prepareTemplate(node)`                                | `(svgNode: SvgJsonNode) => { workingCopy, fields }`                                                 |
| `applyEdits(fields, edits)`                            | `(fields: DiscoveredFields, edits: Edits) => void`                                                  |
| `cleanEditsForSave(edits, fields)`                     | `(edits: Edits, fields: DiscoveredFields) => Edits`                                                 |
| `withColorEdit(edits, field, color)`                   | `(edits: Edits, field: EditableColorField, color: string) => Edits`                                 |
| `withImageEdit(edits, field, imageUrl)`                | `(edits: Edits, field: EditableImageField, imageUrl: string) => Edits`                              |
| `withTextEdit(edits, field, value)`                    | `(edits: Edits, field: EditableTextField, value: string) => Edits`                                  |
| `withPresetColors(edits, colorFields, presetColors)`   | `(edits: Edits, colorFields: EditableColorField[], presetColors: string[]) => Edits`                |
| `withSwappedColors(edits, fieldA, fieldB)`             | `(edits: Edits, fieldA: EditableColorField, fieldB: EditableColorField) => Edits`                   |
| `withAllColorsReset(edits, colorFields)`               | `(edits: Edits, colorFields: EditableColorField[]) => Edits`                                        |
| `withImageRemoved(edits, field)`                       | `(edits: Edits, field: EditableImageField) => Edits`                                                |
| `withTextFieldReset(edits, field)`                     | `(edits: Edits, field: EditableTextField) => Edits`                                                 |
| `applyImageZoom(nodes, zoom, offsetX, offsetY)`        | `(nodes: SvgJsonNode[], zoom: number, offsetX: number, offsetY: number) => void`                    |
| `nudgeImageNodes(nodes, dx, dy)`                       | `(nodes: SvgJsonNode[], dx: number, dy: number) => void`                                            |
| `withZoomEdit(edits, fieldId, zoom, offsetX, offsetY)` | `(edits: Edits, fieldId: EditableFieldId, zoom: number, offsetX: number, offsetY: number) => Edits` |
| `withNudgeEdit(edits, fieldId, dx, dy)`                | `(edits: Edits, fieldId: EditableFieldId, dx: number, dy: number) => Edits`                         |

**`Edits`** — `Partial<Record<EditableFieldId, EditValue>>`.
A plain object mapping field IDs to their edited values.

**`DiscoveredFields`** — `{ textFields: EditableTextField[],
colorFields: EditableColorField[], imageFields:
EditableImageField[] }`.

`prepareTemplate` clones the input SVG and returns the editable
working copy plus discovered fields. `applyEdits` mutates those field
nodes in place and replays image URLs only. Use `applyImageZoom` to
reapply any persisted image positioning.

### Color math (`color-math.ts`)

Functions for perceptual color operations in OKLAB space:

| Export                                      | Signature                                                                    |
| ------------------------------------------- | ---------------------------------------------------------------------------- |
| `applyOklabOffset(baseHex, offset)`         | `(baseHex: string, offset: OklabOffset) => string`                           |
| `computeOklabOffset(baseHex, shadeHex)`     | `(baseHex: string, shadeHex: string) => OklabOffset`                         |
| `colorDistance(hexA, hexB)`                 | `(hexA: string, hexB: string) => number`                                     |
| `clusterColors(detectedColors, threshold?)` | `(detectedColors: ClusterableColor[], threshold?: number) => ColorCluster[]` |
| `parseOffset(raw)`                          | `(raw: string) => OklabOffset \| null`                                       |
| `serializeOffset(offset)`                   | `(offset: OklabOffset) => string`                                            |
| `isZeroOffset(offset)`                      | `(offset: OklabOffset) => boolean`                                           |

**`ColorCluster`** — `{ baseHex: string, members:
ClusterMember[] }`. Represents a group of perceptually similar
colors.

**`ClusterMember`** — `{ hex: string, offset: OklabOffset,
occurrences: { nodeId: string, colorTarget: ColorTarget }[] }`.
A single color within a cluster, with its offset relative to the
cluster's base color.

`clusterColors` expects an array of `ClusterableColor` objects.
Each object has the shape `{ hex: string, occurrences: { nodeId:
string, colorTarget: ColorTarget }[] }`. This is an internal
interface — callers construct it from their own color data before
passing it in.

### Text compression (`text-compression.ts`)

Functions for measuring text width and fitting text nodes that
exceed their `data-max-width`.

| Export                                                   | Signature                                                                                          |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `measureTextWidth(text, fontSize, font, letterSpacing?)` | `(text: string, fontSize: number, font: opentype.Font, letterSpacing?: number) => number`          |
| `applyTextCompression(root, options)`                    | `(root: SvgJsonNode, options: ApplyTextCompressionOptions) => Promise<ApplyTextCompressionResult>` |

**Types:**

| Export                         | Kind      | Description                                                                   |
| ------------------------------ | --------- | ----------------------------------------------------------------------------- |
| `FontData`                     | type      | `ArrayBuffer \| Uint8Array` — raw font binary                                 |
| `FontResolverInput`            | interface | `{ family, weight, style }` — font lookup parameters                          |
| `FontResolver`                 | type      | `(input: FontResolverInput) => Promise<FontData \| null> \| FontData \| null` |
| `TextCompressionWarningReason` | type      | Union of warning reason strings (see table below)                             |
| `TextCompressionWarning`       | interface | `{ reason, nodeId?, message }` — compression warning                          |
| `ApplyTextCompressionOptions`  | interface | `{ fontResolver, onWarning?, fontCache? }`                                    |
| `ApplyTextCompressionResult`   | interface | `{ compressedCount, wrappedCount, modifiedCount, warningCount }`              |
| `FontLookupResult`             | interface | `{ font, errorReason? }` — cached font resolution result                      |

**Warning reasons:**

| Reason                    | When it fires                                                   |
| ------------------------- | --------------------------------------------------------------- |
| `font-not-found`          | The `FontResolver` returned `null` for the requested font       |
| `parse-failed`            | The font binary could not be parsed by opentype.js              |
| `unsupported-mixed-style` | The `<text>` element has child tspans with font style overrides |
| `invalid-max-width`       | The `data-max-width` value is missing, non-numeric, or ≤ 0      |

### Font matching (`font-matching.ts`)

Utilities for normalizing font metadata and resolving font file
candidates from family/weight/style inputs.

| Export                                                | Signature                                                           |
| ----------------------------------------------------- | ------------------------------------------------------------------- |
| `stripQuotes(value)`                                  | `(value: string) => string`                                         |
| `normalizeFamily(value)`                              | `(value: string) => string`                                         |
| `normalizeWeight(weight)`                             | `(weight: string \| number) => number`                              |
| `normalizeStyle(style)`                               | `(style: string) => FontStyle`                                      |
| `normalizeFileToken(value)`                           | `(value: string) => string`                                         |
| `weightToVariantToken(weight)`                        | `(weight: number) => string`                                        |
| `pickNearestWeight(entries, requestedWeight)`         | `<T extends FontEntry>(entries: T[], requestedWeight: number) => T` |
| `generateFontFileCandidates(family, variant, italic)` | `(family: string, variant: string, italic: boolean) => string[]`    |

**Types:**

| Export      | Kind      | Description                                       |
| ----------- | --------- | ------------------------------------------------- |
| `FontStyle` | type      | `'normal' \| 'italic'`                            |
| `FontEntry` | interface | `{ family, weight, style }` — font registry entry |

### Font resolver factory (`create-font-resolver.ts`)

Use this factory to bridge platform-specific font loading into the
engine's `FontResolver` interface.

| Export                        | Signature                                              |
| ----------------------------- | ------------------------------------------------------ |
| `createFontResolver(options)` | `(options: CreateFontResolverOptions) => FontResolver` |

Creates a `FontResolver` that maps `FontResolverInput` requests to
font binaries. It builds a family/style/weight index from a list of
`FontRegistryEntry` objects, picks the nearest weight, and caches
loaded font data. An optional `fileTokens` map enables fuzzy
filename-based fallback when no exact registry match is found.

**Types:**

| Export                      | Kind      | Description                                                  |
| --------------------------- | --------- | ------------------------------------------------------------ |
| `FontRegistryEntry`         | interface | `{ family, weight, style, locator }` — registered font       |
| `CreateFontResolverOptions` | interface | `{ entries, loadFont, fileTokens? }` — factory configuration |

### Side state (`side-state.ts`)

Per-side editing state used by platform integrations to track the
working copy, discovered fields, and edits for each card side.

| Export                                  | Kind      | Description                                                                                     |
| --------------------------------------- | --------- | ----------------------------------------------------------------------------------------------- |
| `Side`                                  | type      | `'front' \| 'back'`                                                                             |
| `SideState`                             | interface | Per-side state: working copy, fields, edits, revision, preset                                   |
| `createEmptySideState()`                | function  | Returns a blank `SideState` with no fields or edits                                             |
| `initializeSideSnapshot(svgNode, prev)` | function  | Rebuilds a side from SVG, re-applying preset colors and stored text, color, and image URL edits |

**`SideState`** — `{ workingCopy, editableFields,
editableColorFields, editableImageFields, edits, revision,
appliedPresetId, appliedPresetColors }`. The `revision` counter
increments on each rebuild, letting renderers detect changes.

`initializeSideSnapshot` uses `applyEdits` internally, so it restores
text, colors, and image URLs from `previous.edits`. If your platform
also persists image zoom or pan, replay those values after
initialization.

## OKLAB color math

The engine uses OKLAB for all color operations because it is
perceptually uniform — equal numeric distances correspond to equal
perceived differences. This matters when you compute derived shades
from a user-chosen base color.

### How offsets work

A designer creates a template with a base color (for example,
`#1D3557` navy) and several derived shades (for example, `#457B9D`
light blue). The admin tool computes the OKLAB offset between each
shade and the base color with `computeOklabOffset`. The offset is
stored as a `data-color-offset` attribute on the SVG element.

When the user picks a new base color, `applyOklabOffset` adds the
stored offset to the new base in OKLAB space. The result is a shade
that has the same perceptual relationship to the new base as the
original shade had to the original base.

### Hue projection

Naively adding an offset in OKLAB can shift the hue of the derived
color. The engine avoids this by projecting the chroma component
(`deltaA`, `deltaB`) onto the base color's chromaticity direction.
This preserves lightness and saturation changes while discarding
hue drift baked into the original palette.

### Achromatic attenuation

Near-achromatic colors (grays, whites, blacks) have very small
chroma values. Without special handling, even a tiny chroma offset
would introduce a visible color tint. The engine smoothly attenuates
chromatic shifts as the base chroma approaches zero, using a linear
ramp that reaches full attenuation below a chroma of `0.03`. Purely
achromatic colors receive only lightness changes.

### Distance scale

`colorDistance` returns a value on a 0–100 scale suitable for UI
sliders and thresholds. Internally it computes the Euclidean
distance in OKLAB space and multiplies by 200 to map the typical
range (`~0–0.5`) to `~0–100`. The default clustering threshold of
30 works well for grouping visually similar colors in templates.

## Dependencies

These libraries back the package's SVG parsing, color math, and font
measurement features.

- [**culori**](https://culorijs.org/) — pure JS OKLAB color conversions
- [**nanoid**](https://github.com/ai/nanoid) — unique ID generation for SVG node cloning
- [**opentype.js**](https://opentype.js.org/) — OpenType font
  parsing for text width measurement
- [**svgson**](https://github.com/elrumordelaluz/svgson) — SVG string ↔ JSON tree parsing

No native modules, no DOM APIs. Works in Node.js, browsers,
and React Native (Hermes/JSC).

## Next steps

Use these references to dig deeper into the engine and its consuming
apps.

- Browse the source code in `packages/card-engine/src/` to see
  the implementation details
- See the web editor integration in
  `src/features/card-builder/` for a full working example
- Use the template annotator to create and annotate new
  template SVGs with `data-*` attributes
