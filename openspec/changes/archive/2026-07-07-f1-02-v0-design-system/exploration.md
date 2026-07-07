# Exploration: F1-02 — Extraer sistema visual desde v0

## Goal

F1-02 es el segundo ciclo de la Fase 1 de Matías. Su objetivo, según el prompt exacto en `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` (líneas 557-596), es **convertir la referencia v0 disponible en `muestra_pagina/` en criterios visuales portables**: composición, paleta, tipografía, espaciado, componentes, estados, responsive y accesibilidad. NO es implementar todas las pantallas admin; es **dejar lista la base de sistema visual** sobre la cual los ciclos F2-F6 puedan construir con criterio compartido, sin copiar React/Next literalmente y sin instalar dependencias no aprobadas.

El ciclo F1-01 (archivado en `openspec/changes/archive/2026-06-30-f1-01-auditar-muestra-pagina/`) confirmó el inventario de la referencia v0 (19 pantallas con referencia para flujos 4-22; 0 pendientes) y los tokens visuales observados a alto nivel. F1-02 baja esos criterios a **tokens concretos + primitivos Angular mínimos + documentación del sistema visual**, siempre con el scaffold actual de Marcos en `apps/frontend-angular/` como punto de partida y sin tocar `muestra_pagina/` salvo lectura segura de su `app/globals.css` y nombres de archivos en `components/`.

## Scope (in / out)

### Incluido

- **Tokens de diseño** en `apps/frontend-angular/src/styles.css` (CSS-first, sin Tailwind ni PostCSS): paleta semántica mapeada desde `muestra_pagina/app/globals.css` (variables `--ink`, `--tech-blue`, `--circuit`, `--valid`, `--destructive`, `--warning`, `--paper`, etc.), tipografía (familia sans + mono, escala, tracking), radio, espaciado base, estados de foco y transiciones, sombras. Scope acotado a lo necesario para que los ciclos siguientes no tengan que redefinir paleta o tipografía.
- **Primitivos Angular mínimos compartidos** bajo `apps/frontend-angular/src/app/shared/ui/`: 3-4 componentes reusables (no admin, no públicos completos) que ya consuman los tokens y sirvan como base para los flujos F2-F6. Candidatos mínimos: `BandaEstado` (banda de status válida/revocada/error/no-encontrada según v0), `CampoDato` (par etiqueta/valor con `mono`/`destacado` según `folio-certificado.tsx`), `HeaderInstitucional` (membrete con monograma 4-cuadrados y filete doble), `FolioShell` (articulado del folio con membrete + estado + cuerpo + aside + pie, vacío de contenido). NO se implementa el folio con datos; solo el shell vacío. NO se implementa login, dashboard, listados, ni cursos.
- **Migración del estilo existente de `public-validation-page.css`**: reemplazar los valores hex inline (`#16a34a`, `#d97706`, `#dc2626`, `#2563eb`, fondos `#f0fdf4`, `#fffbeb`, `#fef2f2`, `#eff6ff`) por tokens semánticos. Mismo cambio quirúrgico en `app.css` para alinear tipografía y color institucional.
- **Documentación del sistema visual**:
  - `docs/frontend/02-sistema-visual-v0-f1-02.md`: nuevo documento (~120 líneas) con paleta, tipografía, radio, espaciado, escala, foco, motion, y tabla de "tokens disponibles" mapeada a su fuente visual en `muestra_pagina/app/globals.css` (sin re-listar los hex del v0, solo los nombres semánticos y su uso).
  - `docs/frontend/00-angular20-port-v0.md`: patch mínimo en la sección "Tokens visuales observados" para confirmar que los tokens ahora están aplicados a `apps/frontend-angular/`. No reescritura.
- **Tests unitarios** sobre los primitivos creados (mínimo: 1 test por primitivo cubriendo el render básico con tokens aplicados, foco visible, role ARIA correcto). El repo ya tiene Karma + ChromeHeadless configurado (`npm test --watch=false` 74/74 en M3-06).
- **Validaciones automáticas disponibles**: `npm test --watch=false` y `npm run build` desde `apps/frontend-angular/`.

### Excluido

- Implementar pantallas admin (F2-03 a F2-06 y F4-F6 son ciclos separados; cada uno con su spec/contrato).
- Implementar login, dashboard, listados, formularios de curso/asistencia, edición de certificación, PDF, QR, revocación, auditoría, carga masiva, configuración institucional.
- Instalar Tailwind v4, shadcn, class-variance-authority, tailwind-merge, clsx, lucide, base-ui ni cualquier otra dependencia de v0. `package.json` no se toca más allá de lo necesario (ver §"Decisión Tailwind").
- Copiar JSX, hooks, App Router, `lib/utils.ts` (cn), `components.json` ni `postcss.config.mjs` desde `muestra_pagina/`.
- Portar las credenciales demo (`usuario.demo@example.invalid` / `demo`) ni el `X-Admin-Key` literal desde `login-form.tsx`.
- Modificar `muestra_pagina/`. Solo lectura segura: nombres de `app/`, `components/`, `capturas/`, contenido de `app/globals.css` y `app/layout.tsx`, y nombres en `components/validacion/*` y `components/admin/*`. No abrir `app/admin/*/page.tsx` ni `app/estados/page.tsx` (leer solo `components/validacion/*` y los archivos administrativos no implica ver `page.tsx` específicos; alcanza con el header, folio, login, admin-shell y footer).
- Tocar `apps/backend-php/`, `database/`, `deploy/`, `docker/`, `.htaccess`, configuración de runtime, `material_privado_no_versionar/`, `.env*`, dumps, logs, secretos.
- Tocar ramas no mergeadas de otros ciclos (F0-02, F0-03, policy change, M3-06, M4-01b, etc.) ni abrir cambios activos de Marcos.
- Reescribir `muestra_pagina/app/globals.css` ni crear un `tailwind.config.*` paralelo.
- Scaffolding adicional de Angular (`ng add` nada; solo `styles.css` y `src/app/shared/ui/*`).
- Crear artefactos de las fases siguientes en este turno: `proposal.md`, `design.md`, `tasks.md`, `specs/*`, `apply-progress.md`, `verify-report.md`, `archive-report.md` son responsabilidad de las fases siguientes. Aquí solo se crea `exploration.md`.
- Cualquier `git add`, `git commit`, `git push`, merge, rebase, branch o checkout.

## Current State (Angular hoy, F1-02)

### Estructura de la app (`apps/frontend-angular/`)

- Angular CLI 20.3.30 standalone. Estructura por features. `package.json` sin Tailwind, sin design system, sin dependencias de UI: solo `@angular/*` 20.3.0, `rxjs`, `tslib`, `zone.js` y tooling (Karma, Jasmine, TypeScript 5.9.2).
- `angular.json`: `baseHref: "/certificados/"` en producción, presupuesto `500 kB warn / 1 MB error` por bundle initial y `4 kB warn / 8 kB error` por `anyComponentStyle`. Tres configuraciones: `production`, `production-staging` (`/certificados_staging/`) y `development`. `proxy.conf.json` activo en `ng serve`.
- `src/styles.css`: 1 línea, solo comentario vacío (`/* You can add global styles... */`). **Sin tokens, sin reset, sin tipografía, sin paleta.**
- `src/app/app.css` (27 líneas): layout mínimo del shell público. `skip-link` con `left: -999px` y `:focus { left: 0; }`, padding `1rem` en header/footer/main. Sin tipografía ni color institucional. `header` y `footer` sin identidad.
- `src/app/app.ts`: `App` standalone con `ChangeDetectionStrategy.OnPush`, importa `RouterOutlet`, `templateUrl: './app.html'`, `styleUrl: './app.css'`. Sin `header[role=banner]` ni `footer` con identidad institucional (ver §"Migración" abajo).
- `src/app/app.routes.ts`: tres rutas — `''` (landing sin validación), `validar/:tokenCertificacion` (carga `PublicValidationPage` con `loadComponent`), `**` (not-found).
- `src/app/features/landing/`, `not-found/`: páginas placeholder con tests, sin identidad visual.
- `src/app/features/public-validation/public-validation-page.html`: usa `@if/@switch` con 4 estados (`loading`, `error`, `valid`, `not-verifiable`, `technical-error`). Renderiza un `<dl>` con curso, fecha emisión, estudiante, documento (DNI completo por D0), fechas asistidas (condicional) y código.
- `src/app/features/public-validation/public-validation-page.css` (50 líneas): **valores hex hardcodeados** — `border: 1px solid #cbd5e1; border-radius: 0.25rem;`, `state-valid { border-color: #16a34a; background: #f0fdf4; }`, `state-not-verifiable { border-color: #d97706; background: #fffbeb; }`, `state-error { border-color: #dc2626; background: #fef2f2; }`, `state-loading { border-color: #2563eb; background: #eff6ff; }`. `dl` con `grid-template-columns: max-content 1fr; gap: 0.25rem 1rem;`. Tipografía: `font-weight: 600` solo en `dt`. `max-width: 42rem; margin: 0 auto;` en `.validation`. **Sin tokens, sin sistema, sin foco explícito.**
- `src/app/shared/certificates/`: lógica de validación (`dto.ts`, `validation-source.ts`, `mock-tokens.ts`, `http-validation.source.ts`, `result-mapper.ts`, `validation.service.ts`) con su suite. **Out of scope visual** para F1-02 (no tocar).
- `src/environments/`: `environment.ts`, `environment.development.ts`, `environment.staging.ts` con `useRealApi: false` por defecto. Out of scope.
- 74/74 tests verdes en M3-06 final (Karma + ChromeHeadless). Build de producción verde (`253.46 kB initial / 72.04 kB transfer`; lazy `public-validation-page` 5.18 kB).

### Estado del sistema visual

- **No existe design system, ni tokens, ni paleta, ni tipografía, ni escala, ni radio, ni motion.** Cada componente declara sus valores hex en su propio CSS. El shell (`app.css`) tampoco tiene identidad institucional más allá del skip link.
- La única decisión visual vigente es la convención D0 (DNI completo en validación pública, QR permanente, fechas asistidas, sin tokens completos en UI/logs) documentada en `AGENTS.md` y `docs/frontend/00-angular20-port-v0.md`.
- Los tokens ya identificados por F1-01 en `docs/frontend/00-angular20-port-v0.md` son **criterios portables** (no valores): "base institucional sobria, fondos claros, contraste alto, acentos controlados para estados"; "Sans-serif legible para UI; monoespaciada solo para códigos, tokens abreviados o trazabilidad"; "composición tipo folio/certificado, jerarquía clara y lectura vertical cómoda" (público); "shell administrativo con navegación simple, acciones principales visibles y tablas/listas legibles" (admin). F1-02 baja estos criterios a tokens concretos.

## Reference state (`muestra_pagina/`, lectura segura)

- `muestra_pagina/app/globals.css` (192 líneas) define el sistema completo de v0 con **Tailwind v4 + shadcn/tailwind.css + tw-animate-css**. La parte portable a Angular sin Tailwind es el bloque `:root` (líneas 62-108): paleta con hex literal (`--ink: #0b1f33`, `--ink-foreground: #ffffff`, `--tech-blue: #1565c0`, `--circuit: #00a8c6`, `--valid: #2e7d32`, `--valid-foreground: #ffffff`, `--valid-soft: #e8f5e9`, `--destructive: #c62828`, `--destructive-soft: #fbeaea`, `--warning: #f9a825`, `--warning-soft: #fff6e0`, `--paper: #f5f7fa`, `--background: #f5f7fa`, `--foreground: #263238`, `--card: #ffffff`, `--card-foreground: #263238`, `--muted: #eef2f6`, `--muted-foreground: #54677a`, `--accent: #e6f6f9`, `--accent-foreground: #0b1f33`, `--secondary: #eef2f6`, `--secondary-foreground: #0b1f33`, `--primary: #0b1f33`, `--primary-foreground: #ffffff`, `--border: #d9e0e8`, `--input: #d9e0e8`, `--ring: #1565c0`, `--radius: 0.5rem`). Más dark mode con `oklch()` (no portable directo a Angular sin refactor de paleta; ver §"Decisión Tailwind").
- `muestra_pagina/app/layout.tsx` (57 líneas): importa `Geist` y `Geist_Mono` desde `next/font/google` y aplica `--font-geist-sans` y `--font-geist-mono` como CSS variables. La intención portable es: **dos familias tipográficas**, una sans para cuerpo y UI, una mono para etiquetas pequeñas, códigos, tracking en mayúsculas y datos tabulares. Geist no es portable directamente (es una dependencia de Next/font); F1-02 puede proponer familia sans equivalente (system stack o Inter) y mono equivalente (system mono stack) sin instalar fuentes web. Geist no es obligatoria; la decisión tipográfica concreta queda en `sdd-propose`/`sdd-design`.
- `muestra_pagina/components/validacion/folio-certificado.tsx` (224 líneas) muestra el **patrón compositivo del folio**: (1) **membrete** en `bg-ink text-ink-foreground` con título (`text-2xl font-semibold`), etiqueta mono pequeña con tracking (`font-mono text-[11px] tracking-[0.22em] text-circuit`), caja de numeración documental con borde interno, filete de folio con `border-t border-white/15`; (2) **banda de estado** con `bg-valid-soft` o `bg-destructive-soft`, icono circular con check, label `Documento verificado`, `ESTADO: VÁLIDO` mono right; (3) **cuerpo editorial** en grid `md:grid-cols-[1fr_300px]` con secciones numeradas romanas (`I.`, `II.`, `III.`) y `TituloSeccion` con filete al final; (4) **riel de verificación** (aside) con sello oficial, QR y metadatos mono; (5) **pie de control** con leyenda institucional y `ESTADO DE REGISTRO: VÁLIDO`.
- `muestra_pagina/components/validacion/header-institucional.tsx` (40 líneas): monograma 4-cuadrados (`rect 2,2,6,6 fill=currentColor`, `rect 12,2,6,6 fill=var(--circuit)`, `rect 2,12,6,6 fill=var(--circuit)`, `rect 12,12,6,6 fill=currentColor`), título `IFTS N.° 14`, subtítulo, badge `Sistema en línea` con `bg-valid` y `animate-ping`, filete doble (`h-0.5 bg-ink` + `h-px bg-circuit/50`).
- `muestra_pagina/components/validacion/footer-institucional.tsx` (53 líneas): monograma `14` en cuadrado `bg-ink`, texto institucional, link `Volver al sitio del instituto` con flecha, disclaimer `DOCUMENTO ELECTRÓNICO DE CONSULTA · NO REEMPLAZA AL CERTIFICADO ORIGINAL EN PDF` en mono.
- `muestra_pagina/components/validacion/campo.tsx` (54 líneas): `Campo` con etiqueta `font-mono text-[11px] tracking-wide text-muted-foreground`, valor con tres variantes (`mono: "font-mono text-[13px]"`, `destacado: "text-[17px] font-semibold leading-snug"`, default: `"text-[15px] font-medium leading-snug"`). `TituloSeccion` con número romano en `text-circuit`, label en `font-mono text-[11px] tracking-[0.18em] text-foreground`, filete `h-px min-w-6 flex-1 self-center bg-border`.
- `muestra_pagina/components/validacion/estado-revocada.tsx` y `estado-error.tsx` / `estado-no-encontrada.tsx` confirman la **regla de variantes de la banda de estado**: `bg-valid-soft` + `border-valid/30` + icono check para válido; `bg-destructive-soft` + `border-destructive/30` + icono rombo para revocada; `bg-warning-soft` para advertencia; banda de error con `bg-destructive-soft` + icono de triángulo.
- `muestra_pagina/components/admin/admin-shell.tsx` (103 líneas): sidebar fija `lg:block w-64` con `SidebarAdmin`, drawer mobile `lg:hidden` con overlay `bg-ink/60`, topbar `sticky top-0` con `border-b border-border bg-card/90 backdrop-blur`, búsqueda `h-9 rounded-sm border border-input`, iconos `h-5 w-5` con `strokeWidth={1.75}`. Importante: la fuente de iconos es `lucide-react`, **no portable** sin instalar; F1-02 puede usar SVG inline (los SVGs de `header-institucional.tsx`, `estado-revocada.tsx`, `campo.tsx` son inline y portables) o proponer la dependencia de iconos en un ciclo posterior.
- `muestra_pagina/components/admin/login-form.tsx` (230 líneas): **NO portable** por su contenido (credenciales demo `usuario.demo@example.invalid` / `demo`, redirect `window.location.href = "/admin/dashboard"`). Solo la **estructura de formulario** (fieldset/legend sr-only, input con icono izquierdo, label mono tracking, botón primario `bg-ink` con ring de foco `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`) y la **alerta inline** con borde `border-l-2 border-destructive bg-destructive-soft` son reutilizables como patrón.
- 59 capturas en `muestra_pagina/capturas/` (no 25 como declaró la auditoría F1-01; el conteo real actual es 59, con varios placeholders de 6-8 KB). El inventario por prompt está documentado en `docs/frontend/00-angular20-port-v0.md` y `docs/frontend/01-auditoria-muestra-pagina-f1-01.md`. F1-02 no necesita listar capturas nuevas: la auditoría ya cumplió ese rol.
- `prompts_stitch_v0_ifts14.md` (111.7 KB) y `pnpm-lock.yaml` (122.4 KB) son archivos de referencia grandes: **no se abren ni se resumen** en este ciclo.

## Affected Areas

- `apps/frontend-angular/src/styles.css` — **CREAR contenido** (tokens semánticos en `:root`, `@media (prefers-reduced-motion: reduce)` para motion opcional, `font-family` base, foco global). Estimado: 60-90 líneas.
- `apps/frontend-angular/src/app/app.css` — **MODIFICAR quirúrgicamente** para usar tokens (`color: var(--ink)`, fondo `var(--paper)`, tipografía sans, mantener skip link y focus). Estimado: 30-40 líneas (incluye comentario de migración).
- `apps/frontend-angular/src/app/features/public-validation/public-validation-page.css` — **MODIFICAR** reemplazando los 5 hex inline (`#16a34a`, `#d97706`, `#dc2626`, `#2563eb`, fondos `#f0fdf4`, `#fffbeb`, `#fef2f2`, `#eff6ff`, `#cbd5e1`) por tokens semánticos. Estimado: 30-40 líneas.
- `apps/frontend-angular/src/app/shared/ui/` — **CREAR directorio** con 3-4 primitivos mínimos:
  - `shared/ui/tokens.ts` (TypeScript const para nombres de tokens si la decisión es exponerlos a componentes; opcional, ver §"Decisión Tailwind").
  - `shared/ui/banda-estado.ts` + `banda-estado.html` + `banda-estado.css` + `banda-estado.spec.ts`: banda de status con `kind: 'valid' | 'revoked' | 'not-verifiable' | 'error' | 'loading'`, icono SVG inline, label, slot de "ESTADO: X" mono right. Estimado: 80-100 líneas total.
  - `shared/ui/campo-dato.ts` + `campo-dato.html` + `campo-dato.css` + `campo-dato.spec.ts`: par etiqueta/valor con tres variantes (`mono`, `destacado`, default). Estimado: 60-80 líneas.
  - `shared/ui/header-institucional.ts` + `header-institucional.html` + `header-institucional.css` + `header-institucional.spec.ts`: membrete con monograma 4-cuadrados, título IFTS 14, badge "Sistema en línea", filete doble. Estimado: 80-100 líneas.
  - `shared/ui/folio-shell.ts` + `folio-shell.html` + `folio-shell.css` + `folio-shell.spec.ts`: shell vacío de folio con slots `membrete`, `bandaEstado`, `cuerpo` (proyecta `dl` editor), `aside`, `pie`. Estimado: 100-130 líneas.
- `apps/frontend-angular/src/app/app.html` — **MODIFICAR** para envolver `<router-outlet>` en una estructura que use el `HeaderInstitucional` solo en rutas públicas, o mantener el header actual pero aplicarle los estilos institucionales (decisión en `sdd-design`).
- `apps/frontend-angular/src/app/features/public-validation/public-validation-page.html` — **MODIFICAR** para reemplazar la estructura de `.state` actual por `FolioShell` + `BandaEstado` + `CampoDato` (mínimo cambio, sin tocar la lógica de `view()` ni `hasError()`).
- `apps/frontend-angular/src/app/features/public-validation/public-validation-page.spec.ts` — **MODIFICAR** para agregar tests que cubran el render con `BandaEstado` y `CampoDato` (los tests actuales validan la estructura con `state-*` classes; deben migrar a `data-testid` o roles ARIA).
- `docs/frontend/02-sistema-visual-v0-f1-02.md` — **CREAR** (~120 líneas): documentación del sistema visual (paleta, tipografía, radio, espaciado, foco, motion, tabla de tokens).
- `docs/frontend/00-angular20-port-v0.md` — **MODIFICAR** con patch mínimo en la sección "Tokens visuales observados" (~5-10 líneas) para confirmar la aplicación a `apps/frontend-angular/`. Decisión final en `sdd-archive`.
- `openspec/changes/f1-02-v0-design-system/` — **CREAR** con los 7 artefactos OpenSpec restantes (`proposal.md`, `design.md`, `tasks.md`, `apply-progress.md`, `verify-report.md`, `archive-report.md`; `exploration.md` se crea en este turno).

### Out of affected areas (no tocar)

- `apps/frontend-angular/src/app/shared/certificates/*` (lógica de validación intacta, M3-06 verde).
- `apps/frontend-angular/src/app/features/landing/*`, `features/not-found/*` (placeholders; pueden ganar identidad visual por cascada de tokens sin tocarse en este ciclo).
- `apps/frontend-angular/src/environments/*`.
- `apps/frontend-angular/angular.json` (presupuestos y base href ya correctos; no se modifican).
- `apps/frontend-angular/package.json` salvo justificación explícita y aprobación en `sdd-propose` (ver §"Decisión Tailwind").
- `muestra_pagina/` (lectura segura solamente).
- Todo lo no listado en `apps/frontend-angular/src/app/`.

## Approaches (resumen comparativo)

| Approach | Pros | Con | Effort | Notas |
|---|---|---|---|---|
| **A. CSS custom properties en `styles.css` + primitivos Angular standalone con CSS por componente (RECOMENDADO)** | Cero nuevas dependencias; compatible con presupuesto `4 kB warn / 8 kB error` por componente; portable a Angular 20 nativo; tokens se aplican por cascada; tests existentes siguen funcionando; mismo patrón ya en M3-06 (`baseHref`, `apiBaseUrl`). | Sin utility classes (hay que escribir `padding: 1rem` en lugar de `p-4`); primitivos hay que escribirlos a mano. | Low | F1-02 puede proponerlo, F1-04 (Tailwind) queda como decisión separada y aprobada. |
| B. Tailwind v4 + shadcn + CVA + tailwind-merge (clonar stack de v0) | Mismas clases que v0; máxima velocidad de portado visual futuro; ecosystem conocido. | Suma 3-5 dependencias (`tailwindcss`, `@tailwindcss/postcss`, `postcss`, `class-variance-authority`, `tailwind-merge`, opcional `clsx`); setup PostCSS + `.postcssrc.json`; lockfile engorda; rompe regla "No agregar paquetes por comodidad" en `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`; F1-04 ya está reservado para Tailwind. | Medium-High | Decidir en `sdd-propose` con Matías; este approach no se aplica en F1-02 sin aprobación explícita. |
| C. CSS Modules o ViewEncapsulation avanzada de Angular 20 | Encapsulación fuerte; tokens por componente. | Más boilerplate por componente; menos descubribilidad de tokens globales. | Medium | Variante de A, no preferida. |
| D. SCSS con variables SCSS en lugar de CSS custom properties | Compilación tipada; nested rules legibles. | Requiere `sass` instalado (no está hoy en `package.json`); CSS custom properties son el estándar W3C y son lo que v0 hace en `:root`. | Medium | Peor trade-off que A. |

### Decisión recomendada: Approach A

- Cumple la regla "No instalar dependencias no aprobadas" sin negociar.
- Encaja con `apps/frontend-angular/AGENTS.md:2` ("Angular 20, estructura por features, separar componentes/servicios/modelos") y con el scaffold verde de M3-06.
- Deja Tailwind explícitamente fuera de F1-02, alineado con la división del prompt: F1-02 extrae sistema visual; F1-04 (otra rama, otro ciclo, otro spec) configura Tailwind. F1-02 puede migrar a Tailwind en F1-04 sin reescribir primitivos si los tokens se exponen como CSS custom properties.
- Presupuesto: 1 doc (`docs/frontend/02-sistema-visual-v0-f1-02.md` ~120) + 1 styles.css global (~80) + 1 app.css + 1 public-validation-page.css + 4 primitivos × ~80 líneas (componente + html + css + spec) = ~520 líneas de código + ~150 de docs = **~670 líneas**, bien por debajo de 1500. Margen para test exhaustivo y QA manual.

## Decisión Tailwind (adelanto, se confirma en `sdd-propose`)

- **F1-02 NO instala Tailwind.** Approach A. Si en `sdd-propose` Matías confirma que quiere Tailwind ya, se eleva a F1-04 (ciclo reservado) o se reescribe la rama; en cualquier caso, F1-02 no se mete con `package.json` ni `angular.json` salvo justificación aprobada en el mismo turno.
- Justificación portable: la paleta de v0 es **CSS variables en `:root`** (`--ink`, `--valid`, etc.); Tailwind v4 en v0 las lee con `@theme inline { --color-ink: var(--ink); }`. Si F1-02 emite los mismos nombres en `:root`, F1-04 puede mapearlos a Tailwind v4 sin tocar componentes. Los nombres de tokens propuestos en F1-02 son **semánticos** (`--color-ink`, `--color-valid`, `--font-sans`, `--radius-md`, `--space-2`, `--focus-ring`), no los nombres literales de v0.

## Tokens propuestos (resumen ejecutivo, se formaliza en `sdd-design`)

| Categoría | Token | Valor propuesto | Fuente visual v0 | Uso |
|---|---|---|---|---|
| Color | `--color-ink` | `#0b1f33` | `--ink` (v0) | Texto principal, monograma, filetes. |
| Color | `--color-ink-foreground` | `#ffffff` | `--ink-foreground` | Texto sobre `bg-ink`. |
| Color | `--color-tech-blue` | `#1565c0` | `--tech-blue` | Links, anillos de foco, trazos secundarios. |
| Color | `--color-circuit` | `#00a8c6` | `--circuit` | Acentos en monograma y filete, números romanos. |
| Color | `--color-valid` | `#2e7d32` | `--valid` | Estado válido, badge "Sistema en línea". |
| Color | `--color-valid-soft` | `#e8f5e9` | `--valid-soft` | Fondo banda de estado válido. |
| Color | `--color-destructive` | `#c62828` | `--destructive` | Errores, revocada. |
| Color | `--color-destructive-soft` | `#fbeaea` | `--destructive-soft` | Fondo banda error/revocada. |
| Color | `--color-warning` | `#f9a825` | `--warning` | Advertencias. |
| Color | `--color-warning-soft` | `#fff6e0` | `--warning-soft` | Fondo banda advertencia. |
| Color | `--color-paper` | `#f5f7fa` | `--paper` / `--background` | Fondo del documento. |
| Color | `--color-card` | `#ffffff` | `--card` | Fondo del folio. |
| Color | `--color-foreground` | `#263238` | `--foreground` | Texto por defecto. |
| Color | `--color-muted` | `#eef2f6` | `--muted` | Superficies atenuadas, inputs. |
| Color | `--color-muted-foreground` | `#54677a` | `--muted-foreground` | Etiquetas, helper text. |
| Color | `--color-border` | `#d9e0e8` | `--border` | Bordes por defecto. |
| Color | `--color-ring` | `#1565c0` | `--ring` | Anillo de foco. |
| Tipografía | `--font-sans` | `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` | Geist (v0) | Familia UI. |
| Tipografía | `--font-mono` | `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace` | Geist Mono (v0) | Etiquetas, tracking, datos. |
| Tipografía | `--tracking-caps` | `0.18em` | `tracking-[0.18em]` en `TituloSeccion` | Mayúsculas con tracking. |
| Tipografía | `--tracking-caps-tight` | `0.12em` | `tracking-[0.12em]` en `login-form` | Formularios. |
| Tipografía | `--tracking-caps-membrete` | `0.22em` | `tracking-[0.22em]` en `folio-certificado` | Membrete superior. |
| Radio | `--radius` | `0.5rem` | `--radius` v0 | Base. |
| Radio | `--radius-sm` | `0.25rem` | `--radius-sm` v0 | Badges, inputs. |
| Espaciado | `--space-1` a `--space-6` | `0.25rem`, `0.5rem`, `0.75rem`, `1rem`, `1.5rem`, `2rem` | implícito | Escala 4-32 px. |
| Foco | `--focus-ring` | `0 0 0 2px var(--color-ring)` | `focus-visible:ring-2 focus-visible:ring-ring` v0 | Anillo de foco. |
| Motion | `--motion-fast` | `120ms` | implícito en `transition-colors` | Transiciones cortas. |

(Valores hex confirmados contra `muestra_pagina/app/globals.css` líneas 62-108.)

## Componentes candidatos (F1-02 produce los 4 mínimos)

| Componente Angular | Patrón v0 de referencia | Por qué entra en F1-02 | Por qué NO entra (queda para ciclos siguientes) |
|---|---|---|---|
| `HeaderInstitucional` | `components/validacion/header-institucional.tsx` | Identidad institucional del módulo; aparece en TODA pantalla pública y admin. | — |
| `BandaEstado` | `folio-certificado.tsx` + `estado-revocada.tsx` | Ya hay 5 estados pintados con hex en `public-validation-page.css`; un primitivo evita divergencia entre público y admin. | — |
| `CampoDato` | `components/validacion/campo.tsx` | El par etiqueta/valor se usa en validación pública, expediente, alumno, curso, etc. | — |
| `FolioShell` | composición de `folio-certificado.tsx` | Reutilizable en validación pública, expediente de certificación, vista previa PDF, listado de cursos. | — |
| `SelloOficial` | `components/validacion/sello-oficial.tsx` | — | Componente SVG específico con estado propio; mejor como sub-componente de `FolioShell` o de `ExpedienteCertificacion` (F4-01). No entra en F1-02. |
| `QrVerificacion` | `components/validacion/qr-verificacion.tsx` | — | Depende de librería de QR o SVG generado; fuera de scope sin spec. No entra. |
| `SidebarAdmin` | `components/admin/sidebar-admin.tsx` | — | Específico del admin shell (F1-05 / F2-03). No entra. |
| `BotonVolver`, `PieControl` | `components/validacion/acciones.tsx` | — | Específicos de flujo de validación; se pueden absorber en `FolioShell` o crear como primitivo en F2-01. No entran en F1-02. |
| `AccionesPrincipales` | `components/admin/acciones-principales.tsx` | — | Admin; F2-03+. No entra. |
| `BandejaPendientes` | `components/admin/bandeja-pendientes.tsx` | — | Admin; F2-03+. No entra. |
| `ActividadReciente` | `components/admin/actividad-reciente.tsx` | — | Admin; F6-03. No entra. |
| `LoginForm` | `components/admin/login-form.tsx` | — | Admin; F2-03 con X-Admin-Key real. No entra. |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Instalar Tailwind o `lucide-react` "porque v0 lo tiene" | Medium | `AGENTS.md:27` y `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:244-250` prohíben dependencias no aprobadas. F1-02 usa SVG inline (4-5 SVGs son aceptables; F1-04 decide librería de iconos). |
| Copiar `muestra_pagina/lib/utils.ts` (`cn`) | Low | F1-02 no usa utility classes Tailwind; `cn` no aplica. Si F1-04 instala Tailwind, copia o reescribe. |
| Exceder 1500 LOC en una sola PR | Low | Estimación actual ~670 líneas (código + docs + tests). Margen 800+ para imprevistos. Si pasa, `sdd-tasks` divide en PRs encadenados. |
| Regresión visual en `public-validation-page` (74/74 tests existentes) | Medium | Tests existentes usan selectores por clase (`.state-valid`, etc.). Al migrar a `BandaEstado`, los selectores deben migrar a `data-testid` o roles ARIA; cambios coordinados en `public-validation-page.spec.ts` para no perder cobertura. |
| Romper presupuesto `4 kB warn / 8 kB error` por `anyComponentStyle` | Low | `FolioShell` con `display: grid` y `gap` mínimos queda en 1-2 kB. `BandaEstado` con un SVG inline puede tocar 2-3 kB. Se valida con `npm run build` y se reduce si toca warn. |
| Conflicto con la rama activa de Marcos o con F0-03 | Low | Rama actual `frontend/v0-design-system-f1-02` creada desde `main` post-PR #32. F0-03 y otros PRs previos ya están mergeados. F1-02 no toca ramas no mergeadas. |
| Pérdida del patrón "folio / acta" si los primitivos se vuelven genéricos | Medium | `FolioShell` debe mantener slots semánticos (`membrete`, `bandaEstado`, `cuerpo`, `aside`, `pie`) que reflejan la composición del folio v0, no slots genéricos tipo `header`/`footer`. La decisión de slots se cierra en `sdd-design`. |
| Decisión de tipografía (Geist vs system stack) sin input de Matías | Medium | La exploración recomienda system stack (cero fuentes web). `sdd-propose` pregunta a Matías si quiere Geist (requiere auto-hospedaje o `@fontsource`) o system stack. Si Geist, F1-02 instala `@fontsource-variable/geist` o equivalente aprobado; si no, system stack. |
| Tokens de dark mode con `oklch()` no portables a Angular simple | Low | F1-02 propone solo light mode. Dark mode queda para un ciclo posterior si Marcos/Matías lo piden; `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` no lo menciona. |
| `muestra_pagina/app/globals.css` cambia mientras se porta | Low | Es un snapshot export; la rama actual no modifica v0. Si el snapshot cambia, F1-02 debe re-verificar (bajo probabilidad: el inventario está en `00-angular20-port-v0.md` y en este `explore.md`). |
| `sdd-propose` decide delta a spec base `frontend-angular-shell` o `guia-matias-angular-windows` | Low | Misma lógica que F1-01: las specs base ya cubren la regla "no inventar pantallas sin diseño aprobado". Delta solo si aparece un criterio nuevo realmente portable (por ejemplo, "toda pantalla pública DEBE usar `BandaEstado` para comunicar estado de verificación"). Decisión documentada en `proposal.md`. |
| Auto-commit / auto-push | Low (regla clara) | `AGENTS.md:25`, `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:90` y la sección de Git en la guía exigen aprobación explícita de Matías en el mismo turno + diff-confirmation gate + pre-push safety. OpenCode solo propone comandos. |
| Romper accesibilidad ya validada en M3-06 | Low | `public-validation-page` ya tiene `aria-live="polite"`, `aria-atomic`, `aria-labelledby`, `aria-busy`, roles. Los primitivos deben mantener o mejorar esos atributos. Foco visible global con `:focus-visible` y `var(--focus-ring)`. |

## Review Workload Forecast

| Campo | Valor |
|---|---|
| Líneas estimadas modificadas/agregadas | ~670 (código + docs + tests + estilos) |
| Riesgo de exceder el presupuesto de 1500 líneas | **Low** (margen 800+ líneas) |
| PRs encadenados recomendados | **No** (single-pr) |
| Estrategia de entrega | single-pr sobre `frontend/v0-design-system-f1-02` |
| Decisión antes de apply | **Sí** — `sdd-propose` debe confirmar: (a) Approach A vs B (Tailwind), (b) tipografía (system stack vs Geist), (c) si se incluye delta a spec base, (d) si se parchea `00-angular20-port-v0.md`. Estas 4 decisiones están abiertas; el resto es derivación directa de este explore. |
| Tiempo estimado de revisión | Medio: 1 PR con migración CSS + 4 nuevos primitivos + 1 doc nuevo + 1 patch; tests verde; sin deploy, sin build prod nuevo, sin backend. |

## Relevant files (read in this exploration)

- `AGENTS.md` (133 líneas) — reglas operativas del repo, rama sugerida, sección sobre `muestra_pagina/`, política Git.
- `docs/00-indice-general.md` (52 líneas) — ruta de lectura mínima vigente.
- `docs/opencode/optimizacion-tokens.md` (105 líneas) — uso de `RTK`, perfil eficiente,Graphify solo para Marcos.
- `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` (extracto: F1-01 líneas 513-555, F1-02 líneas 557-596) — definición exacta del ciclo y su rama.
- `docs/frontend/00-angular20-port-v0.md` (209 líneas) — fuente de verdad del port, inventario prompts 4-22, tokens visuales observados, componentes candidatos, riesgos, estado del scaffold M3-06.
- `docs/frontend/01-auditoria-muestra-pagina-f1-01.md` (71 líneas) — auditoría F1-01 con confirmación de inventario y derivación de prompts 11-22 a Fase 2.
- `apps/frontend-angular/AGENTS.md` (18 líneas) — reglas del frontend Angular.
- `apps/frontend-angular/package.json` (49 líneas) — confirmar ausencia de Tailwind/shadcn.
- `apps/frontend-angular/angular.json` (133 líneas) — presupuestos y base href.
- `apps/frontend-angular/src/styles.css` (1 línea) — confirmar estado vacío.
- `apps/frontend-angular/src/app/app.css` (27 líneas) — layout actual.
- `apps/frontend-angular/src/app/app.ts` (11 líneas) — shell actual.
- `apps/frontend-angular/src/app/app.html`, `app.routes.ts` — verificar.
- `apps/frontend-angular/src/app/features/public-validation/public-validation-page.html` (51 líneas) — render actual.
- `apps/frontend-angular/src/app/features/public-validation/public-validation-page.css` (50 líneas) — hex inline a migrar.
- `muestra_pagina/app/globals.css` (192 líneas) — fuente principal de tokens (lectura segura).
- `muestra_pagina/app/layout.tsx` (57 líneas) — fuente tipográfica (Geist), intención portable.
- `muestra_pagina/components/validacion/folio-certificado.tsx` (224 líneas) — patrón compositivo del folio.
- `muestra_pagina/components/validacion/header-institucional.tsx` (40 líneas) — patrón del membrete.
- `muestra_pagina/components/validacion/footer-institucional.tsx` (53 líneas) — patrón del pie.
- `muestra_pagina/components/validacion/campo.tsx` (54 líneas) — patrón del par etiqueta/valor y `TituloSeccion`.
- `muestra_pagina/components/validacion/estado-revocada.tsx` (213 líneas) — variantes de banda de estado.
- `muestra_pagina/components/admin/admin-shell.tsx` (103 líneas) — patrón del shell admin (solo lectura de patrones, no portar).
- `muestra_pagina/components/admin/login-form.tsx` (230 líneas) — patrón de formulario (no portar credenciales demo).
- `muestra_pagina/lib/utils.ts` (6 líneas) — `cn()`; no aplicable sin Tailwind.
- `muestra_pagina/components.json` (21 líneas) — config de shadcn; referencia, no portar.
- `muestra_pagina/package.json` (38 líneas) — confirmar dependencias que NO se instalan.
- `openspec/AGENTS.md` (17 líneas) — reglas de OpenSpec en este repo.
- `openspec/config.yaml` (77 líneas) — schema, contexto, testing, rules.
- `openspec/specs/frontend-angular-shell/spec.md` (49 líneas, parcial) — spec base Angular shell; relevante para confirmar que "no fijar diseño visual final" sigue vigente.
- `openspec/changes/archive/2026-06-30-f1-01-auditar-muestra-pagina/explore.md` (131 líneas) — precedente estructural de exploración en este mismo proyecto.
- `openspec/changes/archive/2026-06-30-f1-01-auditar-muestra-pagina/proposal.md` (106 líneas, parcial) — precedente de `proposal.md` con secciones in/out/affected/risks.
- Engram observación #4235 (Explore `frontend-angular-shell-public-validation-api-readiness`) — precedente del ciclo base Angular de Marcos.
- Engram observación #4592 (Explore `staging-cpanel-certificados`) — menciona F1-01 de Matías y el estado de la rama `frontend/v0-design-system` al 2026-06-30.

## Do not touch (read-only this cycle)

- `apps/frontend-angular/src/app/shared/certificates/*` (74/74 tests verdes en M3-06 final; intactos).
- `apps/frontend-angular/src/app/features/landing/*`, `features/not-found/*` (placeholders; toman tokens por cascada sin tocarse).
- `apps/frontend-angular/src/environments/*` (intactos, alineados D0).
- `apps/frontend-angular/angular.json` (presupuestos, base href, proxy, file replacements correctos; no modificar).
- `apps/frontend-angular/package.json` salvo justificación aprobada en `sdd-propose` y aprobación explícita de Matías.
- `apps/frontend-angular/src/index.html` (title y base href correctos).
- `apps/frontend-angular/proxy.conf.json` (intacto).
- `muestra_pagina/` salvo lectura segura de `app/globals.css`, `app/layout.tsx`, `components/validacion/header-institucional.tsx`, `components/validacion/footer-institucional.tsx`, `components/validacion/campo.tsx`, `components/validacion/folio-certificado.tsx`, `components/validacion/estado-revocada.tsx`, `components/admin/admin-shell.tsx`, `components/admin/login-form.tsx`, `lib/utils.ts`, `components.json`, `package.json`. **No abrir** `app/admin/*/page.tsx`, `app/estados/page.tsx`, `prompts_stitch_v0_ifts14.md`, `pnpm-lock.yaml`, ni las 59 capturas (`capturas/*.png`).
- `apps/backend-php/`, `database/`, `deploy/`, `docker/`, `.htaccess`, `material_privado_no_versionar/`, `.env*`, dumps, logs, secretos.
- Cualquier archivo bajo `openspec/changes/` (la carpeta activa está vacía al iniciar F1-02; no se solapa con cambios de Marcos).
- Ramas no mergeadas: PR #32 (`integration/m3-06-angular-api-smoke`) ya mergeado; el resto de PRs recientes también. F1-02 no reabre ni modifica ramas previas.

## Ready for Proposal

**Yes**, con 4 decisiones a resolver en `sdd-propose`:

1. **Tipografía**: system stack (cero dependencias) vs Geist vía `@fontsource-variable/geist` o auto-hospedaje. Recomendación inicial: **system stack** (cumple "no instalar dependencias no aprobadas" y la regla `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:244-250`).
2. **Tailwind**: confirmar Approach A (CSS custom properties, sin Tailwind) y dejar Tailwind para F1-04 (ciclo reservado). Si Matías quiere Tailwind ya, se reorienta el ciclo.
3. **Delta a spec base**: recomendación inicial **NO** (las specs `frontend-angular-shell` y `guia-matias-angular-windows` ya cubren la regla de no inventar pantallas). Delta solo si aparece un criterio nuevo realmente portable (por ejemplo, "toda pantalla pública DEBE usar `BandaEstado`").
4. **Patch a `00-angular20-port-v0.md`**: sí, mínimo, en la sección "Tokens visuales observados" para confirmar que los tokens ahora están aplicados. Decisión final en `sdd-archive` para no anticipar.

**Próxima fase recomendada**: `sdd-propose`. Tamaño estimado: 80-120 líneas de `proposal.md`, 4-6 decisiones explícitas con respuesta de Matías, y forecast de revisión.

**Estructura esperada del change folder**:
```
openspec/changes/f1-02-v0-design-system/
├── exploration.md         (este archivo)
├── proposal.md            (sdd-propose)
├── design.md              (sdd-design)
├── tasks.md               (sdd-tasks)
├── specs/                 (sdd-spec, solo si se aprueba delta)
├── apply-progress.md      (sdd-apply)
├── verify-report.md       (sdd-verify)
└── archive-report.md      (sdd-archive)
```

**Mensaje de commit sugerido** (a proponer en `sdd-archive`, no a ejecutar en este turno):
`feat(frontend): extraer sistema visual v0 a tokens y primitivos (F1-02)`.
