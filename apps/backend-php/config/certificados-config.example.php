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
];