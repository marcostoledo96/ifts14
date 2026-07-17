# Exploration: frontend-parity-cursos-list (P-04)

## Current State

Post `frontend-cursos-list-polish` (2026-07-16): chips 4 estados + fechas, badges/acento, SVG empty/error, métricas `—`.

Gaps vs v0 `lista-cursos.tsx` (capa paridad):

| # | Elemento v0 | Angular | Decisión P-04 |
|---|-------------|---------|---------------|
| C1 | Search icon + pl-9 | Input plano | **Calcar** SVG Search |
| C2 | Plus en CTA Nuevo curso | Solo texto | **Calcar** |
| C3 | Resumen dentro card filtros + border-t | Resumen afuera | **Mover** |
| C4 | Limpiar con X + tono tech-blue | Botón borde genérico | **Calcar** estilo |
| C5 | Thead mono + bg secondary + hover fila | Thead básico | **Densificar** |
| C6 | Métrica `N fechas` + unidades | Número crudo / `—` | Fechas con unidad; Presentes/Certif **`—`** (sin API) |
| C7 | Acciones icon Eye/Pencil desktop | Links texto | **Icon+texto** mobile; **icon** desktop con aria |
| C8 | Icons métricas mobile | Solo números | **Agregar** SVG Lucide-like |
| C9 | Chips Activos/Inactivos binario | 4 estados API | **Mantener** 4 (honestidad) |
| C10 | Vista QA | Ausente | **OUT** (no bloqueante) |

## Recommendation

UI polish only. Sin inventar conteos. Sin tocar detalle/editor/login.

## Ready for Proposal

Yes.
