<?php

declare(strict_types=1);

require_once __DIR__ . '/InstitutionalConfig.php';
require_once __DIR__ . '/SystemParameters.php';
require_once __DIR__ . '/AdminCertificateService.php';

final class AdminInstitutionalConfigService
{
    private const int MAX_BYTES = 1_048_576;
    private const int MAX_WIDTH = 1200;
    private const int MAX_HEIGHT = 400;

    /** @var array<string, array{filenameCol:string,hashCol:string,flag:string}> */
    private const array ROLES = [
        'rector' => [
            'filenameCol' => 'rector_firma_filename',
            'hashCol' => 'rector_firma_sha256',
            'flag' => 'rectorSignaturePresent',
        ],
        'asesor' => [
            'filenameCol' => 'asesor_firma_filename',
            'hashCol' => 'asesor_firma_sha256',
            'flag' => 'advisorSignaturePresent',
        ],
    ];

    public function __construct(
        private readonly PDO $pdo,
        private readonly string $requestId,
        private readonly ?string $signatureStoragePath = null,
    ) {
    }

    /** @return array<string, mixed> */
    public function get(): array
    {
        try {
            $statement = $this->pdo->prepare(<<<'SQL'
                SELECT institucion_nombre, rector_nombre, rector_cargo, asesor_nombre, asesor_cargo,
                       texto_certificado, updated_at,
                       rector_firma_filename, asesor_firma_filename
                FROM cert_configuracion_institucional
                WHERE id = 1
                LIMIT 1
                SQL);
            $statement->execute();
            $row = $statement->fetch();
        } catch (PDOException) {
            $statement = $this->pdo->prepare(<<<'SQL'
                SELECT institucion_nombre, rector_nombre, rector_cargo, asesor_nombre, asesor_cargo,
                       texto_certificado, updated_at
                FROM cert_configuracion_institucional
                WHERE id = 1
                LIMIT 1
                SQL);
            $statement->execute();
            $row = $statement->fetch();
        }

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
                try {
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
                } catch (PDOException) {
                    throw new AdminCertificateException(
                        500,
                        'CONFIGURATION_ERROR',
                        'No se pudo procesar la solicitud.',
                    );
                }
            }

            $this->pdo->commit();
        } catch (AdminCertificateException $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $e;
        } catch (Throwable $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $e;
        }

        return $this->get();
    }

    /**
     * @param array{tmp_name?:string,error?:int,size?:int,name?:string} $file
     * @return array<string, mixed>
     */
    public function uploadSignature(string $role, array $file): array
    {
        $meta = $this->roleMeta($role);
        $storage = $this->requireStoragePath();

        $error = $file['error'] ?? UPLOAD_ERR_NO_FILE;
        if (!is_int($error) || $error !== UPLOAD_ERR_OK) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }

        $tmp = $file['tmp_name'] ?? null;
        if (!is_string($tmp) || $tmp === '' || !is_uploaded_file($tmp)) {
            // Tests y CLI pueden pasar un archivo temporal local.
            if (!is_string($tmp) || $tmp === '' || !is_file($tmp) || !is_readable($tmp)) {
                throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
            }
        }

        $size = $file['size'] ?? filesize($tmp);
        if (!is_int($size) || $size <= 0 || $size > self::MAX_BYTES) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }

        $mime = $this->detectMime($tmp);
        $ext = match ($mime) {
            'image/png' => 'png',
            'image/jpeg' => 'jpg',
            default => null,
        };
        if ($ext === null) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }

        $dims = @getimagesize($tmp);
        if ($dims === false || !isset($dims[0], $dims[1])) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }
        if ((int) $dims[0] > self::MAX_WIDTH || (int) $dims[1] > self::MAX_HEIGHT) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }

        $basename = $role . '.' . $ext;
        $this->assertSafeBasename($basename);

        $sha256 = hash_file('sha256', $tmp);
        if (!is_string($sha256) || strlen($sha256) !== 64) {
            throw new AdminCertificateException(500, 'CONFIGURATION_ERROR', 'No se pudo procesar la solicitud.');
        }

        $previous = $this->currentFilename($meta['filenameCol']);
        $finalPath = $storage . '/' . $basename;
        $tmpPath = $finalPath . '.tmp';

        if (!is_dir($storage) && !@mkdir($storage, 0750, true) && !is_dir($storage)) {
            throw new AdminCertificateException(500, 'CONFIGURATION_ERROR', 'No se pudo procesar la solicitud.');
        }

        if (!@copy($tmp, $tmpPath)) {
            throw new AdminCertificateException(500, 'CONFIGURATION_ERROR', 'No se pudo procesar la solicitud.');
        }

        if (!@rename($tmpPath, $finalPath)) {
            @unlink($tmpPath);
            throw new AdminCertificateException(500, 'CONFIGURATION_ERROR', 'No se pudo procesar la solicitud.');
        }

        try {
            $sql = sprintf(
                'UPDATE cert_configuracion_institucional SET %s = ?, %s = ? WHERE id = 1',
                $meta['filenameCol'],
                $meta['hashCol'],
            );
            $statement = $this->pdo->prepare($sql);
            $statement->execute([$basename, $sha256]);
            if ($statement->rowCount() === 0) {
                // Asegurar fila id=1 si aún no existe.
                $insert = $this->pdo->prepare(<<<'SQL'
                    INSERT INTO cert_configuracion_institucional (
                      id, institucion_nombre, rector_nombre, rector_cargo, asesor_nombre, asesor_cargo, texto_certificado
                    ) VALUES (1, 'IFTS N.° 14', NULL, NULL, NULL, NULL, NULL)
                    ON DUPLICATE KEY UPDATE id = id
                    SQL);
                $insert->execute();
                $statement->execute([$basename, $sha256]);
            }
        } catch (Throwable $e) {
            // Falla DB: conservar archivo previo si el basename cambió; borrar el nuevo si no había previo.
            if ($previous === null || $previous !== $basename) {
                @unlink($finalPath);
            }
            throw new AdminCertificateException(500, 'CONFIGURATION_ERROR', 'No se pudo procesar la solicitud.');
        }

        if (is_string($previous) && $previous !== '' && $previous !== $basename) {
            $oldPath = $storage . '/' . $previous;
            if (is_file($oldPath)) {
                @unlink($oldPath);
            }
        }

        return $this->get();
    }

    /** @return array<string, mixed> */
    public function deleteSignature(string $role): array
    {
        $meta = $this->roleMeta($role);
        $storage = $this->requireStoragePath();
        $previous = $this->currentFilename($meta['filenameCol']);

        $sql = sprintf(
            'UPDATE cert_configuracion_institucional SET %s = NULL, %s = NULL WHERE id = 1',
            $meta['filenameCol'],
            $meta['hashCol'],
        );
        $this->pdo->prepare($sql)->execute();

        if (is_string($previous) && $previous !== '') {
            $this->assertSafeBasename($previous);
            $path = $storage . '/' . $previous;
            if (is_file($path)) {
                @unlink($path);
            }
        }

        return $this->get();
    }

    /**
     * @return array{bytes:string,mime:string,filename:string}
     */
    public function previewSignature(string $role): array
    {
        $meta = $this->roleMeta($role);
        $storage = $this->requireStoragePath();
        $filename = $this->currentFilename($meta['filenameCol']);

        if (!is_string($filename) || $filename === '') {
            throw new AdminCertificateException(404, 'NOT_FOUND', 'Firma no encontrada.');
        }

        $this->assertSafeBasename($filename);
        $path = $storage . '/' . $filename;
        if (!is_file($path) || !is_readable($path)) {
            throw new AdminCertificateException(404, 'NOT_FOUND', 'Firma no encontrada.');
        }

        $bytes = file_get_contents($path);
        if (!is_string($bytes) || $bytes === '') {
            throw new AdminCertificateException(404, 'NOT_FOUND', 'Firma no encontrada.');
        }

        $mime = $this->detectMime($path);
        if ($mime !== 'image/png' && $mime !== 'image/jpeg') {
            throw new AdminCertificateException(500, 'CONFIGURATION_ERROR', 'No se pudo procesar la solicitud.');
        }

        return [
            'bytes' => $bytes,
            'mime' => $mime,
            'filename' => $filename,
        ];
    }

    /** @return array{filenameCol:string,hashCol:string,flag:string} */
    private function roleMeta(string $role): array
    {
        if (!isset(self::ROLES[$role])) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }

        return self::ROLES[$role];
    }

    private function requireStoragePath(): string
    {
        if ($this->signatureStoragePath === null || $this->signatureStoragePath === '') {
            throw new AdminCertificateException(500, 'CONFIGURATION_ERROR', 'No se pudo procesar la solicitud.');
        }

        return $this->signatureStoragePath;
    }

    private function assertSafeBasename(string $basename): void
    {
        if (
            $basename === ''
            || str_contains($basename, '/')
            || str_contains($basename, '\\')
            || str_contains($basename, '..')
            || preg_match('/\A(rector|asesor)\.(png|jpg)\z/', $basename) !== 1
        ) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }
    }

    private function currentFilename(string $column): ?string
    {
        // Columna whitelisted desde ROLES.
        $sql = sprintf(
            'SELECT %s AS filename FROM cert_configuracion_institucional WHERE id = 1 LIMIT 1',
            $column,
        );
        try {
            $statement = $this->pdo->query($sql);
        } catch (PDOException) {
            throw new AdminCertificateException(500, 'CONFIGURATION_ERROR', 'No se pudo procesar la solicitud.');
        }

        $row = $statement->fetch();
        if (!is_array($row) || !is_string($row['filename'] ?? null) || $row['filename'] === '') {
            return null;
        }

        return $row['filename'];
    }

    private function detectMime(string $path): string
    {
        if (function_exists('finfo_open')) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            if ($finfo !== false) {
                $mime = finfo_file($finfo, $path);
                finfo_close($finfo);
                if (is_string($mime) && $mime !== '') {
                    return $mime;
                }
            }
        }

        $dims = @getimagesize($path);
        if (is_array($dims) && isset($dims['mime']) && is_string($dims['mime'])) {
            return $dims['mime'];
        }

        return 'application/octet-stream';
    }

    /** @return array<string, string> */
    private function loadParameters(): array
    {
        try {
            $statement = $this->pdo->query(
                'SELECT clave, valor FROM cert_parametros_sistema'
            );
        } catch (PDOException) {
            throw new AdminCertificateException(
                500,
                'CONFIGURATION_ERROR',
                'No se pudo procesar la solicitud.',
            );
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
        $rectorPresent = is_array($row)
            && is_string($row['rector_firma_filename'] ?? null)
            && $row['rector_firma_filename'] !== '';
        $advisorPresent = is_array($row)
            && is_string($row['asesor_firma_filename'] ?? null)
            && $row['asesor_firma_filename'] !== '';

        return [
            'institutionName' => $config['institutionName'],
            'certificateText' => $config['certificateText'],
            'rectorName' => $config['rectorName'],
            'rectorRole' => $config['rectorRole'],
            'advisorName' => $config['advisorName'],
            'advisorRole' => $config['advisorRole'],
            'rectorSignaturePresent' => $rectorPresent,
            'advisorSignaturePresent' => $advisorPresent,
            'updatedAt' => is_array($row) && is_string($row['updated_at'] ?? null) ? $row['updated_at'] : null,
            'parameters' => SystemParameters::dtoFromStored($storedParams),
        ];
    }
}
