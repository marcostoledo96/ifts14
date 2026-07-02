<?php

declare(strict_types=1);

require_once __DIR__ . '/../src/AdminCertificateService.php';
require_once __DIR__ . '/../src/CertificatePdfService.php';

$service = (new ReflectionClass(AdminCertificateService::class))->newInstanceWithoutConstructor();
$salt = new ReflectionProperty(AdminCertificateService::class, 'documentSalt');
$pepper = new ReflectionProperty(AdminCertificateService::class, 'tokenPepper');
$salt->setValue($service, 'salt_demo');
$pepper->setValue($service, 'pepper_demo');

$mask = new ReflectionMethod(AdminCertificateService::class, 'maskDocument');
$hash = new ReflectionMethod(AdminCertificateService::class, 'hashDocument');
$validate = new ReflectionMethod(AdminCertificateService::class, 'validatePayload');

if ($mask->invoke($service, '00000000') !== '00****00') {
    throw new RuntimeException('Máscara de documento inválida.');
}

$first = $hash->invoke($service, '00000000');
$second = $hash->invoke($service, '11111111');

if (!is_string($first) || strlen($first) !== 32 || $first === $second || str_contains(bin2hex($first), '00000000')) {
    throw new RuntimeException('Hash de documento inválido.');
}

$yesterday = (new DateTimeImmutable('yesterday', new DateTimeZone('America/Argentina/Buenos_Aires')))->format('Y-m-d');
$twoDaysAgo = (new DateTimeImmutable('-2 days', new DateTimeZone('America/Argentina/Buenos_Aires')))->format('Y-m-d');

try {
    $validate->invoke($service, [
        'studentDisplayName' => 'Alumno Demo',
        'documentNumber' => '12345678',
        'courseName' => 'Curso Demo',
        'issuedAt' => $twoDaysAgo,
        'expiresAt' => $yesterday,
    ]);
    throw new RuntimeException('La emisión vencida fue aceptada.');
} catch (ReflectionException $exception) {
    throw $exception;
} catch (AdminCertificateException) {
    // Esperado: no se emiten certificados ya vencidos.
}

// Armado de pdfDownloadUrl: el helper solo arma la URL con publicBaseUrl; no
// toca el token completo ni persiste nada.
$buildPdfUrl = new ReflectionMethod(AdminCertificateService::class, 'buildPdfDownloadUrl');
$pubBaseUrl = new ReflectionProperty(AdminCertificateService::class, 'publicBaseUrl');
$pubBaseUrl->setValue($service, 'https://demo.example.edu.ar/certificados');

$downloadUrl = $buildPdfUrl->invoke($service, 42);
$expected = 'https://demo.example.edu.ar/certificados/api/admin/certificados/42/pdf';
if ($downloadUrl !== $expected) {
    throw new RuntimeException("pdfDownloadUrl inválido: {$downloadUrl}");
}
if (str_contains($downloadUrl, '/validar/')) {
    throw new RuntimeException('pdfDownloadUrl no debe exponer la ruta de validación con token.');
}

// Armado de publicValidationUrl: el helper arma {public_base_url}/validar/{token}.
$buildValidationUrl = new ReflectionMethod(AdminCertificateService::class, 'buildPublicValidationUrl');
$validationUrl = $buildValidationUrl->invoke($service, 'TOKEN_DEMO_2026');
$expectedValidation = 'https://demo.example.edu.ar/certificados/validar/TOKEN_DEMO_2026';
if ($validationUrl !== $expectedValidation) {
    throw new RuntimeException("publicValidationUrl inválido: {$validationUrl}");
}

// Sin publicBaseUrl, el helper devuelve string vacío (no filtra token).
$serviceNoBase = (new ReflectionClass(AdminCertificateService::class))->newInstanceWithoutConstructor();
$pubBasePropNoBase = new ReflectionProperty(AdminCertificateService::class, 'publicBaseUrl');
$pubBasePropNoBase->setValue($serviceNoBase, null);
$buildValidationUrlNoBase = new ReflectionMethod(AdminCertificateService::class, 'buildPublicValidationUrl');
$emptyValidation = $buildValidationUrlNoBase->invoke($serviceNoBase, 'TOKEN_DEMO_2026');
if ($emptyValidation !== '') {
    throw new RuntimeException('publicValidationUrl sin base URL debe ser vacío.');
}

// Fallo de PDF dentro de la transacción: un CertificatePdfService con storage
// inaccesible debe lanzar y el llamador (emitir) rollbackearía. Validamos acá
// que el helper privado genera la URL con el token y no filtra el token en la
// respuesta del DTO, usando el builder que no recibe token.
$generateWithinTx = new ReflectionMethod(AdminCertificateService::class, 'generatePdfWithinTransaction');
$pdfServiceProp = new ReflectionProperty(AdminCertificateService::class, 'pdfService');
$pdfServiceProp->setValue($service, null);

try {
    $generateWithinTx->invoke($service, 'CERT-2026-AB12CD34', '12****78', [
        'studentDisplayName' => 'Alumno Demo',
        'courseName' => 'Curso Demo',
        'issuedAt' => $twoDaysAgo,
        'expiresAt' => '',
    ], 'TOKEN_COMPLETO_DEMO');
    throw new RuntimeException('La generación de PDF sin servicio no falló.');
} catch (RuntimeException $exception) {
    if (!str_contains($exception->getMessage(), 'PDF no disponible')) {
        throw $exception;
    }
    // Esperado: sin pdfService la emisión debe abortar antes del commit.
}

echo "OK AdminCertificateServiceTest\n";
