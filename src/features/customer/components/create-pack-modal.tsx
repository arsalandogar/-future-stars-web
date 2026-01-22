import {
  Button,
  Loader,
  Modal,
  SimpleGrid,
  Text,
  Title,
} from '@mantine/core';
import { useIntersection, useMediaQuery } from '@mantine/hooks';
import { Check, RefreshCw, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import type { Pack } from '@/types';
import { MAX_PACK_CARDS } from '@/types';

import { useCreatePack } from '../api/create-pack';
import {
  useUserCards,
  USER_CARDS_DEFAULT_LIMIT,
  USER_CARDS_INITIAL_PAGE,
} from '../api/get-user-cards';
import { useUpdatePack } from '../api/update-pack';

import { PackCreatedModal } from './pack-created-modal';
import { SelectableCardItem } from './selectable-card-item';
import styles from './create-pack-modal.module.css';

interface CreatePackModalProps {
  opened: boolean;
  onClose: () => void;
  editingPack?: Pack;
  initialSelectedCards?: Map<number, number>;
}

export function CreatePackModal({
  opened,
  onClose,
  editingPack,
  initialSelectedCards,
}: CreatePackModalProps) {
  const [selectedCards, setSelectedCards] = useState<Map<number, number>>(
    () => new Map()
  );
  const [createdPack, setCreatedPack] = useState<Pack | null>(null);
  const [successModalOpened, setSuccessModalOpened] = useState(false);
  const isMobile = useMediaQuery('(max-width: 576px)');

  const createPack = useCreatePack();
  const updatePack = useUpdatePack();

  const isEditMode = !!editingPack;

  // Get card IDs from editing pack for API filtering
  const editingCardIds = useMemo(() => {
    if (!editingPack) return [];
    return editingPack.packCards.map((pc) => pc.cardId);
  }, [editingPack]);

  const { ref: loadMoreRef, entry } = useIntersection({
    threshold: 0.5,
  });

  // Query for selected cards (only in edit mode)
  const {
    data: selectedCardsData,
    isLoading: isLoadingSelected,
  } = useUserCards({
    variables: {
      page: USER_CARDS_INITIAL_PAGE,
      limit: MAX_PACK_CARDS,
      includeIds: editingCardIds,
    },
    enabled: isEditMode && editingCardIds.length > 0,
  });

  // Query for remaining cards (excludes selected cards in edit mode)
  const {
    data: remainingCardsData,
    isLoading: isLoadingRemaining,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useUserCards({
    variables: {
      page: USER_CARDS_INITIAL_PAGE,
      limit: USER_CARDS_DEFAULT_LIMIT,
      excludeIds: isEditMode ? editingCardIds : undefined,
    },
  });

  // Initialize state when modal opens with editing pack or initial selected cards
  useEffect(() => {
    if (opened) {
      if (editingPack) {
        // Edit mode: initialize from pack's cards
        const cardsMap = new Map<number, number>();
        editingPack.packCards.forEach((pc) => {
          cardsMap.set(pc.cardId, pc.quantity);
        });
        setSelectedCards(cardsMap);
      } else if (initialSelectedCards) {
        // Copy mode: initialize from provided cards
        setSelectedCards(new Map(initialSelectedCards));
      } else {
        // Create mode: start fresh
        setSelectedCards(new Map());
      }
    }
  }, [opened, editingPack, initialSelectedCards]);

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [entry?.isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Combine selected cards (at top) with remaining cards
  const visibleCards = useMemo(() => {
    const selectedCardsArray =
      selectedCardsData?.pages.flatMap((page) => page.data) ?? [];
    const remainingCardsArray =
      remainingCardsData?.pages.flatMap((page) => page.data) ?? [];

    // Filter out hidden cards
    const filteredSelected = selectedCardsArray.filter(
      (card) => !card.hiddenFromGallery
    );
    const filteredRemaining = remainingCardsArray.filter(
      (card) => !card.hiddenFromGallery
    );

    // In edit mode, show selected cards first
    if (isEditMode) {
      return [...filteredSelected, ...filteredRemaining];
    }

    // In create/copy mode, just show remaining cards
    return filteredRemaining;
  }, [selectedCardsData, remainingCardsData, isEditMode]);

  const isLoading = isEditMode
    ? isLoadingSelected || isLoadingRemaining
    : isLoadingRemaining;

  const totalSelected = Array.from(selectedCards.values()).reduce(
    (a, b) => a + b,
    0
  );
  const canAddMore = totalSelected < MAX_PACK_CARDS;
  const hasSelection = totalSelected > 0;

  const handleSelectCard = (cardId: number) => {
    if (selectedCards.has(cardId)) {
      // Deselect card
      setSelectedCards((prev) => {
        const next = new Map(prev);
        next.delete(cardId);
        return next;
      });
    } else if (canAddMore) {
      // Select card with quantity 1
      setSelectedCards((prev) => new Map(prev).set(cardId, 1));
    }
  };

  const handleQuantityChange = (cardId: number, quantity: number) => {
    if (quantity <= 0) {
      setSelectedCards((prev) => {
        const next = new Map(prev);
        next.delete(cardId);
        return next;
      });
    } else {
      const currentTotal = totalSelected;
      const currentQuantity = selectedCards.get(cardId) ?? 0;
      const newTotal = currentTotal - currentQuantity + quantity;

      if (newTotal <= MAX_PACK_CARDS) {
        setSelectedCards((prev) => new Map(prev).set(cardId, quantity));
      }
    }
  };

  const handleReset = () => {
    setSelectedCards(new Map());
  };

  const handleClose = () => {
    setSelectedCards(new Map());
    setCreatedPack(null);
    setSuccessModalOpened(false);
    onClose();
  };

  const handleSuccessModalClose = () => {
    setSuccessModalOpened(false);
    setCreatedPack(null);
    handleClose();
  };

  const handleSubmit = () => {
    const cardsArray = Array.from(selectedCards.entries()).map(
      ([cardId, quantity]) => ({
        cardId,
        quantity,
      })
    );

    if (isEditMode && editingPack) {
      // Update existing pack - just close on success (toast shown by mutation)
      updatePack.mutate(
        {
          id: editingPack.id,
          cards: cardsArray,
        },
        {
          onSuccess: handleClose,
        }
      );
    } else {
      // Create new pack (for create, copy, and buy modes) - show success modal
      createPack.mutate(
        {
          cards: cardsArray,
        },
        {
          onSuccess: (pack) => {
            setCreatedPack(pack);
            setSuccessModalOpened(true);
          },
        }
      );
    }
  };

  const isSubmitting = createPack.isPending || updatePack.isPending;
  const modalTitle = isEditMode ? 'EDIT YOUR PACK' : 'CREATE YOUR PACK';

  return (
    <>
      <Modal
        opened={opened}
        onClose={handleClose}
        size="1400px"
        fullScreen={isMobile ?? false}
        centered
        withCloseButton={false}
        classNames={{
          content: styles.modalContent,
          body: styles.modalBody,
        }}
        overlayProps={{
          backgroundOpacity: 0.6,
        }}
      >
        {/* Header Section */}
        <div className={styles.header}>
          <Title order={2} c="white" fw={800} className={styles.title}>
            {modalTitle}
          </Title>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
          >
            <X size={28} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Cards Selected indicator */}
          {hasSelection && (
            <div className={styles.selectedIndicator}>
              <Text c="white" fw={600} size={isMobile ? 'sm' : 'md'}>
                {totalSelected} {totalSelected === 1 ? 'Card' : 'Cards'} Selected
              </Text>
            </div>
          )}

          {/* Cards Grid */}
          <div className={styles.cardsArea}>
            {isLoading ? (
              <div className={styles.loading}>
                <Loader size="lg" />
              </div>
            ) : (
              <>
                <SimpleGrid
                  cols={{ base: 2, xs: 3, sm: 4, md: 5 }}
                  spacing="lg"
                  verticalSpacing="lg"
                >
                  {visibleCards.map((card) => (
                    <SelectableCardItem
                      key={card.id}
                      card={card}
                      isSelected={selectedCards.has(card.id)}
                      quantity={selectedCards.get(card.id) ?? 0}
                      onSelect={() => handleSelectCard(card.id)}
                      onQuantityChange={(qty) =>
                        handleQuantityChange(card.id, qty)
                      }
                      disabled={!canAddMore && !selectedCards.has(card.id)}
                    />
                  ))}
                </SimpleGrid>

                {hasNextPage && (
                  <div ref={loadMoreRef} className={styles.loadMore}>
                    {isFetchingNextPage && <Loader size="sm" />}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <Button
            variant="outline"
            size="md"
            radius="xl"
            leftSection={<RefreshCw size={18} />}
            onClick={handleReset}
            disabled={!hasSelection}
          >
            Reset
          </Button>
          <Button
            variant="filled"
            size="md"
            radius="xl"
            leftSection={<Check size={18} />}
            disabled={!hasSelection}
            onClick={handleSubmit}
            loading={isSubmitting}
          >
            Save
          </Button>
        </div>
      </Modal>

      <PackCreatedModal
        pack={createdPack}
        opened={successModalOpened}
        onClose={handleSuccessModalClose}
      />
    </>
  );
}
