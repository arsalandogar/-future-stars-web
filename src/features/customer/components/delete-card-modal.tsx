import {
  ActionIcon,
  Button,
  Checkbox,
  Modal,
  Text,
  Title,
} from '@mantine/core';
import { ArrowLeft, Check, X } from 'lucide-react';
import { useState } from 'react';

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

  const isConfirmDisabled =
    !deleteFromGallery && !deleteFromPacks || deleteCard.isPending;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      withCloseButton={false}
      centered
      size={480}
      classNames={{
        content: styles.content,
        body: styles.body,
      }}
    >
      <div className={styles.header}>
        <Title order={4} className={styles.headerTitle}>
          DELETE CARD
        </Title>
        <ActionIcon
          variant="transparent"
          size="md"
          onClick={handleClose}
          className={styles.closeButton}
        >
          <X size={24} />
        </ActionIcon>
      </div>

      <div className={styles.contentSection}>
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
              label: deleteFromGallery ? styles.checkboxLabelChecked : styles.checkboxLabel,
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
              label: deleteFromPacks ? styles.checkboxLabelChecked : styles.checkboxLabel,
              input: styles.checkboxInput,
            }}
          />
        </div>
      </div>

      <div className={styles.footer}>
        <Button
          variant="transparent"
          color="white"
          leftSection={<ArrowLeft size={18} />}
          onClick={handleClose}
          className={styles.cancelButton}
        >
          Cancel
        </Button>
        <Button
          variant="filled"
          leftSection={<Check size={18} />}
          onClick={handleConfirm}
          disabled={isConfirmDisabled}
          loading={deleteCard.isPending}
          className={styles.confirmButton}
        >
          Confirm
        </Button>
      </div>
    </Modal>
  );
}
