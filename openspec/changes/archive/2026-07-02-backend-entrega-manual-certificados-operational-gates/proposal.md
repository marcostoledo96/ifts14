# Propuesta: cierre de gates operativos de entrega manual

## Intento

Cerrar las advertencias operativas dejadas por `backend-entrega-manual-certificados` antes de iniciar M4-02. El objetivo es probar migración, DB real/staging, dependencias Composer y configuración externa de cifrado sin agregar funcionalidad nueva.

## Alcance

### Incluye
- Aplicar/verificar `database/migrations/002_token_cifrado_entrega_manual.sql` si hay acceso DB aprobado; si no, documentar gate exacto.
- Validar smoke DB-backed `GET /admin/certificados/{id}/entrega-manual`: `200` recuperable y `409 TOKEN_NOT_RECOVERABLE` legacy, si hay entorno/config.
- Confirmar `composer.lock` y estado operativo de `vendor/` tras remover PHPMailer, sin versionar `vendor/`.
- Confirmar requisito externo `token_encryption_key` sin leer secretos reales.
- Limpiar drift menor de `Purpose` en docs/specs solo si es editorial y seguro.

### No incluye
- M4-02 cursos/alumnos/asistencias ni nuevas tablas funcionales.
- Reintroducir SMTP, PHPMailer, `/reenviar` o email automático.
- Leer secretos, dumps, logs, material privado, `public_html` o `vendor/` versionado.
- Deploy real, push, merge, rebase, stage o commit.

## Capacidades

### Nuevas capacidades
- Ninguna.

### Capacidades modificadas
- `admin-certificate-delivery`: agrega cierre verificable del smoke operacional DB-backed `200`/`409` o gate documentado.
- `deploy-cpanel-certificados`: explicita gates Composer/vendor, `token_encryption_key` externo y smoke previo a deploy.
- `backend-modelo-datos-certificados`: vincula migración `002` de `token_cifrado` con verificación operacional y rollback seguro.

## Enfoque

Mantener el ciclo mínimo: verificar primero disponibilidad segura de DB/env; ejecutar solo comandos no destructivos o aprobados; actualizar lock/vendor únicamente fuera de `vendor/` versionado; documentar gates cuando falte acceso. No tocar código salvo correcciones documentales menores.

## Áreas afectadas

| Área | Impacto | Descripción |
|---|---|---|
| `database/migrations/002_token_cifrado_entrega_manual.sql` | Modificado | Gate de aplicación/verificación. |
| `apps/backend-php/composer.lock` | Modificado | Refresh seguro del lock si corresponde. |
| `apps/backend-php/vendor/` | Verificado | Artefacto operativo no versionado. |
| `docs/deploy/` | Modificado | Gates y evidencia operativa. |
| `openspec/specs/*` | Modificado | Deltas de requisitos/gates; posible Purpose editorial. |

## Riesgos

| Riesgo | Prob. | Mitigación |
|---|---|---|
| Sin DB/env aprobado | Media | Cerrar como gate exacto, no simular evidencia. |
| Lock cambia más de lo esperado | Baja | Revisar diff y no tocar dependencias nuevas. |
| Se filtran secretos | Baja | Usar placeholders; no leer configs reales. |

## Rollback

Revertir cambios documentales/OpenSpec y `composer.lock` si se refresca. Si se aplicó migración `002`, no borrar `token_cifrado`; dejar columna sin uso o restaurar backup DB aprobado por operador.

## Dependencias

- Acceso DB/env aprobado para cerrar gates reales.
- Composer disponible local/hosting o fallback operativo documentado.

## Criterios de éxito

- [ ] Migración `002` aplicada/verificada o gate exacto documentado.
- [ ] Smoke `200`/`409` ejecutado o gate exacto documentado.
- [ ] `composer.lock`/`vendor` quedan coherentes sin PHPMailer versionado.
- [ ] `token_encryption_key` queda confirmado como config externa obligatoria sin secretos.
