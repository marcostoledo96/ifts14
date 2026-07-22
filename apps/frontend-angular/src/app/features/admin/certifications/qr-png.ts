/** Helpers para QR PNG en admin (mock y vista imprimible). Sin `fetch`. */
import QRCode from 'qrcode';

export function dataUrlToPngBlob(dataUrl: string): Blob {
  const comma = dataUrl.indexOf(',');
  const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: 'image/png' });
}

/** Genera un PNG de QR escaneable a partir de la URL pública de validación. */
export async function qrPngBlobFromUrl(publicValidationUrl: string): Promise<Blob> {
  const dataUrl = await QRCode.toDataURL(publicValidationUrl, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 256,
    color: { dark: '#000000', light: '#ffffff' },
  });
  return dataUrlToPngBlob(dataUrl);
}
