# Exploración: audit-u08-docs

**Cambio:** `audit-u08-docs`
**Rama:** `audit/u08-docs` @ `f1fa2f5` (staging1.0 tip = merge PR #115 U7)
**Plan:** `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` §U8
**Locks:** Español argentino formal · sin dumps/secretos · sin commit · archive U7 intacto bajo `openspec/changes/archive/2026-07-30-audit-u07-seguridad/` · docs-only preferido · D0 / no rotar key/token · no reescribir specs en masa
**Artifact store:** hybrid

---

## Exploration: Documentación y drift (U8)

### Current State

Post-U7 el producto de auditoría U1–U7 está en `staging1.0` (`f1fa2f5`). U8 es **documental**: alinear docs canónicas y dejar **nota de drift** de specs vs comportamiento, sin reabrir código salvo link roto.

| Checklist PLAN §U8 | Estado evidenciado | Evidencia |
|---|---|---|
| `docs/06-flujo-git` → archivo real `docs/06-flujo-git-recomendado.md` refleja staging1.0 / main=prod | **Ya OK** | Ramas: `main` = PRODUCCIÓN; `staging1.0` = integración; PRs → staging1.0; land staging1.0→main; enlace al PLAN |
| `03-modulos-admin`, checklist QA, changelog viñeta acumulada | **Parcial** | Mapa admin vigente; stale «miles → U6»; checklist metadata vieja; changelog con U1–U5 FE, **sin** viñeta U6/U7 |
| Specs `openspec/specs/` vs real — **nota de drift only** | **Pendiente (nota)** | SoT `admin-auth` + `00-php84-api` al día; varios specs/docs históricos aún hablan de `X-Admin-Key` HTTP |
| Índice enlaza este plan | **Ya OK** | `docs/00-indice-general.md` fila QA → `PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` |
| Nada de secretos/dumps en docs tocados | **Ya OK** (con cuidado demo) | Sin markers crypto/dumps en targets; checklist lleva credenciales **demo local** (`bedelia` / `password-demo-auth`) — no staging reales |

**U7 archive:** presente e intacto (`explore.md`, `proposal.md`, `design.md`, `tasks.md`, `verify-report.md`, `archive-report.md`, `specs/`).

---

### Affected Areas

| Área | Archivos | Por qué |
|---|---|---|
| Flujo Git | `docs/06-flujo-git-recomendado.md` | Checklist PLAN nombra shorthand `06-flujo-git`; contenido ya correcto — confirmar / no reescribir |
| Índice | `docs/00-indice-general.md` | Enlace PLAN ya existe; P0 del PLAN aún `[ ]` opcional — marcar en apply vía PLAN |
| Mapa admin | `docs/frontend/03-modulos-admin.md` | Rutas/honestidad al día; **mal etiqueta** «miles → U6» (U6 fue backend sesión/TTL, no paginación) |
| Changelog | `docs/03-changelog.md` | U1–U5 FE listados; faltan U6 (lastSeen/TTL/503) y U7 (deny htaccess + cookie depth) como viñeta acumulada visible |
| Checklist QA | `docs/qa/CHECKLIST-TESTING-MANUAL.md` | Fecha/versión/rama ejemplo obsoletas (`integration/admin-session-http`); nota S-04 pre-U7; demo creds OK si quedan etiquetadas local |
| Plan auditoría | `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` | §U8 checkboxes + tabla fase `pendiente` → cerrar al apply |
| Drift specs (nota) | `openspec/specs/*` + opcional párrafo en `openspec/specs/README.md` o §U8 del PLAN | Inventario; **no** reescribir specs |
| Contrato histórico (opcional quirúrgico) | `docs/backend/01-contrato-api-certificados.md` | Sigue narrando admin HTTP con `X-Admin-Key` como si fuera vigente; banner ya existe en specs hermanas / `00-php84-api` |
| Fuera | producto FE/BE, archive U7, U9 idle staging, land main | Locks / DEFER |

---

### Inventory — gaps rankeados

| # | Gap | Severidad | Evidencia | Fix quirúrgico | DEFER |
|---|-----|-----------|-----------|----------------|-------|
| 1 | **Changelog sin viñeta U6/U7** (acumulado audit BE/seguridad) | **P1** (onboarding) | `docs/03-changelog.md`: idle 4 h/8 h en operación; FE U1–U5 sí; sin bullets U6 lastSeen/TTL/503 ni U7 deny `src\|config` + cookie lifetime=0 | 1–2 bullets bajo «2026-07» / Backend o Calidad | — |
| 2 | **`03-modulos-admin` etiqueta «miles → U6» incorrecta** | **P2** | Línea escala listados apunta a U6; U6 real = sesión/TTL (`admin-auth`) | Reescribir a «paginación/API futura (fuera de esta auditoría)» o post-U9 | — |
| 3 | **Checklist QA metadata + S-04 stale** | **P2** | Versión/fecha 2026-07-17; plantilla `integration/admin-session-http`; S-04 notas `/api/src` 404 + `/src/Config.php` 200 vacío (pre deny U7) | Actualizar cabecera (rama ejemplo `staging1.0` / `audit/*`); nota S-04: deny → **403** esperado en API con `.htaccess` U7; TTL/idle explícito → pointer U9 | Idle real staging → **U9** |
| 4 | **Nota de drift specs (obligatoria U8, no rewrite)** | **P2** (contrato documental) | Ver tabla drift abajo | 1 sección corta en apply (README specs o cierre §U8 PLAN) listando superseded vs SoT | Reescrituras masivas |
| 5 | **`01-contrato-api-certificados.md` aún normativa `X-Admin-Key` HTTP** | **P2** (confunde operadores) | Tablas admin «Admin con X-Admin-Key»; contradice `docs/backend/API.md` + `admin-auth` | Banner supersession P5-01 / apuntar a `00-php84-api` + `admin-auth` (**no** reescribir el contrato entero) | Rewrite completo contrato |
| 6 | Specs con texto D0 histórico `X-Admin-Key` temporal | Baja–P2 | `deploy-cpanel-certificados` §gates; `guia-matias-angular-windows`; `guia-marcos-ciclos-sdd` | Solo listar en nota drift | Guía/prompts rewrite → fuera U8 |
| 7 | PLAN §U8 checkboxes + fila tabla aún `pendiente` | Proceso | L.1207–1211; tabla L.291 | Marcar al cerrar apply/verify | — |
| 8 | Flujo Git / índice PLAN | — (OK) | `06-flujo-git-recomendado.md`; índice QA | Confirmar; 0 LOC salvo typo | — |
| 9 | Secretos en docs target | — (OK) | Sin dumps; demo local en checklist | Mantener wording «solo demo local»; no pegar staging | — |
| 10 | Producto / archive U7 / D0 rotate | — | Locks | **Prohibido** | — |

#### Drift specs vs comportamiento (nota — no cerrar todo)

| Fuente | Drift | SoT vigente |
|---|---|---|
| `openspec/specs/admin-auth/spec.md` | — | Sesión PHP + CSRF; TTL 14400/28800; cookie lifetime=0; attrs fijos; `X-Admin-Key` no HTTP |
| `docs/backend/00-php84-api.md` | Frase residual «protegido por X-Admin-Key» en párrafo contrato histórico (L.61) vs cuerpo D-009 actual (L.65–69) | Cuerpo sesión/TTL/deny htaccess |
| `docs/backend/API.md` | — | Sesión + CSRF; key solo CLI |
| `docs/backend/01-contrato-api-certificados.md` | Admin HTTP documentado con `X-Admin-Key` | Superseded P5-01; usar `admin-auth` |
| `openspec/specs/backend-contrato-api-certificados/spec.md` | Menciona históricas + banner supersession | Banner + `admin-auth` |
| `openspec/specs/deploy-cpanel-certificados/spec.md` | Gate «auth admin simple temporal (X-Admin-Key)» en requisito staging | Auth sesión; key CLI/smoke |
| `openspec/specs/guia-matias-angular-windows/spec.md`, `guia-marcos-ciclos-sdd/spec.md` | D0 «auth admin simple temporal (X-Admin-Key)» | Guías históricas; producto = sesión |
| Specs FE admin-*/emission/delivery | Anti-exposición key en bundle (correcto) | Alineado a D0 |

---

### Ya OK (no reabrir salvo typo)

- `docs/06-flujo-git-recomendado.md`: modelo `main`=prod / `staging1.0`=integración / `audit/*` → staging1.0.
- `docs/00-indice-general.md`: enlace al PLAN de auditoría en fila QA.
- Mapa de rutas admin en `03-modulos-admin.md` (P8–P23 / U1–U5) sustancialmente alineado al producto.
- Changelog FE U1–U5 ya documentado.
- SoT auth post-U6/U7: `admin-auth` + profundidad cookie/deny en `00-php84-api.md`.
- Archive U7 intacto; tip `f1fa2f5` = PR #115.
- Targets U8 sin dumps/secretos de staging/prod.

---

### Approaches

1. **Docs quirúrgicos (recomendado)** — (A) confirmar Git+índice sin reescritura; (B) corregir etiqueta U6→futuro en `03-modulos-admin`; (C) viñeta changelog U6+U7; (D) refresh checklist cabecera + nota S-04/deny; (E) nota drift specs (README o §U8); (F) banner opcional en `01-contrato-api`; (G) marcar PLAN §U8. Sin código producto.
   - Pros: cierra checklist U8; bajo blast; respeta locks y archive U7.
   - Cons: no reescribe contrato/specs históricos completos; idle staging sigue en U9.
   - Effort: **Low** (~5–8 archivos, ≪400 LOC)

2. **Gran rewrite documental** — Reescribir `01-contrato-api`, guías Marcos/Matías, todos los specs con menciones históricas.
   - Pros: cero ambigüedad a largo plazo.
   - Cons: alto volumen review; fuera del mandato «nota de drift only»; riesgo >400 líneas.
   - Effort: **High**

3. **Solo marcar PLAN + nota drift mínima** — Sin tocar changelog/checklist/módulos.
   - Pros: mínimo diff.
   - Cons: deja gaps P1/P2 del checklist U8 (changelog, checklist stale, etiqueta U6).
   - Effort: **Low** (insuficiente)

### Recommendation

**Approach 1 — docs quirúrgicos.** Cierra el checklist §U8 con evidencia, deja drift explícito sin reescribir SoT/specs en masa, y prepara U9 (checklist alineada a deny/TTL) sin tocar producto ni archive U7.

**Sketch Approach 1 (apply):**

1. `03-modulos-admin.md` — 1 frase escala listados (quitar «U6»).
2. `03-changelog.md` — bullets: U6 (`state`/`authorize` lastSeen, TTL 14400/28800, storage→503≠429); U7 (deny `src|config` antes FallbackResource; cookie lifetime=0 vs absoluto app-side).
3. `CHECKLIST-TESTING-MANUAL.md` — cabecera fecha/ámbito/rama ejemplo; S-04 espera 403 con deny; reforzar «credenciales solo demo local»; opcional fila idle→U9.
4. Nota drift — párrafo en `openspec/specs/README.md` **o** bloque bajo §U8 del PLAN (preferir un solo lugar).
5. Opcional: banner supersession al tope de `01-contrato-api-certificados.md`.
6. PLAN: checkboxes §U8 + fila tabla `hecha` (al verify/archive).
7. `06-flujo` / `00-indice`: **no-op** salvo hallazgo menor.

**Files estimate:** 5–8 paths tocados; ~80–200 líneas netas authored.

---

### Risks

- Confundir «nota de drift» con obligación de reescribir `01-contrato-api` entero → inflar PR.
- Pegar evidencias U9 / credenciales staging en checklist al «actualizar» → violar no-secretos.
- Tocar archive U7 o specs canónicas de producto por exceso de celo.
- Dejar «miles → U6» sin fix → sigue desorientando el mapa admin.

### Ready for Proposal

**Yes** — orquestador puede lanzar `sdd-propose` con Approach 1 locked (docs-only, nota drift, sin commit).
