import { useState } from 'react';
import { Modal, Button, MultiSelect, Group, Stack } from '@mantine/core';

import { useTags } from '@/features/tags';

import { useSetTags } from '../api/set-tags';
import type { Template } from '../types';

type SetTagsModalProps = {
  template: Template | undefined;
  opened: boolean;
  onClose: () => void;
};

export function SetTagsModal({ template, opened, onClose }: SetTagsModalProps) {
  const initialTagIds = template?.tags.map((tag) => String(tag.id)) ?? [];
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialTagIds);
  const { data: tags = [], isLoading: isLoadingTags } = useTags({});
  const setTags = useSetTags();

  const handleSubmit = () => {
    if (!template) return;

    setTags.mutate(
      {
        templateIds: [template.id],
        tagIds: selectedTagIds.map((id) => Number(id)),
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const tagOptions = tags.map((tag) => ({
    value: String(tag.id),
    label: tag.label,
  }));

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<h2 className="font-bold">Set Tags</h2>}
      size="md"
    >
      <Stack gap="md">
        <MultiSelect
          placeholder={isLoadingTags ? 'Loading tags...' : 'Select tags'}
          data={tagOptions}
          value={selectedTagIds}
          onChange={setSelectedTagIds}
          searchable
          clearable
          disabled={isLoadingTags}
        />
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={setTags.isPending}>
            Save
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
