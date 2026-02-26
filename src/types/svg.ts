/**
 * svgson INode - parsed SVG JSON tree node.
 * After cloning with `cloneWithStableIds`, each element node's `attributes`
 * includes a `__nodeId` string used as a stable React key.
 */
export interface SvgJsonNode {
  name: string;
  type: string;
  value: string;
  attributes: Record<string, string>;
  children: SvgJsonNode[];
}
