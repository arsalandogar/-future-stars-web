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
import type { CardPreviewStatus } from '@/types';

import styles from './card-side-preview.module.css';

type PreviewSource = 'image' | 'svg' | 'unavailable';

interface PreviewIndicator {
  color: MantineColor;
  label: string;
  icon: LucideIcon;
}

export interface CardSidePreviewProps {
  imageUrl?: string | null;
  svgString?: string | null;
  status: CardPreviewStatus;
  alt: string;
  className?: string;
  style?: CSSProperties;
  fit?: 'cover' | 'contain';
  loading?: 'eager' | 'lazy';
  decoding?: 'async' | 'auto' | 'sync';
  badgeSize?: MantineSize;
  hideBadge?: boolean;
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
  imageUrl,
  svgString,
  status,
  alt,
  className,
  style,
  fit = 'cover',
  loading = 'lazy',
  decoding = 'async',
  badgeSize = 'xs',
  hideBadge = false,
}: CardSidePreviewProps) {
  const normalizedImageUrl = imageUrl?.trim() || null;
  const normalizedSvgString = svgString?.trim() || null;
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const imageFailed =
    normalizedImageUrl != null && failedImageUrl === normalizedImageUrl;

  const source = getPreviewSource(
    normalizedImageUrl,
    normalizedSvgString,
    imageFailed
  );
  const indicator = getIndicator(status, source);
  const iconOnly = badgeSize === 'xs';
  const badgeIconSize = iconOnly ? 12 : 14;
  const IndicatorIcon = indicator?.icon;

  return (
    <div
      className={`${styles.root}${className ? ` ${className}` : ''}`}
      data-fit={fit}
      style={style}
    >
      {!hideBadge && indicator && IndicatorIcon ? (
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
          alt={alt}
          loading={loading}
          decoding={decoding}
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
