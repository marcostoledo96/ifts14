# Migración 011 — email opcional en alumnos

## Alcance

La migración `database/migrations/011_alumnos_email_opcional.sql` agrega la columna `email VARCHAR(180) NULL` a `cert_alumnos` para contacto opcional del alumno (D0 2026-07-20).

No modifica cifrado de DNI, endpoints ni frontend por sí sola.

## Cambio

| Columna | Tipo | Regla |
|---|---|---|
| `email` | `VARCHAR(180) NULL` | Email de contacto opcional al crear/editar alumno. Omitir o enviar `null` es válido. |

## Relación con D0

- **UI admin:** email visible cuando existe; ausencia indicada sin bloquear alta.
- **API admin:** `POST/PATCH /admin/alumnos` aceptan body sin `email` o con `email: null`.
- **Privacidad:** logs, auditoría, errores y dumps NO deben incluir email junto con DNI completo si el canal no es UI autorizada.

## Verificación local sugerida

1. Aplicar migraciones previas (`001`–`010` según entorno).
2. Aplicar `011_alumnos_email_opcional.sql`.
3. Confirmar `email` nullable en `cert_alumnos`.
4. Crear alumno sin email y otro con email ficticio; verificar persistencia y DTO admin.
