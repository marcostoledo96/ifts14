# Exploración: audit-u04-a11y-responsive

**Cambio:** `audit-u04-a11y-responsive`
**Rama:** `audit/u04-a11y-responsive` @ `b0d23d4` (staging1.0 post-merge PR #111; U3 archivado)
**Plan:** `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` §U4
**Locks:** D0 · sin rediseño de lógica/API · sin rediseño visual grande · no tocar archive U3 · sin commit
**Prioridad operativa:** login + validación pública + shell primero; luego listados/tablas/modales

---

## Exploration: Accesibilidad y responsive (U4)

### Current State

La base a11y ya existe desde F1-02 / P6-05 y pulidos de listados (F4/F5):

- **Foco global:** `styles.css` define `:focus-visible` + `--focus-ring` (`0 0 0 2px var(--color-ring)`); `prefers-reduced-motion` excluye el anillo. Muchas hojas locales repiten `outline: none` + `box-shadow: var(--focus-ring)`.
- **Login:** labels con `for`/`id`, `aria-invalid`/`aria-describedby`, foco al `#login-error` (validación local y `serverError`), toggle de clave con `aria-label`/`aria-pressed`, `role="status"` sr-only. Deuda residual baja.
- **Shell:** skip-link, landmarks, drawer mobile con `inert` en `.content`, Esc cierra, foco a close/menu-btn. **Sin** trap de Tab ni `aria-modal` en el drawer. Spec `admin-shell-chrome` REQ-SHELL-10 exige landmarks/drawer pero no detalla trap.
- **Validación pública:** semántica fuerte (`aria-labelledby`, asides, `aria-hidden` decorativos, BandaEstado dueña de `aria-live`). CSS propio **sin** reglas `:focus-visible` locales → depende del global. PLAN P22 dejó responsive/trust en smoke U9.
- **Listados admin:** cursos/certificaciones/alumnos/asistencias/fechas usan patrón tabla desktop + cards mobile (`~48rem` o `~64rem` en certs). Certs-por-fecha ya es lista/cards (no tabla). Emisión nueva / preview documental: `overflow-x: auto` (aceptable como scroll quirúrgico).
- **Diálogos:** entrega y revocación tienen Esc + focus trap en el `#dialog` / host. **Hueco:** backdrop focusable **fuera** del trap (entrega: `div[tabindex=0]`; revocación: `<a class="backdrop">`) → Tab escapa del diálogo. Error-state de entrega es `role="dialog"` sin `#dialog` ni trap. Spec delivery REQ-DEL-007 exige Esc + retorno de foco al opener (hoy Esc navega al expediente; retorno de foco soft al cambiar de ruta).
- **Confirmaciones nativas:** `window.confirm` en marcado de asistencias y borrado de firma (config). Usables con teclado del browser; no son modales custom.
- **Tokens contraste:** `--color-muted-foreground: #54677a` sobre paper; anillo sidebar ink usa mix al 35% de blanco (posible anillo débil). Sin auditoría WCAG formal en este explore.
- **`.sr-only`:** duplicado en ~12 CSS de feature; no hay utilidad global en `styles.css`.
- **U3:** cerrado; no reabrir copy. Archive U3 intacto.

### Affected Areas

| Área | Archivos / specs | Por qué |
|------|------------------|---------|
| Shell drawer | `admin-shell.{ts,html,css}`, `sidebar-admin.css` | Trap Tab / `aria-modal` / anillo ink |
| Login | `login-form.*`, `login-page.*` | Smoke prioritario; deuda baja |
| Validación pública | `public-validation-page.{html,css}` | Foco CTA; scroll tabla; sin rediseño folio |
| Entrega | `certification-delivery-page.*` | Backdrop fuera del trap; error dialog |
| Revocación | `certification-revoke-page.*` | Backdrop `<a>` fuera del trap |
| Listados | CSS/HTML listas cursos/alumnos/asistencias/certs | Spot-check breakpoints; sin unificar todos |
| Tokens globales | `styles.css` | Contraste básico; opcional hoist `.sr-only` |
| Specs | `frontend-angular-shell`, deltas lean delivery/public/shell-chrome | Contratos U4 |

### Inventory — gaps rankeados

| # | Gap | Severidad | Fix quirúrgico | DEFER |
|---|-----|-----------|----------------|-------|
| 1 | Tab escapa de diálogos entrega/revocar vía backdrop focusable fuera del trap | Alta | Incluir backdrop en trap **o** `aria-hidden`/`tabindex=-1` en backdrop; enfocar error-dialog | — |
| 2 | Drawer mobile: sin Tab trap / sin `aria-modal` (sí Esc + inert) | Media–Alta | Trap Tab drawer+overlay; `aria-modal="true"` | — |
| 3 | Validación pública: CTAs dependen solo del anillo global; scroll tabla OK | Media | Verificar anillo en botones Reintentar/Volver; refuerzo CSS 1–3 líneas si falta | Rediseño trust/branding → U9 |
| 4 | Contraste básico: muted / anillo ink débil | Media | Ajuste token o anillo sidebar (sin repintar UI) | Auditoría WCAG completa / axe e2e → U9 |
| 5 | Login: deuda residual mínima post-P1 | Baja | Smoke teclado + contraste inputs; fixes solo si falla | — |
| 6 | Tablas: listados críticos ya stackean; secundarias con scroll-x | Baja–Media | Spot-check mobile; scroll/stack solo donde rompa | Unificar breakpoints globales |
| 7 | `window.confirm` nativo | Baja (cumple teclado) | Ninguno en U4 | Modal custom → rediseño (fuera de U4) |
| 8 | `.sr-only` duplicado | Baja | Hoist a `styles.css` opcional | — |
| 9 | Labels: login/config OK; new-cert curso usa `aria-label` en select (OK) | Baja | Solo asociar `for` si aparece label huérfano real | — |
| 10 | Patrones error/vacío/loading inconsistentes | — | **No tocar** | **U5** |
| 11 | Copy / glosario | — | **No tocar** | U3 cerrado |
| 12 | Responsive “pixel” / paridad visual profunda | — | Solo roturas bloqueantes | U9 smokes |

### Approaches

1. **Prioridad shell + públicos + diálogos (recomendado)** — Pass quirúrgico CSS/HTML/attrs en orden: (A) login smoke, (B) validación pública foco/scroll, (C) shell drawer trap+modal, (D) entrega/revocar trap backdrop, (E) spot-check listados. Spec lean ADDED en `frontend-angular-shell`; deltas mínimos en delivery/public si hace falta.
   - Pros: alinea checklist U4 y hard lock de prioridad; bajo riesgo visual; reutiliza patrones P6-05.
   - Cons: no cubre WCAG exhaustivo ni unifica breakpoints.
   - Effort: Low–Medium

2. **Barrido transversal de todos los listados/forms** — Inventario exhaustivo label/`for`, anillos y breakpoints en cada feature admin.
   - Pros: cobertura amplia.
   - Cons: riesgo >400 líneas; roza rediseño; diluye prioridad login/público/shell.
   - Effort: High

3. **Solo documentar + U9** — Sin código; checklist manual.
   - Pros: cero regresión.
   - Cons: no cierra PLAN §U4.
   - Effort: Low (no cumple objetivo)

### Recommendation

**Approach 1.** Fixes quirúrgicos en este orden:

1. Login — confirmar foco/labels (casi done).
2. Validación pública — anillo en CTAs + tabla `overflow-x` si hace falta.
3. Shell drawer — Tab trap + `aria-modal` (preservar Esc/`inert`/foco).
4. Diálogos entrega/revocar — cerrar escape de foco por backdrop; error-dialog usable.
5. Listados — solo roturas mobile evidentes (scroll o stack existente); no rediseñar cards.

Specs lean: **ADDED** requisitos a11y/responsive en `frontend-angular-shell` (p. ej. SHELL-A11Y-01 foco visible; SHELL-A11Y-02 drawer teclado; SHELL-A11Y-03 tablas listado críticas). Opcional **MODIFIED** lean: `admin-certificate-delivery-frontend` (trap incluye backdrop / no foco suelto); `frontend-public-validation` (foco CTA). Evitar abrir `admin-certifications-frontend` salvo escenario revocar trap si no cabe en shell.

### Risks

- Ampliar trap mal y romper Esc/navegación a expediente (entrega/revocar).
- Scope creep a unificar breakpoints (`48rem` vs `64rem`) o redesign de cards.
- Robar U5 (empty/error/loading copy/patrones).
- Ajuste de contraste percibido como “rediseño” si se cambian demasiados tokens.
- REQ-DEL-007 “foco vuelve al opener”: con navegación de ruta el retorno es implícito; no forzar SPA focus-restore complejo en U4.
- Presupuesto ~400 líneas: Approach 1 debe caber en un PR; si crece → encadenar shell/públicos vs diálogos/listados.

### Ready for Proposal

**Sí.** Alcance claro, gaps priorizados, DEFER explícitos (U5, U9, confirm nativo, unificación breakpoints, archive U3). Siguiente: `sdd-propose` con Approach 1 locked y targets de spec lean.

---

## Spec targets (propuestos para propose/spec)

| Spec | Delta | Contenido tentativo |
|------|-------|---------------------|
| `frontend-angular-shell` | **ADDED** (principal) | Foco visible global preservado; drawer mobile teclado (Esc + trap + inert); listados críticos tabla↔cards o scroll-x sin rotura; sin rediseño visual |
| `frontend-public-validation` | ADDED lean (opcional) | CTAs con foco visible; tabla fechas scrolleable en angosto |
| `admin-certificate-delivery-frontend` | MODIFIED lean (opcional) | Trap de foco no deja Tab en backdrop suelto; Esc cierra |
| `admin-shell-chrome` | Evitar si shell ADDED alcanza | Solo si hace falta precisar REQ-SHELL-10 |

**Fuera:** U5 states · U3 archive · API/business · modal custom para `confirm()` · axe/WCAG full (U9)

## DEFER (locked)

- U5: error/vacío/loading unificados, interceptor 401 UX, empty CTAs, QA vista forzada
- U9: smokes responsive/trust branding folio, auditoría contraste exhaustiva
- Confirm nativo → modal custom
- Unificación global de breakpoints
- Hub/copy (U3 cerrado)
- Backend / D0 / rotación token-QR
