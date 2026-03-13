import { CardSidePreview } from '@/components/card-side-preview';
import type { Card } from '@/types';

interface CardOverlapPreviewProps {
  card: Card;
  cardWidth?: number;
  className?: string;
}

export function CardOverlapPreview({
  card,
  cardWidth = 180,
  className,
}: CardOverlapPreviewProps) {
  return (
    <div className={`flex items-center justify-center ${className ?? ''}`}>
      <div
        className="relative flex items-center justify-center"
        style={{ width: cardWidth * 2, height: cardWidth * 1.6 }}
      >
        <CardSidePreview
          card={card}
          side="back"
          style={{
            width: cardWidth,
            position: 'absolute',
            transform: 'rotate(6deg) translateX(15%)',
            zIndex: 1,
          }}
        />
        <CardSidePreview
          card={card}
          style={{
            width: cardWidth,
            position: 'absolute',
            transform: 'rotate(-6deg) translateX(-15%)',
            zIndex: 2,
          }}
        />
      </div>
    </div>
  );
}
