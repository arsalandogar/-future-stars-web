# UI Patterns

> Skills: `/web-design-guidelines`

## Page Headers

Pages set their title, description, and breadcrumbs using the `usePageHeader` hook:

```typescript
import { usePageHeader } from '@/hooks/use-page-header';

function UsersListPage() {
  usePageHeader({ title: 'Users', description: 'Manage all users' });
  // ...
}
```

The `PageHeader` component in the admin layout reads from this store and renders the title with breadcrumbs.

## Listing Pages

For admin listing pages, use `ListingShell`, `DataTable`, and `useListingContext`:

```typescript
import { DataTable } from '@/components/ui/data-table';
import { ListingShell, useListingContext } from '@/components/ui/listing';

export function UsersList() {
  const { page, limit, search } = useListingContext();

  const queryResult = useUsers({ variables: { page, limit, search: search || undefined } });

  return (
    <ListingShell searchPlaceholder="Search by name or email...">
      <DataTable
        queryResult={queryResult}
        columns={[{ label: 'Name' }, { label: 'Email' }]}
        keyExtractor={(user) => user.id}
        renderRow={(user) => <UserRow user={user} />}
      />
    </ListingShell>
  );
}
```

The `ListingProvider` is set up at the route level via layout routes.

## Modal Styling

Customer-facing modals use a standardized dark style:

- **Content background**: `#000` (pure black)
- **Content border**: `1px solid color-mix(in srgb, var(--mantine-color-primaryLight-4) 68%, transparent)`
- **Content border-radius**: `20px`
- **Content box-shadow**: `0 0 42px rgba(36, 72, 251, 0.28)`
- **Header border**: `1px solid color-mix(in srgb, var(--mantine-color-primaryLight-4) 68%, transparent)`
- **Overlay**: `backdrop-filter: blur(8px); background: rgba(60, 68, 81, 0.76)`
- **Drawer (mobile)**: Same `#000` background, no border-top, no border-radius, `box-shadow: 0 -16px 40px rgba(36, 72, 251, 0.25)`
