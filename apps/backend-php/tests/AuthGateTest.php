<?php

declare(strict_types=1);

require_once __DIR__ . '/../src/AuthGate.php';

$password = 'password-demo-auth';
$legacyKey = 'legacy_demo_key_2026';
$config = [
    'admin_username' => 'bedelia',
    'admin_password_hash' => password_hash($password, PASSWORD_DEFAULT),
    'admin_session_idle_seconds' => 14400,
    'admin_session_absolute_seconds' => 28800,
    'admin_legacy_key_enabled' => true,
    'admin_legacy_key' => $legacyKey,
    'admin_legacy_key_expires_at' => '2030-01-01T00:00:00Z',
];

expectHttpDenied($config, ['HTTP_X_ADMIN_KEY' => $legacyKey], 'header HTTP nunca autoriza');

if (!AuthGate::requireLegacyCli($legacyKey, $config, 1_700_000_000)) {
    throw new RuntimeException('Legacy CLI válido fue rechazado.');
}

$disabled = $config;
$disabled['admin_legacy_key_enabled'] = false;
if (AuthGate::requireLegacyCli($legacyKey, $disabled, 1_700_000_000)) {
    throw new RuntimeException('Legacy deshabilitado autorizó.');
}

$expired = $config;
$expired['admin_legacy_key_expires_at'] = '2020-01-01T00:00:00Z';
if (AuthGate::requireLegacyCli($legacyKey, $expired, 1_700_000_000) || AuthGate::requireLegacyCli('corta', $config, 1_700_000_000)) {
    throw new RuntimeException('Legacy vencido o corto autorizó.');
}

echo "OK AuthGateTest\n";

/** @param array<string, mixed> $config @param array<string, mixed> $server */
function expectHttpDenied(array $config, array $server, string $label): void
{
    ob_start();
    try {
        AuthGate::requireHttpSession($config, $server, 'req_test', false);
    } catch (UnauthorizedException) {
        $json = ob_get_clean() ?: '';
        $body = json_decode($json, true);
        if (($body['error']['code'] ?? '') !== 'UNAUTHORIZED' || str_contains($json, 'legacy_demo_key')) {
            throw new RuntimeException("{$label}: respuesta insegura.");
        }
        return;
    }

    ob_end_clean();
    throw new RuntimeException("{$label}: se esperaba rechazo.");
}
