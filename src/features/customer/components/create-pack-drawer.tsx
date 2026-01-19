import {
  Button,
  Container,
  Drawer,
  Loader,
  SimpleGrid,
  Text,
  Title,
} from '@mantine/core';
import { useIntersection } from '@mantine/hooks';
import { RefreshCw, ShoppingCart, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { MAX_PACK_CARDS } from '@/types';

import {
  useUserCards,
  USER_CARDS_DEFAULT_LIMIT,
  USER_CARDS_INITIAL_PAGE,
} from '../api/get-user-cards';
import { SelectableCardItem } from './selectable-card-item';
import styles from './create-pack-drawer.module.css';

interface CreatePackDrawerProps {
  opened: boolean;
  onClose: () => void;
}

export function CreatePackDrawer({ opened, onClose }: CreatePackDrawerProps) {
  const [selectedCards, setSelectedCards] = useState<Map<number, number>>(
    () => new Map()
  );

  const { ref: loadMoreRef, entry } = useIntersection({
    threshold: 0.5,
  });

  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useUserCards({
      variables: {
        page: USER_CARDS_INITIAL_PAGE,
        limit: USER_CARDS_DEFAULT_LIMIT,
      },
    });

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [entry?.isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allCards = data?.pages.flatMap((page) => page.data) ?? [];
  const visibleCards = allCards.filter((card) => !card.hiddenFromGallery);

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
    onClose();
  };

  const handleAddToCart = () => {
    // TODO: Implement add to cart functionality
    console.log('Add to cart:', Object.fromEntries(selectedCards));
    handleClose();
  };

  return (
    <Drawer
      opened={opened}
      onClose={handleClose}
      position="bottom"
      size="calc(100vh - 84px)"
      withCloseButton={false}
      overlayProps={{
        backgroundOpacity: 0,
      }}
      lockScroll
      transitionProps={{
        transition: 'slide-up',
        duration: 300,
      }}
      styles={{
        inner: {
          top: '84px',
          height: 'calc(100vh - 84px)',
        },
        content: {
          height: '100%',
          maxHeight: '100%',
          background:
            'linear-gradient(to bottom, var(--customer-bg-gradient-start), var(--customer-bg-gradient-end))',
        },
        body: {
          padding: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Container size="xl" className={styles.container}>
        {/* Header Section */}
        <div className={styles.header}>
          <Title order={1} c="white" fw={800} className={styles.title}>
            CREATE YOUR PACK
          </Title>
          <Text c="gray.4" size="lg">
            Select up to {MAX_PACK_CARDS} cards to add to your pack!
          </Text>
        </div>

        {/* Content Container (Selection Bar + Cards Grid) */}
        <div className={styles.contentContainer}>
          {/* Selection Bar */}
          <div className={styles.selectionBar}>
            <div className={styles.selectionInfo}>
              <Text c="white" fw={600} size="lg">
                {totalSelected} {totalSelected === 1 ? 'Card' : 'Cards'}{' '}
                Selected
              </Text>
              <Button
                variant="transparent"
                c="primary"
                leftSection={
                  hasSelection ? <RefreshCw size={16} /> : <X size={16} />
                }
                onClick={hasSelection ? handleReset : handleClose}
                className={styles.cancelButton}
              >
                {hasSelection ? 'Reset' : 'Cancel'}
              </Button>
            </div>
            <Button
              variant={hasSelection ? 'filled' : 'default'}
              size="md"
              radius="xl"
              leftSection={<ShoppingCart size={18} />}
              disabled={!hasSelection}
              onClick={handleAddToCart}
              className={styles.addToCartButton}
            >
              Add to Cart
            </Button>
          </div>

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
      </Container>
    </Drawer>
  );
}
