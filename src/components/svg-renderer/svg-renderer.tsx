import { createElement, type ReactNode } from 'react';

import type { SvgJsonNode } from '@/types/svg';
import { toReactAttributes } from '@/utils/svg-attributes';

export interface SvgRenderOptions {
  getRootProps?: (node: SvgJsonNode) => Record<string, unknown> | undefined;
  getNodeProps?: (node: SvgJsonNode) => Record<string, unknown> | undefined;
}

interface SvgRendererProps {
  node: SvgJsonNode;
  /** Changing this value forces a re-render of the mutated SVG tree. */
  revision?: number;
  className?: string;
  options?: SvgRenderOptions;
}

function mergeProps(
  baseProps: Record<string, unknown>,
  extraProps?: Record<string, unknown>
): Record<string, unknown> {
  if (!extraProps) return baseProps;

  const mergedProps = { ...baseProps, ...extraProps };
  if (baseProps.style || extraProps.style) {
    mergedProps.style = {
      ...(baseProps.style as object),
      ...(extraProps.style as object),
    };
  }

  return mergedProps;
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

  const baseProps = toReactAttributes(node.attributes);
  const extraProps = options?.getNodeProps?.(node);
  const finalProps = { ...mergeProps(baseProps, extraProps), key };

  return createElement(node.name, finalProps, ...children);
}

export function SvgRenderer({
  node,
  revision = 0,
  className,
  options,
}: SvgRendererProps) {
  // revision is read here so React re-renders when the SVG tree is mutated
  void revision;

  const children = node.children.map((child, i) =>
    renderNode(child, i, options)
  );
  const baseRootProps = toReactAttributes(node.attributes);
  const extraRootProps = options?.getRootProps?.(node);
  const mergedRootProps = mergeProps(baseRootProps, extraRootProps);

  const props = {
    ...mergedRootProps,
    width: '100%',
    height: '100%',
    preserveAspectRatio:
      node.attributes['preserveAspectRatio'] || 'xMidYMid meet',
    className,
  };

  return createElement(node.name, props, ...children);
}
