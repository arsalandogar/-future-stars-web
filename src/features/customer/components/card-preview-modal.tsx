import {
  ActionIcon,
  Button,
  Drawer,
  Image,
  Menu,
  Modal,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { Copy, MoreVertical, Pencil, Share2, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { MdOutlineShoppingCart } from 'react-icons/md';

import { FlipIcon } from '@/components/icons/flip-icon';
import type { Card } from '../api/get-user-cards';
import { formatDate } from '../utils/format-date';

import styles from './card-preview-modal.module.css';
import { DeleteCardModal } from './delete-card-modal';
import { QuantityPicker } from './quantity-picker';

interface CardPreviewModalProps {
  card: Card | undefined;
  opened: boolean;
  onClose: () => void;
  onBuyCard?: (cardId: number, quantity: number) => void;
}

export function CardPreviewModal({
  card,
  opened,
  onClose,
  onBuyCard,
}: CardPreviewModalProps) {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [quantity, setQuantity] = useState(1);
  const [isFlipped, setIsFlipped] = useState(false);
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);

  const handleBuyCard = () => {
    if (onBuyCard && card) {
      onBuyCard(card.id, quantity);
    }
  };

  if (!card) return null;

  const content = (
    <>
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
        <Menu shadow="md" width={200} position="bottom-end">
          <Menu.Target>
            <ActionIcon
              variant="transparent"
              size="lg"
              className={styles.headerIcon}
            >
              <MoreVertical size={24} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown className={styles.menuDropdown}>
            <Menu.Item
              leftSection={<Pencil size={16} />}
              className={styles.menuItem}
            >
              Edit Card
            </Menu.Item>
            <Menu.Item
              leftSection={<Copy size={16} />}
              className={styles.menuItem}
            >
              Duplicate Card
            </Menu.Item>
            <Menu.Item
              leftSection={<Trash2 size={16} />}
              onClick={openDeleteModal}
              className={styles.menuItem}
            >
              Delete Card
            </Menu.Item>
            <Menu.Item
              leftSection={<Share2 size={16} />}
              className={styles.menuItem}
            >
              Share Card
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
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

          {isMobile ? (
            <div className={styles.mobileCardSection}>
              <div className={styles.flipCard} data-flipped={isFlipped}>
                <div className={styles.flipCardInner}>
                  <div className={styles.flipCardFront}>
                    <Image
                      src={card.frontCardImage}
                      alt="Card front"
                      fit="contain"
                      className={styles.cardImage}
                    />
                  </div>
                  <div className={styles.flipCardBack}>
                    <Image
                      src={card.backCardImage}
                      alt="Card back"
                      fit="contain"
                      className={styles.cardImage}
                    />
                  </div>
                </div>
              </div>
              <button
                type="button"
                className={styles.flipButton}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <FlipIcon size={20} />
                <span>Flip</span>
              </button>
            </div>
          ) : (
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
          )}
        </div>

        <Text className={styles.createdDate}>
          Created: {formatDate(card.createdAt)}
        </Text>
      </div>

      <div className={styles.footer}>
        <QuantityPicker
          value={quantity}
          onChange={setQuantity}
          size={isMobile ? 'sm' : 'lg'}
        />
        <Button
          variant="filled"
          size={isMobile ? 'sm' : 'lg'}
          radius="xl"
          leftSection={<MdOutlineShoppingCart size={isMobile ? 16 : 20} />}
          className={styles.buyButton}
          onClick={handleBuyCard}
        >
          Buy this Card
        </Button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Drawer
        opened={opened}
        onClose={onClose}
        position="bottom"
        size="65%"
        withCloseButton={false}
        classNames={{ content: styles.drawer }}
      >
        {content}
        <DeleteCardModal
          cardId={card?.id}
          opened={deleteModalOpened}
          onClose={closeDeleteModal}
          onDeleted={onClose}
        />
      </Drawer>
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      centered
      size="xl"
      classNames={{
        overlay: styles.overlay,
        content: styles.content,
        body: styles.body,
      }}
    >
      {content}
      <DeleteCardModal
        cardId={card?.id}
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        onDeleted={onClose}
      />
    </Modal>
  );
}
