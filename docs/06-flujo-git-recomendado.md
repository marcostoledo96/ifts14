# Flujo Git recomendado

Recomendaciones de trabajo en equipo. No son gates duros salvo las reglas de seguridad (no secretos, no push directo a `main` con cambios no revisados).

## Ramas

```txt
main                    estable / integración
docs/<tema>             solo documentación
frontend/<tema>         UI Angular
backend/<tema>          API PHP
database/<tema>         migraciones
fix/<bug>              correcciones
deploy/<tema>           artefactos/docs de deploy
```

Crear rama desde `main` actualizado. Evitar commits enormes mezclando áreas sin necesidad.

## Pull requests

1. Diff revisable (preferir PRs chicos).
2. Descripción: qué / por qué / cómo probar.
3. Tests o checklist QA del área tocada.
4. Merge a `main` tras revisión.

## Buenas prácticas

- No commitear: `.env`, configs reales, `vendor/`, `dist/`, dumps, ZIPs de servidor, `.codegraph/`.
- Mensajes de commit en imperativo breve, enfocados al *por qué*.
- Antes de push: `git status`, revisar que no haya secretos ni artefactos.
- Staging se despliega desde artefactos preparados (ZIP + SQL), no desde `git pull` en cPanel (hoy no hay flujo Git en hosting).

## Agentes IA y Git

OpenCode/Cursor pueden preparar comandos, pero **commit/push/switch/merge** solo con aprobación explícita humana cuando las reglas del repo lo exijan. Nunca `git push` directo a `main` como atajo.

## Specs (recomendado)

Cambios de comportamiento → actualizar o crear spec en `openspec/specs/` y reflejar docs del área al cerrar. Ver `docs/07-sdd-archive-y-mantenimiento-documentacion.md`.
