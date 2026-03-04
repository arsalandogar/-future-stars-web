import { Loader, SimpleGrid } from '@mantine/core';

import type { Pack } from '@/types';
import { useInfiniteScroll } from '@/hooks';

import { PackItem } from './pack-item';
import styles from './packs-list.module.css';
import type { ViewMode } from './view-toggle';

interface PacksListProps {
  packs: Pack[];
  view: ViewMode;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => unknown;
  onAddToCart: (pack: Pack) => void;
  onPreview: (pack: Pack) => void;
  onEdit: (pack: Pack) => void;
  onCopy: (pack: Pack) => void;
}

export function PacksList({
  packs,
  view,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  onAddToCart,
  onPreview,
  onEdit,
  onCopy,
}: PacksListProps) {
  const { ref } = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  if (view === 'grid') {
    return (
      <div className={`${styles.container} ${styles.gridContainer}`}>
        <SimpleGrid cols={2} spacing="md">
          {packs.map((pack) => (
            <PackItem
              key={pack.id}
              pack={pack}
              variant="grid"
              onAddToCart={onAddToCart}
              onPreview={() => onPreview(pack)}
              onEdit={onEdit}
              onCopy={onCopy}
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
            onPreview={() => onPreview(pack)}
            onEdit={onEdit}
            onCopy={onCopy}
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
