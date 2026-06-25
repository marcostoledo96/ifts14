# Propuesta: Mejorar la guía operativa de Marcos (ciclos SDD)

## Intent

Convertir `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` en una guía operativa compacta: conserva M1-01..M3-03, añade instrucciones de ejecución, checkpoints de QA manual y anexo breve de skills/agents. No debe caer en el nivel pedagógico de la guía de Matías, ni autorizar código, dependencias, deploy o Git automático.

## Scope

### In Scope

- Ampliación operativa de `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` con estructura híbrida.
- Mantener IDs M1-01..M3-03, sin renumerar.
- Plantilla repetible por ciclo.
- Tabla "Cuándo detenerse para QA manual".
- Anexo breve de skills/agents verificables o "pendiente de validar".
- Handoff al cierre y comandos Git propuestos.

### Out of Scope

- Modificar código, dependencias, configuración Angular/PHP/DB o cPanel.
- Tocar `material_privado_no_versionar/`, dumps, logs, credenciales o `.env`.
- Reescribir la guía de Matías ni cambiar specs de producto.
- Commit, push, merge, rebase o deploy.
- Instalar paquetes o actualizar versiones.
- Cambiar `docs/00-indice-general.md` salvo título o función.

## Capabilities

> Cambio puramente documental. Sigue el patrón de `mejorar-guia-matias-angular-windows`.

### New Capabilities

- `guia-marcos-ciclos-sdd`: contrato documental de la guía operativa de Marcos.

### Modified Capabilities

- None

## Approach

Opción 3 de la exploración (híbrida compacta): ruta rápida, tabla QA con comando por hito, plantilla de 9 campos, 9 ciclos con plantilla y checkpoints al stack backend/MariaDB/cPanel, anexo breve de skills, handoff y comandos Git propuestos. Reglas: tablas > prosa, sin tutorial de Git, enlazar `AGENTS.md`/`GUIA.md`/specs sin duplicar.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | Modified | Ampliación operativa; IDs y orden conservados. |
| `docs/00-indice-general.md` | Possible minor | Solo si cambia título o función. |
| `openspec/specs/guia-marcos-ciclos-sdd/spec.md` | Created | Spec principal del contrato. |
| `openspec/changes/mejorar-guia-marcos-ciclos-sdd/*` | Created | Artefactos SDD. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Sobredocumentación para usuario experimentado. | Med | Borrador compacto, sin tutorial de Git. |
| Diff > 800 líneas. | Low | Plantilla compacta; dividir en 2 WU si pasa ~400. |
| Contradicción con `AGENTS.md`/`GUIA.md`. | Low | Citar como fuente, no duplicar. |
| Skills/agents desactualizados. | Med | Solo lo verificable o "pendiente de validar". |
| Pérdida de trazabilidad M1-01..M3-03. | Low | Mantener IDs. |

## Rollback Plan

```bash
git checkout -- MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md
git status --short --untracked-files=all
```

Si se tocó `docs/00-indice-general.md`, restaurarlo. La carpeta del cambio no se commitea por defecto.

## Dependencies

- `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` actual, `AGENTS.md`, `GUIA.md`, `docs/00-indice-general.md`.
- Specs `backend-contrato-api-certificados` y `backend-modelo-datos-certificados`.
- `opencode.json` y `.atl/skill-registry.md` solo si se incluye el anexo.

## Success Criteria

- [ ] Explica cuándo detenerse para QA manual y qué comando usar.
- [ ] Los 9 ciclos M1-01..M3-03 mantienen ID y orden con los 9 campos de la plantilla.
- [ ] Anexo de skills/agents verificable o "pendiente de validar"; handoff al cierre definido.
- [ ] Comandos Git solo como propuesta; no contradice `AGENTS.md`, `GUIA.md` ni specs backend/modelo.
- [ ] Diff ≤ 600 (objetivo) o ≤ 800 (techo); 2 WU si supera ~400.
