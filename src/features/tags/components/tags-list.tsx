import { useState } from 'react';
import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { PlusIcon } from 'lucide-react';

import { DataTable, type Column } from '@/components/ui/data-table';
import { ListingShell, useListingContext } from '@/components/ui/listing';
import type { Tag } from '@/types';

import { useTags } from '../api/get-tags';

import { TagRow } from './tag-row';
import { TagModal } from './tag-modal';

const COLUMNS: Column[] = [
  { label: 'ID', width: 80 },
  { label: 'Name', width: 140 },
  { label: 'Label', width: 140 },
  { label: 'Description', width: 300 },
  { label: 'Created At', width: 140 },
  { label: 'Actions', width: 60 },
];

export function TagsList() {
  const { search } = useListingContext();
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedTag, setSelectedTag] = useState<Tag | undefined>();

  const handleCreate = () => {
    setSelectedTag(undefined);
    open();
  };

  const handleEdit = (tag: Tag) => {
    setSelectedTag(tag);
    open();
  };

  const queryResult = useTags({
    variables: {
      search: search || undefined,
    },
  });

  return (
    <>
      <TagModal tag={selectedTag} opened={opened} onClose={close} />
      <ListingShell
        title="Tags List"
        description="View and manage tags."
        actions={
          <Button
            variant="filled"
            leftSection={<PlusIcon size={18} />}
            onClick={handleCreate}
          >
            Add Tag
          </Button>
        }
      >
        <DataTable
          queryResult={queryResult}
          columns={COLUMNS}
          emptyMessage="No tags found"
          keyExtractor={(tag) => tag.id}
          renderRow={(tag) => <TagRow tag={tag} onEdit={handleEdit} />}
        />
      </ListingShell>
    </>
  );
}
