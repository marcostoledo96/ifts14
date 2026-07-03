<?php

declare(strict_types=1);

require_once __DIR__ . '/../src/AdminMasterDataService.php';

$service = (new ReflectionClass(AdminMasterDataService::class))->newInstanceWithoutConstructor();
$mask = new ReflectionMethod(AdminMasterDataService::class, 'maskDni');
$hash = new ReflectionMethod(AdminMasterDataService::class, 'hashDni');

if ($mask->invoke($service, '00000000') !== '00****00') {
    throw new RuntimeException('Máscara de DNI inválida.');
}

$dniHash = $hash->invoke($service, '00000000');
if (!is_string($dniHash) || strlen($dniHash) !== 32) {
    throw new RuntimeException('Hash de DNI inválido.');
}

$key = str_repeat('d', 32);
$envelope = DniCipher::encrypt('00000000', $key);
if (!DniCipher::envelopeLooksValid($envelope) || DniCipher::decrypt($envelope, $key) !== '00000000') {
    throw new RuntimeException('Envelope DNI inválido.');
}

echo "OK AdminMasterDataServiceTest\n";
