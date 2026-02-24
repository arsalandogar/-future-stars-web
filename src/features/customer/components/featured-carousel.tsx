import { Carousel } from '@mantine/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

import type { FeaturedItem } from '@/types';

import { FeaturedItemSlide } from './featured-item-slide';
import styles from './featured-carousel.module.css';

interface FeaturedCarouselProps {
  items: FeaturedItem[];
}

export function FeaturedCarousel({ items }: FeaturedCarouselProps) {
  const autoplay = useRef(Autoplay({ delay: 5000 }));

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
