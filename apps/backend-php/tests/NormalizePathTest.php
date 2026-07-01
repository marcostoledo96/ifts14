<?php

declare(strict_types=1);

// Test procedural de normalizePath() vía servidor embebido PHP.
// Verifica que un único router acepte los prefijos de producción, staging y
// PHP embebido, resolviendo todos a /health (200) sin requerir Composer ni DB.
// Sigue el patrón de HttpContractTest.php.
// No hace require de index.php: el servidor embebido (proc_open) carga el router
// en un proceso aparte, evitando ejecutar el router top-level en el proceso de test.

$root = dirname(__DIR__);
$port = random_int(20000, 20999);
$process = proc_open([
    PHP_BINARY,
    '-S',
    '127.0.0.1:' . $port,
    '-t',
    $root,
    $root . '/index.php',
], [['pipe', 'r'], ['pipe', 'w'], ['pipe', 'w']], $pipes, $root);

if (!is_resource($process)) {
    throw new RuntimeException('No se pudo iniciar el servidor embebido.');
}

try {
    waitForServer($port);

    // normalizePath() debe quitar cada prefijo y resolver a /health.
    $prefixes = [
        '/certificados/api/health',
        '/certificados_staging/api/health',
        '/index.php/health',
        '/health',
    ];

    foreach ($prefixes as $path) {
        $response = request($port, 'GET', $path);
        assertStatus($response, 200, $path);
        $body = json_decode($response['body'], true);
        $status = $body['data']['status'] ?? $body['status'] ?? '';
        $service = $body['data']['service'] ?? $body['service'] ?? '';
        if ($status !== 'ok' || $service !== 'certificados-api') {
            throw new RuntimeException("{$path}: respuesta de health inválida.");
        }
    }

    // Ruta no existente debe seguir dando 404 (el router no enruta nada raro).
    $notFound = request($port, 'GET', '/no-existe');
    assertStatus($notFound, 404, '/no-existe');
} finally {
    proc_terminate($process);
    proc_close($process);
}

echo "OK NormalizePathTest\n";

function waitForServer(int $port): void
{
    for ($attempt = 0; $attempt < 50; $attempt++) {
        $socket = @stream_socket_client('tcp://127.0.0.1:' . $port, $errno, $error, 0.1);
        if (is_resource($socket)) {
            fclose($socket);
            return;
        }
        usleep(100000);
    }

    throw new RuntimeException('El servidor embebido no respondió.');
}

/** @return array{status:int,headers:array<string,string>,body:string} */
function request(int $port, string $method, string $path): array
{
    $context = stream_context_create(['http' => [
        'method' => $method,
        'ignore_errors' => true,
    ]]);
    $contents = file_get_contents('http://127.0.0.1:' . $port . $path, false, $context);
    if ($contents === false) {
        throw new RuntimeException($path . ': request fallido.');
    }

    $statusLine = $http_response_header[0] ?? '';
    preg_match('/\s(\d{3})\s/', $statusLine, $matches);
    $parsedHeaders = [];
    foreach ($http_response_header ?? [] as $line) {
        if (str_contains($line, ':')) {
            [$name, $value] = explode(':', $line, 2);
            $parsedHeaders[strtolower(trim($name))] = trim($value);
        }
    }

    return ['status' => (int) ($matches[1] ?? 0), 'headers' => $parsedHeaders, 'body' => $contents];
}

/** @param array{status:int,headers:array<string,string>,body:string} $response */
function assertStatus(array $response, int $expected, string $label): void
{
    if ($response['status'] !== $expected) {
        throw new RuntimeException("{$label}: HTTP esperado {$expected}, recibido {$response['status']}.");
    }
}