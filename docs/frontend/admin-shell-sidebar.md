# Admin shell + sidebar — paridad v0 (P-01)

## Estado

Cerrado y archivado en `openspec/changes/archive/2026-07-17-frontend-parity-shell-topbar-sidebar/`.  
Verify: PASS WITH WARNINGS — `test:ci` 749/749, `tsc` exit 0, `build` exit 0 (2026-07-17).

## Alcance implementado (P-01)

- Topbar: placeholder `Buscar curso, alumno o certificado…`; sync `Sincronizado 10:42` (mock estático); botones Ayuda + Notificaciones (Bell + dot) presentacionales; avatar monograma `AD`.
- Sidebar: iconos Lucide-like SVG inline (LayoutGrid, BookOpen, Users, CalendarCheck, QrCode, Settings, LogOut) a 16×16; sin dependencia lucide npm.
- Spec canónica: `openspec/specs/admin-shell-chrome/spec.md` (REQ-SHELL-01…10).

## Divergence intencional

- Avatar `AD` (no `MP`): auth no expone identidad.
- Footer institucional bajo `main`: fuera de P-01.

## Historial

- 2026-07-16: chrome inicial (sin Help/Bell; sync sin hora) — archive `2026-07-16-frontend-admin-shell-sidebar`.
- 2026-07-17: P-01 paridad topbar + iconos.

## Referencias

- Prompt: `docs/frontend/PROMPT-PARIDAD-MUESTRA-PAGINA.md`
- Archivos: `admin-shell.*`, `sidebar-admin.*`
- v0: `muestra_pagina/components/admin/admin-shell.tsx`, `sidebar-admin.tsx`
