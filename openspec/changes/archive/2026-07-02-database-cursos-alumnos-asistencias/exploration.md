## Exploration: database-cursos-alumnos-asistencias

### Current State

El backend ya emite certificados de forma manual sobre tres tablas existentes (`cert_certificados`, `cert_tokens_verificacion`, `cert_eventos_auditoria`) con la migración `001` y la columna `token_cifrado` agregada por `002`. La emisión actual (`AdminCertificateService::emitir`) recibe texto libre: `studentDisplayName`, `documentNumber`, `courseName`, `issuedAt`, `expiresAt`. No existe entidad `alumno`, `curso`, fechas de curso ni asistencias. El DTO público de validación todavía devuelve `documentMasked` y no incluye `attendedDates`; eso quedó para los ciclos M4-01A/B y M4-04/M4-05.

El modelo futuro está planificado en `docs/database/01-modelo-datos-certificados.md` como tablas `cert_alumnos`, `cert_cursos`, `cert_curso_fechas`, `cert_asistencias`, `cert_certificado_fechas` y `cert_configuracion_institucional`, pero sin migración ni spec detallada.

### Affected Areas

- `database/migrations/001_certificados_qr.sql` — base sobre la que aplicar migraciones aditivas.
- `database/migrations/002_token_cifrado_entrega_manual.sql` — ya aplica `token_cifrado`; M4-02 no la toca.
- `database/migrations/003_cursos_alumnos_asistencias.sql` — **nueva migración** con las tablas de cursos, alumnos, fechas, asistencias y snapshot.
- `database/seeds/001_certificados_qr_demo.sql` — ampliar con datos ficticios de cursos/alumnos/asistencias si el seed sigue siendo demo único.
- `docs/database/01-modelo-datos-certificados.md` — actualizar con el modelo real migrado y distinguirlo de las tablas futuras.
- `docs/database/00-mariadb.md` — reflejar que las tablas futuras pasan a migradas.
- `openspec/specs/database-cursos-alumnos-asistencias/spec.md` — **nueva spec** del ciclo.
- `apps/backend-php/src/AdminCertificateService.php` — **no se toca en M4-02**; queda para M4-04.
- `apps/backend-php/src/CertificateValidator.php` — **no se toca en M4-02**; el DTO con DNI completo y `attendedDates` es M4-01B/M4-04.
- `apps/backend-php/src/CertificatePdfService.php` — **no se toca en M4-02**; el PDF con fechas asistidas es M4-05.

### Approaches

1. **Docs/spec/migration únicamente (recomendado)**
   - Crear migración `003_cursos_alumnos_asistencias.sql` con las seis tablas, FKs, índices y reglas de integridad.
   - Actualizar documentación y spec; no modificar código PHP.
   - Pros: mantiene el split M4 intacto, reduce riesgo, permite que M4-03/M4-04/M4-01B asuman un modelo estable, cumple la regla de "un ciclo por vez".
   - Cons: no entrega funcionalidad visible inmediata; requiere ciclos posteriores para API y emisión real.
   - Effort: Medium.

2. **Docs/spec/migration + refactor preparatorio de `cert_certificados`**
   - Además de la migración, agregar `alumno_id` y `curso_id` nullable a `cert_certificados` como FKs hacia las nuevas tablas.
   - Pros: acelera M4-04 porque el certificado ya puede referenciar entidades reales.
   - Cons: toca una tabla existente y activa; aunque sea aditivo, amplía el diff y obliga a justificar el cambio en un ciclo que se declaró modelo-only.
   - Effort: Medium-High.

### Recommendation

Elegir la **opción 1**: M4-02 se limita a definir y migrar el modelo real de cursos, alumnos, fechas y asistencias, más su documentación y spec. No se toca código PHP. La vinculación de `cert_certificados` con `cert_alumnos`/`cert_cursos` se deja para M4-04 (`backend-emision-desde-asistencias`), que es el ciclo designado para cambiar el payload de emisión.

La columna `cert_certificado_fechas` debe modelarse como snapshot de fechas asistidas al momento de emisión, con `certificado_id` + `curso_fecha_id` (o fecha materializada) y soporte para correcciones mediante actualización del snapshot acompañada de auditoría. No se versiona el snapshot en este ciclo.

La asistencia se modela por existencia de fila en `cert_asistencias`, sin booleano `presente`, con `UNIQUE(alumno_id, curso_fecha_id)` y soft-delete opcional `eliminado_en` para correcciones.

### Risks

- La migración `003` asume que `001` y `002` ya están aplicadas; si no es así, falla por dependencias.
- DNI seguro (`dni_hash` + `dni_cifrado`) introduce una clave de cifrado más que debe vivir fuera de Git; si se elige el atajo MVP (`dni` en claro + `dni_hash`), debe quedar documentado como riesgo aceptado.
- `cert_asistencias` por fila sin booleano puede sorprender a quienes esperen un campo `presente`; hay que dejarlo explícito en la spec.
- El snapshot `cert_certificado_fechas` puede confundirse con las fechas vivas del curso; hay que aclarar que es una copia en el momento de emisión.
- Agregar tablas nuevas sin código que las use genera deuda de verificación; el seed ficticio y `mysqldump --no-data` serán los únicos checks ejecutables.

### Ready for Proposal

**Sí.** Se puede pasar a `sdd-propose` con el alcance cerrado: migración `003` + spec + docs, sin código PHP. Se necesita confirmar dos decisiones antes del proposal:

1. ¿DNI seguro por defecto (`dni_hash` + `dni_cifrado` + `dni_mostrar`) o atajo MVP con riesgo documentado?
2. ¿Se incluye soft-delete `eliminado_en` en `cert_asistencias` para correcciones?

### Result Contract

- **status**: `explored`
- **executive_summary**: M4-02 debe crear el modelo real MariaDB para cursos, alumnos, fechas de curso, asistencias (presencia por fila) y snapshot de fechas asistidas al emitir, mediante migración `003`, spec y docs. No se toca código PHP ni DTOs; eso corresponde a M4-03, M4-04, M4-01B y M4-05.
- **files_read**:
  - `AGENTS.md` (raíz y subcarpetas)
  - `README.md`
  - `GUIA.md`
  - `docs/00-indice-general.md`
  - `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`
  - `docs/database/01-modelo-datos-certificados.md`
  - `docs/database/00-mariadb.md`
  - `docs/backend/01-contrato-api-certificados.md`
  - `openspec/config.yaml`
  - `openspec/specs/backend-modelo-datos-certificados/spec.md`
  - `openspec/specs/admin-certificate-emission/spec.md`
  - `openspec/specs/certificate-pdf-qr-generation/spec.md`
  - `openspec/changes/archive/2026-07-02-backend-entrega-manual-certificados-operational-gates/archive-report.md`
  - `database/migrations/001_certificados_qr.sql`
  - `database/migrations/002_token_cifrado_entrega_manual.sql`
  - `database/seeds/001_certificados_qr_demo.sql`
  - `apps/backend-php/src/AdminCertificateService.php`
  - `apps/backend-php/src/CertificateValidator.php`
  - `apps/backend-php/src/CertificatePdfService.php`
  - `apps/backend-php/src/Config.php`
  - `apps/backend-php/config/certificados-config.example.php`
  - `apps/backend-php/index.php`
  - `apps/backend-php/tests/AdminCertificateServiceTest.php`
- **affected_areas**:
  - `database/migrations/` (nueva `003`)
  - `database/seeds/` (ampliación ficticia)
  - `docs/database/` (`00-mariadb.md`, `01-modelo-datos-certificados.md`)
  - `openspec/specs/database-cursos-alumnos-asistencias/spec.md` (nueva)
- **decisions_needed**:
  - Storage seguro del DNI vs atajo MVP en `cert_alumnos`.
  - Soft-delete `eliminado_en` en `cert_asistencias`.
  - Materialización de fechas en `cert_certificado_fechas` (referencia a `cert_curso_fechas.id` o fecha + descripción).
- **recommended_scope**:
  - Migración `003_cursos_alumnos_asistencias.sql` con `cert_alumnos`, `cert_cursos`, `cert_curso_fechas`, `cert_asistencias`, `cert_certificado_fechas`, `cert_configuracion_institucional`.
  - Spec OpenSpec con requirements y escenarios Given/When/Then.
  - Actualización de docs de base de datos.
  - Seed ficticio opcional.
  - Sin cambios en PHP, Angular, contratos API, PDF ni auth.
- **risks**: migraciones previas no aplicadas, clave de cifrado de DNI operativa, confusión snapshot vs fechas vivas, deuda de verificación sin código consumidor.
- **next_recommended**: `sdd-propose` para M4-02 con las dos decisiones pendientes resueltas.
- **skill_resolution**:
  - `sdd-explore`: aplicado.
  - `cognitive-doc-design`: aplicado para estructura del artefacto.
  - `karpathy-guidelines`: aplicado; no se asume funcionalidad extra ni se toca código fuera del alcance.
  - `ponytail`: aplicado; se elige la opción mínima (modelo-only) y se deja el código consumidor para ciclos posteriores.
