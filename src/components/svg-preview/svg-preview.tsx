/* eslint-disable react-dom/no-dangerously-set-innerhtml */
import { useDeferredValue, useId } from 'react';
import { Box, Text } from '@mantine/core';
import DOMPurify from 'dompurify';
import isSvg from 'is-svg';

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function makeSvgIdsUnique(svg: string, prefix: string): string {
  const idMatches = svg.matchAll(/\bid="([^"]+)"/g);
  const ids = [...new Set([...idMatches].map((m) => m[1]))];

  return ids.reduce((result, id) => {
    const escaped = escapeRegExp(id);
    const unique = `${prefix}-${id}`;
    return result
      .replace(new RegExp(`\\bid="${escaped}"`, 'g'), `id="${unique}"`)
      .replace(new RegExp(`url\\(#${escaped}\\)`, 'g'), `url(#${unique})`)
      .replace(
        new RegExp(`xlink:href="#${escaped}"`, 'g'),
        `xlink:href="#${unique}"`
      )
      .replace(new RegExp(`href="#${escaped}"`, 'g'), `href="#${unique}"`);
  }, svg);
}

export interface SvgPreviewProps {
  /** The SVG markup string to render */
  svgString: string;
  /** Height of the preview container (ignored if className provides height) */
  height?: number | string;
  /** Additional class names for the container */
  className?: string;
  /** Class names applied to the SVG element via parent selector */
  svgClassName?: string;
  /** Message to show when svgString is empty */
  emptyMessage?: string;
  /** Message to show when svgString is invalid */
  invalidMessage?: string;
  /** Hide empty/invalid states and render nothing instead */
  hideErrors?: boolean;
}

/**
 * Safely renders SVG markup with sanitization to prevent XSS attacks.
 * Validates the SVG structure and displays appropriate messages for empty or invalid inputs.
 */
export function SvgPreview({
  svgString,
  height,
  className = '',
  svgClassName = '[&>svg]:max-h-full [&>svg]:w-auto',
  emptyMessage = 'No SVG to preview',
  invalidMessage = 'Invalid SVG markup',
  hideErrors = false,
}: SvgPreviewProps) {
  const uniqueId = useId();
  const deferredSvg = useDeferredValue(svgString);
  const isPending = svgString !== deferredSvg;
  const trimmedSvg = deferredSvg.trim();
  const heightStyle = height ? { height } : undefined;

  const isEmpty = !trimmedSvg;
  const isInvalid = !isEmpty && !isSvg(trimmedSvg);

  if (isEmpty || isInvalid) {
    if (hideErrors) return null;
    return (
      <Box
        className={`flex items-center justify-center rounded-md border border-dashed ${className}`}
        style={heightStyle}
        c={isEmpty ? 'dimmed' : 'red'}
      >
        <Text size="sm">{isEmpty ? emptyMessage : invalidMessage}</Text>
      </Box>
    );
  }

  const svgWithUniqueIds = makeSvgIdsUnique(trimmedSvg, uniqueId);
  const sanitizedSvg = DOMPurify.sanitize(svgWithUniqueIds, {
    USE_PROFILES: { svg: true, svgFilters: true },
  });

  return (
    <Box
      className={`inline-flex items-center justify-center overflow-hidden transition-opacity ${svgClassName} ${className}`}
      style={{ ...heightStyle, opacity: isPending ? 0.7 : 1 }}
      dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
    />
  );
}
