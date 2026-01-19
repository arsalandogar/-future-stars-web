import { Carousel } from '@mantine/carousel';
import { Skeleton } from '@mantine/core';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

import type { FeaturedItem } from '@/types';

import { FeaturedItemSlide } from './featured-item-slide';
import styles from './featured-carousel.module.css';

interface FeaturedCarouselProps {
  items: FeaturedItem[];
  isLoading?: boolean;
}

export function FeaturedCarousel({ items, isLoading }: FeaturedCarouselProps) {
  const autoplay = useRef(Autoplay({ delay: 5000 }));

  if (isLoading) {
    return <FeaturedCarouselSkeleton />;
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <Carousel
        withIndicators
        emblaOptions={{ loop: true }}
        plugins={[autoplay.current]}
        previousControlIcon={<ChevronLeft size={20} />}
        nextControlIcon={<ChevronRight size={20} />}
        classNames={{
          root: styles.carousel,
          controls: styles.controls,
          control: styles.control,
          indicators: styles.indicators,
          indicator: styles.indicator,
        }}
      >
        {items.map((item) => (
          <Carousel.Slide key={item.id}>
            <FeaturedItemSlide
              title={item.title}
              description={item.description}
              ctaText={item.ctaText}
              imageUrl={item.imageUrl}
            />
          </Carousel.Slide>
        ))}
      </Carousel>
    </div>
  );
}

function FeaturedCarouselSkeleton() {
  return (
    <div className={styles.skeleton}>
      <Skeleton height={48} width={400} radius="md" />
      <Skeleton height={350} width={280} radius="md" />
      <Skeleton height={48} width={180} radius="xl" />
      <Skeleton height={60} width={500} radius="md" />
    </div>
  );
}
