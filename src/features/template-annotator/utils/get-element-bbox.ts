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
  /** Rotation from the element's own transform, excluding parent group rotation. */
  ownRotation: number;
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

  // Copy inherited font properties from the live element so the offscreen
  // measurement uses the correct metrics (font-size, font-family, etc.).
  const computed = getComputedStyle(textEl);
  const fontProps = ['font-size', 'font-family', 'font-weight', 'font-style'];
  for (const prop of fontProps) {
    const val = computed.getPropertyValue(prop);
    if (val) clone.style.setProperty(prop, val);
  }

  const viewBox = svgEl.getAttribute('viewBox') ?? '0 0 500 700';
  const measureSvg = createOffscreenMeasureSvg(viewBox);

  // Copy <style> elements from the source SVG so CSS rules (text-anchor,
  // font properties, etc.) apply to the cloned node.
  for (const styleEl of svgEl.querySelectorAll('style')) {
    measureSvg.appendChild(styleEl.cloneNode(true));
  }

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

    // Compute the element's own rotation (excluding parent group rotation).
    // svgToParent * localToSvg = parentCTM⁻¹ * svgCTM * svgCTM⁻¹ * elCTM = parentCTM⁻¹ * elCTM
    // which is just the element's own transform in parent space.
    let ownRotation = basis.rotation;
    const parentEl = el.parentElement;
    if (
      parentEl &&
      parentEl instanceof SVGGraphicsElement &&
      parentEl !== (svgEl as Node)
    ) {
      const parentCtm = parentEl.getCTM();
      if (parentCtm && svgCtm) {
        const svgToParent = parentCtm.inverse().multiply(svgCtm);
        const elemTransform = svgToParent.multiply(localToSvg);
        ownRotation = getTransformBasis(elemTransform).rotation;
      }
    }

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
      ownRotation,
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

/**
 * Returns the DOMMatrix that converts points/vectors from SVG root space
 * to the element's parent coordinate space.
 * Returns identity if the parent has no transform (non-rotated templates).
 */
export function computeSvgToParent(
  svgEl: SVGSVGElement,
  nodeId: string
): DOMMatrix {
  const el = svgEl.querySelector<SVGGraphicsElement>(
    `[data-node-id="${nodeId}"]`
  );
  if (!el) return new DOMMatrix();

  const parentEl = el.parentElement;
  if (
    !parentEl ||
    !(parentEl instanceof SVGGraphicsElement) ||
    parentEl === (svgEl as Node)
  ) {
    return new DOMMatrix();
  }

  const parentCtm = parentEl.getCTM();
  const svgCtm = svgEl.getCTM();
  if (!parentCtm || !svgCtm) return new DOMMatrix();

  // svgToParent = parentCtm^-1 * svgCtm
  return parentCtm.inverse().multiply(svgCtm);
}
