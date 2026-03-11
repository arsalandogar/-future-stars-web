import { cloneWithStableIds } from '@fs-card-engine';

import type { SvgJsonNode } from '@/types/svg';

import { useAnnotatorStore } from '../stores/annotator-store';
import { extractAssignments } from './extract-assignments';
import { sanitizeSvgFontFamilies } from './sanitize-svg-font-families';
import { stripAnnotationAttrs } from './export-annotated-svg';
import { buildNodeIndex } from './svg-node-helpers';

/**
 * Loads an SvgJsonNode (from the API) into the annotator store,
 * extracting any existing data-* field assignments.
 */
export function loadSvgJson(svgJson: SvgJsonNode): void {
  const tree = sanitizeSvgFontFamilies(cloneWithStableIds(svgJson));
  const { nodeIndex, nodeMap } = buildNodeIndex(tree);
  const assignments = extractAssignments(nodeMap);
  stripAnnotationAttrs(tree);
  useAnnotatorStore
    .getState()
    .loadSvg({ tree, nodeIndex, nodeMap, assignments });
}
