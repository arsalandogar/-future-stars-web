import { type ReactNode, use } from 'react';
import {
  Group,
  Pagination,
  Select,
  Skeleton,
  Table,
  Text,
} from '@mantine/core';
import type { PaginationMeta } from '@/types';

import { ListingContext } from './listing/listing-context';

export interface Column {
  label: string;
  width?: number | string;
}

const PAGE_SIZE_OPTIONS = [
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
  { value: '100', label: '100' },
];

export interface DataTableProps<T> {
  queryResult: {
    data: { data: T[]; meta?: PaginationMeta } | undefined;
    isLoading: boolean;
  };
  columns: Column[];
  emptyMessage?: string;
  /**
   * Renders the content of a table row. Must return `Table.Td` elements only,
   * as the `Table.Tr` wrapper is provided by the DataTable component.
   */
  renderRow: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T) => string | number;
  skeletonCount?: number;
}

function TableSkeleton({
  columns,
  rowCount,
}: {
  columns: Column[];
  rowCount: number;
}) {
  return (
    <Table.Tbody>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        // eslint-disable-next-line react-x/no-array-index-key
        <Table.Tr key={rowIndex}>
          {columns.map((column) => (
            <Table.Td key={column.label}>
              <Skeleton height={20} width={column.width ?? '70%'} />
            </Table.Td>
          ))}
        </Table.Tr>
      ))}
    </Table.Tbody>
  );
}

function EmptyState({
  message,
  colSpan,
}: {
  message: string;
  colSpan: number;
}) {
  return (
    <Table.Tbody>
      <Table.Tr>
        <Table.Td colSpan={colSpan}>
          <Text ta="center" c="dimmed" py="xl">
            {message}
          </Text>
        </Table.Td>
      </Table.Tr>
    </Table.Tbody>
  );
}

interface TableBodyProps<T> {
  isLoading: boolean;
  items: T[];
  columns: Column[];
  emptyMessage: string;
  renderRow: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T) => string | number;
  skeletonCount: number;
}

function TableBody<T>({
  isLoading,
  items,
  columns,
  emptyMessage,
  renderRow,
  keyExtractor,
  skeletonCount,
}: TableBodyProps<T>) {
  if (isLoading) {
    return <TableSkeleton columns={columns} rowCount={skeletonCount} />;
  }

  if (items.length === 0) {
    return <EmptyState message={emptyMessage} colSpan={columns.length} />;
  }

  return (
    <Table.Tbody>
      {items.map((item, index) => (
        <Table.Tr key={keyExtractor(item)}>{renderRow(item, index)}</Table.Tr>
      ))}
    </Table.Tbody>
  );
}

export function DataTable<T>({
  queryResult,
  columns,
  emptyMessage = 'No data found',
  renderRow,
  keyExtractor,
  skeletonCount = 5,
}: DataTableProps<T>) {
  const listingContext = use(ListingContext);
  const items = queryResult.data?.data ?? [];
  const meta = queryResult.data?.meta;

  return (
    <div className="flex flex-col gap-4">
      <Table horizontalSpacing="md" verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            {columns.map((column) => (
              <Table.Th key={column.label} w={column.width}>
                {column.label}
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <TableBody
          isLoading={queryResult.isLoading}
          items={items}
          columns={columns}
          emptyMessage={emptyMessage}
          renderRow={renderRow}
          keyExtractor={keyExtractor}
          skeletonCount={skeletonCount}
        />
      </Table>

      {meta && listingContext && (
        <Group justify="center" gap="lg">
          <Group gap="xs">
            <Text size="sm" c="dimmed">
              Show
            </Text>
            <Select
              data={PAGE_SIZE_OPTIONS}
              value={String(listingContext.limit)}
              onChange={(value) => {
                if (value) listingContext.setLimit(Number(value));
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
              value={meta.currentPage}
              onChange={listingContext.setPage}
              total={meta.lastPage}
            />
          )}
        </Group>
      )}
    </div>
  );
}
