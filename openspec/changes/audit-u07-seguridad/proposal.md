# Proposal: audit-u07-seguridad

## Intent

Cerrar U7 (Seguridad + PII) del plan de auditoría staging 1.0: eliminar el drift P0–P1 del `.htaccess` de la app (sin deny `src|config` frente a plantilla staging/smoke), documentar la profundidad de política cookie/absoluto D-009 sin tocar TTL, y reforzar el gate de privacidad. Sin rediseño de auth ni rotación de tokens/keys.

## Scope

### In Scope
- Alinear `apps/backend-php/.htaccess` con deny canónico `RewriteRule ^(src|config)/ - [F,L]` (+ valorar `vendor`/`composer.*`/`Options -Indexes` como en staging, adaptando `RewriteBase`/`FallbackResource` al path app).
- Documentar política cookie/sesión: attrs fijos Secure/HttpOnly/SameSite=Strict; `lifetime=0` (cookie de sesión navegador) vs absolute app-side 28800; path por entorno; **MUST NOT** aflojar 14400/28800.
- Extender `scripts/test-privacy-headers.sh` (o equivalente) para exigir deny `src|config` en htaccess API versionados.
- Regresión verify: CSRF, login 429/503, cookie attrs, AuthPrivacy/PII, `__checks__/no-secrets` + `no-real-data`.
- Párrafo mínimo en `docs/backend/00-php84-api.md` si hace falta explicitar cookie vs absolute.

### Out of Scope
- U8 docs drift / changelog bulk / índice Git
- U9 repro idle ~30 min staging
- Rate-limit público fail-open; rate-limit redistribuido
- HSTS / headers nuevos más allá de los existentes en `Response` (salvo crítico)
- Rotar encryption keys o token/QR permanente (D0)
- Envelope/400/409 diferidos de U6
- Rediseñar CSRF, TTL numéricos, o aflojar `Secure` para HTTP local
- Tocar archive U6

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `admin-auth`: profundidad D-009 — cookie sesión (`lifetime=0`) + absolute 8 h app-side; attrs fijos; path por entorno; MUST NOT cambiar 14400/28800.
- `deploy-cpanel-certificados`: lean — el árbol/`plantillas` API `.htaccess` DEBEN denegar acceso directo a `src|config` (alineado a staging/smoke/docs).

## Approach

**Approach 1 (locked — quirúrgico):** (1) deny htaccess app; (2) MODIFIED lean `admin-auth` + doc backend mínima; (3) gate privacy deny; (4) regresiones CSRF/429/503/PII/checks. Sin commit en este ciclo de propuesta.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/backend-php/.htaccess` | Modified | Deny `src\|config` (+ opc. vendor/composer) |
| `openspec/specs/admin-auth` (delta) | Modified | Política cookie/absoluto U7 |
| `openspec/specs/deploy-cpanel-certificados` (delta) | Modified | Contrato deny API htaccess |
| `docs/backend/00-php84-api.md` | Modified | 1 párrafo cookie vs absolute |
| `scripts/test-privacy-headers.sh` | Modified | Check deny `src\|config` |
| Tests PHP / FE `__checks__` | Verify only | Regresión; fix solo fallos reales |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Deny mal armado rompe fallback API | Med | Copiar patrón staging; adaptar RewriteBase; no tocar `!-f`/`!-d` |
| Scope creep HSTS/CSP/rate-limit | Med | Hard DEFER list |
| Aflojar Secure/TTL “por local” | Low | Prohibido sin evidencia; HTTPS staging/prod |
| Tratar token URL pública como bug | Low | D0: no rotar QR |

## Rollback Plan

Revertir commit(s) U7: restaurar `.htaccess` previo, deltas de spec, script privacy y doc. Sin migraciones DB ni rotación de secretos. Staging ya desplegado: re-subir `.htaccess` anterior desde backup/git.

## Dependencies

- Tip post-U6 (`audit/u07-seguridad`); archive U6 intacto
- Plantilla canónica `deploy/staging/.htaccess-api` / smoke API

## Success Criteria

- [ ] `apps/backend-php/.htaccess` deniega `src|config` con `[F,L]` antes del fallback
- [ ] Spec `admin-auth` documenta cookie `lifetime=0` + absolute 28800 + attrs; TTL 14400/28800 sin cambio
- [ ] Spec/deploy exige deny API; script privacy falla si falta deny
- [ ] Regresiones CSRF, 429/503, AuthPrivacy, cookie attrs, `__checks__` verdes
- [ ] Sin tocar keys, token permanente, archive U6, TTL numéricos

## Proposal question round

Preguntas para afinar el PRD (responder, omitir o pedir otra ronda). Asunciones actuales (Approach 1 locked):

1. **Deny scope:** ¿Solo `src|config` en el árbol app, o también `vendor`/`composer.*`/`Options -Indexes` como staging?
2. **FallbackResource:** ¿Migrar a `RewriteRule` + `!-f`/`!-d` estilo staging, o añadir deny **antes** del `FallbackResource` actual?
3. **Outcome operativo:** ¿Éxito = árbol app alineado + gates verdes, sin exigir repro HTTP en staging real (eso queda U9)?
4. **Deploy delta:** ¿Confirmar MODIFIED lean en `deploy-cpanel-certificados`, o solo docs/script sin delta de deploy?
5. **Riesgo priorizado:** ¿Qué duele más si falla — exponer `src/` en un deploy que use el htaccess de la app, o romper routing API local?

**Asunciones si se omite la ronda:** deny mínimo `src|config` (+ vendor/composer si cabe sin romper embebido); adaptar sin romper fallback; éxito = código/docs/gates sin U9; incluir delta lean deploy; priorizar cerrar exposición.

## PR strategy

- **Entrega:** un solo PR en `audit/u07-seguridad` (size-exception si código ≪400 LOC; docs/spec lean cuentan aparte pero el blast runtime es chico).
- **No** chained PRs salvo que apply hinche el deny + tests más de lo estimado (~4–10 archivos).
- Sin commit desde propose; apply/verify posteriores.
