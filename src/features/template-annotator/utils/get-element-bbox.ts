import type { TouchBounds } from '../types';

/**
 * Gets an element's bounding box in SVG root coordinate space.
 * Uses getBBox() + getCTM() relative to the SVG root's own CTM
 * to correctly account for all transforms.
 */
export function getElementBBoxInSvgRoot(
  svgEl: SVGSVGElement,
  nodeId: string
): TouchBounds | null {
  const el = svgEl.querySelector<SVGGraphicsElement>(
    `[data-node-id="${nodeId}"]`
  );
  if (!el || !('getBBox' in el)) return null;

  try {
    const bbox = el.getBBox();
    const elCtm = el.getCTM();
    const svgCtm = svgEl.getCTM();
    if (!elCtm || !svgCtm)
      return { x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height };

    // getCTM() is screen-relative; multiply by inverse of SVG root's CTM
    // to get coordinates in viewBox space
    const localCtm = svgCtm.inverse().multiply(elCtm);

    const pt = svgEl.createSVGPoint();

    pt.x = bbox.x;
    pt.y = bbox.y;
    const topLeft = pt.matrixTransform(localCtm);

    pt.x = bbox.x + bbox.width;
    pt.y = bbox.y + bbox.height;
    const bottomRight = pt.matrixTransform(localCtm);

    return {
      x: Math.min(topLeft.x, bottomRight.x),
      y: Math.min(topLeft.y, bottomRight.y),
      width: Math.abs(bottomRight.x - topLeft.x),
      height: Math.abs(bottomRight.y - topLeft.y),
    };
  } catch {
    return null;
  }
}
