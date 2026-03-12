# State Management

> Skills: `/tanstack-router-best-practices` (for URL search params)

Uses **Zustand** with persist middleware for global state:

- Global/shared stores go in `src/stores/`
- Feature stores go in `src/features/<feature>/stores/`
- Layout-specific stores go in `src/app/layouts/<layout>/stores/`
- Use `persist` middleware with `localStorage` for state that should survive page reloads (see `src/stores/auth-store.ts` for example)

## URL Search Params

[Search Params are State](https://tanstack.com/blog/search-params-are-state) — use for filters, pagination, search queries, sorting, and any state that should be bookmarkable/shareable:

- Define search params schema with `validateSearch` using Valibot on the route
- Write with `<Link search={...}>` or `useNavigate({ search: ... })`
- **Feature-specific params** (e.g., `side` filter for templates) belong in the feature's route file, not shared layout routes
- **Accessing search params in components**: Use `getRouteApi` to read params directly, avoiding prop drilling:

  ```typescript
  // In a feature component (e.g., src/features/templates/components/templates-list.tsx)
  import { getRouteApi } from '@tanstack/react-router';

  const routeApi = getRouteApi('/_authenticated/admin/_listing/templates');

  export function TemplatesList() {
    const { side } = routeApi.useSearch(); // Typed, no prop drilling
  }
  ```

- **Avoid `useSearch({ strict: false })`** — it loses type safety. Use `getRouteApi` instead
