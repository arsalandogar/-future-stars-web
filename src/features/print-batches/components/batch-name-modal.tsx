import { useState } from 'react';
import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';

import { useUpdatePrintBatch } from '../api/update-print-batch';
import type { PrintBatch } from '../types';

interface BatchNameModalProps {
  opened: boolean;
  onClose: () => void;
  batch: PrintBatch;
}

export function BatchNameModal({
  opened,
  onClose,
  batch,
}: BatchNameModalProps) {
  const [name, setName] = useState(batch.name);
  const [prevBatch, setPrevBatch] = useState(batch);
  const updateBatch = useUpdatePrintBatch();

  // Reset name when batch changes - adjust state during render pattern
  if (batch !== prevBatch) {
    setPrevBatch(batch);
    setName(batch.name);
  }

  const handleSubmit = () => {
    if (!name.trim()) return;

    updateBatch.mutate(
      { id: batch.id, name: name.trim() },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Batch updated',
            message: 'Batch name has been updated',
            color: 'green',
          });
          onClose();
        },
        onError: (error) => {
          notifications.show({
            title: 'Error',
            message:
              error instanceof Error
                ? error.message
                : 'Failed to update batch name',
            color: 'red',
          });
        },
      }
    );
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Edit Batch Name" size="sm">
      <Stack gap="md">
        <TextInput
          label="Batch Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter batch name"
        />
        <Group justify="flex-end" gap="sm">
          <Button
            variant="subtle"
            onClick={onClose}
            disabled={updateBatch.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={updateBatch.isPending}
            disabled={!name.trim() || name === batch.name}
          >
            Save
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
