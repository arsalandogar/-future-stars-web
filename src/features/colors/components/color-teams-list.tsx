import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { Plus } from 'lucide-react';

import { DataTable, type Column } from '@/components/ui/data-table';
import { ListingShell, useListingContext } from '@/components/ui/listing';
import { usePageHeader } from '@/hooks';
import { useColorPalettes } from '@/features/color-palettes';

import { useColorTeams } from '../api/get-color-teams';
import type { ColorTeam } from '../types';
import { ColorTeamRow } from './color-team-row';
import { ColorTeamModal } from './color-team-modal';

const COLUMNS: Column[] = [
  { label: 'ID', width: 60 },
  { label: 'League', width: 120 },
  { label: 'Name', width: 150 },
  { label: 'Abbreviation', width: 80 },
  { label: 'Palette', width: 150 },
  { label: 'Rank', width: 70 },
  { label: 'Featured', width: 80 },
  { label: 'Status', width: 80 },
  { label: 'Actions', width: 60 },
];

export function ColorTeamsList() {
  const { page, limit, search } = useListingContext();
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedItem, setSelectedItem] = useState<ColorTeam | undefined>();

  usePageHeader({
    title: 'Color Teams',
    description: 'View and manage color teams.',
  });

  const { data: palettesData } = useColorPalettes({
    variables: { limit: 1000 },
  });

  const paletteOptions = (palettesData?.data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    colorPairs: p.colorPairs,
  }));

  const handleCreate = () => {
    setSelectedItem(undefined);
    open();
  };

  const handleEdit = (item: ColorTeam) => {
    setSelectedItem(item);
    open();
  };

  const queryResult = useColorTeams({
    variables: {
      page,
      limit,
      search: search || undefined,
    },
  });

  return (
    <>
      <ColorTeamModal
        item={selectedItem}
        paletteOptions={paletteOptions}
        opened={opened}
        onClose={close}
      />
      <ListingShell
        actions={
          <Button
            variant="filled"
            leftSection={<Plus size={16} />}
            onClick={handleCreate}
          >
            Add Color Team
          </Button>
        }
      >
        <DataTable
          queryResult={queryResult}
          columns={COLUMNS}
          emptyMessage="No color teams found"
          keyExtractor={(item) => item.id}
          renderRow={(item) => <ColorTeamRow item={item} onEdit={handleEdit} />}
        />
      </ListingShell>
    </>
  );
}
