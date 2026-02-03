import {
  Button,
  Checkbox,
  Group,
  Pagination,
  Select,
  Skeleton,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { Check, Search, SlidersHorizontal } from 'lucide-react';

import { ListingShell, useListingContext } from '@/components/ui/listing';
import { usePageHeader } from '@/hooks/use-page-header';

import { useAddToBatchModalStore } from '@/features/print-batches';

import { useOrders } from '../api/get-orders';
import { useOrderSelectionStore } from '../stores/order-selection-store';

import { BulkActionsMenu } from './bulk-actions-menu';
import { OrderRow } from './order-row';

const COLUMNS = [
  { label: '', width: 50 },
  { label: 'ID', width: 80 },
  { label: 'User', width: 180 },
  { label: 'Date', width: 120 },
  { label: 'Batch', width: 100 },
  { label: '# of Packs', width: 100 },
  { label: 'Total', width: 100 },
  { label: 'Status', width: 120 },
  { label: 'Fulfillment Status', width: 140 },
  { label: 'Actions', width: 60 },
];

const PAGE_SIZE_OPTIONS = [
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
  { value: '100', label: '100' },
];

export function OrdersList() {
  const { page, limit, search, setPage, setLimit, setSearch } =
    useListingContext();
  const { selectedOrderIds, selectAll, clearSelection } =
    useOrderSelectionStore();
  const { open: openAddToBatchModal } = useAddToBatchModalStore();

  usePageHeader({
    title: 'Orders',
    description: 'Manage and fulfill your custom card pack orders.',
  });

  const queryResult = useOrders({
    variables: {
      page,
      limit,
      search: search || undefined,
    },
  });

  const orders = queryResult.data?.data ?? [];
  const meta = queryResult.data?.meta;
  const selectedCount = selectedOrderIds.size;

  const currentPageOrderIds = orders.map((order) => order.id);
  const allCurrentPageSelected =
    currentPageOrderIds.length > 0 &&
    currentPageOrderIds.every((id) => selectedOrderIds.has(id));

  const handleSelectAllToggle = () => {
    if (allCurrentPageSelected) {
      clearSelection();
    } else {
      selectAll(currentPageOrderIds);
    }
  };

  const handleAddToBatch = () => {
    const orderIds = Array.from(selectedOrderIds);
    const ordersInBatch = orders
      .filter((order) => selectedOrderIds.has(order.id) && order.printBatch)
      .map((order) => order.id);
    openAddToBatchModal(orderIds, ordersInBatch);
  };

  return (
    <ListingShell
      showSearch={false}
      showFilter={false}
      actions={
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            leftSection={<SlidersHorizontal size={16} />}
          >
            Filter
          </Button>
          <BulkActionsMenu
            selectedCount={selectedCount}
            onAddToBatch={handleAddToBatch}
          />
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <TextInput
            placeholder="Search..."
            leftSection={<Search size={16} />}
            defaultValue={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            className="w-80"
          />
          {selectedCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Check size={16} />
              <span>{selectedCount} Orders Selected</span>
            </div>
          )}
        </div>

        <Table horizontalSpacing="md" verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={COLUMNS[0].width}>
                <Checkbox
                  checked={allCurrentPageSelected}
                  indeterminate={selectedCount > 0 && !allCurrentPageSelected}
                  onChange={handleSelectAllToggle}
                  radius="xl"
                  aria-label="Select all orders on this page"
                />
              </Table.Th>
              {COLUMNS.slice(1).map((column) => (
                <Table.Th key={column.label} w={column.width}>
                  {column.label}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          {queryResult.isLoading ? (
            <Table.Tbody>
              {Array.from({ length: 5 }).map((_, rowIndex) => (
                // eslint-disable-next-line react-x/no-array-index-key
                <Table.Tr key={rowIndex}>
                  {COLUMNS.map((column) => (
                    <Table.Td key={column.label || 'checkbox'}>
                      <Skeleton height={20} width={column.width ?? '70%'} />
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))}
            </Table.Tbody>
          ) : orders.length === 0 ? (
            <Table.Tbody>
              <Table.Tr>
                <Table.Td colSpan={COLUMNS.length}>
                  <Text ta="center" c="dimmed" py="xl">
                    No orders found
                  </Text>
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          ) : (
            <Table.Tbody>
              {orders.map((order) => (
                <Table.Tr key={order.id}>
                  <OrderRow order={order} />
                </Table.Tr>
              ))}
            </Table.Tbody>
          )}
        </Table>

        {meta && (
          <Group justify="center" gap="lg">
            <Group gap="xs">
              <Text size="sm" c="dimmed">
                Show
              </Text>
              <Select
                data={PAGE_SIZE_OPTIONS}
                value={String(limit)}
                onChange={(value) => {
                  if (value) setLimit(Number(value));
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
                onChange={setPage}
                total={meta.lastPage}
              />
            )}
          </Group>
        )}
      </div>
    </ListingShell>
  );
}
