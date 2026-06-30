<?php

declare(strict_types=1);

if (!interface_exists('LoggerInterface')) {
    interface LoggerInterface
    {
        /** @param array<string, mixed> $context */
        public function error(string $message, array $context = []): void;
    }
}

final class AdminCertificateException extends RuntimeException
{
    public function __construct(
        public readonly int $status,
        public readonly string $errorCode,
        string $message
    ) {
        parent::__construct($message);
    }
}

final class AdminCertificateService
{
    public function __construct(
        private readonly PDO $pdo,
        private readonly string $tokenPepper,
        private readonly string $requestId,
        private readonly ?LoggerInterface $logger = null,
        private readonly ?string $documentSalt = null,
        private readonly ?CertificatePdfService $pdfService = null,
        private readonly ?string $publicBaseUrl = null,
    ) {
    }

    /** @param array<string, mixed> $payload @return array<string, mixed> */
    public function emitir(array $payload): array
    {
        try {
            $data = $this->validatePayload($payload);
        } catch (AdminCertificateException $exception) {
            $this->safeAudit('emision', 'rechazado');
            throw $exception;
        }

        $documentHash = $this->hashDocument($data['documentNumber']);
        $documentMasked = $this->maskDocument($data['documentNumber']);
        unset($data['documentNumber']);

        $token = rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
        $tokenHash = hash('sha256', $token . $this->tokenPepper, true);
        $tokenPrefix = substr($token, 0, 12);
        $code = 'CERT-' . date('Y') . '-' . strtoupper(bin2hex(random_bytes(4)));

        try {
            $this->pdo->beginTransaction();
            $statement = $this->pdo->prepare(<<<'SQL'
                INSERT INTO cert_certificados (
                  codigo_certificado, estado, alumno_nombre_mostrar, documento_hash,
                  documento_enmascarado, curso_nombre, emitido_en, vence_en
                ) VALUES (?, 'vigente', ?, ?, ?, ?, ?, ?)
                SQL);
            $statement->bindValue(1, $code);
            $statement->bindValue(2, $data['studentDisplayName']);
            $statement->bindValue(3, $documentHash, PDO::PARAM_LOB);
            $statement->bindValue(4, $documentMasked);
            $statement->bindValue(5, $data['courseName']);
            $statement->bindValue(6, $data['issuedAt']);
            $statement->bindValue(7, $data['expiresAt']);
            $statement->execute();

            $id = (int) $this->pdo->lastInsertId();
            $statement = $this->pdo->prepare(<<<'SQL'
                INSERT INTO cert_tokens_verificacion (
                  certificado_id, token_hash, token_prefijo, estado, vigente_desde, vigente_hasta
                ) VALUES (?, ?, ?, 'activo', CURRENT_TIMESTAMP, ?)
                SQL);
            $statement->bindValue(1, $id, PDO::PARAM_INT);
            $statement->bindValue(2, $tokenHash, PDO::PARAM_LOB);
            $statement->bindValue(3, $tokenPrefix);
            $statement->bindValue(4, $data['expiresAt'] === null ? null : $data['expiresAt'] . ' 23:59:59');
            $statement->execute();

            $pdfPath = $this->generatePdfWithinTransaction($code, $documentMasked, $data, $token);

            $this->pdo->commit();
        } catch (AdminCertificateException $exception) {
            throw $exception;
        } catch (Throwable $exception) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            $this->safeAudit('emision', 'error');
            throw $exception;
        }

        $this->safeAudit('emision', 'ok', ['certificado_id' => $id, 'token_hash_prefijo' => substr(hash('sha256', $token . $this->tokenPepper), 0, 16)]);

        return [
            'id' => $id,
            'certificateCode' => $code,
            'status' => 'vigente',
            'student' => ['displayName' => $data['studentDisplayName'], 'documentMasked' => $documentMasked],
            'course' => ['name' => $data['courseName']],
            'issuedAt' => $data['issuedAt'],
            'expiresAt' => $data['expiresAt'],
            'tokenPrefix' => $tokenPrefix,
            'pdfDownloadUrl' => $this->buildPdfDownloadUrl($id),
        ];
    }

    /**
     * Genera el PDF dentro de la transacción antes del commit. Si falla, la
     * transacción se revierte en el catch del llamador y no queda certificado
     * emitido sin PDF. El token completo solo se usa acá para armar la URL del
     * QR y nunca se persiste ni se devuelve.
     *
     * @param array<string, mixed> $data Datos validados (sin documentNumber).
     * @throws RuntimeException Si el servicio PDF o el storage fallan.
     */
    private function generatePdfWithinTransaction(string $code, string $documentMasked, array $data, string $token): string
    {
        if ($this->pdfService === null || $this->publicBaseUrl === null) {
            throw new RuntimeException('Configuración PDF no disponible.');
        }

        $validationUrl = rtrim($this->publicBaseUrl, '/') . '/validar/' . $token;
        $viewData = [
            'certificateCode' => $code,
            'studentDisplayName' => $data['studentDisplayName'],
            'documentMasked' => $documentMasked,
            'courseName' => $data['courseName'],
            'issuedAt' => $data['issuedAt'],
            'expiresAt' => $data['expiresAt'] ?? '',
        ];

        $pdfPath = $this->pdfService->generate($code, $viewData, $validationUrl);

        if (!is_file($pdfPath)) {
            throw new RuntimeException('PDF no persistido.');
        }

        return $pdfPath;
    }

    private function buildPdfDownloadUrl(int $id): string
    {
        if ($this->publicBaseUrl === null) {
            return '';
        }

        return rtrim($this->publicBaseUrl, '/') . '/api/admin/certificados/' . $id . '/pdf';
    }

    /** @return array<string, mixed> */
    public function revocar(int|string $id, ?string $reason): array
    {
        $certificateId = filter_var($id, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if (!is_int($certificateId)) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }

        $reason = trim((string) $reason);
        $reason = $reason === '' ? null : mb_substr($reason, 0, 180);
        $revokedAt = (new DateTimeImmutable('now', new DateTimeZone('America/Argentina/Buenos_Aires')))->format('Y-m-d H:i:s');

        $this->pdo->beginTransaction();
        try {
            $statement = $this->pdo->prepare('UPDATE cert_certificados SET estado = \'revocado\', revocado_en = ?, motivo_revocacion = ? WHERE id = ? AND estado = \'vigente\'');
            $statement->execute([$revokedAt, $reason, $certificateId]);

            if ($statement->rowCount() !== 1) {
                $this->pdo->rollBack();
                $this->auditRejectedRevocation($certificateId);
            }

            $statement = $this->pdo->prepare('UPDATE cert_tokens_verificacion SET estado = \'revocado\', revocado_en = ? WHERE certificado_id = ? AND estado = \'activo\' AND revocado_en IS NULL');
            $statement->execute([$revokedAt, $certificateId]);
            $tokensRevoked = $statement->rowCount();
            $this->pdo->commit();
        } catch (AdminCertificateException $exception) {
            throw $exception;
        } catch (Throwable $exception) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            $this->safeAudit('revocacion', 'error', ['certificado_id' => $certificateId]);
            throw $exception;
        }

        $this->safeAudit('revocacion', 'ok', ['certificado_id' => $certificateId]);

        return ['id' => $certificateId, 'status' => 'revocado', 'revokedAt' => $revokedAt, 'tokensRevoked' => $tokensRevoked];
    }

    private function auditRejectedRevocation(int $certificateId): never
    {
        $statement = $this->pdo->prepare('SELECT estado FROM cert_certificados WHERE id = ? LIMIT 1');
        $statement->execute([$certificateId]);
        $status = $statement->fetchColumn();

        if ($status === false) {
            $this->safeAudit('revocacion', 'rechazado');
            throw new AdminCertificateException(404, 'CERTIFICATE_NOT_FOUND', 'Certificado no encontrado.');
        }

        $this->safeAudit('revocacion', 'rechazado', ['certificado_id' => $certificateId]);
        throw new AdminCertificateException(409, 'CERTIFICATE_NOT_REVOCABLE', 'Certificado no revocable.');
    }

    /** @param array<string, mixed> $meta */
    private function safeAudit(string $action, string $result, array $meta = []): void
    {
        try {
            $statement = $this->pdo->prepare(<<<'SQL'
                INSERT INTO cert_eventos_auditoria (
                  certificado_id, tipo_evento, resultado, request_id, token_hash_prefijo, ip_hash_prefijo, detalle_seguro
                ) VALUES (?, ?, ?, ?, ?, NULL, ?)
                SQL);
            $statement->execute([
                $meta['certificado_id'] ?? null,
                $action,
                $result,
                $this->requestId,
                $meta['token_hash_prefijo'] ?? null,
                $result === 'ok' ? 'Operación administrativa correcta.' : 'Operación administrativa rechazada.',
            ]);
        } catch (Throwable $exception) {
            $this->logger?->error('Falla de auditoría administrativa.', ['action' => $action, 'result' => $result]);
        }
    }

    /** @param array<string, mixed> $payload @return array{studentDisplayName:string,documentNumber:string,courseName:string,issuedAt:string,expiresAt:?string} */
    private function validatePayload(array $payload): array
    {
        $student = $this->requiredString($payload, 'studentDisplayName', 160);
        $document = $this->requiredString($payload, 'documentNumber', 20);
        $course = $this->requiredString($payload, 'courseName', 180);
        $issuedAt = $this->dateString($payload['issuedAt'] ?? null);
        $expiresAt = isset($payload['expiresAt']) && $payload['expiresAt'] !== '' ? $this->dateString($payload['expiresAt']) : null;

        $today = (new DateTimeImmutable('now', new DateTimeZone('America/Argentina/Buenos_Aires')))->format('Y-m-d');

        if (preg_match('/\A\d{6,12}\z/', $document) !== 1 || ($expiresAt !== null && ($expiresAt < $issuedAt || $expiresAt < $today))) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }

        return ['studentDisplayName' => $student, 'documentNumber' => $document, 'courseName' => $course, 'issuedAt' => $issuedAt, 'expiresAt' => $expiresAt];
    }

    /** @param array<string, mixed> $payload */
    private function requiredString(array $payload, string $key, int $max): string
    {
        $value = $payload[$key] ?? null;
        if (!is_string($value) || trim($value) === '' || mb_strlen(trim($value)) > $max) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }

        return trim($value);
    }

    private function dateString(mixed $value): string
    {
        if (!is_string($value) || preg_match('/\A\d{4}-\d{2}-\d{2}\z/', $value) !== 1) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }

        $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value);
        if (!$date instanceof DateTimeImmutable || $date->format('Y-m-d') !== $value) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }

        return $value;
    }

    private function maskDocument(string $document): string
    {
        return substr($document, 0, 2) . str_repeat('*', max(strlen($document) - 4, 0)) . substr($document, -2);
    }

    private function hashDocument(string $document): string
    {
        return hash_hmac('sha256', $document, $this->documentSalt ?? $this->tokenPepper, true);
    }
}
