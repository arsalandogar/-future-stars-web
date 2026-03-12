# Routing

> Skills: `/tanstack-router-best-practices`, `/tanstack-integration-best-practices`

Uses **TanStack Router** with file-based routing:

- Routes are defined in `src/routes/` directory
- Layout routes use `route.tsx` files (e.g., `src/routes/auth/route.tsx` wraps `/auth/*`)

**Route files should be thin wrappers** that only handle routing concerns:

```typescript
// src/routes/_authenticated/admin/legal/$type/$id.tsx
import { createFileRoute } from '@tanstack/react-router';
import { LegalViewPage, type LegalDocumentType } from '@/features/legal';

export const Route = createFileRoute('/_authenticated/admin/legal/$type/$id')({
  component: RouteComponent,
});

function RouteComponent() {
  const { type, id } = Route.useParams();
  return <LegalViewPage type={type as LegalDocumentType} id={Number(id)} />;
}
```

Page components live in `src/features/<feature>/pages/` and contain the actual UI/business logic. This separation keeps route files focused on:

- Route configuration
- Params/search validation
- Loaders and beforeLoad hooks
