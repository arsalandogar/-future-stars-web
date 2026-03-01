import type { SvgJsonNode } from '@/types/svg';

import type { DetectedText } from '../types';
import { collectTextContent, isTextNode } from './svg-node-helpers';

export function extractSvgTexts(
  nodeMap: Map<string, SvgJsonNode>
): DetectedText[] {
  // Collect IDs of tspan nodes whose parent text node is also in nodeMap
  const childTspanIds = new Set<string>();

  for (const [, node] of nodeMap) {
    if (node.name !== 'text') continue;
    for (const child of node.children) {
      if (child.type === 'text') continue;
      const childId = child.attributes['__nodeId'];
      if (childId && nodeMap.has(childId) && isTextNode(child)) {
        childTspanIds.add(childId);
      }
    }
  }

  const results: DetectedText[] = [];

  for (const [nodeId, node] of nodeMap) {
    if (!isTextNode(node)) continue;
    if (childTspanIds.has(nodeId)) continue;

    const textContent = collectTextContent(node).trim();
    if (!textContent) continue;

    results.push({ nodeId, textContent, tagName: node.name });
  }

  return results;
}
