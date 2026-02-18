import { useEffect, useState } from 'react';
import { Carousel } from '@mantine/carousel';
import type { EmblaCarouselType } from 'embla-carousel';
import {
  ActionIcon,
  Drawer,
  Image,
  Menu,
  Modal,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useNavigate } from '@tanstack/react-router';
import {
  ChevronLeft,
  ChevronRight,
  MinusCircle,
  MoreVertical,
  Pencil,
  SquarePen,
  Trash2,
  X,
} from 'lucide-react';

import { FlipIcon } from '@/components/icons/flip-icon';
import type { Pack } from '@/types';

import { useRemoveCardFromPack } from '../api/remove-card-from-pack';

import { DeleteCardModal } from './delete-card-modal';
import styles from './pack-preview-modal.module.css';

interface PackPreviewModalProps {
  pack: Pack | null;
  opened: boolean;
  onClose: () => void;
  onEditPack?: (pack: Pack) => void;
}

export function PackPreviewModal({
  pack,
  opened,
  onClose,
  onEditPack,
}: PackPreviewModalProps) {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const navigate = useNavigate();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [embla, setEmbla] = useState<EmblaCarouselType | null>(null);
  const [
    deleteCardModalOpened,
    { open: openDeleteCardModal, close: closeDeleteCardModal },
  ] = useDisclosure(false);

  const removeCardFromPack = useRemoveCardFromPack();

  const packCards = pack?.packCards ?? [];
  const currentPackCard = packCards[currentCardIndex];
  const totalCards = packCards.length;

  // Track previous state for "adjust state during render" pattern
  const [prevOpened, setPrevOpened] = useState(opened);
  const [prevPack, setPrevPack] = useState(pack);
  const [prevCardIndex, setPrevCardIndex] = useState(currentCardIndex);

  // Reset to first card when pack changes - adjust state during render
  if (opened !== prevOpened || pack !== prevPack) {
    setPrevOpened(opened);
    setPrevPack(pack);
    if (opened && pack) {
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setPrevCardIndex(0);
    }
  }

  // Reset flip state when card changes - adjust state during render
  if (currentCardIndex !== prevCardIndex) {
    setPrevCardIndex(currentCardIndex);
    setIsFlipped(false);
  }

  const handleEditCard = () => {
    if (!currentPackCard) return;
    void navigate({
      to: '/create-card',
      search: { templateId: currentPackCard.card.templateId },
    });
    onClose();
  };

  const handleRemoveFromPack = () => {
    if (!pack || !currentPackCard) return;
    removeCardFromPack.mutate(
      {
        packId: pack.id,
        cardId: currentPackCard.cardId,
      },
      {
        onSuccess: () => {
          // If this was the last card, close the modal
          if (totalCards === 1) {
            onClose();
          } else {
            // Move to next/previous card
            setCurrentCardIndex(Math.min(currentCardIndex, totalCards - 2));
          }
        },
      }
    );
  };

  const handleEditPack = () => {
    if (!pack) return;
    onEditPack?.(pack);
    onClose();
  };

  const handleCardDeleted = () => {
    // If this was the last card, close the modal
    if (totalCards === 1) {
      onClose();
    } else {
      // Move to next/previous card
      setCurrentCardIndex(Math.min(currentCardIndex, totalCards - 2));
    }
  };

  // Sync carousel with current card index
  useEffect(() => {
    if (!embla || currentCardIndex < 0) return;
    const indicesInView = embla.slidesInView();
    if (indicesInView.includes(currentCardIndex)) return;
    embla.scrollTo(currentCardIndex, false);
  }, [embla, currentCardIndex]);

  function handleThumbnailClick(index: number): void {
    setCurrentCardIndex(index);
  }

  function handlePrev(): void {
    const newIndex = Math.max(0, currentCardIndex - 1);
    setCurrentCardIndex(newIndex);
    embla?.scrollPrev();
  }

  function handleNext(): void {
    const newIndex = Math.min(totalCards - 1, currentCardIndex + 1);
    setCurrentCardIndex(newIndex);
    embla?.scrollNext();
  }

  const canGoPrev = currentCardIndex > 0;
  const canGoNext = currentCardIndex < totalCards - 1;

  if (!pack || !currentPackCard) return null;

  const content = (
    <>
      {/* Header */}
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
          PACK PREVIEW
        </Title>
        <Menu
          shadow="md"
          width={200}
          position="bottom-end"
          classNames={{ dropdown: styles.menuDropdown }}
        >
          <Menu.Target>
            <ActionIcon
              variant="transparent"
              size="lg"
              className={styles.headerIcon}
            >
              <MoreVertical size={24} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<Pencil size={14} />}
              onClick={handleEditCard}
            >
              Edit Card
            </Menu.Item>
            <Menu.Item
              leftSection={<MinusCircle size={14} />}
              onClick={handleRemoveFromPack}
              disabled={removeCardFromPack.isPending}
            >
              Remove from Pack
            </Menu.Item>
            <Menu.Item
              leftSection={<SquarePen size={14} />}
              onClick={handleEditPack}
            >
              Edit Pack
            </Menu.Item>
            <Menu.Item
              leftSection={<Trash2 size={14} />}
              onClick={openDeleteCardModal}
            >
              Delete Card
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>

      {/* Card Counter */}
      <div className={styles.cardCounter}>
        <Text c="gray.4" size="lg">
          Card {currentCardIndex + 1} of {totalCards}
        </Text>
      </div>

      {/* Card Preview Section */}
      {isMobile ? (
        <div className={styles.mobilePreviewSection}>
          <div className={styles.flipCard} data-flipped={isFlipped}>
            <div className={styles.flipCardInner}>
              <div className={styles.flipCardFront}>
                <Image
                  src={currentPackCard.card.frontCardImage}
                  alt="Card front"
                  fit="contain"
                  className={styles.cardImage}
                />
              </div>
              <div className={styles.flipCardBack}>
                <Image
                  src={currentPackCard.card.backCardImage}
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
        <div className={styles.previewSection}>
          <div className={styles.previewCard}>
            <Image
              src={currentPackCard.card.frontCardImage}
              alt="Card front"
              fit="contain"
              className={styles.cardImage}
            />
          </div>
          <div className={styles.previewCard}>
            <Image
              src={currentPackCard.card.backCardImage}
              alt="Card back"
              fit="contain"
              className={styles.cardImage}
            />
          </div>
        </div>
      )}

      {/* Carousel Section */}
      <div className={styles.carouselSection}>
        <ActionIcon
          className={styles.arrowButton}
          variant="filled"
          size="lg"
          onClick={handlePrev}
          disabled={!canGoPrev}
          aria-label="Previous card"
        >
          <ChevronLeft size={20} />
        </ActionIcon>

        <Carousel
          getEmblaApi={setEmbla}
          slideSize={isMobile ? '25%' : '16.666%'}
          slideGap="sm"
          withControls={false}
          classNames={{ root: styles.carousel }}
        >
          {packCards.map((packCard, index) => {
            const isSelected = index === currentCardIndex;
            return (
              <Carousel.Slide key={packCard.cardId}>
                <button
                  type="button"
                  className={styles.thumbnail}
                  data-selected={isSelected}
                  onClick={() => handleThumbnailClick(index)}
                >
                  <img
                    src={packCard.card.frontCardImage}
                    alt={`Card ${index + 1}`}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className={styles.quantityPill}>
                    x{packCard.quantity}
                  </span>
                </button>
              </Carousel.Slide>
            );
          })}
        </Carousel>

        <ActionIcon
          className={styles.arrowButton}
          variant="filled"
          size="lg"
          onClick={handleNext}
          disabled={!canGoNext}
          aria-label="Next card"
        >
          <ChevronRight size={20} />
        </ActionIcon>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        <Drawer
          opened={opened}
          onClose={onClose}
          position="bottom"
          size="60%"
          withCloseButton={false}
          classNames={{ content: styles.drawer }}
        >
          {content}
        </Drawer>
        <DeleteCardModal
          cardId={currentPackCard?.cardId}
          opened={deleteCardModalOpened}
          onClose={closeDeleteCardModal}
          onDeleted={handleCardDeleted}
        />
      </>
    );
  }

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        size="xl"
        centered
        withCloseButton={false}
        classNames={{
          overlay: styles.overlay,
          content: styles.content,
          body: styles.body,
        }}
      >
        {content}
      </Modal>
      <DeleteCardModal
        cardId={currentPackCard?.cardId}
        opened={deleteCardModalOpened}
        onClose={closeDeleteCardModal}
        onDeleted={handleCardDeleted}
      />
    </>
  );
}
