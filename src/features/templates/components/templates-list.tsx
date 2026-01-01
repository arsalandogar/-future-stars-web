import { Link, getRouteApi } from '@tanstack/react-router';
import { Button, Card, Group, Text, TextInput, Title } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';

import { DataTable, type Column } from '@/components/ui/data-table';

import { useTemplates } from '../api/get-templates';

import { TemplateRow } from './template-row';

const routeApi = getRouteApi('/_authenticated/admin/templates');

const COLUMNS: Column[] = [
  { label: 'Front', width: 80 },
  { label: 'Back', width: 80 },
  { label: 'Label' },
  { label: 'Description' },
  { label: 'Tags' },
  { label: 'Created', width: 150 },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function TemplatesList() {
  const { page, limit, search } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const handleSearchChange = useDebouncedCallback((newSearch: string) => {
    void navigate({ search: { page: 1, search: newSearch }, replace: true });
  }, 300);

  const handlePageChange = (newPage: number) => {
    void navigate({ search: (prev) => ({ ...prev, page: newPage }) });
  };

  const handlePageSizeChange = (newLimit: number) => {
    void navigate({ search: { page: 1, limit: newLimit }, replace: true });
  };

  const { data, isLoading } = useTemplates({
    variables: {
      page,
      limit,
      search: search || undefined,
    },
  });

  const templates = data?.data ?? [];
  const meta = data?.meta;

  return (
    <Card withBorder radius="md" p="lg">
      <div className="flex flex-col gap-6">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={4}>Templates List</Title>
            <Text size="sm" c="dimmed">
              Manage your card templates.
            </Text>
          </div>
          <Group>
            <Button
              component={Link}
              to="/admin/templates/create"
              leftSection={<Plus size={16} />}
            >
              Create Template
            </Button>
            <Button
              variant="default"
              leftSection={<SlidersHorizontal size={16} />}
              disabled
            >
              Filter
            </Button>
          </Group>
        </Group>

        <TextInput
          placeholder="Search..."
          leftSection={<Search size={16} />}
          defaultValue={search}
          onChange={(e) => handleSearchChange(e.currentTarget.value)}
          className="w-80"
        />

        <DataTable
          data={templates}
          columns={COLUMNS}
          isLoading={isLoading}
          emptyMessage="No templates found"
          keyExtractor={(template) => template.id}
          renderRow={(template) => <TemplateRow template={template} />}
          pagination={
            meta
              ? { page, total: meta.lastPage, onChange: handlePageChange }
              : undefined
          }
          pageSize={{
            value: limit,
            options: PAGE_SIZE_OPTIONS,
            onChange: handlePageSizeChange,
          }}
        />
      </div>
    </Card>
  );
}
