# Flujo Git recomendado

Recomendaciones de trabajo en equipo. No son gates duros salvo las reglas de seguridad (no secretos, no push directo a `main` con cambios no revisados).

## Ramas

```txt
main                    PRODUCCIÓN (estable). Solo merge desde staging1.0 cuando esté validado.
staging1.0              Integración pre-producción. Acumula PRs de audit/*, fix/*, feat/*, etc.
audit/<fase>-…          Fases del plan de auditoría. Merge → staging1.0 (no a main).
docs/<tema>             solo documentación
frontend/<tema>         UI Angular
backend/<tema>          API PHP
database/<tema>         migraciones
fix/<bug>              correcciones
deploy/<tema>           artefactos/docs de deploy
feat/<tema>             features
```

### Modelo actual (auditoría / pre-prod)

1. Crear ramas de trabajo desde **`staging1.0` actualizado** (no desde `main`, salvo hotfix de producción acordado).
2. Abrir PR hacia **`staging1.0`**.
3. Deploy de hosting staging (`/certificados_staging/`) desde artefactos preparados a partir de `staging1.0`.
4. Cuando el conjunto esté estable en staging real → PR **`staging1.0` → `main`** (producción), con checklist QA completo y aprobación explícita.

Plan de fases: `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md`.

Crear rama desde la base acordada (`staging1.0` o `main` según el caso). Evitar commits enormes mezclando áreas sin necesidad.

## Pull requests

1. Diff revisable (preferir PRs chicos).
2. Descripción: qué / por qué / cómo probar.
3. Tests o checklist QA del área tocada.
4. Merge a **`staging1.0`** tras revisión; a **`main`** solo en el land de release.

## Buenas prácticas

- No commitear: `.env`, configs reales, `vendor/`, `dist/`, dumps, ZIPs de servidor, `.codegraph/`.
- Mensajes de commit en imperativo breve, enfocados al *por qué*.
- Antes de push: `git status`, revisar que no haya secretos ni artefactos.
- Staging se despliega desde artefactos preparados (ZIP + SQL), no desde `git pull` en cPanel (hoy no hay flujo Git en hosting).

## Agentes IA y Git

OpenCode/Cursor pueden preparar comandos, pero **commit/push/switch/merge** solo con aprobación explícita humana cuando las reglas del repo lo exijan. Nunca `git push` directo a `main` como atajo.

## Specs (recomendado)

Cambios de comportamiento → actualizar o crear spec en `openspec/specs/` y reflejar docs del área al cerrar. Ver `docs/07-sdd-archive-y-mantenimiento-documentacion.md`.
