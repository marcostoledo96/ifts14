# Apply Progress: permitir-commit-con-aprobacion-explicita

## Estado

- **Cambio**: permitir-commit-con-aprobacion-explicita
- **Modo**: Standard (strict_tdd: false)
- **Rama**: docs/matias-onboarding-windows
- **Fecha apply**: 2026-06-28
- **Batch**: Primero y único (single-pr)

## Baseline capturado

| Archivo / Patrón | Count inicial | Count final |
|---|---|---|
| `AGENTS.md`: "No commitear, pushear ni mergear" | 1 | 0 |
| `GUIA.md`: "ejecutan commit, push y merge manualmente" | 1 | 0 |
| `MATIAS_PROMPTS`: "commit, push, merge ni rebase" en bloques Prompt exacto | 19 | 0 (reemplazados) |
| `MATIAS_PROMPTS` línea 39 (tabla Marcos) | intacta | intacta |

## Tareas completadas

### Phase 1 — Preparación
- [x] 1.1 Confirmar rama activa `docs/matias-onboarding-windows`.
- [x] 1.2 Confirmar baseline working tree aceptado.
- [x] 1.3 Capturar baseline numérico (19 instancias en prompt-exacto + 1 en Ruta rápida line 27).
- [x] 1.4 Confirmar artefactos del change presentes.

### Phase 2 — AGENTS.md
- [x] 2.1 Reemplazar línea 21 por regla con alcance (post `sdd-verify` PASS, aprobación explícita por turno).

### Phase 3 — GUIA.md §9
- [x] 3.1 Reemplazar línea 153 por redacción con aprobación explícita de Matías.

### Phase 4 — MATIAS_PROMPTS
- [x] 4.1 Identificar 19 instancias en bloques "Prompt exacto para OpenCode" F0-01..F3-06.
- [x] 4.2 Reemplazar las 19 instancias (variantes: `No ejecutes`, `no ejecutes`, `No hagas`) por la regla con excepción.
- [x] 4.3 Línea 39 (tabla sobre flujo de Marcos) NO modificada.
- [x] 4.4 Grep confirma 0 instancias de prohibición absoluta en prompt-exacto blocks.

### Phase 5 — MARCOS_PROMPTS
- [x] 5.1 Agregar fila aditiva debajo de fila `Git` con nota aclaratoria.
- [x] 5.2 Fila Git original intacta.

### Phase 6 — Validación automática
- [x] 6.1 `git status --short` muestra 4 archivos modificados + baseline F0-01 + sdd-init.
- [x] 6.2 `git diff --numstat` para los 4 archivos: 22 insertions(+), 21 deletions(-) (~24 líneas, dentro del presupuesto).
- [x] 6.3 Grep en AGENTS.md retorna 0 instancias de prohibición absoluta.
- [x] 6.4 Grep en GUIA.md retorna 0 instancias de prohibición absoluta.
- [x] 6.5 `apps/`, `database/`, `public_html/`, `material_privado_no_versionar/` no aparecen en diff.
- [x] 6.6 Ninguna spec base en `openspec/specs/` fue modificada.

### Phase 7 — Cierre
- [x] 7.1 Archivos tocados y delta final listados.
- [x] 7.2 Commits atómicos propuestos (NO ejecutados).
- [x] 7.3 Reporte final con validaciones, bloqueos y nota para Marcos.
- [x] 7.4 Recordatorio: el cambio NO debe commitearse automáticamente.

## Archivos modificados y delta

| Archivo | Inserciones | Eliminaciones | Qué se hizo |
|---|---|---|---|
| `AGENTS.md` | 1 | 1 | Reemplazada prohibición absoluta por regla con alcance para Matías. |
| `GUIA.md` | 1 | 1 | Actualizada §9 Git con aprobación explícita por turno. |
| `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | 19 | 19 | Reemplazadas 19 instancias en prompts exactos F0-F3 por regla con excepción de aprobación. |
| `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | 1 | 0 | Agregada fila aclaratoria en tabla "Rol y límites" debajo de fila Git. |
| **Total** | **22** | **21** | — |

## Commits propuestos (NO ejecutar)

Atómicos, uno por archivo:

```bash
git add AGENTS.md && git commit -m "docs(governance): permitir commit con aprobacion explicita en AGENTS"
git add GUIA.md && git commit -m "docs(governance): permitir commit con aprobacion explicita en GUIA"
git add MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md && git commit -m "docs(governance): permitir commit con aprobacion explicita en prompts de matias"
git add MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md && git commit -m "docs(governance): nota para marcos sobre regla de commits"
```

Alternativa: un solo commit combinado si Matías prefiere.

## Nota para Marcos

La tabla "Rol y límites" de `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` ahora incluye una fila `Git — nota` visible inmediatamente debajo de la fila `Git`, aclarando que la relajación de commits aprobados aplica **solo** al flujo de Matías. Tu workflow, prompts y prohibiciones permanecen intactos.

## Regla de oro post-apply

Este cambio es **implementación de la regla**, no un trigger para ejecutarla. OpenCode NO debe ejecutar `git add` + `git commit` de este cambio automáticamente. Queda esperando aprobación explícita de Matías en un turno posterior, con mensaje exacto indicado, después de que pase `sdd-verify`.

## Riesgos y mitigaciones aplicadas

| Riesgo | Mitigación aplicada |
|---|---|
| Olvidar alguna instancia en MATIAS_PROMPTS | Validación con grep antes y después; 19/19 reemplazadas. |
| Deriva de redacción entre AGENTS.md y GUIA.md | Ambos archivos editados en la misma sesión, wording cruzado verificado. |
| Marcos no nota la nota aclaratoria | Colocada en fila propia debajo de fila Git en tabla "Rol y límites", visible al primer vistazo. |
| Romper línea 39 (tabla de Marcos) | Verificación explícita post-reemplazo; línea 39 intacta. |

## Deviaciones del design.md

Ninguna. La implementación sigue el design.md y las instrucciones del orchestrador. El texto de reemplazo en MATIAS_PROMPTS usa la redacción sugerida por el orchestrador (menciona `sdd-verify` PASS y "por tu cuenta"), la cual es más explícita que la versión abreviada del design.md §3, pero ambas satisfacen el spec.

## Bloqueos

Ninguno.

## Apply — segunda pasada (fix de warnings)

- 2 inconsistencias detectadas por `sdd-verify` corregidas en `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` (líneas 27 y 1352).
- Línea 27 ahora refleja la regla con alcance: `git add` + `git commit` permitidos solo bajo aprobación explícita de Matías en el mismo turno, tras `sdd-verify` PASS; `git push`, `git merge`, `git rebase`, `git switch` y `git checkout` (salvo lectura) siguen prohibidos.
- Línea 1352 (checklist de handoff QA) ahora refleja el alcance: `git push`, `git merge`, `git rebase`, `git switch`, `git checkout` y deploy permanecen prohibidos; `git add` + `git commit` solo tras aprobación explícita.
- Validaciones: `grep` residual de prohibición absoluta retorna 0; línea 39 (tabla de flujo de Marcos) intacta; ningún otro archivo modificado en esta pasada.

## Estado final

17/17 tareas completas + 2 fixes post-verify. Listo para re-run de `sdd-verify`.
