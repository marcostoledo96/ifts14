<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/tecnickcom/tcpdf/tcpdf.php';
require_once __DIR__ . '/../vendor/tecnickcom/tcpdf/tcpdf_barcodes_2d.php';
require_once __DIR__ . '/InstitutionalConfig.php';

/**
 * Generación y persistencia del PDF de un certificado con QR de validación.
 *
 * El token completo nunca entra a este servicio: solo recibe la URL pública
 * ya armada por el llamador ({public_base_url}/validar/{token}).
 */
final class CertificatePdfService
{
    private const int CONTENT_X = 46;
    private const int CONTENT_WIDTH = 205;
    private const int CERTIFICATE_TEXT_Y = 43;
    private const int STUDENT_NAME_Y = 65;
    private const int SIGNATORY_Y = 145;
    private const int SIGNATORY_WIDTH = 70;
    private const int RECTOR_X = 32;
    private const int ADVISOR_X = 130;
    private const int QR_X = 235;
    private const int QR_Y = 130;
    private const int QR_SIZE = 40;
    private const int FOOTER_Y = 172;
    private const int PAGE_MARGIN = 18;
    private const int PDF_FULL_WIDTH = 0;
    private const int PDF_NO_BORDER = 0;
    private const int PDF_NEXT_LINE = 1;
    private const int QR_PADDING = 0;
    private const array QR_FOREGROUND_COLOR = [0, 0, 0];
    private const int INSTITUTION_FONT_SIZE = 16;
    private const int INSTITUTION_CELL_HEIGHT = 8;
    private const int CERTIFICATE_TITLE_FONT_SIZE = 22;
    private const int CERTIFICATE_TITLE_CELL_HEIGHT = 12;
    private const int BODY_FONT_SIZE = 12;
    private const int CERTIFICATE_TEXT_HEIGHT = 18;
    private const int STUDENT_NAME_FONT_SIZE = 16;
    private const int STUDENT_NAME_CELL_HEIGHT = 9;
    private const int BODY_CELL_HEIGHT = 7;
    private const int COURSE_NAME_FONT_SIZE = 14;
    private const int COURSE_NAME_CELL_HEIGHT = 8;
    private const int DETAIL_FONT_SIZE = 11;
    private const int DETAIL_CELL_HEIGHT = 6;
    private const int CERTIFICATE_CODE_FONT_SIZE = 10;
    private const int FOOTER_FONT_SIZE = 8;
    private const int FOOTER_CELL_HEIGHT = 5;
    private const int SIGNATORY_TEXT_OFFSET_Y = 2;
    private const int SIGNATORY_NAME_FONT_SIZE = 10;
    private const int SIGNATORY_ROLE_FONT_SIZE = 9;
    private const int SIGNATORY_CELL_HEIGHT = 5;

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
        $institutionalConfig = InstitutionalConfig::normalize($viewData['institutionalConfig'] ?? []);

        $tcpdf = new TCPDF('L', PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
        $tcpdf->setCompression(false);
        $tcpdf->setPrintHeader(false);
        $tcpdf->setPrintFooter(false);
        $tcpdf->setAutoPageBreak(false);
        $tcpdf->setMargins(self::PAGE_MARGIN, self::PAGE_MARGIN, self::PAGE_MARGIN, true);
        $tcpdf->AddPage('L');

        $tcpdf->setFont('helvetica', 'B', self::INSTITUTION_FONT_SIZE);
        $tcpdf->Cell(self::PDF_FULL_WIDTH, self::INSTITUTION_CELL_HEIGHT, $institutionalConfig['institutionName'], self::PDF_NO_BORDER, self::PDF_NEXT_LINE, 'C');

        $tcpdf->setFont('helvetica', 'B', self::CERTIFICATE_TITLE_FONT_SIZE);
        $tcpdf->Cell(self::PDF_FULL_WIDTH, self::CERTIFICATE_TITLE_CELL_HEIGHT, 'Certificado de Curso', self::PDF_NO_BORDER, self::PDF_NEXT_LINE, 'C');

        $tcpdf->setFont('helvetica', '', self::BODY_FONT_SIZE);
        $tcpdf->setY(self::CERTIFICATE_TEXT_Y);
        $tcpdf->writeHTMLCell(self::CONTENT_WIDTH, self::CERTIFICATE_TEXT_HEIGHT, self::CONTENT_X, self::CERTIFICATE_TEXT_Y, htmlspecialchars($institutionalConfig['certificateText'], ENT_QUOTES | ENT_HTML5, 'UTF-8'), self::PDF_NO_BORDER, self::PDF_NEXT_LINE, false, true, 'C');

        $tcpdf->setFont('helvetica', 'B', self::STUDENT_NAME_FONT_SIZE);
        $tcpdf->setY(self::STUDENT_NAME_Y);
        $tcpdf->MultiCell(self::CONTENT_WIDTH, self::STUDENT_NAME_CELL_HEIGHT, $this->visibleText($viewData['studentDisplayName'] ?? ''), self::PDF_NO_BORDER, 'C');

        $tcpdf->setFont('helvetica', '', self::BODY_FONT_SIZE);
        $tcpdf->MultiCell(self::CONTENT_WIDTH, self::BODY_CELL_HEIGHT, 'Curso certificado', self::PDF_NO_BORDER, 'C');

        $tcpdf->setFont('helvetica', 'B', self::COURSE_NAME_FONT_SIZE);
        $tcpdf->MultiCell(self::CONTENT_WIDTH, self::COURSE_NAME_CELL_HEIGHT, $this->visibleText($viewData['courseName'] ?? ''), self::PDF_NO_BORDER, 'C');

        $tcpdf->setFont('helvetica', '', self::DETAIL_FONT_SIZE);
        $tcpdf->MultiCell(self::CONTENT_WIDTH, self::DETAIL_CELL_HEIGHT, 'Documento: ' . $this->visibleText($viewData['documentNumber'] ?? ''), self::PDF_NO_BORDER, 'C');
        $tcpdf->MultiCell(self::CONTENT_WIDTH, self::DETAIL_CELL_HEIGHT, 'Emitido el: ' . $this->visibleText($viewData['issuedAt'] ?? ''), self::PDF_NO_BORDER, 'C');
        if (isset($viewData['expiresAt']) && $viewData['expiresAt'] !== '') {
            $tcpdf->MultiCell(self::CONTENT_WIDTH, self::DETAIL_CELL_HEIGHT, 'Vence el: ' . $this->visibleText($viewData['expiresAt'] ?? ''), self::PDF_NO_BORDER, 'C');
        }

        $attendedDates = $this->attendedDatesText($viewData['attendedDates'] ?? []);
        if ($attendedDates !== '') {
            $tcpdf->MultiCell(self::CONTENT_WIDTH, self::DETAIL_CELL_HEIGHT, 'Fechas asistidas: ' . $attendedDates, self::PDF_NO_BORDER, 'C');
        }

        $tcpdf->setFont('helvetica', '', self::CERTIFICATE_CODE_FONT_SIZE);
        $tcpdf->MultiCell(self::CONTENT_WIDTH, self::DETAIL_CELL_HEIGHT, 'Código de certificado: ' . $this->visibleText($certificateCode), self::PDF_NO_BORDER, 'C');

        $this->renderSignatory(
            $tcpdf,
            self::RECTOR_X,
            self::SIGNATORY_Y,
            $institutionalConfig['rectorName'],
            $institutionalConfig['rectorRole'],
            $institutionalConfig['rectorSignaturePath'] ?? null,
        );
        $this->renderSignatory(
            $tcpdf,
            self::ADVISOR_X,
            self::SIGNATORY_Y,
            $institutionalConfig['advisorName'],
            $institutionalConfig['advisorRole'],
            $institutionalConfig['advisorSignaturePath'] ?? null,
        );

        // QR de validación en la esquina inferior derecha. El contenido del QR
        // es la URL pública; el token completo nunca se imprime como texto.
        $tcpdf->write2DBarcode(
            $validationUrl,
            'QRCODE',
            self::QR_X,
            self::QR_Y,
            self::QR_SIZE,
            self::QR_SIZE,
            [
                'border' => false,
                'padding' => self::QR_PADDING,
                'fgcolor' => self::QR_FOREGROUND_COLOR,
                'bgcolor' => false,
            ],
            'T',
        );

        $tcpdf->setFont('helvetica', '', self::FOOTER_FONT_SIZE);
        $tcpdf->setY(self::FOOTER_Y);
        $tcpdf->MultiCell(self::PDF_FULL_WIDTH, self::FOOTER_CELL_HEIGHT, 'Escanee el QR para validar el certificado en la sede oficial.', self::PDF_NO_BORDER, 'C');

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
                $values[] = $this->visibleText($date['fecha']);
            } elseif (is_string($date)) {
                $values[] = $this->visibleText($date);
            }
        }

        return implode(', ', $values);
    }

    private function visibleText(mixed $value): string
    {
        return mb_substr(trim((string) $value), 0, InstitutionalConfig::TEXT_MAX_LENGTH);
    }

    private function renderSignatory(
        TCPDF $tcpdf,
        int $x,
        int $y,
        string $name,
        string $role,
        ?string $signaturePath = null,
    ): void {
        $name = trim($name);
        $role = trim($role);
        if ($name === '') {
            return;
        }

        $imageDrawn = false;
        if (is_string($signaturePath) && $signaturePath !== '' && is_file($signaturePath) && is_readable($signaturePath)) {
            // TCPDF Image usa GD/Imagick internamente; QR ya depende de GD.
            // Sin estirar: mantener aspect ratio dentro del box (la subida ya recorta al centro).
            $boxW = self::SIGNATORY_WIDTH - 10;
            // Slot ~3:2 (misma proporción que la normalización al subir).
            $boxH = ($boxW * 2.0) / 3.0;
            $imageY = $y - $boxH;
            $drawW = (float) $boxW;
            $drawH = $boxH;
            $imgX = $x + 5.0;
            $imgY = $imageY;
            $dims = @getimagesize($signaturePath);
            if (is_array($dims) && isset($dims[0], $dims[1]) && (int) $dims[0] > 0 && (int) $dims[1] > 0) {
                $srcW = (float) $dims[0];
                $srcH = (float) $dims[1];
                $scale = min($boxW / $srcW, $boxH / $srcH);
                $drawW = $srcW * $scale;
                $drawH = $srcH * $scale;
                $imgX = $x + 5.0 + ($boxW - $drawW) / 2.0;
                $imgY = $imageY + ($boxH - $drawH) / 2.0;
            }
            try {
                $tcpdf->Image(
                    $signaturePath,
                    $imgX,
                    $imgY,
                    $drawW,
                    $drawH,
                    '',
                    '',
                    '',
                    false,
                    300,
                    '',
                    false,
                    false,
                    0,
                    false,
                    false,
                    false,
                );
                $imageDrawn = true;
            } catch (Throwable) {
                $imageDrawn = false;
            }
        }

        if (!$imageDrawn) {
            $tcpdf->Line($x, $y, $x + self::SIGNATORY_WIDTH, $y);
        }

        $tcpdf->setXY($x, $y + self::SIGNATORY_TEXT_OFFSET_Y);
        $tcpdf->setFont('helvetica', 'B', self::SIGNATORY_NAME_FONT_SIZE);
        $tcpdf->MultiCell(self::SIGNATORY_WIDTH, self::SIGNATORY_CELL_HEIGHT, $name, self::PDF_NO_BORDER, 'C');
        if ($role !== '') {
            $tcpdf->setX($x);
            $tcpdf->setFont('helvetica', '', self::SIGNATORY_ROLE_FONT_SIZE);
            $tcpdf->MultiCell(self::SIGNATORY_WIDTH, self::SIGNATORY_CELL_HEIGHT, $role, self::PDF_NO_BORDER, 'C');
        }
    }
}
