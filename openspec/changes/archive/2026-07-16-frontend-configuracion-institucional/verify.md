# Verify: Configuración institucional (frontend)

**Change**: `frontend-configuracion-institucional`
**Fecha**: 2026-07-16
**Veredicto**: **verified**

## Gates técnicos

| Gate | Comando | Exit | Resultado |
|------|---------|------|-----------|
| Tests | `npm run test:ci` | 0 | 663/663 |
| TypeScript | `npx tsc --noEmit -p tsconfig.app.json` | 0 | sin errores |
| Build AOT | `npm run build` | 0 | OK |

Working directory: `apps/frontend-angular/`.

## Cobertura contra spec (REQ-CFG-001..009)

| Req | Estado | Evidencia |
|-----|--------|-----------|
| REQ-CFG-001 Carga GET + reintento | Conforme | `institutional-config-page.spec.ts` load/retry |
| REQ-CFG-002 Identidad (`institutionName`, sin logo/dirección) | Conforme | page specs + assertion de ausencia |
| REQ-CFG-003 Certificados (`certificateText`) | Conforme | page specs |
| REQ-CFG-004 Autoridades + preview tipográfica | Conforme | page specs; sin upload |
| REQ-CFG-005 Guardar PUT + updatedAt | Conforme | service + page specs |
| REQ-CFG-006 Sticky dirty + Descartar | Conforme | page specs |
| REQ-CFG-007 Validación 160/80/255 | Conforme | page specs (bloquea PUT) |
| REQ-CFG-008 Ruta + sidebar | Conforme | `app.routes.spec.ts`, `sidebar-admin.spec.ts` |
| REQ-CFG-009 Banner de impacto | Conforme | page template + specs |
| Non-goals (contacto/validación sin inputs fantasma) | Conforme | inspección + assertions de ausencia |

## Hallazgos

- **CRITICAL**: ninguno.
- **WARNING**: budgets CSS preexistentes en páginas ajenas (certificaciones/alumnos); fuera de este ciclo.
- **SUGGESTION**: validación visual interactiva en browser queda para smoke global post-ciclos.

## Notas

- Apply reportó los mismos tres gates en verde antes de este verify independiente.
- No se realizó smoke visual E2E en este verify (capturas `cfg-*.png` son stubs; anclar a UI Angular viva en smoke global).
