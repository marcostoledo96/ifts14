/** PDF mínimo válido para mock local (abríble en visores). Sin dependencias. */

export type MockCertificatePdfInput = {
  readonly numero: string;
  readonly nombreAlumno: string;
  readonly cursoNombre: string;
  readonly documentMasked: string;
  readonly emitidoEn: string | null;
  readonly validationUrl: string;
};

/** Normaliza a Latin-1 seguro para literales PDF Type1 Helvetica. */
function pdfSafe(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\x20-\x7E]/g, '?')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

/**
 * Arma un PDF 1.4 de una página A4 con datos del certificado.
 * Suficiente para QA local; el PDF institucional real lo genera el backend.
 */
export function buildMockCertificatePdf(input: MockCertificatePdfInput): Blob {
  const titulo = pdfSafe(input.numero || 'IFTS14-CERT');
  const alumno = pdfSafe(input.nombreAlumno);
  const curso = pdfSafe(input.cursoNombre);
  const dni = pdfSafe(input.documentMasked);
  const emision = pdfSafe(input.emitidoEn || '—');
  const url = pdfSafe(input.validationUrl);

  const contentStream = [
    'BT',
    '/F1 18 Tf',
    '50 780 Td',
    `(IFTS 14 — Certificado) Tj`,
    '/F1 14 Tf',
    '0 -28 Td',
    `(${titulo}) Tj`,
    '0 -36 Td',
    `/F1 12 Tf`,
    `(Alumno: ${alumno}) Tj`,
    '0 -18 Td',
    `(Documento: ${dni}) Tj`,
    '0 -18 Td',
    `(Curso: ${curso}) Tj`,
    '0 -18 Td',
    `(Emision: ${emision}) Tj`,
    '0 -28 Td',
    `/F1 9 Tf`,
    `(Validacion: ${url}) Tj`,
    '0 -40 Td',
    `/F1 10 Tf`,
    `(Documento de prueba local — no es el PDF institucional.) Tj`,
    'ET',
  ].join('\n');

  const objects: string[] = [];
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[2] = '<< /Type /Pages /Kids [3 0 R] /Count 1 >>';
  objects[3] =
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] ' +
    '/Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>';
  objects[4] = `<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`;
  objects[5] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';

  let body = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (let i = 1; i <= 5; i++) {
    offsets[i] = body.length;
    body += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefStart = body.length;
  body += `xref\n0 6\n`;
  body += `0000000000 65535 f \n`;
  for (let i = 1; i <= 5; i++) {
    body += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  body += `trailer\n<< /Size 6 /Root 1 0 R >>\n`;
  body += `startxref\n${xrefStart}\n%%EOF\n`;

  // Latin-1 bytes (Helvetica ASCII content).
  const bytes = new Uint8Array(body.length);
  for (let i = 0; i < body.length; i++) {
    bytes[i] = body.charCodeAt(i) & 0xff;
  }
  return new Blob([bytes], { type: 'application/pdf' });
}
