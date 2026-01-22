import { ActionIcon, Button, Modal, Text, Title } from '@mantine/core';
import { ArrowLeft, Trash2, X } from 'lucide-react';

import type { Pack } from '@/types';

import { useDeletePack } from '../api/delete-pack';

import styles from './delete-pack-modal.module.css';

interface DeletePackModalProps {
  pack: Pack | null;
  opened: boolean;
  onClose: () => void;
}

export function DeletePackModal({ pack, opened, onClose }: DeletePackModalProps) {
  const deletePack = useDeletePack();

  const handleConfirm = () => {
    if (!pack) return;

    deletePack.mutate(pack.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      centered
      size="md"
      classNames={{
        content: styles.content,
        body: styles.body,
      }}
    >
      <div className={styles.header}>
        <Title order={4} className={styles.headerTitle}>
          DELETE PACK
        </Title>
        <ActionIcon
          variant="transparent"
          size="lg"
          onClick={onClose}
          className={styles.closeButton}
        >
          <X size={24} />
        </ActionIcon>
      </div>

      <div className={styles.contentSection}>
        <Text className={styles.message}>
          Are you sure you want to delete the pack "{pack?.name}"?
        </Text>
        <Text className={styles.subtitle}>This action cannot be undone.</Text>
      </div>

      <div className={styles.footer}>
        <Button
          variant="transparent"
          color="white"
          leftSection={<ArrowLeft size={18} />}
          onClick={onClose}
          className={styles.cancelButton}
        >
          Cancel
        </Button>
        <Button
          variant="filled"
          leftSection={<Trash2 size={18} />}
          onClick={handleConfirm}
          loading={deletePack.isPending}
          className={styles.deleteButton}
        >
          Delete
        </Button>
      </div>
    </Modal>
  );
}
