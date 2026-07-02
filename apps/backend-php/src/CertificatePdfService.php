<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/tecnickcom/tcpdf/tcpdf.php';
require_once __DIR__ . '/../vendor/tecnickcom/tcpdf/tcpdf_barcodes_2d.php';

/**
 * Generación y persistencia del PDF de un certificado con QR de validación.
 *
 * El token completo nunca entra a este servicio: solo recibe la URL pública
 * ya armada por el llamador ({public_base_url}/validar/{token}).
 */
final class CertificatePdfService
{
    public function __construct(
        private readonly string $storagePath,
    ) {
        if (!is_dir($this->storagePath)) {
            if (!@mkdir($this->storagePath, 0700, true) && !is_dir($this->storagePath)) {
                throw new RuntimeException('Storage de PDFs no disponible.');
            }
        }
    }

    /**
     * @param array<string, mixed> $viewData Datos visibles del certificado:
     *   certificateCode, studentDisplayName, documentNumber, courseName,
     *   issuedAt, expiresAt, attendedDates.
     * @param string $validationUrl URL pública absoluta apuntando a /validar/{token}.
     * @return string Ruta absoluta final del PDF persistido.
     * @throws RuntimeException Si la generación o el rename fallan.
     */
    public function generate(string $certificateCode, array $viewData, string $validationUrl): string
    {
        $finalPath = $this->pathForCode($certificateCode);

        $tcpdf = new TCPDF('L', PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
        $tcpdf->setPrintHeader(false);
        $tcpdf->setPrintFooter(false);
        $tcpdf->setAutoPageBreak(false);
        $tcpdf->setMargins(18, 18, 18, true);
        $tcpdf->AddPage('L');

        $tcpdf->setFont('helvetica', 'B', 22);
        $tcpdf->Cell(0, 14, 'Certificado de Aprobación', 0, 1, 'C');

        $tcpdf->setFont('helvetica', '', 12);
        $tcpdf->setY(40);
        $tcpdf->MultiCell(0, 8, 'Se certifica que', 0, 'C');

        $tcpdf->setFont('helvetica', 'B', 16);
        $tcpdf->MultiCell(0, 10, (string) ($viewData['studentDisplayName'] ?? ''), 0, 'C');

        $tcpdf->setFont('helvetica', '', 12);
        $tcpdf->MultiCell(0, 8, 'ha aprobado', 0, 'C');

        $tcpdf->setFont('helvetica', 'B', 14);
        $tcpdf->MultiCell(0, 8, (string) ($viewData['courseName'] ?? ''), 0, 'C');

        $tcpdf->setFont('helvetica', '', 11);
        $tcpdf->MultiCell(0, 6, 'Documento: ' . (string) ($viewData['documentNumber'] ?? ''), 0, 'C');
        $tcpdf->MultiCell(0, 6, 'Emitido el: ' . (string) ($viewData['issuedAt'] ?? ''), 0, 'C');
        if (isset($viewData['expiresAt']) && $viewData['expiresAt'] !== '') {
            $tcpdf->MultiCell(0, 6, 'Vence el: ' . (string) ($viewData['expiresAt'] ?? ''), 0, 'C');
        }

        $attendedDates = $this->attendedDatesText($viewData['attendedDates'] ?? []);
        if ($attendedDates !== '') {
            $tcpdf->MultiCell(0, 6, 'Fechas asistidas: ' . $attendedDates, 0, 'C');
        }

        $tcpdf->setFont('helvetica', '', 10);
        $tcpdf->MultiCell(0, 6, 'Código de certificado: ' . $certificateCode, 0, 'C');

        // QR de validación en la esquina inferior derecha. El contenido del QR
        // es la URL pública; el token completo nunca se imprime como texto.
        $tcpdf->write2DBarcode(
            $validationUrl,
            'QRCODE',
            235,
            130,
            40,
            40,
            [
                'border' => false,
                'padding' => 0,
                'fgcolor' => [0, 0, 0],
                'bgcolor' => false,
            ],
            'T',
        );

        $tcpdf->setFont('helvetica', '', 8);
        $tcpdf->setY(172);
        $tcpdf->MultiCell(0, 5, 'Escanee el QR para validar el certificado en la sede oficial.', 0, 'C');

        $tempPath = $finalPath . '.tmp';
        $pdfString = $tcpdf->Output('', 'S');
        if (!is_string($pdfString) || $pdfString === '') {
            throw new RuntimeException('PDF vacío o inválido.');
        }

        if (file_put_contents($tempPath, $pdfString) === false) {
            throw new RuntimeException('No se pudo escribir el PDF temporal.');
        }

        if (!rename($tempPath, $finalPath)) {
            @unlink($tempPath);
            throw new RuntimeException('No se pudo persistir el PDF.');
        }

        return $finalPath;
    }

    public function pathForCode(string $certificateCode): string
    {
        $sanitized = preg_replace('/[^A-Za-z0-9_-]/', '_', $certificateCode) ?? $certificateCode;

        return rtrim($this->storagePath, '/') . '/' . $sanitized . '.pdf';
    }

    private function attendedDatesText(mixed $dates): string
    {
        if (!is_array($dates)) {
            return '';
        }

        $values = [];
        foreach ($dates as $date) {
            if (is_array($date) && isset($date['fecha'])) {
                $values[] = (string) $date['fecha'];
            } elseif (is_string($date)) {
                $values[] = $date;
            }
        }

        return implode(', ', $values);
    }
}
