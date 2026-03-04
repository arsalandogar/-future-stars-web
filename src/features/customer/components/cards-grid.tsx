import { Loader, SimpleGrid } from '@mantine/core';

import { useInfiniteScroll } from '@/hooks';

import type { Card } from '../api/get-user-cards';

import { CardItem } from './card-item';
import styles from './cards-grid.module.css';
import { CreateCardButton } from './create-card-button';

interface CardsGridProps {
  cards: Card[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => unknown;
  onCardClick: (card: Card) => void;
}

export function CardsGrid({
  cards,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  onCardClick,
}: CardsGridProps) {
  const { ref } = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  return (
    <div className={styles.container}>
      <SimpleGrid
        cols={{ base: 2, xs: 3, sm: 4, md: 5 }}
        spacing="var(--cards-grid-spacing)"
        verticalSpacing="var(--cards-grid-spacing)"
        style={{ alignItems: 'flex-start' }}
      >
        {cards.map((card) => (
          <CardItem
            key={card.id}
            imageUrl={card.frontCardImage}
            onClick={() => onCardClick(card)}
          />
        ))}
        <CreateCardButton />
      </SimpleGrid>

      {hasNextPage && (
        <div ref={ref} className={styles.loadMore}>
          {isFetchingNextPage && <Loader size="sm" />}
        </div>
      )}
    </div>
  );
}
