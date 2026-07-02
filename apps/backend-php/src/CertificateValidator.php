<?php

declare(strict_types=1);

require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/DniCipher.php';

final class CertificateValidator
{
    private const string TOKEN_PATTERN = '/\A[A-Za-z0-9_-]{32,128}\z/';

    /** @param array<string, mixed> $config */
    public function __construct(
        private readonly array $config,
        private readonly ?string $dniCipherKey = null,
    )
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
        $snapshotDates = $this->loadSnapshotDates($pdo, $certificateId);
        $isNewCertificate = $row['alumno_id'] !== null && $row['curso_id'] !== null;

        if ($isNewCertificate && $snapshotDates === []) {
            $this->audit($certificateId, 'rechazado', $requestId, $hashPrefix, 'Certificado no verificable.');

            return [
                'status' => 404,
                'error' => [
                    'code' => 'CERTIFICATE_NOT_FOUND',
                    'message' => 'No se pudo validar el certificado.',
                ],
            ];
        }

        $student = [
            'displayName' => (string) $row['alumno_nombre_mostrar'],
            'documentMasked' => (string) $row['documento_enmascarado'],
        ];
        $course = [
            'name' => (string) $row['curso_nombre'],
            'issuedAt' => (string) $row['emitido_en'],
        ];

        if ($isNewCertificate) {
            try {
                $documentNumber = $this->decryptDocumentNumber($this->readLobAsString($row['dni_cifrado'] ?? null));
            } catch (RuntimeException) {
                $this->audit($certificateId, 'error', $requestId, $hashPrefix, 'Error técnico de verificación.');

                return [
                    'status' => 500,
                    'error' => [
                        'code' => 'CONFIGURATION_ERROR',
                        'message' => 'No se pudo procesar la solicitud.',
                    ],
                ];
            }
            $student = [
                'displayName' => (string) $row['alumno_nombre_mostrar'],
                'documentNumber' => $documentNumber,
            ];
            $course['attendedDates'] = array_map(static fn (array $date): string => $date['fecha'], $snapshotDates);
        }

        $this->audit($certificateId, 'ok', $requestId, $hashPrefix, 'Verificación pública correcta.');

        return [
            'status' => 200,
            'data' => [
                'valid' => true,
                'status' => 'vigente',
                'certificateCode' => (string) $row['codigo_certificado'],
                'student' => $student,
                'course' => $course,
                'verifiedAt' => (new DateTimeImmutable('now', new DateTimeZone('America/Argentina/Buenos_Aires')))->format(DATE_ATOM),
            ],
        ];
    }

    /** @return array<string, mixed>|null */
    private function findCertificate(PDO $pdo, string $hashBinary): ?array
    {
        $statement = $pdo->prepare(<<<'SQL'
            SELECT c.id, c.alumno_id, c.curso_id, c.codigo_certificado,
                   c.alumno_nombre_mostrar, c.documento_enmascarado,
                   c.curso_nombre, c.emitido_en, a.dni_cifrado
            FROM cert_tokens_verificacion t
            JOIN cert_certificados c ON c.id = t.certificado_id
            LEFT JOIN cert_alumnos a ON a.id = c.alumno_id
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

    /** @return list<array{fecha:string,descripcion:?string,orden:int}> */
    private function loadSnapshotDates(PDO $pdo, int $certificateId): array
    {
        $statement = $pdo->prepare(<<<'SQL'
            SELECT fecha, descripcion, orden
            FROM cert_certificado_fechas
            WHERE certificado_id = ?
            ORDER BY orden, fecha
            SQL);
        $statement->execute([$certificateId]);

        $dates = [];
        while (($row = $statement->fetch()) !== false) {
            $dates[] = [
                'fecha' => (string) $row['fecha'],
                'descripcion' => is_string($row['descripcion'] ?? null) ? $row['descripcion'] : null,
                'orden' => (int) $row['orden'],
            ];
        }

        return $dates;
    }

    private function decryptDocumentNumber(?string $dniCipher): string
    {
        if ($this->dniCipherKey === null || strlen($this->dniCipherKey) !== 32 || !DniCipher::envelopeLooksValid($dniCipher)) {
            throw new RuntimeException('DNI cipher unavailable.');
        }

        return DniCipher::decrypt($dniCipher, $this->dniCipherKey);
    }

    private function readLobAsString(mixed $lob): ?string
    {
        if ($lob === null || is_string($lob)) {
            return $lob;
        }

        if (is_resource($lob)) {
            $contents = stream_get_contents($lob);
            return is_string($contents) ? $contents : null;
        }

        return null;
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
