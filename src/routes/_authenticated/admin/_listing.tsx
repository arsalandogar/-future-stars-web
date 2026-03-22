import {
  createFileRoute,
  Outlet,
  stripSearchParams,
  useNavigate,
} from '@tanstack/react-router';
import { useDebouncedCallback } from '@mantine/hooks';
import * as v from 'valibot';

import { ListingProvider } from '@/components/ui/listing';

const defaultValues = {
  search: '',
};

const listingSearchSchema = v.object({
  page: v.optional(
    v.fallback(v.pipe(v.number(), v.integer(), v.minValue(1)), 1),
    1
  ),
  limit: v.optional(
    v.fallback(
      v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(100)),
      50
    ),
    50
  ),
  search: v.optional(v.fallback(v.string(), ''), ''),
});

export type ListingSearch = v.InferOutput<typeof listingSearchSchema>;

export const Route = createFileRoute('/_authenticated/admin/_listing')({
  validateSearch: listingSearchSchema,
  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },
  component: ListingLayout,
});

function ListingLayout() {
  const { page, limit, search } = Route.useSearch();
  const navigate = useNavigate();

  const setPage = (newPage: number) => {
    void navigate({ to: '.', search: (prev) => ({ ...prev, page: newPage }) });
  };

  const setLimit = (newLimit: number) => {
    void navigate({
      to: '.',
      search: (prev) => ({ ...prev, limit: newLimit, page: 1 }),
    });
  };

  const setSearch = useDebouncedCallback((newSearch: string) => {
    void navigate({
      to: '.',
      search: (prev) => ({ ...prev, search: newSearch, page: 1 }),
      replace: true,
    });
  }, 300);

  return (
    <ListingProvider
      value={{ page, limit, search, setPage, setLimit, setSearch }}
    >
      <Outlet />
    </ListingProvider>
  );
}
