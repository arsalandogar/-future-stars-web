interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

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

async function detectMimeType(src: string): Promise<string> {
  try {
    const res = await fetch(src);
    const blob = await res.blob();
    if (blob.type === 'image/png' || blob.type === 'image/webp') {
      return blob.type;
    }
  } catch {
    // Fall through to default
  }
  return 'image/jpeg';
}

export async function getCroppedImageBlob(
  imageSrc: string,
  pixelCrop: PixelCrop
): Promise<Blob> {
  const [image, mimeType] = await Promise.all([
    loadImage(imageSrc),
    detectMimeType(imageSrc),
  ]);
  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      },
      mimeType,
      mimeType === 'image/jpeg' ? 0.92 : undefined
    );
  });
}
