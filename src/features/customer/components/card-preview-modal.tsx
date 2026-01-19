import { ActionIcon, Button, Image, Modal, Text, Title } from '@mantine/core';
import { MoreVertical, Pencil, Share2, X } from 'lucide-react';
import { useState } from 'react';
import { MdOutlineShoppingCart } from 'react-icons/md';

import type { Card } from '../api/get-user-cards';

import { QuantityPicker } from './quantity-picker';
import styles from './card-preview-modal.module.css';

interface CardPreviewModalProps {
  card: Card | undefined;
  opened: boolean;
  onClose: () => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

export function CardPreviewModal({
  card,
  opened,
  onClose,
}: CardPreviewModalProps) {
  const [quantity, setQuantity] = useState(1);

  if (!card) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      centered
      size="lg"
      classNames={{
        overlay: styles.overlay,
        content: styles.content,
        body: styles.body,
      }}
    >
      <div className={styles.header}>
        <ActionIcon
          variant="transparent"
          size="lg"
          onClick={onClose}
          className={styles.headerIcon}
        >
          <X size={24} />
        </ActionIcon>
        <Title order={3} className={styles.headerTitle}>
          CARD PREVIEW
        </Title>
        <ActionIcon
          variant="transparent"
          size="lg"
          className={styles.headerIcon}
        >
          <MoreVertical size={24} />
        </ActionIcon>
      </div>

      <div className={styles.contentContainer}>
        <div className={styles.cardsWrapper}>
          <div className={styles.actionsRow}>
            <button type="button" className={styles.actionButton}>
              <Share2 size={18} />
              <span>Share Card</span>
            </button>
            <button type="button" className={styles.actionButton}>
              <Pencil size={18} />
              <span>Edit Card</span>
            </button>
          </div>

          <div className={styles.cardsRow}>
            <div className={styles.cardImageWrapper}>
              <Image
                src={card.frontCardImage}
                alt="Card front"
                fit="contain"
                className={styles.cardImage}
              />
            </div>
            <div className={styles.cardImageWrapper}>
              <Image
                src={card.backCardImage}
                alt="Card back"
                fit="contain"
                className={styles.cardImage}
              />
            </div>
          </div>
        </div>

        <Text className={styles.createdDate}>
          Created: {formatDate(card.createdAt)}
        </Text>
      </div>

      <div className={styles.footer}>
        <QuantityPicker value={quantity} onChange={setQuantity} />
        <Button
          variant="filled"
          size="lg"
          radius="xl"
          leftSection={<MdOutlineShoppingCart size={20} />}
          className={styles.buyButton}
        >
          Buy this Card
        </Button>
      </div>
    </Modal>
  );
}
