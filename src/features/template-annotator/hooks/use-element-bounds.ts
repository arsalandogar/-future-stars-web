import { useEffect, useState } from 'react';

import type { TouchBounds } from '../types';
import { useAnnotatorStore } from '../stores/annotator-store';
import { getElementBBoxInSvgRoot } from '../utils/get-element-bbox';
import { querySvgElement } from '../utils/svg-overlay-helpers';

/**
 * Measures an SVG element's bounding box via requestAnimationFrame.
 * Re-measures when `svgTree` changes (after transform commits).
 * Returns null when `enabled` is false.
 */
export function useElementBounds(
  nodeId: string,
  enabled: boolean
): TouchBounds | null {
  const svgTree = useAnnotatorStore((s) => s.svgTree);
  const [bounds, setBounds] = useState<TouchBounds | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const rafId = requestAnimationFrame(() => {
      const svgEl = querySvgElement();
      if (!svgEl) return;
      const bbox = getElementBBoxInSvgRoot(svgEl, nodeId);
      if (bbox) setBounds(bbox);
    });
    return () => cancelAnimationFrame(rafId);
  }, [enabled, nodeId, svgTree]);

  return enabled ? bounds : null;
}
