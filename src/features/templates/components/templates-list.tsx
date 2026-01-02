import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Plus } from 'lucide-react';

import { DataTable, type Column } from '@/components/ui/data-table';
import { ListingShell, useListingContext } from '@/components/ui/listing';

import { useTemplates } from '../api/get-templates';
import type { Template } from '../types';

import { TemplateRow } from './template-row';
import { SetTagsModal } from './set-tags-modal';

const COLUMNS: Column[] = [
  { label: 'Front', width: 80 },
  { label: 'Back', width: 80 },
  { label: 'Label' },
  { label: 'Description' },
  { label: 'Tags' },
  { label: 'Created', width: 150 },
  { label: 'Actions', width: 60 },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function TemplatesList() {
  const { page, limit, search, setPage, setLimit } = useListingContext();
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedTemplate, setSelectedTemplate] = useState<
    Template | undefined
  >();

  const handleSetTags = (template: Template) => {
    setSelectedTemplate(template);
    open();
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
    <>
      <SetTagsModal
        key={selectedTemplate?.id}
        template={selectedTemplate}
        opened={opened}
        onClose={close}
      />
      <ListingShell
        title="Templates List"
        description="Manage your card templates."
        actions={
          <Button
            component={Link}
            to="/admin/templates/create"
            leftSection={<Plus size={16} />}
          >
            Create Template
          </Button>
        }
        showFilter={false}
      >
        <DataTable
          data={templates}
          columns={COLUMNS}
          isLoading={isLoading}
          emptyMessage="No templates found"
          keyExtractor={(template) => template.id}
          renderRow={(template) => (
            <TemplateRow template={template} onSetTags={handleSetTags} />
          )}
          pagination={
            meta ? { page, total: meta.lastPage, onChange: setPage } : undefined
          }
          pageSize={{
            value: limit,
            options: PAGE_SIZE_OPTIONS,
            onChange: setLimit,
          }}
        />
      </ListingShell>
    </>
  );
}
