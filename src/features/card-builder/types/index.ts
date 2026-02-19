export type BuilderTab = 'content' | 'colors' | 'photo' | 'templates';

/** svgson INode - parsed SVG JSON tree node */
export interface SvgJsonNode {
  name: string;
  type: string;
  value: string;
  attributes: Record<string, string>;
  children: SvgJsonNode[];
}
