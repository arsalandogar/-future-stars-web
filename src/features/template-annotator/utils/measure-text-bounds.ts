import type { SvgJsonNode } from '@/types/svg';

export interface TextBounds {
  width: number;
  height: number;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Creates an offscreen SVG element for measuring text bounds.
 * Caller must call `document.body.removeChild(svg)` when done.
 */
export function createOffscreenMeasureSvg(viewBox: string): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', viewBox);
  svg.style.position = 'absolute';
  svg.style.left = '-9999px';
  svg.style.top = '-9999px';
  svg.style.width = '0';
  svg.style.height = '0';
  svg.style.overflow = 'hidden';
  return svg;
}

export function measureTextBounds(
  textNode: SvgJsonNode,
  svgTree: SvgJsonNode
): TextBounds | null {
  try {
    const viewBox = svgTree.attributes.viewBox ?? '0 0 500 700';
    const svgEl = createOffscreenMeasureSvg(viewBox);

    const textEl = createSvgElement(textNode, SVG_NS);
    if (textEl instanceof SVGElement) {
      // `data-max-width` is stored in the text node's own coordinate space.
      // Strip the top-level transform so rotated/translated text measures in
      // local text space instead of its rendered axis-aligned bounds.
      textEl.removeAttribute('transform');
    }
    svgEl.appendChild(textEl);
    document.body.appendChild(svgEl);

    const bbox = (textEl as SVGGraphicsElement).getBBox();
    const width = Math.round(bbox.width);
    const height = Math.round(bbox.height);

    document.body.removeChild(svgEl);
    return width > 0 && height > 0 ? { width, height } : null;
  } catch {
    return null;
  }
}

function createSvgElement(node: SvgJsonNode, svgNs: string): Element {
  if (node.type === 'text') {
    return document.createTextNode(node.value) as unknown as Element;
  }

  const el = document.createElementNS(svgNs, node.name);

  for (const [key, value] of Object.entries(node.attributes)) {
    if (key.startsWith('__')) continue;
    try {
      el.setAttribute(key, value);
    } catch {
      // Skip invalid attributes
    }
  }

  for (const child of node.children) {
    if (child.type === 'text') {
      el.appendChild(document.createTextNode(child.value));
    } else {
      el.appendChild(createSvgElement(child, svgNs));
    }
  }

  return el;
}
