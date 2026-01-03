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

export function TemplatesList() {
  const { page, limit, search } = useListingContext();
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedTemplate, setSelectedTemplate] = useState<
    Template | undefined
  >();

  const handleSetTags = (template: Template) => {
    setSelectedTemplate(template);
    open();
  };

  const queryResult = useTemplates({
    variables: {
      page,
      limit,
      search: search || undefined,
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
