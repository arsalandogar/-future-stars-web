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
- Icons use [Lucide React](https://lucide.dev/icons/) - import from `lucide-react`
- Backend API documentation is in [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) - reference this for all API endpoints, request/response formats, and authentication

**Entry point:** `src/main.tsx` renders `<AppProvider>` and `<AppRouter>` inside `<StrictMode>`

### Routing

Uses **TanStack Router** with file-based routing:

- Routes are defined in `src/routes/` directory
- Route tree is auto-generated to `src/routeTree.gen.ts` (do not edit manually)
- Layout routes use `route.tsx` files (e.g., `src/routes/auth/route.tsx` wraps `/auth/*`)
- Root route at `src/routes/__root.tsx` defines global error, pending, and 404 components

### Data Fetching

Uses **TanStack Query** with **react-query-kit** for type-safe API hooks:

- Create queries with `createQuery` and mutations with `createMutation` from `@/lib/react-query`
- API hooks are defined in `src/features/<feature>/api/` using this pattern:
  ```typescript
  export const useOrders = createQuery({
    queryKey: ['admin', 'orders'],
    fetcher: (params: OrdersListParams): Promise<OrdersListResponse> =>
      api.get('admin/orders'),
  });
  ```
- The Axios client in `@/lib/api-client` automatically unwraps `response.data`, so fetchers receive data directly
- Default query config: no refetch on window focus, no retry on failure, 1-minute stale time

**Query Invalidation:** Use the `invalidateQueries` middleware to automatically invalidate queries after mutations:

```typescript
import { createMutation, invalidateQueries } from '@/lib/react-query';
import { useOrders } from './get-orders';

export const useUpdateOrder = createMutation({
  mutationFn: (data: UpdateOrderParams): Promise<Order> =>
    api.put(`admin/orders/${data.id}`, data),
  use: [invalidateQueries([useOrders.getKey()])],
});
```

The middleware supports:

- Multiple query keys: `invalidateQueries([useOrders.getKey(), useOrder.getKey()])`
- Conditional invalidation with guards: `{ queryKey: [...], guard: (data) => data.status === 'completed' }`

### Forms

Uses **TanStack Form** with **Valibot** for schema validation and form composition via `createFormHook`:

- Use `useAppForm` from `@/lib/form` instead of `useForm` for pre-bound field components
- Use `form.AppField` with field components like `<field.TextField label="Name" />`
- Available field components: `TextField`, `PasswordField`, `SelectField`, `TextareaField`, `FloatingTextField`, `FloatingPasswordField`
- Available form components: `Form`, `SubmitButton` (wrap with `<form.AppForm>` to use)

```typescript
import { useAppForm } from '@/lib/form';

const form = useAppForm({
  defaultValues: { name: '' },
  validators: { onDynamic: schema },
  validationLogic: revalidateLogic(),
  onSubmit: ({ value }) => { /* ... */ },
});

// In JSX:
<form.AppForm>
  <form.Form>
    <form.AppField name="name">
      {(field) => <field.TextField label="Name" />}
    </form.AppField>
    <form.SubmitButton>Submit</form.SubmitButton>
  </form.Form>
</form.AppForm>
```

To add new field components, create them in `src/components/form/fields/` using `useFieldContext` from `@/lib/form-context`, then register in `src/lib/form.ts`

### State Management

Uses **Zustand** with persist middleware for global state:

- Global/shared stores go in `src/stores/`
- Feature stores go in `src/features/<feature>/stores/`
- Layout-specific stores go in `src/app/layouts/<layout>/stores/`
- Use `persist` middleware with `localStorage` for state that should survive page reloads (see `src/stores/auth-store.ts` for example)

**URL Search Params** for shareable UI state - [Search Params are State](https://tanstack.com/blog/search-params-are-state):

- Use for filters, pagination, search queries, sorting, and any state that should be bookmarkable/shareable
- Define search params schema with `validateSearch` using Valibot on the route
- Read with `Route.useSearch()`, write with `<Link search={...}>` or `useNavigate({ search: ... })`

### Types

- **Shared types** (`User`, `UserRole`, `Token`, `PaginationMeta`) live in `src/types/` - import directly from `@/types`
- **Feature types** live in `src/features/<feature>/types/` - only for types specific to that feature
- **Never re-export shared types** from features - always import from `@/types`
- Before creating a new type, check `src/types/` to see if it already exists
- If a type is used by multiple features, move it to `src/types/`

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

Each feature must have an `index.ts` barrel file that exports its public API (components, hooks, types). Other parts of the app should only import from the feature's index, not from internal files.

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
