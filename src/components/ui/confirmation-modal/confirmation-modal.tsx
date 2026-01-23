import { ActionIcon, Button, Modal, Text, Title } from '@mantine/core';
import { ArrowLeft, X } from 'lucide-react';
import type { ReactNode } from 'react';

import styles from './confirmation-modal.module.css';

interface ConfirmationModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  message?: ReactNode;
  subtitle?: string;
  confirmLabel: string;
  confirmIcon?: ReactNode;
  onConfirm: () => void;
  isPending?: boolean;
  disabled?: boolean;
  /** Custom content to render instead of the default message/subtitle */
  children?: ReactNode;
  size?: number | string;
}

export function ConfirmationModal({
  opened,
  onClose,
  title,
  message,
  subtitle,
  confirmLabel,
  confirmIcon,
  onConfirm,
  isPending = false,
  disabled = false,
  children,
  size = 'md',
}: ConfirmationModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      centered
      size={size}
      classNames={{
        content: styles.content,
        body: styles.body,
      }}
    >
      <div className={styles.header}>
        <Title order={4} className={styles.headerTitle}>
          {title}
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
        {children ?? (
          <>
            {message && <Text className={styles.message}>{message}</Text>}
            {subtitle && <Text className={styles.subtitle}>{subtitle}</Text>}
          </>
        )}
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
          leftSection={confirmIcon}
          onClick={onConfirm}
          loading={isPending}
          disabled={disabled}
          className={styles.confirmButton}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
