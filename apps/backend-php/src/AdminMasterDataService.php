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
            $where = 'WHERE c.estado = ?';
            $params[] = $state;
        }

        $statement = $this->pdo->prepare(
            'SELECT c.id, c.codigo, c.nombre, c.estado, c.created_at, c.updated_at,'
            . ' (SELECT COUNT(*) FROM cert_curso_fechas f WHERE f.curso_id = c.id) AS cantidad_fechas'
            . " FROM cert_cursos c {$where} ORDER BY c.id ASC"
        );
        $statement->execute($params);

        return ['items' => array_map(fn (array $row): array => $this->courseDto($row), $statement->fetchAll())];
    }

    /** @return array<string, mixed> */
    public function getCourse(int $id): array
    {
        $statement = $this->pdo->prepare(
            'SELECT c.id, c.codigo, c.nombre, c.estado, c.created_at, c.updated_at,'
            . ' (SELECT COUNT(*) FROM cert_curso_fechas f WHERE f.curso_id = c.id) AS cantidad_fechas'
            . ' FROM cert_cursos c WHERE c.id = ? LIMIT 1'
        );
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

    /**
     * Actualiza código y/o nombre del curso.
     *
     * @param array<string, mixed> $body
     * @return array<string, mixed>
     */
    public function updateCourse(int $id, array $body): array
    {
        $id = $this->positiveId($id);
        $current = $this->getCourse($id);

        $hasCodigo = array_key_exists('codigo', $body);
        $hasNombre = array_key_exists('nombre', $body);
        if (!$hasCodigo && !$hasNombre) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }

        $code = $hasCodigo ? $this->shortString($body['codigo'] ?? null, 40) : (string) $current['codigo'];
        $name = $hasNombre ? $this->shortString($body['nombre'] ?? null, 180) : (string) $current['nombre'];

        try {
            $statement = $this->pdo->prepare('UPDATE cert_cursos SET codigo = ?, nombre = ? WHERE id = ?');
            $statement->execute([$code, $name, $id]);
        } catch (PDOException $exception) {
            $this->throwConflictForUnique($exception, 'uq_cert_cursos_codigo');
            throw $exception;
        }

        return $this->getCourse($id);
    }

    /** @param array<string, mixed> $body @return array<string, mixed> */
    public function createStudent(array $body): array
    {
        $key = $this->validDniKey();
        $apellido = $this->shortString($body['apellido'] ?? null, 80);
        $nombre = $this->shortString($body['nombre'] ?? null, 80);
        $apellidoNombre = $this->composeApellidoNombre($apellido, $nombre);
        $dni = $this->normalizeDni($body['dni'] ?? null);
        $state = isset($body['estado']) ? $this->enum($body['estado'], self::STUDENT_STATES) : 'activo';
        $dniHash = $this->hashDni($dni, $key);
        $dniCipher = DniCipher::encrypt($dni, $key);
        // D0 2026-07-20: UI admin muestra DNI completo (dni_mostrar = dígitos).
        $dniDisplay = $dni;
        $email = $this->optionalEmail($body['email'] ?? null);

        $existingId = $this->findStudentIdByDniHash($dniHash);
        if ($existingId !== null) {
            throw new AdminCertificateException(
                409,
                'CONFLICT',
                'El recurso ya existe.',
                ['existingStudentId' => $existingId],
            );
        }

        try {
            $statement = $this->pdo->prepare(
                'INSERT INTO cert_alumnos (apellido_nombre, apellido, nombre, email, dni_hash, dni_cifrado, dni_mostrar, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
            );
            $statement->bindValue(1, $apellidoNombre);
            $statement->bindValue(2, $apellido);
            $statement->bindValue(3, $nombre);
            $email === null
                ? $statement->bindValue(4, null, PDO::PARAM_NULL)
                : $statement->bindValue(4, $email);
            $statement->bindValue(5, $dniHash, PDO::PARAM_LOB);
            $statement->bindValue(6, $dniCipher, PDO::PARAM_LOB);
            $statement->bindValue(7, $dniDisplay);
            $statement->bindValue(8, $state);
            $statement->execute();
        } catch (PDOException $exception) {
            if ($this->isUniqueConstraint($exception, 'uq_cert_alumnos_dni_hash')) {
                $raceId = $this->findStudentIdByDniHash($dniHash);
                throw new AdminCertificateException(
                    409,
                    'CONFLICT',
                    'El recurso ya existe.',
                    $raceId !== null ? ['existingStudentId' => $raceId] : [],
                );
            }
            throw $exception;
        }

        return $this->getStudent((int) $this->pdo->lastInsertId());
    }

    private function findStudentIdByDniHash(string $dniHash): ?int
    {
        $statement = $this->pdo->prepare('SELECT id FROM cert_alumnos WHERE dni_hash = ? LIMIT 1');
        $statement->bindValue(1, $dniHash, PDO::PARAM_LOB);
        $statement->execute();
        $id = $statement->fetchColumn();
        if ($id === false) {
            return null;
        }

        $int = filter_var($id, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);

        return is_int($int) ? $int : null;
    }

    /** @return array<string, mixed> */
    public function listStudents(): array
    {
        $statement = $this->pdo->query(
            'SELECT id, apellido_nombre, apellido, nombre, email, dni_mostrar, dni_cifrado, estado FROM cert_alumnos ORDER BY id ASC'
        );

        return ['items' => array_map(fn (array $row): array => $this->studentDto($row), $statement->fetchAll())];
    }

    /** @return array<string, mixed> */
    public function getStudent(int $id): array
    {
        $statement = $this->pdo->prepare(
            'SELECT id, apellido_nombre, apellido, nombre, email, dni_mostrar, dni_cifrado, estado FROM cert_alumnos WHERE id = ? LIMIT 1'
        );
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

    /**
     * Actualiza datos personales del alumno (apellido, nombre, email, estado y/o dni).
     * Cambiar DNI exige `dni_cipher_key` válida (igual que el alta).
     *
     * @param array<string, mixed> $body
     * @return array<string, mixed>
     */
    public function updateStudent(int $id, array $body): array
    {
        $id = $this->positiveId($id);
        $statement = $this->pdo->prepare(
            'SELECT id, apellido_nombre, apellido, nombre, email, dni_mostrar, estado FROM cert_alumnos WHERE id = ? LIMIT 1'
        );
        $statement->execute([$id]);
        $row = $statement->fetch();
        if (!is_array($row)) {
            throw new AdminCertificateException(404, 'STUDENT_NOT_FOUND', 'Alumno no encontrado.');
        }

        $hasApellido = array_key_exists('apellido', $body);
        $hasNombre = array_key_exists('nombre', $body);
        $hasEmail = array_key_exists('email', $body);
        $hasEstado = array_key_exists('estado', $body);
        $hasDni = array_key_exists('dni', $body);
        if (!$hasApellido && !$hasNombre && !$hasEmail && !$hasEstado && !$hasDni) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }

        $apellido = $hasApellido
            ? $this->shortString($body['apellido'] ?? null, 80)
            : (string) ($row['apellido'] ?? '');
        $nombre = $hasNombre
            ? $this->shortString($body['nombre'] ?? null, 80)
            : (string) ($row['nombre'] ?? '');
        if ($hasApellido || $hasNombre) {
            // Tras edición parcial ambos deben quedar no vacíos.
            $apellido = $this->shortString($apellido !== '' ? $apellido : null, 80);
            $nombre = $this->shortString($nombre !== '' ? $nombre : null, 80);
        } else {
            // Sin tocar identidad: conservar o derivar desde apellido_nombre legado.
            if ($apellido === '' && $nombre === '') {
                $split = $this->splitApellidoNombre((string) ($row['apellido_nombre'] ?? ''));
                $apellido = $split['apellido'];
                $nombre = $split['nombre'];
            }
        }
        $apellidoNombre = $this->composeApellidoNombre($apellido, $nombre);
        $email = $hasEmail
            ? $this->optionalEmail($body['email'] ?? null)
            : (is_string($row['email'] ?? null) && trim((string) $row['email']) !== ''
                ? trim((string) $row['email'])
                : null);
        $state = $hasEstado
            ? $this->enum($body['estado'] ?? null, self::STUDENT_STATES)
            : (string) $row['estado'];

        if ($hasDni) {
            $key = $this->validDniKey();
            $dni = $this->normalizeDni($body['dni'] ?? null);
            $dniHash = $this->hashDni($dni, $key);
            $dniCipher = DniCipher::encrypt($dni, $key);
            $existingId = $this->findStudentIdByDniHash($dniHash);
            if ($existingId !== null && $existingId !== $id) {
                throw new AdminCertificateException(
                    409,
                    'CONFLICT',
                    'El recurso ya existe.',
                    ['existingStudentId' => $existingId],
                );
            }

            try {
                $update = $this->pdo->prepare(
                    'UPDATE cert_alumnos SET apellido_nombre = ?, apellido = ?, nombre = ?, email = ?, estado = ?, dni_hash = ?, dni_cifrado = ?, dni_mostrar = ? WHERE id = ?'
                );
                $update->bindValue(1, $apellidoNombre);
                $update->bindValue(2, $apellido);
                $update->bindValue(3, $nombre);
                $email === null
                    ? $update->bindValue(4, null, PDO::PARAM_NULL)
                    : $update->bindValue(4, $email);
                $update->bindValue(5, $state);
                $update->bindValue(6, $dniHash, PDO::PARAM_LOB);
                $update->bindValue(7, $dniCipher, PDO::PARAM_LOB);
                $update->bindValue(8, $dni);
                $update->bindValue(9, $id);
                $update->execute();
            } catch (PDOException $exception) {
                if ($this->isUniqueConstraint($exception, 'uq_cert_alumnos_dni_hash')) {
                    $raceId = $this->findStudentIdByDniHash($dniHash);
                    throw new AdminCertificateException(
                        409,
                        'CONFLICT',
                        'El recurso ya existe.',
                        $raceId !== null && $raceId !== $id ? ['existingStudentId' => $raceId] : [],
                    );
                }
                throw $exception;
            }
        } else {
            $update = $this->pdo->prepare(
                'UPDATE cert_alumnos SET apellido_nombre = ?, apellido = ?, nombre = ?, email = ?, estado = ? WHERE id = ?'
            );
            $update->bindValue(1, $apellidoNombre);
            $update->bindValue(2, $apellido);
            $update->bindValue(3, $nombre);
            $email === null
                ? $update->bindValue(4, null, PDO::PARAM_NULL)
                : $update->bindValue(4, $email);
            $update->bindValue(5, $state);
            $update->bindValue(6, $id);
            $update->execute();
        }

        return $this->getStudent($id);
    }

    /**
     * Payload único para el hub de asistencias admin (evita N+1 de fechas/asistencias por curso).
     *
     * @return array<string, mixed>
     */
    public function attendanceHub(): array
    {
        $fechasStatement = $this->pdo->query(
            'SELECT id, curso_id, fecha, descripcion, orden, estado FROM cert_curso_fechas ORDER BY curso_id ASC, orden ASC, fecha ASC'
        );
        $alumnosActivos = (int) $this->pdo->query(
            "SELECT COUNT(*) FROM cert_alumnos WHERE estado = 'activo'"
        )->fetchColumn();

        return [
            'cursos' => $this->listCourses()['items'],
            'fechas' => array_map(
                fn (array $row): array => $this->courseDateDto($row),
                $fechasStatement->fetchAll(),
            ),
            'asistencias' => $this->listAttendances(null, null)['items'],
            'alumnosActivos' => $alumnosActivos,
        ];
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

            $refresh = $this->refreshCourseDateEstado($courseId, $dateId);
            if ($refresh['previous'] === 'realizada' || $refresh['current'] === 'realizada') {
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

            $refresh = $this->refreshCourseDateEstado((int) $attendance['cursoId'], (int) $attendance['cursoFechaId']);
            if ($refresh['previous'] === 'realizada' || $refresh['current'] === 'realizada') {
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

    /**
     * Auto-gestión programada/realizada tras escritura de asistencias.
     * Nunca modifica cancelada. Día local America/Argentina/Buenos_Aires.
     * `realizada` si ≥1 asistencia activa y fecha <= hoy (incluye same-day).
     *
     * @return array{previous: string, current: string, changed: bool}
     */
    private function refreshCourseDateEstado(int $courseId, int $dateId): array
    {
        $courseDate = $this->getCourseDate($courseId, $dateId);
        $previous = (string) $courseDate['estado'];
        if ($previous === 'cancelada') {
            return ['previous' => $previous, 'current' => $previous, 'changed' => false];
        }

        $today = (new DateTimeImmutable('now', new DateTimeZone('America/Argentina/Buenos_Aires')))->format('Y-m-d');
        $countStatement = $this->pdo->prepare(
            'SELECT COUNT(*) FROM cert_asistencias WHERE curso_fecha_id = ? AND eliminado_en IS NULL'
        );
        $countStatement->execute([$dateId]);
        $activeCount = (int) $countStatement->fetchColumn();

        // Same-day con presentes cuenta como realizada (permite emitir el día de la clase).
        $fecha = (string) $courseDate['fecha'];
        $current = ($activeCount >= 1 && $fecha <= $today) ? 'realizada' : 'programada';
        if ($current === $previous) {
            return ['previous' => $previous, 'current' => $current, 'changed' => false];
        }

        $update = $this->pdo->prepare(
            'UPDATE cert_curso_fechas SET estado = ? WHERE id = ? AND curso_id = ? AND estado <> \'cancelada\''
        );
        $update->execute([$current, $dateId, $courseId]);

        return ['previous' => $previous, 'current' => $current, 'changed' => true];
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
        $dto = [
            'id' => (int) $row['id'],
            'codigo' => (string) $row['codigo'],
            'nombre' => (string) $row['nombre'],
            'estado' => (string) $row['estado'],
            'createdAt' => (string) $row['created_at'],
            'updatedAt' => (string) $row['updated_at'],
        ];
        if (array_key_exists('cantidad_fechas', $row)) {
            $dto['cantidadFechas'] = (int) $row['cantidad_fechas'];
        }

        return $dto;
    }

    /** @param array<string, mixed> $row @return array<string, mixed> */
    private function studentDto(array $row): array
    {
        $email = is_string($row['email'] ?? null) && trim($row['email']) !== ''
            ? trim((string) $row['email'])
            : null;

        $apellido = trim((string) ($row['apellido'] ?? ''));
        $nombre = trim((string) ($row['nombre'] ?? ''));
        if ($apellido === '' && $nombre === '') {
            $split = $this->splitApellidoNombre((string) ($row['apellido_nombre'] ?? ''));
            $apellido = $split['apellido'];
            $nombre = $split['nombre'];
        }
        $apellidoNombre = $this->composeApellidoNombre($apellido, $nombre);
        if ($apellidoNombre === '' && is_string($row['apellido_nombre'] ?? null)) {
            $apellidoNombre = trim((string) $row['apellido_nombre']);
        }

        return [
            'id' => (int) $row['id'],
            'apellido' => $apellido,
            'nombre' => $nombre,
            'apellidoNombre' => $apellidoNombre,
            'dniMostrar' => $this->adminDniDisplay($row),
            'email' => $email,
            'estado' => (string) $row['estado'],
        ];
    }

    private function composeApellidoNombre(string $apellido, string $nombre): string
    {
        return trim($apellido . ' ' . $nombre);
    }

    /** @return array{apellido: string, nombre: string} */
    private function splitApellidoNombre(string $apellidoNombre): array
    {
        $trimmed = trim($apellidoNombre);
        $commaIdx = strpos($trimmed, ',');
        if ($commaIdx !== false) {
            return [
                'apellido' => trim(substr($trimmed, 0, $commaIdx)),
                'nombre' => trim(substr($trimmed, $commaIdx + 1)),
            ];
        }
        $spaceIdx = strpos($trimmed, ' ');
        if ($spaceIdx === false) {
            return ['apellido' => $trimmed, 'nombre' => ''];
        }

        return [
            'apellido' => trim(substr($trimmed, 0, $spaceIdx)),
            'nombre' => trim(substr($trimmed, $spaceIdx + 1)),
        ];
    }

    /** DNI completo para UI admin (D0 2026-07-20). Filas históricas enmascaradas se descifran. */
    /** @param array<string, mixed> $row */
    private function adminDniDisplay(array $row): string
    {
        $display = (string) ($row['dni_mostrar'] ?? '');
        if ($display !== '' && !str_contains($display, '*')) {
            return $display;
        }
        $cipher = $row['dni_cifrado'] ?? null;
        if ($cipher === null) {
            return $display;
        }
        try {
            $blob = is_resource($cipher) ? stream_get_contents($cipher) : (string) $cipher;
            if (!is_string($blob) || $blob === '') {
                return $display;
            }

            return DniCipher::decrypt($blob, $this->validDniKey());
        } catch (Throwable) {
            return $display;
        }
    }

    private function optionalEmail(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }
        if (!is_string($value)) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }
        $email = trim($value);
        if ($email === '') {
            return null;
        }
        if (strlen($email) > 180 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }

        return $email;
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
        if (strlen($dni) < 6 || strlen($dni) > 10) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }

        return $dni;
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

    private function isUniqueConstraint(PDOException $exception, string $constraint): bool
    {
        if (($exception->errorInfo[0] ?? $exception->getCode()) !== '23000') {
            return false;
        }
        $message = $exception->errorInfo[2] ?? $exception->getMessage();

        return is_string($message) && str_contains($message, $constraint);
    }

    private function throwConflictForUnique(PDOException $exception, string ...$constraints): void
    {
        foreach ($constraints as $constraint) {
            if ($this->isUniqueConstraint($exception, $constraint)) {
                throw new AdminCertificateException(409, 'CONFLICT', 'El recurso ya existe.');
            }
        }
    }
}
