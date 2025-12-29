import type { ReactNode } from 'react';
import { Group, Pagination, Paper, Skeleton, Table, Text } from '@mantine/core';

export interface Column {
  label: string;
  width?: number | string;
}

export interface DataTablePagination {
  page: number;
  total: number;
  onChange: (page: number) => void;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column[];
  isLoading?: boolean;
  emptyMessage?: string;
  /**
   * Renders the content of a table row. Must return `Table.Td` elements only,
   * as the `Table.Tr` wrapper is provided by the DataTable component.
   */
  renderRow: (item: T, index: number) => ReactNode;
  pagination?: DataTablePagination;
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

export function DataTable<T>({
  data,
  columns,
  isLoading = false,
  emptyMessage = 'No data found',
  renderRow,
  pagination,
  keyExtractor,
  skeletonCount = 5,
}: DataTableProps<T>) {
  return (
    <div className="flex flex-col gap-4">
      <Paper withBorder radius="md">
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
          {isLoading ? (
            <TableSkeleton columns={columns} rowCount={skeletonCount} />
          ) : data.length === 0 ? (
            <EmptyState message={emptyMessage} colSpan={columns.length} />
          ) : (
            <Table.Tbody>
              {data.map((item, index) => (
                <Table.Tr key={keyExtractor(item)}>
                  {renderRow(item, index)}
                </Table.Tr>
              ))}
            </Table.Tbody>
          )}
        </Table>
      </Paper>

      {pagination && pagination.total > 1 && (
        <Group justify="center">
          <Pagination
            value={pagination.page}
            onChange={pagination.onChange}
            total={pagination.total}
          />
        </Group>
      )}
    </div>
  );
}
