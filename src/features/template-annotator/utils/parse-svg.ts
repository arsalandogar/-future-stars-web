import { parseSync } from 'svgson';

import type { SvgJsonNode } from '@/types/svg';

export function parseSvgString(svgString: string): SvgJsonNode {
  return parseSync(svgString);
}
