import { useLayoutEffect, useState } from 'react';

import type { TouchBounds } from '../types';
import { useAnnotatorStore } from '../stores/annotator-store';
import {
  getElementBBoxInSvgRoot,
  getElementGeometryInSvgRoot,
  type ElementGeometryInSvgRoot,
} from '../utils/get-element-bbox';
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

export function useElementGeometry(
  nodeId: string,
  enabled: boolean
): ElementGeometryInSvgRoot | null {
  const svgTree = useAnnotatorStore((s) => s.svgTree);
  const [geometry, setGeometry] = useState<ElementGeometryInSvgRoot | null>(
    null
  );

  useLayoutEffect(() => {
    if (!enabled) return;
    const svgEl = querySvgElement();
    if (!svgEl) return;
    const nextGeometry = getElementGeometryInSvgRoot(svgEl, nodeId);
    if (!nextGeometry) return;
    // DOM measurement in useLayoutEffect requires setState to trigger re-render with correct geometry
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGeometry(nextGeometry);
  }, [enabled, nodeId, svgTree]);

  return enabled ? geometry : null;
}
