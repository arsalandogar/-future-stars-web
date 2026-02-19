import { createElement, type ReactNode } from 'react';

import type { SvgJsonNode } from '../types';
import { toReactAttributes } from '../utils/svg-attributes';

export interface SvgRenderOptions {
  getNodeProps?: (node: SvgJsonNode) => Record<string, unknown> | undefined;
}

interface SvgRendererProps {
  node: SvgJsonNode;
  className?: string;
  options?: SvgRenderOptions;
}

function renderNode(
  node: SvgJsonNode,
  index: number,
  options?: SvgRenderOptions
): ReactNode {
  if (node.type === 'text') return node.value;

  const children = node.children.map((child, i) =>
    renderNode(child, i, options)
  );
  const key =
    node.attributes['__nodeId'] ??
    node.attributes.id ??
    `${node.name}-${index}`;

  const extraProps = options?.getNodeProps?.(node);

  return createElement(
    node.name,
    { ...toReactAttributes(node.attributes), ...extraProps, key },
    ...children
  );
}

export function SvgRenderer({ node, className, options }: SvgRendererProps) {
  const children = node.children.map((child, i) =>
    renderNode(child, i, options)
  );

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
