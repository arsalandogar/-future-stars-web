import { Card, Group } from '@mantine/core';

import { DataTable, type Column } from '@/components/ui/data-table';
import { usePageHeader } from '@/hooks/use-page-header';

import { useConfigs } from '../api/get-configs';

import { ConfigRow } from './config-row';
import { CreateConfigButton } from './create-config-button';

const COLUMNS: Column[] = [
  { label: 'Name', width: 250 },
  { label: 'Value' },
  { label: 'Description' },
  { label: 'Actions', width: 100 },
];

export function ConfigsList() {
  const queryResult = useConfigs();

  usePageHeader({
    title: 'Configs',
    description: 'Manage application configuration values.',
  });

  return (
    <>
      <Group justify="flex-end" mb="md">
        <CreateConfigButton />
      </Group>
      <Card withBorder radius="md" p="lg">
        <DataTable
          queryResult={queryResult}
          columns={COLUMNS}
          emptyMessage="No configs found"
          keyExtractor={(config) => config.name}
          renderRow={(config) => <ConfigRow config={config} />}
        />
      </Card>
    </>
  );
}
