import { parse, parseSync, stringify } from 'svgson';

import type { SvgJsonNode } from './types.ts';

export function parseSvgSync(svgString: string): SvgJsonNode {
  return parseSync(svgString);
}

export async function parseSvg(svgString: string): Promise<SvgJsonNode> {
  return parse(svgString);
}

export function stringifySvg(node: SvgJsonNode): string {
  return stringify(node);
}
