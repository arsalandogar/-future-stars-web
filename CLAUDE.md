# CLAUDE.md

React 19 + TypeScript + Vite application.

## Commands

```bash
npm run dev     # Start development server with HMR
npm run build   # Type-check with tsc and build for production
npm run lint    # Run ESLint
npm run format  # Format all files with Prettier
```

## Skills

Use these skills when working in their respective areas:

- `/vercel-react-best-practices` — React performance optimization
- `/tanstack-router-best-practices` — routing, navigation, search params
- `/tanstack-query-best-practices` — data fetching, caching, mutations
- `/tanstack-integration-best-practices` — TanStack Query + Router integration
- `/stripe-best-practices` — payment integration
- `/simplify` — review changed code for reuse and quality
- `/docs-writer` — writing or editing docs

## Key Tech

- UI components use [Mantine](https://mantine.dev) — reference https://mantine.dev/llms.txt for documentation
- **Primary color**: `var(--mantine-color-primary-4)` (`#5046FF`)
- **Card images**: Never apply border-radius — always sharp corners
- Icons use [Lucide React](https://lucide.dev/icons/) — import from `lucide-react`
- **Backend API**: Fetch the OpenAPI spec at https://api-development.futurestars.cards/api.json when creating or modifying API hooks
- **Monorepo**: `@fs-card-engine` alias resolves to `packages/card-engine/src/index.ts` in dev

## Architecture Rules

- **Import direction**: `shared → features → app` (enforced by ESLint)
- **Feature barrel files**: Each feature has an `index.ts` — import from `@/features/x`, not internals
- **Types**: Shared types live in `src/types/`, feature types in `src/features/<feature>/types/`. Never re-export shared types from features. Check `src/types/` before creating new types.

## Detailed Docs

- [Routing](./docs/routing.md) — TanStack Router, file-based routes, thin route files
- [Data Fetching](./docs/data-fetching.md) — TanStack Query, react-query-kit, query invalidation
- [Forms](./docs/forms.md) — TanStack Form, Valibot, useAppForm, field components
- [UI Patterns](./docs/ui-patterns.md) — Page headers, listing pages, modal styling
- [State Management](./docs/state-management.md) — Zustand, URL search params
- [Styling Guide](./docs/STYLING_GUIDE.md) — Tailwind CSS v4 + Mantine v7
