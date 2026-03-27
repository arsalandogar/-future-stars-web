---
name: card-builder
description: >
  Guide for working on the card builder feature — the end-user card creation and editing
  experience that lets users select templates, customize text/colors/images, and preview
  cards in real-time. Use this skill whenever the task involves: the card builder UI,
  card creation/editing pages, template selection, color presets/favorites, image upload/crop/position,
  card preview gestures (zoom/pan/pinch), text compression, font loading, the card editor store,
  the image upload store, or any code under src/features/card-builder/.
  Also use when working on card builder routes (create-card, edit-card, card success page),
  the template defaults editor, or @fs-card-engine edit operations that feed into the builder
  (Edits, withColorEdit, withTextEdit, withImageEdit, applyTextCompression, renderEditedTemplate).
---

# Card Builder

The card builder is the end-user-facing feature for creating and editing customizable trading cards. Users select a template (front and optionally back), customize text content, apply color palettes, upload and position images, then preview and save their card — all in a two-column layout with live SVG preview.

The card engine (`@fs-card-engine`) handles the heavy lifting: SVG tree manipulation, text compression, font resolution, and edit application. The card builder orchestrates the UI around it.

## Architecture Overview

```
Routes:
  /_authenticated/_customer/_card-builder
    ├─ /create-card        → CreateCardPage
    ├─ /edit-card/$cardId  → EditCardPage
  /_authenticated/_customer
    ├─ /card/$cardId       → CardPage (success view)
  /_authenticated/admin/templates/$id/defaults → TemplateDefaultsPage

CardBuilderShell (main layout orchestrator)
  ├─ BuilderHeader          (title + save button)
  └─ Two-column layout
       ├─ CardPreview       (2.5:3.5 aspect ratio SVG, flip, gestures)
       └─ BuilderTabsPanel  (Content | Colors | Photo | Templates)
            ├─ ContentTab        (text field editing)
            ├─ ColorsTab         (color picker + presets + favorites)
            │   ├─ ActiveColorsBar    (current color circles)
            │   └─ ColorSourceTabs    (Popular | Team | My Colors)
            ├─ PhotoTab          (image upload, crop, position)
            │   ├─ ImageFieldsList
            │   ├─ ImageActions
            │   ├─ CropModal (lazy loaded)
            │   └─ PositionControls
            └─ TemplatesTab      (template grid with tags)
```

**Key directories:**

- `src/features/card-builder/` — 30+ files (components, stores, hooks, lib, api, types, pages)
- `packages/card-engine/src/` — shared engine (edit operations, text compression, font resolution)

## State Management (Three Zustand Stores)

The card builder separates concerns across three stores. This separation matters because each store has a different lifecycle and update frequency.

### useCardBuilderStore — UI Navigation

**File:** `stores/card-builder-store.ts`

Controls which panel/tab the user is viewing. Resets on unmount.

```typescript
interface CardBuilderState {
  activeTab: BuilderTab | null; // 'content' | 'colors' | 'photo' | 'templates'
  activeTagFilter: string | null; // template tag filter
  activeColorSubTab: ColorSubTab; // 'popular' | 'team' | 'my-colors'
  activePhotoSubTab: PhotoSubTab; // 'image' | 'position'
  selectedImageFieldId: EditableFieldId | null;
}
```

### useCardEditorStore — Card Content Edits

**File:** `stores/card-editor-store.ts`

The main editing store. Manages both sides of a card (front/back), tracks edits, schedules text compression, and handles font loading.

**Key state shape:**

- `activeSide: Side` — `'front'` or `'back'`
- `sides: Record<Side, SideState>` — each side has its own working copy, edits, editable fields, and revision counter
- `focusedFieldId` — which text field has keyboard focus

**SideState** (from `@fs-card-engine`):

- `workingCopy: SvgJsonNode | null` — live mutable SVG tree (edits applied in-place)
- `edits: Edits` — serializable edit map (`{ [fieldId]: value | ImageEdit }`)
- `editableFields`, `editableColorFields`, `editableImageFields` — discovered from SVG annotations
- `appliedPresetId`, `appliedPresetColors` — tracks active color preset for reset
- `revision: number` — incremented on every edit, drives re-renders

**Key actions:**

| Action                                             | What it does                                                       |
| -------------------------------------------------- | ------------------------------------------------------------------ |
| `initializeSideFromSvg(side, svgNode)`             | Parses SVG, discovers fields, loads fonts, starts text compression |
| `hydrateSavedEdits(frontEdits, backEdits)`         | Restores edits when editing an existing card                       |
| `updateTextField(fieldId, value)`                  | Updates text edit + schedules compression                          |
| `updateColorField(fieldId, color)`                 | Updates color edit, clears preset tracking                         |
| `updateImageField(fieldId, imageUrl)`              | Sets image URL in edits                                            |
| `removeImageField(fieldId)`                        | Removes image from edits                                           |
| `adjustImageZoom(fieldId, zoom, offsetX, offsetY)` | Adjusts image zoom + applies to DOM nodes                          |
| `nudgeImagePosition(fieldId, dx, dy)`              | Pans image + applies to DOM nodes                                  |
| `applyColorPreset(colors, presetId)`               | Applies a full color palette to all color fields                   |
| `swapColors(fieldIdA, fieldIdB)`                   | Swaps two color field values                                       |
| `resetAllColors()`                                 | Resets all colors to template defaults                             |
| `resetToPreset()`                                  | Re-applies the last-used preset                                    |
| `getEditsForSave()`                                | Returns clean `{ frontEdits, backEdits }` for API persistence      |

**Revision-based rendering:** Components subscribe to `sides[activeSide].revision` to know when to re-render. The `commitSide()` helper bumps revision on every state change.

**Text compression scheduling:** When a text edit occurs, `scheduleTextCompression()` runs asynchronously. It checks if the revision changed while compression ran — if so, it re-runs against the latest state. This prevents stale compression from overwriting newer edits.

### useImageUploadStore — Upload Lifecycle

**File:** `stores/image-upload-store.ts`

Tracks image uploads from local blob preview through CDN upload.

```typescript
type UploadKey = `${Side}:${EditableFieldId}`; // e.g. 'front:imageOne'

interface ImageUploadEntry {
  uploadKey: UploadKey;
  localPreviewUrl: string; // blob URL for instant preview
  status: 'uploading' | 'success' | 'error';
  cdnUrl: string | null; // final CDN URL after upload
  error: string | null;
}
```

**Upload flow:**

1. User selects/crops an image → `addUpload()` creates blob URL for instant preview
2. Background upload starts via `useUploadCardImage` mutation
3. On success → `setUploadSuccess()` revokes blob URL, stores CDN URL
4. On error → `setUploadError()` stores error message
5. Save button is disabled while `hasUnfinishedUploads()` is true
6. On unmount → `revokeAllUrls()` cleans up all blob URLs

## Pages

### CreateCardPage (`pages/create-card-page.tsx`)

Entry point for new cards. Reads `templateId` from route search params, fetches template's `backTemplateId`, renders `CardBuilderShell`, and calls `useSaveCard` → navigates to `/card/$cardId` on success.

### EditCardPage (`pages/edit-card-page.tsx`)

Edit existing cards. Fetches card via `cardQuery`, hydrates editor store with saved edits via `hydrateSavedEdits()`. Supports switching templates while editing (uses `searchTemplateId ?? card.templateId`). Calls `useUpdateCard` → navigates to success page.

### CardPage (`pages/card-page.tsx`)

Post-creation success view. Fetches card via `cardQuery`, renders `CardSuccess` component.

### TemplateDefaultsPage (`pages/template-defaults-page.tsx`)

Admin-facing page for editing template default values. Similar layout to card builder but without the Templates tab (`showTemplatesTab={false}`). Uses `renderEditedTemplate()` from card-engine to bake edits into SVG before saving.

## Card Preview & Gestures

### CardPreview

Renders the SVG working copy in a 2.5:3.5 aspect ratio container. Features:

- Front/back flip button (only when back template exists)
- Loading, error, and empty states
- Click-through to text/image fields via `SvgRenderOptions`

### useCardPreviewRenderOptions

Creates `SvgRenderOptions` that map SVG element clicks to builder actions:

- **Image elements** (`data-image-field` or touch target rects): opens Photo tab, selects field
- **Text elements** (`data-text-field`): opens Content tab, focuses field
- **Root SVG**: adjusts viewBox to crop bleeds via `getCardBounds()`

### usePreviewGestures

For detailed gesture handling reference, read `references/preview-gestures.md`.

Attaches three gesture types to the preview container for image fields that have a user upload:

- **Wheel zoom**: `deltaY * 0.001` sensitivity, clamped to `[ZOOM_MIN, ZOOM_MAX]`
- **Pointer drag-to-pan**: 3px threshold, converts screen pixels to SVG units via `getSvgScale()`
- **Touch pinch-to-zoom**: two-finger distance delta \* 0.005

After a drag, sets `wasDragRef` to prevent the subsequent click from firing.

## API Integration

| Hook                     | Endpoint                           | Purpose                                         |
| ------------------------ | ---------------------------------- | ----------------------------------------------- |
| `cardQuery`              | `GET cards/:id`                    | Fetch card details                              |
| `useSaveCard`            | `POST cards/v2`                    | Create new card (seeds cache, invalidates list) |
| `useUpdateCard`          | `PUT cards/v2/:id`                 | Update existing card                            |
| `useUploadCardImage`     | `POST images/upload`               | Upload image blob as FormData                   |
| `useColorFavorites`      | `GET color-teams/favorites`        | User's saved color palettes                     |
| `useAddColorFavorite`    | `POST color-teams/favorites`       | Save a palette                                  |
| `useRemoveColorFavorite` | `DELETE color-teams/favorites/:id` | Remove a saved palette                          |
| `useBrowseColorTeams`    | `GET color-teams`                  | Popular/featured palettes (10min stale)         |
| `useBrowseLeagues`       | `GET leagues`                      | Leagues for team color filtering (30min stale)  |

**Payload shape for save/update:**

```typescript
interface PersistCardPayload {
  templateId: number;
  editsJson: Edits;
  backTemplateId: number | null;
  backEditsJson: Edits;
}
```

## Font System

For detailed font handling reference, read `references/font-system.md`.

**Key concepts:**

- Static font registry covers Montserrat (400–900) and Poppins (400–700)
- `createFontResolver()` from card-engine creates the font resolver used by text compression
- `ensureSvgFontsLoaded()` scans SVG tree for font-family references and registers dynamic fonts via the FontFace API
- After font loading, a revision bump triggers re-render + fresh text compression
- `fileTokens` map provides fallback resolution for fonts referenced by filename in SVG

## Text Compression

Text compression fits text content within annotated bounding boxes by adjusting font size. It runs asynchronously after every text edit.

**Flow:**

1. `updateTextField()` calls `scheduleTextCompression(side)`
2. The scheduler checks `compressionState[side]` — if already running, marks `pending`
3. When ready, calls `applyTextCompression(workingCopy, { fontResolver, fontCache, onWarning })`
4. Checks if `revision` changed during compression — if so, re-runs
5. If text was modified, bumps revision to trigger re-render
6. Warnings are reported via `reportTextCompressionWarning()` (de-duplicated, dev-only notifications)

**Warning types:** `font-not-found`, `parse-failed`, `unsupported-mixed-style`, `invalid-max-width`

## Image Upload & Crop Flow

1. User picks an image → `CropModal` opens (lazy loaded via `React.lazy`)
2. User crops with `react-easy-crop` → `getCroppedImageBlob()` uses canvas to produce a Blob
3. Blob URL created for instant preview → `addUpload()` to store
4. `useUploadCardImage` mutation uploads FormData to CDN
5. On success → editor store gets CDN URL, upload store revokes blob URL
6. Position controls: zoom slider (`ZOOM_MIN` to `ZOOM_MAX`) + directional nudge buttons

## Routing & Prefetching

**Route layout:** `/_authenticated/_customer/_card-builder`

- Validates search params via `cardBuilderSearchSchema` (optional `templateId: number`)
- Prefetches template catalog (tags + first page of templates) on every load
- Prefetches specific template SVG when `templateId` is present
- Uses `loaderDeps` pattern so refetching occurs when `templateId` changes

**Child routes:**

- `/create-card` → `CreateCardPage`
- `/edit-card/$cardId` → `EditCardPage`

## @fs-card-engine Dependencies

The card builder imports these from `@fs-card-engine`:

| Import                                                        | Purpose                                              |
| ------------------------------------------------------------- | ---------------------------------------------------- |
| `SvgJsonNode`                                                 | SVG tree type                                        |
| `EditableFieldId`                                             | Field identifier type                                |
| `Edits`, `Side`, `SideState`                                  | Edit and state types                                 |
| `createEmptySideState`                                        | Initial empty state for a card side                  |
| `initializeSideSnapshot`                                      | Discover fields and initialize working copy from SVG |
| `applyEditsForRender`                                         | Apply edits to SVG tree for rendering                |
| `applyTextCompression`                                        | Async text fitting within bounding boxes             |
| `withTextEdit`, `withColorEdit`, `withImageEdit`              | Create updated edits for each field type             |
| `withPresetColors`, `withSwappedColors`, `withAllColorsReset` | Color preset operations                              |
| `withZoomEdit`, `withNudgeEdit`                               | Image position edit helpers                          |
| `applyImageZoom`, `nudgeImageNodes`                           | Direct DOM manipulation for image positioning        |
| `withImageRemoved`, `withTextFieldReset`                      | Reset helpers                                        |
| `renderEditedTemplate`                                        | Bake edits into SVG (used by template defaults page) |
| `createFontResolver`, `FontRegistryEntry`                     | Font resolution system                               |
| `hasBleeds`, `getCardBounds`                                  | Viewport/bounds calculations for preview             |
| `TOUCH_TARGET_ATTR`, `TOUCH_TARGET_TYPE_ATTR`                 | Touch target detection in preview                    |
| `ZOOM_MIN`, `ZOOM_MAX`, `DEFAULT_IMAGE_POSITION`              | Image zoom/position constants                        |
| `getEditValue`, `isImageEdit`                                 | Edit value inspection                                |

## File Map

### Pages & Routes

- `pages/create-card-page.tsx` — New card entry point
- `pages/edit-card-page.tsx` — Edit existing card
- `pages/card-page.tsx` — Post-creation success view
- `pages/template-defaults-page.tsx` — Admin template defaults editor
- `routes/_authenticated/_customer/_card-builder.tsx` — Layout route with prefetching
- `routes/_authenticated/_customer/_card-builder/create-card.tsx` — Create route
- `routes/_authenticated/_customer/_card-builder/edit-card.$cardId.tsx` — Edit route
- `routes/_authenticated/_customer/card.$cardId.tsx` — Card success route

### Stores

- `stores/card-builder-store.ts` — UI tab/filter state
- `stores/card-editor-store.ts` — Card editing state with text compression (~470 lines)
- `stores/image-upload-store.ts` — Image upload lifecycle tracking

### Types

- `types/index.ts` — `BuilderTab`, `ColorSubTab`, `PhotoSubTab`

### API

- `api/get-card.ts` — `cardQuery` (TanStack Query)
- `api/save-card.ts` — `useSaveCard` mutation + `PersistCardPayload` type
- `api/update-card.ts` — `useUpdateCard` mutation
- `api/upload-card-image.ts` — `useUploadCardImage` mutation
- `api/color-favorites.ts` — Favorite palette CRUD
- `api/browse-color-teams.ts` — Color team/league browsing

### Hooks

- `hooks/use-card-preview-render-options.ts` — Maps SVG clicks to builder actions
- `hooks/use-preview-gestures.ts` — Wheel zoom, drag-to-pan, pinch-to-zoom

### Library

- `lib/font-resolver.ts` — Static font registry + resolver
- `lib/ensure-svg-fonts-loaded.ts` — Dynamic font loading via FontFace API
- `lib/text-compression-warning-reporter.ts` — De-duplicated warning notifications
- `lib/builder-route.ts` — Search schema + prefetch helpers

### Components

- `components/card-builder-shell.tsx` — Main layout orchestrator
- `components/builder-header.tsx` — Title + save button
- `components/builder-tabs-panel.tsx` — Tab navigation
- `components/card-preview.tsx` — SVG preview with flip
- `components/content-tab.tsx` — Text fields tab
- `components/content-field.tsx` — Individual text field input
- `components/colors-tab.tsx` — Color editing tab
- `components/active-colors-bar.tsx` — Current color circles
- `components/color-source-tabs.tsx` — Popular/Team/My Colors sub-tabs
- `components/color-palette-swatch.tsx` — Color palette preview
- `components/photo-tab.tsx` — Photo/image tab
- `components/image-fields-list.tsx` — Image field selection
- `components/image-actions.tsx` — Upload/remove actions
- `components/crop-modal.tsx` — Image cropping (lazy loaded)
- `components/position-controls.tsx` — Zoom + nudge controls
- `components/templates-tab.tsx` — Template selection grid
- `components/template-thumbnail.tsx` — Template card thumbnail
- `components/tab-empty-state.tsx` — Empty state placeholder
- `components/card-success.tsx` — Post-creation success view
- `components/svg-renderer.tsx` — SVG rendering component

### Utils

- `utils/crop-image.ts` — Canvas-based image cropping with MIME detection

## Common Tasks

### Adding a new builder tab

1. Add the tab name to `BuilderTab` type in `types/index.ts`
2. Add the tab button in `builder-tabs-panel.tsx`
3. Create the tab component in `components/`
4. Add the render case in `BuilderTabsPanel`

### Adding a new editable field type in the builder

The builder auto-discovers editable fields from the SVG via `initializeSideSnapshot()`. If the card engine's `vocabulary.ts` adds a new field, the builder picks it up automatically. You only need to add UI if the field type needs special editing controls (beyond text input / color picker / image upload).

### Adding a new color source

1. Add the sub-tab name to `ColorSubTab` in `types/index.ts`
2. Add the tab in `color-source-tabs.tsx`
3. Create the data-fetching hook in `api/`
4. Add the palette rendering in `colors-tab.tsx`

### Modifying image upload behavior

The upload flow spans three files:

1. `components/photo-tab.tsx` — triggers upload via `useUploadCardImage`
2. `stores/image-upload-store.ts` — tracks lifecycle
3. `stores/card-editor-store.ts` — receives final CDN URL

### Debugging text compression issues

1. Check `text-compression-warning-reporter.ts` — warnings only show in dev mode
2. Verify fonts are loading via `ensureSvgFontsLoaded()` — check browser console for load failures
3. Check revision tracking in `scheduleTextCompression()` — stale revisions cause re-runs
4. Verify SVG has valid `data-max-width` annotations (set in template annotator)

### Debugging image gesture issues

1. `resolveFieldId()` walks up the DOM to find the image field attribute
2. `fieldHasUpload()` checks if the field has a user-uploaded image (gestures only work on uploads)
3. `getSvgScale()` converts screen pixels to SVG units — verify the SVG has a valid viewBox
4. `wasDragRef` prevents click-after-drag — check timing if clicks fire unexpectedly
