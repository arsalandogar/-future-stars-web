import { nanoid } from 'nanoid';

import type { SvgJsonNode } from '../types';

function assignNodeIds(node: SvgJsonNode): void {
  if (node.type === 'text') return;
  node.attributes['__nodeId'] = nanoid(10);
  for (const child of node.children) {
    assignNodeIds(child);
  }
}

export function cloneWithStableIds(root: SvgJsonNode): SvgJsonNode {
  const clone = structuredClone(root);
  assignNodeIds(clone);
  return clone;
}
