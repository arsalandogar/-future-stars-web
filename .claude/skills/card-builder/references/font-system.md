# Font System

The card builder needs fonts both for browser rendering (so the preview looks correct) and for text compression (which uses opentype.js to measure glyph widths). Two systems work together.

## Static Font Registry (`lib/font-resolver.ts`)

Declares `FontRegistryEntry[]` for bundled fonts:

- **Montserrat**: weights 400, 500, 600, 700, 800, 900
- **Poppins**: weights 400, 500, 600, 700

Each entry has a `locator` URL created via `new URL(..., import.meta.url).href` for Vite compatibility.

### File Token Map

`import.meta.glob` eagerly imports all font files from `assets/fonts/**/*.{ttf,otf,woff,woff2}`. Each filename is normalized via `normalizeFileToken()` and stored in a `fileTokens` Map. This provides fallback resolution when SVGs reference fonts by filename rather than family name.

### Font Resolver

`createFontResolver({ entries, loadFont, fileTokens })` creates the resolver function used by `applyTextCompression()`. The `loadFont` callback fetches the font file and returns `Uint8Array` for opentype.js parsing. Results are cached in a `fontCache` Map (keyed by URL) that persists across compressions within a session.

## Dynamic Font Loading (`lib/ensure-svg-fonts-loaded.ts`)

When an SVG is loaded, `ensureSvgFontsLoaded(root)` ensures the browser can render all referenced fonts:

1. **Collect families:** Recursively walks the SVG tree, extracting `font-family` from both attributes and inline `style` attributes
2. **Skip static families:** Fonts already in the static registry (Montserrat, Poppins) are skipped
3. **Resolve URLs:** `resolveFontUrl(family)` generates filename candidates via `generateFontFileCandidates()` and looks them up in the `fileTokens` map
4. **Register with browser:** Creates `FontFace` objects with `weight: '1 1000'` (variable) and adds to `document.fonts`
5. **Track registration:** `registeredFonts` Set prevents double-registration

After fonts load, the editor store bumps the side's revision (triggering a re-render with correct fonts) and re-runs text compression with accurate glyph measurements.

## Warning Reporter (`lib/text-compression-warning-reporter.ts`)

De-duplicates compression warnings using a `seenWarningKeys` Set keyed by `side|reason|nodeId|message`.

Warning reasons and user messages:

- `font-not-found` → "Font data was not found..."
- `parse-failed` → "Font parsing failed..."
- `unsupported-mixed-style` → "Mixed-style text is not compressed..."
- `invalid-max-width` → "Invalid data-max-width value..."

Warnings only show as Mantine notifications in development (`import.meta.env.DEV`). The cache clears when the editor store resets.
