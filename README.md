# Future Stars Web

## Tech Stack

- **React 19** with React Compiler enabled
- **TypeScript**
- **Vite**
- **ESLint** with TypeScript, React Hooks, and React Refresh plugins
- **Prettier** for code formatting
- **Husky** + **lint-staged** for pre-commit hooks

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Scripts

| Command                | Description                                  |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Start development server with HMR            |
| `npm run build`        | Type-check with tsc and build for production |
| `npm run lint`         | Run ESLint                                   |
| `npm run format`       | Format all files with Prettier               |
| `npm run format:check` | Check if files are formatted                 |
| `npm run preview`      | Preview production build locally             |

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

Each feature in `src/features/` is self-contained:

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

## Architecture

The codebase follows a unidirectional architecture: `shared → features → app`

- **Shared modules** (`components`, `hooks`, `utils`, etc.) can be imported anywhere
- **Features** can import from shared modules but NOT from other features or the app layer
- **App layer** can import from both features and shared modules

## Conventions

### Imports

Use the `@/` path alias for imports:

```typescript
import { Button } from '@/components/button';
import { useAuth } from '@/features/auth';
```

### Naming

- **Files**: Use `kebab-case` for all `.ts` and `.tsx` files (e.g., `user-profile.tsx`)
- **Folders**: Use `kebab-case` for all folders in `src/`
