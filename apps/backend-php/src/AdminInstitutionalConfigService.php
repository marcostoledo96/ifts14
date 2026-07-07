<?php

declare(strict_types=1);

require_once __DIR__ . '/AdminCertificateService.php';
require_once __DIR__ . '/InstitutionalConfig.php';

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

        return $this->configDto($row);
    }

    /** @param array<string, mixed> $body @return array<string, mixed> */
    public function update(array $body): array
    {
        if (!is_string($body['institutionName'] ?? null) || trim($body['institutionName']) === '') {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }

        InstitutionalConfig::assertRequestWithinDatabaseLimits($body);

        $normalized = InstitutionalConfig::normalize([
            'institutionName' => $body['institutionName'] ?? null,
            'certificateText' => $body['certificateText'] ?? null,
            'rectorName' => $body['rectorName'] ?? null,
            'rectorRole' => $body['rectorRole'] ?? null,
            'advisorName' => $body['advisorName'] ?? null,
            'advisorRole' => $body['advisorRole'] ?? null,
        ]);

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

        return $this->get();
    }

    /** @return array<string, mixed> */
    private function configDto(mixed $row): array
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
        ];
    }
}
