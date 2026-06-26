<?php

declare(strict_types=1);

require_once __DIR__ . '/../src/AdminCertificateService.php';

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

echo "OK AdminCertificateServiceTest\n";
