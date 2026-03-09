import { useLayoutEffect, useState } from 'react';

import type { TouchBounds } from '../types';
import { useAnnotatorStore } from '../stores/annotator-store';
import { getElementBBoxInSvgRoot } from '../utils/get-element-bbox';
import { querySvgElement } from '../utils/svg-overlay-helpers';

/**
 * Measures an SVG element's bounding box synchronously after DOM updates.
 * Re-measures when `svgTree` changes (after transform commits).
 * Returns null when `enabled` is false.
 */
export function useElementBounds(
  nodeId: string,
  enabled: boolean
): TouchBounds | null {
  const svgTree = useAnnotatorStore((s) => s.svgTree);
  const [bounds, setBounds] = useState<TouchBounds | null>(null);

  useLayoutEffect(() => {
    if (!enabled) return;
    const svgEl = querySvgElement();
    if (!svgEl) return;
    const bbox = getElementBBoxInSvgRoot(svgEl, nodeId);
    if (!bbox) return;
    // DOM measurement in useLayoutEffect requires setState to trigger re-render with correct bounds
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBounds(bbox);
  }, [enabled, nodeId, svgTree]);

  return enabled ? bounds : null;
}
