/**
 * Prepends a translate(dx, dy) to an existing transform string.
 * SVG transforms compose right-to-left, so prepending applies the translation
 * after all existing transforms.
 */
export function applyTranslate(
  existingTransform: string | undefined,
  dx: number,
  dy: number
): string {
  const translate = `translate(${dx},${dy})`;
  if (!existingTransform) return translate;
  return `${translate} ${existingTransform}`;
}

/**
 * Prepends a scale around a given anchor point to an existing transform.
 * Equivalent to: translate(ax, ay) scale(sx, sy) translate(-ax, -ay)
 * This scales the element relative to the anchor point.
 */
export function applyScaleAroundPoint(
  existingTransform: string | undefined,
  ax: number,
  ay: number,
  sx: number,
  sy: number
): string {
  const scale = `translate(${ax},${ay}) scale(${sx},${sy}) translate(${-ax},${-ay})`;
  if (!existingTransform) return scale;
  return `${scale} ${existingTransform}`;
}

/**
 * Removes scale transforms (and their surrounding anchor-translate pairs)
 * from a transform string, preserving standalone translate() functions.
 *
 * The codebase generates scale transforms via `applyScaleAroundPoint` which
 * produces: translate(ax,ay) scale(sx,sy) translate(-ax,-ay)
 * This function strips those triplets plus any bare scale() calls.
 */
export function removeScaleFromTransform(
  transform: string | undefined
): string | undefined {
  if (!transform) return undefined;

  // Tokenize into individual transform functions
  const tokens: string[] = [];
  const re = /(translate|scale|rotate|matrix|skewX|skewY)\([^)]*\)/g;
  let match;
  while ((match = re.exec(transform)) !== null) {
    tokens.push(match[0]);
  }

  // Walk through tokens and remove scale() along with its
  // surrounding anchor-translate pair (translate(ax,ay) scale(...) translate(-ax,-ay))
  const keep: string[] = [];
  let i = 0;
  while (i < tokens.length) {
    if (tokens[i].startsWith('scale(')) {
      // Bare scale — skip it
      i++;
      continue;
    }

    // Check for the triplet pattern: translate(ax,ay) scale(...) translate(-ax,-ay)
    if (
      i + 2 < tokens.length &&
      tokens[i].startsWith('translate(') &&
      tokens[i + 1].startsWith('scale(') &&
      tokens[i + 2].startsWith('translate(')
    ) {
      // Verify the two translates are inverse of each other
      const nums1 = parseTranslateArgs(tokens[i]);
      const nums2 = parseTranslateArgs(tokens[i + 2]);
      if (
        nums1 &&
        nums2 &&
        Math.abs(nums1[0] + nums2[0]) < 0.001 &&
        Math.abs(nums1[1] + nums2[1]) < 0.001
      ) {
        // Skip the entire triplet
        i += 3;
        continue;
      }
    }

    keep.push(tokens[i]);
    i++;
  }

  if (keep.length === 0) return undefined;
  return keep.join(' ');
}

/**
 * Extracts the first scale(sx, sy) values from a transform string.
 * Returns null if no scale is present.
 */
export function parseScaleValues(
  transform: string | undefined
): { sx: number; sy: number } | null {
  if (!transform) return null;
  const match = transform.match(/scale\(\s*([^,)]+?)\s*(?:,\s*([^)]+?)\s*)?\)/);
  if (!match) return null;
  const sx = parseFloat(match[1].trim());
  const sy = match[2] ? parseFloat(match[2].trim()) : sx;
  if (isNaN(sx) || isNaN(sy)) return null;
  return { sx, sy };
}

function parseTranslateArgs(token: string): [number, number] | null {
  const match = token.match(
    /^translate\(\s*([^,)]+?)\s*(?:,\s*([^)]+?)\s*)?\)$/
  );
  if (!match) return null;
  const x = parseFloat(match[1].trim());
  const y = match[2] ? parseFloat(match[2].trim()) : 0;
  if (isNaN(x) || isNaN(y)) return null;
  return [x, y];
}
