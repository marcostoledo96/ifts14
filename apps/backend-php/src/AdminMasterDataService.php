<?php

declare(strict_types=1);

require_once __DIR__ . '/AdminCertificateService.php';
require_once __DIR__ . '/DniCipher.php';

final class AdminMasterDataService
{
    private const array COURSE_STATES = ['borrador', 'activo', 'cerrado', 'archivado'];
    private const array STUDENT_STATES = ['activo', 'inactivo'];
    private const array DATE_STATES = ['programada', 'realizada', 'cancelada'];
    private const int MAX_DATE_ORDER = 65535;

    public function __construct(
        private readonly PDO $pdo,
        private readonly string $requestId,
        private readonly ?string $dniCipherKey = null,
    ) {
    }

    /** @param array<string, mixed> $body @return array<string, mixed> */
    public function createCourse(array $body): array
    {
        $code = $this->shortString($body['codigo'] ?? null, 40);
        $name = $this->shortString($body['nombre'] ?? null, 180);

        try {
            $statement = $this->pdo->prepare('INSERT INTO cert_cursos (codigo, nombre, estado) VALUES (?, ?, \'activo\')');
            $statement->execute([$code, $name]);
        } catch (PDOException $exception) {
            $this->throwConflictForUnique($exception, 'uq_cert_cursos_codigo');
            throw $exception;
        }

        return $this->getCourse((int) $this->pdo->lastInsertId());
    }

    /** @return array<string, mixed> */
    public function listCourses(?string $state = null): array
    {
        $params = [];
        $where = '';
        if ($state !== null && $state !== '') {
            $state = $this->enum($state, self::COURSE_STATES);
            $where = 'WHERE estado = ?';
            $params[] = $state;
        }

        $statement = $this->pdo->prepare("SELECT id, codigo, nombre, estado, created_at, updated_at FROM cert_cursos {$where} ORDER BY id ASC");
        $statement->execute($params);

        return ['items' => array_map(fn (array $row): array => $this->courseDto($row), $statement->fetchAll())];
    }

    /** @return array<string, mixed> */
    public function getCourse(int $id): array
    {
        $statement = $this->pdo->prepare('SELECT id, codigo, nombre, estado, created_at, updated_at FROM cert_cursos WHERE id = ? LIMIT 1');
        $statement->execute([$this->positiveId($id)]);
        $row = $statement->fetch();

        if (!is_array($row)) {
            throw new AdminCertificateException(404, 'COURSE_NOT_FOUND', 'Curso no encontrado.');
        }

        return $this->courseDto($row);
    }

    /** @param array<string, mixed> $body @return array<string, mixed> */
    public function updateCourseStatus(int $id, array $body): array
    {
        $state = $this->enum($body['estado'] ?? null, self::COURSE_STATES);
        $statement = $this->pdo->prepare('UPDATE cert_cursos SET estado = ? WHERE id = ?');
        $statement->execute([$state, $this->positiveId($id)]);

        return $this->getCourse($id);
    }

    /** @param array<string, mixed> $body @return array<string, mixed> */
    public function createStudent(array $body): array
    {
        $key = $this->validDniKey();
        $name = $this->shortString($body['apellidoNombre'] ?? null, 160);
        $dni = $this->normalizeDni($body['dni'] ?? null);
        $state = isset($body['estado']) ? $this->enum($body['estado'], self::STUDENT_STATES) : 'activo';
        $dniHash = $this->hashDni($dni, $key);
        $dniCipher = DniCipher::encrypt($dni, $key);
        $dniDisplay = $this->maskDni($dni);

        try {
            $statement = $this->pdo->prepare('INSERT INTO cert_alumnos (apellido_nombre, dni_hash, dni_cifrado, dni_mostrar, estado) VALUES (?, ?, ?, ?, ?)');
            $statement->bindValue(1, $name);
            $statement->bindValue(2, $dniHash, PDO::PARAM_LOB);
            $statement->bindValue(3, $dniCipher, PDO::PARAM_LOB);
            $statement->bindValue(4, $dniDisplay);
            $statement->bindValue(5, $state);
            $statement->execute();
        } catch (PDOException $exception) {
            $this->throwConflictForUnique($exception, 'uq_cert_alumnos_dni_hash');
            throw $exception;
        }

        return $this->getStudent((int) $this->pdo->lastInsertId());
    }

    /** @return array<string, mixed> */
    public function listStudents(): array
    {
        $statement = $this->pdo->query('SELECT id, apellido_nombre, dni_mostrar, estado FROM cert_alumnos ORDER BY id ASC');

        return ['items' => array_map(fn (array $row): array => $this->studentDto($row), $statement->fetchAll())];
    }

    /** @return array<string, mixed> */
    public function getStudent(int $id): array
    {
        $statement = $this->pdo->prepare('SELECT id, apellido_nombre, dni_mostrar, estado FROM cert_alumnos WHERE id = ? LIMIT 1');
        $statement->execute([$this->positiveId($id)]);
        $row = $statement->fetch();

        if (!is_array($row)) {
            throw new AdminCertificateException(404, 'STUDENT_NOT_FOUND', 'Alumno no encontrado.');
        }

        return $this->studentDto($row);
    }

    /** @param array<string, mixed> $body @return array<string, mixed> */
    public function updateStudentStatus(int $id, array $body): array
    {
        $state = $this->enum($body['estado'] ?? null, self::STUDENT_STATES);
        $statement = $this->pdo->prepare('UPDATE cert_alumnos SET estado = ? WHERE id = ?');
        $statement->execute([$state, $this->positiveId($id)]);

        return $this->getStudent($id);
    }

    /** @param array<string, mixed> $body @return array<string, mixed> */
    public function createCourseDate(int $courseId, array $body): array
    {
        $courseId = $this->positiveId($courseId);
        $this->ensureCourseExists($courseId);
        $date = $this->dateString($body['fecha'] ?? null);
        $description = $this->nullableString($body['descripcion'] ?? null, 180);
        $state = isset($body['estado']) ? $this->enum($body['estado'], self::DATE_STATES) : 'programada';
        $order = isset($body['orden']) ? $this->courseDateOrder($body['orden']) : $this->nextDateOrder($courseId);

        try {
            $statement = $this->pdo->prepare('INSERT INTO cert_curso_fechas (curso_id, fecha, descripcion, orden, estado) VALUES (?, ?, ?, ?, ?)');
            $statement->execute([$courseId, $date, $description, $order, $state]);
        } catch (PDOException $exception) {
            $this->throwConflictForUnique($exception, 'uq_cert_curso_fechas_curso_fecha', 'uq_cert_curso_fechas_curso_orden');
            throw $exception;
        }

        return $this->getCourseDate($courseId, (int) $this->pdo->lastInsertId());
    }

    /** @return array<string, mixed> */
    public function listCourseDates(int $courseId): array
    {
        $courseId = $this->positiveId($courseId);
        $this->ensureCourseExists($courseId);
        $statement = $this->pdo->prepare('SELECT id, curso_id, fecha, descripcion, orden, estado FROM cert_curso_fechas WHERE curso_id = ? ORDER BY orden ASC, fecha ASC');
        $statement->execute([$courseId]);

        return ['items' => array_map(fn (array $row): array => $this->courseDateDto($row), $statement->fetchAll())];
    }

    /** @param array<string, mixed> $body @return array<string, mixed> */
    public function updateCourseDate(int $courseId, int $dateId, array $body): array
    {
        $courseId = $this->positiveId($courseId);
        $dateId = $this->positiveId($dateId);
        $current = $this->getCourseDate($courseId, $dateId);

        $date = array_key_exists('fecha', $body) ? $this->dateString($body['fecha']) : $current['fecha'];
        $description = array_key_exists('descripcion', $body) ? $this->nullableString($body['descripcion'], 180) : $current['descripcion'];
        $order = array_key_exists('orden', $body) ? $this->courseDateOrder($body['orden']) : (int) $current['orden'];
        $state = array_key_exists('estado', $body) ? $this->enum($body['estado'], self::DATE_STATES) : $current['estado'];

        $this->pdo->beginTransaction();
        try {
            $statement = $this->pdo->prepare('UPDATE cert_curso_fechas SET fecha = ?, descripcion = ?, orden = ?, estado = ? WHERE id = ? AND curso_id = ?');
            $statement->execute([$date, $description, $order, $state, $dateId, $courseId]);

            if ($state === 'realizada' || $current['estado'] === 'realizada') {
                if ($date !== $current['fecha'] || $description !== $current['descripcion'] || $order !== (int) $current['orden'] || $state !== $current['estado']) {
                    $this->syncAllCourseCertificatesSnapshots($courseId, $dateId, 'Se modificó una fecha del curso.');
                }
            }
            $this->pdo->commit();
        } catch (PDOException $exception) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            $this->throwConflictForUnique($exception, 'uq_cert_curso_fechas_curso_fecha', 'uq_cert_curso_fechas_curso_orden');
            throw $exception;
        } catch (Throwable $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $e;
        }

        return $this->getCourseDate($courseId, $dateId);
    }

    /** @param array<string, mixed> $body @return array<string, mixed> */
    public function recordAttendance(array $body): array
    {
        $studentId = $this->positiveId($body['alumnoId'] ?? null);
        $courseId = $this->positiveId($body['cursoId'] ?? null);
        $dateId = $this->positiveId($body['cursoFechaId'] ?? null);
        $this->ensureActiveStudent($studentId);
        $this->ensureActiveCourse($courseId);
        $this->ensureEligibleCourseDate($courseId, $dateId);

        $this->pdo->beginTransaction();
        try {
            $statement = $this->pdo->prepare('INSERT INTO cert_asistencias (alumno_id, curso_fecha_id, eliminado_en) VALUES (?, ?, NULL)');
            $statement->execute([$studentId, $dateId]);
            $attendanceId = (int) $this->pdo->lastInsertId();

            $courseDate = $this->getCourseDate($courseId, $dateId);
            if ($courseDate['estado'] === 'realizada') {
                $this->syncCertificateSnapshot($studentId, $courseId, 'Se agregó/restauró una asistencia.');
            }
            $this->pdo->commit();
        } catch (PDOException $exception) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            $this->throwConflictForUnique($exception, 'uq_cert_asistencias_activa');
            throw $exception;
        } catch (Throwable $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $e;
        }

        return $this->attendanceDtoById($attendanceId);
    }

    /** @return array<string, mixed> */
    public function listAttendances(?int $courseId, ?int $studentId): array
    {
        $where = ['a.eliminado_en IS NULL'];
        $params = [];
        if ($courseId !== null) {
            $where[] = 'cf.curso_id = ?';
            $params[] = $this->positiveId($courseId);
        }
        if ($studentId !== null) {
            $where[] = 'a.alumno_id = ?';
            $params[] = $this->positiveId($studentId);
        }

        $statement = $this->pdo->prepare('SELECT a.id, a.alumno_id, cf.curso_id, a.curso_fecha_id, cf.fecha, cf.estado AS fecha_estado, a.registrado_en FROM cert_asistencias a JOIN cert_curso_fechas cf ON cf.id = a.curso_fecha_id WHERE ' . implode(' AND ', $where) . ' ORDER BY cf.fecha ASC, a.id ASC');
        $statement->execute($params);

        return ['items' => array_map(fn (array $row): array => $this->attendanceDto($row), $statement->fetchAll())];
    }

    /** @return array<string, mixed> */
    public function voidAttendance(int $id): array
    {
        $id = $this->positiveId($id);
        $attendance = $this->attendanceDtoById($id);

        $this->pdo->beginTransaction();
        try {
            $statement = $this->pdo->prepare('UPDATE cert_asistencias SET eliminado_en = CURRENT_TIMESTAMP WHERE id = ? AND eliminado_en IS NULL');
            $statement->execute([$id]);

            if ($statement->rowCount() !== 1) {
                throw new AdminCertificateException(404, 'ATTENDANCE_NOT_FOUND', 'Asistencia no encontrada.');
            }

            if ($attendance['fechaEstado'] === 'realizada') {
                $this->syncCertificateSnapshot($attendance['alumnoId'], $attendance['cursoId'], 'Se anuló una asistencia viva.');
            }
            $this->pdo->commit();
        } catch (Throwable $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $e;
        }

        return ['id' => $id, 'voided' => true];
    }

    /** @return array<string, mixed> */
    private function getCourseDate(int $courseId, int $dateId): array
    {
        $statement = $this->pdo->prepare('SELECT id, curso_id, fecha, descripcion, orden, estado FROM cert_curso_fechas WHERE id = ? AND curso_id = ? LIMIT 1');
        $statement->execute([$dateId, $courseId]);
        $row = $statement->fetch();

        if (!is_array($row)) {
            throw new AdminCertificateException(404, 'COURSE_DATE_NOT_FOUND', 'Fecha de curso no encontrada.');
        }

        return $this->courseDateDto($row);
    }

    private function syncAllCourseCertificatesSnapshots(int $courseId, int $dateId, string $auditReason): void
    {
        $statement = $this->pdo->prepare('SELECT c.alumno_id FROM cert_certificados c JOIN cert_asistencias a ON a.alumno_id = c.alumno_id WHERE c.curso_id = ? AND a.curso_fecha_id = ? AND c.estado = \'vigente\' AND c.revocado_en IS NULL AND a.eliminado_en IS NULL');
        $statement->execute([$courseId, $dateId]);
        $studentIds = $statement->fetchAll(PDO::FETCH_COLUMN);

        foreach ($studentIds as $studentId) {
            $this->syncCertificateSnapshot((int) $studentId, $courseId, $auditReason);
        }
    }

    private function syncCertificateSnapshot(int $studentId, int $courseId, string $auditReason): void
    {
        $statement = $this->pdo->prepare('SELECT id FROM cert_certificados WHERE alumno_id = ? AND curso_id = ? AND estado = \'vigente\' AND revocado_en IS NULL LIMIT 1');
        $statement->execute([$studentId, $courseId]);
        $certificateId = $statement->fetchColumn();

        if ($certificateId === false) {
            return;
        }
        $certificateId = (int) $certificateId;

        $this->pdo->prepare('DELETE FROM cert_certificado_fechas WHERE certificado_id = ?')->execute([$certificateId]);

        $this->pdo->prepare(<<<'SQL'
            INSERT INTO cert_certificado_fechas (certificado_id, curso_fecha_id, fecha, descripcion, orden)
            SELECT ?, cf.id, cf.fecha, cf.descripcion, cf.orden
            FROM cert_asistencias a
            JOIN cert_curso_fechas cf ON cf.id = a.curso_fecha_id
            WHERE a.alumno_id = ? AND cf.curso_id = ? AND a.eliminado_en IS NULL AND cf.estado = 'realizada'
            ORDER BY cf.orden, cf.fecha
            SQL)->execute([$certificateId, $studentId, $courseId]);

        $this->pdo->prepare(<<<'SQL'
            UPDATE cert_certificados
            SET contenido_revision = contenido_revision + 1,
                contenido_actualizado_en = CURRENT_TIMESTAMP,
                pdf_estado = 'desactualizado'
            WHERE id = ?
            SQL)->execute([$certificateId]);

        $this->pdo->prepare(<<<'SQL'
            INSERT INTO cert_eventos_auditoria (certificado_id, tipo_evento, request_id, resultado, detalle_seguro)
            VALUES (?, 'sync_snapshot', ?, 'ok', ?)
            SQL)->execute([$certificateId, $this->requestId, substr('Exitoso. ' . $auditReason, 0, 255)]);
    }

    /** @return array<string, mixed> */
    private function attendanceDtoById(int $id): array
    {
        $statement = $this->pdo->prepare('SELECT a.id, a.alumno_id, cf.curso_id, a.curso_fecha_id, cf.fecha, cf.estado AS fecha_estado, a.registrado_en FROM cert_asistencias a JOIN cert_curso_fechas cf ON cf.id = a.curso_fecha_id WHERE a.id = ? LIMIT 1');
        $statement->execute([$id]);
        $row = $statement->fetch();

        if (!is_array($row)) {
            throw new AdminCertificateException(404, 'ATTENDANCE_NOT_FOUND', 'Asistencia no encontrada.');
        }

        return $this->attendanceDto($row);
    }

    private function ensureCourseExists(int $courseId): void
    {
        $statement = $this->pdo->prepare('SELECT 1 FROM cert_cursos WHERE id = ? LIMIT 1');
        $statement->execute([$courseId]);
        if ($statement->fetchColumn() === false) {
            throw new AdminCertificateException(404, 'COURSE_NOT_FOUND', 'Curso no encontrado.');
        }
    }

    private function ensureActiveStudent(int $studentId): void
    {
        $statement = $this->pdo->prepare('SELECT 1 FROM cert_alumnos WHERE id = ? AND estado = \'activo\' LIMIT 1');
        $statement->execute([$studentId]);
        if ($statement->fetchColumn() === false) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }
    }

    private function ensureActiveCourse(int $courseId): void
    {
        $statement = $this->pdo->prepare('SELECT 1 FROM cert_cursos WHERE id = ? AND estado = \'activo\' LIMIT 1');
        $statement->execute([$courseId]);
        if ($statement->fetchColumn() === false) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }
    }

    private function ensureEligibleCourseDate(int $courseId, int $dateId): void
    {
        $statement = $this->pdo->prepare('SELECT 1 FROM cert_curso_fechas WHERE id = ? AND curso_id = ? AND estado IN (\'programada\', \'realizada\') LIMIT 1');
        $statement->execute([$dateId, $courseId]);
        if ($statement->fetchColumn() === false) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }
    }

    private function nextDateOrder(int $courseId): int
    {
        $statement = $this->pdo->prepare('SELECT COALESCE(MAX(orden), 0) FROM cert_curso_fechas WHERE curso_id = ?');
        $statement->execute([$courseId]);

        return $this->courseDateOrder((int) $statement->fetchColumn() + 1);
    }

    /** @param array<string, mixed> $row @return array<string, mixed> */
    private function courseDto(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'codigo' => (string) $row['codigo'],
            'nombre' => (string) $row['nombre'],
            'estado' => (string) $row['estado'],
            'createdAt' => (string) $row['created_at'],
            'updatedAt' => (string) $row['updated_at'],
        ];
    }

    /** @param array<string, mixed> $row @return array<string, mixed> */
    private function studentDto(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'apellidoNombre' => (string) $row['apellido_nombre'],
            'dniMostrar' => (string) $row['dni_mostrar'],
            'estado' => (string) $row['estado'],
        ];
    }

    /** @param array<string, mixed> $row @return array<string, mixed> */
    private function courseDateDto(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'cursoId' => (int) $row['curso_id'],
            'fecha' => (string) $row['fecha'],
            'descripcion' => is_string($row['descripcion'] ?? null) ? $row['descripcion'] : null,
            'orden' => (int) $row['orden'],
            'estado' => (string) $row['estado'],
        ];
    }

    /** @param array<string, mixed> $row @return array<string, mixed> */
    private function attendanceDto(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'alumnoId' => (int) $row['alumno_id'],
            'cursoId' => (int) $row['curso_id'],
            'cursoFechaId' => (int) $row['curso_fecha_id'],
            'fecha' => (string) $row['fecha'],
            'fechaEstado' => (string) $row['fecha_estado'],
            'registradoEn' => (string) $row['registrado_en'],
        ];
    }

    private function validDniKey(): string
    {
        if ($this->dniCipherKey === null || strlen($this->dniCipherKey) !== 32) {
            throw new AdminCertificateException(500, 'CONFIGURATION_ERROR', 'No se pudo procesar la solicitud.');
        }

        return $this->dniCipherKey;
    }

    private function normalizeDni(mixed $value): string
    {
        if (!is_string($value) && !is_int($value)) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }
        $dni = preg_replace('/\D+/', '', (string) $value) ?? '';
        if (strlen($dni) < 7 || strlen($dni) > 10) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }

        return $dni;
    }

    private function maskDni(string $dni): string
    {
        return substr($dni, 0, 2) . str_repeat('*', max(strlen($dni) - 4, 0)) . substr($dni, -2);
    }

    private function hashDni(string $dni, string $key): string
    {
        return hash_hmac('sha256', $dni, $key, true);
    }

    /** @param list<string> $allowed */
    private function enum(mixed $value, array $allowed): string
    {
        if (!is_string($value) || !in_array($value, $allowed, true)) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }

        return $value;
    }

    private function positiveId(mixed $value): int
    {
        $int = filter_var($value, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if (!is_int($int)) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }

        return $int;
    }

    private function courseDateOrder(mixed $value): int
    {
        $int = filter_var($value, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => self::MAX_DATE_ORDER]]);
        if (!is_int($int)) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }

        return $int;
    }

    private function shortString(mixed $value, int $max): string
    {
        if (!is_string($value)) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }
        $value = trim($value);
        if ($value === '' || mb_strlen($value) > $max) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }

        return $value;
    }

    private function nullableString(mixed $value, int $max): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }
        if (!is_string($value) || mb_strlen(trim($value)) > $max) {
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

    private function throwConflictForUnique(PDOException $exception, string ...$constraints): void
    {
        if (($exception->errorInfo[0] ?? $exception->getCode()) !== '23000') {
            return;
        }
        $message = $exception->errorInfo[2] ?? $exception->getMessage();
        foreach ($constraints as $constraint) {
            if (is_string($message) && str_contains($message, $constraint)) {
                throw new AdminCertificateException(409, 'CONFLICT', 'El recurso ya existe.');
            }
        }
    }
}
