# Apply progress: optimización de costo de tokens en OpenCode/Gentle-AI

## Estado

Completado en modo estándar. Cambio limitado a documentación, configuración segura y artefactos OpenSpec del ciclo.

Corrección posterior a verify: se agregó mención explícita a OpenCode Go en `docs/opencode/optimizacion-tokens.md`, con límite de uso para modelos chicos o baratos en decisiones críticas.

## Tareas completadas

- [x] 1.1 `.graphifyignore` seguro y estricto creado.
- [x] 1.2 `.gitignore` actualizado con `graphify-out/`.
- [x] 1.3 Guía documenta bloqueo de Graphify sin ignore válido.
- [x] 2.1 Creada `docs/opencode/optimizacion-tokens.md`.
- [x] 2.2 Creado `docs/arquitectura/graphify/README.md`.
- [x] 2.3 Guía incluye `rtk gain` y resumen Engram de cierre.
- [x] 3.1 `AGENTS.md` actualizado.
- [x] 3.2 `docs/00-indice-general.md` enlaza las nuevas guías.
- [x] 3.3 Prompt de Marcos actualizado.
- [x] 3.4 Prompt de Matías F0-F3 actualizado con F0 checks y prohibición de Graphify.
- [x] 3.5 Prompt de Matías Fase 2 actualizado con las mismas reglas.
- [x] 4.1 Matriz de archive actualizada para OpenCode/Graphify.
- [x] 4.2 Rutas nuevas verificadas.
- [x] 5.1–5.6 Verificaciones finales ejecutadas.

## Evidencia de verificación

| Check | Resultado |
|---|---|
| Alcance | `git diff --name-only` solo lista docs/config/OpenSpec del ciclo. |
| Privado/producto | Sin cambios en `apps/`, `database/`, `deploy/`, `material_privado_no_versionar/` ni `muestra_pagina/`. |
| Graphify | `.graphifyignore` contiene privados, `.env`, dumps SQL, backups, logs, uploads y `graphify-out/`. |
| Índice | `docs/00-indice-general.md` enlaza `docs/opencode/optimizacion-tokens.md` y `docs/arquitectura/graphify/README.md`. |
| Matías | Ambos prompts prohíben ejecutar Graphify y agregan checks F0. |
| Corrección OpenCode Go | `docs/opencode/optimizacion-tokens.md` menciona OpenCode Go y limita modelos chicos/baratos para seguridad, contratos, deploy y base de datos sin revisión humana. |

## Comandos ejecutados en corrección

- Búsqueda focal `OpenCode Go` en `docs/opencode/optimizacion-tokens.md` → frase encontrada.
- `python3` con `git status --short --untracked-files=all` y filtro de rutas prohibidas → `forbidden-path-check: ok`.
- `rtk git diff --name-only -- docs/opencode/optimizacion-tokens.md openspec/changes/opencode-token-cost-optimization/apply-progress.md && rtk git diff --check -- ...` → exit 0; sin errores de whitespace reportados.

## Desviación registrada

La propuesta y el diseño usaban `docs/opencode/eficiencia-token.md`; se implementó `docs/opencode/optimizacion-tokens.md` por instrucción explícita del apply preflight.

## Riesgos abiertos

- Los artefactos de propuesta/diseño conservan el nombre anterior como antecedente histórico del ciclo.
- No se ejecutó Graphify ni se instalaron herramientas; solo se documentaron reglas de uso seguro.
