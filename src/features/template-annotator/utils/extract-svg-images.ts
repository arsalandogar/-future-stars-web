import type { SvgJsonNode } from '@/types/svg';

import type { DetectedImage } from '../types';
import { isImageNode } from './svg-node-helpers';

export function extractSvgImages(
  nodeMap: Map<string, SvgJsonNode>
): DetectedImage[] {
  const results: DetectedImage[] = [];

  for (const [nodeId, node] of nodeMap) {
    if (!isImageNode(node)) continue;

    const href = node.attributes.href ?? node.attributes['xlink:href'];
    if (!href) continue;

    results.push({
      nodeId,
      href,
      width: node.attributes.width,
      height: node.attributes.height,
    });
  }

  return results;
}
