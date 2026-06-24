# Proposal: restaurar cobertura de escenarios de repo-seguro

## Intent

Restaurar la cobertura de escenarios de `repo-seguro` que quedó reducida al archivar `auditoria-material-original`, sin perder los escenarios nuevos de auditoría local.

## Scope

### In Scope
- Agregar una delta spec mínima para `repo-seguro`.
- Reincorporar como escenarios explícitos: reglas de ignorado, artefactos sensibles fuera de raíz, SQL controlado versionable y SQL sensible ignorado.
- Actualizar solo la spec fuente `openspec/specs/repo-seguro/spec.md` y los artefactos SDD del cambio.

### Out of Scope
- Implementar producto Angular, PHP, base de datos o deploy.
- Leer o auditar material privado.
- Cambiar reglas reales de `.gitignore`.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities
- `repo-seguro`: restaura escenarios de cobertura removidos accidentalmente del requisito de protección de material sensible.

## Approach

Usar un `MODIFIED Requirements` completo para reemplazar el requisito afectado preservando los dos escenarios audit-focused actuales y reinsertando los cuatro escenarios faltantes.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `openspec/specs/repo-seguro/spec.md` | Modified | Reincorpora escenarios de cobertura al requisito existente. |
| `openspec/changes/repo-seguro-coverage-restoration/` | New | Artefactos SDD mínimos del ciclo correctivo. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Duplicar o perder escenarios al reemplazar el requisito | Low | Copiar el bloque completo y verificar frases exactas en la spec final. |

## Rollback Plan

Revertir el bloque agregado en `openspec/specs/repo-seguro/spec.md` y retirar el archivo archivado del cambio si el ciclo se descarta antes de commit.

## Dependencies

- Spec vigente de `repo-seguro`.
- Archive report de `auditoria-material-original` como origen del hallazgo.

## Success Criteria

- [ ] La spec principal conserva los escenarios audit-focused actuales.
- [ ] La spec principal contiene las cuatro frases de escenarios restaurados.
- [ ] No se crean archivos de producto ni se lee material privado.
