# Modelo de datos — Certificados QR

Este documento define el esquema MariaDB para la verificación pública de certificados QR. La migración controlada vive en `database/migrations/001_certificados_qr.sql` y no contiene datos reales.

## Decisión principal

| Tema | Decisión |
|---|---|
| Motor | MariaDB 10.6.27, `InnoDB`, `utf8mb4` |
| Prefijo | Todas las tablas nuevas usan `cert_` |
| Token QR | Permanente. El token público no se guarda en texto plano; se guarda `SHA-256(token + pepper_servidor)` como `BINARY(32)`. El reenvío normal no rota token. |
| Pepper | Debe vivir fuera de Git, en configuración real del servidor |
| Datos públicos | DNI completo visible por decisión institucional (D0), estado, código, curso, fecha de emisión y fechas asistidas |
| Auditoría | Eventos mínimos sin DNI completo, token completo, SQL ni credenciales |

## Tablas

### `cert_certificados`

Registra el certificado emitido y los datos mínimos necesarios para la respuesta pública.

| Campo | Tipo | Regla |
|---|---|---|
| `id` | `BIGINT UNSIGNED` | PK autoincremental |
| `codigo_certificado` | `VARCHAR(40)` | Único, visible públicamente |
| `estado` | `ENUM` | `borrador`, `vigente`, `revocado`, `vencido` |
| `alumno_nombre_mostrar` | `VARCHAR(160)` | Nombre de visualización para respuesta pública |
| `documento_hash` | `BINARY(32)` | Huella no reversible para control interno futuro |
| `documento_enmascarado` | `VARCHAR(20)` | Ejemplo: `12******90`. Columna legacy presente en la migración `001`. El DTO público usa DNI completo por D0; este campo no alcanza para la validación pública. |
| `curso_nombre` | `VARCHAR(180)` | Nombre del curso o trayecto |
| `emitido_en` | `DATE` | Fecha de emisión |
| `vence_en` | `DATE NULL` | Vencimiento opcional |
| `revocado_en` | `DATETIME NULL` | Revocación opcional |
| `motivo_revocacion` | `VARCHAR(180) NULL` | Motivo interno breve, sin datos sensibles |
| `created_at`, `updated_at` | `DATETIME` | Timestamps técnicos |

> **DNI completo: no migrado todavía.** La migración controlada `001_certificados_qr.sql` solo crea `documento_hash` y `documento_enmascarado`. El DTO público D0 exige DNI completo, pero **no existe columna `documento_completo` migrada**. Cualquier backend que siga el modelo actual no podría satisfacer el DTO D0. La columna `documento_completo` queda como **planificación futura** (ver "Tablas futuras" y el split `backend-contrato-token-permanente-dni-fechas` / `backend-token-permanente-dni-fechas`). No documentar `documento_completo` como columna actual de `cert_certificados` hasta que exista una migración controlada que la cree.

Índices: único por `codigo_certificado`, índice por `estado`, índice por `emitido_en`.

### `cert_tokens_verificacion`

Guarda tokens verificables por QR sin conservar el valor público.

| Campo | Tipo | Regla |
|---|---|---|
| `id` | `BIGINT UNSIGNED` | PK autoincremental |
| `certificado_id` | `BIGINT UNSIGNED` | FK a `cert_certificados.id` |
| `token_hash` | `BINARY(32)` | Único; hash del token público con pepper. Lookup y verificación pública. No reversible. |
| `token_prefijo` | `VARCHAR(12)` | Prefijo mínimo para soporte, nunca token completo |
| `token_cifrado` | `VARBINARY(255) NULL` | **Planificado, no migrado.** Token completo cifrado (o URL pública cifrada) con clave externa a Git. Habilita reenvío/regeneración de PDF conservando el QR sin rotar. Hash-only NO permite reenvío permanente. Se crea en migración futura (`backend-token-permanente-storage`). |
| `estado` | `ENUM` | `activo`, `revocado`, `vencido` |
| `vigente_desde`, `vigente_hasta` | `DATETIME` | Ventana de validez |
| `ultimo_uso_en` | `DATETIME NULL` | Última verificación pública |
| `created_at`, `revocado_en` | `DATETIME` | Timestamps técnicos |

Índices: único por `token_hash`, índice por `certificado_id`, índice por `estado`, índice por `vigente_hasta`.

### `cert_eventos_auditoria`

Registra eventos operativos sin exponer datos personales completos.

| Campo | Tipo | Regla |
|---|---|---|
| `id` | `BIGINT UNSIGNED` | PK autoincremental |
| `certificado_id` | `BIGINT UNSIGNED NULL` | FK opcional |
| `tipo_evento` | `ENUM` | `emision`, `verificacion`, `revocacion`, `reenvio`, `error` |
| `resultado` | `ENUM` | `ok`, `rechazado`, `error` |
| `request_id` | `VARCHAR(80) NULL` | Correlación segura |
| `token_hash_prefijo` | `VARCHAR(16) NULL` | Huella truncada no reversible |
| `ip_hash_prefijo` | `VARCHAR(16) NULL` | Huella truncada si se registra IP |
| `detalle_seguro` | `VARCHAR(255) NULL` | Mensaje sin valores sensibles |
| `created_at` | `DATETIME` | Fecha del evento |

Índices: `certificado_id`, `tipo_evento`, `resultado`, `created_at`.

## Lookup público

1. Validar formato del token antes de consultar la base.
2. Calcular `SHA-256(token + pepper_servidor)` en backend futuro.
3. Buscar en `cert_tokens_verificacion.token_hash` con prepared statements.
4. Responder `404 CERTIFICATE_NOT_FOUND` para token inexistente, revocado, vencido o certificado no vigente.
5. Devolver solo el DTO definido en `docs/backend/01-contrato-api-certificados.md`.

## Fixtures permitidos

`database/seeds/001_certificados_qr_demo.sql` contiene datos ficticios explícitos. No representa personas reales, DNIs reales ni tokens productivos.

El seed demo usa un token ficticio válido para el contrato público y guarda `token_hash` como binario mediante `UNHEX(SHA2(CONCAT(token_demo, pepper_demo), 256))`, alineado con el cálculo PHP `hash('sha256', $token . $tokenPepper, true)`. La coherencia entre seed y lookup quedó verificada con un MariaDB 10.6 local ficticio durante el ciclo `backend-validacion-publica-certificados`: el token demo `TOKEN_DEMO_FICTICIO_VALIDO_2026_0001` y el pepper de ejemplo `pepper_demo_ficticio_2026_no_usar` resuelven correctamente a un certificado vigente y devuelven `200` con DTO público.

## Rollback

La migración documenta `DROP TABLE` en orden inverso: primero `cert_eventos_auditoria`, luego `cert_tokens_verificacion`, finalmente `cert_certificados`.

## Tablas futuras (planificación D0, no migrar en este ciclo)

Las siguientes tablas quedan planificadas para ciclos SDD posteriores (M4-02 y siguientes). Usan prefijo `cert_`, migraciones controladas y no se crean en este ciclo documental.

| Tabla | Propósito |
|---|---|
| `cert_alumnos` | Alumnos. Diseño seguro recomendado: `dni_hash` (lookup/control), `dni_cifrado` (recuperación controlada) y `dni_mostrar VARCHAR(20) NULL` (DNI completo visible solo si la institución lo exige por D0). La clave de cifrado vive fuera de Git. Alternativa MVP explícita: `dni VARCHAR(20)` + `dni_hash`, aceptada solo con riesgo documentado (DNI en claro en base). Sin decisión explícita, se prefiere el diseño seguro. |
| `cert_cursos` | Cursos: id, codigo, nombre, estado, timestamps. |
| `cert_curso_fechas` | Fechas de cada curso: id, curso_id, fecha, descripcion opcional, estado, created_at. |
| `cert_asistencias` | Asistencias. **La presencia representa asistencia**: un registro existe si el alumno asistió a esa fecha. No hay booleano `presente` ni estados ausente/justificado. `UNIQUE(alumno_id, curso_fecha_id)`. `eliminado_en DATETIME NULL` solo si se necesita soft-delete para correcciones. |
| `cert_certificado_fechas` | Snapshot de fechas asistidas al momento de emisión. Permite reconstruir el PDF sin recalcular desde asistencias vivas. Las correcciones actualizan el snapshot o generan versión/auditoría y marcan `requiere_reenvio`. |
| `cert_configuracion_institucional` | Firmantes y config institucional (Rector/a, Asesor/a Pedagógica). |
| `cert_entregas_email` | Entregas/reenvíos por email (opcional, futuro). |
| `cert_admin_usuarios` | Usuarios admin para login real futuro (opcional, fuera de este ciclo). |

Reglas: FK correctas, índices por DNI/curso/fecha, unique para evitar asistencia duplicada, seeds ficticios, compatible MariaDB 10.6, sin datos reales.
