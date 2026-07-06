# Propuesta: M4-01B — alineación contrato D0 en integración Angular/API

## Intención

Cerrar la brecha entre el DTO público del backend PHP (D0: `documentNumber` + `attendedDates`) y la capa Angular de validación pública, que todavía exigía `documentMasked` y colapsaba certificados reales a `technical-error`.

## Alcance

### Incluido

- Actualizar `dto.ts`, `result-mapper.ts`, mocks, template y tests Angular.
- Tolerar certificados legados con `documentMasked` sin `attendedDates`.
- Documentar cierre en `docs/frontend/` y specs `frontend-public-validation` / `frontend-api-readiness`.

### Fuera de alcance

- Admin, deploy real, backend PHP, configuración institucional API.
- Diseño visual final (Matías).

## Criterios de éxito

- [ ] Mapper acepta DTO D0 con `documentNumber` + `attendedDates` no vacío.
- [ ] Mapper acepta legado `documentMasked` sin `attendedDates`.
- [ ] UI pública muestra DNI completo y fechas asistidas en fixture D0.
- [ ] Tests Angular verdes.
