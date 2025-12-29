import { Card, Group, Text, Title } from '@mantine/core';

import { DataTable, type Column } from '@/components/ui/data-table';

import { useConfigs } from '../api/get-configs';

import { ConfigRow } from './config-row';

const COLUMNS: Column[] = [
  { label: 'Name', width: 250 },
  { label: 'Value' },
  { label: 'Description' },
  { label: 'Actions', width: 100 },
];

export function ConfigsList() {
  const { data: configs, isLoading } = useConfigs();

  return (
    <div className="flex flex-col gap-6">
      <Card withBorder radius="md" p="lg">
        <div className="flex flex-col gap-6">
          <Group justify="space-between" align="flex-start">
            <div>
              <Title order={4}>Application Configs</Title>
              <Text size="sm" c="dimmed">
                Manage application configuration values.
              </Text>
            </div>
          </Group>

          <DataTable
            data={configs ?? []}
            columns={COLUMNS}
            isLoading={isLoading}
            emptyMessage="No configs found"
            keyExtractor={(config) => config.name}
            renderRow={(config) => <ConfigRow config={config} />}
          />
        </div>
      </Card>
    </div>
  );
}
