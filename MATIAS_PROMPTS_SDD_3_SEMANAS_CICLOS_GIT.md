# Matías — guía ejecutable SDD para Angular 20 en Windows

> **Estado global (2026-07-17): F0–F6 del MVP — SIN CICLOS ACTIVOS PENDIENTES.**
>
> - **Hechos:** F0-01…F5-03, F5-04, F6-01, F6-03 (alcance efectivo), F6-04.
> - **Diferido fuera de MVP:** F6-02 (placeholder carga masiva) → backlog P9 / decisión posterior; no bloquea cierre de esta guía.
> - Paridad visual adicional (`docs/frontend/PROMPT-PARIDAD-MUESTRA-PAGINA.md` y archives `frontend-parity-*`) y QA staging (P8-04/P8-05) se siguen fuera de F0–F6.
>
> Esta guía queda como **referencia histórica ejecutable**. No abrir ciclos F0–F6 nuevos salvo regresión o decisión explícita de reabrir alcance (p. ej. F6-02).

Esta guía es el punto de entrada único y vigente para que Matías trabaje el frontend Angular 20 del módulo `/certificados/` desde Windows. Se trabaja en ciclos chicos, con Spec-Driven Development, validación explícita y cierre obligatorio con `sdd-archive`.

> Estado de esta guía: cubre F0-F6 en una secuencia unificada. `muestra_pagina/` es la referencia visual v0 final y completa (export de Next.js/React con capturas para todos los prompts 4-22); no hay prompts pendientes de export v0. Los ciclos F4-F6 al final de esta guía detallan los flujos administrativos, PDF, entrega manual, revocación, carga masiva (diferida), auditoría/copiar link y configuración.

## Índice de estado de fases (F0-F6)

Estado actualizado al **2026-07-17**. Convención: ✅ hecho, ⏳ pendiente, 🚫 diferido/fuera de MVP, 🚫 bloqueado (por Marcos u otro).

| Fase | # | Ciclo | Estado | Rama sugerida | Commit/Notas |
|---|---|---|---|---|---|
| F0 | F0-01 | Verificar entorno Windows | ✅ | docs/matias-onboarding-windows | `d7b523e` (merged en PR #6) |
| F0 | F0-02 | Verificar OpenCode/Gentle-AI | ✅ | docs/matias-onboarding-f0-02-f0-03 | archive cerrado; commit del PR sin fijar HEAD transitorio |
| F0 | F0-03 | Leer documentación mínima y entender misión | ✅ | docs/matias-onboarding-f0-03 | Archive cerrado en PR #12; onboarding frontend registrado. |
| F1 | F1-01 | Auditar `muestra_pagina/` | ✅ | frontend/v0-design-system | Matías. |
| F1 | F1-02 | Extraer sistema visual desde v0 | ✅ | frontend/v0-design-system | Matías. |
| F1 | F1-03 | Crear app Angular 20 | ✅ | frontend/angular-shell | Marcos si hace falta destrabar backend. |
| F1 | F1-04 | Configurar Tailwind | ✅ | frontend/angular-shell | Marcos si hace falta; coordinar sistema visual. |
| F1 | F1-05 | Crear layout base público/admin | ✅ | frontend/angular-shell | Marcos estructura; Matías diseño final. |
| F2 | F2-01 | Pantalla pública de validación válida | ✅ | frontend/public-validation-flow | Marcos si hace falta; Matías no tocar sin coordinación. |
| F2 | F2-02 | Estados revocada/no encontrada/error | ✅ | frontend/public-validation-flow | Marcos si hace falta; Matías no tocar sin coordinación. |
| F2 | F2-03 | Login/admin shell | ✅ | frontend/admin-foundation | Matías. |
| F2 | F2-04 | Cursos y fechas | ✅ | frontend/admin-foundation | Matías. |
| F2 | F2-05 | Asistencias presentes | ✅ | frontend/admin-foundation | Matías. |
| F2 | F2-06 | Certificaciones | ✅ | frontend/admin-certifications | Matías. |
| F3 | F3-01 | Servicios mock y contratos frontend | ✅ | frontend/api-readiness | Marcos si hace falta; Matías no tocar sin coordinación. |
| F3 | F3-02 | Preparar conexión futura con API PHP | ✅ | frontend/api-readiness | Marcos si hace falta; Matías no tocar sin coordinación. |
| F3 | F3-03 | Tests automáticos básicos | ✅ | qa/frontend-release-readiness | Matías. |
| F3 | F3-04 | QA manual completo | ✅ | qa/frontend-release-readiness | Matías. |
| F3 | F3-05 | Build para `/certificados/` | ✅ | frontend/api-readiness | Marcos si hace falta. |
| F3 | F3-06 | Handoff a Marcos | ✅ | qa/frontend-release-readiness | Matías. |
| F4 | F4-01 | Detalle de certificación administrativo | ✅ | frontend/certificate-detail-pdf | Matías. |
| F4 | F4-02 | Vista previa PDF complementario | ✅ | frontend/certificate-detail-pdf | Matías. |
| F4 | F4-03 | Listado de cursos | ✅ | frontend/admin-courses | Matías. |
| F4 | F4-04 | Detalle de curso | ✅ | frontend/admin-courses | Matías. |
| F5 | F5-01 | Listado de certificaciones | ✅ | frontend/admin-certifications | Matías. |
| F5 | F5-02 | Listado de alumnos | ✅ | frontend/admin-students | Matías. |
| F5 | F5-03 | Detalle administrativo de alumno | ✅ | frontend/admin-students | Matías. |
| F5 | F5-04 | Entrega manual de certificación | ✅ | frontend/admin-certifications | Cerrado: `p6-01-entrega-manual-funcional` + `frontend-entrega-manual-qr` + paridad entrega/revocar/PDF. Sin email. |
| F6 | F6-01 | Revocar certificación | ✅ | frontend/admin-certifications | Matías. |
| F6 | F6-02 | Placeholder de carga masiva | 🚫 | frontend/admin-bulk-config | **Diferido fuera de MVP** (P9 / decisión posterior). No hay ruta ni feature en producto. |
| F6 | F6-03 | Auditoría / Copiar link (alcance efectivo) | ✅ | frontend/admin-certifications | Cerrado como timeline `auditEvents` en expediente + Copiar/Compartir (`frontend-certificado-preview`). Sin pantalla `/admin/auditoria` dedicada (fuera de MVP). |
| F6 | F6-04 | Configuración institucional | ✅ | frontend/admin-bulk-config | Cerrado: `frontend-configuracion-institucional` + `frontend-parity-configuracion-layout`. |

**Resumen (2026-07-17):** **27 de 28 hechos** para el MVP; **1 diferido** (F6-02). **No hay ciclos F0–F6 activos pendientes** en esta guía. Auth real: sesión PHP (no `X-Admin-Key` en Angular). Continuación operativa: paridad residual / QA staging en plan P8 y `docs/qa/CHECKLIST-TESTING-MANUAL.md`.

### División operativa frontend

- Marcos puede tomar `frontend/angular-shell`, `frontend/public-validation-flow` y `frontend/api-readiness` para destrabar backend: estructura, contratos, mocks ficticios y build `/certificados/`.
- Matías conserva `frontend/v0-design-system`, admin (`F2-03`..`F2-06`), `F3-03`, `F3-04`, `F3-06` y F4-F6 salvo acuerdo posterior.
- Matías no debe tocar `frontend/public-validation-flow` ni `frontend/api-readiness` sin coordinación explícita con Marcos. Si Marcos tomó `frontend/angular-shell`, coordinar antes de modificar `angular.json`, `package.json`, estilos globales o rutas raíz.

Para actualizar este índice al cerrar cada ciclo, editá esta tabla y commiteá con mensaje `docs(governance): actualizar indice de fases de matias`. Mantener formato y columnas estables.

## Herramientas obligatorias antes de empezar

Antes de cualquier ciclo F0-F6, Matías debe:

- Leer `AGENTS.md`, `docs/00-indice-general.md`, `docs/opencode/optimizacion-tokens.md` y el ciclo activo.
- Verificar herramientas F0 con `node --version`, `npm --version`, `git --version`, `code --version` y `ng version`.
- Resumir salidas largas; no pegar terminal completa sin síntesis.
- No ejecutar Graphify. Si necesita contexto de arquitectura, pedir resumen aprobado por Marcos.
- No instalar dependencias ni herramientas sin aprobación explícita.
- No tocar backend, base de datos, deploy ni `material_privado_no_versionar/`.

## Ruta rápida

1. Leé primero `AGENTS.md`, `docs/00-indice-general.md`, `docs/opencode/optimizacion-tokens.md` y el ciclo activo.
2. Confirmá que no estás trabajando directo sobre `main` salvo decisión explícita de Marcos.
3. Verificá el entorno Windows con la sección [Preparación de entorno Windows](#preparación-de-entorno-windows).
4. Elegí un ciclo F0-F6 y leé su objetivo, archivos, prompt, validaciones y límites.
5. Pedile a OpenCode un ciclo SDD completo: explore → propose → spec → design → tasks → apply → verify → archive.
6. Ejecutá pruebas automáticas disponibles y QA manual antes de cerrar.
7. Al cerrar F3-06, continuá con los ciclos F4-F6 de esta misma guía si el ciclo elegido tiene spec/contrato aprobado; si el ciclo todavía no cuenta con spec/tarea detallada, primero expandílo con archivos a leer, validaciones, QA, límites y criterios de cierre antes de ejecutarlo.
8. Dejale a Marcos un reporte final con archivos, verificaciones, bloqueos y comandos Git propuestos. Tras `sdd-verify` PASS y `sdd-archive`, OpenCode puede cerrar la rama actual con `git add` + `git commit` + `git push` (a la rama de trabajo actual, nunca a `main`) solo si Matías lo aprueba explícitamente en el mismo turno, con mensaje y comando exactos. **Previo al `git add`**: correr `git status --short` y `git diff --name-only`, presentar a Matías y esperar confirmación del diff. **Previo al `git push`**: si existe `origin/<rama>`, correr `git log origin/<rama>..<rama> --oneline` y `git diff origin/<rama>..<rama> --stat`; si es primer push, declarar que la ref remota no existe y comparar contra la base aprobada con `git log <base>..HEAD --oneline` y `git diff <base>...HEAD --stat`. La preparación de rama o PR puede ocurrir antes de `sdd-verify` cuando el ciclo lo necesita. PR, `git switch`, `git checkout`, `git branch`, `git switch -c`, `git checkout -b`, merge y rebase requieren aprobación explícita, comando exacto, evidencia previa y árbol limpio, o una decisión explícita de stash/commit/abortar. Para Matías, la única prohibición dura es `git push` directo a `main`. Para leer un archivo histórico sin modificar el working tree, usar `git show <commit>:<archivo>`.

## Misión y contexto operativo

| Tema | Regla |
|---|---|
| Rol | Matías lidera UI/UX del frontend Angular 20, responsive, accesibilidad, admin, QA y handoff visual. Marcos puede tomar estructura/backend-facing según la división operativa. |
| Producto | Módulo público `/certificados/` para validar certificados de curso mediante QR o link. |
| Fuente visual | `muestra_pagina/` contiene la referencia visual v0 final y completa (Next.js/React exportado, capturas y prompts Stitch) para todos los flujos 4-22. Se usa solo como referencia visual: no compilar, no portar literalmente, no copiar credenciales demo. El inventario de referencia se completa contra el listado seguro de la carpeta; el `MANIFIESTO_V0.md` histórico fue retirado al reemplazar la carpeta por el export final. |
| Fuente documental | `AGENTS.md`, `GUIA.md`, `docs/00-indice-general.md`, `docs/frontend/00-angular20-port-v0.md` y specs OpenSpec vigentes. |
| Backend/API | No inventar contratos. Usar solo lo documentado por Marcos. |
| Seguridad | No tocar `material_privado_no_versionar/`, dumps, logs, credenciales ni archivos `.env`. |
| Decisiones D0 | QR/token permanente (reenvío no rota); DNI completo visible en validación pública; certificado de curso con fechas asistidas; **auth admin = sesión PHP + CSRF** (no `X-Admin-Key` en Angular); firmantes PDF Rector/a y Asesor/a Pedagógica; staging `/certificados_staging/`. |
| Cierre admin | Matías puede avanzar sistema visual y componentes base sin backend final, pero **no debe cerrar pantallas admin como "done"** hasta que Marcos provea contratos/mocks aprobados para cada flujo. El trabajo visual puede quedar "in progress / pending contract". |
| Git | Trabajar con ramas por unidad revisable/deployable, no necesariamente una rama por ciclo SDD. **Para el flujo de Matías**: OpenCode PUEDE ejecutar operaciones Git con aprobación explícita de Matías en el mismo turno, comando exacto, evidencia previa, diff-confirmation gate cuando corresponda, árbol limpio o decisión explícita de stash/commit/abortar; la única prohibición dura es `git push` directo a `main`; ver sección "Ruta rápida" punto 8. **Para el flujo de Marcos**: ver `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` — Marcos mantiene autoridad total sobre su propio workflow. |

### Alcance permitido

- Preparar y documentar trabajo frontend Angular 20.
- Crear o modificar código Angular solo dentro del ciclo SDD aprobado.
- Portar diseño de `muestra_pagina/` a componentes Angular propios cuando exista referencia visual utilizable.
- Mejorar accesibilidad, responsive, performance y estructura.
- Actualizar documentación frontend durante `sdd-archive`.

### Fuera de alcance

- Backend PHP, MariaDB, deploy cPanel y material privado.
- Operaciones Git sin aprobación explícita y evidencia previa; `git push` directo a `main`; cambios destructivos automáticos.
- Instalación de dependencias no aprobadas.
- Copia literal de React, Next.js, hooks, rutas o componentes generados por v0.
- Pantallas finales inventadas cuando `muestra_pagina/` no aporte referencia utilizable.

## Preparación de entorno Windows

Usá PowerShell. Si un comando falla, resolvé la herramienta faltante antes de empezar un ciclo de implementación.

### Verificar herramientas

```powershell
node --version
npm --version
git --version
code --version
ng version
```

### Instalar con `winget` si falta algo

```powershell
winget install OpenJS.NodeJS.LTS
winget install Git.Git
winget install Microsoft.VisualStudioCode
npm install -g @angular/cli
```

Después de instalar, cerrá y abrí PowerShell. Volvé a correr las verificaciones.

### Alternativa manual si `winget` no está disponible

1. Instalá Node.js LTS desde el instalador oficial.
2. Instalá Git para Windows.
3. Instalá Visual Studio Code.
4. Abrí una nueva terminal PowerShell.
5. Instalá Angular CLI con:

```powershell
npm install -g @angular/cli
ng version
```

No instales librerías del proyecto por cuenta propia. Si un ciclo necesita una dependencia nueva, registrá el bloqueo y pedile aprobación a Marcos.

## Flujo OpenCode/Gentle-AI y SDD

Cada ciclo se trabaja de forma cerrada y revisable:

```txt
explore → propose → spec → design → tasks → apply → verify → archive → reporte final
```

Reglas:

- Un ciclo por vez.
- Si hay implementación, aplicar TDD cuando exista runner y alcance aprobado.
- Si el repositorio no tiene runner disponible, dejar evidencia de verificación manual y de build cuando corresponda.
- Cerrar siempre con `sdd-archive` para sincronizar documentación.
- No saltar de idea a código sin spec, diseño y tasks.
- No declarar terminado un ciclo sin reporte final.
- La rama Git agrupa trabajo revisable; el ciclo SDD agrupa planificación. Si varios ciclos frontend forman una misma capacidad visual o técnica, pueden compartir rama.

### Estrategia de ramas recomendada

| Rama | Ciclos incluidos | Criterio |
|---|---|---|
| `docs/matias-onboarding-windows` | `F0-01`, `F0-02`, `F0-03` | Preparación de entorno, OpenCode y lectura mínima; todo es documentación/onboarding. |
| `frontend/v0-design-system` | `F1-01`, `F1-02` | Auditoría de `muestra_pagina/` y extracción de sistema visual se revisan juntos. |
| `frontend/angular-shell` | `F1-03`, `F1-04`, `F1-05` | Marcos puede tomarla para crear fundación Angular, estilos aprobados y layout semántico mínimo. |
| `frontend/public-validation-flow` | `F2-01`, `F2-02` | Marcos puede tomarla para validar contrato público, privacidad y estados con mocks ficticios. |
| `frontend/admin-foundation` | `F2-03`, `F2-04`, `F2-05` | Login/admin shell, cursos y asistencias son base operativa administrativa. |
| `frontend/admin-certifications` | `F2-06`, `F5-01`, `F5-04`, `F6-01`, `F6-03` | Detalle administrativo de certificaciones, listado, entrega manual, revocación y auditoría son acciones críticas relacionadas. |
| `frontend/admin-students` | `F5-02`, `F5-03` | Listado y detalle de alumno comparten reglas de datos personales y visibilidad de DNI. |
| `frontend/admin-courses` | `F4-03`, `F4-04` | Listado y detalle de cursos comparten contrato, filtros, fechas y navegación. |
| `frontend/certificate-detail-pdf` | `F4-01`, `F4-02` | Detalle administrativo de certificación y vista previa PDF comparten datos permitidos, layout y permisos. |
| `frontend/admin-bulk-config` | `F6-02`, `F6-04` | Carga masiva placeholder y configuración institucional son capacidades administrativas no críticas para el flujo público. |
| `frontend/api-readiness` | `F3-01`, `F3-02`, `F3-05` | Marcos puede tomarla para servicios mock, frontera API PHP y build `/certificados/`. |
| `qa/frontend-release-readiness` | `F3-03`, `F3-04`, `F3-06` | Matías cierra tests, QA manual y handoff visual. |

No juntar flujos críticos (`PDF`, `entrega manual`, `revocación`, `auditoría`, `configuración`) con la rama pública si requieren permisos, datos personales o contratos no aprobados. No mezclar cambios backend/deploy con ramas frontend. Matías no debe abrir `frontend/public-validation-flow` ni `frontend/api-readiness` sin coordinación explícita cuando Marcos las esté usando para destrabar backend. Si una rama supera el presupuesto de revisión o mezcla permisos/datos personales con UI pública, dividir antes de `apply`.

Al cerrar una rama con `sdd-verify` PASS y `sdd-archive`, el flujo recomendado es: proponer commit/push/PR de la rama cerrada, esperar aprobación explícita para cada acción y, si Marcos todavía revisa la PR, crear o cambiar a la siguiente rama aprobada desde una fuente explícita y actualizada. Esto permite que Matías avance sin mergear ni pushear a `main` automáticamente.

### Prompt base para iniciar un ciclo con OpenCode

```txt
Trabajemos el ciclo <ID> — <nombre> del frontend Angular 20 para IFTS14.
Usá SDD completo. Primero leé AGENTS.md, docs/00-indice-general.md,
docs/opencode/optimizacion-tokens.md, el ciclo activo, docs/frontend/00-angular20-port-v0.md
y la spec OpenSpec correspondiente. No ejecutes Graphify; usá solo resúmenes aprobados por Marcos.
No toques backend, base de datos, deploy ni material_privado_no_versionar/.
No hagas commit ni push por tu cuenta. **Pre-commit safety (diff-confirmation gate)**: previo al `git add`, debés correr `git status --short` y `git diff --name-only`, presentar el resultado a Matías y esperar su confirmación de que el diff es correcto. **Pre-push safety**: previo al `git push`, si existe `origin/<rama>`, corré `git log origin/<rama>..<rama> --oneline` y `git diff origin/<rama>..<rama> --stat`; si es primer push, declaralo y compará contra la base aprobada con `git log <base>..HEAD --oneline` y `git diff <base>...HEAD --stat`; esperá confirmación. Tras `sdd-verify` PASS y `sdd-archive`, podés ejecutar `git add` + `git commit` + `git push` (a la rama de trabajo actual, nunca a `main`), abrir PR, o crear/cambiar a la siguiente rama aprobada SOLO cuando Matías lo apruebe explícitamente en el mismo turno, con el comando exacto. Para crear/cambiar rama, verificá árbol limpio y rama fuente explícita/actualizada. La única prohibición dura es `git push` directo a `main`; `git merge`, `git rebase` y merge de PR requieren aprobación explícita de Matías, comando exacto y evidencia previa. Proponé comandos Git al final.
Al cerrar, ejecutá verify y sdd-archive, y entregá reporte final con archivos,
pruebas, QA manual, documentación actualizada, bloqueos y riesgos.
```

## Uso de `muestra_pagina/`

`muestra_pagina/` es referencia visual y funcional final, no código definitivo. Contiene el export completo de v0 (Next.js/React) con capturas para todos los flujos 4-22; ya no hay pantallas pendientes de export v0.

El commit que agregue o actualice contenido v0 debe mantener el inventario de referencia coherente con la carpeta real. El `muestra_pagina/MANIFIESTO_V0.md` histórico fue retirado al reemplazar la carpeta por el export final; si se necesita un manifiesto nuevo, se regenera por SDD desde un listado seguro de la carpeta, sin leer material privado ni datos sensibles.

| Estado de `muestra_pagina/` | Acción |
|---|---|
| Sin referencia utilizable para una pantalla | No implementar pantalla final. Solo preparar estructura, documentación o reportar bloqueo. |
| Con diseño v0 utilizable | Analizar composición, jerarquía, paleta, tipografía, espaciados, estados y comportamiento. |
| Con React/Next exportado | No copiar literalmente. Portar la intención visual a Angular 20 con componentes propios. |

Checklist mínimo antes de portar una pantalla:

- [ ] Hay referencia visual suficiente.
- [ ] El inventario de `muestra_pagina/` coincide con la estructura real de la carpeta (listado seguro, sin material privado).
- [ ] Se identificaron componentes reutilizables.
- [ ] Se registraron estados: carga, éxito, vacío, error y no encontrado si aplica.
- [ ] Se respeta identidad institucional del IFTS 14.
- [ ] La implementación no depende de contratos API inventados.

### Ciclos F4-F6 (post-F3)

Los ciclos F4-F6 están definidos al final de esta misma guía. Ya no se derivan a un documento separado.

| Ciclo | Prompt | Pantalla/flujo | Sección en esta guía |
|---:|---:|---|---|
| F4-01 | 11 | Detalle de certificación | Semana 4 — F4-01 |
| F4-02 | 12 | Vista previa PDF complementario | Semana 4 — F4-02 |
| F4-03 | 13 | Listado de cursos | Semana 4 — F4-03 |
| F4-04 | 14 | Detalle de curso | Semana 4 — F4-04 |
| F5-01 | 15 | Listado de certificaciones | Semana 5 — F5-01 |
| F5-02 | 16 | Listado de alumnos | Semana 5 — F5-02 |
| F5-03 | 17 | Detalle administrativo de alumno | Semana 5 — F5-03 |
| F5-04 | 18 | Entrega manual de certificación | Semana 5 — F5-04 |
| F6-01 | 19 | Revocar certificación | Semana 6 — F6-01 |
| F6-02 | 20 | Carga masiva placeholder | Semana 6 — F6-02 |
| F6-03 | 21 | Auditoría básica | Semana 6 — F6-03 |
| F6-04 | 22 | Configuración institucional | Semana 6 — F6-04 |

No implementar estos ciclos dentro de F0-F3. Cada ciclo F4-F6 requiere spec/contrato aprobado antes de ejecutarse; si todavía no existe una spec/tarea detallada, primero expandí el ciclo con archivos a leer, validaciones, QA, límites y criterios de cierre.

## Política frontend, pruebas y QA

### Dependencias

- Usar Angular 20 y las dependencias ya aprobadas por el proyecto.
- No agregar paquetes por comodidad.
- Preferir HTML, CSS, Angular y utilidades existentes antes de sumar librerías.
- Si una dependencia parece necesaria, documentar motivo, alternativa y riesgo. No instalar sin aprobación.

### Validaciones automáticas

Usar solo comandos disponibles en el proyecto y en el ciclo aprobado. Ejemplos posibles cuando exista app Angular:

```powershell
npm test
npm run lint
npm run build
ng build --configuration production --base-href /certificados/
```

Si un comando no existe, no lo inventes como evidencia. Informá: “No hay runner/comando configurado para esta validación”.

### QA manual obligatorio

- [ ] Responsive: 360 px, 390 px, 430 px, tablet y desktop.
- [ ] Navegación por teclado y foco visible.
- [ ] Contraste y legibilidad.
- [ ] Estados de carga, vacío, error y éxito.
- [ ] Consola del navegador sin errores nuevos.
- [ ] Comparación visual contra `muestra_pagina/` cuando exista.
- [ ] No regresión visual en pantallas tocadas.
- [ ] Validación pública con DNI completo por decisión institucional (D0); logs, auditoría, errores y respuestas administrativas sin DNI completo; mocks solo con DNI ficticios; sin tokens completos ni datos sensibles reales.
- [ ] El DNI completo en validación pública aplica solo como respuesta de autenticidad (D0); no se usa DNI como input de búsqueda pública.

## Errores comunes y límites

| Error | Qué hacer |
|---|---|
| Trabajar directo en `main` | Frenar y pedir rama/ciclo aprobado. |
| Saltar SDD | Volver a spec, diseño y tasks. |
| Copiar React/Next literalmente | Extraer intención visual y reimplementar en Angular. |
| Instalar dependencias no aprobadas | Documentar necesidad y pedir decisión. |
| Inventar contrato API | Esperar o pedir contrato a Marcos. |
| Ignorar `AGENTS.md` | Leer reglas locales antes de editar. |
| Tocar `material_privado_no_versionar/` | Frenar. Solo Marcos autoriza auditoría local específica. |
| Cerrar sin pruebas/QA | Ejecutar validaciones o reportar bloqueo verificable. |
| Dejar docs desactualizadas | Completar `sdd-archive` antes del reporte final. |

## Cómo leer un ciclo

Cada ciclo F0-F3 debe ser autocontenido. No avances si falta alguno de estos campos:

| Campo | Para qué sirve |
|---|---|
| Objetivo | Resultado observable del ciclo. |
| Rama sugerida | Nombre propuesto para trabajar sin tocar `main`. |
| Leer antes | Archivos mínimos para no operar a ciegas. |
| Pedir a OpenCode | Prompt exacto o plantilla del ciclo. |
| Ejecutar/verificar | Comandos o comprobaciones del ciclo. |
| QA manual | Checklist específico de experiencia real. |
| No hacer | Límites para no agrandar ni romper alcance. |
| Archive | Documentos que deben quedar sincronizados. |
| Commit sugerido | Mensaje que OpenCode propone, sin ejecutar. |

## Plantilla de ciclo

~~~markdown
### Ciclo <ID> — <nombre>

Objetivo: <resultado observable>.
Rama sugerida: `<prefijo>/<tema>`.
Leer antes: `AGENTS.md`, `GUIA.md`, `docs/00-indice-general.md`, <rutas específicas>.

Pedir a OpenCode:
```txt
<prompt exacto del ciclo>
```

Ejecutar/verificar:
```powershell
<comandos disponibles o validaciones manuales>
```

QA manual:
- [ ] <control específico>
- [ ] <control específico>

No hacer:
- <límite del ciclo>

Archive:
- <documento a actualizar durante sdd-archive>

Commit sugerido: `<tipo>(<scope>): <resultado>`
~~~

## Reporte final por ciclo

Al terminar, Matías debe dejar este reporte para Marcos:

~~~markdown
# Reporte final — Ciclo <ID> <nombre>

## Resumen
- <qué se completó>

## Archivos tocados
- `<ruta>` — <motivo>

## Pruebas y validaciones
- <comando o validación>: <resultado>

## QA manual
- [ ] Responsive revisado
- [ ] Accesibilidad básica revisada
- [ ] Consola sin errores nuevos
- [ ] Estados principales revisados

## Documentación y archive
- <docs actualizadas o pendiente justificado>

## Bloqueos
- <si no hay, escribir “Sin bloqueos”>

## Riesgos
- <riesgo y mitigación>

## Comandos Git propuestos, no ejecutados por OpenCode
```powershell
git status --short
git add <archivos-seguros>
git commit -m "<mensaje>"
git push -u origin <rama>
```
~~~

## Semana 0 — Preparación y onboarding

### Ciclo F0-01 — Verificar entorno Windows

Objetivo: confirmar que Windows tiene las herramientas mínimas para trabajar Angular 20 sin tocar código del producto.
Rama sugerida: `docs/matias-onboarding-windows`.
Archivos a leer: `README.md`, `GUIA.md`, `AGENTS.md`, `docs/00-indice-general.md`.

Comandos si aplica:
```powershell
node --version
npm --version
git --version
code --version
ng version
```

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F0-01 — Verificar entorno Windows.
Es documentación/preparación solamente. Leé README.md, GUIA.md, AGENTS.md y docs/00-indice-general.md.
No modifiques Angular, PHP, base de datos, deploy ni material_privado_no_versionar/.
Ayudame a interpretar las versiones de Node.js, npm, Git, VS Code y Angular CLI que pego abajo.
Si falta una herramienta, proponé instalación por winget y alternativa manual, sin ejecutar comandos destructivos.
Cerrá con validaciones, bloqueos y reporte final. No hagas commit ni push por tu cuenta. **Pre-commit safety (diff-confirmation gate)**: previo al `git add`, debés correr `git status --short` y `git diff --name-only`, presentar el resultado a Matías y esperar su confirmación de que el diff es correcto. **Pre-push safety**: previo al `git push`, si existe `origin/<rama>`, corré `git log origin/<rama>..<rama> --oneline` y `git diff origin/<rama>..<rama> --stat`; si es primer push, declaralo y compará contra la base aprobada con `git log <base>..HEAD --oneline` y `git diff <base>...HEAD --stat`; esperá confirmación. Tras `sdd-verify` PASS, podés ejecutar `git add` + `git commit` + `git push` (a la rama de trabajo actual, nunca a `main`) SOLO cuando Matías lo apruebe explícitamente en el mismo turno del chat, con el mensaje y comando exactos que indique. La única prohibición dura es `git push` directo a `main`; PR, `git merge`, `git rebase` y merge de PR requieren aprobación explícita de Matías, comando exacto y evidencia previa.
```

Validaciones automáticas:
- [ ] Los comandos de versión responden sin error.
- [ ] Si `ng version` falla, queda registrado que falta Angular CLI global o que debe usarse CLI local cuando exista app.
- [ ] No se instalaron dependencias del proyecto.

QA manual:
- [ ] PowerShell nuevo reconoce las herramientas después de instalar.
- [ ] La salida no contiene credenciales ni rutas sensibles en el reporte.
- [ ] El bloqueo queda claro si una herramienta no está disponible.

Documentación a actualizar en `sdd-archive`:
- `docs/opencode/` si cambia el flujo de uso de OpenCode.
- `docs/frontend/00-angular20-port-v0.md` solo si cambia una regla frontend real.

Qué NO hacer:
- No crear app Angular.
- No instalar paquetes dentro del repositorio.
- No tocar `material_privado_no_versionar/`.

Mensaje de commit sugerido: `docs(matias): registrar verificacion de entorno windows`.

### Ciclo F0-02 — Verificar OpenCode/Gentle-AI

Objetivo: confirmar que Matías sabe iniciar OpenCode, pedir ciclos SDD y cerrar con evidencia sin delegar Git automático.
Rama sugerida: `docs/matias-onboarding-f0-02-f0-03`.
Archivos a leer: `AGENTS.md`, `GUIA.md`, `docs/00-indice-general.md`, esta guía.

Comandos si aplica:
```powershell
git status --short
```

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F0-02 — Verificar OpenCode/Gentle-AI.
Quiero validar que el flujo SDD está claro antes de tocar frontend.
Leé AGENTS.md, GUIA.md, docs/00-indice-general.md y MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md.
Explicame qué harías en explore, propose, spec, design, tasks, apply, verify y archive para un ciclo chico de documentación.
No modifiques código, no instales dependencias, no toques material_privado_no_versionar/ y no hagas commit, push, merge ni rebase por tu cuenta. Tras `sdd-verify` PASS, podés ejecutar `git add` + `git commit` + `git push` (a la rama actual, nunca a `main`) SOLO cuando Matías lo apruebe explícitamente en el mismo turno, con diff-confirmation gate, pre-push safety y comando exacto. PR, merge, rebase y cambios de rama requieren aprobación explícita, evidencia previa y árbol limpio o decisión explícita de stash/commit/abortar.
Entregá un reporte con bloqueos, validaciones y comandos Git solo propuestos.
```

Validaciones automáticas:
- [ ] `git status --short` muestra el estado antes de empezar.
- [ ] OpenCode identifica el repositorio correcto `ifts14`.
- [ ] El reporte final incluye fases SDD y no salta directo a implementación.

QA manual:
- [ ] La respuesta de OpenCode respeta las prohibiciones del repo.
- [ ] Queda claro qué acciones Git requieren aprobación explícita, evidencia previa y árbol limpio o decisión explícita de stash/commit/abortar.
- [ ] No se generó ni modificó código del producto.

Documentación a actualizar en `sdd-archive`:
- `docs/opencode/` si se ajusta el flujo operativo.
- Esta guía si aparece una instrucción recurrente que Matías necesita repetir.

Qué NO hacer:
- No pedir “implementá todo”.
- No aprobar acciones destructivas.
- No aceptar operaciones Git sin aprobación explícita, comando exacto y evidencia previa; merge/rebase requieren ese gate y `git push` directo a `main` no se acepta nunca.

Mensaje de commit sugerido: `docs(matias): documentar verificacion de opencode sdd`.

### Ciclo F0-03 — Leer documentación mínima y entender misión

Objetivo: dejar evidencia de que Matías entendió rol, alcance, fuentes de verdad y límites antes del trabajo frontend.
Rama sugerida: `docs/matias-onboarding-f0-03`.
Archivos a leer: `README.md`, `GUIA.md`, `AGENTS.md`, `docs/00-indice-general.md`, `docs/frontend/00-angular20-port-v0.md`, `apps/frontend-angular/AGENTS.md`.

Comandos si aplica:
```powershell
git status --short
```

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F0-03 — Leer documentación mínima y entender misión.
Leé README.md, GUIA.md, AGENTS.md, docs/00-indice-general.md, docs/frontend/00-angular20-port-v0.md
y apps/frontend-angular/AGENTS.md.
Devolveme un resumen operativo para Matías: misión, alcance permitido, fuera de alcance, fuentes de verdad,
qué hacer si muestra_pagina/ no aporta referencia utilizable y qué evidencia debo dejar al cerrar cada ciclo.
No modifiques código ni documentación salvo que te pida explícitamente una corrección documental.
No hagas commit ni push por tu cuenta. **Pre-commit safety (diff-confirmation gate)**: previo al `git add`, debés correr `git status --short` y `git diff --name-only`, presentar el resultado a Matías y esperar su confirmación de que el diff es correcto. **Pre-push safety**: previo al `git push`, si existe `origin/<rama>`, corré `git log origin/<rama>..<rama> --oneline` y `git diff origin/<rama>..<rama> --stat`; si es primer push, declaralo y compará contra la base aprobada con `git log <base>..HEAD --oneline` y `git diff <base>...HEAD --stat`; esperá confirmación. Tras `sdd-verify` PASS, podés ejecutar `git add` + `git commit` + `git push` (a la rama de trabajo actual, nunca a `main`) SOLO cuando Matías lo apruebe explícitamente en el mismo turno del chat, con el mensaje y comando exactos que indique. La única prohibición dura es `git push` directo a `main`; PR, `git merge`, `git rebase` y merge de PR requieren aprobación explícita de Matías, comando exacto y evidencia previa.
```

Validaciones automáticas:
- [ ] `git status --short` fue revisado antes y después si hubo cambios documentales.
- [ ] El resumen cita las fuentes leídas.
- [ ] No hay comandos de instalación ni build en este ciclo.

QA manual:
- [ ] Matías puede explicar qué le corresponde y qué no.
- [ ] Queda claro que `muestra_pagina/` bloquea UI final si no aporta referencia utilizable.
- [ ] El reporte no duplica documentación extensa; enlaza fuentes.

Documentación a actualizar en `sdd-archive`:
- Esta guía si faltaba una aclaración mínima.
- `docs/00-indice-general.md` solo si cambió la ruta de lectura vigente.

Qué NO hacer:
- No empezar scaffolding Angular.
- No inventar contrato API.
- No resumir material privado ni abrirlo.

Mensaje de commit sugerido: `docs(matias): registrar onboarding frontend`.

## Semana 1 — Base visual y estructura Angular

### Ciclo F1-01 — Auditar `muestra_pagina/`

Objetivo: confirmar la referencia visual v0 final y completa en `muestra_pagina/` para todos los flujos 4-22 y registrar el inventario seguro de pantallas, componentes y capturas.
Rama sugerida: `frontend/v0-design-system`.
Archivos a leer: `AGENTS.md`, `GUIA.md`, `docs/frontend/00-angular20-port-v0.md` y archivos visibles dentro de `muestra_pagina/` sin abrir material sensible externo.

Comandos si aplica:
```powershell
git status --short
Get-ChildItem .\muestra_pagina -Force
```

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F1-01 — Auditar muestra_pagina/.
Leé AGENTS.md, GUIA.md y docs/frontend/00-angular20-port-v0.md.
Revisá solo la estructura segura de muestra_pagina/ y confirmá el inventario de la referencia v0 final (app/, components/, capturas/, public/, prompts_stitch_v0_ifts14.md).
Listá pantallas, componentes, estados visibles, riesgos y próximos pasos para portar a Angular 20.
Los flujos 11-22 ya tienen referencia v0 disponible y se ejecutan con los ciclos F4-F6 definidos en esta misma guía; no hace falta derivar a un documento separado.
No copies React/Next literalmente, no instales dependencias y no toques backend, base, deploy ni material_privado_no_versionar/.
```

Validaciones automáticas:
- [ ] `Get-ChildItem .\muestra_pagina -Force` lista únicamente nombres y estructura segura.
- [ ] El reporte confirma el inventario de pantallas y componentes de la referencia v0 final.
- [ ] El inventario se arma desde un listado seguro de la carpeta, sin leer material privado.
- [ ] No se modifica código Angular en este ciclo si no hay referencia aprobada.

QA manual:
- [ ] La auditoría distingue diseño visual de código fuente exportado.
- [ ] Se registran pantallas y estados si existen.
- [ ] Los flujos 11-22 quedan asignados a los ciclos F4-F6 de esta misma guía.

Documentación a actualizar en `sdd-archive`:
- `docs/frontend/00-angular20-port-v0.md` con hallazgos resumidos si hay diseño utilizable.
- Esta guía solo si cambia la regla de bloqueo.

Qué NO hacer:
- No copiar componentes React/Next.
- No crear pantallas finales sin diseño utilizable.
- No guardar builds pesados ni dependencias en `muestra_pagina/`.

Mensaje de commit sugerido: `docs(frontend): registrar auditoria de muestra pagina`.

### Ciclo F1-02 — Extraer sistema visual desde v0

Objetivo: convertir la referencia v0 disponible en criterios visuales portables: composición, paleta, tipografía, espaciado, componentes y estados.
Rama sugerida: `frontend/v0-design-system`.
Archivos a leer: `docs/frontend/00-angular20-port-v0.md`, hallazgos del ciclo F1-01 y archivos de diseño disponibles en `muestra_pagina/`.

Comandos si aplica:
```powershell
git status --short
```

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F1-02 — Extraer sistema visual desde v0.
Usá los hallazgos de F1-01 y leé docs/frontend/00-angular20-port-v0.md.
Usá la referencia v0 final de muestra_pagina/ para todos los flujos 4-22. Extraé sistema visual: paleta, tipografía observada, espaciados, layout, componentes, estados, responsive y accesibilidad.
Proponé cómo documentarlo para Angular 20 sin copiar React/Next literalmente y sin instalar dependencias.
No modifiques backend, base, deploy ni material_privado_no_versionar/.
```

Validaciones automáticas:
- [ ] `git status --short` revisado antes de cambios documentales.
- [ ] Si hay tokens, quedan trazados a evidencia visual de `muestra_pagina/`.
- [ ] No se agregan dependencias ni archivos generados pesados.

QA manual:
- [ ] Los tokens no son genéricos ni inventados.
- [ ] Hay criterios responsive y accesibles.
- [ ] Los estados de carga, error, vacío y éxito quedan identificados si aplican.

Documentación a actualizar en `sdd-archive`:
- `docs/frontend/00-angular20-port-v0.md` con resumen de sistema visual o bloqueo.
- `docs/00-indice-general.md` solo si se agrega una nueva referencia vigente.

Qué NO hacer:
- No transformar la guía en manual completo de diseño.
- No copiar CSS/JS de v0 sin adaptación.
- No decidir dependencias visuales sin aprobación.

Mensaje de commit sugerido: `docs(frontend): documentar sistema visual v0`.

### Ciclo F1-03 — Crear app Angular 20

Objetivo: crear la base Angular 20 en `apps/frontend-angular/` solo si el ciclo SDD lo aprueba y la carpeta no contiene una app existente.
Rama sugerida: `frontend/angular-shell`.
Archivos a leer: `AGENTS.md`, `apps/frontend-angular/AGENTS.md`, `docs/frontend/00-angular20-port-v0.md`, spec OpenSpec del ciclo activo.

Comandos si aplica:
```powershell
git status --short
ng version
ng new frontend-angular --directory apps/frontend-angular --routing --style=css --skip-git
cd apps/frontend-angular
npm test
npm run build
```

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F1-03 — Crear app Angular 20.
Usá SDD completo y leé AGENTS.md, apps/frontend-angular/AGENTS.md, docs/frontend/00-angular20-port-v0.md y la spec del ciclo.
Primero verificá si apps/frontend-angular/ ya tiene una app. Si existe, no la recrees.
Si no existe y el plan lo aprueba, proponé crear Angular 20 con routing, CSS y --skip-git bajo apps/frontend-angular/.
No implementes pantallas finales si muestra_pagina/ no tiene diseño utilizable.
No toques backend, base de datos, deploy ni material_privado_no_versionar/. No hagas commit ni push por tu cuenta. **Pre-commit safety (diff-confirmation gate)**: previo al `git add`, debés correr `git status --short` y `git diff --name-only`, presentar el resultado a Matías y esperar su confirmación de que el diff es correcto. **Pre-push safety**: previo al `git push`, si existe `origin/<rama>`, corré `git log origin/<rama>..<rama> --oneline` y `git diff origin/<rama>..<rama> --stat`; si es primer push, declaralo y compará contra la base aprobada con `git log <base>..HEAD --oneline` y `git diff <base>...HEAD --stat`; esperá confirmación. Tras `sdd-verify` PASS, podés ejecutar `git add` + `git commit` + `git push` (a la rama de trabajo actual, nunca a `main`) SOLO cuando Matías lo apruebe explícitamente en el mismo turno del chat, con el mensaje y comando exactos que indique. La única prohibición dura es `git push` directo a `main`; PR, `git merge`, `git rebase` y merge de PR requieren aprobación explícita de Matías, comando exacto y evidencia previa.
Cerrá con build/pruebas disponibles, QA manual y sdd-archive.
```

Validaciones automáticas:
- [ ] `ng version` confirma CLI disponible.
- [ ] Si se crea la app, `npm test` se ejecuta o se reporta claramente si el runner no existe/no aplica.
- [ ] `npm run build` se ejecuta desde `apps/frontend-angular/` o se reporta bloqueo verificable.

QA manual:
- [ ] La app base levanta sin errores si se prueba localmente.
- [ ] No hay pantalla final inventada.
- [ ] La estructura respeta `apps/frontend-angular/AGENTS.md`.

Documentación a actualizar en `sdd-archive`:
- `docs/frontend/00-angular20-port-v0.md` con estado real de la app.
- `docs/00-indice-general.md` solo si cambia la ruta documental.

Qué NO hacer:
- No recrear una app existente.
- No usar `--skip-tests` por comodidad.
- No hacer commit automático aunque `ng new` genere muchos archivos.

Mensaje de commit sugerido: `feat(frontend): crear base angular 20`.

### Ciclo F1-04 — Configurar Tailwind

Objetivo: configurar Tailwind en Angular solo si el diseño y el ciclo SDD lo aprueban como sistema visual del frontend.
Rama sugerida: `frontend/angular-shell`.
Archivos a leer: `apps/frontend-angular/AGENTS.md`, `docs/frontend/00-angular20-port-v0.md`, hallazgos F1-02, `apps/frontend-angular/package.json` si existe.

Comandos si aplica:
```powershell
git status --short
cd apps/frontend-angular
npm install tailwindcss @tailwindcss/postcss postcss
New-Item -ItemType File -Path .postcssrc.json -ErrorAction SilentlyContinue
npm run build
```

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F1-04 — Configurar Tailwind.
Usá SDD completo. Leé apps/frontend-angular/AGENTS.md, docs/frontend/00-angular20-port-v0.md, hallazgos de F1-02 y package.json si existe.
Antes de instalar, verificá si Tailwind ya está configurado. Si no está, justificá la dependencia contra el sistema visual aprobado.
Usá la guía oficial de Angular 20 para Tailwind: instalar tailwindcss, @tailwindcss/postcss y postcss, configurar .postcssrc.json e importar Tailwind en src/styles.css.
No agregues librerías extra, no toques backend/base/deploy/material_privado_no_versionar/ y no hagas commit, push, merge ni rebase por tu cuenta. Tras `sdd-verify` PASS, podés ejecutar `git add` + `git commit` + `git push` (a la rama actual, nunca a `main`) SOLO cuando Matías lo apruebe explícitamente en el mismo turno, con diff-confirmation gate, pre-push safety y comando exacto. PR, merge, rebase y cambios de rama requieren aprobación explícita, evidencia previa y árbol limpio o decisión explícita de stash/commit/abortar.
Cerrá con build, QA manual y sdd-archive.
```

Validaciones automáticas:
- [ ] `package.json` contiene solo dependencias aprobadas.
- [ ] `.postcssrc.json` usa `@tailwindcss/postcss` si se configura Tailwind.
- [ ] `src/styles.css` importa `tailwindcss` si corresponde.
- [ ] `npm run build` pasa o queda bloqueo verificable.

QA manual:
- [ ] No se agregó Tailwind si no había aprobación del ciclo.
- [ ] Los estilos base no rompen legibilidad ni foco visible.
- [ ] La configuración no introduce UI genérica ni clases sin criterio visual.

Documentación a actualizar en `sdd-archive`:
- `docs/frontend/00-angular20-port-v0.md` con decisión Tailwind y comandos reales usados.
- `docs/00-indice-general.md` solo si se agrega una nueva doc frontend vigente.

Qué NO hacer:
- No instalar paquetes visuales adicionales.
- No migrar toda la UI en este ciclo.
- No ocultar cambios de lockfile si se instala una dependencia aprobada.

Mensaje de commit sugerido: `build(frontend): configurar tailwind en angular`.

### Ciclo F1-05 — Crear layout base público/admin

Objetivo: preparar una estructura mínima de layout público/admin sin implementar pantallas finales ni lógica de negocio.
Rama sugerida: `frontend/angular-shell`.
Archivos a leer: `apps/frontend-angular/AGENTS.md`, `docs/frontend/00-angular20-port-v0.md`, hallazgos F1-01/F1-02, spec del ciclo activo.

Comandos si aplica:
```powershell
git status --short
cd apps/frontend-angular
npm test
npm run build
```

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F1-05 — Crear layout base público/admin.
Usá SDD completo y leé apps/frontend-angular/AGENTS.md, docs/frontend/00-angular20-port-v0.md, hallazgos F1-01/F1-02 y la spec del ciclo.
Implementá solo layout base y estructura por features para público/admin si la app Angular ya existe.
No implementes pantallas finales ni inventes contratos API; si muestra_pagina/ está vacía, dejá placeholders estructurales mínimos y reportá el bloqueo visual.
Priorizá accesibilidad, responsive y foco visible. No agregues dependencias nuevas.
No toques backend, base, deploy ni material_privado_no_versionar/. No hagas commit ni push por tu cuenta. **Pre-commit safety (diff-confirmation gate)**: previo al `git add`, debés correr `git status --short` y `git diff --name-only`, presentar el resultado a Matías y esperar su confirmación de que el diff es correcto. **Pre-push safety**: previo al `git push`, si existe `origin/<rama>`, corré `git log origin/<rama>..<rama> --oneline` y `git diff origin/<rama>..<rama> --stat`; si es primer push, declaralo y compará contra la base aprobada con `git log <base>..HEAD --oneline` y `git diff <base>...HEAD --stat`; esperá confirmación. Tras `sdd-verify` PASS, podés ejecutar `git add` + `git commit` + `git push` (a la rama de trabajo actual, nunca a `main`) SOLO cuando Matías lo apruebe explícitamente en el mismo turno del chat, con el mensaje y comando exactos que indique. La única prohibición dura es `git push` directo a `main`; PR, `git merge`, `git rebase` y merge de PR requieren aprobación explícita de Matías, comando exacto y evidencia previa.
Cerrá con pruebas/build disponibles, QA manual, sdd-archive y reporte final.
```

Validaciones automáticas:
- [ ] `npm test` pasa o se reporta que no hay runner disponible.
- [ ] `npm run build` pasa o queda bloqueo verificable.
- [ ] No hay dependencias nuevas.
- [ ] La estructura queda bajo `apps/frontend-angular/`.

QA manual:
- [ ] Navegación por teclado y foco visible en layout base.
- [ ] Responsive básico en móvil, tablet y desktop.
- [ ] Consola del navegador sin errores nuevos si se levanta localmente.
- [ ] Placeholders no simulan datos reales ni certificados válidos.

Documentación a actualizar en `sdd-archive`:
- `docs/frontend/00-angular20-port-v0.md` con estructura creada y límites.
- `docs/00-indice-general.md` solo si cambia la ruta frontend vigente.

Qué NO hacer:
- No crear flujo de validación real sin contrato API.
- No exponer DNI completo fuera de la validación pública (D0); logs, auditoría, errores y respuestas administrativas sin DNI completo; sin tokens ni datos sensibles reales.
- No convertir placeholders en pantallas finales sin diseño aprobado.

Mensaje de commit sugerido: `feat(frontend): crear layout base publico admin`.

## Troubleshooting F0-F1

| Problema | Acción segura |
|---|---|
| `node` o `npm` no se reconoce | Instalar Node.js LTS, cerrar PowerShell, abrir una terminal nueva y repetir `node --version` / `npm --version`. |
| `ng` no se reconoce | Instalar Angular CLI con `npm install -g @angular/cli` o usar CLI local cuando exista app. Validar con `ng version`. |
| `git status` muestra muchos cambios inesperados | Frenar. No commitear. Pedir revisión a Marcos con lista de archivos. |
| `muestra_pagina/` no coincide con el inventario | Frenar, actualizar `docs/frontend/00-angular20-port-v0.md` mediante SDD y no portar pantallas dudosas. |
| Hay que seguir con flujos 11-22 | Usar los ciclos F4-F6 definidos al final de esta misma guía; no abrir una guía separada. |
| Tailwind no está aprobado | No instalar. Documentar necesidad, alternativas y esperar decisión. |
| `npm test` o `npm run build` no existe | No inventar evidencia. Reportar comando ausente y validar con el menor chequeo disponible. |

## Semana 2 — Features del módulo `/certificados/`

### Ciclo F2-01 — Pantalla pública de validación válida

Objetivo: implementar o preparar la pantalla pública que muestra una certificación válida, usando datos mock si todavía no existe API integrada.
Rama sugerida: `frontend/public-validation-flow`.
Archivos a leer: `AGENTS.md`, `apps/frontend-angular/AGENTS.md`, `docs/frontend/00-angular20-port-v0.md`, `docs/backend/01-contrato-api-certificados.md`, hallazgos F1-01/F1-02 y spec del ciclo activo.

Comandos si aplica:
```powershell
git status --short
cd apps/frontend-angular
npm test
npm run build
```

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F2-01 — Pantalla pública de validación válida.
Usá SDD completo. Leé AGENTS.md, apps/frontend-angular/AGENTS.md, docs/frontend/00-angular20-port-v0.md,
docs/backend/01-contrato-api-certificados.md, hallazgos F1-01/F1-02 y la spec del ciclo.
Implementá solo la pantalla pública para un caso válido con datos mock o contrato documentado.
No inventes endpoints, no consultes backend real si no está aprobado y mostrá DNI completo solo en la validación pública (D0); sin token completo en UI, logs ni consola.
Si muestra_pagina/ no tiene diseño utilizable, usá una estructura accesible mínima y reportá el bloqueo visual.
No toques PHP, base de datos, deploy ni material_privado_no_versionar/. No hagas commit ni push por tu cuenta. **Pre-commit safety (diff-confirmation gate)**: previo al `git add`, debés correr `git status --short` y `git diff --name-only`, presentar el resultado a Matías y esperar su confirmación de que el diff es correcto. **Pre-push safety**: previo al `git push`, si existe `origin/<rama>`, corré `git log origin/<rama>..<rama> --oneline` y `git diff origin/<rama>..<rama> --stat`; si es primer push, declaralo y compará contra la base aprobada con `git log <base>..HEAD --oneline` y `git diff <base>...HEAD --stat`; esperá confirmación. Tras `sdd-verify` PASS, podés ejecutar `git add` + `git commit` + `git push` (a la rama de trabajo actual, nunca a `main`) SOLO cuando Matías lo apruebe explícitamente en el mismo turno del chat, con el mensaje y comando exactos que indique. La única prohibición dura es `git push` directo a `main`; PR, `git merge`, `git rebase` y merge de PR requieren aprobación explícita de Matías, comando exacto y evidencia previa.
Cerrá con tests/build disponibles, QA manual, sdd-archive y reporte final.
```

Validaciones automáticas:
- [ ] `npm test` pasa o se reporta que no hay runner disponible.
- [ ] `npm run build` pasa o queda bloqueo verificable.
- [ ] La pantalla no depende de un endpoint no documentado.
- [ ] La validación pública muestra DNI completo (D0); logs, auditoría, errores y respuestas administrativas no exponen DNI completo; sin token completo ni datos sensibles reales.

QA manual:
- [ ] La ruta pública de validación muestra estado válido con jerarquía clara.
- [ ] Responsive revisado en 360 px, 390 px, 430 px, tablet y desktop.
- [ ] Navegación por teclado y foco visible.
- [ ] Contraste, legibilidad y texto institucional revisados.
- [ ] Consola sin errores nuevos.

Documentación a actualizar en `sdd-archive`:
- `docs/frontend/00-angular20-port-v0.md` con pantalla, componentes, mocks y límites.
- `docs/backend/01-contrato-api-certificados.md` solo si Marcos actualizó el contrato y corresponde enlazarlo.

Qué NO hacer:
- No crear contrato API nuevo desde frontend.
- No agregar dependencias visuales o de QR sin aprobación.
- No simular datos reales de alumnos o certificados.

Mensaje de commit sugerido: `feat(frontend): mostrar validacion publica valida`.

### Ciclo F2-02 — Estados revocada/no encontrada/error

Objetivo: cubrir estados no válidos de la validación pública: revocada, no encontrada y error técnico, sin confundirlos visualmente.
Rama sugerida: `frontend/public-validation-flow`.
Archivos a leer: `apps/frontend-angular/AGENTS.md`, `docs/frontend/00-angular20-port-v0.md`, `docs/backend/01-contrato-api-certificados.md`, implementación de F2-01 y spec del ciclo activo.

Comandos si aplica:
```powershell
git status --short
cd apps/frontend-angular
npm test
npm run build
```

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F2-02 — Estados revocada/no encontrada/error.
Usá SDD completo. Leé apps/frontend-angular/AGENTS.md, docs/frontend/00-angular20-port-v0.md,
docs/backend/01-contrato-api-certificados.md, lo hecho en F2-01 y la spec del ciclo.
Implementá estados públicos diferenciados para certificación revocada, certificación no encontrada y error técnico.
Tratá 404/CERTIFICATE_NOT_FOUND como certificado no verificable, no como error de sistema.
No inventes backend, no expongas DNI completo fuera de la validación pública (D0) ni token completo en UI, y no agregues dependencias.
No toques PHP, base, deploy ni material_privado_no_versionar/. No hagas commit ni push por tu cuenta. **Pre-commit safety (diff-confirmation gate)**: previo al `git add`, debés correr `git status --short` y `git diff --name-only`, presentar el resultado a Matías y esperar su confirmación de que el diff es correcto. **Pre-push safety**: previo al `git push`, si existe `origin/<rama>`, corré `git log origin/<rama>..<rama> --oneline` y `git diff origin/<rama>..<rama> --stat`; si es primer push, declaralo y compará contra la base aprobada con `git log <base>..HEAD --oneline` y `git diff <base>...HEAD --stat`; esperá confirmación. Tras `sdd-verify` PASS, podés ejecutar `git add` + `git commit` + `git push` (a la rama de trabajo actual, nunca a `main`) SOLO cuando Matías lo apruebe explícitamente en el mismo turno del chat, con el mensaje y comando exactos que indique. La única prohibición dura es `git push` directo a `main`; PR, `git merge`, `git rebase` y merge de PR requieren aprobación explícita de Matías, comando exacto y evidencia previa.
```

Validaciones automáticas:
- [ ] `npm test` pasa o se reporta ausencia de runner.
- [ ] `npm run build` pasa o queda bloqueo verificable.
- [ ] Cada estado se puede reproducir con mock/fixture documentado.
- [ ] El estado no encontrado no se muestra como crash ni error técnico.

QA manual:
- [ ] Estado revocada comunica invalidez sin lenguaje ambiguo.
- [ ] Estado no encontrada indica certificado no verificable.
- [ ] Estado error técnico sugiere reintentar sin culpar al usuario.
- [ ] Responsive, foco visible, contraste y consola revisados.

Documentación a actualizar en `sdd-archive`:
- `docs/frontend/00-angular20-port-v0.md` con estados implementados y fuente de mocks.
- `docs/backend/01-contrato-api-certificados.md` si cambió el mapeo de errores documentado por Marcos.

Qué NO hacer:
- No mostrar mensajes técnicos crudos al público.
- No registrar tokens completos en consola.
- No mezclar revocada, no encontrada y error en un único estado genérico.

Mensaje de commit sugerido: `feat(frontend): cubrir estados de validacion publica`.

### Ciclo F2-03 — Login/admin shell

Objetivo: crear el shell administrativo y un login visual mínimo para preparar flujos internos, sin implementar autenticación real si backend no existe.
Rama sugerida: `frontend/admin-foundation`.
Archivos a leer: `apps/frontend-angular/AGENTS.md`, `docs/frontend/00-angular20-port-v0.md`, `docs/backend/01-contrato-api-certificados.md`, hallazgos F1-02 y spec del ciclo activo.

Comandos si aplica:
```powershell
git status --short
cd apps/frontend-angular
npm test
npm run build
```

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F2-03 — Login/admin shell.
Usá SDD completo. Leé apps/frontend-angular/AGENTS.md, docs/frontend/00-angular20-port-v0.md,
docs/backend/01-contrato-api-certificados.md, hallazgos F1-02 y la spec del ciclo.
Prepará shell administrativo y pantalla de login visual mínima, sin autenticación real si no hay contrato aprobado.
Dejá claro qué es mock/placeholder y qué falta para conectar con backend PHP.
No guardes credenciales, no agregues librerías de auth y no implementes seguridad falsa.
No toques PHP, base, deploy ni material_privado_no_versionar/. No hagas commit ni push por tu cuenta. **Pre-commit safety (diff-confirmation gate)**: previo al `git add`, debés correr `git status --short` y `git diff --name-only`, presentar el resultado a Matías y esperar su confirmación de que el diff es correcto. **Pre-push safety**: previo al `git push`, si existe `origin/<rama>`, corré `git log origin/<rama>..<rama> --oneline` y `git diff origin/<rama>..<rama> --stat`; si es primer push, declaralo y compará contra la base aprobada con `git log <base>..HEAD --oneline` y `git diff <base>...HEAD --stat`; esperá confirmación. Tras `sdd-verify` PASS, podés ejecutar `git add` + `git commit` + `git push` (a la rama de trabajo actual, nunca a `main`) SOLO cuando Matías lo apruebe explícitamente en el mismo turno del chat, con el mensaje y comando exactos que indique. La única prohibición dura es `git push` directo a `main`; PR, `git merge`, `git rebase` y merge de PR requieren aprobación explícita de Matías, comando exacto y evidencia previa.
```

Validaciones automáticas:
- [ ] `npm test` pasa o se reporta ausencia de runner.
- [ ] `npm run build` pasa o queda bloqueo verificable.
- [ ] No hay credenciales hardcodeadas ni tokens falsos persistidos.
- [ ] El shell queda bajo estructura frontend por features.

QA manual:
- [ ] Login y shell son navegables por teclado.
- [ ] Estados de foco, error visual y carga placeholder son claros.
- [ ] Responsive móvil/tablet/desktop revisado.
- [ ] La UI no promete autenticación real si no existe.

Documentación a actualizar en `sdd-archive`:
- `docs/frontend/00-angular20-port-v0.md` con rutas/shell creados y límites.
- `docs/backend/01-contrato-api-certificados.md` solo si Marcos documentó contrato de auth.

Qué NO hacer:
- No implementar login real sin contrato backend.
- No instalar paquetes de autenticación por anticipado.
- No hardcodear usuarios, claves ni tokens.

Mensaje de commit sugerido: `feat(frontend): preparar shell administrativo`.

### Ciclo F2-04 — Cursos y fechas

Objetivo: preparar vistas o componentes administrativos para cursos y fechas usando modelos/mocks de frontend hasta que exista integración real.
Rama sugerida: `frontend/admin-foundation`.
Archivos a leer: `apps/frontend-angular/AGENTS.md`, `docs/frontend/00-angular20-port-v0.md`, documentación backend disponible, F2-03 y spec del ciclo activo.

Comandos si aplica:
```powershell
git status --short
cd apps/frontend-angular
npm test
npm run build
```

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F2-04 — Cursos y fechas.
Usá SDD completo. Leé apps/frontend-angular/AGENTS.md, docs/frontend/00-angular20-port-v0.md,
documentación backend disponible, lo hecho en F2-03 y la spec del ciclo.
Prepará UI administrativa para listar o cargar cursos y fechas con modelos/mocks explícitos de frontend.
No conectes API real ni inventes campos fuera del contrato documentado. Marcá todo mock como temporal.
No toques PHP, base, deploy ni material_privado_no_versionar/. No hagas commit ni push por tu cuenta. **Pre-commit safety (diff-confirmation gate)**: previo al `git add`, debés correr `git status --short` y `git diff --name-only`, presentar el resultado a Matías y esperar su confirmación de que el diff es correcto. **Pre-push safety**: previo al `git push`, si existe `origin/<rama>`, corré `git log origin/<rama>..<rama> --oneline` y `git diff origin/<rama>..<rama> --stat`; si es primer push, declaralo y compará contra la base aprobada con `git log <base>..HEAD --oneline` y `git diff <base>...HEAD --stat`; esperá confirmación. Tras `sdd-verify` PASS, podés ejecutar `git add` + `git commit` + `git push` (a la rama de trabajo actual, nunca a `main`) SOLO cuando Matías lo apruebe explícitamente en el mismo turno del chat, con el mensaje y comando exactos que indique. La única prohibición dura es `git push` directo a `main`; PR, `git merge`, `git rebase` y merge de PR requieren aprobación explícita de Matías, comando exacto y evidencia previa.
```

Validaciones automáticas:
- [ ] `npm test` pasa o se reporta ausencia de runner.
- [ ] `npm run build` pasa o queda bloqueo verificable.
- [ ] Modelos/mocks quedan identificados como temporales.
- [ ] No se agregan dependencias nuevas.

QA manual:
- [ ] Lista/formulario de cursos y fechas es usable con teclado.
- [ ] Estados vacío, carga, error y éxito están previstos.
- [ ] Responsive revisado en móvil, tablet y desktop.
- [ ] No hay datos reales ni referencias a material privado.

Documentación a actualizar en `sdd-archive`:
- `docs/frontend/00-angular20-port-v0.md` con componentes administrativos y mocks.
- Documentación backend solo si Marcos define contrato nuevo.

Qué NO hacer:
- No diseñar base de datos desde frontend.
- No guardar datos persistentes reales en el navegador.
- No crear endpoints PHP.

Mensaje de commit sugerido: `feat(frontend): preparar cursos y fechas`.

### Ciclo F2-05 — Asistencias presentes

Objetivo: preparar la UI para registrar o revisar asistencias presentes de un curso, sin persistencia real hasta que backend lo habilite.
Rama sugerida: `frontend/admin-foundation`.
Archivos a leer: `apps/frontend-angular/AGENTS.md`, `docs/frontend/00-angular20-port-v0.md`, documentación backend disponible, F2-04 y spec del ciclo activo.

Comandos si aplica:
```powershell
git status --short
cd apps/frontend-angular
npm test
npm run build
```

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F2-05 — Asistencias presentes.
Usá SDD completo. Leé apps/frontend-angular/AGENTS.md, docs/frontend/00-angular20-port-v0.md,
documentación backend disponible, lo hecho en F2-04 y la spec del ciclo.
Prepará UI para marcar o revisar asistencias presentes con datos mock explícitos.
No persistas datos reales, no inventes API y no muestres DNI completo salvo que una spec privada o administrativa lo apruebe.
No toques PHP, base, deploy ni material_privado_no_versionar/. No hagas commit ni push por tu cuenta. **Pre-commit safety (diff-confirmation gate)**: previo al `git add`, debés correr `git status --short` y `git diff --name-only`, presentar el resultado a Matías y esperar su confirmación de que el diff es correcto. **Pre-push safety**: previo al `git push`, si existe `origin/<rama>`, corré `git log origin/<rama>..<rama> --oneline` y `git diff origin/<rama>..<rama> --stat`; si es primer push, declaralo y compará contra la base aprobada con `git log <base>..HEAD --oneline` y `git diff <base>...HEAD --stat`; esperá confirmación. Tras `sdd-verify` PASS, podés ejecutar `git add` + `git commit` + `git push` (a la rama de trabajo actual, nunca a `main`) SOLO cuando Matías lo apruebe explícitamente en el mismo turno del chat, con el mensaje y comando exactos que indique. La única prohibición dura es `git push` directo a `main`; PR, `git merge`, `git rebase` y merge de PR requieren aprobación explícita de Matías, comando exacto y evidencia previa.
```

Validaciones automáticas:
- [ ] `npm test` pasa o se reporta ausencia de runner.
- [ ] `npm run build` pasa o queda bloqueo verificable.
- [ ] La UI no persiste datos reales.
- [ ] No hay datos sensibles reales en mocks; DNI completo solo si una spec administrativa lo exige.

QA manual:
- [ ] Marcar/desmarcar presente es claro y accesible.
- [ ] Estados vacío/carga/error quedan cubiertos.
- [ ] Tabla o lista funciona en móvil sin perder legibilidad.
- [ ] Consola sin errores nuevos.

Documentación a actualizar en `sdd-archive`:
- `docs/frontend/00-angular20-port-v0.md` con patrón de asistencias y límites.
- Documentación backend solo si Marcos define contrato.

Qué NO hacer:
- No procesar asistencia real.
- No crear almacenamiento local como solución final.
- No inferir reglas de negocio no documentadas.

Mensaje de commit sugerido: `feat(frontend): preparar asistencias presentes`.

### Ciclo F2-06 — Certificaciones

Objetivo: preparar la UI administrativa para emitir o listar certificaciones, dejando explícita la frontera con PDF, QR y backend real.
Rama sugerida: `frontend/admin-certifications`.
Archivos a leer: `apps/frontend-angular/AGENTS.md`, `docs/frontend/00-angular20-port-v0.md`, `docs/backend/01-contrato-api-certificados.md`, F2-04/F2-05 y spec del ciclo activo.

Comandos si aplica:
```powershell
git status --short
cd apps/frontend-angular
npm test
npm run build
```

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F2-06 — Certificaciones.
Usá SDD completo. Leé apps/frontend-angular/AGENTS.md, docs/frontend/00-angular20-port-v0.md,
docs/backend/01-contrato-api-certificados.md, lo hecho en F2-04/F2-05 y la spec del ciclo.
Prepará UI administrativa para listar/previsualizar certificaciones con mocks explícitos.
No generes PDF real, no generes QR real y no inventes emisión backend si no está aprobada.
No expongas DNI completo en pantallas públicas ni token completo. No toques PHP, base, deploy ni material_privado_no_versionar/.
No hagas commit ni push por tu cuenta. **Pre-commit safety (diff-confirmation gate)**: previo al `git add`, debés correr `git status --short` y `git diff --name-only`, presentar el resultado a Matías y esperar su confirmación de que el diff es correcto. **Pre-push safety**: previo al `git push`, si existe `origin/<rama>`, corré `git log origin/<rama>..<rama> --oneline` y `git diff origin/<rama>..<rama> --stat`; si es primer push, declaralo y compará contra la base aprobada con `git log <base>..HEAD --oneline` y `git diff <base>...HEAD --stat`; esperá confirmación. Tras `sdd-verify` PASS, podés ejecutar `git add` + `git commit` + `git push` (a la rama de trabajo actual, nunca a `main`) SOLO cuando Matías lo apruebe explícitamente en el mismo turno del chat, con el mensaje y comando exactos que indique. La única prohibición dura es `git push` directo a `main`; PR, `git merge`, `git rebase` y merge de PR requieren aprobación explícita de Matías, comando exacto y evidencia previa.
```

Validaciones automáticas:
- [ ] `npm test` pasa o se reporta ausencia de runner.
- [ ] `npm run build` pasa o queda bloqueo verificable.
- [ ] No hay generación real de PDF/QR sin contrato aprobado.
- [ ] Mocks no contienen datos sensibles reales.

QA manual:
- [ ] Lista/previsualización comunica claramente estado y acciones disponibles.
- [ ] Se distinguen acciones habilitadas de placeholders.
- [ ] Responsive, teclado, foco visible y contraste revisados.
- [ ] Consola sin errores nuevos.

Documentación a actualizar en `sdd-archive`:
- `docs/frontend/00-angular20-port-v0.md` con UI de certificaciones y pendientes de integración.
- `docs/backend/01-contrato-api-certificados.md` solo si cambió contrato documentado.

Qué NO hacer:
- No emitir certificaciones reales.
- No prometer QR/PDF funcional si no existe backend.
- No decidir reglas administrativas no documentadas.

Mensaje de commit sugerido: `feat(frontend): preparar certificaciones admin`.

## Semana 3 — Integración futura, QA, build y entrega

### Ciclo F3-01 — Servicios mock y contratos frontend

Objetivo: ordenar servicios, modelos y mocks del frontend para que la UI no dependa de datos hardcodeados en componentes.
Rama sugerida: `frontend/api-readiness`.
Archivos a leer: `apps/frontend-angular/AGENTS.md`, `docs/frontend/00-angular20-port-v0.md`, `docs/backend/01-contrato-api-certificados.md`, ciclos F2 completados y spec del ciclo activo.

Comandos si aplica:
```powershell
git status --short
cd apps/frontend-angular
npm test
npm run build
```

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F3-01 — Servicios mock y contratos frontend.
Usá SDD completo. Leé apps/frontend-angular/AGENTS.md, docs/frontend/00-angular20-port-v0.md,
docs/backend/01-contrato-api-certificados.md, ciclos F2 completados y la spec del ciclo.
Mové datos mock a servicios/modelos claros de frontend y documentá qué contrato representan.
No conectes API real, no agregues dependencias y no uses datos sensibles reales.
No toques PHP, base, deploy ni material_privado_no_versionar/. No hagas commit ni push por tu cuenta. **Pre-commit safety (diff-confirmation gate)**: previo al `git add`, debés correr `git status --short` y `git diff --name-only`, presentar el resultado a Matías y esperar su confirmación de que el diff es correcto. **Pre-push safety**: previo al `git push`, si existe `origin/<rama>`, corré `git log origin/<rama>..<rama> --oneline` y `git diff origin/<rama>..<rama> --stat`; si es primer push, declaralo y compará contra la base aprobada con `git log <base>..HEAD --oneline` y `git diff <base>...HEAD --stat`; esperá confirmación. Tras `sdd-verify` PASS, podés ejecutar `git add` + `git commit` + `git push` (a la rama de trabajo actual, nunca a `main`) SOLO cuando Matías lo apruebe explícitamente en el mismo turno del chat, con el mensaje y comando exactos que indique. La única prohibición dura es `git push` directo a `main`; PR, `git merge`, `git rebase` y merge de PR requieren aprobación explícita de Matías, comando exacto y evidencia previa.
```

Validaciones automáticas:
- [ ] `npm test` pasa o se reporta ausencia de runner.
- [ ] `npm run build` pasa o queda bloqueo verificable.
- [ ] Componentes consumen servicios/modelos en vez de datos sueltos si aplica.
- [ ] Mocks quedan localizados y marcados como temporales.

QA manual:
- [ ] Pantallas F2 siguen funcionando con servicios mock.
- [ ] Estados válido/revocada/no encontrada/error siguen reproducibles.
- [ ] No aparecen datos sensibles en UI ni consola.
- [ ] No hay regresión visual nueva.

Documentación a actualizar en `sdd-archive`:
- `docs/frontend/00-angular20-port-v0.md` con ubicación de servicios, modelos y mocks.
- `docs/backend/01-contrato-api-certificados.md` solo si Marcos actualizó contrato.

Qué NO hacer:
- No crear abstracciones para integraciones no definidas.
- No ocultar mocks como si fueran datos reales.
- No modificar backend.

Mensaje de commit sugerido: `refactor(frontend): ordenar mocks y contratos`.

### Ciclo F3-02 — Preparar conexión futura con API PHP

Objetivo: dejar la frontera frontend/API preparada detrás de servicios, sin activar llamadas reales si el backend no está listo.
Rama sugerida: `frontend/api-readiness`.
Archivos a leer: `apps/frontend-angular/AGENTS.md`, `docs/frontend/00-angular20-port-v0.md`, `docs/backend/01-contrato-api-certificados.md`, F3-01 y spec del ciclo activo.

Comandos si aplica:
```powershell
git status --short
cd apps/frontend-angular
npm test
npm run build
```

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F3-02 — Preparar conexión futura con API PHP.
Usá SDD completo. Leé apps/frontend-angular/AGENTS.md, docs/frontend/00-angular20-port-v0.md,
docs/backend/01-contrato-api-certificados.md, F3-01 y la spec del ciclo.
Prepará la frontera de servicios para futura API PHP bajo /certificados/api/ usando solo contratos documentados.
Si no hay backend disponible, mantené mocks y dejá TODO o documentación de integración futura, sin llamadas reales.
No inventes endpoints, no agregues interceptores complejos ni auth real sin contrato.
No toques PHP, base, deploy ni material_privado_no_versionar/. No hagas commit ni push por tu cuenta. **Pre-commit safety (diff-confirmation gate)**: previo al `git add`, debés correr `git status --short` y `git diff --name-only`, presentar el resultado a Matías y esperar su confirmación de que el diff es correcto. **Pre-push safety**: previo al `git push`, si existe `origin/<rama>`, corré `git log origin/<rama>..<rama> --oneline` y `git diff origin/<rama>..<rama> --stat`; si es primer push, declaralo y compará contra la base aprobada con `git log <base>..HEAD --oneline` y `git diff <base>...HEAD --stat`; esperá confirmación. Tras `sdd-verify` PASS, podés ejecutar `git add` + `git commit` + `git push` (a la rama de trabajo actual, nunca a `main`) SOLO cuando Matías lo apruebe explícitamente en el mismo turno del chat, con el mensaje y comando exactos que indique. La única prohibición dura es `git push` directo a `main`; PR, `git merge`, `git rebase` y merge de PR requieren aprobación explícita de Matías, comando exacto y evidencia previa.
```

Validaciones automáticas:
- [ ] `npm test` pasa o se reporta ausencia de runner.
- [ ] `npm run build` pasa o queda bloqueo verificable.
- [ ] No hay llamadas reales a endpoints no aprobados.
- [ ] La URL futura respeta `/certificados/api/` solo como contrato documentado.

QA manual:
- [ ] La app sigue funcionando con mocks.
- [ ] Errores de servicio están previstos sin romper UI.
- [ ] No se exponen tokens completos, DNI completo fuera de la validación pública (D0), ni errores técnicos crudos.
- [ ] Consola sin errores nuevos.

Documentación a actualizar en `sdd-archive`:
- `docs/frontend/00-angular20-port-v0.md` con frontera de servicios y pendientes.
- `docs/backend/01-contrato-api-certificados.md` si Marcos define o cambia endpoints.

Qué NO hacer:
- No implementar backend desde frontend.
- No configurar ambiente real ni `.env` con credenciales.
- No agregar capa HTTP sobredimensionada para un contrato que no existe.

Mensaje de commit sugerido: `refactor(frontend): preparar frontera api php`.

### Ciclo F3-03 — Tests automáticos básicos

Objetivo: agregar o ejecutar pruebas automáticas mínimas disponibles para proteger rutas, componentes o servicios tocados.
Rama sugerida: `qa/frontend-release-readiness`.
Archivos a leer: `apps/frontend-angular/AGENTS.md`, `docs/frontend/00-angular20-port-v0.md`, `package.json` de Angular si existe, ciclos F2/F3 previos y spec del ciclo activo.

Comandos si aplica:
```powershell
git status --short
cd apps/frontend-angular
npm test
npm run build
```

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F3-03 — Tests automáticos básicos.
Usá SDD completo. Leé apps/frontend-angular/AGENTS.md, docs/frontend/00-angular20-port-v0.md,
package.json si existe, ciclos F2/F3 previos y la spec del ciclo.
Agregá o ajustá solo tests básicos para lo ya implementado si el runner existe.
Si no hay runner configurado, no inventes evidencia: reportá bloqueo y proponé el mínimo siguiente paso.
No agregues frameworks nuevos, no toques backend/base/deploy/material_privado_no_versionar/ y no hagas commit, push, merge ni rebase por tu cuenta. Tras `sdd-verify` PASS, podés ejecutar `git add` + `git commit` + `git push` (a la rama actual, nunca a `main`) SOLO cuando Matías lo apruebe explícitamente en el mismo turno, con diff-confirmation gate, pre-push safety y comando exacto. PR, merge, rebase y cambios de rama requieren aprobación explícita, evidencia previa y árbol limpio o decisión explícita de stash/commit/abortar.
```

Validaciones automáticas:
- [ ] `npm test` pasa o se reporta claramente que no existe runner/comando.
- [ ] `npm run build` pasa o queda bloqueo verificable.
- [ ] Tests cubren al menos render básico o servicio mock crítico si el runner existe.
- [ ] No se agregan dependencias de testing sin aprobación.

QA manual:
- [ ] Los tests elegidos protegen comportamiento real del ciclo, no snapshots vacíos.
- [ ] Fallos quedan documentados con comando y salida relevante, sin logs sensibles.
- [ ] La UI sigue revisada manualmente aunque pasen tests.

Documentación a actualizar en `sdd-archive`:
- `docs/frontend/00-angular20-port-v0.md` con comandos de test reales.
- `docs/00-indice-general.md` solo si cambia ruta documental de testing.

Qué NO hacer:
- No instalar Cypress, Playwright u otros frameworks sin decisión de Marcos.
- No escribir tests frágiles solo para subir cobertura.
- No declarar QA completo solo porque compila.

Mensaje de commit sugerido: `test(frontend): agregar pruebas basicas`.

### Ciclo F3-04 — QA manual completo

Objetivo: ejecutar una pasada manual transversal de la experiencia frontend antes del build de entrega.
Rama sugerida: `qa/frontend-release-readiness`.
Archivos a leer: `docs/frontend/00-angular20-port-v0.md`, reportes F2/F3, `apps/frontend-angular/AGENTS.md` y spec del ciclo activo.

Comandos si aplica:
```powershell
git status --short
cd apps/frontend-angular
npm run build
```

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F3-04 — QA manual completo.
Usá SDD completo. Leé docs/frontend/00-angular20-port-v0.md, reportes F2/F3,
apps/frontend-angular/AGENTS.md y la spec del ciclo.
Prepará y ejecutá una checklist manual transversal: responsive, teclado, foco, contraste, estados,
consola, no regresión visual, datos sensibles y comparación con muestra_pagina/ si existe.
No modifiques producto salvo correcciones menores aprobadas por el ciclo. No toques backend/base/deploy/material_privado_no_versionar/.
No hagas commit ni push por tu cuenta. **Pre-commit safety (diff-confirmation gate)**: previo al `git add`, debés correr `git status --short` y `git diff --name-only`, presentar el resultado a Matías y esperar su confirmación de que el diff es correcto. **Pre-push safety**: previo al `git push`, si existe `origin/<rama>`, corré `git log origin/<rama>..<rama> --oneline` y `git diff origin/<rama>..<rama> --stat`; si es primer push, declaralo y compará contra la base aprobada con `git log <base>..HEAD --oneline` y `git diff <base>...HEAD --stat`; esperá confirmación. Tras `sdd-verify` PASS, podés ejecutar `git add` + `git commit` + `git push` (a la rama de trabajo actual, nunca a `main`) SOLO cuando Matías lo apruebe explícitamente en el mismo turno del chat, con el mensaje y comando exactos que indique. La única prohibición dura es `git push` directo a `main`; PR, `git merge`, `git rebase` y merge de PR requieren aprobación explícita de Matías, comando exacto y evidencia previa.
```

Validaciones automáticas:
- [ ] `npm run build` pasa o queda bloqueo verificable.
- [ ] No hay cambios fuera de `apps/frontend-angular/` y documentación permitida si se corrige algo.
- [ ] QA deja evidencia de navegadores/tamaños revisados.

QA manual:
- [ ] 360 px, 390 px, 430 px, tablet y desktop revisados.
- [ ] Navegación por teclado y foco visible revisados.
- [ ] Contraste y legibilidad revisados.
- [ ] Estados carga/vacío/error/éxito revisados.
- [ ] Consola sin errores nuevos.
- [ ] La validación pública muestra DNI completo (D0) y no muestra tokens completos ni datos sensibles reales; logs, auditoría, errores y respuestas administrativas sin DNI completo.

Documentación a actualizar en `sdd-archive`:
- `docs/frontend/00-angular20-port-v0.md` con resumen de QA, pendientes y riesgos.
- Documentación de QA futura si Marcos crea una ruta específica.

Qué NO hacer:
- No saltear QA manual por tener build verde.
- No ocultar fallos visuales como “pendientes” sin registrarlos.
- No tocar deploy real.

Mensaje de commit sugerido: `test(frontend): documentar qa manual completo`.

### Ciclo F3-05 — Build para `/certificados/`

Objetivo: verificar build de producción con base href `/certificados/` y documentar artefactos esperados, sin desplegar al servidor.
Rama sugerida: `frontend/api-readiness` si lo toma Marcos; `qa/frontend-release-readiness` solo si Matías lo coordina como parte del cierre.
Archivos a leer: `apps/frontend-angular/AGENTS.md`, `docs/frontend/00-angular20-port-v0.md`, `deploy/AGENTS.md`, `docs/deploy/00-cpanel-certificados.md` si existe y spec del ciclo activo.

Comandos si aplica:
```powershell
git status --short
cd apps/frontend-angular
ng build --configuration production --base-href /certificados/
```

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F3-05 — Build para /certificados/.
Usá SDD completo. Leé apps/frontend-angular/AGENTS.md, docs/frontend/00-angular20-port-v0.md,
deploy/AGENTS.md y docs/deploy/00-cpanel-certificados.md si existe.
Verificá el build de producción con base href /certificados/ y documentá resultado, carpeta generada y bloqueos.
No despliegues, no copies archivos a cPanel, no toques public_html y no modifiques configuración real del servidor.
No toques PHP, base de datos ni material_privado_no_versionar/. No hagas commit ni push por tu cuenta. **Pre-commit safety (diff-confirmation gate)**: previo al `git add`, debés correr `git status --short` y `git diff --name-only`, presentar el resultado a Matías y esperar su confirmación de que el diff es correcto. **Pre-push safety**: previo al `git push`, si existe `origin/<rama>`, corré `git log origin/<rama>..<rama> --oneline` y `git diff origin/<rama>..<rama> --stat`; si es primer push, declaralo y compará contra la base aprobada con `git log <base>..HEAD --oneline` y `git diff <base>...HEAD --stat`; esperá confirmación. Tras `sdd-verify` PASS, podés ejecutar `git add` + `git commit` + `git push` (a la rama de trabajo actual, nunca a `main`) SOLO cuando Matías lo apruebe explícitamente en el mismo turno del chat, con el mensaje y comando exactos que indique. La única prohibición dura es `git push` directo a `main`; PR, `git merge`, `git rebase` y merge de PR requieren aprobación explícita de Matías, comando exacto y evidencia previa.
```

Validaciones automáticas:
- [ ] `ng build --configuration production --base-href /certificados/` pasa o queda bloqueo verificable.
- [ ] La salida del build se revisa sin copiarla al servidor.
- [ ] No se modifica `public_html`, cPanel ni deploy real.
- [ ] No se versionan artefactos pesados de build si no están aprobados.

QA manual:
- [ ] Se confirma que la base href esperada es `/certificados/`.
- [ ] Se documenta si las rutas internas requieren configuración adicional de servidor.
- [ ] Se registran errores de build con causa probable y próximo paso.

Documentación a actualizar en `sdd-archive`:
- `docs/frontend/00-angular20-port-v0.md` con comando real de build.
- `docs/deploy/00-cpanel-certificados.md` solo si corresponde documentar una instrucción aprobada de deploy futuro.

Qué NO hacer:
- No desplegar ni subir archivos.
- No tocar `public_html`.
- No versionar `dist/` salvo decisión explícita.

Mensaje de commit sugerido: `build(frontend): validar build certificados`.

### Ciclo F3-06 — Handoff a Marcos

Objetivo: entregar a Marcos un reporte revisable con estado, evidencia, riesgos, pendientes, handoff a F4-F6 y comandos Git propuestos para decisión humana.
Rama sugerida: `qa/frontend-release-readiness`.
Archivos a leer: esta guía, reportes de F2/F3, `docs/frontend/00-angular20-port-v0.md`, `docs/00-indice-general.md` y spec del ciclo activo.

Comandos si aplica:
```powershell
git status --short
git diff --stat
```

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F3-06 — Handoff a Marcos.
Usá SDD completo. Leé esta guía, reportes de F2/F3, docs/frontend/00-angular20-port-v0.md,
docs/00-indice-general.md y la spec del ciclo.
Prepará un handoff para Marcos con resumen, archivos tocados, pruebas, QA, documentación actualizada,
bloqueos, riesgos, próximos pasos, referencia a los ciclos F4-F6 de esta misma guía y comandos Git propuestos sin ejecutarlos.
No hagas commit ni push por tu cuenta. **Pre-commit safety (diff-confirmation gate)**: previo al `git add`, debés correr `git status --short` y `git diff --name-only`, presentar el resultado a Matías y esperar su confirmación de que el diff es correcto. **Pre-push safety**: previo al `git push`, si existe `origin/<rama>`, corré `git log origin/<rama>..<rama> --oneline` y `git diff origin/<rama>..<rama> --stat`; si es primer push, declaralo y compará contra la base aprobada con `git log <base>..HEAD --oneline` y `git diff <base>...HEAD --stat`; esperá confirmación. Tras `sdd-verify` PASS, podés ejecutar `git add` + `git commit` + `git push` (a la rama de trabajo actual, nunca a `main`) SOLO cuando Matías lo apruebe explícitamente en el mismo turno del chat, con el mensaje y comando exactos que indique. La única prohibición dura es `git push` directo a `main`; PR, `git merge`, `git rebase` y merge de PR requieren aprobación explícita de Matías, comando exacto y evidencia previa. No despliegues y no toques backend/base/material_privado_no_versionar/.
```

Validaciones automáticas:
- [ ] `git status --short` y `git diff --stat` quedan registrados como evidencia, sin ejecutar commit.
- [ ] El handoff lista archivos tocados y validaciones reales.
- [ ] Los comandos Git aparecen como propuesta, no como acción ejecutada por OpenCode.
- [ ] El handoff indica si F4-F6 quedan habilitados, pendientes o bloqueados por Marcos.

QA manual:
- [ ] Marcos puede revisar qué cambió sin reconstruir todo el ciclo.
- [ ] Pendientes y riesgos están separados de lo completado.
- [ ] No se ocultan bloqueos de API, diseño, tests o deploy.
- [ ] Queda claro qué requiere decisión humana.
- [ ] Los flujos 11-22 no se mezclan con el cierre de F3.

Documentación a actualizar en `sdd-archive`:
- `docs/frontend/00-angular20-port-v0.md` con estado final del frontend.
- `docs/opencode/` si cambió el flujo de trabajo con OpenCode.
- `docs/00-indice-general.md` solo si cambió una ruta vigente.

Qué NO hacer:
- No convertir el handoff en commit automático.
- No mezclar pendientes con funcionalidades terminadas.
- No instruir deploy real desde este ciclo.

Mensaje de commit sugerido: `docs(frontend): preparar handoff a marcos`.

## Troubleshooting F2-F3

| Problema | Acción segura |
|---|---|
| `npm test` no existe o falla por runner no configurado | No inventar evidencia. Registrar comando, error y validar con build o QA manual según alcance. |
| `npm run build` falla | Copiar solo el error relevante, revisar ruta/componente indicado y no tocar dependencias sin aprobación. |
| `ng build --base-href /certificados/` falla | Confirmar que se ejecuta dentro de `apps/frontend-angular/` y que Angular CLI está disponible; no desplegar. |
| Rutas internas no funcionan al refrescar | Documentar posible necesidad de configuración de servidor para SPA; no modificar cPanel ni `.htaccess` real sin Marcos. |
| Falta contrato API PHP | Mantener servicios mock, reportar bloqueo y pedir definición a Marcos. |
| Quedan flujos 11-22 pendientes | Derivar a los ciclos F4-F6 de esta misma guía y pedir decisión humana antes de ejecutarlos. |
| Aparecen datos sensibles en mock o consola | Frenar, removerlos del frontend y reportar el hallazgo sin copiar datos reales. |
| `dist/` queda generado | No versionarlo salvo decisión explícita; limpiar o dejar fuera de commit propuesto según indique Marcos. |
| Se necesita deploy | Preparar instrucciones y evidencia; no subir archivos ni tocar `public_html`. |

## Referencias finales

### Índice rápido de comandos PowerShell

Usá estos comandos solo cuando el ciclo lo indique. No convierten por sí solos un ciclo en “terminado”.

| Necesidad | Comando |
|---|---|
| Ver estado Git | `git status --short` |
| Ver resumen de cambios | `git diff --stat` |
| Verificar Node.js | `node --version` |
| Verificar npm | `npm --version` |
| Verificar Git | `git --version` |
| Verificar VS Code | `code --version` |
| Verificar Angular CLI | `ng version` |
| Instalar Node.js LTS con `winget` | `winget install OpenJS.NodeJS.LTS` |
| Instalar Git con `winget` | `winget install Git.Git` |
| Instalar VS Code con `winget` | `winget install Microsoft.VisualStudioCode` |
| Instalar Angular CLI global | `npm install -g @angular/cli` |
| Entrar a la app Angular | `cd apps/frontend-angular` |
| Ejecutar tests si existen | `npm test` |
| Ejecutar build si existe script | `npm run build` |
| Build para `/certificados/` | `ng build --configuration production --base-href /certificados/` |

### Fuentes de verdad

| Fuente | Cuándo leerla |
|---|---|
| `AGENTS.md` | Antes de cualquier cambio. Define reglas obligatorias del repo. |
| `GUIA.md` | Para entender objetivo, roles, alcance y metodología. |
| `docs/00-indice-general.md` | Para ubicar documentación vigente sin leer todo el repo. |
| `docs/frontend/00-angular20-port-v0.md` | Antes de tocar UI, Angular, build frontend o port desde `muestra_pagina/`. |
| `apps/frontend-angular/AGENTS.md` | Antes de editar la app Angular. |
| `muestra_pagina/` (listado seguro) | Antes de auditar o portar la referencia visual v0 final. |
| `openspec/changes/<cambio>/specs/` | Para validar el contrato del ciclo activo. |
| `openspec/specs/` | Para consultar contratos ya archivados. |

No dupliques contratos extensos en esta guía. Enlazá la fuente vigente y resumí solo la regla operativa necesaria.

## Checklist final de cierre del ciclo

Antes de pedir revisión a Marcos, completá esta lista.

### SDD y documentación

- [ ] El ciclo tuvo `explore`, `proposal`, `spec`, `design`, `tasks`, `apply`, `verify` y `archive`, o el reporte explica por qué una fase quedó bloqueada.
- [ ] `sdd-archive` actualizó la documentación correspondiente o dejó “sin cambios documentales” justificado.
- [ ] Los archivos tocados están listados con motivo.
- [ ] Las specs y tareas del ciclo quedaron trazadas en el reporte final.
- [ ] No quedó documentación duplicada o contradictoria.

### QA transversal

- [ ] Responsive revisado en 360 px, 390 px, 430 px, tablet y desktop.
- [ ] Navegación por teclado y foco visible.
- [ ] Contraste, jerarquía y legibilidad revisados.
- [ ] Estados carga, vacío, error, éxito y no encontrado revisados cuando aplican.
- [ ] Consola del navegador sin errores nuevos.
- [ ] No regresión visual en pantallas tocadas.
- [ ] Comparación con `muestra_pagina/` realizada cuando existe referencia utilizable.

### Seguridad y límites

- [ ] No se tocó `material_privado_no_versionar/`.
- [ ] No se copiaron dumps, logs, credenciales ni datos reales a documentación o código.
- [ ] La validación pública muestra DNI completo (D0) y no muestra tokens completos ni datos sensibles; logs, auditoría, errores y respuestas administrativas sin DNI completo.
- [ ] El DNI completo solo aparece en contextos privados o de entrega al estudiante si una spec aprobada lo exige.
- [ ] No se instalaron dependencias nuevas sin aprobación.
- [ ] No se inventaron endpoints ni contratos API.
- [ ] OpenCode no ejecutó `git push` directo a `main` ni deploy. `git add` + `git commit` + `git push` (a la rama de trabajo actual), PR, merge, rebase y creación/cambio de rama solo se ejecutan con aprobación explícita de Matías en el mismo turno, comando exacto, evidencia previa, `sdd-verify` PASS/`sdd-archive` cuando corresponda, y árbol limpio o decisión explícita de stash/commit/abortar.

## Checklist manual por pantalla

Usá esta tabla como control común para cada pantalla o estado visual tocado.

| Pantalla/estado | Controles mínimos |
|---|---|
| Validación pública válida | Mensaje de autenticidad claro, datos mínimos, DNI completo (D0) solo como respuesta de autenticidad, sin token completo, responsive, foco visible, consola limpia. |
| Certificación revocada | Comunica invalidez sin ambigüedad, no parece error técnico, contraste correcto, no expone datos sensibles. |
| Certificación no encontrada | Indica “no verificable”, no culpa al usuario, no muestra stack/error crudo, funciona en móvil. |
| Error técnico | Sugiere reintentar o contactar, no muestra detalles internos, mantiene navegación y foco. |
| Login/admin shell | No promete autenticación real si no existe, no hardcodea credenciales, formulario accesible, estados visuales claros. |
| Cursos y fechas | Estados vacío/carga/error/éxito, formularios con labels, listas legibles en móvil, sin persistencia real no aprobada. |
| Asistencias presentes | Marcar/desmarcar es claro, tabla/lista usable con teclado, sin datos reales; DNI completo solo con spec administrativa aprobada. |
| Certificaciones admin | Acciones habilitadas vs. placeholders diferenciadas, no genera PDF/QR real sin contrato, mocks explícitos. |

## Checklist de `sdd-archive`

Durante el cierre, actualizá solo la documentación afectada:

| Si el ciclo cambió... | Revisar durante `sdd-archive` |
|---|---|
| UI, rutas, componentes o mocks frontend | `docs/frontend/00-angular20-port-v0.md` |
| Contrato consumido por Angular | `docs/backend/01-contrato-api-certificados.md` solo si Marcos lo cambió o aprobó. |
| Build para `/certificados/` | `docs/frontend/00-angular20-port-v0.md` y, si corresponde, `docs/deploy/00-cpanel-certificados.md`. |
| Flujo de OpenCode o SDD | `docs/opencode/` si existe documento vigente aplicable. |
| Mapa documental | `docs/00-indice-general.md` solo si cambia una ruta, título o fuente vigente. |

Si no hay documento para actualizar, dejá evidencia: “Archive revisado; sin cambios documentales necesarios”.

## Plantilla final de reporte para Marcos

~~~markdown
# Reporte final — Ciclo <ID> <nombre>

## Resultado
- Estado: <completo | parcial | bloqueado>
- Resumen: <qué cambió y por qué>

## Archivos tocados
| Archivo | Cambio | Motivo |
|---|---|---|
| `<ruta>` | <creado/modificado> | <motivo> |

## Validaciones ejecutadas
| Validación | Resultado | Evidencia |
|---|---|---|
| `<comando o QA>` | <ok/falla/no aplica> | <detalle breve> |

## QA manual
- [ ] Responsive
- [ ] Teclado/foco
- [ ] Contraste/legibilidad
- [ ] Estados carga/vacío/error/éxito
- [ ] Consola limpia
- [ ] Sin datos sensibles

## SDD archive
- Documentos actualizados: <rutas o “sin cambios necesarios”>
- Spec/tareas cubiertas: <IDs>

## Bloqueos y riesgos
- Bloqueos: <si no hay, “Sin bloqueos”>
- Riesgos: <si no hay, “Sin riesgos abiertos”>

## Comandos Git propuestos, no ejecutados por OpenCode
```powershell
git status --short
git diff --stat
git add <archivos-seguros>
git commit -m "<tipo>(<scope>): <resultado>"
git push -u origin <rama>
```
~~~

## Semana 4 — Detalles, PDF y cursos (F4)

Los ciclos F4 usan la referencia visual v0 final de `muestra_pagina/`. Cada ciclo requiere spec/contrato aprobado antes de ejecutarse; si no existe, primero expandílo con archivos a leer, validaciones, QA, límites y criterios de cierre.

### Ciclo F4-01 — Detalle de certificación administrativo

Objetivo: implementar el detalle administrativo de certificación con estado, trazabilidad y acciones, usando datos mock si todavía no existe API integrada.
Rama sugerida: `frontend/certificate-detail-pdf`.
Archivos a leer: `apps/frontend-angular/AGENTS.md`, `docs/frontend/00-angular20-port-v0.md`, `docs/backend/01-contrato-api-certificados.md`, referencia visual v0 de `muestra_pagina/app/admin/certificaciones/[id]` y spec del ciclo activo.

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F4-01 — Detalle de certificación administrativo.
Usá SDD completo. Leé apps/frontend-angular/AGENTS.md, docs/frontend/00-angular20-port-v0.md,
docs/backend/01-contrato-api-certificados.md, la referencia visual v0 de muestra_pagina y la spec del ciclo.
Implementá el detalle administrativo con estado, trazabilidad y acciones, usando mocks explícitos si no hay backend.
No inventes historial, QR real ni revocación real sin spec previa. No copies React/Next literalmente.
No toques PHP, base, deploy ni material_privado_no_versionar/. Commit/push/PR solo con aprobación explícita.
```

Validaciones automáticas: `npm test` y `npm run build` pasan o se reportan bloqueos.
QA manual: responsive, teclado/foco, contraste, estados carga/vacío/error/éxito, consola limpia.
No hacer: no implementar historial/QR/revocación real sin spec; no exponer datos sensibles en mocks.
Archive: `docs/frontend/00-angular20-port-v0.md`, spec del ciclo.
Commit sugerido: `feat(frontend): detalle administrativo de certificacion`.

### Ciclo F4-02 — Vista previa PDF complementario

Objetivo: implementar la vista previa del PDF complementario del certificado con datos permitidos y layout institucional.
Rama sugerida: `frontend/certificate-detail-pdf`.
Archivos a leer: `apps/frontend-angular/AGENTS.md`, `docs/frontend/00-angular20-port-v0.md`, `docs/backend/01-contrato-api-certificados.md`, referencia visual v0 de `muestra_pagina/components/admin/vista-previa-pdf.tsx` y spec del ciclo activo.

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F4-02 — Vista previa PDF complementario.
Usá SDD completo. Leé apps/frontend-angular/AGENTS.md, docs/frontend/00-angular20-port-v0.md,
docs/backend/01-contrato-api-certificados.md, la referencia visual v0 de muestra_pagina y la spec del ciclo.
Implementá la vista previa PDF con layout, firmantes (Rector/a + Asesor/a Pedagógica) y datos permitidos.
No generes PDF real ni QR real sin spec previa. No copies React/Next literalmente.
No toques PHP, base, deploy ni material_privado_no_versionar/. Commit/push/PR solo con aprobación explícita.
```

Validaciones automáticas: `npm test` y `npm run build` pasan o se reportan bloqueos.
QA manual: responsive, teclado/foco, contraste, consola limpia, datos institucionales correctos.
No hacer: no generar PDF/QR real sin spec; no inventar datos fuera del contrato.
Archive: `docs/frontend/00-angular20-port-v0.md`, spec del ciclo.
Commit sugerido: `feat(frontend): vista previa pdf certificado`.

### Ciclo F4-03 — Listado de cursos

Objetivo: implementar el listado administrativo de cursos con filtros, fechas y estados usando mocks o contrato documentado.
Rama sugerida: `frontend/admin-courses`.
Archivos a leer: `apps/frontend-angular/AGENTS.md`, `docs/frontend/00-angular20-port-v0.md`, `docs/backend/01-contrato-api-certificados.md`, referencia visual v0 de `muestra_pagina/app/admin/cursos` y spec del ciclo activo.

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F4-03 — Listado de cursos.
Usá SDD completo. Leé apps/frontend-angular/AGENTS.md, docs/frontend/00-angular20-port-v0.md,
docs/backend/01-contrato-api-certificados.md, la referencia visual v0 de muestra_pagina y la spec del ciclo.
Implementá el listado de cursos con filtros, fechas y estados usando mocks explícitos o contrato documentado.
No inventes endpoints ni campos fuera del contrato. No copies React/Next literalmente.
No toques PHP, base, deploy ni material_privado_no_versionar/. Commit/push/PR solo con aprobación explícita.
```

Validaciones automáticas: `npm test` y `npm run build` pasan o se reportan bloqueos.
QA manual: responsive, teclado/foco, estados vacío/carga/error/éxito, consola limpia.
No hacer: no diseñar base de datos desde frontend; no persistir datos reales.
Archive: `docs/frontend/00-angular20-port-v0.md`, spec del ciclo.
Commit sugerido: `feat(frontend): listado de cursos admin`.

### Ciclo F4-04 — Detalle de curso

Objetivo: implementar el detalle administrativo de curso con fechas, asistencias y certificaciones asociadas usando mocks o contrato documentado.
Rama sugerida: `frontend/admin-courses`.
Archivos a leer: `apps/frontend-angular/AGENTS.md`, `docs/frontend/00-angular20-port-v0.md`, `docs/backend/01-contrato-api-certificados.md`, referencia visual v0 de `muestra_pagina/app/admin/cursos/[id]` y spec del ciclo activo.

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F4-04 — Detalle de curso.
Usá SDD completo. Leé apps/frontend-angular/AGENTS.md, docs/frontend/00-angular20-port-v0.md,
docs/backend/01-contrato-api-certificados.md, la referencia visual v0 de muestra_pagina y la spec del ciclo.
Implementá el detalle de curso con fechas, asistencias y certificaciones asociadas usando mocks explícitos.
No inventes endpoints ni reglas de negocio no documentadas. No copies React/Next literalmente.
No toques PHP, base, deploy ni material_privado_no_versionar/. Commit/push/PR solo con aprobación explícita.
```

Validaciones automáticas: `npm test` y `npm run build` pasan o se reportan bloqueos.
QA manual: responsive, teclado/foco, estados vacío/carga/error/éxito, consola limpia.
No hacer: no crear endpoints PHP; no inferir reglas no documentadas.
Archive: `docs/frontend/00-angular20-port-v0.md`, spec del ciclo.
Commit sugerido: `feat(frontend): detalle de curso admin`.

## Semana 5 — Listados, alumnos y entrega manual (F5)

### Ciclo F5-01 — Listado de certificaciones

Objetivo: implementar el listado administrativo de certificaciones con filtros, paginación y estados.
Rama sugerida: `frontend/admin-certifications`.
Archivos a leer: `apps/frontend-angular/AGENTS.md`, `docs/frontend/00-angular20-port-v0.md`, `docs/backend/01-contrato-api-certificados.md`, referencia visual v0 de `muestra_pagina/app/admin/certificaciones` y spec del ciclo activo.

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F5-01 — Listado de certificaciones.
Usá SDD completo. Leé apps/frontend-angular/AGENTS.md, docs/frontend/00-angular20-port-v0.md,
docs/backend/01-contrato-api-certificados.md, la referencia visual v0 de muestra_pagina y la spec del ciclo.
Implementá el listado de certificaciones con filtros, paginación y estados usando mocks explícitos o contrato documentado.
No inventes endpoints ni filtros fuera del contrato. No copies React/Next literalmente.
No toques PHP, base, deploy ni material_privado_no_versionar/. Commit/push/PR solo con aprobación explícita.
```

Validaciones automáticas: `npm test` y `npm run build` pasan o se reportan bloqueos.
QA manual: responsive, teclado/foco, estados vacío/carga/error/éxito, consola limpia.
No hacer: no mezclar acciones críticas con acciones informativas; no simular datos reales.
Archive: `docs/frontend/00-angular20-port-v0.md`, spec del ciclo.
Commit sugerido: `feat(frontend): listado de certificaciones admin`.

### Ciclo F5-02 — Listado de alumnos

Objetivo: implementar el listado administrativo de alumnos con datos visibles definidos por spec; DNI completo solo si la spec lo exige en contexto privado/administrativo.
Rama sugerida: `frontend/admin-students`.
Archivos a leer: `apps/frontend-angular/AGENTS.md`, `docs/frontend/00-angular20-port-v0.md`, `docs/backend/01-contrato-api-certificados.md`, referencia visual v0 de `muestra_pagina/app/admin/alumnos` y spec del ciclo activo.

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F5-02 — Listado de alumnos.
Usá SDD completo. Leé apps/frontend-angular/AGENTS.md, docs/frontend/00-angular20-port-v0.md,
docs/backend/01-contrato-api-certificados.md, la referencia visual v0 de muestra_pagina y la spec del ciclo.
Implementá el listado de alumnos con datos visibles definidos por spec. DNI completo solo si la spec lo exige en contexto privado/administrativo.
No inventes endpoints ni datos sensibles. No copies React/Next literalmente.
No toques PHP, base, deploy ni material_privado_no_versionar/. Commit/push/PR solo con aprobación explícita.
```

Validaciones automáticas: `npm test` y `npm run build` pasan o se reportan bloqueos.
QA manual: responsive, teclado/foco, estados vacío/carga/error/éxito, consola limpia, sin datos sensibles en mocks.
No hacer: no exponer DNI completo fuera de contextos aprobados por spec; no usar datos reales.
Archive: `docs/frontend/00-angular20-port-v0.md`, spec del ciclo.
Commit sugerido: `feat(frontend): listado de alumnos admin`.

### Ciclo F5-03 — Detalle administrativo de alumno

Objetivo: implementar el detalle administrativo de alumno con datos personales permitidos por spec.
Rama sugerida: `frontend/admin-students`.
Archivos a leer: `apps/frontend-angular/AGENTS.md`, `docs/frontend/00-angular20-port-v0.md`, `docs/backend/01-contrato-api-certificados.md`, referencia visual v0 de `muestra_pagina/app/admin/alumnos/[id]` y spec del ciclo activo.

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F5-03 — Detalle administrativo de alumno.
Usá SDD completo. Leé apps/frontend-angular/AGENTS.md, docs/frontend/00-angular20-port-v0.md,
docs/backend/01-contrato-api-certificados.md, la referencia visual v0 de muestra_pagina y la spec del ciclo.
Implementá el detalle administrativo de alumno con datos personales permitidos por spec.
No inventes endpoints ni datos sensibles. No copies React/Next literalmente.
No toques PHP, base, deploy ni material_privado_no_versionar/. Commit/push/PR solo con aprobación explícita.
```

Validaciones automáticas: `npm test` y `npm run build` pasan o se reportan bloqueos.
QA manual: responsive, teclado/foco, estados vacío/carga/error/éxito, consola limpia, sin datos sensibles en mocks.
No hacer: no exponer datos personales no aprobados por spec; no usar datos reales.
Archive: `docs/frontend/00-angular20-port-v0.md`, spec del ciclo.
Commit sugerido: `feat(frontend): detalle administrativo de alumno`.

### Ciclo F5-04 — Entrega manual de certificación

> **Estado (2026-07-17): ✅ CERRADO.** Evidencia: `openspec/changes/archive/2026-07-15-p6-01-entrega-manual-funcional/`, `openspec/changes/archive/2026-07-17-frontend-entrega-manual-qr/`, paridad entrega/revocar/PDF. No reabrir salvo regresión.

Objetivo: implementar la entrega manual de certificación: copiar link público y descargar PDF. NO hay reenvío por email ni SMTP en el MVP.
Rama sugerida: `frontend/admin-certifications`.
Archivos a leer: `apps/frontend-angular/AGENTS.md`, `docs/frontend/00-angular20-port-v0.md`, `docs/backend/01-contrato-api-certificados.md`, referencia visual v0 de `muestra_pagina/app/admin/certificaciones/[id]/entrega` y spec del ciclo activo.

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F5-04 — Entrega manual de certificación.
Usá SDD completo. Leé apps/frontend-angular/AGENTS.md, docs/frontend/00-angular20-port-v0.md,
docs/backend/01-contrato-api-certificados.md, la referencia visual v0 de muestra_pagina y la spec del ciclo.
Implementá la entrega manual: copiar link público y descargar PDF. Las pantallas dicen "mismo QR"; el token/QR es permanente (D0).
No implementes reenvío por email, SMTP ni PHPMailer. No inventes "reenviar" ni rotación de token.
No toques PHP, base, deploy ni material_privado_no_versionar/. Commit/push/PR solo con aprobación explícita.
```

Validaciones automáticas: `npm test` y `npm run build` pasan o se reportan bloqueos.
QA manual: responsive, teclado/foco, estados carga/éxito/error, copiar link funciona, consola limpia.
No hacer: no implementar email/SMTP; no rotar token; no simular envío automático.
Archive: `docs/frontend/00-angular20-port-v0.md`, spec del ciclo.
Commit sugerido: `feat(frontend): entrega manual de certificacion`.

## Semana 6 — Revocación, carga masiva, auditoría y configuración (F6)

### Ciclo F6-01 — Revocar certificación

Objetivo: implementar la revocación de certificación con confirmación clara y efecto irreversible, según spec de permisos.
Rama sugerida: `frontend/admin-certifications`.
Archivos a leer: `apps/frontend-angular/AGENTS.md`, `docs/frontend/00-angular20-port-v0.md`, `docs/backend/01-contrato-api-certificados.md`, referencia visual v0 de `muestra_pagina/app/admin/certificaciones/[id]/revocar` y spec del ciclo activo.

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F6-01 — Revocar certificación.
Usá SDD completo. Leé apps/frontend-angular/AGENTS.md, docs/frontend/00-angular20-port-v0.md,
docs/backend/01-contrato-api-certificados.md, la referencia visual v0 de muestra_pagina y la spec del ciclo.
Implementá la revocación con confirmación clara y efecto irreversible. El token queda invalidado tras la revocación.
No inventes permisos ni efectos no documentados. No copies React/Next literalmente.
No toques PHP, base, deploy ni material_privado_no_versionar/. Commit/push/PR solo con aprobación explícita.
```

Validaciones automáticas: `npm test` y `npm run build` pasan o se reportan bloqueos.
QA manual: responsive, teclado/foco, confirmación clara, estados de la acción, consola limpia.
No hacer: no ejecutar revocación real sin backend aprobado; no mezclar con UI pública.
Archive: `docs/frontend/00-angular20-port-v0.md`, spec del ciclo.
Commit sugerido: `feat(frontend): revocar certificacion admin`.

### Ciclo F6-02 — Placeholder de carga masiva

> **Estado (2026-07-17): 🚫 DIFERIDO — fuera de MVP.** No ejecutar este ciclo salvo decisión explícita de reabrir alcance. No hay feature/ruta de carga masiva en el producto actual. Seguir en backlog P9 si el instituto lo pide.

Objetivo (histórico): implementar un placeholder de carga masiva; no importar archivos reales.
Rama sugerida: `frontend/admin-bulk-config`.
Archivos a leer: `apps/frontend-angular/AGENTS.md`, `docs/frontend/00-angular20-port-v0.md`, referencia visual v0 de `muestra_pagina` y spec del ciclo activo.

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F6-02 — Placeholder de carga masiva.
Usá SDD completo. Leé apps/frontend-angular/AGENTS.md, docs/frontend/00-angular20-port-v0.md,
la referencia visual v0 de muestra_pagina y la spec del ciclo.
Implementá un placeholder de carga masiva. No importes archivos reales ni proceses datos sensibles.
No inventes endpoints ni reglas de validación no documentadas. No copies React/Next literalmente.
No toques PHP, base, deploy ni material_privado_no_versionar/. Commit/push/PR solo con aprobación explícita.
```

Validaciones automáticas: `npm test` y `npm run build` pasan o se reportan bloqueos.
QA manual: responsive, teclado/foco, estados placeholder, consola limpia.
No hacer: no importar archivos reales; no procesar datos sensibles.
Archive: `docs/frontend/00-angular20-port-v0.md`, spec del ciclo.
Commit sugerido: `feat(frontend): placeholder carga masiva`.

### Ciclo F6-03 — Auditoría básica

> **Estado (2026-07-17): ✅ CERRADO (alcance efectivo MVP).** Timeline `auditEvents` en expediente + Copiar/Compartir con URL canónica (`frontend-certificado-preview`). Pantalla dedicada `/admin/auditoria` **no** forma parte del MVP. No reabrir salvo decisión de ampliar alcance.

Objetivo (histórico): implementar la vista de auditoría básica con eventos auditables y permisos definidos por spec.
Rama sugerida: `frontend/admin-certifications`.
Archivos a leer: `apps/frontend-angular/AGENTS.md`, `docs/frontend/00-angular20-port-v0.md`, `docs/backend/01-contrato-api-certificados.md`, referencia visual v0 de `muestra_pagina` y spec del ciclo activo.

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F6-03 — Auditoría básica.
Usá SDD completo. Leé apps/frontend-angular/AGENTS.md, docs/frontend/00-angular20-port-v0.md,
docs/backend/01-contrato-api-certificados.md, la referencia visual v0 de muestra_pagina y la spec del ciclo.
Implementá la vista de auditoría básica con eventos auditables y permisos definidos por spec.
No inventes eventos ni permisos no documentados. No expongas DNI completo ni tokens completos en logs/auditoría (D0).
No toques PHP, base, deploy ni material_privado_no_versionar/. Commit/push/PR solo con aprobación explícita.
```

Validaciones automáticas: `npm test` y `npm run build` pasan o se reportan bloqueos.
QA manual: responsive, teclado/foco, estados vacío/carga/error, consola limpia, sin datos sensibles.
No hacer: no exponer DNI completo ni token completo en auditoría; no inventar eventos.
Archive: `docs/frontend/00-angular20-port-v0.md`, spec del ciclo.
Commit sugerido: `feat(frontend): auditoria basica admin`.

### Ciclo F6-04 — Configuración institucional

> **Estado (2026-07-17): ✅ CERRADO.** Evidencia: `openspec/changes/archive/2026-07-16-frontend-configuracion-institucional/`, `openspec/changes/archive/2026-07-17-frontend-parity-configuracion-layout/`. No reabrir salvo regresión.

Objetivo: implementar la configuración institucional con secciones, permisos y datos no sensibles.
Rama sugerida: `frontend/admin-bulk-config`.
Archivos a leer: `apps/frontend-angular/AGENTS.md`, `docs/frontend/00-angular20-port-v0.md`, referencia visual v0 de `muestra_pagina/app/admin/configuracion` y spec del ciclo activo.

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F6-04 — Configuración institucional.
Usá SDD completo. Leé apps/frontend-angular/AGENTS.md, docs/frontend/00-angular20-port-v0.md,
la referencia visual v0 de muestra_pagina y la spec del ciclo.
Implementá la configuración institucional con secciones, permisos y datos no sensibles (firmantes Rector/a + Asesor/a Pedagógica, etc.).
No guardes credenciales ni datos sensibles. No copies React/Next literalmente.
No toques PHP, base, deploy ni material_privado_no_versionar/. Commit/push/PR solo con aprobación explícita.
```

Validaciones automáticas: `npm test` y `npm run build` pasan o se reportan bloqueos.
QA manual: responsive, teclado/foco, estados carga/éxito/error, consola limpia, sin credenciales.
No hacer: no guardar credenciales; no inventar datos no sensibles fuera de spec.
Archive: `docs/frontend/00-angular20-port-v0.md`, spec del ciclo.
Commit sugerido: `feat(frontend): configuracion institucional admin`.

## Propuesta de comandos Git

OpenCode puede proponer estos comandos, pero no los ejecuta automáticamente:

```powershell
git status --short
git diff --stat
git add MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md
git add openspec/changes/<cambio>/tasks.md openspec/changes/<cambio>/apply-progress.md
git commit -m "docs(matias): completar guia angular windows"
git push -u origin docs/mejorar-guia-matias-angular-windows
```

Antes de ejecutar `git add`, Marcos o Matías deben revisar que no entren archivos sensibles, `dist/`, `.env`, dumps, logs ni material privado.

## Verificación spec → guía

| Requirement del spec | Dónde queda cubierto en la guía |
|---|---|
| Contexto operativo y misión | `Misión y contexto operativo`, `Ruta rápida`, `Errores comunes y límites`. |
| Preparación de entorno Windows | `Preparación de entorno Windows`, `Ciclo F0-01`, `Referencias finales`. |
| Flujo OpenCode/Gentle-AI y SDD | `Flujo OpenCode/Gentle-AI y SDD`, `Ciclo F0-02`, `Checklist final de cierre del ciclo`. |
| Uso de `muestra_pagina/` | `Uso de muestra_pagina/`, `Ciclo F1-01`, `Ciclo F1-02`, QA transversal. |
| Handoff a F4-F6 | `Ciclos F4-F6 (post-F3)`, `Ciclo F3-06`, sección Semana 4-6. |
| Política frontend, pruebas y QA | `Política frontend, pruebas y QA`, checklists de cada ciclo, `Checklist manual por pantalla`. |
| Errores comunes y límites | `Errores comunes y límites`, `Qué NO hacer` de cada ciclo, seguridad final. |
| Ciclos F0-01 a F6-04 | Secciones `Semana 0` a `Semana 6` con ciclos F0-01..F6-04. |
| Reporte final y propuestas Git | `Reporte final por ciclo`, `Plantilla final de reporte para Marcos`, `Propuesta de comandos Git`. |

Resultado: los 8 requirements y sus escenarios tienen sección o ciclo asignado. Esta guía no autoriza acceso a material privado, dependencias nuevas sin aprobación, Git automático sin gates, deploy ni cambios backend/base de datos.
