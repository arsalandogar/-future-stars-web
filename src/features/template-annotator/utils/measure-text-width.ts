import type { SvgJsonNode } from '@/types/svg';

export function measureTextWidth(
  textNode: SvgJsonNode,
  svgTree: SvgJsonNode
): number | null {
  // If the element has a textLength attribute, use that directly
  if (textNode.attributes.textLength) {
    const parsed = parseFloat(textNode.attributes.textLength);
    if (!isNaN(parsed)) return Math.round(parsed);
  }

  try {
    const viewBox = svgTree.attributes.viewBox ?? '0 0 500 700';

    // Create a hidden off-screen SVG
    const svgNs = 'http://www.w3.org/2000/svg';
    const svgEl = document.createElementNS(svgNs, 'svg');
    svgEl.setAttribute('viewBox', viewBox);
    svgEl.style.position = 'absolute';
    svgEl.style.left = '-9999px';
    svgEl.style.top = '-9999px';
    svgEl.style.width = '0';
    svgEl.style.height = '0';
    svgEl.style.overflow = 'hidden';

    // Clone the text element into the hidden SVG
    const textEl = createSvgElement(textNode, svgNs);
    svgEl.appendChild(textEl);
    document.body.appendChild(svgEl);

    const bbox = (textEl as SVGGraphicsElement).getBBox();
    const width = Math.round(bbox.width);

    document.body.removeChild(svgEl);
    return width > 0 ? width : null;
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
    if (key === '__nodeId') continue;
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
