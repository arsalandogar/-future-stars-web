import { Skeleton, SimpleGrid } from '@mantine/core';

import styles from './cards-skeleton.module.css';

interface CardsSkeletonProps {
  count?: number;
}

export function CardsSkeleton({ count = 10 }: CardsSkeletonProps) {
  return (
    <SimpleGrid
      cols={{ base: 2, xs: 3, sm: 4, md: 5 }}
      spacing="var(--cards-grid-spacing)"
      verticalSpacing="var(--cards-grid-spacing)"
    >
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={`skeleton-${index}`}
          radius={0}
          className={styles.skeleton}
        />
      ))}
    </SimpleGrid>
  );
}
