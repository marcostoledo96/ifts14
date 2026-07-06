# Archive Report — m4-01b-angular-dto-d0-alignment

**Change**: `m4-01b-angular-dto-d0-alignment`
**Branch**: `integration/angular-api-d0-contract`
**Archived**: 2026-07-06
**Verdict**: PASS

## Resumen

Se alineó la capa Angular de validación pública al contrato D0 del backend PHP: `documentNumber` + `attendedDates` para certificados emitidos desde el modelo curso/alumno, con tolerancia legada para `documentMasked` sin fechas. Con `useRealApi: true`, un `200` del backend ya no colapsa a `technical-error` por shape obsoleto.

## Validación

| Métrica | Valor |
|---|---|
| Tests Angular | 74/74 SUCCESS |
| Build prod | OK |
| Backend PHP | Sin cambios |

## Specs sincronizadas

| Dominio | Acción |
|---|---|
| `frontend-public-validation` | ADDED escenario legado `documentMasked` |

## Archivos de producto

- `apps/frontend-angular/src/app/shared/certificates/dto.ts`
- `apps/frontend-angular/src/app/shared/certificates/result-mapper.ts`
- `apps/frontend-angular/src/app/shared/certificates/mock-tokens.ts`
- `apps/frontend-angular/src/app/shared/certificates/result-mapper.spec.ts`
- `apps/frontend-angular/src/app/features/public-validation/public-validation-page.{ts,html,spec.ts}`
- `docs/frontend/00-angular20-port-v0.md`

## Próximo ciclo sugerido

`backend-admin-certificados-consulta`: GET listado/detalle de certificados y API de configuración institucional para desbloquear admin Angular (F4–F6).
