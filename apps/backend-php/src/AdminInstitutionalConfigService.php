<?php

declare(strict_types=1);

require_once __DIR__ . '/AdminCertificateService.php';
require_once __DIR__ . '/InstitutionalConfig.php';
require_once __DIR__ . '/SystemParameters.php';

final class AdminInstitutionalConfigService
{
    public function __construct(
        private readonly PDO $pdo,
        private readonly string $requestId,
    ) {
    }

    /** @return array<string, mixed> */
    public function get(): array
    {
        $statement = $this->pdo->prepare(<<<'SQL'
            SELECT institucion_nombre, rector_nombre, rector_cargo, asesor_nombre, asesor_cargo, texto_certificado, updated_at
            FROM cert_configuracion_institucional
            WHERE id = 1
            LIMIT 1
            SQL);
        $statement->execute();
        $row = $statement->fetch();

        return $this->configDto($row, $this->loadParameters());
    }

    /** @param array<string, mixed> $body @return array<string, mixed> */
    public function update(array $body): array
    {
        if (!is_string($body['institutionName'] ?? null) || trim($body['institutionName']) === '') {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }

        InstitutionalConfig::assertRequestWithinDatabaseLimits($body);
        $paramWrites = SystemParameters::assertAndNormalizeWrite($body['parameters'] ?? null);

        $normalized = InstitutionalConfig::normalize([
            'institutionName' => $body['institutionName'] ?? null,
            'certificateText' => $body['certificateText'] ?? null,
            'rectorName' => $body['rectorName'] ?? null,
            'rectorRole' => $body['rectorRole'] ?? null,
            'advisorName' => $body['advisorName'] ?? null,
            'advisorRole' => $body['advisorRole'] ?? null,
        ]);

        $this->pdo->beginTransaction();
        try {
            $statement = $this->pdo->prepare(<<<'SQL'
                INSERT INTO cert_configuracion_institucional (
                  id, institucion_nombre, rector_nombre, rector_cargo, asesor_nombre, asesor_cargo, texto_certificado
                ) VALUES (1, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                  institucion_nombre = VALUES(institucion_nombre),
                  rector_nombre = VALUES(rector_nombre),
                  rector_cargo = VALUES(rector_cargo),
                  asesor_nombre = VALUES(asesor_nombre),
                  asesor_cargo = VALUES(asesor_cargo),
                  texto_certificado = VALUES(texto_certificado)
                SQL);
            $statement->execute([
                $normalized['institutionName'],
                $normalized['rectorName'] === '' ? null : $normalized['rectorName'],
                $normalized['rectorRole'] === '' ? null : $normalized['rectorRole'],
                $normalized['advisorName'] === '' ? null : $normalized['advisorName'],
                $normalized['advisorRole'] === '' ? null : $normalized['advisorRole'],
                $normalized['certificateText'] === '' ? null : $normalized['certificateText'],
            ]);

            if ($paramWrites !== []) {
                $upsert = $this->pdo->prepare(<<<'SQL'
                    INSERT INTO cert_parametros_sistema (clave, valor, tipo, grupo, etiqueta)
                    VALUES (?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                      valor = VALUES(valor),
                      updated_at = CURRENT_TIMESTAMP
                    SQL);
                foreach ($paramWrites as $clave => $valor) {
                    $meta = SystemParameters::CATALOG[$clave];
                    $upsert->execute([
                        $clave,
                        $valor,
                        $meta['type'],
                        $meta['group'],
                        $meta['label'],
                    ]);
                }
            }

            $this->pdo->commit();
        } catch (Throwable $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $e;
        }

        return $this->get();
    }

    /** @return array<string, string> */
    private function loadParameters(): array
    {
        try {
            $statement = $this->pdo->query(
                'SELECT clave, valor FROM cert_parametros_sistema'
            );
        } catch (PDOException) {
            // Tabla ausente (migración 013 pendiente): fallback a defaults del catálogo.
            return [];
        }

        $stored = [];
        foreach ($statement->fetchAll() as $row) {
            if (is_string($row['clave'] ?? null) && is_string($row['valor'] ?? null)) {
                $stored[$row['clave']] = $row['valor'];
            }
        }

        return $stored;
    }

    /**
     * @param array<string, string> $storedParams
     * @return array<string, mixed>
     */
    private function configDto(mixed $row, array $storedParams): array
    {
        $config = InstitutionalConfig::fromDatabaseRow(is_array($row) ? $row : null);

        return [
            'institutionName' => $config['institutionName'],
            'certificateText' => $config['certificateText'],
            'rectorName' => $config['rectorName'],
            'rectorRole' => $config['rectorRole'],
            'advisorName' => $config['advisorName'],
            'advisorRole' => $config['advisorRole'],
            'updatedAt' => is_array($row) && is_string($row['updated_at'] ?? null) ? $row['updated_at'] : null,
            'parameters' => SystemParameters::dtoFromStored($storedParams),
        ];
    }
}
