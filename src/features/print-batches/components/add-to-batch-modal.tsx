import { useState } from 'react';
import {
  Alert,
  Button,
  Group,
  List,
  Modal,
  Radio,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { AxiosError } from 'axios';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

import { useOrderSelectionStore } from '@/features/orders';

import { useAddOrdersToBatch } from '../api/add-orders-to-batch';
import { useCreatePrintBatch } from '../api/create-print-batch';
import { usePrintBatches } from '../api/get-print-batches';
import { useAddToBatchModalStore } from '../stores/add-to-batch-modal-store';
import type { InvalidOrder } from '../types';

import styles from './add-to-batch-modal.module.css';

interface NotPrintReadyError {
  message: string;
  code: 'E_ORDERS_NOT_PRINT_READY';
  invalid_orders: InvalidOrder[];
}

function isNotPrintReadyError(
  error: unknown
): error is AxiosError<NotPrintReadyError> {
  if (!(error instanceof AxiosError)) return false;
  const data = error.response?.data as NotPrintReadyError | undefined;
  return data?.code === 'E_ORDERS_NOT_PRINT_READY';
}

function parseIneligibleOrderIds(message: string): number[] {
  const match = message.match(/:\s*([\d,\s]+)$/);
  if (!match) return [];
  return match[1]
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => !Number.isNaN(n));
}

interface OrderNotEligibleError {
  message: string;
  name: string;
}

function isOrderNotEligibleError(
  error: unknown
): error is AxiosError<OrderNotEligibleError> {
  if (!(error instanceof AxiosError)) return false;
  const data = error.response?.data as OrderNotEligibleError | undefined;
  return data?.name === 'OrderNotEligibleException';
}

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

  const [invalidOrders, setInvalidOrders] = useState<InvalidOrder[]>([]);
  const [ineligibleOrderIds, setIneligibleOrderIds] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shouldExcludePrintReady, setShouldExcludePrintReady] = useState(false);

  const batches = batchesQuery.data?.data ?? [];
  const batchOptions = batches.map((batch) => ({
    value: String(batch.id),
    label: batch.name,
  }));

  const isPending = createBatch.isPending || addToBatch.isPending;

  const resetErrors = () => {
    setInvalidOrders([]);
    setIneligibleOrderIds([]);
    setErrorMessage(null);
  };

  const resetAll = () => {
    resetErrors();
    setShouldExcludePrintReady(false);
  };

  const handleClose = () => {
    resetAll();
    close();
  };

  const handleSuccess = (title: string, message: string) => {
    notifications.show({ title, message, color: 'green' });
    resetAll();
    clearSelection();
    close();
  };

  const handleError = (error: Error) => {
    if (isNotPrintReadyError(error)) {
      setInvalidOrders(error.response!.data.invalid_orders);
    } else if (isOrderNotEligibleError(error)) {
      const ids = parseIneligibleOrderIds(error.response!.data.message);
      setIneligibleOrderIds(ids);
      setErrorMessage(error.response!.data.message);
    } else if (error instanceof AxiosError) {
      const data = error.response?.data as { message?: string } | undefined;
      setErrorMessage(data?.message ?? 'Something went wrong.');
    } else {
      setErrorMessage(error.message ?? 'Something went wrong.');
    }
  };

  const handleConfirm = (excludeMode?: 'print-ready' | 'ineligible') => {
    if (excludeMode === 'print-ready') {
      setShouldExcludePrintReady(true);
    }

    const filteredOrderIds =
      excludeMode === 'ineligible'
        ? orderIds.filter((id) => !ineligibleOrderIds.includes(id))
        : orderIds;

    const exclude =
      excludeMode === 'print-ready' || shouldExcludePrintReady
        ? true
        : undefined;

    resetErrors();

    if (filteredOrderIds.length === 0) {
      notifications.show({
        title: 'No valid orders',
        message: 'All selected orders are ineligible for batching.',
        color: 'red',
      });
      return;
    }

    if (mode === 'create') {
      createBatch.mutate(
        { name: newBatchName, orderIds: filteredOrderIds, exclude },
        {
          onSuccess: () =>
            handleSuccess(
              'Batch created',
              `Created "${newBatchName}" with ${filteredOrderIds.length} orders`
            ),
          onError: handleError,
        }
      );
    } else {
      if (!selectedBatchId) return;
      const batchName = batches.find((b) => b.id === selectedBatchId)?.name;
      addToBatch.mutate(
        { batchId: selectedBatchId, orderIds: filteredOrderIds, exclude },
        {
          onSuccess: () =>
            handleSuccess(
              'Orders added',
              `Added ${filteredOrderIds.length} orders to "${batchName}"`
            ),
          onError: handleError,
        }
      );
    }
  };

  const isDisabled =
    isPending ||
    (mode === 'select' && !selectedBatchId) ||
    (mode === 'create' && !newBatchName.trim());

  const hasInvalidOrders = invalidOrders.length > 0;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
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

        {errorMessage &&
          !hasInvalidOrders &&
          ineligibleOrderIds.length === 0 && (
            <Alert
              icon={<AlertTriangle size={16} />}
              color="red"
              variant="light"
            >
              {errorMessage}
            </Alert>
          )}

        {ineligibleOrderIds.length > 0 && (
          <Alert
            icon={<AlertTriangle size={16} />}
            color="red"
            variant="light"
            title="Some orders are not eligible"
          >
            <Text size="sm" mt="xs">
              Orders {ineligibleOrderIds.map((id) => `#${id}`).join(', ')} are
              not eligible for batching (must be PAID status).
            </Text>
          </Alert>
        )}

        {hasInvalidOrders && (
          <Alert
            icon={<AlertTriangle size={16} />}
            color="red"
            variant="light"
            title="Some orders are not print-ready"
          >
            <Stack gap="xs" mt="xs">
              {invalidOrders.map((order) => (
                <div key={order.orderId}>
                  <Text size="sm" fw={600}>
                    Order #{order.orderId}
                  </Text>
                  <List size="sm" c="red">
                    {order.reasons.map((reason) => (
                      <List.Item key={reason}>{reason}</List.Item>
                    ))}
                  </List>
                </div>
              ))}
            </Stack>
          </Alert>
        )}

        {!hasInvalidOrders && ineligibleOrderIds.length === 0 && (
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
        )}

        <Group justify="space-between" mt="md">
          <Button
            variant="subtle"
            leftSection={<ArrowLeft size={16} />}
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </Button>

          {hasInvalidOrders || ineligibleOrderIds.length > 0 ? (
            <Button
              onClick={() =>
                handleConfirm(hasInvalidOrders ? 'print-ready' : 'ineligible')
              }
              loading={isPending}
              color="red"
            >
              Exclude & Continue
            </Button>
          ) : (
            <Button
              onClick={() => handleConfirm()}
              loading={isPending}
              disabled={isDisabled}
            >
              Add to Batch
            </Button>
          )}
        </Group>
      </Stack>
    </Modal>
  );
}
