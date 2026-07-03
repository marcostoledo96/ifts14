## Exploration: API admin mínima para cursos, alumnos, fechas y asistencias

### Current State

El backend ya tiene implementados los ciclos M4-01B (token permanente + entrega manual), M4-02 (modelo de cursos, alumnos, fechas y asistencias) y M4-04 (emisión desde asistencias). La API en `apps/backend-php/index.php` expone validación pública, emisión, revocación, descarga de PDF y entrega manual, todas con `X-Admin-Key` y el sobre de errores estable.

Sin embargo, no existen endpoints administrativos para crear ni mantener las entidades de datos maestros: `cert_cursos`, `cert_alumnos`, `cert_curso_fechas` y `cert_asistencias`. Hoy Bedelía debería editar la base de datos a mano para cargar cursos, alumnos, fechas y asistencias antes de poder emitir un certificado. Este ciclo cierra ese gap con la API admin mínima indispensable para que M4-04 tenga datos reales sin intervención manual en la DB.

### Affected Areas

- `apps/backend-php/index.php` — agregar rutas admin para cursos, alumnos, fechas y asistencias, reusando `requireAdmin`, `requireJsonContentType`, `readJsonBody` y `respondToAdmin`.
- `apps/backend-php/src/AdminMasterDataService.php` — nuevo servicio con CRUD mínimo y búsquedas. Reutiliza `Database::pdo`, `DniCipher`, `AuthGate` y convenciones de auditoria segura.
- `apps/backend-php/src/AdminCertificateService.php` — sus métodos privados `loadActiveStudent`, `loadActiveCourse` y `loadActiveAttendances` ya leen las tablas afectadas; no se modifica la emisión, pero conviene evaluar si esos helpers pasan a un repositorio compartido para evitar duplicación.
- `docs/backend/01-contrato-api-certificados.md` — documentar endpoints, DTOs, errores y restricciones de privacidad (DNI enmascarado en respuestas admin).
- `openspec/specs/backend-contrato-api-certificados/spec.md` — agregar requerimientos delta para la API de datos maestros.
- `apps/backend-php/tests/` — scripts de prueba procedural (sin framework) para validar los endpoints nuevos con fixtures ficticios.

### Approaches

1. **Servicio único `AdminMasterDataService` + rutas en `index.php`** — CRUD de todas las entidades maestras en una clase cohesa, con métodos pequeños y transacciones por operación.
   - Pros: menor cantidad de archivos, reutiliza el patrón ya usado por `AdminCertificateService`, mantiene el router central en `index.php`, fácil de probar con scripts procedurales.
   - Cons: si el CRUD crece mucho, el servicio puede agrandarse; se mitiga manteniendo métodos atómicos.
   - Effort: Medium

2. **Separar en controladores/servicios por entidad** — Un archivo por dominio (`CourseService`, `StudentService`, `AttendanceService`) con sus propios endpoints.
   - Pros: más escalable si el negocio crece, separación de responsabilidades más visible.
   - Cons: más archivos y boilerplate para un MVP; duplica configuración de auth y envelopes; no aporta valor real hasta que el CRUD sea grande.
   - Effort: High

### Recommendation

Adoptar la **opción 1**: un único `AdminMasterDataService` con rutas en `index.php`. Es el camino más lazy y seguro: reutiliza lo que ya existe, toca pocos archivos y cubre el MVP sin inventar abstracciones para un solo uso. Si más adelante el CRUD crece, se puede refactorizar a controladores por entidad.

### Risks

- **DNI en respuestas administrativas**: la creación de alumno requiere cifrar el DNI con `dni_cipher_key`, y las respuestas admin solo deben devolver `dniMostrar` o máscara, nunca DNI completo. El DNI completo queda reservado al DTO público de validación (decisión D0).
- **Clave de cifrado requerida**: los endpoints que crean alumnos necesitan `dni_cipher_key` válida; si falta, debe responder `500 CONFIGURATION_ERROR` sin persistir.
- **Asistencias duplicadas**: la tabla `cert_asistencias` impide una asistencia activa duplicada por `alumno_id` + `curso_fecha_id` mediante la columna generada `asistencia_activa`. El endpoint de alta debe capturar el error de DB y devolver `409 CONFLICT` o `400 VALIDATION_ERROR` según el contrato.
- **Eliminación lógica de asistencias**: no hay booleano `presente`; la ausencia de fila activa significa ausente. La baja debe hacer `UPDATE cert_asistencias SET eliminado_en = CURRENT_TIMESTAMP`, no `DELETE`.
- **Estado de curso y fecha**: solo cursos `activo` y fechas `programada|realizada` son elegibles para asistencias y emisión; conviene validarlo en alta de asistencias.
- **Auditoria segura**: los eventos de datos maestros no deben incluir DNI completo, token, claves ni SQL.

### Ready for Proposal

Sí. La exploración confirma que el backend ya tiene auth, envelope, errores, PDO y cifrado listos; solo falta exponer CRUD admin de datos maestros. El alcance es claro, los riesgos son manejables y la implementación puede reutilizar patrones existentes.
