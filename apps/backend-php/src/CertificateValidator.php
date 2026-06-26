<?php

declare(strict_types=1);

require_once __DIR__ . '/Database.php';

final class CertificateValidator
{
    private const string TOKEN_PATTERN = '/\A[A-Za-z0-9_-]{32,128}\z/';

    /** @param array<string, mixed> $config */
    public function __construct(private readonly array $config)
    {
    }

    /** @return array{status:int,data?:array<string,mixed>,error?:array{code:string,message:string}} */
    public function verify(string $token, string $requestId): array
    {
        $token = trim($token);

        if (preg_match(self::TOKEN_PATTERN, $token) !== 1) {
            $this->audit(null, 'rechazado', $requestId, null, 'Formato de token inválido.');

            return [
                'status' => 400,
                'error' => [
                    'code' => 'VALIDATION_ERROR',
                    'message' => 'Token inválido.',
                ],
            ];
        }

        $tokenPepper = (string) $this->config['token_pepper'];
        $hashBinary = hash('sha256', $token . $tokenPepper, true);
        $hashPrefix = substr(hash('sha256', $token . $tokenPepper), 0, 16);

        try {
            $pdo = Database::pdo($this->config);
            $row = $this->findCertificate($pdo, $hashBinary);
        } catch (Throwable $exception) {
            $this->audit(null, 'error', $requestId, $hashPrefix, 'Error técnico de verificación.');
            throw $exception;
        }

        if ($row === null) {
            $this->audit(null, 'rechazado', $requestId, $hashPrefix, 'Certificado no verificable.');

            return [
                'status' => 404,
                'error' => [
                    'code' => 'CERTIFICATE_NOT_FOUND',
                    'message' => 'No se pudo validar el certificado.',
                ],
            ];
        }

        $certificateId = (int) $row['id'];
        $this->audit($certificateId, 'ok', $requestId, $hashPrefix, 'Verificación pública correcta.');

        return [
            'status' => 200,
            'data' => [
                'valid' => true,
                'status' => 'vigente',
                'certificateCode' => (string) $row['codigo_certificado'],
                'student' => [
                    'displayName' => (string) $row['alumno_nombre_mostrar'],
                    'documentMasked' => (string) $row['documento_enmascarado'],
                ],
                'course' => [
                    'name' => (string) $row['curso_nombre'],
                    'issuedAt' => (string) $row['emitido_en'],
                ],
                'verifiedAt' => (new DateTimeImmutable('now', new DateTimeZone('America/Argentina/Buenos_Aires')))->format(DATE_ATOM),
            ],
        ];
    }

    /** @return array<string, mixed>|null */
    private function findCertificate(PDO $pdo, string $hashBinary): ?array
    {
        $statement = $pdo->prepare(<<<'SQL'
            SELECT c.id, c.codigo_certificado, c.alumno_nombre_mostrar,
                   c.documento_enmascarado, c.curso_nombre, c.emitido_en
            FROM cert_tokens_verificacion t
            JOIN cert_certificados c ON c.id = t.certificado_id
            WHERE t.token_hash = ?
              AND t.estado = 'activo'
              AND t.revocado_en IS NULL
              AND t.vigente_desde <= CURRENT_TIMESTAMP
              AND (t.vigente_hasta IS NULL OR t.vigente_hasta >= CURRENT_TIMESTAMP)
              AND c.estado = 'vigente'
              AND c.revocado_en IS NULL
              AND (c.vence_en IS NULL OR c.vence_en >= CURRENT_DATE)
            LIMIT 1
            SQL);
        $statement->bindValue(1, $hashBinary, PDO::PARAM_LOB);
        $statement->execute();

        $row = $statement->fetch();

        return is_array($row) ? $row : null;
    }

    private function audit(?int $certificateId, string $result, string $requestId, ?string $hashPrefix, string $detail): void
    {
        try {
            $statement = Database::pdo($this->config)->prepare(<<<'SQL'
                INSERT INTO cert_eventos_auditoria (
                  certificado_id,
                  tipo_evento,
                  resultado,
                  request_id,
                  token_hash_prefijo,
                  ip_hash_prefijo,
                  detalle_seguro
                ) VALUES (?, 'verificacion', ?, ?, ?, NULL, ?)
                SQL);
            $statement->execute([$certificateId, $result, $requestId, $hashPrefix, $detail]);
        } catch (Throwable) {
            return;
        }
    }
}
