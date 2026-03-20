import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { Plus } from 'lucide-react';

import { DataTable, type Column } from '@/components/ui/data-table';
import { ListingShell } from '@/components/ui/listing';
import { usePageHeader } from '@/hooks';

import { useLeagues } from '../api/get-leagues';
import type { League } from '../types';
import { LeagueRow } from './league-row';
import { LeagueModal } from './league-modal';

const COLUMNS: Column[] = [
  { label: 'ID', width: 60 },
  { label: 'Name', width: 120 },
  { label: 'Label', width: 150 },
  { label: 'Rank', width: 80 },
  { label: 'Status', width: 90 },
  { label: 'Actions', width: 60 },
];

export function LeaguesList() {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedItem, setSelectedItem] = useState<League | undefined>();

  usePageHeader({
    title: 'Leagues',
    description: 'View and manage leagues.',
  });

  const handleCreate = () => {
    setSelectedItem(undefined);
    open();
  };

  const handleEdit = (item: League) => {
    setSelectedItem(item);
    open();
  };

  const queryResult = useLeagues();

  return (
    <>
      <LeagueModal item={selectedItem} opened={opened} onClose={close} />
      <ListingShell
        actions={
          <Button
            variant="filled"
            leftSection={<Plus size={16} />}
            onClick={handleCreate}
          >
            Add League
          </Button>
        }
      >
        <DataTable
          queryResult={queryResult}
          columns={COLUMNS}
          emptyMessage="No leagues found"
          keyExtractor={(item) => item.id}
          renderRow={(item) => <LeagueRow item={item} onEdit={handleEdit} />}
        />
      </ListingShell>
    </>
  );
}
