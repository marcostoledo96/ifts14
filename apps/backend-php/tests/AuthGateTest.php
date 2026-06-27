<?php

declare(strict_types=1);

require_once __DIR__ . '/../src/AuthGate.php';

$validKey = 'clave_demo_segura_2026';
$shortKey = 'clave_demo';

expectAllowed(['admin_api_key' => $validKey], ['HTTP_X_ADMIN_KEY' => $validKey]);
expectDenied(['admin_api_key' => $validKey], [], 'header faltante');
expectDenied(['admin_api_key' => $validKey], ['HTTP_X_ADMIN_KEY' => 'otra'], 'header inválido');
expectDenied(['admin_api_key' => ''], ['HTTP_X_ADMIN_KEY' => $validKey], 'config vacía');
expectDenied(['admin_api_key' => $shortKey], ['HTTP_X_ADMIN_KEY' => $shortKey], 'config corta');

echo "OK AuthGateTest\n";

/** @param array<string, mixed> $config @param array<string, mixed> $server */
function expectAllowed(array $config, array $server): void
{
    AuthGate::requireAdmin($config, $server, 'req_test');
}

/** @param array<string, mixed> $config @param array<string, mixed> $server */
function expectDenied(array $config, array $server, string $label): void
{
    ob_start();
    try {
        AuthGate::requireAdmin($config, $server, 'req_test');
    } catch (UnauthorizedException) {
        $json = ob_get_clean() ?: '';
        $body = json_decode($json, true);
        if (($body['error']['code'] ?? '') !== 'UNAUTHORIZED' || str_contains($json, 'clave_demo')) {
            throw new RuntimeException("{$label}: respuesta insegura.");
        }
        return;
    }

    ob_end_clean();
    throw new RuntimeException("{$label}: se esperaba rechazo.");
}
