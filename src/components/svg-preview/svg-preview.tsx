/* eslint-disable react-dom/no-dangerously-set-innerhtml */
import { Box, Text } from '@mantine/core';
import DOMPurify from 'dompurify';
import isSvg from 'is-svg';

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
  className,
  svgClassName = '[&>svg]:max-h-full [&>svg]:w-auto',
  emptyMessage = 'No SVG to preview',
  invalidMessage = 'Invalid SVG markup',
  hideErrors = false,
}: SvgPreviewProps) {
  const trimmedSvg = svgString.trim();
  const heightStyle = height ? { height } : undefined;

  if (!trimmedSvg) {
    if (hideErrors) return null;
    return (
      <Box
        className={`flex items-center justify-center rounded-md border border-dashed ${className ?? ''}`}
        style={heightStyle}
        c="dimmed"
      >
        <Text size="sm">{emptyMessage}</Text>
      </Box>
    );
  }

  if (!isSvg(trimmedSvg)) {
    if (hideErrors) return null;
    return (
      <Box
        className={`flex items-center justify-center rounded-md border border-dashed ${className ?? ''}`}
        style={heightStyle}
        c="red"
      >
        <Text size="sm">{invalidMessage}</Text>
      </Box>
    );
  }

  // Sanitize the SVG to prevent XSS attacks
  const sanitizedSvg = DOMPurify.sanitize(trimmedSvg, {
    USE_PROFILES: { svg: true, svgFilters: true },
  });

  return (
    <Box
      className={`inline-flex items-center justify-center overflow-hidden ${svgClassName} ${className ?? ''}`}
      style={heightStyle}
      dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
    />
  );
}
