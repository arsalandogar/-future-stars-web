import { Card, Group, Text, Title } from '@mantine/core';

import { DataTable, type Column } from '@/components/ui/data-table';

import { useTemplateTypes } from '../api/get-template-types';

import { TemplateTypeRow } from './template-type-row';
import { CreateTemplateTypeButton } from './create-template-type-button';

const COLUMNS: Column[] = [
  { label: 'ID', width: 80 },
  { label: 'Name', width: 250 },
  { label: 'Extra Price', width: 150 },
  { label: 'Actions', width: 120 },
];

export function TemplateTypesList() {
  const { data: templateTypes, isLoading } = useTemplateTypes();

  return (
    <div className="flex flex-col gap-6">
      <Card withBorder radius="md" p="lg">
        <div className="flex flex-col gap-6">
          <Group justify="space-between" align="flex-start">
            <div>
              <Title order={4}>Template Types</Title>
              <Text size="sm" c="dimmed">
                Manage template type categories.
              </Text>
            </div>
            <CreateTemplateTypeButton />
          </Group>

          <DataTable
            data={templateTypes ?? []}
            columns={COLUMNS}
            isLoading={isLoading}
            emptyMessage="No template types found"
            keyExtractor={(templateType) => templateType.name}
            renderRow={(templateType) => (
              <TemplateTypeRow templateType={templateType} />
            )}
          />
        </div>
      </Card>
    </div>
  );
}
