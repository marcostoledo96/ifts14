<?php

declare(strict_types=1);

require_once __DIR__ . '/../src/AdminMasterDataService.php';

$service = (new ReflectionClass(AdminMasterDataService::class))->newInstanceWithoutConstructor();
$hash = new ReflectionMethod(AdminMasterDataService::class, 'hashDni');
$order = new ReflectionMethod(AdminMasterDataService::class, 'courseDateOrder');
$email = new ReflectionMethod(AdminMasterDataService::class, 'optionalEmail');

$key = str_repeat('d', 32);

if ($email->invoke($service, null) !== null || $email->invoke($service, '') !== null) {
    throw new RuntimeException('Email opcional vacío inválido.');
}
if ($email->invoke($service, 'demo@example.invalid') !== 'demo@example.invalid') {
    throw new RuntimeException('Email opcional válido rechazado.');
}
try {
    $email->invoke($service, 'no-es-email');
    throw new RuntimeException('Email inválido aceptado.');
} catch (ReflectionException|AdminCertificateException) {
}
$dniHash = $hash->invoke($service, '00000000', $key);
if (!is_string($dniHash) || strlen($dniHash) !== 32) {
    throw new RuntimeException('Hash de DNI inválido.');
}
if ($dniHash === hash('sha256', '00000000', true) || $dniHash !== $hash->invoke($service, '00000000', $key)) {
    throw new RuntimeException('HMAC de DNI inválido.');
}

$envelope = DniCipher::encrypt('00000000', $key);
if (!DniCipher::envelopeLooksValid($envelope) || DniCipher::decrypt($envelope, $key) !== '00000000') {
    throw new RuntimeException('Envelope DNI inválido.');
}

if ($order->invoke($service, 1) !== 1 || $order->invoke($service, 65535) !== 65535) {
    throw new RuntimeException('Orden de fecha válido rechazado.');
}
foreach ([0, 65536] as $invalidOrder) {
    try {
        $order->invoke($service, $invalidOrder);
        throw new RuntimeException('Orden de fecha inválido aceptado.');
    } catch (ReflectionException|AdminCertificateException) {
    }
}

echo "OK AdminMasterDataServiceTest\n";
