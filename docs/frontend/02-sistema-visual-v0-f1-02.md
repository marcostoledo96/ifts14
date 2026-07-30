# Sistema visual v0 — F1-02

Fuente de verdad visual para los ciclos F2-F6 del módulo `/certificados/`. Define tokens, primitivos, reglas de accesibilidad y límites del ciclo. Mantiene el contrato D0 (DNI completo público, fechas asistidas, token/QR permanente, sin tokens completos en UI/logs).

## Tokens

Definidos en `apps/frontend-angular/src/styles.css` bajo `:root`. Mapeo semántico desde `muestra_pagina/app/globals.css` (lectura segura), sin copiar React/Next ni instalar Tailwind.

### Color

| Token | Valor | Uso |
|---|---|---|
| `--color-ink` | `#0b1f33` | Texto principal, monograma, filetes. |
| `--color-ink-foreground` | `#ffffff` | Texto sobre `bg-ink`. |
| `--color-tech-blue` | `#1565c0` | Links, anillos de foco, trazos secundarios. |
| `--color-circuit` | `#00a8c6` | Acentos en monograma y filete, números romanos. |
| `--color-valid` / `--color-valid-soft` | `#2e7d32` / `#e8f5e9` | Estado válido, badge "Sistema en línea". |
| `--color-destructive` / `--color-destructive-soft` | `#c62828` / `#fbeaea` | Error técnico / estados destructivos (rol `alert`). |
| `--color-warning` / `--color-warning-soft` | `#f9a825` / `#fff6e0` | Advertencias. `BandaEstado` mapea `revoked` y `not-verifiable` a warning (estado no verificable, no error técnico). |
| `--color-paper` | `#f5f7fa` | Fondo del documento. |
| `--color-card` | `#ffffff` | Fondo del folio. |
| `--color-foreground` | `#263238` | Texto por defecto. |
| `--color-muted` / `--color-muted-foreground` | `#eef2f6` / `#54677a` | Superficies atenuadas / etiquetas. |
| `--color-border` | `#d9e0e8` | Bordes por defecto. |
| `--color-ring` | `#1565c0` | Anillo de foco. |

### Tipografía

| Token | Valor | Uso |
|---|---|---|
| `--font-sans` | `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` | UI y cuerpo. |
| `--font-mono` | `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace` | Etiquetas, tracking, códigos. |
| `--tracking-caps` | `0.18em` | Mayúsculas con tracking. |
| `--tracking-caps-tight` | `0.12em` | Formularios. |
| `--tracking-caps-membrete` | `0.22em` | Membrete superior. |

### Radio, espaciado, foco, motion y layout

| Token | Valor |
|---|---|
| `--radius-sm` / `--radius-md` / `--radius-lg` | `0.25rem` / `0.375rem` / `0.5rem` |
| `--space-1..6` | `0.25rem`, `0.5rem`, `0.75rem`, `1rem`, `1.5rem`, `2rem` |
| `--focus-ring` | `0 0 0 2px var(--color-ring)` |
| `--motion-fast` | `120ms` |
| `--layout-page-max` | `56rem` (ancho máximo de `main` y `HeaderInstitucional`) |
| `--layout-folio-max` | `42rem` (ancho máximo de `public-validation-page`; históricamente también `FolioShell`, eliminado en U1) |

`@media (prefers-reduced-motion: reduce)` anula animaciones y transiciones. El `skip-link` de `app.css` se preserva intacto.

## Primitivos en `shared/ui`

Standalone, standalone CSS, sin dependencias nuevas. Todos consumen tokens por cascada.

| Componente | Selector | Responsabilidad | Accesibilidad |
|---|---|---|---|
| `BandaEstado` | `app-banda-estado` | Banda de estado: `valid`, `revoked`, `not-verifiable`, `error`, `loading`. | `role="status"` para no críticos; `role="alert"` solo para error técnico; `aria-live="polite"`, `aria-atomic="true"`. Dueño único de la región live: no anidar `aria-live` en wrappers externos. |
| `CampoDato` | `[appCampoDato]` (directiva) | Aplica clases `.campo-*` sobre `<dt>`/`<dd>` nativos. Variantes: `default`, `mono`, `highlight`. | Mantiene `dl/dt/dd` válidos: sin wrappers custom dentro del `<dl>` (W2). Estilos compartidos en `styles.css`. |
| `HeaderInstitucional` | `app-header-institucional` | Membrete con monograma 4-cuadrados, título IFTS 14, badge "Sistema en línea", filete doble. | `role="banner"` único a nivel raíz. SVG decorativo con `aria-hidden="true"`. |
| ~~`FolioShell`~~ | ~~`app-folio-shell`~~ | **Eliminado en U1** (sin consumidores). Validación pública no depende de este shell. Restaurar solo con consumidor real (SHELL-HYG-02). | — |

### Contratos de inputs

```ts
// app-banda-estado
kind = input.required<EstadoBanda>(); // 'valid' | 'revoked' | 'not-verifiable' | 'error' | 'loading'
title = input.required<string>();
description = input<string>('');
stateLabel = input<string>('');

// [appCampoDato] (directiva sobre dt/dd nativos)
variant = input<VarianteCampo>('default'); // 'default' | 'mono' | 'highlight'

// app-header-institucional
subtitle = input('Validación oficial de certificados');
showOnlineBadge = input(true);

// app-folio-shell — eliminado en U1 (sin API vigente)
```

## Reglas de uso

- Toda pantalla pública DEBE usar `BandaEstado` para comunicar estado de verificación (válido / no verificable / error técnico / carga). `BandaEstado` es el único dueño de la región live (`aria-live`/`aria-atomic`): los wrappers externos no deben replicar estas atributos para evitar regiones live anidadas.
- Los pares etiqueta/valor dentro de un `<dl>` DEBEN usar `<dt>`/`<dd>` nativos con la directiva `appCampoDato` (sin wrappers custom) para mantener `dl/dt/dd` válidos (W2).
- `HeaderInstitucional` se usa una sola vez por página raíz.
- No reintroducir `FolioShell` sin ≥1 consumidor de producto (SHELL-HYG-02).
- SVG decorativo siempre con `aria-hidden="true"`.
- Foco visible global vía `:focus-visible` + `--focus-ring`.

## Fuera de alcance (F1-02)

- Pantallas admin, login, dashboard, listados, cursos, PDF, QR y revocación.
- Backend, deploy, base de datos, material privado, `.env*`, dumps o logs.
- Tailwind, shadcn, CVA, lucide, nuevas fuentes o dependencias.
- Copia literal de JSX, hooks, App Router, `cn()` o configuración de `muestra_pagina/`.
- Dark mode (queda para un ciclo posterior si se aprueba).

## Migración futura a Tailwind (F1-04)

Los tokens se exponen como CSS custom properties en `:root`. Si F1-04 instala Tailwind v4, puede mapearlos con `@theme inline { --color-ink: var(--color-ink); }` sin reescribir los primitivos. Los nombres semánticos ya están alineados.

## Verificación

Estado al cierre del ciclo F1-02 (archivado en `sdd-archive`):

- `cd apps/frontend-angular && npm run test:ci` → 96/96 SUCCESS (ver `verify-report.md`).
- `cd apps/frontend-angular && npm run build` → verde, dentro de presupuestos (263.84 kB initial / 75.22 kB transfer; lazy `public-validation-page` 8.96 kB).
- QA manual: se ejecutó Playwright local en `127.0.0.1:4420/certificados/validar/demo-valido` (anchos 1026px y 390px, foco del skip-link visible, contraste mínimo 5.19:1, consola sin warnings/errors). La comparación visual fue estática contra tokens/membrete de `muestra_pagina/app/globals.css`, no pixel-perfect con capturas guardadas; ver `verify-report.md` para el límite documentado.
- Verdict: PASS WITH WARNINGS (sin issues CRITICAL). Advertencias no bloqueantes: presupuesto de revisión 1500 (preservado), QA visual no pixel-perfect, `FolioShell` creado/testeado pero no integrado en página pública (queda para F2/F4).

## Referencias

- `openspec/changes/archive/2026-07-07-f1-02-v0-design-system/` — artefactos SDD del ciclo (archivado).
- `docs/frontend/00-angular20-port-v0.md` — port v0, inventario y estado Angular.
- `muestra_pagina/app/globals.css` — fuente visual original (lectura segura).