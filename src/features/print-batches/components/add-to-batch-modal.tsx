import {
  Alert,
  Button,
  Group,
  Modal,
  Radio,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

import { useOrderSelectionStore } from '@/features/orders';

import { useAddOrdersToBatch } from '../api/add-orders-to-batch';
import { useCreatePrintBatch } from '../api/create-print-batch';
import { usePrintBatches } from '../api/get-print-batches';
import { useAddToBatchModalStore } from '../stores/add-to-batch-modal-store';

import styles from './add-to-batch-modal.module.css';

export function AddToBatchModal() {
  const {
    opened,
    orderIds,
    ordersAlreadyInBatch,
    mode,
    selectedBatchId,
    newBatchName,
    close,
    setMode,
    setSelectedBatchId,
    setNewBatchName,
  } = useAddToBatchModalStore();

  const { clearSelection } = useOrderSelectionStore();

  const batchesQuery = usePrintBatches({ variables: { limit: 100 } });
  const createBatch = useCreatePrintBatch();
  const addToBatch = useAddOrdersToBatch();

  const batches = batchesQuery.data?.data ?? [];
  const batchOptions = batches.map((batch) => ({
    value: String(batch.id),
    label: batch.name,
  }));

  const isPending = createBatch.isPending || addToBatch.isPending;

  const handleSuccess = (title: string, message: string) => {
    notifications.show({ title, message, color: 'green' });
    clearSelection();
    close();
  };

  const handleConfirm = () => {
    if (mode === 'create') {
      createBatch.mutate(
        { name: newBatchName, orderIds },
        {
          onSuccess: () =>
            handleSuccess(
              'Batch created',
              `Created "${newBatchName}" with ${orderIds.length} orders`
            ),
        }
      );
    } else {
      if (!selectedBatchId) return;
      const batchName = batches.find((b) => b.id === selectedBatchId)?.name;
      addToBatch.mutate(
        { batchId: selectedBatchId, orderIds },
        {
          onSuccess: () =>
            handleSuccess(
              'Orders added',
              `Added ${orderIds.length} orders to "${batchName}"`
            ),
        }
      );
    }
  };

  const isDisabled =
    isPending ||
    (mode === 'select' && !selectedBatchId) ||
    (mode === 'create' && !newBatchName.trim());

  return (
    <Modal
      opened={opened}
      onClose={close}
      title="Add to Batch"
      size="md"
      classNames={{ title: styles.title }}
    >
      <Stack gap="lg">
        <Text size="sm" c="dimmed">
          Organize selected orders into a new or existing batch.
        </Text>

        <Text size="sm" c="primary" fw={500}>
          {orderIds.length} Orders Selected
        </Text>

        {ordersAlreadyInBatch.length > 0 && (
          <Alert
            icon={<AlertTriangle size={16} />}
            color="yellow"
            variant="light"
          >
            {ordersAlreadyInBatch.length} order(s) are already in a batch and
            will be moved to the new batch.
          </Alert>
        )}

        <Radio.Group
          value={mode}
          onChange={(value) => setMode(value as 'select' | 'create')}
        >
          <Stack gap="md">
            <div>
              <Radio
                value="select"
                label={
                  <Text size="sm" fw={500} tt="uppercase">
                    Select an existing batch
                  </Text>
                }
              />
              {mode === 'select' && (
                <Select
                  data={batchOptions}
                  value={selectedBatchId ? String(selectedBatchId) : null}
                  onChange={(value) =>
                    setSelectedBatchId(value ? Number(value) : null)
                  }
                  placeholder="Choose a batch"
                  mt="sm"
                  ml="xl"
                  searchable
                />
              )}
            </div>

            <div>
              <Radio
                value="create"
                label={
                  <Text size="sm" fw={500} tt="uppercase">
                    Create a new batch
                  </Text>
                }
              />
              {mode === 'create' && (
                <TextInput
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  placeholder="Batch name"
                  mt="sm"
                  ml="xl"
                />
              )}
            </div>
          </Stack>
        </Radio.Group>

        <Group justify="space-between" mt="md">
          <Button
            variant="subtle"
            leftSection={<ArrowLeft size={16} />}
            onClick={close}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            loading={isPending}
            disabled={isDisabled}
          >
            Add to Batch
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
