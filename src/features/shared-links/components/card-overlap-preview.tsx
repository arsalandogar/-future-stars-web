import { Image } from '@mantine/core';

interface CardOverlapPreviewProps {
  frontImage: string;
  backImage: string;
  cardWidth?: number;
  className?: string;
}

export function CardOverlapPreview({
  frontImage,
  backImage,
  cardWidth = 180,
  className,
}: CardOverlapPreviewProps) {
  return (
    <div className={`flex items-center justify-center ${className ?? ''}`}>
      <div
        className="relative flex items-center justify-center"
        style={{ width: cardWidth * 2, height: cardWidth * 1.6 }}
      >
        <Image
          src={backImage}
          alt="Card back"
          fit="contain"
          style={{
            width: cardWidth,
            position: 'absolute',
            transform: 'rotate(6deg) translateX(15%)',
            zIndex: 1,
          }}
        />
        <Image
          src={frontImage}
          alt="Card front"
          fit="contain"
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
