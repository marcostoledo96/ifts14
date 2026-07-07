# Proposal: F1-02 — Sistema visual v0 para Angular

## Intent

Convertir la referencia v0 en una base visual portable para Angular 20: tokens concretos, primitivos mínimos y documentación. El objetivo es que los ciclos F2-F6 construyan UI con criterio compartido, sin copiar React/Next ni sumar dependencias no aprobadas.

## Scope

### In Scope
- Tokens visuales en `apps/frontend-angular/src/styles.css`: colores, tipografía, radios, espaciado, foco y motion mínimo.
- 3-4 primitivos standalone en `apps/frontend-angular/src/app/shared/ui/`: `HeaderInstitucional`, `BandaEstado`, `CampoDato`, `FolioShell`.
- Migración segura de estilos de `public-validation-page` y `app.css` para consumir tokens sin cambiar reglas D0.
- Tests unitarios de primitivos, `npm test --watch=false`, `npm run build`.
- Documentación: `docs/frontend/02-sistema-visual-v0-f1-02.md` y patch mínimo en `docs/frontend/00-angular20-port-v0.md`.

### Out of Scope
- Pantallas admin, login, dashboard, listados, cursos, PDF, QR y revocación.
- Backend, deploy, base de datos, material privado, `.env*`, dumps o logs.
- Tailwind, shadcn, CVA, lucide, nuevas fuentes o dependencias.
- Copiar JSX, hooks, App Router, `cn()` o configuración de `muestra_pagina/`.

## Capabilities

### New Capabilities
- `frontend-design-system-readiness`: tokens CSS, primitivos Angular mínimos, reglas de accesibilidad visual y documentación del sistema visual v0.

### Modified Capabilities
- None. `frontend-public-validation` consume los nuevos tokens, pero mantiene contrato funcional, DNI completo público, estados y seguridad existentes.

## Approach

Aplicar Approach A: CSS custom properties en `styles.css`, stacks tipográficos del sistema (`system-ui` y `ui-monospace`), componentes standalone con CSS propio y SVG inline cuando haga falta. Tailwind queda diferido a F1-04.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/frontend-angular/src/styles.css` | Modified | Tokens globales y foco visible. |
| `apps/frontend-angular/src/app/shared/ui/` | New | Primitivos visuales reutilizables. |
| `apps/frontend-angular/src/app/features/public-validation/` | Modified | Estilos migrados a tokens sin cambiar lógica. |
| `apps/frontend-angular/src/app/app.css` | Modified | Shell alineado a identidad visual. |
| `docs/frontend/` | Modified | Sistema visual y actualización del port v0. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Sobre-portar v0 o copiar React | Medium | Solo patrones visuales y SVG inline mínimo. |
| Exceder presupuesto CSS por componente | Low | CSS acotado y build obligatorio. |
| Regresión visual/accesible en validación pública | Medium | Tests de primitivos y estados; conservar atributos ARIA. |

## Rollback Plan

Revertir los cambios del ciclo en `styles.css`, `shared/ui/`, `public-validation-page.*`, `app.css` y docs. No hay migraciones, dependencias ni cambios backend.

## Dependencies

- Angular/Karma ya disponibles en `apps/frontend-angular/`.
- Referencia v0 solo como lectura segura.

## Success Criteria

- [ ] Tokens y primitivos existen y no agregan dependencias.
- [ ] Validación pública mantiene estados y reglas D0.
- [ ] `npm test --watch=false` y `npm run build` pasan.
- [ ] Documentación frontend queda actualizada.
