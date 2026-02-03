import { useState } from 'react';
import { Button, Group, Modal, Select, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';

import { useUpdatePrintBatch } from '../api/update-print-batch';
import { useBatchSelectionStore } from '../stores/batch-selection-store';
import type { PrintBatch, PrintBatchStatus } from '../types';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'printing', label: 'Printing' },
  { value: 'printed', label: 'Printed' },
  { value: 'error', label: 'Error' },
];

interface BatchStatusModalProps {
  opened: boolean;
  onClose: () => void;
  batch?: PrintBatch;
  selectedBatchIds?: number[];
}

export function BatchStatusModal({
  opened,
  onClose,
  batch,
  selectedBatchIds,
}: BatchStatusModalProps) {
  const [status, setStatus] = useState<PrintBatchStatus | null>(
    batch?.status ?? null
  );
  const { clearSelection } = useBatchSelectionStore();
  const updateBatch = useUpdatePrintBatch();

  const isBulk = !batch && selectedBatchIds && selectedBatchIds.length > 0;
  const title = isBulk ? 'Update Batch Status' : 'Edit Batch Status';
  const subtitle = isBulk
    ? `Update status for ${selectedBatchIds.length} selected batches`
    : `Update status for "${batch?.name}"`;

  const handleConfirm = async () => {
    if (!status) return;

    if (isBulk && selectedBatchIds) {
      // Bulk update - call mutation for each batch
      try {
        await Promise.all(
          selectedBatchIds.map((id) => updateBatch.mutateAsync({ id, status }))
        );
        notifications.show({
          title: 'Status updated',
          message: `Updated ${selectedBatchIds.length} batches to "${status}"`,
          color: 'green',
        });
        clearSelection();
        onClose();
      } catch {
        notifications.show({
          title: 'Error',
          message: 'Failed to update some batches',
          color: 'red',
        });
      }
    } else if (batch) {
      // Single batch update
      updateBatch.mutate(
        { id: batch.id, status },
        {
          onSuccess: () => {
            notifications.show({
              title: 'Status updated',
              message: `Updated "${batch.name}" to "${status}"`,
              color: 'green',
            });
            onClose();
          },
          onError: (error) => {
            const message =
              error instanceof Error ? error.message : 'Failed to update batch';
            notifications.show({
              title: 'Error',
              message,
              color: 'red',
            });
          },
        }
      );
    }
  };

  const handleClose = () => {
    setStatus(batch?.status ?? null);
    onClose();
  };

  return (
    <Modal opened={opened} onClose={handleClose} title={title} size="sm">
      <Stack gap="lg">
        <Text size="sm" c="dimmed">
          {subtitle}
        </Text>

        <Select
          label="Status"
          placeholder="Select status"
          data={STATUS_OPTIONS}
          value={status}
          onChange={(value) => setStatus(value as PrintBatchStatus)}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleConfirm()}
            loading={updateBatch.isPending}
            disabled={!status}
          >
            Update Status
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
