import { Text } from '@mantine/core';
import { modals } from '@mantine/modals';

export interface OpenDeleteModalOptions {
  entityType: string;
  itemName: string;
  onConfirm: () => void;
}

/**
 * Opens a standardized delete confirmation modal.
 * Encapsulates the common pattern used across the app for delete confirmations.
 */
export function openDeleteModal({
  entityType,
  itemName,
  onConfirm,
}: OpenDeleteModalOptions) {
  modals.openConfirmModal({
    title: <Text fw={700}>Delete {entityType}</Text>,
    centered: true,
    children: (
      <Text size="sm">
        Are you sure you want to delete <strong>{itemName}</strong>? This action
        cannot be undone.
      </Text>
    ),
    labels: { confirm: 'Delete', cancel: 'Cancel' },
    confirmProps: { color: 'red' },
    onConfirm,
  });
}
