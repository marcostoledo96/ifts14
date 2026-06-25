# Matías — guía ejecutable SDD para Angular 20 en Windows

Esta guía es el punto de entrada para que Matías trabaje el frontend Angular 20 del módulo `/certificados/` desde Windows. Se trabaja en ciclos chicos, con Spec-Driven Development, validación explícita y cierre obligatorio con `sdd-archive`.

> Estado de esta guía: WU1 define estructura, reglas y plantillas. WU2 detalla los ciclos F0-01 a F1-05. WU3 detalla los ciclos F2-01 a F3-06. WU4 completa referencias, checklists finales y mapeo spec → guía.

## Ruta rápida

1. Leé primero `README.md`, `GUIA.md`, `AGENTS.md` y `docs/00-indice-general.md`.
2. Confirmá que no estás trabajando directo sobre `main` salvo decisión explícita de Marcos.
3. Verificá el entorno Windows con la sección [Preparación de entorno Windows](#preparación-de-entorno-windows).
4. Elegí un ciclo F0-F3 y leé su objetivo, archivos, prompt, validaciones y límites.
5. Pedile a OpenCode un ciclo SDD completo: explore → propose → spec → design → tasks → apply → verify → archive.
6. Ejecutá pruebas automáticas disponibles y QA manual antes de cerrar.
7. Dejale a Marcos un reporte final con archivos, verificaciones, bloqueos y comandos Git propuestos. OpenCode no ejecuta commit, push, merge ni rebase.

## Misión y contexto operativo

| Tema | Regla |
|---|---|
| Rol | Matías trabaja frontend Angular 20, UI/UX, responsive y accesibilidad. |
| Producto | Módulo público `/certificados/` para validar certificaciones mediante QR o link. |
| Fuente visual | `muestra_pagina/`, cuando tenga diseño utilizable generado en v0. |
| Fuente documental | `AGENTS.md`, `GUIA.md`, `docs/00-indice-general.md`, `docs/frontend/00-angular20-port-v0.md` y specs OpenSpec vigentes. |
| Backend/API | No inventar contratos. Usar solo lo documentado por Marcos. |
| Seguridad | No tocar `material_privado_no_versionar/`, dumps, logs, credenciales ni archivos `.env`. |
| Git | OpenCode puede proponer comandos; Matías o Marcos los ejecutan manualmente. |

### Alcance permitido

- Preparar y documentar trabajo frontend Angular 20.
- Crear o modificar código Angular solo dentro del ciclo SDD aprobado.
- Portar diseño de `muestra_pagina/` a componentes Angular propios cuando exista referencia visual utilizable.
- Mejorar accesibilidad, responsive, performance y estructura.
- Actualizar documentación frontend durante `sdd-archive`.

### Fuera de alcance

- Backend PHP, MariaDB, deploy cPanel y material privado.
- Commits, push, merge, rebase o cambios destructivos automáticos.
- Instalación de dependencias no aprobadas.
- Copia literal de React, Next.js, hooks, rutas o componentes generados por v0.
- Pantallas finales inventadas cuando `muestra_pagina/` esté vacía.

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

### Prompt base para iniciar un ciclo con OpenCode

```txt
Trabajemos el ciclo <ID> — <nombre> del frontend Angular 20 para IFTS14.
Usá SDD completo. Primero leé AGENTS.md, GUIA.md, docs/00-indice-general.md,
docs/frontend/00-angular20-port-v0.md y la spec OpenSpec correspondiente.
No toques backend, base de datos, deploy ni material_privado_no_versionar/.
No ejecutes commit, push, merge ni rebase. Proponé comandos Git al final.
Al cerrar, ejecutá verify y sdd-archive, y entregá reporte final con archivos,
pruebas, QA manual, documentación actualizada, bloqueos y riesgos.
```

## Uso de `muestra_pagina/`

`muestra_pagina/` es referencia visual y funcional, no código definitivo.

| Estado de `muestra_pagina/` | Acción |
|---|---|
| Vacía o solo con `README.md`/`AGENTS.md` | No implementar pantallas finales. Solo preparar estructura, documentación o reportar bloqueo. |
| Con diseño v0 utilizable | Analizar composición, jerarquía, paleta, tipografía, espaciados, estados y comportamiento. |
| Con React/Next exportado | No copiar literalmente. Portar la intención visual a Angular 20 con componentes propios. |

Checklist mínimo antes de portar una pantalla:

- [ ] Hay referencia visual suficiente.
- [ ] Se identificaron componentes reutilizables.
- [ ] Se registraron estados: carga, éxito, vacío, error y no encontrado si aplica.
- [ ] Se respeta identidad institucional del IFTS 14.
- [ ] La implementación no depende de contratos API inventados.

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
- [ ] No exposición de DNI completo, tokens completos ni datos sensibles.

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
Rama sugerida: `docs/verificar-entorno-windows`.
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
Cerrá con validaciones, bloqueos y reporte final. No hagas commit, push, merge ni rebase.
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
Rama sugerida: `docs/verificar-opencode-sdd`.
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
No modifiques código, no instales dependencias, no toques material_privado_no_versionar/ y no ejecutes commit, push, merge ni rebase.
Entregá un reporte con bloqueos, validaciones y comandos Git solo propuestos.
```

Validaciones automáticas:
- [ ] `git status --short` muestra el estado antes de empezar.
- [ ] OpenCode identifica el repositorio correcto `ifts14`.
- [ ] El reporte final incluye fases SDD y no salta directo a implementación.

QA manual:
- [ ] La respuesta de OpenCode respeta las prohibiciones del repo.
- [ ] Queda claro que Git lo ejecuta Matías o Marcos manualmente.
- [ ] No se generó ni modificó código del producto.

Documentación a actualizar en `sdd-archive`:
- `docs/opencode/` si se ajusta el flujo operativo.
- Esta guía si aparece una instrucción recurrente que Matías necesita repetir.

Qué NO hacer:
- No pedir “implementá todo”.
- No aprobar acciones destructivas.
- No aceptar que OpenCode haga push o merge.

Mensaje de commit sugerido: `docs(matias): documentar verificacion de opencode sdd`.

### Ciclo F0-03 — Leer documentación mínima y entender misión

Objetivo: dejar evidencia de que Matías entendió rol, alcance, fuentes de verdad y límites antes del trabajo frontend.
Rama sugerida: `docs/onboarding-matias`.
Archivos a leer: `README.md`, `GUIA.md`, `AGENTS.md`, `docs/00-indice-general.md`, `docs/frontend/00-angular20-port-v0.md`, `muestra_pagina/README.md`, `muestra_pagina/AGENTS.md`, `apps/frontend-angular/AGENTS.md`.

Comandos si aplica:
```powershell
git status --short
```

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F0-03 — Leer documentación mínima y entender misión.
Leé README.md, GUIA.md, AGENTS.md, docs/00-indice-general.md, docs/frontend/00-angular20-port-v0.md,
muestra_pagina/README.md, muestra_pagina/AGENTS.md y apps/frontend-angular/AGENTS.md.
Devolveme un resumen operativo para Matías: misión, alcance permitido, fuera de alcance, fuentes de verdad,
qué hacer si muestra_pagina/ está vacía y qué evidencia debo dejar al cerrar cada ciclo.
No modifiques código ni documentación salvo que te pida explícitamente una corrección documental.
No ejecutes commit, push, merge ni rebase.
```

Validaciones automáticas:
- [ ] `git status --short` fue revisado antes y después si hubo cambios documentales.
- [ ] El resumen cita las fuentes leídas.
- [ ] No hay comandos de instalación ni build en este ciclo.

QA manual:
- [ ] Matías puede explicar qué le corresponde y qué no.
- [ ] Queda claro que `muestra_pagina/` bloquea UI final si está vacía.
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

Objetivo: determinar si existe referencia visual utilizable y qué se puede portar a Angular 20.
Rama sugerida: `frontend/auditar-muestra-pagina`.
Archivos a leer: `AGENTS.md`, `GUIA.md`, `docs/frontend/00-angular20-port-v0.md`, `muestra_pagina/README.md`, `muestra_pagina/AGENTS.md` y archivos visibles dentro de `muestra_pagina/` sin abrir material sensible externo.

Comandos si aplica:
```powershell
git status --short
Get-ChildItem .\muestra_pagina -Force
```

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F1-01 — Auditar muestra_pagina/.
Leé AGENTS.md, GUIA.md, docs/frontend/00-angular20-port-v0.md, muestra_pagina/README.md y muestra_pagina/AGENTS.md.
Revisá solo la estructura segura de muestra_pagina/ y decime si hay diseño v0 utilizable.
Si está vacía o solo tiene README/AGENTS, bloqueá la implementación de pantallas finales.
Si hay diseño, listá pantallas, componentes, estados visibles, riesgos y próximos pasos para portar a Angular 20.
No copies React/Next literalmente, no instales dependencias y no toques backend, base, deploy ni material_privado_no_versionar/.
```

Validaciones automáticas:
- [ ] `Get-ChildItem .\muestra_pagina -Force` lista únicamente nombres y estructura segura.
- [ ] El reporte clasifica la carpeta como vacía, insuficiente o utilizable.
- [ ] No se modifica código Angular en este ciclo si no hay referencia aprobada.

QA manual:
- [ ] La auditoría distingue diseño visual de código fuente exportado.
- [ ] Se registran pantallas y estados si existen.
- [ ] Si falta referencia, el bloqueo queda explícito y no se inventan pantallas.

Documentación a actualizar en `sdd-archive`:
- `docs/frontend/00-angular20-port-v0.md` con hallazgos resumidos si hay diseño utilizable.
- Esta guía solo si cambia la regla de bloqueo.

Qué NO hacer:
- No copiar componentes React/Next.
- No crear pantallas finales sin diseño utilizable.
- No guardar builds pesados ni dependencias en `muestra_pagina/`.

Mensaje de commit sugerido: `docs(frontend): registrar auditoria de muestra pagina`.

### Ciclo F1-02 — Extraer sistema visual desde v0

Objetivo: convertir la referencia v0 en criterios visuales portables: composición, paleta, tipografía, espaciado, componentes y estados.
Rama sugerida: `frontend/sistema-visual-v0`.
Archivos a leer: `docs/frontend/00-angular20-port-v0.md`, `muestra_pagina/README.md`, `muestra_pagina/AGENTS.md`, hallazgos del ciclo F1-01 y archivos de diseño disponibles en `muestra_pagina/`.

Comandos si aplica:
```powershell
git status --short
```

Prompt exacto para OpenCode:
```txt
Trabajemos el ciclo F1-02 — Extraer sistema visual desde v0.
Usá los hallazgos de F1-01 y leé docs/frontend/00-angular20-port-v0.md, muestra_pagina/README.md y muestra_pagina/AGENTS.md.
Si muestra_pagina/ no tiene diseño utilizable, reportá bloqueo y no inventes tokens.
Si tiene diseño, extraé sistema visual: paleta, tipografía observada, espaciados, layout, componentes, estados, responsive y accesibilidad.
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
Rama sugerida: `frontend/crear-app-angular`.
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
No toques backend, base de datos, deploy ni material_privado_no_versionar/. No ejecutes commit, push, merge ni rebase.
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
Rama sugerida: `frontend/configurar-tailwind`.
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
No agregues librerías extra, no toques backend/base/deploy/material_privado_no_versionar/ y no ejecutes commit, push, merge ni rebase.
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
Rama sugerida: `frontend/layout-base`.
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
No toques backend, base, deploy ni material_privado_no_versionar/. No ejecutes commit, push, merge ni rebase.
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
- No exponer DNI completo, tokens ni datos sensibles.
- No convertir placeholders en pantallas finales sin diseño aprobado.

Mensaje de commit sugerido: `feat(frontend): crear layout base publico admin`.

## Troubleshooting F0-F1

| Problema | Acción segura |
|---|---|
| `node` o `npm` no se reconoce | Instalar Node.js LTS, cerrar PowerShell, abrir una terminal nueva y repetir `node --version` / `npm --version`. |
| `ng` no se reconoce | Instalar Angular CLI con `npm install -g @angular/cli` o usar CLI local cuando exista app. Validar con `ng version`. |
| `git status` muestra muchos cambios inesperados | Frenar. No commitear. Pedir revisión a Marcos con lista de archivos. |
| `muestra_pagina/` está vacía | Bloquear UI final. Solo avanzar con estructura, documentación o preparación aprobada. |
| Tailwind no está aprobado | No instalar. Documentar necesidad, alternativas y esperar decisión. |
| `npm test` o `npm run build` no existe | No inventar evidencia. Reportar comando ausente y validar con el menor chequeo disponible. |

## Semana 2 — Features del módulo `/certificados/`

### Ciclo F2-01 — Pantalla pública de validación válida

Objetivo: implementar o preparar la pantalla pública que muestra una certificación válida, usando datos mock si todavía no existe API integrada.
Rama sugerida: `frontend/validacion-publica-valida`.
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
No inventes endpoints, no consultes backend real si no está aprobado y no muestres DNI completo ni token completo.
Si muestra_pagina/ no tiene diseño utilizable, usá una estructura accesible mínima y reportá el bloqueo visual.
No toques PHP, base de datos, deploy ni material_privado_no_versionar/. No ejecutes commit, push, merge ni rebase.
Cerrá con tests/build disponibles, QA manual, sdd-archive y reporte final.
```

Validaciones automáticas:
- [ ] `npm test` pasa o se reporta que no hay runner disponible.
- [ ] `npm run build` pasa o queda bloqueo verificable.
- [ ] La pantalla no depende de un endpoint no documentado.
- [ ] No se expone DNI completo, token completo ni datos sensibles.

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
Rama sugerida: `frontend/estados-validacion-publica`.
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
No inventes backend, no expongas DNI completo ni token completo y no agregues dependencias.
No toques PHP, base, deploy ni material_privado_no_versionar/. No ejecutes commit, push, merge ni rebase.
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
Rama sugerida: `frontend/admin-shell-login`.
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
No toques PHP, base, deploy ni material_privado_no_versionar/. No ejecutes commit, push, merge ni rebase.
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
Rama sugerida: `frontend/cursos-fechas-admin`.
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
No toques PHP, base, deploy ni material_privado_no_versionar/. No ejecutes commit, push, merge ni rebase.
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
Rama sugerida: `frontend/asistencias-presentes`.
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
No persistas datos reales, no inventes API y no expongas DNI completo.
No toques PHP, base, deploy ni material_privado_no_versionar/. No ejecutes commit, push, merge ni rebase.
```

Validaciones automáticas:
- [ ] `npm test` pasa o se reporta ausencia de runner.
- [ ] `npm run build` pasa o queda bloqueo verificable.
- [ ] La UI no persiste datos reales.
- [ ] No hay DNI completo ni datos sensibles en mocks.

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
Rama sugerida: `frontend/certificaciones-admin`.
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
No expongas DNI completo ni token completo. No toques PHP, base, deploy ni material_privado_no_versionar/.
No ejecutes commit, push, merge ni rebase.
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
Rama sugerida: `frontend/servicios-mock-contratos`.
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
No toques PHP, base, deploy ni material_privado_no_versionar/. No ejecutes commit, push, merge ni rebase.
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
Rama sugerida: `frontend/preparar-api-php`.
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
No toques PHP, base, deploy ni material_privado_no_versionar/. No ejecutes commit, push, merge ni rebase.
```

Validaciones automáticas:
- [ ] `npm test` pasa o se reporta ausencia de runner.
- [ ] `npm run build` pasa o queda bloqueo verificable.
- [ ] No hay llamadas reales a endpoints no aprobados.
- [ ] La URL futura respeta `/certificados/api/` solo como contrato documentado.

QA manual:
- [ ] La app sigue funcionando con mocks.
- [ ] Errores de servicio están previstos sin romper UI.
- [ ] No se exponen tokens, DNI completo ni errores técnicos crudos.
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
Rama sugerida: `frontend/tests-basicos`.
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
No agregues frameworks nuevos, no toques backend/base/deploy/material_privado_no_versionar/ y no ejecutes commit, push, merge ni rebase.
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
Rama sugerida: `qa/frontend-manual-completo`.
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
No ejecutes commit, push, merge ni rebase.
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
- [ ] No se muestran DNI completo, tokens completos ni datos reales.

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
Rama sugerida: `frontend/build-certificados`.
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
No toques PHP, base de datos ni material_privado_no_versionar/. No ejecutes commit, push, merge ni rebase.
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

Objetivo: entregar a Marcos un reporte revisable con estado, evidencia, riesgos, pendientes y comandos Git propuestos para decisión humana.
Rama sugerida: `docs/handoff-frontend-matias`.
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
bloqueos, riesgos, próximos pasos y comandos Git propuestos sin ejecutarlos.
No hagas commit, push, merge ni rebase. No despliegues y no toques backend/base/material_privado_no_versionar/.
```

Validaciones automáticas:
- [ ] `git status --short` y `git diff --stat` quedan registrados como evidencia, sin ejecutar commit.
- [ ] El handoff lista archivos tocados y validaciones reales.
- [ ] Los comandos Git aparecen como propuesta, no como acción ejecutada por OpenCode.

QA manual:
- [ ] Marcos puede revisar qué cambió sin reconstruir todo el ciclo.
- [ ] Pendientes y riesgos están separados de lo completado.
- [ ] No se ocultan bloqueos de API, diseño, tests o deploy.
- [ ] Queda claro qué requiere decisión humana.

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
| `muestra_pagina/README.md` y `muestra_pagina/AGENTS.md` | Antes de auditar o portar la referencia visual. |
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
- [ ] No se muestran DNI completo, tokens completos ni datos sensibles.
- [ ] No se instalaron dependencias nuevas sin aprobación.
- [ ] No se inventaron endpoints ni contratos API.
- [ ] OpenCode no ejecutó commit, push, merge, rebase ni deploy.

## Checklist manual por pantalla

Usá esta tabla como control común para cada pantalla o estado visual tocado.

| Pantalla/estado | Controles mínimos |
|---|---|
| Validación pública válida | Mensaje de autenticidad claro, datos mínimos, sin DNI/token completo, responsive, foco visible, consola limpia. |
| Certificación revocada | Comunica invalidez sin ambigüedad, no parece error técnico, contraste correcto, no expone datos sensibles. |
| Certificación no encontrada | Indica “no verificable”, no culpa al usuario, no muestra stack/error crudo, funciona en móvil. |
| Error técnico | Sugiere reintentar o contactar, no muestra detalles internos, mantiene navegación y foco. |
| Login/admin shell | No promete autenticación real si no existe, no hardcodea credenciales, formulario accesible, estados visuales claros. |
| Cursos y fechas | Estados vacío/carga/error/éxito, formularios con labels, listas legibles en móvil, sin persistencia real no aprobada. |
| Asistencias presentes | Marcar/desmarcar es claro, tabla/lista usable con teclado, sin DNI completo, consola limpia. |
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
| Política frontend, pruebas y QA | `Política frontend, pruebas y QA`, checklists de cada ciclo, `Checklist manual por pantalla`. |
| Errores comunes y límites | `Errores comunes y límites`, `Qué NO hacer` de cada ciclo, seguridad final. |
| Ciclos F0-01 a F3-06 | Secciones `Semana 0`, `Semana 1`, `Semana 2`, `Semana 3` con ciclos F0-01..F3-06. |
| Reporte final y propuestas Git | `Reporte final por ciclo`, `Plantilla final de reporte para Marcos`, `Propuesta de comandos Git`. |

Resultado: los 8 requirements y sus escenarios tienen sección o ciclo asignado. Esta guía no autoriza acceso a material privado, dependencias nuevas sin aprobación, commits/push automáticos, merge, rebase, deploy ni cambios backend/base de datos.
