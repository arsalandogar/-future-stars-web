import type { SvgJsonNode } from '@/types/svg';
import { parseStyleString } from '@/utils/svg-attributes';

import {
  EDITABLE_FIELDS,
  type EditableFieldId,
  type EditableFieldType,
} from '@/features/templates';

import type { NodeMeta } from '../types';

/** CSS class applied to the SVG wrapper in the annotator canvas, used for DOM queries. */
export const ANNOTATOR_SVG_WRAPPER_CLASS = 'annotator-svg-wrapper';

/** Field types that support touch bounds configuration. */
export function supportsTouchBounds(type: EditableFieldType): boolean {
  return type === 'text' || type === 'image';
}

const TEXT_TAGS = new Set(['text', 'tspan']);
const NON_INTERACTIVE_TAGS = new Set([
  'defs',
  'clipPath',
  'clippath',
  'mask',
  'linearGradient',
  'lineargradient',
  'radialGradient',
  'radialgradient',
  'pattern',
  'filter',
  'feGaussianBlur',
  'fegaussianblur',
  'feOffset',
  'feoffset',
  'feMerge',
  'femerge',
  'feMergeNode',
  'femergenode',
  'feBlend',
  'feblend',
  'feColorMatrix',
  'fecolormatrix',
  'feComposite',
  'fecomposite',
  'feFlood',
  'feflood',
  'symbol',
  'metadata',
]);

export function isTextNode(node: SvgJsonNode): boolean {
  return TEXT_TAGS.has(node.name);
}

export function isImageNode(node: SvgJsonNode): boolean {
  return node.name === 'image';
}

export function isNonInteractive(node: SvgJsonNode): boolean {
  return NON_INTERACTIVE_TAGS.has(node.name);
}

export function getStyleProp(
  node: SvgJsonNode,
  prop: string
): string | undefined {
  if (node.attributes.style) {
    const parsed = parseStyleString(node.attributes.style);
    const value = (parsed as Record<string, string>)[prop];
    if (value) return value;
  }
  return undefined;
}

export function hasFillAttribute(node: SvgJsonNode): boolean {
  const fill = node.attributes.fill ?? getStyleProp(node, 'fill');
  return fill != null && fill !== 'none';
}

export function hasStrokeAttribute(node: SvgJsonNode): boolean {
  const stroke = node.attributes.stroke ?? getStyleProp(node, 'stroke');
  return stroke != null && stroke !== 'none';
}

export function hasStopColorAttribute(node: SvgJsonNode): boolean {
  return node.name === 'stop';
}

function formatId(id: string): string {
  return id.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export function getNodeLabel(node: SvgJsonNode): string {
  const tag = node.name;
  const id = node.attributes.id;

  if (isTextNode(node)) {
    const textContent = collectTextContent(node).trim();
    const preview =
      textContent.length > 24 ? textContent.slice(0, 24) + '...' : textContent;
    if (id) return `<${tag}> ${formatId(id)} "${preview}"`;
    return preview ? `<${tag}> "${preview}"` : tag;
  }

  if (isImageNode(node)) {
    if (id) return `<image> ${formatId(id)}`;
    return '<image>';
  }

  if (node.name === 'stop') {
    const offset = node.attributes.offset ?? '0';
    const color =
      node.attributes['stop-color'] ??
      getStyleProp(node, 'stopColor') ??
      '#000';
    return `<stop> @ ${offset} ${color}`;
  }

  if (id) return `<${tag}> ${formatId(id)}`;
  const className = node.attributes.class;
  if (className) return `<${tag}> ${formatId(className.split(' ')[0])}`;
  return `<${tag}>`;
}

export function collectTextContent(node: SvgJsonNode): string {
  if (node.type === 'text') return node.value;
  return node.children.map(collectTextContent).join('');
}

export function isFieldCompatible(
  fieldId: EditableFieldId,
  nodeMeta: NodeMeta
): boolean {
  const fieldType = EDITABLE_FIELDS[fieldId].type;

  switch (fieldType) {
    case 'text':
      return nodeMeta.isTextElement;
    case 'image':
      return nodeMeta.isImageElement;
    case 'color':
      return nodeMeta.hasFill || nodeMeta.hasStroke || nodeMeta.hasStopColor;
    default:
      return false;
  }
}

export function buildNodeIndex(root: SvgJsonNode): {
  nodeIndex: Map<string, NodeMeta>;
  nodeMap: Map<string, SvgJsonNode>;
} {
  const nodeIndex = new Map<string, NodeMeta>();
  const nodeMap = new Map<string, SvgJsonNode>();

  function walk(node: SvgJsonNode, parentNodeId: string | null, depth: number) {
    if (node.type === 'text') return;

    const nodeId = node.attributes['__nodeId'];
    if (!nodeId) return;

    const meta: NodeMeta = {
      nodeId,
      tagName: node.name,
      label: getNodeLabel(node),
      hasFill: hasFillAttribute(node),
      hasStroke: hasStrokeAttribute(node),
      hasStopColor: hasStopColorAttribute(node),
      isTextElement: isTextNode(node),
      isImageElement: isImageNode(node),
      parentNodeId,
      depth,
    };

    nodeIndex.set(nodeId, meta);
    nodeMap.set(nodeId, node);

    for (const child of node.children) {
      walk(child, nodeId, depth + 1);
    }
  }

  walk(root, null, 0);
  return { nodeIndex, nodeMap };
}
