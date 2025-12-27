import { useTags } from '../api/tag';
import { Button, Title } from '@mantine/core';

import TagsList from './TagsList';
import TagModal from './TagModal';
import { Plus } from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import type { Tag } from '../types';
import { useState } from 'react';

// features/tags/components/TagsManager.tsx
export default function TagsManager() {
  const { data: tags } = useTags();
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedTag, setSelectedTag] = useState<Tag | undefined>(undefined);

  // Logic for Creating
  const handleCreate = () => {
    setSelectedTag(undefined); // Clear selection
    open();
  };

  //Logic for Editing
  const handleEdit = (tag: Tag) => {
    setSelectedTag(tag);
    open();
  };

  return (
    <div>
      <TagModal tag={selectedTag} opened={opened} onClose={close} />
      <div className=" flex  justify-between gap-6 pr-4">
        <Title order={2} mb={'md'}>
          Tags
        </Title>
        <Button
          variant="default"
          leftSection={<Plus size={'20px'} />}
          bg={'blue'}
          c={'#ffffff'}
          onClick={handleCreate}
        >
          Create
        </Button>
      </div>
      <TagsList tags={tags} onEdit={handleEdit} />
    </div>
  );
}
