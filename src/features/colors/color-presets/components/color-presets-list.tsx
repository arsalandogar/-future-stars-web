import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { Plus } from 'lucide-react';

import { DataTable, type Column } from '@/components/ui/data-table';

import { useColorPresets } from '../api/get-color-presets';
import type { ColorPreset } from '../types';
import { ColorPresetRow } from './color-preset-row';
import { ColorPresetModal } from './color-preset-modal';
import { ListingShell, useListingContext } from '@/components/ui/listing';
import { usePageHeader } from '@/hooks';

const COLUMNS: Column[] = [
  { label: 'ID', width: 60 },
  { label: 'League', width: 120 },
  { label: 'Name', width: 150 },
  { label: 'Abbreviation', width: 80 },
  { label: 'Colors', width: 150 },
  { label: 'Rank', width: 70 },
  { label: 'Featured', width: 80 },
  { label: 'Status', width: 80 },
  { label: 'Actions', width: 60 },
];

export function ColorPresetsList() {
  const { page, limit, search } = useListingContext();
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedItem, setSelectedItem] = useState<ColorPreset | undefined>();

  usePageHeader({
    title: 'Color Presets',
    description: 'View and manage color presets.',
  });

  const handleCreate = () => {
    setSelectedItem(undefined);
    open();
  };

  const handleEdit = (item: ColorPreset) => {
    setSelectedItem(item);
    open();
  };

  const queryResult = useColorPresets({
    variables: {
      page,
      limit,
      search: search || undefined,
    },
  });

  return (
    <>
      <ColorPresetModal item={selectedItem} opened={opened} onClose={close} />
      <ListingShell
        actions={
          <Button
            variant="filled"
            leftSection={<Plus size={16} />}
            onClick={handleCreate}
          >
            Add Color Preset
          </Button>
        }
      >
        <DataTable
          queryResult={queryResult}
          columns={COLUMNS}
          emptyMessage="No color presets found"
          keyExtractor={(item) => item.id}
          renderRow={(item) => (
            <ColorPresetRow item={item} onEdit={handleEdit} />
          )}
        />
      </ListingShell>
    </>
  );
}
