import { AlignCenter, AlignLeft, AlignRight } from 'lucide-react';

import type { TextAlign } from '../types';
import { TEXT_ANCHOR_TO_ALIGN } from '../types';
import { getComputedTextAnchor } from './svg-overlay-helpers';

export const ALIGN_OPTIONS = [
  { value: 'left', label: <AlignLeft size={14} /> },
  { value: 'center', label: <AlignCenter size={14} /> },
  { value: 'right', label: <AlignRight size={14} /> },
];

export function getCurrentAlign(
  assignment: { textAlign?: TextAlign } | undefined,
  nodeId: string
): TextAlign {
  if (assignment?.textAlign) return assignment.textAlign;
  const anchor = getComputedTextAnchor(nodeId);
  if (anchor && anchor in TEXT_ANCHOR_TO_ALIGN) {
    return TEXT_ANCHOR_TO_ALIGN[anchor as keyof typeof TEXT_ANCHOR_TO_ALIGN];
  }
  return 'left';
}
