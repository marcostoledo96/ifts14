# Apply Progress: permitir-git-switch-checkout-con-aprobacion-explicita

## Encabezado

| Campo | Valor |
|---|---|
| Cambio | `permitir-git-switch-checkout-con-aprobacion-explicita` |
| Modo | Standard (`strict_tdd: false`, sin runner formal) |
| Rama | `docs/policy-git-switch-checkout` |
| Inicio apply | 2026-06-29 |
| Fin apply | 2026-06-29 |
| HEAD al inicio | `9c631d0` |
| HEAD al cierre | `9c631d0` (sin commits del agente) |
| Estrategia de entrega | `single-pr` (dentro del presupuesto de 400 líneas) |

## Baseline capturado

| Patrón | Count inicial | Count final |
|---|---|---|
| `MATIAS_PROMPTS`: "Prompt exacto para OpenCode" | 20 | 20 |
| `AGENTS.md`: "branch-confirmation gate" | 0 | 1 |
| `GUIA.md`: "branch-confirmation gate" | 0 | 1 |
| `MATIAS_PROMPTS`: "confirmación explícita de Marcos" | 0 (frase vive en `MARCOS_PROMPTS`) | 0 |
| `MARCOS_PROMPTS`: "confirmación explícita de Marcos" | 1 | 1 |
| `MATIAS_PROMPTS` fila 39 (tabla sobre flujo de Marcos) | intacta | intacta |

## Tareas completadas

### Phase 1 — Preparación
- [x] 1.1 `git rev-parse --abbrev-ref HEAD` devuelve `docs/policy-git-switch-checkout`.
- [x] 1.2 `git status --short` limpio salvo por el change directory sin trackear.
- [x] 1.3 `git rev-parse HEAD` es `9c631d0`; sin commits del agente.
- [x] 1.4 Conteo pre-apply de "Prompt exacto para OpenCode" = 20; guardado para comparación.

### Phase 2 — Modificación de 4 archivos
- [x] 2.1 `AGENTS.md:21` — reemplazada la prohibición absoluta de `git switch`/`git checkout` por regla con alcance + branch-confirmation gate.
- [x] 2.2 `GUIA.md:153` — mirror de 2.1 aplicado en §9 Git.
- [x] 2.3 `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:35-36` — agregada fila `Git — nota 2` sin tocar la fila `Git` ni la `Git — nota` originales.
- [x] 2.4 `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:27` — actualizado punto 8 de la Ruta rápida con la nueva capacidad.
- [x] 2.5 `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` — 20 bloques "Prompt exacto para OpenCode" actualizados con branch-confirmation gate y coordinación para ramas sensibles. La fila 39 (tabla sobre flujo de Marcos) no fue modificada.
- [x] 2.6 `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:1352` — actualizado el bullet del Checklist final con la nueva capacidad y las prohibiciones restantes.

### Phase 3 — Validación previa al verify
- [x] 3.1 `git status --short` muestra únicamente los 4 archivos modificados + el change directory sin trackear.
- [x] 3.2 `git diff --name-only` devuelve solo `AGENTS.md`, `GUIA.md`, `MARCOS_PROMPTS...` y `MATIAS_PROMPTS...`.
- [x] 3.3 `git grep -c "branch-confirmation gate" AGENTS.md GUIA.md` retorna ≥ 1 match en cada archivo.
- [x] 3.4 Conteo post-apply de "Prompt exacto para OpenCode" sigue siendo 20.
- [x] 3.5 La frase "confirmación explícita de Marcos" permanece en `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:35`; la fila 39 de `MATIAS_PROMPTS...` (referencia al flujo de Marcos) permanece intacta.

### Phase 4 — Cierre
- [x] 4.1 No se invocó `sdd-verify`; se deja pendiente para el orchestrator.
- [x] 4.2 No se aplicaron parches fuera de los 4 archivos operativos.
- [x] 4.3 Comandos Git exactos propuestos a Matías documentados en este archivo (no ejecutados).
- [x] 4.4 Documentado en este archivo que no se ejecutó `git add`/`git commit`/`git push` por cuenta propia.

### Phase 5 — Sanity final
- [x] 5.1 Working tree final limpio salvo por los paths esperados.
- [x] 5.2 Confirmado que no se ejecutó `git add`/`git commit`/`git push` por cuenta propia.

## Decisiones clave aplicadas

| Pregunta abierta | Resolución |
|---|---|
| Nombre de rama | `docs/policy-git-switch-checkout` (ya creada por Mati). |
| Branch-confirmation gate | 3 checks: `git rev-parse --abbrev-ref HEAD`, `git status --short`, `git log <destino> -1 --oneline` (switch) o `git show <base> --stat \| head -5` (creación). Sin verificación de divergencia con `main` en este ciclo. |
| Ubicación del Requirement | Extensión de `guia-matias-angular-windows` (delta a sincronizar en `sdd-archive`). |

## Archivos creados/modificados

| Archivo | Acción | Inserciones | Eliminaciones | Qué se hizo |
|---|---|---|---|---|
| `AGENTS.md` | Modificar | 1 | 1 | Reemplazada la prohibición absoluta de switch/checkout por regla con branch-confirmation gate y alcance limitado. |
| `GUIA.md` | Modificar | 1 | 1 | Mirror de la nueva regla en §9 Git. |
| `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | Modificar | 1 | 0 | Agregada fila `Git — nota 2` confirmando que el workflow de Marcos permanece intacto. |
| `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | Modificar | 23 | 23 | Actualizados 20 bloques "Prompt exacto", la Ruta rápida (línea 27) y el Checklist final (línea 1352). |
| `openspec/changes/permitir-git-switch-checkout-con-aprobacion-explicita/apply-progress.md` | Crear | — | — | Bitácora de aplicación (este archivo). |
| **Total** | — | **26** | **25** | — |

## Resultados de validación

| Scenario de la spec delta | Evidencia | Estado |
|---|---|---|
| Scenario 1: `git switch` a rama existente con branch-confirmation gate | `AGENTS.md`, `GUIA.md` y los 20 bloques de `MATIAS_PROMPTS` incluyen el gate y la aprobación explícita por turno. | PASS |
| Scenario 2: `git switch -c` / `git checkout -b` con gate | Mismos archivos reflejan la creación de rama bajo gate y declaración de nombre/base. | PASS |
| Scenario 3: Prohibición de switch a `main` o a ramas de otros flujos | Regla explícita en `AGENTS.md`, `GUIA.md` y `MATIAS_PROMPTS` (incluyendo ejemplos de Marcos y F0-02 no mergeada). | PASS |
| Scenario 4: PR, `git merge` y `git rebase` requieren aprobación explícita y evidencia | Sin prohibición amplia: quedan bajo aprobación explícita, comando exacto y evidencia previa. | PASS |
| Scenario 5: Formalización de `git show <commit>:<archivo>` para lectura histórica | Mencionado en `AGENTS.md`, `GUIA.md`, `MATIAS_PROMPTS:27` y `:1352`. | PASS |

## Comandos Git propuestos a Matías (NO ejecutados por el agente)

Previo al `git add`, el operador debe correr el diff-confirmation gate:

```powershell
git status --short
git diff --name-only
```

Si Matías confirma que el diff es correcto, los comandos propuestos son:

```powershell
git add openspec/changes/permitir-git-switch-checkout-con-aprobacion-explicita/ AGENTS.md GUIA.md MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md
git commit -m "docs(governance): permitir git switch y checkout -b con aprobacion explicita (tercera relajacion operativa)"
```

Previo al `git push`, el operador debe correr el pre-push safety:

```powershell
git log origin/docs/policy-git-switch-checkout..docs/policy-git-switch-checkout --oneline
git diff origin/docs/policy-git-switch-checkout..docs/policy-git-switch-checkout --stat
```

Si Matías confirma, el push propuesto es:

```powershell
git push origin docs/policy-git-switch-checkout
```

## Notas y riesgos

- **Riesgos**: Ninguno identificado durante el apply.
- **Regresiones evitadas**: la fila 39 de `MATIAS_PROMPTS...` y la fila `Git` de `MARCOS_PROMPTS...` quedaron intactas.
- **Scope protegido**: no se tocó `openspec/changes/backend-public-endpoint-hardening/`, la rama `docs/matias-onboarding-f0-02-f0-03`, `material_privado_no_versionar/`, código de producto ni tests.
- **Nota sobre 3.5**: la frase exacta "confirmación explícita de Marcos" vive en `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:35`, no en `MATIAS_PROMPTS...`; la fila 39 de `MATIAS_PROMPTS...` que referencia el flujo de Marcos permanece intacta.

## Siguiente paso

`sdd-verify` será invocado por el orchestrator. El agente `sdd-apply` no ejecuta verify.
