# @arslandogar/fs-card-engine

Shared card editing engine for Future Stars.

## Problem

A card is created from a **template SVG** + **user edits** (text, colors, images). Three platforms need to produce the same result from the same inputs:

- **React web app** — live preview in the editor
- **Node.js backend** — final SVG → PNG rendering
- **React Native app** — mobile editor

If each platform implements its own edit logic, they will drift. A color that looks right on web could render differently on the backend. This package is the single source of truth.

## How It Works

Templates are SVG files annotated with `data-*` attributes during the design process (handled by a separate admin tool). These attributes mark which elements are editable and what type of edit they accept:

- `data-text-field="firstName"` — editable text
- `data-color-field="colorOne"` + `data-color-target="fill"` — editable color
- `data-color-offset="0.05,0,-0.01"` — derived shade (OKLAB perceptual math)
- `data-image-field="imageOne"` — editable image

Given a template SVG and a set of edits, the engine:

1. **Parses** the SVG string into a JSON tree
2. **Discovers** editable fields by walking the tree for `data-*` attributes
3. **Applies** each edit — replacing text content, computing derived colors, swapping image URLs and adjusting bounds
4. **Serializes** the modified tree back to an SVG string

All operations are pure functions on plain JSON. No DOM, no React, no browser APIs.

## What's Shared vs Platform-Specific

| Shared (this package)                    | Platform-specific                  |
| ---------------------------------------- | ---------------------------------- |
| SVG parsing and serialization            | SVG → PNG rendering (backend)      |
| Field discovery from `data-*` attributes | React DOM renderer (web)           |
| Text, color, and image edit application  | react-native-svg renderer (mobile) |
| OKLAB perceptual color math              | Zustand stores and UI components   |
| Field vocabulary and types               | Image upload and cropping          |

## Dependencies

- **culori** — pure JS OKLAB color conversions
- **svgson** — SVG string ↔ JSON tree parsing

No native modules, no DOM APIs. Works in Node.js, browsers, and React Native (Hermes/JSC).
