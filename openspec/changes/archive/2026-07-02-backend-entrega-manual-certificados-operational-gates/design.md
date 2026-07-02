# Diseño: cierre de gates operativos de entrega manual

## Enfoque técnico

Cerrar readiness operacional sin agregar funcionalidad. La implementación debe ejecutar solo verificaciones seguras sobre artefactos versionados y, si existen credenciales/configuración aprobadas sin leer secretos, aplicar/verificar migración y smoke HTTP DB-backed. Si falta entorno seguro, el resultado correcto es un gate exacto para operador, no evidencia simulada.

## Decisiones de arquitectura

| Opción | Tradeoff | Decisión |
|---|---|---|
| Ejecutar DB/smoke solo con entorno aprobado | Puede dejar gates pendientes | Elegida: evita leer secretos, dumps o config real no autorizada. |
| Validar migración `002` estáticamente antes de DB | No prueba estado real | Elegida como gate mínimo: confirma ALTER additive nullable y rollback comentado. |
| Refrescar Composer lock solo si Composer informa drift | Evita cambios innecesarios | Elegida: `composer validate --strict` y `composer update --lock` solo si hace falta; nunca tocar `vendor/`. |
| Confirmar ausencia de PHPMailer en artefactos versionados | No inspecciona `vendor/` | Elegida: revisar `composer.json`, `composer.lock`, docs y código versionado; `vendor/` queda artefacto operativo no versionado. |
| No crear scripts salvo necesidad clara | Menos automatización | Elegida: comandos documentados bastan; script/test nuevo solo si un gate no se puede expresar de forma segura. |

## Flujo de datos / gates

```txt
OpenSpec/Docs ──→ apply gates ──→ evidence or operator gate
        │              │
        │              ├─ Composer: validate/update lock, no vendor edits
        │              ├─ SQL: static check 002, optional DB apply/check
        │              └─ HTTP: optional DB-backed 200/409 smoke
        └─ archive ──→ specs/docs updated with verified state
```

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `openspec/changes/backend-entrega-manual-certificados-operational-gates/design.md` | Crear | Este diseño. |
| `apps/backend-php/composer.lock` | Modificar si hace falta | Solo por `composer update --lock` para alinear hash con `composer.json`. |
| `docs/deploy/00-cpanel-certificados.md` | Modificar mínimo | Registrar gates Composer/vendor, migración, smoke y rollback. |
| `docs/backend/00-php84-api.md` | Modificar mínimo | Registrar estado operativo de entrega manual si se verifica o queda gated. |
| `docs/backend/01-contrato-api-certificados.md` | Modificar mínimo | Solo si hace falta aclarar gate/ausencia PHPMailer sin cambiar contrato. |
| `docs/database/01-modelo-datos-certificados.md` | Modificar mínimo | Registrar verificación/aplicación de `002` o gate pendiente. |
| `openspec/specs/*/spec.md` | Modificar mínimo | Actualizar specs canónicas durante archive si los deltas se aceptan. |
| `apps/backend-php/vendor/` | No modificar | No leer ni versionar; solo documentar regeneración operativa. |

## Interfaces / contratos

No se agregan endpoints ni DTOs. Se verifica el contrato existente:

- `GET /certificados/api/admin/certificados/{id}/entrega-manual`
- éxito esperado: `200` con `certificadoId`, `publicValidationUrl`, `pdfDownloadUrl`, `tokenPrefix`
- legacy esperado: `409 TOKEN_NOT_RECOVERABLE`
- configuración externa requerida: `token_encryption_key` base64/base64url de 32 bytes, sin registrar valor real

## Estrategia de verificación

| Capa | Qué probar | Enfoque |
|---|---|---|
| Composer | `composer.json`/`composer.lock` coherentes y sin PHPMailer | `composer validate --strict`; si falla por lock stale, `composer update --lock`; revisar diff. |
| SQL estático | `002_token_cifrado_entrega_manual.sql` es seguro | Confirmar `ALTER TABLE cert_tokens_verificacion ADD COLUMN token_cifrado VARBINARY(512) NULL` y rollback comentado. |
| DB | `token_cifrado` existe en DB aprobada | Solo con env seguro: aplicar `002` y verificar `SHOW COLUMNS FROM cert_tokens_verificacion LIKE 'token_cifrado';`. Si no, documentar gate. |
| HTTP | Entrega manual DB-backed | Solo con staging/local seguro: `curl` con `X-Admin-Key` autorizado para un caso `200` y uno `409`; no imprimir secretos ni datos reales. |
| Código/docs | No PHPMailer/email | Buscar en artefactos versionados permitidos; no tocar `vendor/`. |

## Migración / rollout

Migración DB opcional y gated. Si hay acceso aprobado: backup operativo previo, aplicar `002`, verificar columna y ejecutar smoke. Si no hay acceso, dejar gate exacto con precondiciones, comandos y responsable. Rollback: revertir docs/OpenSpec/lock; si `002` fue aplicada, no dropear `token_cifrado` sin backup y aprobación, dejar columna sin uso.

## Riesgos

- Sin DB/env seguro: cierre parcial con gate pendiente.
- `composer update --lock` puede cambiar metadatos inesperados: revisar diff estrecho.
- `token_encryption_key` perdida o inválida vuelve certificados no recuperables: no registrar valores reales.
- Certificados legacy deben seguir en `409`, nunca regenerarse automáticamente.

## Preguntas abiertas

- [ ] ¿Hay staging/local DB aprobado para ejecutar migración y smoke en este ciclo?
