import { Card, Group } from '@mantine/core';

import { DataTable, type Column } from '@/components/ui/data-table';
import { usePageHeader } from '@/hooks/use-page-header';

import { useTemplateTypes } from '../api/get-template-types';

import { TemplateTypeRow } from './template-type-row';
import { CreateTemplateTypeButton } from './create-template-type-button';

const COLUMNS: Column[] = [
  { label: 'ID', width: 80 },
  { label: 'Name', width: 250 },
  { label: 'Extra Price (cents)', width: 150 },
  { label: 'Actions', width: 120 },
];

export function TemplateTypesList() {
  const queryResult = useTemplateTypes();

  usePageHeader({
    title: 'Template Types',
    description: 'Manage template type categories.',
  });

  return (
    <>
      <Group justify="flex-end" mb="md">
        <CreateTemplateTypeButton />
      </Group>
      <Card withBorder radius="md" p="lg">
        <DataTable
          queryResult={queryResult}
          columns={COLUMNS}
          emptyMessage="No template types found"
          keyExtractor={(templateType) => templateType.name}
          renderRow={(templateType) => (
            <TemplateTypeRow templateType={templateType} />
          )}
        />
      </Card>
    </>
  );
}
