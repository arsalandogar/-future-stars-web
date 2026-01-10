import { useState } from 'react';
import { getRouteApi, Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Plus } from 'lucide-react';

import { DataTable, type Column } from '@/components/ui/data-table';
import {
  ListingShell,
  useListingContext,
  type ListingTab,
} from '@/components/ui/listing';
import { usePageHeader } from '@/hooks/use-page-header';

import { useTemplates } from '../api/get-templates';
import { useSetDefaultBack } from '../api/set-default-back';
import type { Template, TemplateSide } from '../types';

import { TemplateRow } from './template-row';
import { SetTagsModal } from './set-tags-modal';

const routeApi = getRouteApi('/_authenticated/admin/_listing/templates');

const TABS: ListingTab[] = [
  { value: 'front', label: 'Front Sides' },
  { value: 'back', label: 'Back Sides' },
];

const FRONT_COLUMNS: Column[] = [
  { label: 'Front', width: 80 },
  { label: 'Back', width: 80 },
  { label: 'Label' },
  { label: 'Published', width: 100 },
  { label: 'Description' },
  { label: 'Tags' },
  { label: 'Created', width: 150 },
  { label: 'Actions', width: 60 },
];

const BACK_COLUMNS: Column[] = [
  { label: 'Preview', width: 80 },
  { label: 'Label' },
  { label: 'Published', width: 100 },
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

  usePageHeader({
    title: 'Templates',
    description: 'Manage your card templates.',
  });

  const setDefaultBackMutation = useSetDefaultBack();

  const handleSetDefaultBack = (template: Template) => {
    setDefaultBackMutation.mutate(template.id);
  };

  const handleSetTags = (template: Template) => {
    setSelectedTemplate(template);
    open();
  };

  const handleTabChange = (value: string | null) => {
    if (value) {
      void navigate({
        to: '.',
        search: (prev) => ({ ...prev, side: value as TemplateSide, page: 1 }),
      });
    }
  };

  const columns = side === 'front' ? FRONT_COLUMNS : BACK_COLUMNS;

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
        actions={
          <Button
            component={Link}
            to="/admin/templates/create"
            leftSection={<Plus size={16} />}
          >
            Create Template
          </Button>
        }
        tabs={TABS}
        activeTab={side}
        onTabChange={handleTabChange}
        showFilter={false}
      >
        <DataTable
          queryResult={queryResult}
          columns={columns}
          emptyMessage="No templates found"
          keyExtractor={(template) => template.id}
          renderRow={(template) => (
            <TemplateRow
              template={template}
              side={side}
              onSetTags={handleSetTags}
              onSetDefaultBack={handleSetDefaultBack}
            />
          )}
        />
      </ListingShell>
    </>
  );
}
