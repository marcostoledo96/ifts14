# Proposal: Paridad lista cursos (P-04)

## Intent

Calcar densidad visual de `lista-cursos.tsx` en `/admin/cursos` sin inventar métricas ni portar React.

## Scope

### In Scope
- Search icon, Plus en CTA, resumen in-card, clear con X
- Thead/hover/shadow; unidades en fechas; `—` en Presentes/Certificaciones
- Iconos métricas mobile; acciones icon (desktop) con aria
- Tests + doc corta

### Out of Scope
- Course detail/editor, backend agregados, vista QA, login/shell/dashboard

## Approach

Polish HTML/CSS + asserts mínimos. `formatoMetrica` sigue `null → —`.

## Ready for Spec

Yes.
