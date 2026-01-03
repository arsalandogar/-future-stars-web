import { useState } from 'react';
import { getRouteApi, Link, useNavigate } from '@tanstack/react-router';
import { Button, Select } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Plus } from 'lucide-react';

import { DataTable, type Column } from '@/components/ui/data-table';
import { ListingShell, useListingContext } from '@/components/ui/listing';

import { useTemplates } from '../api/get-templates';
import type { Template, TemplateSide } from '../types';

import { TemplateRow } from './template-row';
import { SetTagsModal } from './set-tags-modal';

const routeApi = getRouteApi('/_authenticated/admin/_listing/templates');

const SIDE_OPTIONS = [
  { value: 'front', label: 'Front' },
  { value: 'back', label: 'Back' },
];

const COLUMNS: Column[] = [
  { label: 'Front', width: 80 },
  { label: 'Back', width: 80 },
  { label: 'Label' },
  { label: 'Description' },
  { label: 'Tags' },
  { label: 'Created', width: 150 },
  { label: 'Actions', width: 60 },
];

export function TemplatesList() {
  const { page, limit, search } = useListingContext();
  const { side } = routeApi.useSearch();
  const navigate = useNavigate();
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedTemplate, setSelectedTemplate] = useState<
    Template | undefined
  >();

  const handleSetTags = (template: Template) => {
    setSelectedTemplate(template);
    open();
  };

  const handleSideChange = (value: string | null) => {
    void navigate({
      to: '.',
      search: (prev) => ({ ...prev, side: value as TemplateSide, page: 1 }),
      replace: true,
    });
  };

  const queryResult = useTemplates({
    variables: {
      page,
      limit,
      search: search || undefined,
      side,
    },
  });

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
        filterComponent={
          <Select
            data={SIDE_OPTIONS}
            value={side}
            onChange={handleSideChange}
            className="w-32"
          />
        }
      >
        <DataTable
          queryResult={queryResult}
          columns={COLUMNS}
          emptyMessage="No templates found"
          keyExtractor={(template) => template.id}
          renderRow={(template) => (
            <TemplateRow template={template} onSetTags={handleSetTags} />
          )}
        />
      </ListingShell>
    </>
  );
}
