# Propuesta: M3-06 checkpoint integración Angular/API

## Intención

Validar el primer enlace real entre Angular y la API PHP antes de avanzar con UI final o deploy. El frontend ya tiene `HttpValidationSource`, DTOs y mapper, pero desarrollo usa mocks; el backend ya expone el contrato público con hash seguro y rate limiting.

## Alcance

### Incluido
- Habilitar modo local para que Angular consuma la API PHP real sin romper mocks.
- Cubrir smoke mínimo de `health` y validación pública con datos ficticios.
- Resolver o documentar CORS/base URL/base href para `ng serve` y cPanel.

### Fuera de alcance
- Deploy real en cPanel, cambios en `public_html` o uso de datos reales.
- UI visual final, admin, PDF, QR, envío/reenvío y migraciones nuevas.

## Capacidades

### Capacidades nuevas
- Ninguna.

### Capacidades modificadas
- `frontend-api-readiness`: de frontera preparada a integración local verificable.
- `backend-contrato-api-certificados`: soporte browser local seguro si hace falta.
- `deploy-cpanel-certificados`: compatibilidad `/certificados/` + `/api/` previa al deploy.

## Enfoque

Usar la frontera existente y agregar configuración mínima para alternar mock/API real. Preferir proxy/base URL local; CORS/preflight solo si el smoke lo exige. Producción sigue apuntando a `/certificados/api/`.

## Áreas afectadas

| Área | Impacto | Descripción |
|---|---|---|
| `apps/frontend-angular/src/environments/` | Modificado | Fuente real/mock y URL local. |
| `apps/frontend-angular/src/app/shared/certificates/` | Modificado | HTTP y mapeo de respuestas reales. |
| `apps/backend-php/index.php`, `src/Response.php` | Modificado | Solo si CORS/preflight es necesario. |
| `docs/frontend/`, `docs/backend/`, `docs/deploy/` | Modificado | Evidencia y límites. |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| CORS local bloquea el smoke | Media | Proxy/config local; CORS acotado si hace falta. |
| `baseHref` confunde `ng serve` | Media | Separar URL de API y rutas profundas. |
| Scope creep hacia deploy/UI | Baja | Mantener checkpoint técnico con datos ficticios. |

## Plan de reversión

Revertir cambios del ciclo. Volver `development` a mocks, conservar producción con `/certificados/api/` y no tocar cPanel ni configuración real.

## Dependencias

- Backend PHP local con configuración ficticia segura.
- Frontend Angular con tests/build disponibles.
- Tokens/fixtures ficticios; ningún dato real ni material privado.

## Criterios de éxito

- [ ] Angular consume la API PHP real en smoke local documentado.
- [ ] Los mocks siguen disponibles para desarrollo normal.
- [ ] `404 CERTIFICATE_NOT_FOUND` se muestra como no verificable y fallas técnicas como error técnico.
- [ ] No se exponen DNI completo, tokens completos, secretos, dumps ni logs.
