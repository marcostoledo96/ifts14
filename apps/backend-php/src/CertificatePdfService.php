<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/tecnickcom/tcpdf/tcpdf.php';
require_once __DIR__ . '/../vendor/tecnickcom/tcpdf/tcpdf_barcodes_2d.php';
require_once __DIR__ . '/InstitutionalConfig.php';

/**
 * Generación y persistencia del PDF de un certificado con QR de validación.
 *
 * Layout alineado al certificado institucional (apaisado, fondo celeste,
 * copy oficial). El token completo nunca entra a este servicio: solo recibe
 * la URL pública ya armada por el llamador ({public_base_url}/validar/{token}).
 */
final class CertificatePdfService
{
    private const float PAGE_W = 297.0;
    private const float PAGE_H = 210.0;
    private const float MARGIN_X = 22.0;
    private const float CONTENT_WIDTH = 253.0;
    private const int PDF_NO_BORDER = 0;
    private const int PDF_NEXT_LINE = 1;
    private const int QR_PADDING = 0;
    private const array QR_FOREGROUND_COLOR = [0, 0, 0];
    private const array BG_RGB = [238, 246, 251];
    private const array CIRCUIT_RGB = [0, 168, 198];
    private const array INK_RGB = [11, 31, 51];
    private const array TECH_BLUE_RGB = [0, 102, 178];
    private const float SIGNATORY_WIDTH = 70.0;
    private const float SIGNATORY_Y = 148.0;
    private const float RECTOR_X = 28.0;
    private const float ADVISOR_X = 198.0;
    private const float QR_X = 128.0;
    private const float QR_Y = 142.0;
    private const float QR_SIZE = 28.0;

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
        $tcpdf->setMargins(self::MARGIN_X, 14, self::MARGIN_X, true);
        $tcpdf->AddPage('L');

        $this->paintBackground($tcpdf);
        $this->paintDecorations($tcpdf);

        $tcpdf->setTextColor(...self::INK_RGB);
        $tcpdf->setY(18);
        $tcpdf->setFont('times', 'B', 28);
        $tcpdf->Cell(0, 12, 'CERTIFICADO', self::PDF_NO_BORDER, self::PDF_NEXT_LINE, 'C');

        $intro = trim((string) ($institutionalConfig['certificateText'] ?? ''));
        if ($intro === '') {
            $intro = 'El Instituto de Formación Técnica Superior N.º 14 (IFTS 14) que integra la Dirección de Educación Técnica Superior, Agencia de Habilidades para el Futuro, certifica que:';
        }

        $tcpdf->setFont('helvetica', '', 10);
        $tcpdf->setY(34);
        $tcpdf->MultiCell(self::CONTENT_WIDTH, 5, $intro, self::PDF_NO_BORDER, 'C', false, 1, self::MARGIN_X);

        $tcpdf->setFont('times', 'B', 20);
        $tcpdf->Ln(3);
        $tcpdf->MultiCell(self::CONTENT_WIDTH, 8, $this->visibleText($viewData['studentDisplayName'] ?? ''), self::PDF_NO_BORDER, 'C', false, 1, self::MARGIN_X);

        $tcpdf->setDrawColor(...self::INK_RGB);
        $lineY = $tcpdf->GetY() + 1;
        $tcpdf->Line(self::MARGIN_X + 40, $lineY, self::PAGE_W - self::MARGIN_X - 40, $lineY);

        $tcpdf->setY($lineY + 2);
        $tcpdf->setFont('helvetica', '', 9);
        $tcpdf->setTextColor(90, 100, 110);
        $tcpdf->MultiCell(
            self::CONTENT_WIDTH,
            5,
            'D.N.I. ' . $this->visibleText($viewData['documentNumber'] ?? ''),
            self::PDF_NO_BORDER,
            'C',
            false,
            1,
            self::MARGIN_X,
        );

        $courseName = $this->visibleText($viewData['courseName'] ?? '');
        $body = 'Ha aprobado el curso de formación profesional “' . $courseName . '”, conforme al registro de asistencia auditado.';
        $tcpdf->setTextColor(...self::INK_RGB);
        $tcpdf->setFont('helvetica', '', 10);
        $tcpdf->Ln(2);
        $tcpdf->MultiCell(self::CONTENT_WIDTH, 5, $body, self::PDF_NO_BORDER, 'C', false, 1, self::MARGIN_X);

        $attendedDates = $this->attendedDatesText($viewData['attendedDates'] ?? []);
        if ($attendedDates !== '') {
            $tcpdf->setFont('helvetica', '', 9);
            $tcpdf->MultiCell(
                self::CONTENT_WIDTH,
                4.5,
                'Fechas asistidas: ' . $attendedDates,
                self::PDF_NO_BORDER,
                'C',
                false,
                1,
                self::MARGIN_X,
            );
        }

        $tcpdf->Ln(1);
        $tcpdf->setFont('helvetica', '', 10);
        $tcpdf->MultiCell(
            self::CONTENT_WIDTH,
            5,
            'Se extiende el presente certificado a solicitud del/la interesado/a, para constancia de su aprobación.',
            self::PDF_NO_BORDER,
            'C',
            false,
            1,
            self::MARGIN_X,
        );

        $issuedAt = $this->visibleText($viewData['issuedAt'] ?? '');
        $lugar = $issuedAt !== ''
            ? 'Ciudad Autónoma de Buenos Aires, ' . $issuedAt . '.'
            : 'Ciudad Autónoma de Buenos Aires.';
        $tcpdf->MultiCell(self::CONTENT_WIDTH, 5, $lugar, self::PDF_NO_BORDER, 'C', false, 1, self::MARGIN_X);

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

        // QR centrado entre firmas (como el folio web).
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

        $tcpdf->setFont('helvetica', '', 7);
        $tcpdf->setTextColor(...self::TECH_BLUE_RGB);
        $tcpdf->setXY(self::QR_X - 18, self::QR_Y + self::QR_SIZE + 1);
        $tcpdf->MultiCell(64, 3.5, 'VALIDACIÓN DIGITAL', self::PDF_NO_BORDER, 'C');
        $tcpdf->setTextColor(90, 100, 110);
        $tcpdf->setX(self::QR_X - 18);
        $tcpdf->MultiCell(64, 3.5, 'N.° ' . $this->visibleText($certificateCode), self::PDF_NO_BORDER, 'C');

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

    private function paintBackground(TCPDF $tcpdf): void
    {
        $tcpdf->SetFillColor(...self::BG_RGB);
        $tcpdf->Rect(0, 0, self::PAGE_W, self::PAGE_H, 'F');
    }

    private function paintDecorations(TCPDF $tcpdf): void
    {
        $tcpdf->SetFillColor(...self::CIRCUIT_RGB);
        $tcpdf->SetDrawColor(...self::CIRCUIT_RGB);

        // Trama de puntos (esquina superior izquierda).
        for ($r = 0; $r < 7; $r++) {
            for ($c = 0; $c < 9; $c++) {
                $fade = 1 - ($c / 9) * 0.7 - ($r / 7) * 0.7;
                if ($fade <= 0.08) {
                    continue;
                }
                $tcpdf->SetAlpha($fade * 0.55);
                $tcpdf->Circle(8 + $c * 3.2, 8 + $r * 3.2, 0.85, 0, 360, 'F');
            }
        }
        $tcpdf->SetAlpha(1);

        // Trazas de circuito inferiores.
        $tcpdf->SetAlpha(0.35);
        $tcpdf->SetLineWidth(0.35);
        $tcpdf->Line(6, 150, 6, 190);
        $tcpdf->Line(6, 190, 18, 202);
        $tcpdf->Line(18, 202, 18, 210);
        $tcpdf->Line(14, 165, 28, 165);
        $tcpdf->Line(22, 180, 36, 180);
        $tcpdf->Circle(6, 150, 0.7, 0, 360, 'F');
        $tcpdf->Circle(18, 202, 0.7, 0, 360, 'F');
        $tcpdf->Circle(28, 165, 0.7, 0, 360, 'F');

        $tcpdf->Line(self::PAGE_W - 8, 155, self::PAGE_W - 8, 195);
        $tcpdf->Line(self::PAGE_W - 8, 195, self::PAGE_W - 22, 208);
        $tcpdf->Line(self::PAGE_W - 30, 170, self::PAGE_W - 14, 170);
        $tcpdf->Circle(self::PAGE_W - 8, 155, 0.7, 0, 360, 'F');
        $tcpdf->Circle(self::PAGE_W - 22, 208, 0.7, 0, 360, 'F');
        $tcpdf->SetAlpha(1);
        $tcpdf->SetLineWidth(0.2);
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
        float $x,
        float $y,
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
            $boxW = self::SIGNATORY_WIDTH - 10;
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

        $tcpdf->setTextColor(...self::INK_RGB);
        if (!$imageDrawn) {
            $tcpdf->SetDrawColor(...self::INK_RGB);
            $tcpdf->Line($x, $y, $x + self::SIGNATORY_WIDTH, $y);
        }

        $tcpdf->setXY($x, $y + 2);
        $tcpdf->setFont('helvetica', 'B', 10);
        $tcpdf->MultiCell(self::SIGNATORY_WIDTH, 5, $name, self::PDF_NO_BORDER, 'C');
        if ($role !== '') {
            $tcpdf->setX($x);
            $tcpdf->setFont('helvetica', '', 8);
            $tcpdf->setTextColor(90, 100, 110);
            $tcpdf->MultiCell(self::SIGNATORY_WIDTH, 4, $role, self::PDF_NO_BORDER, 'C');
            $tcpdf->setTextColor(...self::INK_RGB);
        }
    }
}
