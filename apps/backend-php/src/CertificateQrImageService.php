<?php

declare(strict_types=1);

final class CertificateQrImageService
{
    public function render(string $publicValidationUrl): string
    {
        if ($publicValidationUrl === '' || !function_exists('imagecreate')) {
            throw new RuntimeException('No se pudo generar el QR.');
        }

        if (!class_exists('TCPDF2DBarcode')) {
            require_once __DIR__ . '/../vendor/tecnickcom/tcpdf/tcpdf_barcodes_2d.php';
        }

        $barcode = new TCPDF2DBarcode($publicValidationUrl, 'QRCODE,M');
        $png = $barcode->getBarcodePngData(8, 8, [0, 0, 0]);

        if (!is_string($png) || $png === '') {
            throw new RuntimeException('No se pudo generar el QR.');
        }

        return $png;
    }
}
