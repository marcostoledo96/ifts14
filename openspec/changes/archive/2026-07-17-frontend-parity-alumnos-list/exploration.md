# Exploration: frontend-parity-alumnos-list (P-07)

## Current State

Post `frontend-alumnos-list-polish`: CTA Nuevo alumno, badges, SVG estados, sin legajo.

Gaps vs v0 `lista-alumnos.tsx`:

| # | Elemento v0 | Angular | Decisión P-07 |
|---|-------------|---------|---------------|
| A1 | Subtitle “Legajos…” | Intro demo genérica | Copy **sin** palabra legajo: trayectoria/credenciales |
| A2 | Search icon + hint | Input plano | **Calcar** icon; hint honesto |
| A3 | Chips con dots + MailWarning | Chips texto | **Calcar** |
| A4 | Resumen in-card filtros | output suelto | **Mover** layout; conservar 1 live region |
| A5 | Columna Legajo / email literal | Omitidos | **Mantener omitidos** (honest) |
| A6 | Thead mono + hover + cert badge soft | Básico | **Densificar** |
| A7 | Eye en Ver detalle | Link texto | **Icon+texto** |
| A8 | Cards densas sin inventar email | Cards OK, menos densas | **Polish**; documento solo `dniMostrar` |
| A9 | UserPlus CTA | Solo texto | **Calcar** |
| A10 | Paginación footer tabla | Nav suelta | **Alinear** footer |

## Recommendation

UI polish only. NO legajo. NO email literal. Métricas null → —.

## Ready for Proposal

Yes.
