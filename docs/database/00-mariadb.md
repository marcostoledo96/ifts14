# Base de datos MariaDB 10.6.27

## Objetivo

Documentar el uso de MariaDB para el módulo de certificaciones QR.

## Reglas

- No versionar dumps reales.
- Usar migraciones SQL controladas.
- Usar seeds ficticios para demo.
- Preferir tablas con prefijo `cert_`.
- No modificar bases existentes sin backup y documentación.
- Token/QR permanente: el reenvío normal no rota token.
- DNI completo visible en validación pública (decisión D0); logs/auditoría sin DNI completo.

## Material descargado

Los dumps originales deben estar en:

```txt
material_privado_no_versionar/db_dumps_originales/
```

No deben versionarse.

## Modelo para certificados QR

El modelo queda definido en `docs/database/01-modelo-datos-certificados.md` y en migraciones controladas bajo `database/migrations/`.

| Concepto | Propósito |
|---|---|
| `cert_certificados` | Estado, código público, fecha de emisión y referencia al alumno/curso. |
| `cert_tokens_verificacion` | Hash del token público, vigencia, revocación y último uso. |
| `cert_eventos_auditoria` | Eventos no sensibles de emisión, verificación, revocación o reenvío. |
| `cert_alumnos` | Identidad de alumnos con DNI seguro (`dni_hash`, `dni_cifrado`, `dni_mostrar`). |
| `cert_cursos` | Cursos certificables con código, nombre y estado. |
| `cert_curso_fechas` | Fechas normalizadas del curso con orden estable. |
| `cert_asistencias` | Presencia por existencia de fila, sin booleano de asistencia. |
| `cert_certificado_fechas` | Snapshot materializado de fechas certificadas al momento de emisión. |
| `cert_configuracion_institucional` | Configuración single-row para firmantes y texto institucional. |

Los tokens públicos no se guardan en texto plano. El backend futuro debe comparar contra `token_hash` calculado con hash criptográfico y pepper fuera de Git. El token/QR es permanente: el reenvío normal no rota token; solo revocación explícita o regeneración excepcional auditada invalidan el token.

## Migraciones vigentes

| # | Archivo | Contenido |
|---|---|---|
| 001 | `001_certificados_qr.sql` | Certificados, tokens, auditoría. |
| 002 | `002_token_cifrado_entrega_manual.sql` | `token_cifrado` recuperable (sin rotar QR). |
| 003 | `003_cursos_alumnos_asistencias.sql` | Alumnos, cursos, fechas, asistencias, snapshot, config institucional. |
| 004 | `004_certificados_alumno_curso.sql` | FK alumno/curso en certificados. |
| 005 | `005_prevenir_certificados_duplicados.sql` | Un certificado activo por alumno+curso. |
| 006 | `006_reconciliar_esquema_m4_02.sql` | Reconciliación de esquema. |
| 007 | `007_schema_migrations.sql` | Tabla de control de migraciones. |
| 008 | `008_certificados_revision_contenido.sql` | Revisión de contenido PDF. |
| 009 | `009_auditoria_sync_snapshot.sql` | Auditoría de sync de snapshot. |
| 010 | `010_backfill_pdf_revision.sql` | Backfill revisión PDF. |
| 011 | `011_alumnos_email_opcional.sql` | Email nullable. |
| 012 | `012_alumnos_apellido_nombre_separados.sql` | Apellido/nombre separados. |
| 013 | `013_parametros_sistema.sql` | Parámetros de sistema. |
| 014 | `014_firmas_autoridades.sql` | Firmas institucionales. |
| 015 | `015_certificados_estados_vigente_revocado.sql` | Estados `vigente` \| `revocado`. |

Detalle por migración en `database/docs/` cuando exista. Seeds solo ficticios bajo `database/seeds/`.

## Material privado

Dumps originales (si existen) solo en `material_privado_no_versionar/`. Nunca versionar. El módulo usa tablas `cert_*` propias.
