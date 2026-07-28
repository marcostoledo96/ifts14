/**
 * Normaliza firmas antes del POST: recorte centrado al ratio 3:2 y escala
 * a máx. 1200×800 (JPEG ≤ 1 MB). Evita el 400 del backend por dimensiones.
 */

export const SIGNATURE_MAX_WIDTH = 1200;
export const SIGNATURE_MAX_HEIGHT = 800;
export const SIGNATURE_MAX_BYTES = 1_048_576;
/** Ancho:alto del slot de firma en folio/config. */
export const SIGNATURE_ASPECT = SIGNATURE_MAX_WIDTH / SIGNATURE_MAX_HEIGHT;

export async function prepareSignatureImage(file: File): Promise<File> {
  const type = file.type;
  if (type !== 'image/png' && type !== 'image/jpeg' && type !== 'image/jpg') {
    throw new Error('Usá PNG o JPEG.');
  }
  if (file.size <= 0) {
    throw new Error('El archivo de firma está vacío.');
  }

  const bitmap = await loadBitmap(file);
  try {
    const { sx, sy, sw, sh } = centerCropRect(
      bitmap.width,
      bitmap.height,
      SIGNATURE_ASPECT,
    );
    const { dw, dh } = fitWithin(sw, sh, SIGNATURE_MAX_WIDTH, SIGNATURE_MAX_HEIGHT);

    const canvas = document.createElement('canvas');
    canvas.width = dw;
    canvas.height = dh;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('No se pudo preparar la imagen de firma.');
    }
    ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, dw, dh);

    const blob = await exportUnderMaxBytes(canvas);
    const base = file.name.replace(/\.[^.]+$/, '') || 'firma';
    return new File([blob], `${base}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
  } finally {
    bitmap.close();
  }
}

function centerCropRect(
  width: number,
  height: number,
  aspect: number,
): { sx: number; sy: number; sw: number; sh: number } {
  const srcAspect = width / height;
  if (srcAspect > aspect) {
    // Más ancha: recortar costados.
    const sw = Math.round(height * aspect);
    const sx = Math.round((width - sw) / 2);
    return { sx, sy: 0, sw, sh: height };
  }
  // Más alta / cuadrada: recortar arriba/abajo.
  const sh = Math.round(width / aspect);
  const sy = Math.round((height - sh) / 2);
  return { sx: 0, sy, sw: width, sh };
}

function fitWithin(
  w: number,
  h: number,
  maxW: number,
  maxH: number,
): { dw: number; dh: number } {
  const scale = Math.min(1, maxW / w, maxH / h);
  return {
    dw: Math.max(1, Math.round(w * scale)),
    dh: Math.max(1, Math.round(h * scale)),
  };
}

async function loadBitmap(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file);
  } catch {
    throw new Error('No se pudo leer la imagen. Probá con otro PNG o JPEG.');
  }
}

async function exportUnderMaxBytes(canvas: HTMLCanvasElement): Promise<Blob> {
  let quality = 0.92;
  for (let i = 0; i < 8; i++) {
    const blob = await canvasToJpeg(canvas, quality);
    if (blob.size <= SIGNATURE_MAX_BYTES) {
      return blob;
    }
    quality -= 0.1;
  }
  const last = await canvasToJpeg(canvas, 0.5);
  if (last.size > SIGNATURE_MAX_BYTES) {
    throw new Error('La firma supera 1 MB incluso tras comprimir. Usá una imagen más liviana.');
  }
  return last;
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('No se pudo exportar la firma.'));
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      quality,
    );
  });
}
