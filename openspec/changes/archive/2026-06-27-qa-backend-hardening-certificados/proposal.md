# Propuesta: hardening mínimo de seguridad backend (certificados)

## Intención

Cerrar 4 brechas de seguridad y calidad de contrato en el backend PHP 8.4 antes de deploy, sin agregar dependencias, migraciones ni frontend. El objetivo es endurecer el comportamiento observable de los endpoints ya existentes y documentar lo que se deja fuera de este ciclo.

## Alcance

### En alcance
- Validar `Content-Type: application/json` en endpoints POST que esperan JSON y responder `415 UNSUPPORTED_MEDIA_TYPE` cuando no coincida.
- Unificar el manejo de JSON malformado en emisión administrativa para que falle con `400 VALIDATION_ERROR` antes de cualquier side effect, igual que revocación.
- Agregar headers mínimos de seguridad en `Response`: `X-Content-Type-Options: nosniff` y `X-Frame-Options: SAMEORIGIN`.
- Validar que `admin_api_key`, si está configurada, tenga longitud mínima (16 caracteres) preservando falla cerrada cuando falta.
- Actualizar specs y documentación backend con los deltas observables.

### Fuera de alcance
- CORS/preflight, límite de tamaño de body, rate limiting distribuido u observabilidad real.
- `ultimo_uso_en` en verificación pública.
- Angular, base de datos real, dependencias nuevas, `.env` o migraciones SQL.

## Capacidades

### Nuevas capacidades
- Ninguna.

### Capacidades modificadas
- `backend-contrato-api-certificados`: se agregan headers de seguridad, validación de `Content-Type` y respuesta `415`.
- `admin-certificate-emission`: JSON malformado debe rechazarse con `400 VALIDATION_ERROR` antes de side effects.
- `admin-auth`: la clave administrativa configurada debe cumplir longitud mínima de 16 caracteres.
- `backend-base-php-certificados`: `Response` debe incluir headers de seguridad en todas las respuestas.

## Enfoque

Aplicar cambios quirúrgicos en `Response`, `Config` y `index.php`, actualizar specs con deltas mínimos y documentar los gaps intencionalmente no cubiertos. Se elige `X-Frame-Options: SAMEORIGIN` sobre `DENY` porque la app se sirve desde el mismo dominio y así se evita bloquear embeds legítimos propios sin sacrificar protección contra clickjacking externo.

## Áreas afectadas

| Área | Impacto | Descripción |
|------|---------|-------------|
| `apps/backend-php/index.php` | Modificado | Validación de `Content-Type` y manejo unificado de JSON malformado. |
| `apps/backend-php/src/Response.php` | Modificado | Headers `X-Content-Type-Options` y `X-Frame-Options`. |
| `apps/backend-php/src/Config.php` | Modificado | Validación de longitud mínima de `admin_api_key`. |
| `openspec/specs/backend-contrato-api-certificados/spec.md` | Modificado | Delta de headers y `415`. |
| `docs/backend/00-php84-api.md` | Modificado | Documentar gaps no cubiertos. |
| `docs/backend/01-contrato-api-certificados.md` | Modificado | Documentar headers y validación de `Content-Type`. |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|--------|--------------|------------|
| Validar `Content-Type` rompe clientes que no envíen el header. | Baja | El contrato ya exige JSON; no hay clientes de producción aún. |
| Longitud mínima de `admin_api_key` rompe configs demo cortas. | Baja | El config de ejemplo no incluye clave; las demos pueden usar 16+ caracteres. |
| `X-Frame-Options: SAMEORIGIN` sigue sin permitir embeds de terceros si algún día se necesita. | Baja | Se documenta la decisión; cambiar a `DENY` o remover es un diff de un header. |

## Plan de rollback

Revertir el commit del cambio (`git revert <sha>`) y validar que `php -l` pase en los archivos restaurados. Los cambios no tocan base de datos ni archivos externos, por lo que el rollback no requiere migración inversa.

## Dependencias

Ninguna externa. Se usan funciones nativas de PHP.

## Criterios de éxito

- [ ] Toda respuesta JSON incluye `X-Content-Type-Options: nosniff` y `X-Frame-Options: SAMEORIGIN`.
- [ ] POST con `Content-Type` distinto de `application/json` responde `415 UNSUPPORTED_MEDIA_TYPE`.
- [ ] Emisión administrativa con JSON malformado responde `400 VALIDATION_ERROR` sin persistir nada.
- [ ] `Config` rechaza `admin_api_key` configurada con menos de 16 caracteres.
- [ ] Tests existentes pasan y se agregan asserts para los nuevos comportamientos.
- [ ] Documentación backend y specs reflejan los cambios y los gaps diferidos.
