import type { SvgJsonNode } from '@/types/svg';

export interface TextBounds {
  width: number;
  height: number;
}

export function measureTextBounds(
  textNode: SvgJsonNode,
  svgTree: SvgJsonNode
): TextBounds | null {
  try {
    const viewBox = svgTree.attributes.viewBox ?? '0 0 500 700';

    const svgNs = 'http://www.w3.org/2000/svg';
    const svgEl = document.createElementNS(svgNs, 'svg');
    svgEl.setAttribute('viewBox', viewBox);
    svgEl.style.position = 'absolute';
    svgEl.style.left = '-9999px';
    svgEl.style.top = '-9999px';
    svgEl.style.width = '0';
    svgEl.style.height = '0';
    svgEl.style.overflow = 'hidden';

    const textEl = createSvgElement(textNode, svgNs);
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
