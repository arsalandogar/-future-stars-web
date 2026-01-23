import { Checkbox, Text } from '@mantine/core';
import { Check } from 'lucide-react';
import { useState } from 'react';

import { ConfirmationModal } from '@/components/ui/confirmation-modal';

import { useDeleteCard } from '../api/delete-card';

import styles from './delete-card-modal.module.css';

interface DeleteCardModalProps {
  cardId: number | undefined;
  opened: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

export function DeleteCardModal({
  cardId,
  opened,
  onClose,
  onDeleted,
}: DeleteCardModalProps) {
  const [deleteFromGallery, setDeleteFromGallery] = useState(true);
  const [deleteFromPacks, setDeleteFromPacks] = useState(false);

  const deleteCard = useDeleteCard();

  const handleConfirm = () => {
    if (!cardId) return;

    deleteCard.mutate(
      {
        cardId,
        deleteFromGallery,
        deleteFromPacks,
      },
      {
        onSuccess: () => {
          onClose();
          onDeleted?.();
        },
      }
    );
  };

  const handleClose = () => {
    setDeleteFromGallery(true);
    setDeleteFromPacks(false);
    onClose();
  };

  const isConfirmDisabled = !deleteFromGallery && !deleteFromPacks;

  return (
    <ConfirmationModal
      opened={opened}
      onClose={handleClose}
      title="DELETE CARD"
      confirmLabel="Confirm"
      confirmIcon={<Check size={18} />}
      onConfirm={handleConfirm}
      isPending={deleteCard.isPending}
      disabled={isConfirmDisabled}
      size={480}
    >
      <Text className={styles.subtitle}>Choose an action for this card</Text>

      <div className={styles.checkboxGroup}>
        <Checkbox
          label="Delete from My Cards"
          checked={deleteFromGallery}
          onChange={(e) => setDeleteFromGallery(e.currentTarget.checked)}
          size="md"
          classNames={{
            root: styles.checkboxRoot,
            body: styles.checkboxBody,
            inner: styles.checkboxInner,
            label: deleteFromGallery
              ? styles.checkboxLabelChecked
              : styles.checkboxLabel,
            input: styles.checkboxInput,
          }}
        />
        <Checkbox
          label="Delete from Packs"
          checked={deleteFromPacks}
          onChange={(e) => setDeleteFromPacks(e.currentTarget.checked)}
          size="md"
          classNames={{
            root: styles.checkboxRoot,
            body: styles.checkboxBody,
            inner: styles.checkboxInner,
            label: deleteFromPacks
              ? styles.checkboxLabelChecked
              : styles.checkboxLabel,
            input: styles.checkboxInput,
          }}
        />
      </div>
    </ConfirmationModal>
  );
}
