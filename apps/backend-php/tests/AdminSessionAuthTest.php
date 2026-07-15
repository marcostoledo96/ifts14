<?php

declare(strict_types=1);

require_once __DIR__ . '/../src/AdminSessionAuth.php';

$password = 'password-demo-auth';
$config = [
    'admin_username' => 'bedelia',
    'admin_password_hash' => password_hash($password, PASSWORD_DEFAULT),
    'admin_session_idle_seconds' => 1800,
    'admin_session_absolute_seconds' => 28800,
];

$production = AdminSessionAuth::settings($config, '/certificados');
if ($production === null || $production['name'] !== 'ifts14_cert_admin' || $production['path'] !== '/certificados/' || $production['lifetime'] !== 0 || !$production['secure'] || !$production['httponly'] || $production['samesite'] !== 'Strict') {
    throw new RuntimeException('La cookie de producción no respeta el contrato.');
}

$staging = AdminSessionAuth::settings($config, '/certificados_staging');
if ($staging === null || $staging['name'] !== 'ifts14_cert_stg_admin' || $staging['path'] !== '/certificados_staging/') {
    throw new RuntimeException('La cookie de staging no respeta el contrato.');
}

if (!AdminSessionAuth::credentialsValid($config, 'bedelia', $password) || AdminSessionAuth::credentialsValid($config, 'otra', $password) || AdminSessionAuth::credentialsValid($config, 'bedelia', 'incorrecta')) {
    throw new RuntimeException('La validación de credenciales no falla cerrada.');
}

$invalidTtlConfig = $config;
$invalidTtlConfig['admin_session_idle_seconds'] = 1;
if (AdminSessionAuth::settings([], '/certificados') !== null || AdminSessionAuth::settings($invalidTtlConfig, '/certificados') !== null) {
    throw new RuntimeException('La configuración inválida no falló cerrada.');
}

$csrf = AdminSessionAuth::csrfToken();
if (preg_match('/\A[A-Za-z0-9_-]{43}\z/', $csrf) !== 1 || !AdminSessionAuth::csrfValid(['csrfToken' => $csrf], $csrf) || AdminSessionAuth::csrfValid(['csrfToken' => $csrf], 'incorrecto')) {
    throw new RuntimeException('El token CSRF no cumple el contrato.');
}

$active = ['authenticated' => true, 'createdAt' => 100, 'lastSeen' => 200];
if (!AdminSessionAuth::sessionIsActive($active, $config, 1999) || AdminSessionAuth::sessionIsActive($active, $config, 2000) || AdminSessionAuth::sessionIsActive($active, $config, 28900)) {
    throw new RuntimeException('La vigencia de sesión no respeta idle/absolute.');
}

echo "OK AdminSessionAuthTest\n";
