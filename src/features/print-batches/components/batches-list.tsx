import { useState } from 'react';
import {
  Button,
  Checkbox,
  Group,
  Menu,
  Pagination,
  Select,
  Skeleton,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  Check,
  ChevronDown,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from 'lucide-react';

import { ListingShell, useListingContext } from '@/components/ui/listing';
import { usePageHeader } from '@/hooks/use-page-header';

import { usePrintBatches } from '../api/get-print-batches';
import { useBatchSelectionStore } from '../stores/batch-selection-store';
import type { PrintBatch } from '../types';

import { BatchRow } from './batch-row';
import { BatchStatusModal } from './batch-status-modal';

const COLUMNS = [
  { label: '', width: 50 },
  { label: 'ID', width: 80 },
  { label: 'Batch Name', width: 200 },
  { label: 'Created', width: 120 },
  { label: 'Order Count', width: 120 },
  { label: 'Status', width: 120 },
  { label: 'Actions', width: 60 },
];

const PAGE_SIZE_OPTIONS = [
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
  { value: '100', label: '100' },
];

export function BatchesList() {
  const { page, limit, search, setPage, setLimit, setSearch } =
    useListingContext();
  const { selectedBatchIds, selectAll, clearSelection } =
    useBatchSelectionStore();
  const [
    statusModalOpened,
    { open: openStatusModal, close: closeStatusModal },
  ] = useDisclosure(false);
  const [editingBatch, setEditingBatch] = useState<PrintBatch | undefined>();

  usePageHeader({
    title: 'Batches',
    description: 'Manage and review your existing batches.',
  });

  const queryResult = usePrintBatches({
    variables: {
      page,
      limit,
      search: search || undefined,
    },
  });

  const batches = queryResult.data?.data ?? [];
  const meta = queryResult.data?.meta;
  const selectedCount = selectedBatchIds.size;

  const currentPageBatchIds = batches.map((batch) => batch.id);
  const allCurrentPageSelected =
    currentPageBatchIds.length > 0 &&
    currentPageBatchIds.every((id) => selectedBatchIds.has(id));

  const handleSelectAllToggle = () => {
    if (allCurrentPageSelected) {
      clearSelection();
    } else {
      selectAll(currentPageBatchIds);
    }
  };

  const handleBulkUpdateStatus = () => {
    setEditingBatch(undefined);
    openStatusModal();
  };

  const handleEditBatch = (batch: PrintBatch) => {
    setEditingBatch(batch);
    openStatusModal();
  };

  return (
    <>
      <BatchStatusModal
        opened={statusModalOpened}
        onClose={closeStatusModal}
        batch={editingBatch}
        selectedBatchIds={
          editingBatch ? undefined : Array.from(selectedBatchIds)
        }
      />
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
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <Button
                  variant="filled"
                  rightSection={<ChevronDown size={16} />}
                  disabled={selectedCount === 0}
                >
                  Bulk Actions
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<RefreshCw size={14} />}
                  onClick={handleBulkUpdateStatus}
                >
                  Update Status
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
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
                <span>{selectedCount} Batches Selected</span>
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
                    aria-label="Select all batches on this page"
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
            ) : batches.length === 0 ? (
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td colSpan={COLUMNS.length}>
                    <Text ta="center" c="dimmed" py="xl">
                      No batches found
                    </Text>
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            ) : (
              <Table.Tbody>
                {batches.map((batch) => (
                  <Table.Tr key={batch.id}>
                    <BatchRow batch={batch} onEdit={handleEditBatch} />
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
    </>
  );
}
