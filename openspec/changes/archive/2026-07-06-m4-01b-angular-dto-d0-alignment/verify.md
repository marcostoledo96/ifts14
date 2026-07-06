# Verify — M4-01B angular DTO D0

**Verdict**: PASS

| Check | Result |
|---|---|
| `npm test --watch=false` | 74/74 SUCCESS |
| `npm run build` | OK |
| DTO D0 en mapper | `documentNumber` + `attendedDates` requeridos |
| Legado | `documentMasked` sin `attendedDates` aceptado |
| Backend PHP | Sin cambios (no requeridos) |

**Warnings**: smoke E2E `scripts/m3-06-smoke.sh` sigue bloqueado sin PHP CLI local.
