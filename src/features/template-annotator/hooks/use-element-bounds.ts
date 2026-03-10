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
  const [bounds, setBounds] = useState<{
    nodeId: string;
    value: TouchBounds | null;
  } | null>(null);

  useLayoutEffect(() => {
    if (!enabled) return;
    const svgEl = querySvgElement();
    const bbox = svgEl ? getElementBBoxInSvgRoot(svgEl, nodeId) : null;
    // DOM measurement in useLayoutEffect requires setState to trigger re-render with correct bounds
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBounds((prev) => {
      if (
        prev?.nodeId === nodeId &&
        prev.value?.x === bbox?.x &&
        prev.value?.y === bbox?.y &&
        prev.value?.width === bbox?.width &&
        prev.value?.height === bbox?.height
      )
        return prev;
      return { nodeId, value: bbox };
    });
  }, [enabled, nodeId, svgTree]);

  return enabled && bounds?.nodeId === nodeId ? bounds.value : null;
}

export function useElementGeometry(
  nodeId: string,
  enabled: boolean
): ElementGeometryInSvgRoot | null {
  const svgTree = useAnnotatorStore((s) => s.svgTree);
  const [geometry, setGeometry] = useState<{
    nodeId: string;
    value: ElementGeometryInSvgRoot | null;
  } | null>(null);

  useLayoutEffect(() => {
    if (!enabled) return;
    const svgEl = querySvgElement();
    const next = svgEl ? getElementGeometryInSvgRoot(svgEl, nodeId) : null;
    // DOM measurement in useLayoutEffect requires setState to trigger re-render with correct geometry
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGeometry((prev) => {
      const pb = prev?.value?.bounds;
      const nb = next?.bounds;
      if (
        prev?.nodeId === nodeId &&
        pb?.x === nb?.x &&
        pb?.y === nb?.y &&
        pb?.width === nb?.width &&
        pb?.height === nb?.height &&
        prev.value?.rotation === next?.rotation
      )
        return prev;
      return { nodeId, value: next };
    });
  }, [enabled, nodeId, svgTree]);

  return enabled && geometry?.nodeId === nodeId ? geometry.value : null;
}
