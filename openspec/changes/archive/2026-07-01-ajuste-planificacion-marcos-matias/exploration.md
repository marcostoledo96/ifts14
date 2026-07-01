# Exploration: ajuste-planificacion-marcos-matias

## Estado actual

El proyecto tiene backend PHP 8.4.21 funcional con validación pública, emisión, revocación y reenvío; un frontend Angular 20 con shell semántico y validación pública mockeada; y una referencia visual v0 en `muestra_pagina/` que acaba de ser reemplazada por una exportación más completa (Next.js/React + capturas).

Las decisiones confirmadas por Marcos no están aún reflejadas en la documentación vigente:

- QR/token permanente (el contrato y el código actual rotan token en reenvío).
- DNI completo visible en la validación pública (el DTO público vigente usa `documentMasked`).
- El documento es un **certificado de curso** y debe mostrar las fechas del curso a las que asistió el alumno.
- Composer en cPanel es un gate pendiente de confirmar.
- Email con cuenta de prueba (transporte `stub`).
- Auth admin simple y temporal (`X-Admin-Key`), sin login real.
- Firmantes PDF: Rector/a y Asesor/a Pedagógica.
- Staging confirmado bajo `/certificados_staging/`.

## Clasificación de rutas no commiteadas

| Clasificación | Rutas | Observación |
|---|---|---|
| **Audit input** | `IFTS14_ajuste_documentacion_planificacion_marcos_matias.md` | Insumo del auditor/orquestador para este ciclo. Puede versionarse como documento de planificación o absorberse en `docs/`. |
| **v0 reference update** | Todo bajo `muestra_pagina/` | Nueva exportación v0: `app/`, `components/`, `capturas/`, `lib/`, `public/`, `package.json`, `next.config.mjs`, etc. Se eliminaron los metadatos previos `README.md`, `AGENTS.md` y `MANIFIESTO_V0.md`. El contenido es código de referencia visual; no contiene secretos, dumps, logs ni datos reales. |
| **Planning docs to update** | `README.md`, `GUIA.md`, `AGENTS.md`, `docs/backend/00-php84-api.md`, `docs/backend/01-contrato-api-certificados.md`, `docs/database/00-mariadb.md`, `docs/database/01-modelo-datos-certificados.md`, `docs/frontend/00-angular20-port-v0.md`, `docs/deploy/00-cpanel-certificados.md`, `docs/deploy/01-staging-cpanel-certificados.md`, `deploy/staging/CHECKLIST.md`, `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`, `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`, `MATIAS_PROMPTS_SDD_FASE2.md`, specs de OpenSpec afectadas. | Son los documentos que el audit identifica como desactualizados respecto a las decisiones confirmadas. |
| **Tooling metadata to ignore** | `.codegraph/` | Contiene `.gitignore` propio que ignora todo salvo ese archivo. Es metadata local de CodeGraph; no debe versionarse ni tratarse como artefacto del proyecto. |
| **Suspicious / forbidden** | Ninguna en el texto inspeccionado. | `muestra_pagina/components/admin/login-form.tsx` contiene credenciales de demo hardcodeadas (`admin@ifts14.edu.ar` / `ifts14`) para el mock visual; no son secretos reales, pero **no deben portarse al producto**. `muestra_pagina/components/validacion/folio-certificado.tsx` muestra un DNI ficticio (`40.123.456`) y fechas de asistencia, lo cual **sí es consistente** con la decisión de DNI completo público y certificado de curso con fechas. |

## Áreas afectadas

- `README.md` — agregar sección de decisiones vigentes.
- `GUIA.md` — actualizar alcance, flujo, roles, staging y reglas de QR/DNI.
- `AGENTS.md` — actualizar reglas obligatorias (token permanente, DNI completo en UI pública, logs sin DNI completo, auth simple temporal).
- `docs/backend/01-contrato-api-certificados.md` — cambiar DTO público de `documentMasked` a DNI completo, agregar `attendedDates`, aclarar reenvío sin rotación y revocación.
- `docs/backend/00-php84-api.md` — reflejar endpoints actuales, gaps y auth temporal.
- `docs/database/01-modelo-datos-certificados.md` — documentar DNI completo público (no enmascarado) y tablas futuras de cursos/alumnos/asistencias/configuración.
- `docs/frontend/00-angular20-port-v0.md` — validación pública con DNI completo, fechas asistidas, auth simple, uso de ZIP v0 actualizado.
- `docs/deploy/00-cpanel-certificados.md` y `01-staging-cpanel-certificados.md` — Composer gate, email de prueba, auth simple, staging `/certificados_staging/`.
- `deploy/staging/CHECKLIST.md` — gates de Composer, SMTP test, token permanente, DNI completo con datos ficticios.
- `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` — agregar fases M4-01..M4-07.
- `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` y `MATIAS_PROMPTS_SDD_FASE2.md` — DNI completo, fechas asistidas, QR permanente, auth simple, no login real.
- `openspec/specs/backend-contrato-api-certificados/spec.md`, `backend-modelo-datos-certificados/spec.md`, `admin-certificate-delivery/spec.md` — actualizar escenarios para reflejar QR permanente, DNI completo y fechas asistidas.
- `muestra_pagina/README.md`, `AGENTS.md`, `MANIFIESTO_V0.md` — recrear/actualizar para que coincidan con la nueva exportación v0.

## Enfoques

### Opción A — Un solo ciclo documental + v0
Actualizar todos los documentos, prompts, specs y metadatos de `muestra_pagina/` en un único change.

- **Pros:** un solo handoff, menos riesgo de contradicciones residuales.
- **Contras:** muchos archivos tocados; las capturas y archivos TSX de v0 pueden inflar el diff y la carga de revisión; mezcla planeación con referencia visual.
- **Esfuerzo:** Alto.

### Opción B — Dividir en dos unidades revisables (recomendada)
1. **D0 `docs-sync-decisiones-certificados`**: docs raíz, docs de backend/database/frontend/deploy, prompts y specs.
2. **`muestra-pagina-v0-actualizada`**: restaurar `README.md`, `AGENTS.md`, `MANIFIESTO_V0.md` y versionar la nueva referencia v0 como artefacto de diseño.

- **Pros:** revisiones más pequeñas y focalizadas; Matías puede auditar v0 mientras Marcos cierra los contratos; respeta la división de responsabilidades del audit.
- **Contras:** requiere coordinar que ambas unidades usen las mismas decisiones (QR permanente, DNI completo, fechas asistidas).
- **Esfuerzo:** Medio.

### Opción C — Mínimo: solo README/GUIA/AGENTS
Actualizar solo la documentación raíz y dejar specs, contratos y prompts para ciclos técnicos posteriores.

- **Pros:** diff pequeño.
- **Contras:** deja contradicciones en contratos, modelo de datos y guías operativas; incumple el objetivo del audit.
- **Esfuerzo:** Bajo.

## Recomendación

Adoptar la **Opción B**:

- En este change (`ajuste-planificacion-marcos-matias`) cubrir el **D0 de sincronización documental**: README, GUIA, AGENTS, docs técnicos, prompts de Marcos/Matías y specs OpenSpec afectadas.
- Como trabajo relacionado pero separado, actualizar los metadatos de `muestra_pagina/` (README, AGENTS, MANIFIESTO_V0.md) y commitear la nueva referencia v0 como artefacto de diseño.
- Si ambos se hacen en la misma rama, usar **dos commits lógicos**: uno para docs-sync y otro para v0 reference.
- **No implementar** backend, Angular, migraciones, cPanel, auth real, email real ni login real en este ciclo.

## Riesgos

- `muestra_pagina/components/admin/login-form.tsx` tiene credenciales de demo hardcodeadas; al portar a Angular deben reemplazarse por un mock seguro o integración real.
- El DNI completo en validación pública es una decisión institucional explícita, pero debe quedar documentado que logs, auditoría y errores nunca lo registran completo.
- Si no se actualiza el contrato de reenvío, puede quedar documentada la rotación de token en algún spec residual.
- `.codegraph/` ya está correctamente ignorado, pero debe vigilarse que no se agregue accidentalmente al stage.
- La nueva exportación v0 agrega muchas capturas binarias; no cuentan para el presupuesto de líneas, pero los archivos TSX sí pueden sumar. Conviene que v0 vaya en su propia unidad de revisión.

## Alcance exacto para la propuesta SDD

### Sí incluir
- Actualizar fuentes de verdad de decisiones en README, GUIA y AGENTS.
- Actualizar contrato API (DTO público con DNI completo + `attendedDates`, reenvío sin rotación de token, revocación, auth simple temporal).
- Actualizar modelo de datos (DNI completo público, tablas futuras de cursos/alumnos/asistencias/configuración institucional).
- Actualizar docs frontend con DNI completo, fechas asistidas y auth simple.
- Actualizar docs deploy/staging con Composer gate, email de prueba y `/certificados_staging/`.
- Actualizar prompts de Marcos (fases M4) y Matías (F0-F3 y Fase 2).
- Actualizar specs OpenSpec afectadas o preparar deltas bajo `openspec/changes/ajuste-planificacion-marcos-matias/specs/`.
- Recrear `muestra_pagina/README.md`, `AGENTS.md` y `MANIFIESTO_V0.md` para reflejar la nueva exportación.

### No incluir
- Modificar código PHP productivo (`apps/backend-php/src/`).
- Modificar código Angular productivo (`apps/frontend-angular/src/`).
- Crear migraciones SQL nuevas.
- Tocar cPanel, `public_html` o configuraciones reales.
- Implementar login real, roles, 2FA o OAuth.
- Portar componentes React/Next de v0 a Angular en este ciclo.
- Usar datos reales o secretos.

## Notas de verificación de herramientas

| Herramienta | Uso en este ciclo | Verificación |
|---|---|---|
| **RTK** | Se usó para comprimir `git status`, listados de `muestra_pagina/`, `openspec/` y comandos de exploración. | Preservar comando, rutas afectadas y decisión; no pegar salidas largas sin síntesis. |
| **Graphify** | **No ejecutado.** El ciclo es documental y no requiere mapa de arquitectura. | `.graphifyignore` existe y excluye `material_privado_no_versionar/`, dumps, logs, `.env`, `graphify-out/`, etc. Solo Marcos debe ejecutarlo si necesita contexto estructural; Matías no lo ejecuta. |
| **Ponytail** | Activo en modo `full`. | Confirma que el alcance se limita a documentación y metadata; no se agrega código de producto ni abstracciones especulativas. |
| **Karpathy Guidelines** | Aplicado durante la lectura. | Supuestos explícitos (p. ej. DNI completo = decisión institucional aprobada), cambios quirúrgicos solo en docs, criterios de éxito verificables (no quedar contradicciones en QR/DNI/fechas). |

## Listo para propuesta

**Sí.** El dominio está suficientemente entendido, las decisiones confirmadas están claras y las áreas afectadas están identificadas. La propuesta debe presentar el **D0 `docs-sync-decisiones-certificados`** como alcance principal de este change, con la opción de incluir (o separar) la actualización de metadatos de `muestra_pagina/`.
