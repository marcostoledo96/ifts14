<?php

declare(strict_types=1);

// Ejemplo ficticio: no usar en producción.
return [
    'db_host' => 'localhost',
    'db_name' => 'ifts14_certificados_demo',
    'db_user' => 'usuario_demo',
    'db_pass' => 'clave_demo_no_real',
    'token_pepper' => 'pepper_demo_ficticio_2026_no_usar',
    // Base pública absoluta usada para armar la URL del QR: {public_base_url}/validar/{token}.
    'public_base_url' => 'https://demo.example.edu.ar/certificados',
    // Ruta absoluta del storage de PDFs, preferentemente fuera del webroot.
    'certificate_storage_path' => '/home/usuario_demo/certificados_storage_demo',
    // Ruta absoluta del storage de firmas de autoridades (PNG/JPEG), fuera del webroot.
    'signature_storage_path' => '/home/usuario_demo/certificados_firmas_demo',
    // Clave de cifrado de tokens (AES-256-GCM). DEBE ser externa a Git en
    // producción: inyectarla por config externa, nunca versionar el valor real.
    // Debe decodificar (base64/base64url) exactamente a 32 bytes.
    // Placeholder: generar fuera de Git, por ejemplo con:
    // php -r "echo base64_encode(random_bytes(32)), PHP_EOL;"
    'token_encryption_key' => 'REEMPLAZAR_CON_CLAVE_BASE64_DE_32_BYTES',
    // Clave de cifrado de DNI (AES-256-GCM). Mismas reglas que token_encryption_key.
    'dni_cipher_key' => 'REEMPLAZAR_CON_CLAVE_DNI_BASE64_DE_32_BYTES',
    // Credenciales de sesión admin: generar hash con PASSWORD_DEFAULT fuera de Git.
    // Placeholder inválido a propósito: Config::adminSessionSettings() lo rechaza
    // hasta reemplazarlo (nunca usar hashes públicos conocidos tipo "password").
    'admin_username' => 'REEMPLAZAR_CON_USUARIO_ADMIN_EXTERNO',
    'admin_password_hash' => 'REEMPLAZAR_CON_HASH_PASSWORD_DEFAULT',
    'admin_session_idle_seconds' => 1800,
    'admin_session_absolute_seconds' => 28800,
    // Compatibilidad exclusiva CLI; queda deshabilitada y no autoriza HTTP.
    'admin_legacy_key_enabled' => false,
    'admin_legacy_key' => '',
    'admin_legacy_key_expires_at' => '',
];
