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

| Migración | Estado | Contenido |
|---|---|---|
| `database/migrations/001_certificados_qr.sql` | Base | Certificados, tokens de verificación y auditoría segura. |
| `database/migrations/002_token_cifrado_entrega_manual.sql` | Aditiva | `token_cifrado` recuperable para entrega manual sin rotar QR/token. |
| `database/migrations/003_cursos_alumnos_asistencias.sql` | Aditiva | Alumnos, cursos, fechas, asistencias, snapshot de fechas y configuración institucional. |
| `database/migrations/004_certificados_alumno_curso.sql` | Aditiva | `alumno_id` y `curso_id` nullable en certificados, con índices y FKs para emisión desde asistencias. |
| `database/migrations/005_prevenir_certificados_duplicados.sql` | Integridad | Columna generada determinística e índice único para impedir un certificado activo duplicado por alumno y curso. |

El detalle operativo de `004` vive en `database/docs/004-certificados-alumno-curso.md`; el de `005`, en `database/docs/005-prevenir-certificados-duplicados.md`. El seed ficticio opcional `database/seeds/002_cursos_alumnos_asistencias_demo.sql` sirve para verificar relaciones locales. No se usa en producción ni contiene datos reales.

## Hallazgos de auditoría (hipótesis)

- **Observado**: hay dos dumps SQL originales bajo `material_privado_no_versionar/db_dumps_originales/`, ambos ignorados por Git.
- **Observado**: la extracción DDL segura detectó tablas vinculadas a materias, docentes, carreras/tecnicaturas, horarios, publicaciones, anuncios y contacto.
- **Hipótesis**: los dumps corresponden a modelos relacionados pero no equivalentes; cualquier reutilización requiere migración controlada.
- **Hipótesis**: el módulo de certificaciones debe crear tablas nuevas con prefijo `cert_` y no depender de dumps reales versionados.
