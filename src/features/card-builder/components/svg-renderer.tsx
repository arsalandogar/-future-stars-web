import { createElement, type ReactNode } from 'react';

import type { SvgJsonNode } from '../types';
import { toReactAttributes } from '../utils/svg-attributes';

interface SvgRendererProps {
  node: SvgJsonNode;
  className?: string;
}

function renderNode(node: SvgJsonNode, index: number): ReactNode {
  if (node.type === 'text') return node.value;

  const children = node.children.map((child, i) => renderNode(child, i));
  const key = node.attributes.id ?? `${node.name}-${index}`;

  return createElement(
    node.name,
    { ...toReactAttributes(node.attributes), key },
    ...children
  );
}

export function SvgRenderer({ node, className }: SvgRendererProps) {
  const children = node.children.map((child, i) => renderNode(child, i));

  const props = {
    ...toReactAttributes(node.attributes),
    width: '100%',
    height: '100%',
    preserveAspectRatio:
      node.attributes['preserveAspectRatio'] || 'xMidYMid meet',
    className,
  };

  return createElement(node.name, props, ...children);
}
