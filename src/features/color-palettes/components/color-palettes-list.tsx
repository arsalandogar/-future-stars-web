import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { Plus } from 'lucide-react';

import { DataTable, type Column } from '@/components/ui/data-table';
import { ListingShell, useListingContext } from '@/components/ui/listing';
import { usePageHeader } from '@/hooks';

import { useColorPalettes } from '../api/get-color-palettes';
import type { ColorPalette } from '../types';
import { ColorPaletteRow } from './color-palette-row';
import { ColorPaletteModal } from './color-palette-modal';

const COLUMNS: Column[] = [
  { label: 'ID', width: 60 },
  { label: 'Name', width: 150 },
  { label: 'Colors', width: 150 },
  { label: 'Status', width: 90 },
  { label: 'Actions', width: 60 },
];

export function ColorPalettesList() {
  const { page, limit, search } = useListingContext();
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedItem, setSelectedItem] = useState<ColorPalette | undefined>();

  usePageHeader({
    title: 'Color Palettes',
    description: 'View and manage color palettes.',
  });

  const handleCreate = () => {
    setSelectedItem(undefined);
    open();
  };

  const handleEdit = (item: ColorPalette) => {
    setSelectedItem(item);
    open();
  };

  const queryResult = useColorPalettes({
    variables: {
      page,
      limit,
      search: search || undefined,
    },
  });

  return (
    <>
      <ColorPaletteModal item={selectedItem} opened={opened} onClose={close} />
      <ListingShell
        actions={
          <Button
            variant="filled"
            leftSection={<Plus size={16} />}
            onClick={handleCreate}
          >
            Add Color Palette
          </Button>
        }
      >
        <DataTable
          queryResult={queryResult}
          columns={COLUMNS}
          emptyMessage="No color palettes found"
          keyExtractor={(item) => item.id}
          renderRow={(item) => (
            <ColorPaletteRow item={item} onEdit={handleEdit} />
          )}
        />
      </ListingShell>
    </>
  );
}
