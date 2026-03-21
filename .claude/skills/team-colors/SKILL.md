---
name: team-colors
description: >
  Guide for building and extending the Team Colors admin page — a 3-panel layout
  for managing team color palettes and previewing templates with applied colors.
  Use this skill whenever working on files in src/features/team-colors/, the
  /admin/team-colors route, or any task involving team color palettes, color
  scheme editing, template color previews, or the palette sidebar/detail panel.
  Also activate when the user mentions "team colors", "palette preview",
  "color scheme editor", or template-color workflows.
---

# Team Colors Feature

The Team Colors page (`/admin/team-colors`) is a custom admin tool for browsing team color palettes, editing their color pairs, and previewing how those colors look applied to card templates. It does **not** use the standard `ListingShell` pattern — it has a bespoke 3-panel layout.

## Status

This feature is **under active development**. Not all UI elements are wired up yet. When adding functionality, check whether a button or control is a placeholder before assuming it works.

## Architecture Overview

```
TeamColorsPage
  └─ TeamColorsLayout (all state via URL search params)
      ├─ Top Controls
      │  ├─ ColorTypeToggle (colors / text)
      │  ├─ Search input (debounced)
      │  └─ LeagueFilterPills (All | Popular | per-league)
      │
      ├─ Left Panel (sidebar + detail)
      │  ├─ PaletteSidebar → PaletteSidebarItem × N
      │  └─ PaletteDetailPanel
      │     ├─ PaletteSection (editable color pairs)
      │     └─ ColorSchemeSection (read-only table)
      │
      ├─ Right Panel
      │  └─ TemplatePreviewGrid
      │     └─ ColoredTemplateThumbnail × N
      │
      └─ ListingPagination (teams)
```

### Key design decisions

- **URL search params as state**: All filter/selection state lives in the route's search params (colorType, search, leagueFilter, paletteId, teamPage, teamLimit, templateSide). This makes the page bookmarkable and shareable.
- **`getRouteApi()` instead of prop drilling**: Components read search params via `routeApi.useSearch()` and update via `routeApi.useNavigate()`.
- **Custom layout, not ListingShell**: The 3-panel grid (sidebar 240px + detail | templates 400px) is purpose-built in CSS modules.
- **Card engine for live preview**: `ColoredTemplateThumbnail` uses `prepareTemplate` + `withPresetColors` + `applyEditsForRender` from `@fs-card-engine` to render SVG templates with the selected palette's colors in real time.

## File Map

All feature files live under `src/features/team-colors/`:

| File                                          | Purpose                                        |
| --------------------------------------------- | ---------------------------------------------- |
| `index.ts`                                    | Barrel — exports `TeamColorsPage` only         |
| `pages/team-colors-page.tsx`                  | Thin page wrapper (Head + usePageHeader)       |
| `components/team-colors-layout.tsx`           | Main layout, state management, data fetching   |
| `components/palette-sidebar.tsx`              | Scrollable team list with keyboard nav         |
| `components/palette-sidebar-item.tsx`         | Single team row (name, league, swatches)       |
| `components/palette-detail-panel.tsx`         | Loads full palette, renders edit + scheme      |
| `components/palette-section.tsx`              | Editable color pairs with ColorPicker popovers |
| `components/color-scheme-section.tsx`         | Read-only color table (BG / FG per area)       |
| `components/template-preview-grid.tsx`        | Template thumbnails filtered by side           |
| `components/colored-template-thumbnail.tsx`   | SVG render with preset colors applied          |
| `components/color-type-toggle.tsx`            | SegmentedControl: colors vs text               |
| `components/league-filter-pills.tsx`          | Pill buttons for league filtering              |
| `components/team-colors-layout.module.css`    | Main grid layout                               |
| `components/palette-sidebar-item.module.css`  | Item hover/selected states                     |
| `components/league-filter-pills.module.css`   | Pill active states                             |
| `components/template-preview-grid.module.css` | Grid scrolling, thumbnail styling              |

**Route file**: `src/routes/_authenticated/admin/team-colors.tsx`

## Data Flow

### API hooks used

| Hook                      | Source feature              | Purpose                         |
| ------------------------- | --------------------------- | ------------------------------- |
| `useLeagues()`            | `@/features/colors`         | Populate league filter pills    |
| `useColorTeams(params)`   | `@/features/colors`         | Paginated team list (sidebar)   |
| `useColorPalette(id)`     | `@/features/color-palettes` | Full palette for detail panel   |
| `useUpdateColorPalette()` | `@/features/color-palettes` | Save edited color pairs         |
| `useTemplates(params)`    | `@/features/templates`      | Template list for preview grid  |
| `useTemplateSvgJson(id)`  | `@/features/templates`      | SVG JSON for colored thumbnails |

### Search params schema

Defined in the route file with Valibot. Defaults are stripped from the URL via `stripSearchParams`:

```ts
colorType: 'colors' | 'text'; // default: 'colors'
search: string; // default: ''
leagueFilter: 'all' | 'popular' | number; // default: 'all'
paletteId: number | undefined; // auto-selected to first team
teamPage: number; // default: 1
teamLimit: number; // default: 20
templateSide: 'all' | 'front' | 'back'; // default: 'all'
```

### Types

- `ColorTeam` (from `@/features/colors`) — `id`, `name`, `abbreviation`, `colorPaletteId`, `leagueId`, `userId`, `league?`, `palette?`
- `ColorPair` (from `@/features/color-palettes`) — `{ bg: string, fg: string, rank: number }`
- `ColorPalette` (from `@/features/color-palettes`) — `id`, `name`, `colorPairs[]`, `isActive`, `teams?[]`, `templates?[]`
- `League` (from `@/features/colors`) — `id`, `name`, `label`, `rank`, `isActive`
- `Template` (from `@/features/templates`) — `id`, `side`, `name`, `templateImage`, `templateImageMedium`, `tags[]`

Do NOT create duplicate types in `team-colors/types/`. Import from the source features.

## Patterns to Follow

### Adding new components

1. Create in `src/features/team-colors/components/`
2. Only export from `index.ts` if it's a page — internal components stay internal
3. Use CSS Modules for layout/state-based styles; Tailwind for quick utilities; Mantine props for component appearance (see `docs/STYLING_GUIDE.md`)

### State changes

All filter/selection state goes through URL search params:

```tsx
const navigate = routeApi.useNavigate();

// Update a param
void navigate({
  search: (prev) => ({ ...prev, paramName: newValue }),
  replace: true, // for filters; omit for selections
});
```

Use `replace: true` for filter changes (search, league filter) to avoid polluting browser history. Omit it for discrete selections (paletteId) so back-button works.

### Editing color pairs

`PaletteSection` maintains local state initialized from the palette's `colorPairs` prop, with a `useEffect` sync when the prop changes (palette switch). The "Save" button appears only when local state diverges from the server state (`isDirty` check via JSON comparison). Mutations use `useUpdateColorPalette()`.

### Template color preview

The `ColoredTemplateThumbnail` component:

1. Fetches SVG JSON via `useTemplateSvgJson(templateId)`
2. Runs `prepareTemplate()` to get editable fields
3. Applies `withPresetColors()` using the selected palette's bg colors
4. Renders via `<SvgRenderer />`

The `presetColors` array should be stabilized with `useMemo` in the parent to avoid unnecessary re-renders.

### CSS layout

The main layout uses a sticky wrapper that fills the viewport below the admin header:

```css
height: calc(100vh - 180px); /* below header + page title + padding */
display: grid;
grid-template-columns: 1fr 400px;
```

The left panel uses a nested grid: `grid-template-columns: 240px 1fr` for sidebar + detail.

## Backend API

When creating or modifying API hooks for this feature, fetch the OpenAPI spec at:
`https://api-development.futurestars.cards/api.json`

Key endpoints:

- `GET /admin/leagues`
- `GET /admin/color-teams` (params: search, leagueId, featured, page, limit)
- `GET /admin/color-palettes/{id}`
- `PATCH /admin/color-palettes/{id}` (body: name?, colorPairs?, isActive?)
- `GET /admin/templates` (params: limit, side, search, tagIds)
- `GET /templates/{id}/svg-json`

## Known TODOs / Incomplete Areas

These are placeholders or unfinished pieces that need implementation:

- **"Add" button in PaletteSidebar header** — no handler, should open a create-team flow
- **"Add +" and "Edit" buttons in PaletteDetailPanel** — no handlers
- **Image/Gallery view toggles in TemplatePreviewGrid** — buttons exist but aren't wired
- **Client-side team filtering** (`userId == null`) — ideally should be a server-side param
- **Pagination** — teams have pagination; templates currently fetch all (limit: 100)
- **Template-palette linking** — palette `templates` relationship exists but isn't surfaced in the UI yet
- **Drag-to-reorder color pairs** — `rank` field exists but no DnD implemented
