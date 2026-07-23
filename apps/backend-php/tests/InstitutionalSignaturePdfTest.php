<?php

declare(strict_types=1);

/**
 * RED/GREEN: PDF con imagen de firma vs fallback tipográfico; PDF previo intacto.
 * Ejecutar: php apps/backend-php/tests/InstitutionalSignaturePdfTest.php
 */

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../src/InstitutionalConfig.php';
require_once __DIR__ . '/../src/CertificatePdfService.php';

function assertTrue(bool $cond, string $msg): void
{
    if (!$cond) {
        fwrite(STDERR, "FAIL: {$msg}\n");
        exit(1);
    }
    echo "OK: {$msg}\n";
}

$pdfDir = sys_get_temp_dir() . '/ifts14-pdf-firmas-' . bin2hex(random_bytes(4));
$sigDir = sys_get_temp_dir() . '/ifts14-sig-pdf-' . bin2hex(random_bytes(4));
mkdir($pdfDir, 0700, true);
mkdir($sigDir, 0700, true);

$svc = new CertificatePdfService($pdfDir);

$viewBase = [
    'studentDisplayName' => 'Alumno Demo',
    'courseName' => 'Curso Demo',
    'documentNumber' => '30111222',
    'issuedAt' => '2026-07-01',
    'expiresAt' => null,
    'attendedDates' => [['fecha' => '2026-06-01']],
    'institutionalConfig' => InstitutionalConfig::normalize([
        'institutionName' => 'IFTS Test',
        'certificateText' => 'Texto certificado demo.',
        'rectorName' => 'Rectora Demo',
        'rectorRole' => 'Rectora',
        'advisorName' => 'Asesora Demo',
        'advisorRole' => 'Asesora',
    ]),
];

// PDF tipográfico (sin archivo)
$pathTypo = $svc->generate('CERT-TYPO-001', $viewBase, 'https://example.invalid/validar/tokendemo');
assertTrue(is_file($pathTypo) && filesize($pathTypo) > 500, 'PDF tipográfico generado');
$typoBytes = file_get_contents($pathTypo);
assertTrue(is_string($typoBytes) && str_starts_with($typoBytes, '%PDF'), 'PDF tipográfico magia %PDF');

// Firma imagen presente
$sigPath = $sigDir . '/rector.png';
$im = imagecreatetruecolor(300, 80);
$bg = imagecolorallocate($im, 255, 255, 255);
imagefill($im, 0, 0, $bg);
imagepng($im, $sigPath);
imagedestroy($im);

$viewImg = $viewBase;
$viewImg['institutionalConfig'] = InstitutionalConfig::normalize([
    'institutionName' => 'IFTS Test',
    'certificateText' => 'Texto certificado demo.',
    'rectorName' => 'Rectora Demo',
    'rectorRole' => 'Rectora',
    'advisorName' => 'Asesora Demo',
    'advisorRole' => 'Asesora',
    'rectorSignaturePath' => $sigPath,
]);

$pathImg = $svc->generate('CERT-IMG-001', $viewImg, 'https://example.invalid/validar/tokendemo2');
assertTrue(is_file($pathImg) && filesize($pathImg) > 500, 'PDF con imagen de firma generado');
$imgBytes = file_get_contents($pathImg);
assertTrue(is_string($imgBytes) && str_starts_with($imgBytes, '%PDF'), 'PDF con imagen magia %PDF');
assertTrue(strlen($imgBytes) !== strlen($typoBytes), 'PDF con imagen difiere del tipográfico');

// PDF previo intacto tras nueva generación
$mtimeBefore = filemtime($pathTypo);
$sizeBefore = filesize($pathTypo);
clearstatcache();
usleep(20000);
$svc->generate('CERT-IMG-002', $viewImg, 'https://example.invalid/validar/tokendemo3');
clearstatcache();
assertTrue(filemtime($pathTypo) === $mtimeBefore && filesize($pathTypo) === $sizeBefore, 'PDF tipográfico previo intacto');
assertTrue(file_get_contents($pathTypo) === $typoBytes, 'Contenido PDF previo sin cambios');

foreach ([$pathTypo, $pathImg, $pdfDir . '/CERT-IMG-002.pdf', $sigPath] as $f) {
    if (is_file($f)) {
        @unlink($f);
    }
}
@rmdir($pdfDir);
@rmdir($sigDir);

echo "InstitutionalSignaturePdfTest: PASS\n";
exit(0);
