<?php

declare(strict_types=1);

/**
 * Cobertura runtime de regenerarPdf() sobre un fake PDO en memoria.
 *
 * Cubre:
 *  - 200 regenerado=true: PDF desactualizado → regenera, marca vigente,
 *    alinea revisiones, audita 'pdf_regenerado', devuelve datos de entrega.
 *  - 200 regenerado=false: PDF ya vigente y revisiones alineadas → no regenera.
 *  - 404 CERTIFICATE_NOT_FOUND: inexistente.
 *  - 404 CERTIFICATE_NOT_FOUND: no vigente (revocado).
 *  - 400 VALIDATION_ERROR: id no numérico.
 *  - Auditoría: el evento 'pdf_regenerado' se inserta solo cuando regenera.
 */

require_once __DIR__ . '/../src/TokenCipher.php';
require_once __DIR__ . '/../src/DniCipher.php';
require_once __DIR__ . '/../src/InstitutionalConfig.php';
require_once __DIR__ . '/../src/AdminCertificateService.php';
require_once __DIR__ . '/../src/CertificatePdfService.php';

// --- Fake PDO en memoria para regeneración ---
final class FakePdoForRegen extends PDO
{
    /** @var array<int, array<string, mixed>> */
    public array $certs = [];
    /** @var array<int, array<string, mixed>> */
    public array $tokens = [];
    /** @var array<int, array<string, mixed>> */
    public array $alumnos = [];
    /** @var array<int, array<string, mixed>> */
    public array $fechas = [];
    /** @var array<int, array<string, mixed>> */
    public array $config = [];
    /** @var array<int, array<string, mixed>> */
    public array $audits = [];
    public bool $inTx = false;

    public function __construct()
    {
    }

    public function beginTransaction(): bool
    {
        $this->inTx = true;
        return true;
    }

    public function commit(): bool
    {
        $this->inTx = false;
        return true;
    }

    public function rollBack(): bool
    {
        $this->inTx = false;
        return true;
    }

    public function inTransaction(): bool
    {
        return $this->inTx;
    }

    public function prepare(string $query, array $options = []): PDOStatement|false
    {
        return new FakeStmtForRegen($query, $this);
    }

    public function seedCert(
        int $id,
        string $estado,
        string $codigo,
        string $pdfEstado,
        int $contenidoRevision,
        ?int $pdfGeneradoRevision,
        int $alumnoId = 1,
        string $alumnoNombre = 'Alumno Demo',
        string $cursoNombre = 'Curso Demo',
        string $emitidoEn = '2026-01-01',
        ?string $venceEn = '2027-12-31',
    ): void {
        $this->certs[$id] = [
            'id' => $id,
            'estado' => $estado,
            'vence_en' => $venceEn,
            'revocado_en' => null,
            'codigo_certificado' => $codigo,
            'pdf_estado' => $pdfEstado,
            'contenido_revision' => $contenidoRevision,
            'pdf_generado_revision' => $pdfGeneradoRevision,
            'alumno_nombre_mostrar' => $alumnoNombre,
            'curso_nombre' => $cursoNombre,
            'emitido_en' => $emitidoEn,
            'alumno_id' => $alumnoId,
        ];
    }

    public function seedToken(int $certId, string $prefix, ?string $tokenCipher): void
    {
        $this->tokens[] = [
            'certificado_id' => $certId,
            'token_prefijo' => $prefix,
            'token_cifrado' => $tokenCipher,
            'estado' => 'activo',
            'revocado_en' => null,
            'vigente_desde' => date('Y-m-d H:i:s', strtotime('-1 hour')),
            'vigente_hasta' => null,
        ];
    }

    public function seedAlumno(int $id, string $dniCipher): void
    {
        $this->alumnos[$id] = ['id' => $id, 'dni_cifrado' => $dniCipher];
    }

    public function seedFecha(int $certId, string $fecha, int $orden): void
    {
        $this->fechas[] = [
            'certificado_id' => $certId,
            'fecha' => $fecha,
            'descripcion' => null,
            'orden' => $orden,
        ];
    }

    public function seedConfig(): void
    {
        $this->config = [[
            'institucion_nombre' => 'IFTS 14 Demo',
            'rector_nombre' => 'Rector Demo',
            'rector_cargo' => 'Rector',
            'asesor_nombre' => 'Asesor Demo',
            'asesor_cargo' => 'Asesor',
            'texto_certificado' => 'Ha aprobado el curso',
        ]];
    }

    /** SELECT de regeneración: cert + token activo + campos de revisión/PDF. */
    public function selectCertWithTokenForRegen(int $id): array|false
    {
        if (!isset($this->certs[$id])) {
            return false;
        }
        $cert = $this->certs[$id];
        $vigente = $cert['vence_en'] === null || (string) $cert['vence_en'] >= date('Y-m-d');
        $tokenCipher = null;
        $tokenPrefix = '';
        foreach ($this->tokens as $tok) {
            if ((int) $tok['certificado_id'] !== $id) {
                continue;
            }
            if (($tok['estado'] ?? '') !== 'activo') {
                continue;
            }
            if ($tok['revocado_en'] !== null) {
                continue;
            }
            $now = time();
            $desde = strtotime((string) ($tok['vigente_desde'] ?? 'now'));
            if ($desde !== false && $desde > $now) {
                continue;
            }
            $hasta = $tok['vigente_hasta'];
            if ($hasta !== null) {
                $hastaTs = strtotime((string) $hasta);
                if ($hastaTs !== false && $hastaTs < $now) {
                    continue;
                }
            }
            $tokenCipher = $tok['token_cifrado'];
            $tokenPrefix = (string) $tok['token_prefijo'];
            break;
        }
        return [
            'id' => $cert['id'],
            'estado' => $cert['estado'],
            'vence_en' => $cert['vence_en'],
            'vence_en_vigente' => $vigente ? 1 : 0,
            'cert_revocado_en' => $cert['revocado_en'],
            'codigo_certificado' => $cert['codigo_certificado'],
            'pdf_estado' => $cert['pdf_estado'],
            'contenido_revision' => $cert['contenido_revision'],
            'pdf_generado_revision' => $cert['pdf_generado_revision'],
            'alumno_nombre_mostrar' => $cert['alumno_nombre_mostrar'],
            'curso_nombre' => $cert['curso_nombre'],
            'emitido_en' => $cert['emitido_en'],
            'alumno_id' => $cert['alumno_id'],
            'token_prefijo' => $tokenPrefix,
            'token_cifrado' => $tokenCipher,
        ];
    }
}

final class FakeStmtForRegen extends PDOStatement
{
    /** @var list<mixed> */
    private array $bindings = [];
    /** @var array<string, mixed>|false */
    private array|false $result = false;
    private int $fetchCall = 0;

    public function __construct(
        private readonly string $query,
        private readonly FakePdoForRegen $pdo,
    ) {
    }

    public function bindValue(string|int $param, mixed $value, int $type = PDO::PARAM_STR): bool
    {
        $this->bindings[$param] = $value;
        return true;
    }

    public function execute(?array $params = null): bool
    {
        if ($params !== null) {
            foreach ($params as $i => $value) {
                $this->bindings[$i + 1] = $value;
            }
        }
        $this->dispatch();
        return true;
    }

    public function fetch(int $mode = PDO::FETCH_DEFAULT, int $orientation = PDO::FETCH_ORI_NEXT, int $offset = 0): mixed
    {
        // Para queries que devuelven múltiples filas (loadCertificateSnapshotDates,
        // loadInstitutionalConfig), usamos fetch secuencial. Para los demás,
        // devolvemos el resultado único.
        if (str_contains($this->query, 'cert_certificado_fechas')) {
            $certId = (int) $this->bindings[1];
            $rows = array_values(array_filter($this->pdo->fechas, fn($f) => (int) $f['certificado_id'] === $certId));
            usort($rows, fn($a, $b) => $a['orden'] <=> $b['orden']);
            $idx = $this->fetchCall;
            $this->fetchCall++;
            return $idx < count($rows) ? $rows[$idx] : false;
        }
        return $this->result;
    }

    public function fetchColumn(int $column = 0): mixed
    {
        return $this->result === false ? false : array_values($this->result)[$column] ?? false;
    }

    private function dispatch(): void
    {
        // SELECT c.id, c.estado ... (loadRegenerationData)
        if (str_contains($this->query, 'SELECT c.id, c.estado') && str_contains($this->query, 'contenido_revision')) {
            $id = (int) $this->bindings[1];
            $this->result = $this->pdo->selectCertWithTokenForRegen($id);
            return;
        }

        // SELECT dni_cifrado FROM cert_alumnos
        if (str_contains($this->query, 'SELECT dni_cifrado FROM cert_alumnos')) {
            $alumnoId = (int) $this->bindings[1];
            $this->result = $this->pdo->alumnos[$alumnoId] ?? false;
            return;
        }

        // SELECT institucion_nombre ... (loadInstitutionalConfig)
        if (str_contains($this->query, 'SELECT institucion_nombre')) {
            $this->result = $this->pdo->config[0] ?? false;
            return;
        }

        // UPDATE cert_certificados SET pdf_estado
        if (str_contains($this->query, 'UPDATE cert_certificados') && str_contains($this->query, 'pdf_estado')) {
            $id = (int) $this->bindings[1];
            if (isset($this->pdo->certs[$id])) {
                $this->pdo->certs[$id]['pdf_estado'] = 'vigente';
                $this->pdo->certs[$id]['pdf_generado_revision'] = $this->pdo->certs[$id]['contenido_revision'];
            }
            $this->result = false;
            return;
        }

        // INSERT INTO cert_eventos_auditoria (safeAudit)
        if (str_contains($this->query, 'INSERT INTO cert_eventos_auditoria')) {
            $this->pdo->audits[] = [
                'certificado_id' => $this->bindings[1] ?? null,
                'tipo_evento' => $this->bindings[2] ?? null,
                'resultado' => $this->bindings[3] ?? null,
                'request_id' => $this->bindings[4] ?? null,
            ];
            $this->result = false;
            return;
        }

        $this->result = false;
    }
}

// Extensión del helper selectCertWithToken para regeneración (incluye campos extra).
// Se define como método dinámico en el scope del test para evitar duplicar lógica.
// ponytail: agregamos el método al fake PDO via closure binding.
FakePdoForRegen::class; // ensure class loaded

// Clave de 32 bytes para los tests.
$validKey = str_repeat('k', 32);
$dniKey = str_repeat('d', 32);

// Helper: arma AdminCertificateService con reflection sobre el fake PDO.
function buildRegenService(FakePdoForRegen $pdo, string $cipherKey, string $dniKey, string $pdfStoragePath): AdminCertificateService
{
    $service = (new ReflectionClass(AdminCertificateService::class))->newInstanceWithoutConstructor();
    $props = [
        'tokenPepper' => 'pepper_demo_regen',
        'requestId' => 'req_test_regen',
        'publicBaseUrl' => 'https://demo.example.edu.ar/certificados',
        'tokenCipherKey' => $cipherKey,
        'pdfStoragePath' => $pdfStoragePath,
        'dniCipherKey' => $dniKey,
        'signatureStoragePath' => null,
    ];
    foreach ($props as $name => $value) {
        $prop = new ReflectionProperty(AdminCertificateService::class, $name);
        $prop->setValue($service, $value);
    }
    // CertificatePdfService necesita storagePath válido; pasamos un dir temporal.
    $pdfService = new CertificatePdfService($pdfStoragePath);
    $pdfProp = new ReflectionProperty(AdminCertificateService::class, 'pdfService');
    $pdfProp->setValue($service, $pdfService);

    $pdoProp = new ReflectionProperty(AdminCertificateService::class, 'pdo');
    $pdoProp->setValue($service, $pdo);

    return $service;
}

// Helper: crea un storage temporal.
function seedPdfDirRegen(): string
{
    $dir = sys_get_temp_dir() . '/ifts14-regen-pdf-' . bin2hex(random_bytes(4));
    if (!@mkdir($dir, 0700, true) && !is_dir($dir)) {
        throw new RuntimeException('No se pudo crear storage temporal.');
    }
    return $dir;
}

// Helper: factory de fake PDO fresco para regeneración.
function makeRegenPdo(): FakePdoForRegen
{
    return new FakePdoForRegen();
}

// =====================================================
// Escenario 1: regeneración exitosa (PDF desactualizado)
// =====================================================
$pdo = makeRegenPdo();
$pdo->seedConfig();
$pdo->seedCert(10, 'vigente', 'CERT-2026-REGEN1', 'desactualizado', 2, 1);
$demoToken = 'TOKEN_DEMO_REGEN_2026';
$tokenCipher = TokenCipher::encrypt($demoToken, $validKey);
$pdo->seedToken(10, 'REGEN_PREFIX_', $tokenCipher);
$dniCipher = DniCipher::encrypt('12345678', $dniKey);
$pdo->seedAlumno(1, $dniCipher);
$pdo->seedFecha(10, '2026-01-10', 1);
$pdo->seedFecha(10, '2026-01-17', 2);
$pdfDir = seedPdfDirRegen();

$service = buildRegenService($pdo, $validKey, $dniKey, $pdfDir);
$result = $service->regenerarPdf(10);

if (($result['regenerado'] ?? null) !== true) {
    throw new RuntimeException('Escenario 1: regenerado debe ser true.');
}
if (!isset($result['publicValidationUrl']) || !str_ends_with($result['publicValidationUrl'], $demoToken)) {
    throw new RuntimeException('Escenario 1: publicValidationUrl inválida: ' . ($result['publicValidationUrl'] ?? 'null'));
}
if (!isset($result['pdfDownloadUrl']) || !str_contains($result['pdfDownloadUrl'], '/api/admin/certificados/10/pdf')) {
    throw new RuntimeException('Escenario 1: pdfDownloadUrl inválida.');
}
if (($result['pdfStatus'] ?? '') !== 'vigente') {
    throw new RuntimeException('Escenario 1: pdfStatus debe ser vigente.');
}

// El PDF se generó en disco.
$expectedPath = $pdfDir . '/CERT-2026-REGEN1.pdf';
if (!is_file($expectedPath)) {
    throw new RuntimeException('Escenario 1: PDF no se generó en disco.');
}

// El registro se actualizó.
if ($pdo->certs[10]['pdf_estado'] !== 'vigente') {
    throw new RuntimeException('Escenario 1: pdf_estado no se actualizó a vigente.');
}
if ((int) $pdo->certs[10]['pdf_generado_revision'] !== 2) {
    throw new RuntimeException('Escenario 1: pdf_generado_revision no se alineó con contenido_revision.');
}

// Auditoría: se insertó evento 'pdf_regenerado' con resultado 'ok'.
$auditFound = false;
foreach ($pdo->audits as $a) {
    if (($a['tipo_evento'] ?? '') === 'pdf_regenerado' && ($a['resultado'] ?? '') === 'ok' && (int) ($a['certificado_id'] ?? 0) === 10) {
        $auditFound = true;
        break;
    }
}
if (!$auditFound) {
    throw new RuntimeException('Escenario 1: no se insertó auditoría pdf_regenerado/ok.');
}

@unlink($expectedPath);
@rmdir($pdfDir);

// =====================================================
// Escenario 2: PDF ya vigente y alineado → regenerado=false
// =====================================================
$pdo2 = makeRegenPdo();
$pdo2->seedConfig();
$pdo2->seedCert(20, 'vigente', 'CERT-2026-REGEN2', 'vigente', 3, 3);
$pdo2->seedToken(20, 'VIGENTE_PREFIX_', $tokenCipher);
$pdo2->seedAlumno(1, $dniCipher);
$pdo2->seedFecha(20, '2026-02-01', 1);
$pdfDir2 = seedPdfDirRegen();

$service2 = buildRegenService($pdo2, $validKey, $dniKey, $pdfDir2);
$result2 = $service2->regenerarPdf(20);

if (($result2['regenerado'] ?? null) !== false) {
    throw new RuntimeException('Escenario 2: regenerado debe ser false.');
}
if (($result2['mensaje'] ?? '') !== 'El PDF ya está actualizado.') {
    throw new RuntimeException('Escenario 2: mensaje inválido: ' . ($result2['mensaje'] ?? 'null'));
}
// No se insertó auditoría (no regeneró).
if (count($pdo2->audits) !== 0) {
    throw new RuntimeException('Escenario 2: no debió insertar auditoría.');
}

@rmdir($pdfDir2);

// =====================================================
// Escenario 3: 404 CERTIFICATE_NOT_FOUND — inexistente
// =====================================================
$pdo3 = makeRegenPdo();
$pdo3->seedConfig();
$pdfDir3 = seedPdfDirRegen();
$service3 = buildRegenService($pdo3, $validKey, $dniKey, $pdfDir3);
$got404 = false;
try {
    $service3->regenerarPdf(999);
} catch (AdminCertificateException $e) {
    $got404 = $e->status === 404 && $e->errorCode === 'CERTIFICATE_NOT_FOUND';
}
if (!$got404) {
    throw new RuntimeException('Escenario 3: inexistente no respondió 404.');
}
@rmdir($pdfDir3);

// =====================================================
// Escenario 4: 404 CERTIFICATE_NOT_FOUND — revocado
// =====================================================
$pdo4 = makeRegenPdo();
$pdo4->seedConfig();
$pdo4->seedCert(40, 'revocado', 'CERT-2026-REGEN4', 'vigente', 1, 1);
$pdo4->certs[40]['revocado_en'] = date('Y-m-d H:i:s');
$pdo4->seedToken(40, 'REV_PREFIX_', $tokenCipher);
$pdo4->seedAlumno(1, $dniCipher);
$pdfDir4 = seedPdfDirRegen();
$service4 = buildRegenService($pdo4, $validKey, $dniKey, $pdfDir4);
$got404Rev = false;
try {
    $service4->regenerarPdf(40);
} catch (AdminCertificateException $e) {
    $got404Rev = $e->status === 404 && $e->errorCode === 'CERTIFICATE_NOT_FOUND';
}
if (!$got404Rev) {
    throw new RuntimeException('Escenario 4: revocado no respondió 404.');
}
@rmdir($pdfDir4);

// =====================================================
// Escenario 5: 400 VALIDATION_ERROR — id no numérico
// =====================================================
$pdo5 = makeRegenPdo();
$pdo5->seedConfig();
$pdfDir5 = seedPdfDirRegen();
$service5 = buildRegenService($pdo5, $validKey, $dniKey, $pdfDir5);
$got400 = false;
try {
    $service5->regenerarPdf('abc');
} catch (AdminCertificateException $e) {
    $got400 = $e->status === 400 && $e->errorCode === 'VALIDATION_ERROR';
}
if (!$got400) {
    throw new RuntimeException('Escenario 5: id no numérico no respondió 400.');
}
@rmdir($pdfDir5);

echo "OK RegenerarPdfTest\n";