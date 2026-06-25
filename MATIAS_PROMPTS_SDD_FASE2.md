# Matías — Fase 2 SDD frontend Angular 20

Guía operativa para continuar los prompts 11-22 del port visual v0. Complementa `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`; no la reemplaza.

## Ruta rápida

1. Leé `README.md`, `GUIA.md`, `AGENTS.md`, `docs/00-indice-general.md` y `docs/frontend/00-angular20-port-v0.md`.
2. Confirmá que `muestra_pagina/` sigue siendo la referencia v0 vigente.
3. Elegí un ciclo F4-F6 y ejecutá SDD completo: explore → propose → spec → design → tasks → apply → verify → archive.
4. Si el ciclo depende de API, PDF, QR, permisos, auditoría o configuración no aprobada, primero pedí spec o bloqueá.
5. No hagas commit, push, merge, rebase ni deploy desde OpenCode.

## Reglas de Fase 2

- No copiar React/Next literalmente desde `muestra_pagina/`.
- No inventar contratos backend, endpoints, PDF, QR, permisos ni configuración institucional.
- No tocar PHP, MariaDB, deploy, cPanel ni `material_privado_no_versionar/`.
- No instalar dependencias sin aprobación explícita.
- Mantener documentación breve: enlazar `docs/frontend/00-angular20-port-v0.md` como fuente visual.
- Cerrar cada ciclo con verify y `sdd-archive`.

## Prompt base

Usá este texto como base y reemplazá `<ciclo>` y `<objetivo>`.

```txt
Trabajemos el ciclo <ciclo> — <objetivo> del frontend Angular 20 para IFTS14.
Usá SDD completo. Leé AGENTS.md, GUIA.md, docs/00-indice-general.md,
docs/frontend/00-angular20-port-v0.md, muestra_pagina/README.md y la spec OpenSpec correspondiente.
No copies React/Next literalmente. No inventes API, PDF, QR, permisos ni configuración.
No toques backend, base de datos, deploy ni material_privado_no_versionar/.
No instales dependencias y no ejecutes commit, push, merge ni rebase.
Cerrá con verify, sdd-archive y reporte final con archivos, validaciones, QA, bloqueos y riesgos.
```

## F4 — Detalles, PDF y cursos

| Ciclo | Prompt | Objetivo | Bloqueo obligatorio |
|---|---:|---|---|
| F4-01 | 11 | Detalle de certificación administrativo con estado, trazabilidad y acciones. | Spec previa si incluye historial, QR o revocación real. |
| F4-02 | 12 | Vista previa de PDF complementario. | Spec previa de PDF, layout y datos permitidos. |
| F4-03 | 13 | Listado de cursos. | Contrato o mocks explícitos para cursos, fechas y estados. |
| F4-04 | 14 | Detalle de curso. | Contrato de curso, fechas, asistencias y certificaciones asociadas. |

Evidencia esperada:

- build/tests disponibles o bloqueo verificable;
- QA responsive, teclado/foco, contraste y consola;
- documentación actualizada en `docs/frontend/00-angular20-port-v0.md`;
- reporte final con pendientes separados de lo terminado.

## F5 — Listados, alumnos y envío

| Ciclo | Prompt | Objetivo | Bloqueo obligatorio |
|---|---:|---|---|
| F5-01 | 15 | Listado de certificaciones con filtros y estados. | Contrato de filtros, paginación y estados. |
| F5-02 | 16 | Listado de alumnos. | Definir datos visibles; no exponer DNI completo. |
| F5-03 | 17 | Detalle administrativo de alumno. | Spec previa de datos personales permitidos. |
| F5-04 | 18 | Enviar o reenviar certificación. | Contrato de envío y mensajes aprobados. |

Evidencia esperada:

- no hay datos reales ni sensibles en mocks;
- acciones críticas quedan diferenciadas de acciones informativas;
- estados vacío, carga, error y éxito son visibles cuando aplican;
- archive registra límites y contratos pendientes.

## F6 — Revocación, carga masiva, auditoría y configuración

| Ciclo | Prompt | Objetivo | Bloqueo obligatorio |
|---|---:|---|---|
| F6-01 | 19 | Revocar certificación. | Spec de permisos, confirmación y efecto irreversible. |
| F6-02 | 20 | Placeholder de carga masiva. | Alcance placeholder; no importar archivos reales. |
| F6-03 | 21 | Auditoría básica. | Contrato de eventos auditables y permisos. |
| F6-04 | 22 | Configuración institucional. | Definir secciones, permisos y datos no sensibles. |

Evidencia esperada:

- flujos críticos tienen confirmación clara;
- no se guardan ni muestran credenciales o datos reales;
- errores técnicos no exponen detalles internos;
- QA final registra riesgos abiertos para Marcos.

## Troubleshooting

| Problema | Acción segura |
|---|---|
| Falta contrato API | Bloquear integración real y usar solo mocks explícitos del ciclo. |
| Falta spec de PDF o QR | No implementar. Pedir spec previa. |
| Se necesitan permisos o auditoría | Pedir contrato de roles/eventos antes de tocar UI final. |
| Aparecen datos personales en mock | Frenar, reemplazar por datos ficticios mínimos y reportar. |
| v0 cambió | Actualizar primero `docs/frontend/00-angular20-port-v0.md` mediante SDD. |
| El ciclo se agranda | Dividir en otro ciclo SDD; no mezclar pantallas no relacionadas. |

## Fuentes de verdad

| Fuente | Uso |
|---|---|
| `docs/frontend/00-angular20-port-v0.md` | Inventario v0, tokens, componentes candidatos y riesgos. |
| `muestra_pagina/README.md` | Estado de la referencia v0 y reglas de uso. |
| `apps/frontend-angular/AGENTS.md` | Reglas para código Angular. |
| `docs/backend/01-contrato-api-certificados.md` | Contrato API cuando exista o esté aprobado. |
| `openspec/changes/<cambio>/specs/` | Spec activa de cada ciclo. |

## Checklist final de cada ciclo

- [ ] SDD completo ejecutado o bloqueo documentado.
- [ ] Spec previa existe si hay API, PDF, QR, permisos, auditoría o configuración.
- [ ] No se copió React/Next literalmente.
- [ ] No se tocaron backend, base, deploy ni material privado.
- [ ] No se instalaron dependencias no aprobadas.
- [ ] Tests/build disponibles ejecutados o bloqueo verificable.
- [ ] QA manual registrado.
- [ ] `sdd-archive` actualizó la documentación afectada.
- [ ] Comandos Git solo propuestos, no ejecutados por OpenCode.
