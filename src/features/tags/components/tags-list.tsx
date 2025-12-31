import { Text, Group, Card, Title, Button, TextInput } from '@mantine/core';

import { useDebouncedCallback, useDisclosure } from '@mantine/hooks';
import { useState } from 'react';

import { Download, PlusIcon, Search, SlidersHorizontal } from 'lucide-react';
import { DataTable, type Column } from '@/components/ui/data-table';

import { useTags } from '../api/get-tags';

import type { Tag } from '../types';

import { TagRow } from './tag-row';
import { TagModal } from './tag-modal';
import { getRouteApi } from '@tanstack/react-router';

const routeApi = getRouteApi('/_authenticated/admin/tags');

const COLUMNS: Column[] = [
  { label: 'ID', width: 80 },
  { label: 'Name', width: 140 },
  { label: 'Label', width: 140 },
  { label: 'Description', width: 300 },
  { label: 'Created At', width: 140 },
  { label: 'Actions', width: 60 },
];

export function TagsList() {
  const { page, search } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedTag, setSelectedTag] = useState<Tag | undefined>();

  const handleSearchChange = useDebouncedCallback((newSearch: string) => {
    void navigate({ search: { page: 1, search: newSearch }, replace: true });
  }, 300);

  const handlePageChange = (newPage: number) => {
    void navigate({ search: () => ({ page: newPage }) });
  };

  const handleCreate = () => {
    setSelectedTag(undefined); // Clear selection
    open();
  };

  const handleEdit = (tag: Tag) => {
    setSelectedTag(tag);
    open();
  };

  const { data, isLoading } = useTags({
    variables: {
      page,
      limit: 10,
      search: search || undefined,
    },
  });

  const tags = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="flex flex-col gap-6">
      <TagModal tag={selectedTag} opened={opened} onClose={close} />
      <Card withBorder radius="md" p="lg">
        <div className="flex flex-col gap-6">
          <Group justify="space-between" align="flex-start">
            <div>
              <Title order={4}>Tags List</Title>
              <Text size="sm" c="dimmed">
                View and manage tags.
              </Text>
            </div>
            <Group>
              <Button
                variant="filled"
                leftSection={<PlusIcon size={18} />}
                onClick={handleCreate}
              >
                Add Tag
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
            data={tags}
            columns={COLUMNS}
            isLoading={isLoading}
            emptyMessage="No tags found"
            keyExtractor={(tag) => tag.id}
            renderRow={(tag) => <TagRow tag={tag} onEdit={handleEdit} />}
            pagination={
              meta && meta.lastPage > 1
                ? { page, total: meta.lastPage, onChange: handlePageChange }
                : undefined
            }
          />
        </div>
      </Card>
    </div>
  );
}
