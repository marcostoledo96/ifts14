# Auditoría visual Playwright — evaluación humana

Generado: 2026-07-17  
Suite: `apps/frontend-angular/e2e/visual-audit.spec.ts`  
Resultado automatizado: **56 PASS / 0 FAIL / 8 skipped** (smoke desktop-only en project mobile)  
Capturas: `e2e/artifacts/screenshots/{desktop,mobile}/*.png` (24×2)

## Alcance

| Viewport | Resolución |
|---|---|
| desktop | 1440×900 |
| mobile | 390×844 |

Páginas: home, 5 estados de validación pública, login, dashboard, config, alumnos (list/nuevo/detalle), asistencias (hub + por fecha), cursos (list/nuevo/detalle/editar), certificaciones (list/nueva/expediente/pdf/entrega/revocar).

Auth: mock HTTP de sesión (sin PHP). Datos: mocks in-memory (`useRealApi: false`).

## Veredicto

**Apto para recorrido manual de paridad.** Desktop se ve sólido y alineado a v0 en shell, dashboard, listas, curso detalle, expediente y validación pública. Mobile funciona en general (cards, drawer via hamburger) con **overflow real en login** y **expediente** (~498px vs 390).

## Hallazgos priorizados

### P0 — corregir antes de QA móvil serio

1. **Login mobile: card ~440–450px > 390**  
   El formulario/card se desborda horizontalmente (padding + min-width). Desktop OK.

2. **Expediente mobile: columnas/panels ~498px**  
   `aside.control-col` / ficha no colapsan del todo a ancho útil; hay scroll horizontal.

### P1 — a11y (axe)

- **curso-editar**: `aria-required-children` / `aria-required-parent` (critical) + `list`.
- **alumno-detalle / entrega / revocar**: `definition-list` / `dlitem` (dt/dd mal anidados).
- **entrega**: `aria-prohibited-attr`.
- **validación pública**: landmarks `main` duplicados / anidados (moderate).

### P2 — ruido / no bloqueante

- `a.skip-link` reportado como overflow (falso positivo; ya filtrado en detector).
- “missing” text en algunos admin mobile: falsos positivos de timing/selector tras login mock; las capturas sí muestran contenido correcto (ej. cursos-list mobile).

## Funcional (smoke desktop OK)

- Sidebar navega a Inicio / Cursos / Alumnos / Asistencias / Certificaciones / Configuración.
- Dashboard: CTAs **Cargar asistencias** + **Entrega manual** presentes (paridad P-02).
- Curso detalle: **Editar curso**, **Cargar asistencias**, **Agregar fecha**.
- Expediente: **Copiar** / **Compartir** / **Descargar PDF**.
- Login 401: alerta `.error-login` visible.

## Lectura visual (muestra)

| Pantalla | Desktop | Mobile |
|---|---|---|
| Dashboard | Shell + tiles + pendientes honestos + resumen OK | OK (skip-link ruido) |
| Cursos list | Densidad v0 OK | Cards densas OK |
| Curso detalle | CTAs y tabla fechas OK | — |
| Expediente | 2 columnas + preview oficial densa OK | Stack vertical OK; overflow X |
| Validación vigente | ACTA + sello + DNI completo OK | — |
| Login | Card centrada OK | Card desborda |

## Cómo re-ejecutar

```bash
# Terminal con ng serve en :4200
cd apps/frontend-angular
npm run e2e:visual
# Reporte HTML: npm run e2e:visual:report
# Markdown: e2e/artifacts/VISUAL-AUDIT-REPORT.md
```

## Limitaciones de esta pasada

- No compara pixel-a-pixel contra `muestra_pagina/` (no hay baselines v0).
- No ejercita API PHP real ni MariaDB.
- Contrast axe deshabilitado a propósito (ruido en mocks).
- Búsqueda topbar / Help / Bell son presentacionales (esperado).
