# Verify global paridad P-01…P-17

**Fecha:** 2026-07-17  
**Resultado:** PASS WITH WARNINGS

## Gates

| Gate | Resultado |
|------|-----------|
| `npm run test:ci` | **772/772 SUCCESS** |
| `npx tsc --noEmit -p tsconfig.app.json` | exit 0 |
| `npm run build` | exit 0 (warnings de budget CSS en páginas densas; sin error duro) |

## Estado por ciclo

| Ciclo | Change | Estado |
|-------|--------|--------|
| P-01 | shell topbar+sidebar | **DONE** — Help/Bell/sync/iconos Lucide |
| P-02 | dashboard tiles | **DONE** — Cargar asistencias + Entrega manual |
| P-03 | login | **DONE** (audit) — flecha, protocolo, placeholder institucional |
| P-04 | cursos list | **PARTIAL** — polish previo + SDD iniciado; densidad OK base |
| P-05 | curso detalle | **DONE** — Editar curso + Cargar asistencias |
| P-06 | curso editor layout | **PARTIAL** — layout previo sin campos fantasma |
| P-07 | alumnos list | **PARTIAL** — polish previo; sin legajo |
| P-08 | alumno detalle | **DONE** — CTAs + disabled honestos |
| P-09 | asistencias | **PARTIAL** — marking funcional; banner impacto omitido (sin API) |
| P-10 | cert list | **DONE** (ciclos previos) — sin columna Entrega |
| P-11 | nueva certificación | **DONE** (árbol) — preview documental ~441 HTML |
| P-12 | expediente | **DONE** (árbol) — paneles/kickers; budget CSS recortado |
| P-13 | entrega/pdf/revocar | **DONE** — Descargar PDF vía seam real |
| P-14 | configuración | **DONE** (árbol) — nav sticky 01–05 + notas honestas |
| P-15 | validación pública | **DONE** — ACTA, sellos, no encontrada/revocada/error; archive `2026-07-17-frontend-parity-validacion-publica` |
| P-16 | tokens | **DONE** — `--tracking-section`; sans reordenado |
| P-17 | verify global | **DONE** — este reporte |

## Residuos conocidos (no bloquean gates)

- CSS budget warnings (component styles > 8 kB) en listas/expediente/nueva/PDF/config.
- Avatar `AD` vs v0 `MP` (auth sin identidad).
- Footer page bajo main (Angular) vs ausente en shell v0.
- Secondary token oscuro legacy vs secondary claro v0.
- Hub `/admin/asistencias` extra vs sidebar v0 `href="#"`.

## Sin commits

Cambios locales pendientes de pedido explícito de commit.
