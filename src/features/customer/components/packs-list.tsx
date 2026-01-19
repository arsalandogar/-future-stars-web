import { Loader, SimpleGrid } from '@mantine/core';
import { useIntersection } from '@mantine/hooks';
import { useEffect } from 'react';

import type { Pack } from '@/types';

import { PackItem } from './pack-item';
import styles from './packs-list.module.css';
import type { ViewMode } from './view-toggle';

interface PacksListProps {
  packs: Pack[];
  view: ViewMode;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  onAddToCart: (pack: Pack) => void;
}

export function PacksList({
  packs,
  view,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  onAddToCart,
}: PacksListProps) {
  const { ref, entry } = useIntersection({
    threshold: 0.5,
  });

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [entry?.isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (view === 'grid') {
    return (
      <div className={styles.container}>
        <SimpleGrid cols={2} spacing="md">
          {packs.map((pack) => (
            <PackItem
              key={pack.id}
              pack={pack}
              variant="grid"
              onAddToCart={onAddToCart}
            />
          ))}
        </SimpleGrid>

        {hasNextPage && (
          <div ref={ref} className={styles.loadMore}>
            {isFetchingNextPage && <Loader size="sm" />}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.listContainer}>
        {packs.map((pack) => (
          <PackItem
            key={pack.id}
            pack={pack}
            variant="list"
            onAddToCart={onAddToCart}
          />
        ))}
      </div>

      {hasNextPage && (
        <div ref={ref} className={styles.loadMore}>
          {isFetchingNextPage && <Loader size="sm" />}
        </div>
      )}
    </div>
  );
}
