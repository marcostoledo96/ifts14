# Proposal: Contrato de API para certificados QR

## Intent

Definir el contrato público de la API futura de certificados QR antes de implementar PHP, Angular o MariaDB.

## Scope

### In Scope
- Documentar endpoints bajo `/certificados/api/`.
- Definir DTOs, sobre de errores, validaciones y estrategia de token QR.
- Documentar restricciones de seguridad, conceptos de datos futuros, expectativas Angular y cPanel.
- Archivar el ciclo SDD en OpenSpec y Engram.

### Out of Scope
- Código PHP, Angular, migraciones, dependencias, generación PDF/QR, email, commits y deploy real.

## Capabilities

### New Capabilities
- `backend-contrato-api-certificados`: contrato público de API para verificación QR de certificados.

### Modified Capabilities
- None.

## Approach

Crear documentación contractual en `docs/backend/01-contrato-api-certificados.md`, actualizar docs de backend/base/frontend/índice y promover una spec OpenSpec nueva. Mantener el cambio documental y seguro.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `docs/backend/01-contrato-api-certificados.md` | New | Contrato API completo. |
| `docs/backend/00-php84-api.md` | Modified | Enlace al contrato vigente. |
| `docs/database/00-mariadb.md` | Modified | Conceptos futuros sin migración. |
| `docs/frontend/00-angular20-port-v0.md` | Modified | Expectativas de consumo API. |
| `docs/00-indice-general.md` | Modified | Referencias nuevas. |
| `openspec/specs/backend-contrato-api-certificados/spec.md` | New | Spec promovida al cerrar. |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Confundir contrato con implementación | Medium | Repetir restricciones de no producto. |
| Exponer datos sensibles por error | Low | Usar ejemplos ficticios y enmascarados. |
| Sobrediseñar administración futura | Medium | Limitar a verificación pública. |

## Rollback Plan

Revertir solo los documentos y la spec agregada; no hay cambios runtime ni migraciones.

## Dependencies

- Specs vigentes `repo-seguro` y `auditoria-material-original`.

## Success Criteria

- [x] Contrato público documentado sin producto.
- [x] Seguridad y deploy cPanel cubiertos.
- [x] OpenSpec archivado y spec promovida.
