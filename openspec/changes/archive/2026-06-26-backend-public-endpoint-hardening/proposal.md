# Proposal: backend-public-endpoint-hardening

## Intent

Hardening mínimo de endpoints públicos de verificación de certificados QR: rate limiting de nodo único y fault-injection que demuestre que la auditoría no rompe el contrato público.

## Scope

### In Scope
- M3-01: rate limiting vía archivo JSON temporal con `flock()`.
- Clave de bucket hasheada (IP + salt configurado); sin IP cruda, token completo ni DNI.
- Respuesta `429 RATE_LIMITED` al exceder el límite.
- M3-02: fault-injection renombrando `cert_eventos_auditoria` en DB demo ficticia; verificar `200`/`400`/`404` y restaurar tabla.
- Actualizar contrato público y docs.

### Out of Scope
- Rate limiting distribuido o anti-abuso avanzado.
- Migraciones SQL nuevas, dependencias de terceros.
- Cambios en Angular/frontend.

## Capabilities

### New Capabilities
- `api-rate-limiting`: protección básica de nodo único para endpoints públicos de validación.

### Modified Capabilities
- `backend-contrato-api-certificados`: escenario "Rate limiting ausente" pasa a "Rate limiting aplicado" con `429 RATE_LIMITED`.

## Approach

Crear `apps/backend-php/src/RateLimiter.php` que use configuración existente (`app_salt` preferido; fallback a `token_pepper`), persista buckets en JSON bajo `sys_get_temp_dir()` con `flock()`, calcule clave `substr(hash('sha256', $ip . $salt), 0, 16)`, aplique ventana deslizante, limpie buckets expirados y devuelva booleano. Integrar en `apps/backend-php/index.php` antes de `respondToValidation()`.

Fault-injection: script PHP contra DB demo local que renombra la tabla de auditoría, ejecuta validaciones y restaura en `finally`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/backend-php/src/RateLimiter.php` | New | Clase de rate limiting. |
| `apps/backend-php/index.php` | Modified | Chequeo antes de validación. |
| `apps/backend-php/src/Config.php` | Modified | Aceptar `app_salt`. |
| `openspec/specs/backend-contrato-api-certificados/spec.md` | Modified | Rate limiting implementado. |
| `docs/backend/01-contrato-api-certificados.md` | Modified | Documentar `429` y limitaciones. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| No protege ataques distribuidos. | High | Documentar como capa básica de nodo único. |
| NAT agrupa clientes en bucket. | Med | Umbrales razonables; aceptar para endpoints de baja sensibilidad. |
| Sin escritura en temp o sin `flock()`. | Low | Verificar en staging; desactivar si falla. |
| Fault-injection deja tabla renombrada. | Low | `try/finally` con restauración. |

## Rollback Plan

1. Quitar la llamada a `RateLimiter` en `index.php`.
2. Eliminar `apps/backend-php/src/RateLimiter.php`.
3. Revertir `Config.php` si se agregó `app_salt`.
4. Restaurar escenario de rate limiting a "pendiente" en spec y docs.

## Dependencies

- Configuración externa con `token_pepper` u opcionalmente `app_salt`.
- Entorno Docker/MariaDB demo ficticio para fault-injection.

## Success Criteria

- [ ] `429 RATE_LIMITED` tras exceder umbral en ambos endpoints.
- [ ] Sin IPs crudas, tokens completos ni DNI en archivo de buckets.
- [ ] Fault-injection demuestra `200`/`400`/`404` estables con auditoría rota.
- [ ] Sin migraciones ni dependencias nuevas.
- [ ] Docs con limitaciones: nodo único, NAT, permisos temporales.
