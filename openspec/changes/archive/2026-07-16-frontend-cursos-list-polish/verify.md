# Verify — frontend-cursos-list-polish (Ciclo 6: Lista de cursos UI polish)

**Fecha:** 2026-07-16
**Change:** `sdd/frontend-cursos-list-polish/`
**cwd:** `apps/frontend-angular/`
**Modo:** Standard (proposal + spec + design + tasks + apply-progress)
**Veredicto:** **PASS WITH WARNINGS**

```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:ad04290512f7513eb53faac669a8f4aa9b824813fc4141bd86ee9f7be51bbf09
verdict: pass_with_warnings
blockers: 0
critical_findings: 0
requirements: 7/7
scenarios: 9/11
test_command: CHROME_BIN=apps/frontend-angular/.verify-tmp/chrome-wrapper.sh npm run test:ci
test_exit_code: 0
test_output_hash: sha256:ad04290512f7513eb53faac669a8f4aa9b824813fc4141bd86ee9f7be51bbf09
build_command: npm run build
build_exit_code: 0
build_output_hash: sha256:0cbbd6b5df9060ae27322f4517f5d784d7ea747ce8d4195243c3096f66f41615
tsc_command: npx tsc --noEmit -p tsconfig.app.json
tsc_exit_code: 0
tsc_output_hash: sha256:ff63851439f41c4bd0169f582040e068eea30757f1f0e32317dee7f0f14672eb
```

---

## 1. Gates técnicos

| # | Comando | Exit | Resultado |
|---|---------|------|-----------|
| 1 | `npm run test:ci` | **0** | `TOTAL: 696 SUCCESS` |
| 2 | `npx tsc --noEmit -p tsconfig.app.json` | **0** | Sin errores TS |
| 3 | `npm run build` | **0** | Bundle OK (`courses-list-page` lazy chunk 18.95 kB) |

### Gate 1 — entorno Chrome

`ChromeHeadless` requiere `--no-sandbox` en este entorno. Se usó el wrapper del ciclo:

```bash
export CHROME_BIN="apps/frontend-angular/.verify-tmp/chrome-wrapper.sh"
# → /usr/bin/google-chrome --no-sandbox --headless=new --disable-gpu
#   --user-data-dir=apps/frontend-angular/.verify-tmp/chrome-home
cd apps/frontend-angular && npm run test:ci
```

Notas: mensajes `dbus`/`dconf`/`OOM score` son ruido headless, no fallas. En sandbox restringido Chrome puede colgar tras SUCCESS; con permisos completos el exit fue **0**.

### Gate 3 — build

Warnings de presupuesto CSS **preexistentes** (páginas ajenas): `student-detail-page`, `certification-pdf-preview`, `certification-revoke`, `certification-preview`. No introducidos por este ciclo.

---

## 2. Completitud de tareas

| Fase | Tareas | Estado |
|------|--------|--------|
| Phase 1 — chips | 1.1, 1.2 | ✅ `[x]` |
| Phase 2 — badge/acento/placeholders | 2.1 | ✅ `[x]` |
| Phase 3 — SVG states | 3.1 | ✅ `[x]` |
| Phase 4 — tracking | 4.1 | ✅ `[x]` |

**5/5 tareas completadas.** Sin incompletas que bloqueen archive.

---

## 3. Spec compliance matrix (REQ-CLIST-001…007)

| REQ | Escenario | Test / evidencia | Resultado |
|-----|-----------|------------------|-----------|
| **001** | Filtrar por Activos | `filtrar por estado=activo con chip reduce la lista` — `aria-pressed=true`, 3 cards | ✅ COMPLIANT |
| **001** | Toggle off | `segundo click en el mismo chip limpia el filtro de estado` — vuelve a 6 | ✅ COMPLIANT |
| **001** | Sin select | `expone chips de estado con dots y no usa select de estado` — 4× `data-estado` + `.chip-dot` | ✅ COMPLIANT |
| **002** | Limpiar filtros | `limpia filtros…` limpia `q`; código `onLimpiarFiltros` resetea estado+fechas; el test **no** activa estado/fechas antes de limpiar | ⚠️ PARTIAL |
| **003** | Badge en fila | `renderiza items… badge, acento y placeholders` — `.estado-badge .estado-dot`, texto “Activo” | ✅ COMPLIANT |
| **004** | Acento presente | Mismo test — `.row-accent` + `.card-accent`; template `aria-hidden` + clases `--{{estado}}` | ✅ COMPLIANT |
| **005** | Null → guion | Mismo test — `—` + `title="Dato disponible con integración real"`; `formatoMetrica`; seed `null` | ✅ COMPLIANT |
| **006** | Error + reintento | `muestra error seguro con icono y reintenta` — `role=alert`, SVG, Reintentar | ✅ COMPLIANT |
| **006** | Vacío total | Mismo test tras retry `[]` — copy + CTA `/admin/cursos/nuevo` | ✅ COMPLIANT |
| **006** | Sin coincidencias | `filtrar sin matches…` — mensaje + `[data-state=no-results] .estado-icon`; botón Limpiar en panel **sin** assert | ⚠️ PARTIAL |
| **007** | Sin fetch in-memory | `no llama fetch` | ✅ COMPLIANT |

**Compliance summary:** 9/11 escenarios COMPLIANT, 2 PARTIAL, 0 FAILING/UNTESTED.

### Cobertura estática adicional (sin escenario dedicado)

| Tema | Evidencia | Nota |
|------|-----------|------|
| Loading + SVG | Template `aria-busy` + `.estado-icon` spinner | Sin test de loading (transitorio) — SUGGESTION |
| Chips fechas Con/Sin | Test tabla/cards + `data-fechas` | Cubierto fuera del escenario “Limpiar” |
| Sin inventar conteos | `InMemoryCoursesService` seed `alumnosPresentes/certificaciones: null`; HTTP mapper también `null` | Cumple frontera REQ-007 |
| Diff ciclo | Solo `courses-list-page.{ts,html,css,spec.ts}` (+ checks colaterales); sin PHP/DB | Cumple no-backend |

---

## 4. Correctness (estático)

| Requisito | Estado | Notas |
|-----------|--------|-------|
| Chips 4 estados toggle single | ✅ | `onEstado` → mismo valor ⇒ `todos` |
| Labels filtro/badge | ✅ | Activos/Cerrados/… vs Activo/Cerrado/… |
| Badge + borde semántico | ✅ | CSS `.estado-badge--*` + tokens valid/muted |
| Acento lateral | ✅ | `.row-accent--*` / `.card-accent--*` |
| Presentes/Certificaciones `—` | ✅ | `formatoMetrica`; sin N+1 |
| SVG inline estados | ✅ | loading/error/empty/no-results |
| Sin backend / inventos | ✅ | Sin cambios PHP/migraciones; sin fetch en unit |

---

## 5. Design coherence

| Decisión | ¿Seguida? | Notas |
|----------|-----------|-------|
| Polish in-place, sin seams nuevos | ✅ | Misma página/servicios |
| Toggle single como certificaciones | ✅ | `onEstado` / `onConFechas` |
| SVG inline, no lucide | ✅ | Paths en template |
| `formatoMetrica` helper | ✅ | Presente |
| QA vista fuera de alcance | ✅ | Sin controles QA |

---

## 6. Issues

**CRITICAL:** None

**WARNING:**
1. REQ-CLIST-002 “Limpiar filtros”: el test no arma GIVEN completo (estado + fechas + q) antes de limpiar — solo verifica `q`.
2. REQ-CLIST-006 “Sin coincidencias”: no assert del botón Limpiar dentro de `[data-state=no-results]` (sí hay clear en summary cuando hay filtros).

**SUGGESTION:**
1. Test opcional de estado loading (SVG/`aria-busy`) si se quiere cierre 100% de MUST de iconos en carga.
2. Documentar `CHROME_BIN=…/chrome-wrapper.sh` en runbooks de verify (ya usado en ciclos previos).

---

## 7. Veredicto

**PASS WITH WARNINGS**

Gates 1–3 verdes (exit 0). Tareas 5/5. REQ-CLIST implementado y mayoritariamente cubierto por `courses-list-page.spec.ts` (14 specs focalizados dentro de 696 suite). Dos PARTIAL no bloquean archive; recomendable endurecer asserts de “Limpiar filtros” en un follow-up menor.

**Next recommended:** `sdd-archive`
