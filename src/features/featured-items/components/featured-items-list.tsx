import { useState } from 'react';
import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { PlusIcon } from 'lucide-react';

import { DataTable, type Column } from '@/components/ui/data-table';
import { ListingShell, useListingContext } from '@/components/ui/listing';

import { useFeaturedItems } from '../api/get-featured-items';
import type { FeaturedItem } from '../types';

import { FeaturedItemRow } from './featured-item-row';
import { FeaturedItemModal } from './featured-item-modal';

const COLUMNS: Column[] = [
  { label: 'ID', width: 60 },
  { label: 'Image', width: 80 },
  { label: 'Title', width: 150 },
  { label: 'CTA Text', width: 120 },
  { label: 'Template', width: 150 },
  { label: 'Order', width: 70 },
  { label: 'Status', width: 90 },
  { label: 'Created At', width: 110 },
  { label: 'Actions', width: 60 },
];

export function FeaturedItemsList() {
  const { search } = useListingContext();
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedItem, setSelectedItem] = useState<FeaturedItem | undefined>();

  const handleCreate = () => {
    setSelectedItem(undefined);
    open();
  };

  const handleEdit = (item: FeaturedItem) => {
    setSelectedItem(item);
    open();
  };

  const queryResult = useFeaturedItems({
    variables: {
      search: search || undefined,
    },
  });

  return (
    <>
      <FeaturedItemModal item={selectedItem} opened={opened} onClose={close} />
      <ListingShell
        title="Featured Items List"
        description="View and manage featured items."
        actions={
          <Button
            variant="filled"
            leftSection={<PlusIcon size={18} />}
            onClick={handleCreate}
          >
            Add Featured Item
          </Button>
        }
      >
        <DataTable
          queryResult={queryResult}
          columns={COLUMNS}
          emptyMessage="No featured items found"
          keyExtractor={(item) => item.id}
          renderRow={(item) => (
            <FeaturedItemRow item={item} onEdit={handleEdit} />
          )}
        />
      </ListingShell>
    </>
  );
}
