import { Group, Pagination, Select, Text } from '@mantine/core';

import type { PaginationMeta } from '@/types';

const PAGE_SIZE_OPTIONS = [
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
  { value: '100', label: '100' },
];

export interface ListingPaginationProps {
  meta: PaginationMeta;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function ListingPagination({
  meta,
  page,
  limit,
  onPageChange,
  onLimitChange,
}: ListingPaginationProps) {
  return (
    <Group justify="center" gap="lg">
      <Group gap="xs">
        <Text size="sm" c="dimmed">
          Show
        </Text>
        <Select
          data={PAGE_SIZE_OPTIONS}
          value={String(limit)}
          onChange={(value) => {
            if (value) onLimitChange(Number(value));
          }}
          size="xs"
          w={70}
        />
        <Text size="sm" c="dimmed">
          per page
        </Text>
      </Group>
      {meta.lastPage > 1 && (
        <Pagination
          value={page}
          onChange={onPageChange}
          total={meta.lastPage}
        />
      )}
    </Group>
  );
}
