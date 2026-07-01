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
    // Entrega por email: 'stub' no envía real; 'smtp' exige credenciales externas.
    'delivery_transport' => 'stub',
    // Placeholders ficticios SMTP: nunca subir valores reales a Git.
    'smtp_host' => 'smtp.example.edu.ar',
    'smtp_port' => 587,
    'smtp_username' => 'usuario_smtp_demo',
    'smtp_password' => 'clave_smtp_demo_no_real',
    'smtp_secure' => 'tls',
    'mail_from' => 'certificados@example.edu.ar',
    'mail_from_name' => 'IFTS 14 — Certificados',
];