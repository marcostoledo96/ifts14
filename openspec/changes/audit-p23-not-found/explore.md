# Exploration: audit-p23-not-found

**Cambio**: `audit-p23-not-found`
**Tipo**: exploration (sin implementación)
**Proyecto**: `ifts14`
**Fecha**: 2026-07-29
**Almacén**: openspec (+ Engram)
**Rama**: `audit/p23-not-found`
**Alcance de fase**: `NotFoundPage` (`features/not-found/`) + catch-all admin / wildcard público en `app.routes.ts` (+ specs de rutas)
**Referencias**: `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` §P23 / PUB-02; honesty P15–P22; hard locks: D0; leave P22 archive alone / no rewrite public validation; prefer front-only; no stack traces; español AR formal

## Exploration: 404 y rutas huérfanas (P23)

### Current State

Routing canónico en `app.routes.ts`:

1. `''` → `/admin/login`
2. `validar/:tokenCertificacion` → `PublicValidationPage`
3. árbol `admin` (login, shell+children, guard)
4. **catch-all admin** `path: 'admin', pathMatch: 'prefix'` → redirect `/admin/dashboard` (comentario: aísla `/admin/typo` antes del wildcard público)
5. **wildcard público** `**` → `NotFoundPage` (sin redirect a validar/demo)

`NotFoundPage` es scaffold mínimo (template inline): título «Página no encontrada» + párrafo «La dirección solicitada no existe.» Sin CSS propio, sin `RouterLink`/`UiBackLink`, sin `title` de ruta. Vive bajo chrome público del root (`HeaderInstitucional` + footer) porque `esRutaAdmin` es false en URLs no-admin.

Tests: `not-found-page.spec.ts` (copy + anti-demo/anti-validación); `app.routes.spec.ts` cubre wildcard seguro, `/admin/typo` sin sesión → login, con sesión → dashboard, y que URLs públicas desconocidas **no** caen en `/admin/` ni `/validar/`.

| Checklist P23 | Estado hoy | Evidencia |
|---|---|---|
| `NotFoundPage` clara | **Parcial** | Copy ES básico y a11y `aria-labelledby` OK; sin links, sin estilos, sin title de ruta; contraste UX vs resto del módulo |
| `/admin/typo` no cae en validación pública | **OK** | Catch-all admin prefix + tests navegación real; no carga `PublicValidationPage` ni wildcard público |
| Links «volver» sensatos | **Gap** | Cero CTAs en `NotFoundPage`; `UiBackLink` existe pero es patrón admin |

**Honesty / copy (vs P15–P22)**

```text
Wildcard público /** → NotFoundPage (solo copy fijo; sin API, sin token, sin Error.message)
/admin/* huérfano → redirect dashboard → adminGuard → login|dashboard
  (no NotFound admin; no validación pública)
```

- Ya OK: no menciona `demo-valido` / «Certificado verificable»; no stack; no PII; no reescribe validación pública.
- Gap honesty menor: redirect silencioso de typos admin al dashboard (intencional para aislamiento; **no** exige 404 admin en el PLAN — no reinventar).
- Gap UX: sin «volver» el usuario queda atrapado en URL muerta con chrome de «Consulta pública de autenticidad».

**Qué ya está bien (no reabrir)**

- Aislamiento admin catch-all vs wildcard público (PR histórico + suite de rutas).
- Wildcard **no** valida tokens ni redirige a demo.
- Hard lock: no tocar `public-validation-page` / archive P22 / backend verify.

**Residuos / gaps (top)**

1. **Links «volver» ausentes** — checklist P23 explícito; destinos sensatos: `/admin/login` («Ir al acceso administrativo» o similar); **no** inventar link a `/validar/…`.
2. **`NotFoundPage` poco clara / scaffold** — copy puede reforzarse (qué hacer a continuación); estilos mínimos alineados al shell público; `title` de ruta; tests de CTAs + anti-leak.
3. **Spec shell sin contrato 404** — `frontend-angular-shell` no menciona wildcard / NotFound / aislamiento admin; hace falta **ADDED** (no hay spec not-found dedicada).
4. **Admin typo = redirect (no 404)** — aceptar como diseño locked; documentar en delta/PLAN; no construir AdminNotFound salvo overturn.
5. **Fuera de alcance** — no rewrite validación pública; leave P22 archive; D0 no rota; no stack; front-only.

### Affected Areas

- `apps/frontend-angular/src/app/features/not-found/not-found-page.ts` (+ `.spec.ts`; posible `.css` / template externo) — claridad + links volver.
- `apps/frontend-angular/src/app/app.routes.ts` — solo si se agrega `title` al `**` o se ajusta copy de comentarios; **no** tocar catch-all admin salvo regresión.
- `apps/frontend-angular/src/app/app.routes.spec.ts` — regresión isolation + asserts de NotFound render/CTAs si se endurece harness.
- `apps/frontend-angular/src/app/shared/ui/ui-back-link.ts` — opcional reuso; prefer link público simple si el estilo admin no encaja.
- `openspec/specs/frontend-angular-shell/spec.md` — **primary delta**: ADDED (404 público + aislamiento admin orphan).
- `docs/qa/PLAN-…` — checkboxes P23 en apply/archive (no en explore).
- **No tocar**: `openspec/changes/archive/*p22*` / `audit-p22-validacion` cerrado; `public-validation-page.*`; `result-mapper` / backend; rotación token/QR (D0).

### Approaches

1. **Auditoría quirúrgica front-only (recomendada)** — Pulir `NotFoundPage` (copy ES-AR, 1–2 links sensatos, estilo mínimo, title); conservar catch-all admin; tests anti-regresión; ADDED liviano en `frontend-angular-shell`.
   - Pros: cierra checklist; respeta locks; blast chico; isolation ya OK.
   - Cons: typos admin siguen siendo redirect silencioso (aceptable).
   - Effort: Low

2. **Solo documentar / verify** — PLAN + nota; cero UI.
   - Pros: diff mínimo.
   - Cons: deja gap «volver» y «clara»; checklist incompleto.
   - Effort: Low (**incompleto** vs PLAN)

3. **404 admin dedicado + NotFound público** — child `admin/**` → página 404 en shell.
   - Pros: honesty tipográfica para typos admin.
   - Cons: fuera del checklist mínimo; toca shell/guard/UX; más blast.
   - Effort: Medium (**defer** salvo overturn)

### Recommendation

Adoptar **enfoque 1**. Alcance propuesto para `sdd-propose`:

1. **Checklist** — (a) NotFound clara + CTAs; (b) `/admin/typo` isolation = **ya OK / verify**; (c) links volver → login admin (y opcionalmente no más destinos).
2. **Honesty** — copy fijo; sin stack; sin tokens/demo; sin reescribir validación pública.
3. **Spec target** — **`frontend-angular-shell`** (ADDED: wildcard→NotFound; admin orphan no cae en público; links). **No** primary-target `frontend-public-validation` ni `admin-shell-chrome`.
4. **Hard locks** — D0; leave P22 alone / no rewrite public validation; front-only; no stack; ES-AR formal.

### Defaults locked (para propose)

1. Alcance = **enfoque 1** (NotFound polish + tests + ADDED `frontend-angular-shell`) — **sí**.
2. Spec target = **`frontend-angular-shell`** (ADDED delta) — **sí**.
3. **No** primary-target `frontend-public-validation` / no rewrite validation — **sí (hard lock)**.
4. Catch-all admin → dashboard (sin AdminNotFound) = **aceptado** — **sí**.
5. Links volver: al menos `/admin/login` (label ES-AR sensato); **no** link a `/validar/…` — **sí**.
6. Honesty: sin raw Error/stack/tokens/demo en NotFound — **sí**.
7. D0: no rotar token/QR — **sí (hard lock)**.
8. Leave P22 archive / change alone — **sí (hard lock)**.
9. Estilos NotFound = mínimo alineado shell público (no rediseño v0 completo) — **sí**.
10. Admin 404 dedicado — **no / defer**.

### Questions (para propose)

1. Confirmar defaults 1–9 (recomendado: aceptar; 10 defer).
2. ¿Un solo CTA «Ir al acceso administrativo» → `/admin/login`, o también texto sin link hacia validación pública? (**recomendado: un CTA login**).
3. ¿Reusar `UiBackLink` o `RouterLink` tipográfico público? (**recomendado: link simple público; UiBackLink es tinta admin**).

### Risks

- Footer’s «Consulta pública de autenticidad» en 404 puede confundir; no reescribir chrome root en P23 salvo copy local de la página.
- Harness de rutas hoy no asserta DOM de NotFound en wildcard (solo URL); endurecer tests puede necesitar `RouterTestingHarness`.
- Tocar `app.routes.ts` mal podría romper el orden first-wins del catch-all admin.

### Ready for Proposal

**Yes** — orchestrator puede lanzar `sdd-propose` con defaults locked 1–9; admin 404 = no; spec = `frontend-angular-shell` ADDED.
