import {
  SIGNATURE_ASPECT,
  SIGNATURE_MAX_HEIGHT,
  SIGNATURE_MAX_WIDTH,
  prepareSignatureImage,
} from './prepare-signature-image';

describe('prepareSignatureImage', () => {
  function makeJpegFile(width: number, height: number, name = 'firma.jpg'): Promise<File> {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#224466';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(Math.floor(width * 0.4), Math.floor(height * 0.4), 20, 20);
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('blob'));
          return;
        }
        resolve(new File([blob], name, { type: 'image/jpeg' }));
      }, 'image/jpeg', 0.9);
    });
  }

  it('recorta centrado y escala una imagen alta a ≤1200×800 (ratio 3:2)', async () => {
    const file = await makeJpegFile(1600, 1293);
    const out = await prepareSignatureImage(file);
    expect(out.type).toBe('image/jpeg');
    expect(out.size).toBeGreaterThan(0);
    expect(out.size).toBeLessThanOrEqual(1_048_576);

    const bmp = await createImageBitmap(out);
    try {
      expect(bmp.width).toBeLessThanOrEqual(SIGNATURE_MAX_WIDTH);
      expect(bmp.height).toBeLessThanOrEqual(SIGNATURE_MAX_HEIGHT);
      expect(bmp.width / bmp.height).toBeCloseTo(SIGNATURE_ASPECT, 1);
    } finally {
      bmp.close();
    }
  });

  it('rechaza tipos no PNG/JPEG', async () => {
    const file = new File([new Uint8Array([1, 2, 3])], 'x.gif', { type: 'image/gif' });
    await expectAsync(prepareSignatureImage(file)).toBeRejectedWithError(/PNG o JPEG/);
  });
});
