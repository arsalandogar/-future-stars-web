import { Text, Group, Card, Title, Button, TextInput } from '@mantine/core';

import { useDebouncedCallback, useDisclosure } from '@mantine/hooks';
import { useState } from 'react';

import { Download, PlusIcon, Search, SlidersHorizontal } from 'lucide-react';
import { DataTable, type Column } from '@/components/ui/data-table';

import { useFeaturedItems } from '../api/get-featured-items';

import type { FeaturedItem } from '../types';

import { FeaturedItemRow } from './featured-item-row';
import { FeaturedItemModal } from './featured-item-modal';
import { getRouteApi } from '@tanstack/react-router';

const routeApi = getRouteApi('/_authenticated/admin/featured-items');

const COLUMNS: Column[] = [
  { label: 'ID', width: 60 },
  { label: 'Image', width: 80 },
  { label: 'Title', width: 150 },
  { label: 'CTA Text', width: 120 },
  { label: 'Template', width: 150 },
  { label: 'Order', width: 70 },
  { label: 'Status', width: 90 },
  { label: 'Created At', width: 110 },
  { label: 'Actions', width: 60 },
];

export function FeaturedItemsList() {
  const { search } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedItem, setSelectedItem] = useState<FeaturedItem | undefined>();

  const handleSearchChange = useDebouncedCallback((newSearch: string) => {
    void navigate({ search: { search: newSearch }, replace: true });
  }, 300);

  const handleCreate = () => {
    setSelectedItem(undefined);
    open();
  };

  const handleEdit = (item: FeaturedItem) => {
    setSelectedItem(item);
    open();
  };

  const { data, isLoading } = useFeaturedItems({
    variables: {
      search: search || undefined,
    },
  });

  const items = data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <FeaturedItemModal item={selectedItem} opened={opened} onClose={close} />
      <Card withBorder radius="md" p="lg">
        <div className="flex flex-col gap-6">
          <Group justify="space-between" align="flex-start">
            <div>
              <Title order={4}>Featured Items List</Title>
              <Text size="sm" c="dimmed">
                View and manage featured items.
              </Text>
            </div>
            <Group>
              <Button
                variant="filled"
                leftSection={<PlusIcon size={18} />}
                onClick={handleCreate}
              >
                Add Featured Item
              </Button>
              <Button
                variant="default"
                leftSection={<Download size={16} />}
                disabled
              >
                Export
              </Button>
            </Group>
          </Group>

          <Group justify="space-between">
            <TextInput
              placeholder="Search..."
              leftSection={<Search size={16} />}
              defaultValue={search}
              onChange={(e) => handleSearchChange(e.currentTarget.value)}
              className="w-80"
            />
            <Button
              variant="default"
              leftSection={<SlidersHorizontal size={16} />}
              disabled
            >
              Filter
            </Button>
          </Group>

          <DataTable
            data={items ?? []}
            columns={COLUMNS}
            isLoading={isLoading}
            emptyMessage="No featured items found"
            keyExtractor={(item) => item.id}
            renderRow={(item) => (
              <FeaturedItemRow item={item} onEdit={handleEdit} />
            )}
          />
        </div>
      </Card>
    </div>
  );
}
