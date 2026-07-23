<?php

declare(strict_types=1);

/**
 * Router de prueba: inyecta PDO fake (estado JSON) antes de index.php.
 * Usado solo por InstitutionalSignatureHttpTest (sin MariaDB).
 */

$statePath = getenv('IFTS14_SIG_HTTP_STATE');
if (!is_string($statePath) || $statePath === '' || !is_file($statePath)) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo '{"error":{"code":"CONFIGURATION_ERROR","message":"state missing"}}';

    return true;
}

/** @var array<string, mixed> $row */
$row = json_decode((string) file_get_contents($statePath), true);
if (!is_array($row)) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo '{"error":{"code":"CONFIGURATION_ERROR","message":"state invalid"}}';

    return true;
}

final class SigHttpFakePdo extends PDO
{
    /** @param array<string, mixed> $row */
    public function __construct(public array $row, private readonly string $statePath)
    {
    }

    public function prepare(string $query, array $options = []): PDOStatement|false
    {
        return new SigHttpFakeStmt($query, $this);
    }

    public function query(string $query, ?int $fetchMode = null, mixed ...$fetchModeArgs): PDOStatement|false
    {
        return new SigHttpFakeStmt($query, $this);
    }

    public function persist(): void
    {
        file_put_contents($this->statePath, json_encode($this->row, JSON_THROW_ON_ERROR));
    }
}

final class SigHttpFakeStmt extends PDOStatement
{
    /** @var list<mixed> */
    private array $bindings = [];

    public function __construct(
        private readonly string $query,
        private readonly SigHttpFakePdo $pdo,
    ) {
    }

    public function execute(?array $params = null): bool
    {
        if ($params !== null) {
            $this->bindings = array_values($params);
        }

        if (str_starts_with(ltrim($this->query), 'UPDATE') && str_contains($this->query, 'firma')) {
            if (str_contains($this->query, 'rector_firma_filename') && str_contains($this->query, 'NULL')) {
                $this->pdo->row['rector_firma_filename'] = null;
                $this->pdo->row['rector_firma_sha256'] = null;
            } elseif (str_contains($this->query, 'asesor_firma_filename') && str_contains($this->query, 'NULL')) {
                $this->pdo->row['asesor_firma_filename'] = null;
                $this->pdo->row['asesor_firma_sha256'] = null;
            } elseif (str_contains($this->query, 'rector_firma_filename') && isset($this->bindings[0])) {
                $this->pdo->row['rector_firma_filename'] = $this->bindings[0];
                $this->pdo->row['rector_firma_sha256'] = $this->bindings[1] ?? null;
            } elseif (str_contains($this->query, 'asesor_firma_filename') && isset($this->bindings[0])) {
                $this->pdo->row['asesor_firma_filename'] = $this->bindings[0];
                $this->pdo->row['asesor_firma_sha256'] = $this->bindings[1] ?? null;
            }
            $this->pdo->persist();
        }

        return true;
    }

    public function fetch(int $mode = PDO::FETCH_DEFAULT, int $orientation = PDO::FETCH_ORI_NEXT, int $offset = 0): mixed
    {
        if (str_contains($this->query, 'AS filename')) {
            if (str_contains($this->query, 'asesor_firma_filename')) {
                return ['filename' => $this->pdo->row['asesor_firma_filename'] ?? null];
            }

            return ['filename' => $this->pdo->row['rector_firma_filename'] ?? null];
        }
        if (str_contains($this->query, 'FROM cert_configuracion_institucional')) {
            return $this->pdo->row;
        }

        return false;
    }

    public function fetchAll(int $mode = PDO::FETCH_DEFAULT, ...$args): array
    {
        return [];
    }

    public function rowCount(): int
    {
        return 1;
    }
}

require_once dirname(__DIR__) . '/src/Database.php';

$pdo = new SigHttpFakePdo($row, $statePath);
$ref = new ReflectionClass(Database::class);
$prop = $ref->getProperty('pdo');
$prop->setValue(null, $pdo);

require dirname(__DIR__) . '/index.php';

return true;
