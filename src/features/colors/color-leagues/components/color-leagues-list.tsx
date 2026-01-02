import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { Plus } from 'lucide-react';

import { DataTable, type Column } from '@/components/ui/data-table';

import { useColorLeagues } from '../api/get-color-leagues';
import type { ColorLeague } from '../types';
import { ColorLeagueRow } from './color-league-row';
import { ColorLeagueModal } from './color-league-modal';
import { ListingShell, useListingContext } from '@/components/ui/listing';
import { usePageHeader } from '@/hooks';

const COLUMNS: Column[] = [
  { label: 'ID', width: 60 },
  { label: 'Name', width: 120 },
  { label: 'Label', width: 150 },
  { label: 'Rank', width: 80 },
  { label: 'Status', width: 90 },
  { label: 'Actions', width: 60 },
];

export function ColorLeaguesList() {
  const { page, limit, search } = useListingContext();
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedItem, setSelectedItem] = useState<ColorLeague | undefined>();

  usePageHeader({
    title: 'Color leagues',
    description: 'View and manage color leagues.',
  });

  const handleCreate = () => {
    setSelectedItem(undefined);
    open();
  };

  const handleEdit = (item: ColorLeague) => {
    setSelectedItem(item);
    open();
  };

  const queryResult = useColorLeagues({
    variables: {
      page,
      limit,
      search: search || undefined,
    },
  });

  return (
    <>
      <ColorLeagueModal item={selectedItem} opened={opened} onClose={close} />
      <ListingShell
        actions={
          <Button
            variant="filled"
            leftSection={<Plus size={16} />}
            onClick={handleCreate}
          >
            Add Color League
          </Button>
        }
      >
        <DataTable
          queryResult={queryResult}
          columns={COLUMNS}
          emptyMessage="No color leagues found"
          keyExtractor={(item) => item.id}
          renderRow={(item) => (
            <ColorLeagueRow item={item} onEdit={handleEdit} />
          )}
        />
      </ListingShell>
    </>
  );
}
