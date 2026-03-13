import { useState } from 'react';
import { Text } from '@mantine/core';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { Pack } from '@/types';

import { CardOverlapPreview } from './card-overlap-preview';

interface PackOverlapPreviewProps {
  pack: Pack;
  cardWidth?: number;
  className?: string;
}

export function PackOverlapPreview({
  pack,
  cardWidth = 180,
  className,
}: PackOverlapPreviewProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const packCards = pack.packCards;
  const totalCards = packCards.length;
  const currentPackCard = packCards[currentCardIndex];
  const canGoPrev = currentCardIndex > 0;
  const canGoNext = currentCardIndex < totalCards - 1;

  if (!currentPackCard) return null;

  return (
    <div className={`flex flex-col items-center gap-2 ${className ?? ''}`}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex size-10 shrink-0 items-center justify-center rounded-full border-none bg-transparent text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
          onClick={() => canGoPrev && setCurrentCardIndex((i) => i - 1)}
          disabled={!canGoPrev}
          aria-label="Previous card"
        >
          <ChevronLeft size={24} />
        </button>

        <CardOverlapPreview card={currentPackCard.card} cardWidth={cardWidth} />

        <button
          type="button"
          className="flex size-10 shrink-0 items-center justify-center rounded-full border-none bg-transparent text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
          onClick={() => canGoNext && setCurrentCardIndex((i) => i + 1)}
          disabled={!canGoNext}
          aria-label="Next card"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="rounded-full bg-dark-7 px-4 py-1.5">
        <Text size="sm" c="gray.4" fw={500}>
          Card {currentCardIndex + 1} of {totalCards}
        </Text>
      </div>
    </div>
  );
}
