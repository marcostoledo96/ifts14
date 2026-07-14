<?php

declare(strict_types=1);

require_once __DIR__ . '/TokenCipher.php';
require_once __DIR__ . '/DniCipher.php';
require_once __DIR__ . '/InstitutionalConfig.php';

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
        private readonly ?string $tokenCipherKey = null,
        private readonly ?string $pdfStoragePath = null,
        private readonly ?string $dniCipherKey = null,
    ) {
    }

    /** @param array<string, mixed> $payload @return array<string, mixed> */
    public function emitir(array $payload): array
    {
        $pdfPath = null;

        try {
            $data = $this->validatePayload($payload);
            $student = $this->loadActiveStudent($data['alumnoId']);
            $course = $this->loadActiveCourse($data['cursoId']);
            $attendedDates = $this->loadActiveAttendances($data['alumnoId'], $data['cursoId']);
            $institutionalConfig = $this->loadInstitutionalConfig($this->pdo);
            $documentNumber = $this->decryptDocumentNumber($this->readLobAsString($student['dni_cifrado'] ?? null));
            $documentHash = $this->hashDocument($documentNumber);
            $documentMasked = $this->maskDocument($documentNumber);

            $token = rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
            $tokenHash = hash('sha256', $token . $this->tokenPepper, true);
            $tokenPrefix = substr($token, 0, 12);
            $tokenCipher = $this->encryptToken($token);
            $code = 'CERT-' . date('Y', strtotime($data['issuedAt'])) . '-' . strtoupper(bin2hex(random_bytes(4)));

            $this->pdo->beginTransaction();
            $this->assertNoActiveCertificateForPair($data['alumnoId'], $data['cursoId']);
            $statement = $this->pdo->prepare(<<<'SQL'
                INSERT INTO cert_certificados (
                  alumno_id, curso_id, codigo_certificado, estado, alumno_nombre_mostrar, documento_hash,
                  documento_enmascarado, curso_nombre, emitido_en, vence_en
                ) VALUES (?, ?, ?, 'vigente', ?, ?, ?, ?, ?, ?)
                SQL);
            $statement->bindValue(1, $data['alumnoId'], PDO::PARAM_INT);
            $statement->bindValue(2, $data['cursoId'], PDO::PARAM_INT);
            $statement->bindValue(3, $code);
            $statement->bindValue(4, (string) $student['apellido_nombre']);
            $statement->bindValue(5, $documentHash, PDO::PARAM_LOB);
            $statement->bindValue(6, $documentMasked);
            $statement->bindValue(7, (string) $course['nombre']);
            $statement->bindValue(8, $data['issuedAt']);
            $data['expiresAt'] === null
                ? $statement->bindValue(9, null, PDO::PARAM_NULL)
                : $statement->bindValue(9, $data['expiresAt']);
            try {
                $statement->execute();
            } catch (PDOException $exception) {
                $this->throwDuplicateCertificateIfActivePairConstraint($exception);
                throw $exception;
            }

            $id = (int) $this->pdo->lastInsertId();
            $statement = $this->pdo->prepare(<<<'SQL'
                INSERT INTO cert_tokens_verificacion (
                  certificado_id, token_hash, token_prefijo, token_cifrado, estado, vigente_desde, vigente_hasta
                ) VALUES (?, ?, ?, ?, 'activo', CURRENT_TIMESTAMP, ?)
                SQL);
            $statement->bindValue(1, $id, PDO::PARAM_INT);
            $statement->bindValue(2, $tokenHash, PDO::PARAM_LOB);
            $statement->bindValue(3, $tokenPrefix);
            $statement->bindValue(4, $tokenCipher, PDO::PARAM_LOB);
            $data['expiresAt'] === null
                ? $statement->bindValue(5, null, PDO::PARAM_NULL)
                : $statement->bindValue(5, $data['expiresAt'] . ' 23:59:59');
            $statement->execute();

            $this->insertSnapshot($id, $attendedDates);
            $pdfPath = $this->generatePdfWithinTransaction($code, $documentNumber, [
                'studentDisplayName' => (string) $student['apellido_nombre'],
                'courseName' => (string) $course['nombre'],
                'issuedAt' => $data['issuedAt'],
                'expiresAt' => $data['expiresAt'],
                'attendedDates' => $attendedDates,
                // ponytail: DTO en array, no value object nuevo.
                'institutionalConfig' => $institutionalConfig,
            ], $token);

            $statement = $this->pdo->prepare(
                "UPDATE cert_certificados
                 SET pdf_estado = 'vigente',
                     pdf_generado_revision = contenido_revision
                 WHERE id = ?"
            );
            $statement->execute([$id]);

            $this->pdo->commit();
        } catch (AdminCertificateException $exception) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            if (is_string($pdfPath) && is_file($pdfPath)) {
                @unlink($pdfPath);
            }
            $this->safeAudit('emision', $exception->status >= 500 ? 'error' : 'rechazado');
            throw $exception;
        } catch (Throwable $exception) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            if (is_string($pdfPath) && is_file($pdfPath)) {
                @unlink($pdfPath);
            }
            $this->safeAudit('emision', 'error');
            throw $exception;
        }

        $this->safeAudit('emision', 'ok', ['certificado_id' => $id, 'token_hash_prefijo' => substr(hash('sha256', $token . $this->tokenPepper), 0, 16)]);

        return [
            'id' => $id,
            'certificateCode' => $code,
            'status' => 'vigente',
            'student' => ['displayName' => (string) $student['apellido_nombre'], 'documentMasked' => $documentMasked],
            'course' => ['name' => (string) $course['nombre']],
            'issuedAt' => $data['issuedAt'],
            'expiresAt' => $data['expiresAt'],
            'tokenPrefix' => $tokenPrefix,
            'publicValidationUrl' => $this->buildPublicValidationUrl($token),
            'pdfDownloadUrl' => $this->buildPdfDownloadUrl($id),
        ];
    }

    /**
     * Genera el PDF dentro de la transacción antes del commit. Si falla, la
     * transacción se revierte en el catch del llamador y no queda certificado
     * emitido sin PDF. El token completo solo se usa acá para armar la URL del
     * QR y nunca se persiste ni se devuelve.
     *
     * @param array<string, mixed> $data Datos visibles del certificado.
     * @throws RuntimeException Si el servicio PDF o el storage fallan.
     */
    private function generatePdfWithinTransaction(string $code, string $documentNumber, array $data, string $token): string
    {
        if ($this->pdfService === null || $this->publicBaseUrl === null) {
            throw new RuntimeException('Configuración PDF no disponible.');
        }

        $validationUrl = rtrim($this->publicBaseUrl, '/') . '/validar/' . $token;
        $viewData = [
            'certificateCode' => $code,
            'studentDisplayName' => $data['studentDisplayName'],
            'documentNumber' => $documentNumber,
            'courseName' => $data['courseName'],
            'issuedAt' => $data['issuedAt'],
            'expiresAt' => $data['expiresAt'] ?? '',
            'attendedDates' => $data['attendedDates'] ?? [],
            'institutionalConfig' => InstitutionalConfig::normalize($data['institutionalConfig'] ?? []),
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

    /**
     * Entrega manual de un certificado: lectura sin side effects. Devuelve los
     * datos para que Bedelía copie el link público y descargue el PDF por canal
     * externo. NO rota token, NO envía email, NO modifica estado de certificado
     * ni token. Descifra el token en memoria solo para reconstruir el link
     * permanente; el token completo nunca se devuelve como campo separado.
     *
     * El JOIN del token activo replica exactamente los predicados de validez
     * que usa el validador público (CertificateValidator::findCertificate):
     * estado='activo', revocado_en IS NULL, vigente_desde <= CURRENT_TIMESTAMP
     * y (vigente_hasta IS NULL OR vigente_hasta >= CURRENT_TIMESTAMP). Así la
     * entrega manual nunca devuelve un link que la validación pública rechazaría.
     * Si ningún token actualmente válido existe, falla seguro con 404.
     *
     * Antes de devolver pdfDownloadUrl verifica que el PDF persistido exista
     * y sea legible/no vacío usando la misma semántica de path que la descarga
     * (CertificatePdfService::pathForCode). Si falta, responde 404 PDF_NOT_FOUND.
     *
     * @param int|string $id Identificador del certificado.
     * @return array<string, mixed> DTO {certificadoId, publicValidationUrl, pdfDownloadUrl, tokenPrefix}.
     * @throws AdminCertificateException 400/404/409 con códigos seguros.
     */
    public function entregaManual(int|string $id): array
    {
        $data = $this->loadManualDeliveryData($this->validatedCertificateId($id));
        
        $internalPdfStatus = $data['pdfStatus'];
        $pdfStatus = match ($internalPdfStatus) {
            'desactualizado' => 'outdated',
            'vigente' => 'valid',
            default => 'missing',
        };
        $pdfAvailable = false;

        if ($internalPdfStatus === 'desactualizado') {
            $pdfAvailable = false;
        } else {
            try {
                $this->ensurePdfExists($data['certificateCode']);
                $pdfAvailable = true;
            } catch (AdminCertificateException $e) {
                if ($e->errorCode === 'PDF_NOT_FOUND') {
                    $pdfAvailable = false;
                } else {
                    throw $e;
                }
            }
        }

        return [
            'certificadoId' => $data['certificateId'],
            'publicValidationUrl' => $data['publicValidationUrl'],
            'pdfDownloadUrl' => $this->buildPdfDownloadUrl($data['certificateId']),
            'tokenPrefix' => $data['tokenPrefix'],
            'pdfAvailable' => $pdfAvailable,
            'pdfStatus' => $pdfStatus,
        ];
    }

    /** @return array<string, mixed> */
    public function deliveryTokenData(int|string $id): array
    {
        return $this->loadManualDeliveryData($this->validatedCertificateId($id));
    }

    private function validatedCertificateId(int|string $id): int
    {
        $certificateId = filter_var($id, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if (!is_int($certificateId)) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }

        return $certificateId;
    }

    /**
     * @return array{certificateId:int,certificateCode:string,publicValidationUrl:string,tokenPrefix:string}
     */
    private function loadManualDeliveryData(int $certificateId): array
    {
        // Lectura de certificado vigente + token actualmente válido. No abre
        // transacción: el endpoint es de solo lectura y no requiere FOR UPDATE.
        // Los predicados del token replican CertificateValidator::findCertificate
        // para que la entrega manual solo recupere tokens que la validación
        // pública aceptaría.
        $statement = $this->pdo->prepare(<<<'SQL'
            SELECT c.id, c.estado, c.revocado_en AS cert_revocado_en, c.vence_en,
                   (c.vence_en IS NULL OR c.vence_en >= CURRENT_DATE) AS vence_en_vigente,
                   c.codigo_certificado, c.pdf_estado,
                   t.token_prefijo, t.token_cifrado
            FROM cert_certificados c
            LEFT JOIN cert_tokens_verificacion t
              ON t.certificado_id = c.id
             AND t.estado = 'activo'
             AND t.revocado_en IS NULL
             AND t.vigente_desde <= CURRENT_TIMESTAMP
             AND (t.vigente_hasta IS NULL OR t.vigente_hasta >= CURRENT_TIMESTAMP)
            WHERE c.id = ?
            LIMIT 1
            SQL);
        $statement->execute([$certificateId]);
        $row = $statement->fetch();

        if ($row === false) {
            throw new AdminCertificateException(404, 'CERTIFICATE_NOT_FOUND', 'Certificado no encontrado.');
        }

        $estado = (string) ($row['estado'] ?? '');
        $venceEnVigente = (int) ($row['vence_en_vigente'] ?? 0) === 1;
        $certRevocadoEn = $row['cert_revocado_en'] ?? null;
        if ($estado !== 'vigente' || !$venceEnVigente || $certRevocadoEn !== null) {
            throw new AdminCertificateException(404, 'CERTIFICATE_NOT_FOUND', 'Certificado no encontrado.');
        }

        $tokenPrefix = is_string($row['token_prefijo']) ? $row['token_prefijo'] : '';
        // Sin token actualmente válido: fail safe 404. No devolver un link que
        // la validación pública rechazaría (token expirado/futuro/revocado).
        if ($tokenPrefix === '') {
            throw new AdminCertificateException(404, 'CERTIFICATE_NOT_FOUND', 'Certificado no encontrado.');
        }

        $tokenCipher = $this->readLobAsString($row['token_cifrado'] ?? null);
        $token = $this->recoverToken($tokenCipher);
        $certificateCode = is_string($row['codigo_certificado'] ?? null) ? $row['codigo_certificado'] : '';
        if ($certificateCode === '') {
            throw new AdminCertificateException(404, 'CERTIFICATE_NOT_FOUND', 'Certificado no encontrado.');
        }

        $pdfStatus = is_string($row['pdf_estado'] ?? null) ? $row['pdf_estado'] : 'no_generado';

        return [
            'certificateId' => $certificateId,
            'certificateCode' => $certificateCode,
            'publicValidationUrl' => $this->buildPublicValidationUrl($token),
            'tokenPrefix' => $tokenPrefix,
            'pdfStatus' => $pdfStatus,
        ];
    }

    /**
     * Verifica que el PDF persistido del certificado exista y sea legible/no
     * vacío, usando la misma semántica de path que streamPdf()/descarga.
     * Responde 404 PDF_NOT_FOUND (mismo código seguro que el endpoint de
     * descarga) si el archivo falta o es inválido.
     *
     * @throws AdminCertificateException 404 PDF_NOT_FOUND si el PDF no existe.
     */
    private function ensurePdfExists(mixed $certificateCode): void
    {
        if (!is_string($certificateCode) || $certificateCode === '') {
            throw new AdminCertificateException(404, 'PDF_NOT_FOUND', 'PDF no encontrado.');
        }

        $path = $this->pathForCertificateCode($certificateCode);

        if (!is_file($path) || !is_readable($path)) {
            throw new AdminCertificateException(404, 'PDF_NOT_FOUND', 'PDF no encontrado.');
        }

        $size = filesize($path);
        if ($size === false || $size <= 0) {
            throw new AdminCertificateException(404, 'PDF_NOT_FOUND', 'PDF no encontrado.');
        }
    }

    /**
     * Resuelve la ruta del PDF para un código de certificado usando la misma
     * semántica que CertificatePdfService::pathForCode. Reusa pdfService si fue
     * inyectado; si no, reconstruye el path con pdfStoragePath. En ambos casos
     * el resultado es idéntico al que usa la descarga.
     */
    private function pathForCertificateCode(string $certificateCode): string
    {
        if (isset($this->pdfService) && $this->pdfService instanceof CertificatePdfService) {
            return $this->pdfService->pathForCode($certificateCode);
        }

        if ($this->pdfStoragePath === null || $this->pdfStoragePath === '') {
            throw new AdminCertificateException(404, 'PDF_NOT_FOUND', 'PDF no encontrado.');
        }

        // ponytail: duplica la sanitización mínima de pathForCode sin instanciar
        // TCPDF (que no se carga en la ruta de entrega manual). Misma regex.
        $sanitized = preg_replace('/[^A-Za-z0-9_-]/', '_', $certificateCode) ?? $certificateCode;

        return rtrim($this->pdfStoragePath, '/') . '/' . $sanitized . '.pdf';
    }

    private function buildPublicValidationUrl(string $token): string
    {
        if ($this->publicBaseUrl === null || $this->publicBaseUrl === '' || $token === '') {
            return '';
        }

        return rtrim($this->publicBaseUrl, '/') . '/validar/' . $token;
    }

    /**
     * Cifra el token con AES-256-GCM. Fail closed si la clave falta o el
     * cifrado falla: la emisión aborta antes del commit.
     */
    private function encryptToken(string $token): string
    {
        if ($this->tokenCipherKey === null || $this->tokenCipherKey === '' || strlen($this->tokenCipherKey) !== 32) {
            throw new RuntimeException('Token cipher key invalid.');
        }

        return TokenCipher::encrypt($token, $this->tokenCipherKey);
    }

    /**
     * Descifra el envelope y reconstruye el token en memoria. Fail closed con
     * 409 TOKEN_NOT_RECOVERABLE ante clave ausente, envelope inválido, IV/tag
     * incorrectos o descifrado fallido. No regenera token.
     */
    private function recoverToken(?string $tokenCipher): string
    {
        if ($this->tokenCipherKey === null || $this->tokenCipherKey === '' || strlen($this->tokenCipherKey) !== 32) {
            throw new AdminCertificateException(409, 'TOKEN_NOT_RECOVERABLE', 'Token no recuperable.');
        }

        if (!TokenCipher::envelopeLooksValid($tokenCipher)) {
            throw new AdminCertificateException(409, 'TOKEN_NOT_RECOVERABLE', 'Token no recuperable.');
        }

        try {
            return TokenCipher::decrypt($tokenCipher, $this->tokenCipherKey);
        } catch (RuntimeException) {
            throw new AdminCertificateException(409, 'TOKEN_NOT_RECOVERABLE', 'Token no recuperable.');
        }
    }

    /**
     * Normaliza un LOB de PDO (stream o string) a string binaria segura.
     * Algunos drivers devuelven token_cifrado como resource stream.
     */
    private function readLobAsString(mixed $lob): ?string
    {
        if ($lob === null) {
            return null;
        }

        if (is_string($lob)) {
            return $lob;
        }

        if (is_resource($lob)) {
            $contents = stream_get_contents($lob);
            return is_string($contents) ? $contents : null;
        }

        return null;
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
            $detallePartes = [];
            // ponytail: la rama `reenvio` con destinatario_enmascarado se eliminó
            // junto con el flujo de email. La entrega manual no audita evento
            // operativo (spec: endpoint de solo lectura sin escritura de auditoría).
            if (isset($meta['certificado_id_consultado']) && is_int($meta['certificado_id_consultado'])) {
                $detallePartes[] = 'certificadoConsultado=' . $meta['certificado_id_consultado'];
            }
            $detalleSeguro = $detallePartes === []
                ? ($result === 'ok' ? 'Operación administrativa correcta.' : 'Operación administrativa rechazada.')
                : implode('; ', $detallePartes);

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
                $detalleSeguro,
            ]);
        } catch (Throwable $exception) {
            $this->logger?->error('Falla de auditoría administrativa.', ['action' => $action, 'result' => $result]);
        }
    }

    /** @return array<string, mixed> */
    private function loadActiveStudent(int $studentId): array
    {
        $statement = $this->pdo->prepare('SELECT id, apellido_nombre, dni_cifrado FROM cert_alumnos WHERE id = ? AND estado = \'activo\' LIMIT 1');
        $statement->execute([$studentId]);
        $row = $statement->fetch();

        if (!is_array($row)) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }

        return $row;
    }

    /** @return array<string, mixed> */
    private function loadActiveCourse(int $courseId): array
    {
        $statement = $this->pdo->prepare('SELECT id, nombre FROM cert_cursos WHERE id = ? AND estado = \'activo\' LIMIT 1');
        $statement->execute([$courseId]);
        $row = $statement->fetch();

        if (!is_array($row)) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }

        return $row;
    }

    /** @return array{institutionName:string,certificateText:string,rectorName:string,rectorRole:string,advisorName:string,advisorRole:string} */
    private function loadInstitutionalConfig(PDO $pdo): array
    {
        $statement = $pdo->prepare(<<<'SQL'
            SELECT institucion_nombre, rector_nombre, rector_cargo, asesor_nombre, asesor_cargo, texto_certificado
            FROM cert_configuracion_institucional
            WHERE id = 1
            LIMIT 1
            SQL);
        $statement->execute();
        $row = $statement->fetch();

        return InstitutionalConfig::fromDatabaseRow($row);
    }

    /** @return list<array{curso_fecha_id:int,fecha:string,descripcion:?string,orden:int}> */
    private function loadActiveAttendances(int $studentId, int $courseId): array
    {
        $statement = $this->pdo->prepare(<<<'SQL'
            SELECT cf.id AS curso_fecha_id, cf.fecha, cf.descripcion, cf.orden
            FROM cert_asistencias a
            JOIN cert_curso_fechas cf ON cf.id = a.curso_fecha_id
            WHERE a.alumno_id = ?
              AND cf.curso_id = ?
              AND a.eliminado_en IS NULL
              AND cf.estado = 'realizada'
            ORDER BY cf.orden, cf.fecha
            SQL);
        $statement->execute([$studentId, $courseId]);

        $rows = [];
        while (($row = $statement->fetch()) !== false) {
            $rows[] = [
                'curso_fecha_id' => (int) $row['curso_fecha_id'],
                'fecha' => (string) $row['fecha'],
                'descripcion' => is_string($row['descripcion'] ?? null) ? $row['descripcion'] : null,
                'orden' => (int) $row['orden'],
            ];
        }

        if ($rows === []) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }

        return $rows;
    }

    private function assertNoActiveCertificateForPair(int $studentId, int $courseId): void
    {
        $statement = $this->pdo->prepare(<<<'SQL'
            SELECT id
            FROM cert_certificados
            WHERE alumno_id = ?
              AND curso_id = ?
              AND estado = 'vigente'
              AND revocado_en IS NULL
            LIMIT 1
            SQL);
        $statement->execute([$studentId, $courseId]);

        if ($statement->fetch() !== false) {
            throw new AdminCertificateException(409, 'CERTIFICATE_ALREADY_EXISTS', 'Ya existe un certificado vigente para este alumno y curso.');
        }
    }

    private function throwDuplicateCertificateIfActivePairConstraint(PDOException $exception): void
    {
        if (($exception->errorInfo[0] ?? $exception->getCode()) !== '23000') {
            return;
        }

        $message = $exception->errorInfo[2] ?? $exception->getMessage();
        if (is_string($message) && str_contains($message, 'uq_cert_certificados_alumno_curso_activo')) {
            throw new AdminCertificateException(409, 'CERTIFICATE_ALREADY_EXISTS', 'Ya existe un certificado vigente para este alumno y curso.');
        }
    }

    /** @param list<array{curso_fecha_id:int,fecha:string,descripcion:?string,orden:int}> $attendedDates */
    private function insertSnapshot(int $certificateId, array $attendedDates): void
    {
        $statement = $this->pdo->prepare(<<<'SQL'
            INSERT INTO cert_certificado_fechas (certificado_id, curso_fecha_id, fecha, descripcion, orden)
            VALUES (?, ?, ?, ?, ?)
            SQL);

        foreach ($attendedDates as $date) {
            $statement->execute([
                $certificateId,
                $date['curso_fecha_id'],
                $date['fecha'],
                $date['descripcion'],
                $date['orden'],
            ]);
        }
    }

    private function decryptDocumentNumber(?string $dniCipher): string
    {
        if ($this->dniCipherKey === null || strlen($this->dniCipherKey) !== 32 || !DniCipher::envelopeLooksValid($dniCipher)) {
            throw new AdminCertificateException(500, 'CONFIGURATION_ERROR', 'No se pudo procesar la solicitud.');
        }

        try {
            return DniCipher::decrypt($dniCipher, $this->dniCipherKey);
        } catch (RuntimeException) {
            throw new AdminCertificateException(500, 'CONFIGURATION_ERROR', 'No se pudo procesar la solicitud.');
        }
    }

    /** @param array<string, mixed> $payload @return array{alumnoId:int,cursoId:int,issuedAt:string,expiresAt:?string} */
    private function validatePayload(array $payload): array
    {
        $studentId = $this->requiredPositiveInt($payload['alumnoId'] ?? null);
        $courseId = $this->requiredPositiveInt($payload['cursoId'] ?? null);
        $issuedAt = $this->dateString($payload['issuedAt'] ?? null);
        $expiresAt = isset($payload['expiresAt']) && $payload['expiresAt'] !== '' ? $this->dateString($payload['expiresAt']) : null;

        $today = (new DateTimeImmutable('now', new DateTimeZone('America/Argentina/Buenos_Aires')))->format('Y-m-d');

        if ($issuedAt > $today) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }

        if ($expiresAt !== null && ($expiresAt < $issuedAt || $expiresAt < $today)) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }

        return ['alumnoId' => $studentId, 'cursoId' => $courseId, 'issuedAt' => $issuedAt, 'expiresAt' => $expiresAt];
    }

    private function requiredPositiveInt(mixed $value): int
    {
        $int = filter_var($value, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if (!is_int($int)) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }

        return $int;
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

    /**
     * @param array{estado?:string|null,cursoId?:int|null,alumnoId?:int|null} $filters
     * @return array{items:list<array<string,mixed>>}
     */
    public function listCertificados(array $filters = []): array
    {
        $where = [];
        $params = [];

        if (isset($filters['estado']) && is_string($filters['estado']) && $filters['estado'] !== '') {
            $reqEstado = $this->enumCertificadoEstado($filters['estado']);
            $today = (new DateTimeImmutable('now', new DateTimeZone('America/Argentina/Buenos_Aires')))->format('Y-m-d');

            if ($reqEstado === 'vigente') {
                $where[] = '(c.estado = ? AND (c.vence_en IS NULL OR c.vence_en >= ?))';
                $params[] = 'vigente';
                $params[] = $today;
            } elseif ($reqEstado === 'vencido') {
                $where[] = '(c.estado = ? OR (c.estado = ? AND c.vence_en < ?))';
                $params[] = 'vencido';
                $params[] = 'vigente';
                $params[] = $today;
            } else {
                $where[] = 'c.estado = ?';
                $params[] = $reqEstado;
            }
        }
        if (isset($filters['cursoId']) && $filters['cursoId'] !== null) {
            $where[] = 'c.curso_id = ?';
            $params[] = $filters['cursoId'];
        }
        if (isset($filters['alumnoId']) && $filters['alumnoId'] !== null) {
            $where[] = 'c.alumno_id = ?';
            $params[] = $filters['alumnoId'];
        }

        $sql = <<<'SQL'
            SELECT c.id, c.codigo_certificado, c.estado, c.alumno_nombre_mostrar, c.documento_enmascarado,
                   c.curso_nombre, c.emitido_en, c.vence_en, c.revocado_en, c.alumno_id, c.curso_id,
                   (
                     SELECT t.token_prefijo
                     FROM cert_tokens_verificacion t
                     WHERE t.certificado_id = c.id
                       AND t.estado = 'activo'
                       AND t.revocado_en IS NULL
                     ORDER BY t.id DESC
                     LIMIT 1
                   ) AS token_prefijo
            FROM cert_certificados c
            SQL;

        if ($where !== []) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }

        $sql .= ' ORDER BY c.emitido_en DESC, c.id DESC';

        $statement = $this->pdo->prepare($sql);
        $statement->execute($params);

        $items = [];
        while (($row = $statement->fetch()) !== false) {
            $items[] = $this->certificateListDto($row);
        }

        return ['items' => $items];
    }

    /** @return array<string, mixed> */
    public function getCertificado(int $id): array
    {
        $certificateId = $this->validatedCertificateId($id);
        $statement = $this->pdo->prepare(<<<'SQL'
            SELECT c.id, c.codigo_certificado, c.estado, c.alumno_nombre_mostrar, c.documento_enmascarado,
                   c.curso_nombre, c.emitido_en, c.vence_en, c.revocado_en, c.motivo_revocacion,
                   c.alumno_id, c.curso_id,
                   (
                     SELECT t.token_prefijo
                     FROM cert_tokens_verificacion t
                     WHERE t.certificado_id = c.id
                       AND t.estado = 'activo'
                       AND t.revocado_en IS NULL
                     ORDER BY t.id DESC
                     LIMIT 1
                   ) AS token_prefijo
            FROM cert_certificados c
            WHERE c.id = ?
            LIMIT 1
            SQL);
        $statement->execute([$certificateId]);
        $row = $statement->fetch();

        if (!is_array($row)) {
            throw new AdminCertificateException(404, 'CERTIFICATE_NOT_FOUND', 'Certificado no encontrado.');
        }

        return $this->certificateDetailDto($row);
    }

    /** @param array<string, mixed> $row @return array<string, mixed> */
    private function certificateListDto(array $row): array
    {
        $status = (string) $row['estado'];
        if ($status === 'vigente' && is_string($row['vence_en'])) {
            $today = (new DateTimeImmutable('now', new DateTimeZone('America/Argentina/Buenos_Aires')))->format('Y-m-d');
            if ($row['vence_en'] < $today) {
                $status = 'vencido';
            }
        }

        return [
            'id' => (int) $row['id'],
            'certificateCode' => (string) $row['codigo_certificado'],
            'status' => $status,
            'student' => [
                'displayName' => (string) $row['alumno_nombre_mostrar'],
                'documentMasked' => (string) $row['documento_enmascarado'],
            ],
            'course' => [
                'id' => $row['curso_id'] !== null ? (int) $row['curso_id'] : null,
                'name' => (string) $row['curso_nombre'],
            ],
            'alumnoId' => $row['alumno_id'] !== null ? (int) $row['alumno_id'] : null,
            'cursoId' => $row['curso_id'] !== null ? (int) $row['curso_id'] : null,
            'issuedAt' => (string) $row['emitido_en'],
            'expiresAt' => is_string($row['vence_en'] ?? null) ? $row['vence_en'] : null,
            'revokedAt' => is_string($row['revocado_en'] ?? null) ? $row['revocado_en'] : null,
            'tokenPrefix' => is_string($row['token_prefijo'] ?? null) && $row['token_prefijo'] !== '' ? $row['token_prefijo'] : null,
        ];
    }

    /** @param array<string, mixed> $row @return array<string, mixed> */
    private function certificateDetailDto(array $row): array
    {
        $certificateId = (int) $row['id'];
        $detail = $this->certificateListDto($row);
        $detail['revocationReason'] = is_string($row['motivo_revocacion'] ?? null) ? $row['motivo_revocacion'] : null;
        $detail['attendedDates'] = $this->loadCertificateSnapshotDates($certificateId);
        $detail['auditEvents'] = $this->loadSafeAuditEvents($certificateId);
        $detail['links'] = [
            'pdf' => '/admin/certificados/' . $certificateId . '/pdf',
            'manualDelivery' => '/admin/certificados/' . $certificateId . '/entrega-manual',
            'qrPng' => '/admin/certificados/' . $certificateId . '/qr.png',
        ];

        return $detail;
    }

    /** @return list<array{fecha:string,descripcion:?string,orden:int}> */
    private function loadCertificateSnapshotDates(int $certificateId): array
    {
        $statement = $this->pdo->prepare(<<<'SQL'
            SELECT ccf.fecha, ccf.descripcion, ccf.orden
            FROM cert_certificado_fechas ccf
            WHERE ccf.certificado_id = ?
            ORDER BY ccf.orden, ccf.fecha
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

    /** @return list<array{eventType:string,result:string,createdAt:string}> */
    private function loadSafeAuditEvents(int $certificateId): array
    {
        $statement = $this->pdo->prepare(<<<'SQL'
            SELECT tipo_evento, resultado, created_at
            FROM cert_eventos_auditoria
            WHERE certificado_id = ?
            ORDER BY id DESC
            LIMIT 10
            SQL);
        $statement->execute([$certificateId]);

        $events = [];
        while (($row = $statement->fetch()) !== false) {
            $events[] = [
                'eventType' => (string) $row['tipo_evento'],
                'result' => (string) $row['resultado'],
                'createdAt' => (string) $row['created_at'],
            ];
        }

        return $events;
    }

    private function enumCertificadoEstado(string $estado): string
    {
        $allowed = ['borrador', 'vigente', 'revocado', 'vencido'];
        if (!in_array($estado, $allowed, true)) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }

        return $estado;
    }
}
