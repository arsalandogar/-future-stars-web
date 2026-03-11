import { Image } from '@mantine/core';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { Pack } from '@/types';

import styles from './invitation-pack-preview.module.css';

interface InvitationPackPreviewProps {
  pack: Pack;
  currentCardIndex: number;
  onPrev: () => void;
  onNext: () => void;
}

export function InvitationPackPreview({
  pack,
  currentCardIndex,
  onPrev,
  onNext,
}: InvitationPackPreviewProps) {
  const packCards = pack.packCards;
  const totalCards = packCards.length;
  const currentPackCard = packCards[currentCardIndex];
  const canGoPrev = currentCardIndex > 0;
  const canGoNext = currentCardIndex < totalCards - 1;

  if (!currentPackCard) return null;

  return (
    <div className={styles.preview}>
      <button
        type="button"
        className={styles.arrowButton}
        onClick={onPrev}
        disabled={!canGoPrev}
        aria-label="Previous card"
      >
        <ChevronLeft size={24} />
      </button>

      <div className={styles.cards}>
        <Image
          src={currentPackCard.card.frontCardImage}
          alt="Card front"
          fit="contain"
          className={styles.cardImage}
        />
        <Image
          src={currentPackCard.card.backCardImage}
          alt="Card back"
          fit="contain"
          className={styles.cardImage}
        />
      </div>

      <button
        type="button"
        className={styles.arrowButton}
        onClick={onNext}
        disabled={!canGoNext}
        aria-label="Next card"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}
