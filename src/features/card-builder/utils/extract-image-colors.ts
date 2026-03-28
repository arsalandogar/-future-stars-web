const MAX_CACHE_SIZE = 50;
const cache = new Map<string, string[]>();

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', () =>
      reject(new Error('Failed to load image'))
    );
    img.crossOrigin = 'anonymous';
    img.src = src;
  });
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toLowerCase()
  );
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function colorDistanceSq(a: string, b: string): number {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return (r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2;
}

interface ColorBucket {
  hex: string;
  r: number;
  g: number;
  b: number;
  count: number;
}

export async function extractDominantColors(
  imageUrl: string,
  maxColors = 6
): Promise<string[]> {
  const cached = cache.get(imageUrl);
  if (cached) return cached;

  try {
    const img = await loadImage(imageUrl);
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    ctx.drawImage(img, 0, 0, size, size);

    let data: ImageData;
    try {
      data = ctx.getImageData(0, 0, size, size);
    } catch {
      // CORS / tainted canvas
      return [];
    }

    // Build frequency map, quantize to nearest 8 to reduce noise
    const freq = new Map<string, ColorBucket>();
    const pixels = data.data;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] < 128) continue; // skip transparent
      const r = Math.round(pixels[i] / 8) * 8;
      const g = Math.round(pixels[i + 1] / 8) * 8;
      const b = Math.round(pixels[i + 2] / 8) * 8;
      const hex = rgbToHex(
        Math.min(r, 255),
        Math.min(g, 255),
        Math.min(b, 255)
      );
      const existing = freq.get(hex);
      if (existing) {
        existing.count++;
      } else {
        freq.set(hex, {
          hex,
          r: Math.min(r, 255),
          g: Math.min(g, 255),
          b: Math.min(b, 255),
          count: 1,
        });
      }
    }

    // Sort by frequency
    const sorted = Array.from(freq.values()).sort((a, b) => b.count - a.count);

    // Cluster: greedily pick colors that are sufficiently different
    const minDistSq = 50 ** 2; // minimum distance between selected colors
    const result: string[] = [];
    for (const bucket of sorted) {
      if (result.length >= maxColors) break;
      const tooClose = result.some(
        (existing) => colorDistanceSq(bucket.hex, existing) < minDistSq
      );
      if (!tooClose) {
        result.push(bucket.hex);
      }
    }

    // Evict oldest entries when cache exceeds limit
    if (cache.size >= MAX_CACHE_SIZE) {
      const oldest = cache.keys().next().value;
      if (oldest) cache.delete(oldest);
    }
    cache.set(imageUrl, result);
    return result;
  } catch {
    return [];
  }
}

export function clearImageColorCache(url?: string) {
  if (url) {
    cache.delete(url);
  } else {
    cache.clear();
  }
}
