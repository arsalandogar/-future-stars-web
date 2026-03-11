import {
  ActionIcon,
  Drawer,
  Menu,
  Modal,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  MoreVertical,
  Pencil,
  Share2,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { FlipIcon } from '@/components/icons/flip-icon';
import { useShareModalStore } from '@/stores/share-modal-store';
import { CardSidePreview } from '@/components/card-side-preview';
import {
  BuyCardButton,
  EditCardButton,
  ShareCardButton,
} from '@/components/ui/card-actions';
import type { Card } from '../api/get-user-cards';
import { useCreatePackModalStore } from '../stores/create-pack-modal-store';
import { formatDate } from '../utils/format-date';

import styles from './card-preview-modal.module.css';
import { DeleteCardModal } from './delete-card-modal';
import { QuantityPicker } from './quantity-picker';

interface CardPreviewModalProps {
  cards: Card[];
  initialIndex: number;
  opened: boolean;
  onClose: () => void;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
}

export function CardPreviewModal({
  cards,
  initialIndex,
  opened,
  onClose,
  hasNextPage,
  onLoadMore,
}: CardPreviewModalProps) {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const openShareCard = useShareModalStore((s) => s.openCard);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [quantity, setQuantity] = useState(1);
  const [isFlipped, setIsFlipped] = useState(false);
  const [prevInitialIndex, setPrevInitialIndex] = useState(initialIndex);
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const isLoadingMoreRef = useRef(false);
  const prevCardsLengthRef = useRef(cards.length);

  // Reset index when initialIndex changes (new card selected) - adjust state during render
  if (initialIndex !== prevInitialIndex) {
    setPrevInitialIndex(initialIndex);
    setCurrentIndex(initialIndex);
    setQuantity(1);
    setIsFlipped(false);
  }

  // Reset loading flag when cards length changes (new cards loaded)
  useEffect(() => {
    if (cards.length !== prevCardsLengthRef.current) {
      isLoadingMoreRef.current = false;
      prevCardsLengthRef.current = cards.length;
    }
  }, [cards.length]);

  // Load more cards when approaching the end (with guard against duplicate calls)
  useEffect(() => {
    if (
      currentIndex >= cards.length - 2 &&
      hasNextPage &&
      onLoadMore &&
      !isLoadingMoreRef.current
    ) {
      isLoadingMoreRef.current = true;
      onLoadMore();
    }
  }, [currentIndex, cards.length, hasNextPage, onLoadMore]);

  // Close preview when the pack modal opens (triggered by BuyCardButton)
  const packModalOpened = useCreatePackModalStore((s) => s.opened);
  useEffect(() => {
    if (packModalOpened && opened) {
      onClose();
    }
  }, [packModalOpened, opened, onClose]);

  const card = cards[currentIndex];
  const totalCards = cards.length;
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < totalCards - 1 || hasNextPage;

  const handlePrev = () => {
    if (canGoPrev) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
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
              onClick={() => openShareCard(card)}
            >
              Share Card
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>

      <div className={styles.contentContainer}>
        {/* Card Counter */}
        <Text className={styles.cardCounter}>
          Card {currentIndex + 1} of {totalCards}
        </Text>

        <div className={styles.cardsWrapper}>
          {/* Left Arrow */}
          <button
            type="button"
            className={`${styles.navArrow} ${styles.navArrowLeft}`}
            onClick={handlePrev}
            disabled={!canGoPrev}
            aria-label="Previous card"
          >
            <ChevronLeft size={32} />
          </button>

          <div className={styles.cardsContent}>
            <div className={styles.actionsRow}>
              <ShareCardButton onClick={() => openShareCard(card)} />
              <EditCardButton cardId={card.id} />
            </div>

            {isMobile ? (
              <div className={styles.mobileCardSection}>
                <div className={styles.flipCard} data-flipped={isFlipped}>
                  <div className={styles.flipCardInner}>
                    <div className={styles.flipCardFront}>
                      <CardSidePreview
                        imageUrl={card.frontCardImage}
                        svgString={card.svgString}
                        status={card.status}
                        alt="Card front"
                        fit="contain"
                        className={styles.cardImage}
                        badgeSize="sm"
                      />
                    </div>
                    <div className={styles.flipCardBack}>
                      <CardSidePreview
                        imageUrl={card.backCardImage}
                        svgString={card.backSvgString}
                        status={card.status}
                        alt="Card back"
                        fit="contain"
                        className={styles.cardImage}
                        badgeSize="sm"
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
                  <CardSidePreview
                    imageUrl={card.frontCardImage}
                    svgString={card.svgString}
                    status={card.status}
                    alt="Card front"
                    fit="contain"
                    className={styles.cardImage}
                    badgeSize="sm"
                  />
                </div>
                <div className={styles.cardImageWrapper}>
                  <CardSidePreview
                    imageUrl={card.backCardImage}
                    svgString={card.backSvgString}
                    status={card.status}
                    alt="Card back"
                    fit="contain"
                    className={styles.cardImage}
                    badgeSize="sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Arrow */}
          <button
            type="button"
            className={`${styles.navArrow} ${styles.navArrowRight}`}
            onClick={handleNext}
            disabled={!canGoNext}
            aria-label="Next card"
          >
            <ChevronRight size={32} />
          </button>
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
        <BuyCardButton
          cardId={card.id}
          quantity={quantity}
          size={isMobile ? 'sm' : 'lg'}
        />
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
