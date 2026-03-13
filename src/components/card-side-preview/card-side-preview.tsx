import {
  Badge,
  Tooltip,
  type MantineColor,
  type MantineSize,
} from '@mantine/core';
import type { CSSProperties } from 'react';
import { useState } from 'react';
import {
  Clock3,
  ImageOff,
  Pencil,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';

import { SvgPreview } from '@/components/svg-preview';
import type { Card, CardPreviewStatus, OrderCardSnapshot } from '@/types';

import styles from './card-side-preview.module.css';
import type { Side } from '@fs-card-engine';

type PreviewSource = 'image' | 'svg' | 'unavailable';

interface PreviewIndicator {
  color: MantineColor;
  label: string;
  icon: LucideIcon;
}

export interface CardSidePreviewProps {
  card: Card | OrderCardSnapshot;
  side?: Side;
  className?: string;
  style?: CSSProperties;
  badgeSize?: MantineSize;
}

function getIndicator(
  status: CardPreviewStatus,
  source: PreviewSource
): PreviewIndicator | null {
  if (source === 'unavailable') {
    return {
      color: 'gray',
      label: 'Preview unavailable',
      icon: TriangleAlert,
    };
  }

  if (source === 'svg') {
    switch (status) {
      case 'draft':
        return {
          color: 'gray',
          label: 'Draft Preview',
          icon: Pencil,
        };
      case 'processing':
        return {
          color: 'blue',
          label: 'Processing',
          icon: Clock3,
        };
      case 'failed':
      case 'completed':
        return {
          color: 'red',
          label: 'Image Unavailable',
          icon: ImageOff,
        };
      default:
        return null;
    }
  }

  switch (status) {
    case 'draft':
      return { color: 'gray', label: 'Draft', icon: Pencil };
    case 'processing':
      return { color: 'blue', label: 'Processing', icon: Clock3 };
    case 'failed':
      return { color: 'red', label: 'Failed', icon: TriangleAlert };
    case 'completed':
    default:
      return null;
  }
}

function getPreviewSource(
  imageUrl: string | null,
  svgString: string | null,
  imageFailed: boolean
): PreviewSource {
  if (imageUrl && !imageFailed) return 'image';
  if (svgString) return 'svg';
  return 'unavailable';
}

export function CardSidePreview({
  card,
  side = 'front',
  className,
  style,
  badgeSize = 'xs',
}: CardSidePreviewProps) {
  const rawImageUrl =
    side === 'back' ? card.backCardImage : card.frontCardImage;
  const rawSvgString = side === 'back' ? card.backSvgString : card.svgString;
  const normalizedImageUrl = rawImageUrl?.trim() || null;
  const normalizedSvgString = rawSvgString?.trim() || null;
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const imageFailed =
    normalizedImageUrl != null && failedImageUrl === normalizedImageUrl;

  const source = getPreviewSource(
    normalizedImageUrl,
    normalizedSvgString,
    imageFailed
  );
  const indicator = getIndicator(card.status, source);
  const iconOnly = badgeSize === 'xs';
  const badgeIconSize = iconOnly ? 12 : 14;
  const IndicatorIcon = indicator?.icon;

  return (
    <div
      className={`${styles.root}${className ? ` ${className}` : ''}`}
      style={style}
    >
      {indicator && IndicatorIcon ? (
        <Tooltip
          label={indicator.label}
          withArrow
          openDelay={100}
          position="bottom-end"
        >
          <Badge
            size={badgeSize}
            color={indicator.color}
            variant="filled"
            className={`${styles.badge}${iconOnly ? ` ${styles.badgeIconOnly}` : ''}`}
            title={indicator.label}
            aria-label={indicator.label}
            data-icon-only={iconOnly || undefined}
          >
            {iconOnly ? (
              <IndicatorIcon size={badgeIconSize} strokeWidth={2.25} />
            ) : (
              <span className={styles.badgeContent}>
                <IndicatorIcon size={badgeIconSize} strokeWidth={2.25} />
                <span>{indicator.label}</span>
              </span>
            )}
          </Badge>
        </Tooltip>
      ) : null}

      {source === 'image' ? (
        <img
          src={normalizedImageUrl ?? undefined}
          alt={`Card ${side}`}
          loading="lazy"
          decoding="async"
          className={`${styles.media} ${styles.image}`}
          onError={() => {
            setFailedImageUrl(normalizedImageUrl);
          }}
        />
      ) : null}

      {source === 'svg' ? (
        <SvgPreview
          svgString={normalizedSvgString ?? ''}
          hideErrors
          className={`${styles.media} ${styles.svg}`}
          svgClassName="[&>svg]:block [&>svg]:h-full [&>svg]:w-full"
        />
      ) : null}

      {source === 'unavailable' ? (
        <div className={`${styles.media} ${styles.placeholder}`}>
          Preview unavailable
        </div>
      ) : null}
    </div>
  );
}
