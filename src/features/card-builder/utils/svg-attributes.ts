import type { CSSProperties } from 'react';

const ATTR_MAP: Record<string, string> = {
  'accept-charset': 'acceptCharset',
  accesskey: 'accessKey',
  'alignment-baseline': 'alignmentBaseline',
  'baseline-shift': 'baselineShift',
  class: 'className',
  'clip-path': 'clipPath',
  'clip-rule': 'clipRule',
  'color-interpolation': 'colorInterpolation',
  'color-interpolation-filters': 'colorInterpolationFilters',
  'dominant-baseline': 'dominantBaseline',
  'fill-opacity': 'fillOpacity',
  'fill-rule': 'fillRule',
  'flood-color': 'floodColor',
  'flood-opacity': 'floodOpacity',
  'font-family': 'fontFamily',
  'font-size': 'fontSize',
  'font-style': 'fontStyle',
  'font-weight': 'fontWeight',
  'image-rendering': 'imageRendering',
  'letter-spacing': 'letterSpacing',
  'lighting-color': 'lightingColor',
  'marker-end': 'markerEnd',
  'marker-mid': 'markerMid',
  'marker-start': 'markerStart',
  'paint-order': 'paintOrder',
  'pointer-events': 'pointerEvents',
  'shape-rendering': 'shapeRendering',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-miterlimit': 'strokeMiterlimit',
  'stroke-opacity': 'strokeOpacity',
  'stroke-width': 'strokeWidth',
  'text-anchor': 'textAnchor',
  'text-decoration': 'textDecoration',
  'text-rendering': 'textRendering',
  'transform-origin': 'transformOrigin',
  'word-spacing': 'wordSpacing',
  'writing-mode': 'writingMode',
  'xlink:href': 'xlinkHref',
  'xlink:title': 'xlinkTitle',
  'xml:lang': 'xmlLang',
  'xml:space': 'xmlSpace',
  'xmlns:xlink': 'xmlnsXlink',
};

function toReactAttributeName(attr: string): string {
  if (ATTR_MAP[attr]) return ATTR_MAP[attr];
  if (attr.startsWith('data-') || attr.startsWith('aria-')) return attr;
  return attr;
}

const KEBAB_REGEX = /-([a-z])/g;

function parseStyleString(str: string): CSSProperties {
  const style: Record<string, string> = {};
  for (const declaration of str.split(';')) {
    const trimmed = declaration.trim();
    if (!trimmed) continue;
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;
    const prop = trimmed.slice(0, colonIndex).trim();
    const value = trimmed.slice(colonIndex + 1).trim();
    const camelProp = prop.replace(KEBAB_REGEX, (_, c: string) =>
      c.toUpperCase()
    );
    style[camelProp] = value;
  }
  return style as CSSProperties;
}

export function toReactAttributes(
  attributes: Record<string, string>
): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(attributes)) {
    if (key === 'style') {
      props.style = parseStyleString(value);
    } else {
      props[toReactAttributeName(key)] = value;
    }
  }
  return props;
}
