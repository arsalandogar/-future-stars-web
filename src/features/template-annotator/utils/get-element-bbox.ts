import type { TouchBounds } from '../types';
import { createOffscreenMeasureSvg } from './measure-text-bounds';
import {
  getBoundsFromPoints,
  getTransformBasis,
  getTransformedRectPoints,
} from './svg-transform-helpers';

export interface ElementGeometryInSvgRoot {
  bounds: TouchBounds;
  localBounds: TouchBounds;
  localToSvg: DOMMatrix;
  svgToLocal: DOMMatrix;
  rotation: number;
}

function isTextElement(el: SVGGraphicsElement): boolean {
  return el.tagName.toLowerCase() === 'text';
}

function measureLocalTextBounds(
  svgEl: SVGSVGElement,
  textEl: SVGGraphicsElement
): TouchBounds | null {
  const clone = textEl.cloneNode(true);
  if (!(clone instanceof SVGGraphicsElement)) return null;

  // Overlay math needs the text's own local frame, not its rendered
  // rotated bounds, so strip only the top-level transform before measuring.
  clone.removeAttribute('transform');
  clone.removeAttribute('data-node-id');

  const viewBox = svgEl.getAttribute('viewBox') ?? '0 0 500 700';
  const measureSvg = createOffscreenMeasureSvg(viewBox);
  measureSvg.appendChild(clone);
  document.body.appendChild(measureSvg);

  try {
    const bbox = clone.getBBox();
    return {
      x: bbox.x,
      y: bbox.y,
      width: bbox.width,
      height: bbox.height,
    };
  } finally {
    document.body.removeChild(measureSvg);
  }
}

/**
 * Gets an element's bounding box in SVG root coordinate space.
 * Uses getBBox() + getCTM() relative to the SVG root's own CTM
 * to correctly account for all transforms.
 */
export function getElementGeometryInSvgRoot(
  svgEl: SVGSVGElement,
  nodeId: string
): ElementGeometryInSvgRoot | null {
  const el = svgEl.querySelector<SVGGraphicsElement>(
    `[data-node-id="${nodeId}"]`
  );
  if (!el || !('getBBox' in el)) return null;

  try {
    const measuredTextBounds = isTextElement(el)
      ? measureLocalTextBounds(svgEl, el)
      : null;
    const rawLocalBounds = measuredTextBounds ?? el.getBBox();
    const elCtm = el.getCTM();
    const svgCtm = svgEl.getCTM();
    const localToSvg =
      elCtm && svgCtm ? svgCtm.inverse().multiply(elCtm) : new DOMMatrix();
    const svgToLocal = localToSvg.inverse();
    const points = getTransformedRectPoints(rawLocalBounds, localToSvg);
    const bounds = getBoundsFromPoints(points);
    const basis = getTransformBasis(localToSvg);

    return {
      bounds,
      localBounds: {
        x: rawLocalBounds.x,
        y: rawLocalBounds.y,
        width: rawLocalBounds.width,
        height: rawLocalBounds.height,
      },
      localToSvg,
      svgToLocal,
      rotation: basis.rotation,
    };
  } catch {
    return null;
  }
}

export function getElementBBoxInSvgRoot(
  svgEl: SVGSVGElement,
  nodeId: string
): TouchBounds | null {
  return getElementGeometryInSvgRoot(svgEl, nodeId)?.bounds ?? null;
}
