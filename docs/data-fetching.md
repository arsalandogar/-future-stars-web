# Data Fetching

> Skills: `/tanstack-query-best-practices`, `/tanstack-integration-best-practices`

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
- **API response wrapping**: The backend wraps resource responses in a `{ data: T }` object. Mutation fetchers must unwrap this before returning:

  ```typescript
  // WRONG — returns { data: User } instead of User
  mutationFn: (params: UpdateParams): Promise<User> =>
    api.patch('users/profile', params),

  // CORRECT — unwrap response.data
  mutationFn: async (params: UpdateParams): Promise<User> => {
    const response: { data: User } = await api.patch('users/profile', params);
    return response.data;
  },
  ```

## Query Invalidation

Use the `invalidateQueries` middleware to automatically invalidate queries after mutations:

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
