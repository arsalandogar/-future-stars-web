# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server with HMR
npm run build        # Type-check with tsc and build for production
npm run lint         # Run ESLint
npm run format       # Format all files with Prettier
npm run format:check # Check if files are formatted
npm run preview      # Preview production build locally
```

## Architecture

This is a React 19 + TypeScript + Vite application with the React Compiler enabled, following the [Bulletproof React](https://github.com/alan2207/bulletproof-react) project structure.

**Key configuration:**

- React Compiler is enabled via `babel-plugin-react-compiler` in `vite.config.ts`
- TypeScript uses strict mode with additional linting rules (`noUnusedLocals`, `noUnusedParameters`)
- ESLint configured with TypeScript, React Hooks, and React Refresh plugins
- Path alias `@/*` maps to `src/*` for clean imports
- UI components use [Mantine](https://mantine.dev) - reference https://mantine.dev/llms.txt for documentation
- Backend API documentation is in [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) - reference this for all API endpoints, request/response formats, and authentication

**Entry point:** `src/main.tsx` renders `<AppProvider>` and `<AppRouter>` inside `<StrictMode>`

### Routing

Uses **TanStack Router** with file-based routing:

- Routes are defined in `src/routes/` directory
- Route tree is auto-generated to `src/routeTree.gen.ts` (do not edit manually)
- Layout routes use `route.tsx` files (e.g., `src/routes/auth/route.tsx` wraps `/auth/*`)
- Root route at `src/routes/__root.tsx` defines global error, pending, and 404 components

### Data Fetching

Uses **TanStack Query** with preconfigured defaults in `src/lib/react-query.ts`:

- Queries don't refetch on window focus, don't retry on failure, and have 1-minute stale time
- Use `QueryConfig` and `MutationConfig` types from `@/lib/react-query` for type-safe query/mutation options
- API requests use the Axios client from `@/lib/api-client` which handles auth tokens and error notifications

### Forms

Uses **TanStack Form** with **Valibot** for schema validation

### State Management

Uses **Zustand** with persist middleware for global state:

- Feature stores go in `src/features/<feature>/stores/`
- Shared stores go in `src/stores/`
- Use `persist` middleware with `localStorage` for state that should survive page reloads (see `src/features/auth/stores/auth-store.ts` for example)

### Styling

Uses **Tailwind CSS v4** with **Mantine v7** via `tailwind-preset-mantine`. See [STYLING_GUIDE.md](./docs/STYLING_GUIDE.md) for detailed guidance.

**Quick reference:**

| Scenario                                    | Approach            |
| ------------------------------------------- | ------------------- |
| Layout (flex, grid, positioning)            | Tailwind            |
| Spacing between components                  | Tailwind            |
| Component appearance (color, size, variant) | Mantine props       |
| Small tweaks (1-4 properties)               | Mantine style props |
| State-based styling (`data-*` attributes)   | CSS Modules         |
| Complex hover/focus combinations            | CSS Modules         |
| 5+ style modifications                      | CSS Modules         |

### Environment Variables

Environment variables are accessed via `src/config/env.ts`:

- `VITE_API_URL` - Backend API base URL (required)
- Access via `import { env } from '@/config/env'`

## Project Structure

```
src/
├── app/              # Application layer (routes, providers, router config)
├── assets/           # Static files (images, fonts, SVGs)
├── components/       # Shared components used across the application
├── config/           # Global configuration and environment variables
├── features/         # Feature-based modules (primary code organization)
├── hooks/            # Shared reusable hooks
├── lib/              # Preconfigured reusable libraries
├── stores/           # Global state management
├── testing/          # Test utilities and mocks
├── types/            # Shared TypeScript types
└── utils/            # Shared utility functions
```

### Feature Structure

Each feature in `src/features/` should be self-contained:

```
src/features/example-feature/
├── api/              # API requests and hooks for this feature
├── assets/           # Feature-specific static files
├── components/       # Feature-scoped components
├── hooks/            # Feature-specific hooks
├── stores/           # Feature state management
├── types/            # TypeScript types for this feature
└── utils/            # Feature utility functions
```

Only include folders that are needed for each feature.

### Import Rules

The codebase follows a unidirectional architecture: `shared → features → app`

- **Shared modules** (`components`, `hooks`, `utils`, etc.) can be imported anywhere
- **Features** can import from shared modules but NOT from:
  - Other features (to maintain independence)
  - The app layer (to maintain unidirectional flow)
- **App layer** can import from both features and shared modules

These rules are enforced by ESLint via `no-restricted-imports`.

### Path Aliases

Use the `@/` alias for imports instead of relative paths:

```typescript
// Good
import { Button } from '@/components/button';
import { useAuth } from '@/features/auth';

// Avoid
import { Button } from '../../../components/button';
```

### Naming Conventions

Enforced by ESLint via `eslint-plugin-check-file`:

- **Files**: All `.ts` and `.tsx` files must use `kebab-case` (e.g., `user-profile.tsx`)
- **Folders**: All folders in `src/` must use `kebab-case` (except `__tests__`)

### Pre-commit Hooks

Husky runs lint-staged on every commit, which:

- Runs ESLint with auto-fix on `.ts` and `.tsx` files
- Formats all staged files with Prettier
