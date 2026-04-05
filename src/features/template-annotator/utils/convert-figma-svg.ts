/**
 * Converts Figma-exported SVGs to production-ready format for the Future Stars dynamic card designer.
 *
 * Runs in the browser using DOMParser/XMLSerializer — no Node.js dependencies.
 *
 * Usage:
 *   import { convertFigmaSvg } from './convertFigmaSvg'
 *   const { svg, images } = convertFigmaSvg(rawSvgString)
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SVG_NS = 'http://www.w3.org/2000/svg';
const XLINK_NS = 'http://www.w3.org/1999/xlink';

const CDN_BASE = 'https://dxwkpzrbiz065.cloudfront.net/assets';
const PLACEHOLDER_IMAGE = `${CDN_BASE}/final-placeholder.jpg`;
const PLACEHOLDER_LOGO = `${CDN_BASE}/cards/logo-one.png`;

const FONT_WEIGHT_MAP: Record<string, string> = {
  '100': 'Thin',
  '200': 'ExtraLight',
  '300': 'Light',
  '400': 'Regular',
  '500': 'Medium',
  '600': 'SemiBold',
  '700': 'Bold',
  '800': 'ExtraBold',
  '900': 'Black',
  bold: 'Bold',
  normal: 'Regular',
};

const POSITION_WORDS = new Set([
  'quarterback',
  'qb',
  'running back',
  'rb',
  'wide receiver',
  'wr',
  'tight end',
  'te',
  'offensive line',
  'ol',
  'defensive line',
  'dl',
  'linebacker',
  'lb',
  'cornerback',
  'cb',
  'safety',
  'kicker',
  'punter',
  'midfielder',
  'forward',
  'striker',
  'goalkeeper',
  'keeper',
  'defender',
  'winger',
  'center back',
  'left back',
  'right back',
  'point guard',
  'pg',
  'shooting guard',
  'sg',
  'small forward',
  'sf',
  'power forward',
  'pf',
  'center',
  'pitcher',
  'catcher',
  'first base',
  'shortstop',
  'outfielder',
  'infielder',
  'goalie',
  'attacker',
  'midfield',
  'left wing',
  'right wing',
  'fullback',
  'halfback',
  'wing',
  'prop',
  'hooker',
  'lock',
  'flanker',
  'scrum half',
  'fly half',
]);

const TEXT_FIELD_MAP: Record<string, string> = {
  lastName: 'lastName',
  firstName: 'firstName',
  playerName: 'playerName',
  position: 'position',
  teamName: 'team',
  playerNumber: 'playerNumber',
};

const LOGO_SIZE_THRESHOLD = 200;
const CARD_RIGHT_EDGE = 787.5;
const CARD_BOTTOM_Y = 950;
const CHAR_WIDTH_RATIO = 0.55;
const TOUCH_HEIGHT_RATIO = 1.4;
const MAX_TEXT_WIDTH = 750;
const MIN_FIRSTNAME_FONT_SIZE = 30;
const DEFAULT_FONT_SIZE = 16;
const COVER_OVERFLOW = 1.2;
const MIN_OVERLAP_RATIO = 0.5;

const CLIP_SKIP_ATTRS = new Set([
  'fill',
  'style',
  'id',
  'mask',
  'fill-opacity',
]);
const GEOMETRY_ATTRS = new Set([
  'x',
  'y',
  'width',
  'height',
  'rx',
  'ry',
  'd',
  'cx',
  'cy',
  'r',
  'points',
  'transform',
  'mask',
]);
const SHAPE_TAGS = new Set([
  'rect',
  'path',
  'circle',
  'ellipse',
  'polygon',
  'polyline',
]);
const FILL_SKIP_TAGS = new Set([
  'svg',
  'defs',
  'clipPath',
  'mask',
  'pattern',
  'filter',
  'image',
  'use',
  'stop',
  'feFlood',
  'feColorMatrix',
  'feOffset',
  'feGaussianBlur',
  'feComposite',
  'feBlend',
]);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ExtractedImage {
  id: string;
  dataUrl: string;
  width: number;
  height: number;
  ext: string;
}

export interface ConversionResult {
  svg: string;
  images: ExtractedImage[];
}

interface Matrix {
  scaleX: number;
  scaleY: number;
  translateX: number;
  translateY: number;
}

interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TextItem {
  elem: Element;
  content: string;
  trimmed: string;
  wordCount: number;
  isAllCaps: boolean;
  fontSize: number;
  x: number;
  y: number;
  role: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function R(v: number, n = 2): number {
  return Math.round(v * 10 ** n) / 10 ** n;
}

function parseMatrix(s: string): Matrix {
  const m = s.match(
    /matrix\(\s*([^,\s]+)\s*[,\s]\s*([^,\s]+)\s*[,\s]\s*([^,\s]+)\s*[,\s]\s*([^,\s]+)\s*[,\s]\s*([^,\s]+)\s*[,\s]\s*([^,\s]+)\s*\)/
  );
  if (m) {
    const [a, b, c, d, e, f] = m.slice(1).map(Number);
    let sx = Math.sqrt(a * a + b * b);
    let sy = Math.sqrt(c * c + d * d);
    if (a < 0) sx = -sx;
    if (d < 0) sy = -sy;
    return { scaleX: sx, scaleY: sy, translateX: e, translateY: f };
  }

  const result: Matrix = { scaleX: 1, scaleY: 1, translateX: 0, translateY: 0 };

  const t = s.match(/translate\(\s*([^,\s]+)\s*[,\s]\s*([^,\s]+)\s*\)/);
  if (t) {
    result.translateX = Number(t[1]);
    result.translateY = Number(t[2]);
  }

  const sc = s.match(/scale\(\s*([^,\s)]+)(?:\s*[,\s]\s*([^,\s)]+))?\s*\)/);
  if (sc) {
    result.scaleX = Number(sc[1]);
    result.scaleY = sc[2] ? Number(sc[2]) : result.scaleX;
  }

  return result;
}

function getPathBBox(d: string): BBox | null {
  const coords: [number, number][] = [];
  const tokens = [
    ...d.matchAll(/([MmLlHhVvCcSsQqTtAaZz])|(-?[0-9]*\.?[0-9]+)/g),
  ];
  let x = 0,
    y = 0,
    cmd = 'M';
  let i = 0;

  while (i < tokens.length) {
    if (tokens[i][1]) {
      cmd = tokens[i][1];
      i++;
      continue;
    }
    const n = Number(tokens[i][2]);

    if (cmd === 'M' || cmd === 'L') {
      x = n;
      i++;
      if (i < tokens.length && tokens[i][2]) {
        y = Number(tokens[i][2]);
        i++;
      }
      coords.push([x, y]);
    } else if (cmd === 'm' || cmd === 'l') {
      x += n;
      i++;
      if (i < tokens.length && tokens[i][2]) {
        y += Number(tokens[i][2]);
        i++;
      }
      coords.push([x, y]);
    } else if (cmd === 'H') {
      x = n;
      coords.push([x, y]);
      i++;
    } else if (cmd === 'h') {
      x += n;
      coords.push([x, y]);
      i++;
    } else if (cmd === 'V') {
      y = n;
      coords.push([x, y]);
      i++;
    } else if (cmd === 'v') {
      y += n;
      coords.push([x, y]);
      i++;
    } else if (cmd === 'C' || cmd === 'c') {
      const pts = [n];
      for (let j = 0; j < 5; j++) {
        i++;
        if (i < tokens.length && tokens[i][2]) {
          pts.push(Number(tokens[i][2]));
        }
      }
      const rel = cmd === 'c';
      for (let j = 0; j < pts.length - 1; j += 2) {
        coords.push([
          rel ? x + pts[j] : pts[j],
          rel ? y + pts[j + 1] : pts[j + 1],
        ]);
      }
      if (pts.length >= 6) {
        x = rel ? x + pts[pts.length - 2] : pts[pts.length - 2];
        y = rel ? y + pts[pts.length - 1] : pts[pts.length - 1];
      }
      i++;
    } else if (cmd === 'Z' || cmd === 'z') {
      i++;
    } else {
      i++;
    }
  }

  if (coords.length === 0) {
    const nums = [...d.matchAll(/-?[0-9]*\.?[0-9]+/g)].map((m) => Number(m[0]));
    for (let j = 0; j < nums.length - 1; j += 2) {
      coords.push([nums[j], nums[j + 1]]);
    }
  }

  if (coords.length === 0) return null;

  const xs = coords.map((c) => c[0]);
  const ys = coords.map((c) => c[1]);
  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
}

const _reCache = new Map<
  string,
  { get: RegExp; test: RegExp; replace: RegExp }
>();
function _styleRe(prop: string) {
  let entry = _reCache.get(prop);
  if (!entry) {
    entry = {
      get: new RegExp(`${prop}:\\s*([^;]+)`),
      test: new RegExp(`${prop}\\s*:`),
      replace: new RegExp(`${prop}\\s*:\\s*[^;]+`),
    };
    _reCache.set(prop, entry);
  }
  return entry;
}

function getStyleVal(style: string, prop: string): string | null {
  const m = style.match(_styleRe(prop).get);
  return m ? m[1].trim() : null;
}

function setStyleVal(style: string, prop: string, val: string): string {
  const re = _styleRe(prop);
  if (re.test.test(style)) {
    return style.replace(re.replace, `${prop}: ${val}`);
  }
  return `${style.replace(/;?\s*$/, '')}; ${prop}: ${val};`.replace(
    /^;\s*/,
    ''
  );
}

function allDescendants(el: Element): Element[] {
  const result: Element[] = [];
  const stack: Element[] = [el];
  while (stack.length) {
    const node = stack.pop()!;
    result.push(node);
    for (let i = node.children.length - 1; i >= 0; i--) {
      stack.push(node.children[i]);
    }
  }
  return result;
}

function getHref(el: Element): string {
  return (
    el.getAttributeNS(XLINK_NS, 'href') ||
    el.getAttribute('xlink:href') ||
    el.getAttribute('href') ||
    ''
  );
}

// ---------------------------------------------------------------------------
// Step 1: Extract base64 images
// ---------------------------------------------------------------------------

function extractImages(root: Element): ExtractedImage[] {
  const extracted: ExtractedImage[] = [];
  const defs = root.querySelector('defs');
  if (!defs) return extracted;

  const images = defs.querySelectorAll('image');
  images.forEach((img) => {
    const href = getHref(img);
    if (!href.startsWith('data:')) return;

    const m = href.match(/data:image\/(\w+);base64,(.+)/s);
    if (!m) return;

    const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
    const imgId = img.getAttribute('id') || `image_${extracted.length}`;

    extracted.push({
      id: imgId,
      dataUrl: href,
      width: Number(img.getAttribute('width') || 0),
      height: Number(img.getAttribute('height') || 0),
      ext,
    });
  });

  return extracted;
}

// ---------------------------------------------------------------------------
// Step 2: Convert pattern fills → direct <image> with clipPath
// ---------------------------------------------------------------------------

function convertPatternsToImages(
  root: Element,
  doc: Document,
  extracted: ExtractedImage[]
): void {
  const defs = root.querySelector('defs');
  if (!defs) return;

  const extractedMap = new Map(extracted.map((e) => [e.id, e]));

  // Collect patterns
  const patterns = new Map<string, { ref: string; matrix: Matrix | null }>();
  defs.querySelectorAll('pattern').forEach((pat) => {
    const use = pat.querySelector('use');
    if (!use) return;
    const ref = getHref(use).replace('#', '');
    const transform = use.getAttribute('transform') || '';
    patterns.set(pat.getAttribute('id') || '', {
      ref,
      matrix: transform ? parseMatrix(transform) : null,
    });
  });

  if (patterns.size === 0) return;

  interface Conversion {
    elem: Element;
    parent: Element;
    bbox: BBox;
    img: {
      x: number;
      y: number;
      width: number;
      height: number;
      id: string;
      href: string;
    };
  }

  const conversions: Conversion[] = [];

  // Find elements using pattern fills
  allDescendants(root).forEach((elem) => {
    const fill = elem.getAttribute('fill') || '';
    const pm = fill.match(/url\(#([^)]+)\)/);
    if (!pm || !patterns.has(pm[1])) return;

    const pid = pm[1];
    const info = patterns.get(pid)!;
    const tag = elem.localName;

    let bbox: BBox | null = null;
    if (tag === 'rect') {
      bbox = {
        x: Number(elem.getAttribute('x') || 0),
        y: Number(elem.getAttribute('y') || 0),
        width: Number(elem.getAttribute('width') || 0),
        height: Number(elem.getAttribute('height') || 0),
      };
    } else if (tag === 'path') {
      bbox = getPathBBox(elem.getAttribute('d') || '');
    } else if (tag === 'circle') {
      const cx = Number(elem.getAttribute('cx') || 0);
      const cy = Number(elem.getAttribute('cy') || 0);
      const r = Number(elem.getAttribute('r') || 0);
      bbox = { x: cx - r, y: cy - r, width: 2 * r, height: 2 * r };
    }

    if (!bbox) return;

    // Apply element's own transform to bbox
    const elemTransform = elem.getAttribute('transform') || '';
    if (elemTransform) {
      const mat = parseMatrix(elemTransform);
      bbox = {
        x: bbox.x * Math.abs(mat.scaleX) + mat.translateX,
        y: bbox.y * Math.abs(mat.scaleY) + mat.translateY,
        width: bbox.width * Math.abs(mat.scaleX),
        height: bbox.height * Math.abs(mat.scaleY),
      };
    }

    const imgInfo = extractedMap.get(info.ref);
    const iw = imgInfo?.width || 1000;
    const ih = imgInfo?.height || 1000;
    const mat = info.matrix;

    let fx: number, fy: number, fw: number, fh: number;

    if (mat) {
      fx = bbox.x + mat.translateX * bbox.width;
      fy = bbox.y + mat.translateY * bbox.height;
      fw = Math.abs(iw * mat.scaleX * bbox.width);
      fh = Math.abs(ih * mat.scaleY * bbox.height);

      if (mat.scaleX < 0) fx -= fw;
      if (mat.scaleY < 0) fy -= fh;

      // Sanity check: if image doesn't overlap the clip bbox, cover it
      const noOverlap =
        fx + fw < bbox.x ||
        fx > bbox.x + bbox.width ||
        fy + fh < bbox.y ||
        fy > bbox.y + bbox.height;
      if (
        noOverlap ||
        fw < bbox.width * MIN_OVERLAP_RATIO ||
        fh < bbox.height * MIN_OVERLAP_RATIO
      ) {
        const aspect = ih ? iw / ih : 1;
        if (aspect > bbox.width / bbox.height) {
          fh = bbox.height * COVER_OVERFLOW;
          fw = fh * aspect;
        } else {
          fw = bbox.width * COVER_OVERFLOW;
          fh = fw / aspect;
        }
        fx = bbox.x + (bbox.width - fw) / 2;
        fy = bbox.y + (bbox.height - fh) / 2;
      }
    } else {
      fx = bbox.x;
      fy = bbox.y;
      fw = bbox.width;
      fh = bbox.height;
    }

    const isLogo =
      bbox.width < LOGO_SIZE_THRESHOLD && bbox.height < LOGO_SIZE_THRESHOLD;
    const sid = isLogo ? 'teamLogo' : 'mainImage';

    conversions.push({
      elem,
      parent: elem.parentElement!,
      bbox,
      img: {
        x: R(fx),
        y: R(fy),
        width: R(fw),
        height: R(fh),
        id: sid,
        href: isLogo ? PLACEHOLDER_LOGO : PLACEHOLDER_IMAGE,
      },
    });
  });

  // Apply conversions
  conversions.forEach((conv) => {
    const { elem, parent, img, bbox } = conv;
    const clipId = `${img.id}Clip`;

    let defsEl = root.querySelector('defs');
    if (!defsEl) {
      defsEl = doc.createElementNS(SVG_NS, 'defs');
      root.insertBefore(defsEl, root.firstChild);
    }

    // Create clipPath
    const cp = doc.createElementNS(SVG_NS, 'clipPath');
    cp.setAttribute('id', clipId);
    const shape = doc.createElementNS(SVG_NS, elem.localName);
    for (const attr of Array.from(elem.attributes)) {
      if (!CLIP_SKIP_ATTRS.has(attr.name) && !attr.name.startsWith('stroke')) {
        shape.setAttribute(attr.name, attr.value);
      }
    }
    cp.appendChild(shape);
    defsEl.appendChild(cp);

    // Create clip group + image
    const g = doc.createElementNS(SVG_NS, 'g');
    g.setAttribute('style', `clip-path: url(#${clipId});`);
    const ie = doc.createElementNS(SVG_NS, 'image');
    ie.setAttribute('id', img.id);
    ie.setAttribute(
      'data-image-field',
      img.id === 'teamLogo' ? 'imageTwo' : 'imageOne'
    );
    ie.setAttribute(
      'data-touch-bounds',
      `${R(bbox.x)},${R(bbox.y)},${R(bbox.width)},${R(bbox.height)}`
    );
    ie.setAttribute('x', String(img.x));
    ie.setAttribute('y', String(img.y));
    ie.setAttribute('width', String(img.width));
    ie.setAttribute('height', String(img.height));
    ie.setAttribute('preserveAspectRatio', 'none');
    ie.setAttributeNS(XLINK_NS, 'xlink:href', img.href);
    g.appendChild(ie);

    // Check for stroke attributes to preserve
    let hasStroke = false;
    for (const attr of Array.from(elem.attributes)) {
      if (attr.name.startsWith('stroke')) hasStroke = true;
    }
    if ((elem.getAttribute('style') || '').includes('stroke')) hasStroke = true;

    parent.replaceChild(g, elem);

    if (hasStroke) {
      const strokeElem = doc.createElementNS(SVG_NS, elem.localName);
      for (const attr of Array.from(elem.attributes)) {
        if (GEOMETRY_ATTRS.has(attr.name) || attr.name.startsWith('stroke')) {
          strokeElem.setAttribute(attr.name, attr.value);
        }
      }
      const strokeStyleParts = ['fill: none'];
      const elemStyle = elem.getAttribute('style') || '';
      if (elemStyle) {
        for (const part of elemStyle.split(';')) {
          if (part.trim().startsWith('stroke'))
            strokeStyleParts.push(part.trim());
        }
      }
      strokeElem.setAttribute('style', strokeStyleParts.join('; ') + ';');
      g.after(strokeElem);
    }
  });
}

// ---------------------------------------------------------------------------
// Step 3: Flatten <tspan> wrappers
// ---------------------------------------------------------------------------

function flattenTspans(root: Element): void {
  root.querySelectorAll('text').forEach((text) => {
    const tspans = text.querySelectorAll('tspan');
    if (tspans.length === 0) return;

    const parts: string[] = [];
    tspans.forEach((ts) => {
      if (ts.textContent) parts.push(ts.textContent);
    });

    const first = tspans[0];
    if (first.getAttribute('x') && !text.getAttribute('x')) {
      text.setAttribute('x', first.getAttribute('x')!);
    }
    if (first.getAttribute('y') && !text.getAttribute('y')) {
      text.setAttribute('y', first.getAttribute('y')!);
    }

    tspans.forEach((ts) => ts.remove());
    text.textContent = parts.join('').trim();
  });
}

// ---------------------------------------------------------------------------
// Step 4: Process text — IDs, data-*, font conversion
// ---------------------------------------------------------------------------

function classifyText(
  content: string,
  assignedRoles: Set<string>
): string | null {
  const c = content.trim();
  if (!c) return null;

  if (/^#?\d+$/.test(c) && !assignedRoles.has('playerNumber')) {
    return 'playerNumber';
  }

  const cl = c.toLowerCase();
  const words = cl.split(/\s+/);

  if (!assignedRoles.has('position')) {
    if (POSITION_WORDS.has(cl)) return 'position';
    for (const word of words) {
      if (POSITION_WORDS.has(word)) return 'position';
    }
    for (let j = 0; j < words.length - 1; j++) {
      if (POSITION_WORDS.has(`${words[j]} ${words[j + 1]}`)) return 'position';
    }
  }

  return null;
}

function processTexts(root: Element): void {
  const texts = Array.from(root.querySelectorAll('text'));
  if (texts.length === 0) return;

  const items: TextItem[] = [];

  texts.forEach((t) => {
    let style = t.getAttribute('style') || '';

    t.removeAttributeNS('http://www.w3.org/XML/1998/namespace', 'space');
    style = style.replace(/\s*white-space:\s*pre;?\s*/g, '');

    // Preserve letter-spacing: move attr → style
    const ls = t.getAttribute('letter-spacing');
    if (ls) {
      style = setStyleVal(style, 'letter-spacing', ls);
      t.removeAttribute('letter-spacing');
    }

    // Move XML font attrs → style
    for (const prop of [
      'font-family',
      'font-size',
      'font-weight',
      'font-style',
    ]) {
      let v = t.getAttribute(prop);
      if (v) {
        if (prop === 'font-size' && !v.endsWith('px')) v += 'px';
        style = setStyleVal(style, prop, v);
        t.removeAttribute(prop);
      }
    }

    // Convert font-family to Family-Weight format
    const family = getStyleVal(style, 'font-family') || 'Poppins';
    const weight = getStyleVal(style, 'font-weight') || '400';
    const weightName = FONT_WEIGHT_MAP[weight] || 'Regular';
    const baseFamily = family.split(',')[0].trim().replace(/['"]/g, '');

    if (weightName !== 'Regular') {
      style = setStyleVal(
        style,
        'font-family',
        `${baseFamily}-${weightName}, ${baseFamily}`
      );
    } else {
      style = setStyleVal(
        style,
        'font-family',
        `${baseFamily}-Regular, ${baseFamily}`
      );
    }

    const cleaned = style.trim().replace(/;?\s*$/, '') + ';';
    t.setAttribute('style', cleaned);

    const fsMatch = style.match(/font-size:\s*([0-9.]+)/);
    const fontSize = fsMatch ? Number(fsMatch[1]) : DEFAULT_FONT_SIZE;
    const content = t.textContent || '';
    const trimmed = content.trim();

    items.push({
      elem: t,
      content,
      trimmed,
      wordCount: trimmed ? trimmed.split(/\s+/).length : 0,
      isAllCaps: trimmed.length > 1 && trimmed === trimmed.toUpperCase(),
      fontSize,
      x: Number(t.getAttribute('x') || 0),
      y: Number(t.getAttribute('y') || 0),
      role: null,
    });
  });

  const nonEmpty = items.filter((it) => it.trimmed);

  const assignedRoles = new Set<string>();
  nonEmpty.forEach((it) => {
    const role = classifyText(it.content, assignedRoles);
    if (role) {
      it.role = role;
      assignedRoles.add(role);
    }
  });

  // Multi-word ALL_CAPS → teamName
  for (const it of nonEmpty) {
    if (it.role !== null) continue;
    if (!assignedRoles.has('teamName') && it.isAllCaps && it.wordCount >= 3) {
      it.role = 'teamName';
      assignedRoles.add('teamName');
      break;
    }
  }

  const unclassified = nonEmpty.filter((it) => it.role === null);
  const bySize = [...unclassified].sort((a, b) => b.fontSize - a.fontSize);
  const byY = [...unclassified].sort((a, b) => b.y - a.y);

  // Largest font → lastName
  for (const it of bySize) {
    if (it.isAllCaps && it.wordCount >= 3) continue;
    if (!assignedRoles.has('lastName')) {
      it.role = 'lastName';
      assignedRoles.add('lastName');
      break;
    }
  }

  // Remaining multi-word ALL_CAPS → teamName
  if (!assignedRoles.has('teamName')) {
    for (const it of byY) {
      if (it.role !== null) continue;
      if (it.wordCount >= 2 && it.isAllCaps) {
        it.role = 'teamName';
        assignedRoles.add('teamName');
        break;
      }
    }
  }

  // Fallback: bottom-most text → teamName
  if (!assignedRoles.has('teamName')) {
    for (const it of byY) {
      if (it.role !== null) continue;
      if (it.y > CARD_BOTTOM_Y) {
        it.role = 'teamName';
        assignedRoles.add('teamName');
        break;
      }
    }
  }

  // Remaining → firstName or generic
  const remaining = nonEmpty
    .filter((it) => it.role === null)
    .sort((a, b) => b.fontSize - a.fontSize);
  for (const it of remaining) {
    if (it.role !== null) continue;
    const hasLetters = /[a-zA-Z]/.test(it.trimmed);
    if (
      !assignedRoles.has('firstName') &&
      it.fontSize > MIN_FIRSTNAME_FONT_SIZE &&
      hasLetters &&
      it.trimmed.length > 1
    ) {
      it.role = 'firstName';
      assignedRoles.add('firstName');
    } else {
      it.role = `text${nonEmpty.indexOf(it)}`;
    }
  }

  // Handle duplicate text content (fill+stroke "25")
  const contentToRole = new Map<string, string>();
  nonEmpty.forEach((it) => {
    if (it.role && it.role in TEXT_FIELD_MAP) {
      if (!contentToRole.has(it.trimmed))
        contentToRole.set(it.trimmed, it.role);
    }
  });
  nonEmpty.forEach((it) => {
    if (
      contentToRole.has(it.trimmed) &&
      it.role !== contentToRole.get(it.trimmed)
    ) {
      it.role = contentToRole.get(it.trimmed)! + 'Stroke';
    }
  });

  // Apply IDs, data-*, touch bounds
  nonEmpty.forEach((it) => {
    const t = it.elem;
    const role = it.role!;

    t.setAttribute('id', role);
    t.setAttribute('data-text-field', TEXT_FIELD_MAP[role] || role);

    if (role.endsWith('Stroke')) {
      const hasStroke =
        t.hasAttribute('stroke') ||
        (t.getAttribute('style') || '').includes('stroke');
      const hasFill =
        t.hasAttribute('fill') ||
        (t.getAttribute('style') || '').includes('fill:');
      if (hasStroke && !hasFill) {
        let style = t.getAttribute('style') || '';
        style = setStyleVal(style, 'fill', 'none');
        t.setAttribute('style', style);
      }
    }

    const charW = it.fontSize * CHAR_WIDTH_RATIO;
    const textW = it.content.length * charW;
    const tbH = it.fontSize * TOUCH_HEIGHT_RATIO;
    const tbY = it.y - it.fontSize;
    const maxW = Math.min(CARD_RIGHT_EDGE - it.x, MAX_TEXT_WIDTH);
    let tbW = Math.max(textW, maxW);
    if (it.x + tbW > CARD_RIGHT_EDGE) tbW = CARD_RIGHT_EDGE - it.x;

    t.setAttribute(
      'data-touch-bounds',
      `${R(it.x)},${R(tbY)},${R(tbW)},${R(tbH)}`
    );
    t.setAttribute('data-max-width', String(R(maxW)));
  });
}

// ---------------------------------------------------------------------------
// Step 5: Remove filters
// ---------------------------------------------------------------------------

function removeFilters(root: Element, doc: Document): void {
  const defs = root.querySelector('defs');

  // Detect drop-shadow filters
  const shadowFilters = new Map<string, { radius: number; color: string }>();
  if (defs) {
    defs.querySelectorAll('filter').forEach((f) => {
      const fid = f.getAttribute('id') || '';
      const morph = f.querySelector('feMorphology');
      if (morph && morph.getAttribute('operator') === 'dilate') {
        const radius = Number(morph.getAttribute('radius') || 0);
        let color = '#000000';
        f.querySelectorAll('feColorMatrix').forEach((cm) => {
          const vals = (cm.getAttribute('values') || '').split(/\s+/);
          if (vals.length >= 20) {
            try {
              const r = Number(vals[4]),
                g = Number(vals[9]),
                b = Number(vals[14]);
              color = `#${Math.round(r * 255)
                .toString(16)
                .padStart(2, '0')}${Math.round(g * 255)
                .toString(16)
                .padStart(2, '0')}${Math.round(b * 255)
                .toString(16)
                .padStart(2, '0')}`;
            } catch {
              // ignore
            }
          }
        });
        shadowFilters.set(fid, { radius, color });
      }
    });
  }

  const allNodes = allDescendants(root);

  // Convert drop-shadow filters → stroke borders, remove filter attrs, unwrap empty <g>s, fix missing fills
  for (const elem of allNodes) {
    // Convert shadow filters to stroke borders
    const filt = elem.getAttribute('filter') || '';
    const fm = filt.match(/url\(#([^)]+)\)/);
    if (fm && shadowFilters.has(fm[1])) {
      const info = shadowFilters.get(fm[1])!;
      const rects = Array.from(elem.querySelectorAll('rect'));
      let bestRect: Element | undefined;
      let bestArea = 0;
      for (const r of rects) {
        const w = Number(r.getAttribute('width') || 0);
        const h = Number(r.getAttribute('height') || 0);
        if (w * h > bestArea) {
          bestArea = w * h;
          bestRect = r;
        }
      }

      if (bestRect) {
        const bx = Number(bestRect.getAttribute('x') || 0);
        const by = Number(bestRect.getAttribute('y') || 0);
        const bw = Number(bestRect.getAttribute('width') || 0);
        const bh = Number(bestRect.getAttribute('height') || 0);
        const sw = info.radius;

        const border = doc.createElementNS(SVG_NS, 'rect');
        border.setAttribute('x', String(R(bx - sw / 2)));
        border.setAttribute('y', String(R(by - sw / 2)));
        border.setAttribute('width', String(R(bw + sw)));
        border.setAttribute('height', String(R(bh + sw)));
        border.setAttribute('stroke', info.color);
        border.setAttribute('stroke-width', String(R(sw)));
        border.setAttribute('fill', 'none');
        elem.appendChild(border);
      }
    }

    // Remove filter attribute
    elem.removeAttribute('filter');

    // Fix shapes missing explicit fill
    if (SHAPE_TAGS.has(elem.localName)) {
      const hasFill =
        elem.hasAttribute('fill') ||
        (elem.getAttribute('style') || '').includes('fill');
      const fillIsPattern = (elem.getAttribute('fill') || '').startsWith(
        'url('
      );
      if (!hasFill && !fillIsPattern) {
        elem.setAttribute('fill', 'none');
      }
    }
  }

  if (defs) {
    defs.querySelectorAll('filter').forEach((f) => f.remove());
  }

  // Unwrap empty <g> wrappers (separate pass — mutates tree structure)
  for (const parent of allDescendants(root)) {
    for (const g of Array.from(parent.children)) {
      if (
        g.localName === 'g' &&
        g.attributes.length === 0 &&
        g.children.length >= 1
      ) {
        while (g.firstChild) {
          parent.insertBefore(g.firstChild, g);
        }
        g.remove();
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Step 6: Remove Figma masks
// ---------------------------------------------------------------------------

function removeFigmaMasks(root: Element, doc: Document): void {
  let defs = root.querySelector('defs');
  if (!defs) {
    defs = doc.createElementNS(SVG_NS, 'defs');
    root.insertBefore(defs, root.firstChild);
  }

  // Collect mask info
  const maskTypes = new Map<string, string>();
  const maskShapes = new Map<string, Element[]>();

  root.querySelectorAll('mask').forEach((m) => {
    const mid = m.getAttribute('id') || '';
    if (!mid) return;
    if (mid.toLowerCase().includes('inside')) maskTypes.set(mid, 'inside');
    else if (mid.toLowerCase().includes('outside'))
      maskTypes.set(mid, 'outside');
    else maskTypes.set(mid, 'unknown');
    maskShapes.set(mid, Array.from(m.children));
  });

  // Convert inside/unknown masks to clipPath
  const clipMap = new Map<string, string>();
  maskTypes.forEach((mtype, mid) => {
    if ((mtype === 'inside' || mtype === 'unknown') && maskShapes.has(mid)) {
      const clipId = `${mid}_clip`;
      const cp = doc.createElementNS(SVG_NS, 'clipPath');
      cp.setAttribute('id', clipId);
      maskShapes
        .get(mid)!
        .forEach((shape) => cp.appendChild(shape.cloneNode(true)));
      defs.appendChild(cp);
      clipMap.set(mid, clipId);
    }
  });

  // Remove <mask> definitions
  root.querySelectorAll('mask').forEach((m) => m.remove());

  // Strip mask attributes and convert to clip-path where applicable
  allDescendants(root).forEach((elem) => {
    const maskRef = elem.getAttribute('mask') || '';
    if (!maskRef) return;

    const maskMatch = maskRef.match(/url\(#([^)]+)\)/);
    if (maskMatch) {
      const maskId = maskMatch[1];
      const maskType = maskTypes.get(maskId) || 'unknown';

      if (
        (maskType === 'inside' || maskType === 'unknown') &&
        clipMap.has(maskId)
      ) {
        const clipId = clipMap.get(maskId)!;
        let style = elem.getAttribute('style') || '';
        style = setStyleVal(style, 'clip-path', `url(#${clipId})`);
        elem.setAttribute('style', style);
      } else if (maskType === 'outside') {
        // Halve stroke-width for outside masks
        const sw = elem.getAttribute('stroke-width');
        if (sw) {
          elem.setAttribute('stroke-width', String(R(Number(sw) / 2)));
        }
        let style = elem.getAttribute('style') || '';
        const swMatch = style.match(/stroke-width:\s*([0-9.]+)/);
        if (swMatch) {
          style = style.replace(
            /stroke-width:\s*[0-9.]+/,
            `stroke-width: ${R(Number(swMatch[1]) / 2)}`
          );
          elem.setAttribute('style', style);
        }
      }
    }

    elem.removeAttribute('mask');
  });
}

// ---------------------------------------------------------------------------
// Step 7: Convert fill attributes → inline style
// ---------------------------------------------------------------------------

function convertFillsToStyle(root: Element): void {
  allDescendants(root).forEach((elem) => {
    if (FILL_SKIP_TAGS.has(elem.localName)) return;

    let fill = elem.getAttribute('fill') || '';
    if (!fill || fill === 'none' || fill.startsWith('url(')) return;

    if (fill === 'white') fill = '#ffffff';

    let style = elem.getAttribute('style') || '';
    if (style.includes('fill:')) {
      elem.removeAttribute('fill');
    } else {
      style = setStyleVal(style, 'fill', fill);
      elem.setAttribute('style', style);
      elem.removeAttribute('fill');
    }
  });
}

// ---------------------------------------------------------------------------
// Step 8: Process gradients — rename, add stop IDs, data-color-*
// ---------------------------------------------------------------------------

function processGradients(root: Element): void {
  const defs = root.querySelector('defs');
  if (!defs) return;

  const grads = [
    ...Array.from(defs.querySelectorAll('linearGradient')),
    ...Array.from(defs.querySelectorAll('radialGradient')),
  ];
  if (grads.length === 0) return;

  const fieldNames = ['colorOne', 'colorTwo', 'colorThree'];
  let colorIndex = 0;

  // Collect all renames first, then do a single tree pass
  const renames = new Map<string, string>();

  grads.forEach((grad, i) => {
    const oldId = grad.getAttribute('id') || '';
    const stops = grad.querySelectorAll('stop');
    if (stops.length === 0) return;

    const semName = grads.length > 1 ? `bar${i + 1}` : 'bar';
    const gradName = `${semName}Gradient`;
    const field = fieldNames[Math.min(colorIndex, fieldNames.length - 1)];
    colorIndex++;

    if (oldId && oldId !== gradName) renames.set(oldId, gradName);
    grad.setAttribute('id', gradName);

    stops.forEach((stop, j) => {
      const stopColor = (
        stop.getAttribute('stop-color') || '#000'
      ).toLowerCase();
      if (['white', '#fff', '#ffffff'].includes(stopColor)) return;

      if (j === 0) {
        stop.setAttribute('id', `${semName}GradientStart`);
      } else if (j === stops.length - 1) {
        stop.setAttribute('id', semName);
      } else {
        stop.setAttribute(
          'id',
          stops.length === 3 ? `${semName}Mid` : `${semName}Stop${j}`
        );
      }
      stop.setAttribute('data-color-field', field);
      stop.setAttribute('data-color-target', 'stop-color');
    });
  });

  // Single O(N) pass to update all gradient references
  if (renames.size > 0) {
    allDescendants(root).forEach((elem) => {
      for (const attr of ['fill', 'stroke', 'style']) {
        const val = elem.getAttribute(attr) || '';
        if (!val.includes('url(#')) continue;
        let updated = val;
        for (const [oldId, newId] of renames) {
          if (updated.includes(`url(#${oldId})`)) {
            updated = updated.replace(`url(#${oldId})`, `url(#${newId})`);
          }
        }
        if (updated !== val) elem.setAttribute(attr, updated);
      }
    });
  }
}

// ---------------------------------------------------------------------------
// Step 9: Clean defs — remove pattern & image defs
// ---------------------------------------------------------------------------

function cleanDefs(root: Element): void {
  const defs = root.querySelector('defs');
  if (!defs) return;

  Array.from(defs.children).forEach((elem) => {
    if (elem.localName === 'pattern' || elem.localName === 'image') {
      elem.remove();
    }
  });
}

// ---------------------------------------------------------------------------
// Step 10: Clean root element — remove fill="none", width, height
// ---------------------------------------------------------------------------

function cleanRoot(root: Element): void {
  root.removeAttribute('fill');
  root.removeAttribute('width');
  root.removeAttribute('height');
}

// ---------------------------------------------------------------------------
// Step 11: Move <defs> to be first child
// ---------------------------------------------------------------------------

function moveDefsFirst(root: Element): void {
  const defs = root.querySelector('defs');
  if (!defs) return;
  root.removeChild(defs);
  root.insertBefore(defs, root.firstChild);
}

// ---------------------------------------------------------------------------
// Serialize + cleanup
// ---------------------------------------------------------------------------

function serializeSvg(doc: Document): string {
  const serializer = new XMLSerializer();
  let svg = serializer.serializeToString(doc.documentElement);

  // Add XML declaration
  if (!svg.startsWith('<?xml')) {
    svg = '<?xml version="1.0" encoding="UTF-8"?>\n' + svg;
  }

  // Normalize style attrs
  svg = svg.replace(/style="([^"]*)"/g, (_, inner: string) => {
    const parts = inner
      .split(';')
      .map((p: string) => p.trim())
      .filter(Boolean);
    return `style="${parts.join('; ')};"`;
  });
  svg = svg.replace(/ style=""/g, '');

  // Remove empty xmlns:xlink if duplicated
  svg = svg.replace(/\s+xmlns:xlink="[^"]*"(?=[\s\S]*xmlns:xlink=")/g, '');

  return svg;
}

function formatSvg(svg: string): string {
  // Simple indentation-based formatting
  let indent = 0;
  const lines: string[] = [];
  // Split on tags but keep them intact
  const tokens = svg.replace(/>\s*</g, '>\n<').split('\n');

  for (const raw of tokens) {
    const line = raw.trim();
    if (!line) continue;

    // Self-closing or closing tag → decrease indent first
    if (line.startsWith('</')) {
      indent = Math.max(0, indent - 1);
    }

    lines.push('  '.repeat(indent) + line);

    // Opening tag (not self-closing, not closing) → increase indent
    if (
      line.startsWith('<') &&
      !line.startsWith('</') &&
      !line.startsWith('<?') &&
      !line.endsWith('/>') &&
      !line.includes('</') // inline close like <text>foo</text>
    ) {
      indent++;
    }
  }

  return lines.join('\n') + '\n';
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function convertFigmaSvg(svgString: string): ConversionResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const root = doc.documentElement;

  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error(`SVG parse error: ${parseError.textContent}`);
  }

  const images = extractImages(root);
  convertPatternsToImages(root, doc, images);
  flattenTspans(root);
  processTexts(root);
  removeFilters(root, doc);
  removeFigmaMasks(root, doc);
  convertFillsToStyle(root);
  processGradients(root);
  cleanDefs(root);
  cleanRoot(root);
  moveDefsFirst(root);

  let svg = serializeSvg(doc);
  svg = formatSvg(svg);

  return { svg, images };
}
