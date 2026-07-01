# Propuesta: Ajuste de planificación Marcos/Matías

## Intención

Sincronizar documentación, decisiones y planificación D0 después del audit externo y de la nueva referencia v0, para que Marcos y Matías trabajen con las mismas reglas: QR permanente, DNI completo público, certificado de curso con fechas asistidas, auth admin simple temporal, staging `/certificados_staging/` y Composer/SMTP como gates.

## Alcance

### Incluido
- Actualizar fuentes raíz, docs técnicas, prompts y OpenSpec afectados.
- Registrar división operativa Marcos/Matías y estado actualizado de `muestra_pagina/`.
- Recrear metadata mínima de `muestra_pagina/` como referencia visual, sin portar UI.

### Excluido
- Cambios de backend, DB, Angular, migraciones, cPanel/deploy o secretos.
- Login real, roles, OAuth/2FA, SMTP real o Composer en hosting.
- Portar React/Next de v0 a Angular o copiar credenciales demo.

## Capacidades

### Nuevas capacidades
- Ninguna.

### Capacidades modificadas
- `backend-contrato-api-certificados`: DTO público con DNI completo y fechas asistidas; reenvío sin rotación normal.
- `backend-modelo-datos-certificados`: reglas para QR permanente, DNI completo público y futuras tablas curso/asistencia/configuración.
- `admin-certificate-delivery`: reenvío conserva QR; SMTP de prueba/stub como gate.
- `frontend-public-validation`: validación pública muestra DNI completo y fechas asistidas con datos ficticios.
- `frontend-api-readiness`: modelos frontend alineados al nuevo DTO público.
- `deploy-cpanel-certificados`: staging, Composer/vendor y SMTP de prueba como gates documentados.
- `guia-marcos-ciclos-sdd`: fases M4 y responsabilidades backend/deploy.
- `guia-matias-angular-windows`: rol UI/UX, uso de v0 actualizada y límites Fase 2.

## Enfoque

Aplicar un cambio documental quirúrgico: actualizar contratos, docs y prompts enlazando fuentes de verdad, evitar duplicación y preparar deltas OpenSpec. Mantener `muestra_pagina/` como insumo visual separado; `.codegraph/` queda fuera de artefactos y stage.

## Áreas afectadas

| Área | Impacto | Descripción |
|---|---|---|
| `README.md`, `GUIA.md`, `AGENTS.md` | Modificado | Decisiones vigentes y reglas. |
| `docs/backend/`, `docs/database/`, `docs/frontend/`, `docs/deploy/` | Modificado | Contratos y gates. |
| `MARCOS_PROMPTS*`, `MATIAS_PROMPTS*` | Modificado | Roadmap y roles. |
| `openspec/changes/.../specs/` | Nuevo | Deltas de capacidades. |
| `muestra_pagina/*.md` | Nuevo/Modificado | Metadata de referencia v0. |

## Riesgos

| Riesgo | Prob. | Mitigación |
|---|---|---|
| Contradicciones residuales QR/DNI | Media | Buscar términos viejos y actualizar deltas. |
| Diff grande por v0 | Media | Separar metadata/referencia en unidad lógica. |
| Credenciales demo copiadas | Baja | Documentar como mock no portable. |

## Plan de reversión

Revertir este change documental y su memoria SDD; no hay datos, código runtime, DB ni deploy que restaurar.

## Dependencias

- Audit `IFTS14_ajuste_documentacion_planificacion_marcos_matias.md` y exploración vigente.

## Criterios de éxito

- [ ] No quedan reglas viejas de rotación normal ni DNI enmascarado público como fuente vigente.
- [ ] Specs, docs y prompts trazan roles Marcos/Matías y no habilitan código/deploy.
- [ ] `.codegraph/`, secretos, dumps y datos reales no aparecen en artefactos/stage.
