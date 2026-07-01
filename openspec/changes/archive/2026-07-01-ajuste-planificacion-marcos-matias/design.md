# Diseño: Ajuste de planificación Marcos/Matías

## Enfoque técnico

Cambio documental quirúrgico para alinear las fuentes vigentes con las decisiones D0: QR permanente, DNI completo visible en validación pública, certificado de curso con fechas asistidas, auth admin simple temporal, staging `/certificados_staging/` y Composer/SMTP como gates. No se implementa producto; se actualizan docs, prompts y deltas OpenSpec enlazando fuentes de verdad para evitar duplicación.

## Decisiones de arquitectura

| Decisión | Alternativas consideradas | Fundamento |
|---|---|---|
| Fuente raíz mínima en `README.md`, `GUIA.md` y `AGENTS.md` | Repetir la regla completa en todos los docs técnicos | La raíz orienta rápido; los detalles quedan en docs/specs específicos. Reduce contradicciones futuras. |
| Docs técnicos como fuente por dominio | Centralizar todo en una guía única | Backend, DB, frontend y deploy tienen riesgos distintos; separar por dominio mantiene revisión focalizada. |
| Deltas OpenSpec para capacidades afectadas | Editar solo documentación humana | Las decisiones cambian contratos; OpenSpec debe conservar trazabilidad verificable para `sdd-archive`. |
| `muestra_pagina/` como referencia visual separada | Portar React/Next o mezclar v0 con producto Angular | La exportación v0 es insumo, no implementación. Se recrea metadata mínima y no se copian credenciales demo ni componentes. |
| `.codegraph/` fuera del cambio y del stage | Documentarlo como artefacto del proyecto | Es metadata local de herramienta; no aporta contrato ni planificación y puede ensuciar revisión. |

## Flujo de datos documental

```txt
Audit + exploration
  └─→ decisions D0
       ├─→ raíz: README / GUIA / AGENTS
       ├─→ dominios: backend / database / frontend / deploy
       ├─→ prompts Marcos / Matías
       ├─→ deltas OpenSpec
       └─→ metadata muestra_pagina
```

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `README.md`, `GUIA.md`, `AGENTS.md` | Modificar | Registrar decisiones vigentes y límites de ciclo. |
| `docs/backend/00-php84-api.md` | Modificar | Alinear endpoints, auth temporal y gaps. |
| `docs/backend/01-contrato-api-certificados.md` | Modificar | DTO público con DNI completo, `attendedDates` y reenvío sin rotación normal. |
| `docs/database/00-mariadb.md`, `docs/database/01-modelo-datos-certificados.md` | Modificar | QR permanente, DNI completo público y futuras tablas curso/asistencia/configuración. |
| `docs/frontend/00-angular20-port-v0.md` | Modificar | Validación pública con DNI completo y fechas asistidas; v0 como referencia. |
| `docs/deploy/00-cpanel-certificados.md`, `docs/deploy/01-staging-cpanel-certificados.md`, `deploy/staging/CHECKLIST.md` | Modificar | Gates Composer, SMTP de prueba/stub y staging `/certificados_staging/`. |
| `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | Modificar | Agregar fases M4 y responsabilidades actualizadas. |
| `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`, `MATIAS_PROMPTS_SDD_FASE2.md` | Modificar | Actualizar rol UI/UX, QR permanente, DNI completo, fechas asistidas y límites. |
| `openspec/changes/ajuste-planificacion-marcos-matias/specs/**/spec.md` | Crear | Deltas de capacidades modificadas. |
| `muestra_pagina/README.md`, `muestra_pagina/AGENTS.md`, `muestra_pagina/MANIFIESTO_V0.md` | Crear | Metadata mínima de la nueva exportación v0; sin portar UI. |

## Interfaces / contratos

- Contrato público: reemplazar `student.documentMasked` por DNI completo visible según decisión institucional y agregar fechas asistidas del curso.
- Reenvío: conserva QR/token permanente salvo revocación explícita; no hay rotación normal por reenvío.
- Seguridad: logs, auditoría, errores y respuestas administrativas no deben incluir DNI completo, token completo, secretos ni credenciales.
- v0: credenciales demo de `muestra_pagina` son mock visual y no se portan.

## Estrategia de prueba

| Capa | Qué probar | Enfoque |
|---|---|---|
| Documental | No quedan contradicciones sobre QR, DNI, fechas o reenvío | Búsqueda de términos viejos (`documentMasked`, DNI enmascarado público, rotación). |
| OpenSpec | Capacidades afectadas tienen deltas trazables | Revisar Given/When/Then y RFC 2119. |
| Seguridad | Sin secretos, dumps, logs ni `.codegraph/` en stage | `git status --short` y revisión de rutas. |

## Migración / rollout

No requiere migración. El rollout es un PR documental; cualquier implementación PHP, Angular, DB o deploy queda para ciclos posteriores.

## Preguntas abiertas

- [ ] Confirmar si `muestra_pagina/` se revisa en el mismo PR como segunda unidad lógica o en PR separado si supera el presupuesto de revisión.
