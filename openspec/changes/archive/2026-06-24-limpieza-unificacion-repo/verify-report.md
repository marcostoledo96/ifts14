# Verification Report — limpieza-unificacion-repo

## Resultado

**Change**: `limpieza-unificacion-repo`  
**Modo**: verificación estándar SDD, documental y por paths  
**Veredicto**: **PASS WITH WARNINGS**

El cambio cumple los criterios de aceptación del usuario y los artefactos OpenSpec. La única advertencia es operativa: el directorio no es un repositorio Git, por lo que `git status --ignored --short` no pudo producir estado de ignorados; se aplicó la verificación alternativa por paths y `.gitignore` prevista por la spec.

## Alcance verificado

| Dimensión | Estado | Evidencia |
|---|---:|---|
| Artefactos OpenSpec | PASS | Leídos `proposal.md`, `spec.md`, `design.md`, `tasks.md` y `apply-progress.md`. |
| Tareas | PASS | Todas las tareas de `tasks.md` están marcadas como completadas. |
| `.gitignore` | PASS | Contiene `.atl/*.cache.json`, `**/conexion.php`, patrones PHP sensibles, material privado, dumps, zips, logs, `.env` y `**/.git/`. |
| Carpetas temporales | PASS | No existen `ifts14_post_reorg_auditoria_y_prompts/`, `ifts14_planificacion_opencode_inicial/` ni `ifts14_archivos_raiz_y_prompt_reorganizacion/`. |
| AGENTS.md por carpeta activa | PASS | Existen en `docs/`, `openspec/`, `database/`, `deploy/`, `scripts/`, `muestra_pagina/`, `apps/frontend-angular/`, `apps/backend-php/`. |
| Prompts raíz por rol | PASS | Existen `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` y `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`, con roles y ciclos acordes. |
| Índice documental | PASS | `docs/00-indice-general.md` cubre humanos, IA, frontend, backend, base de datos, deploy, auditoría, scripts, specs y prompts vigentes; las rutas referenciadas existen. |
| Matriz `sdd-archive` | PASS | `docs/07-sdd-archive-y-mantenimiento-documentacion.md` incluye filas explícitas para prompts de Marcos y Matías. |
| Archivado de prompts viejos | PASS | `07_PROMPTS_MARCOS_ORDENAMIENTO.md` y `08_PROMPTS_MATIAS_FRONTEND_ANGULAR.md` están en `docs/opencode/archive/`; ya no están vivos en `docs/opencode/`. |
| `muestra_pagina/` | PASS | Contiene solo `README.md` y `AGENTS.md`; se mantiene como referencia/documentación, sin pantallas ni Angular. |
| Producto no implementado | PASS | No existen `angular.json`, `package.json`, `composer.json`, `apps/frontend-angular/src/`, `apps/backend-php/src/` ni SQL de migración. |
| Sensibles listos para commit | PASS | No se detectaron en raíz dumps, zips, logs, `.env`, credenciales ni configs PHP sensibles. |
| Git ignored status | WARNING | `git status --ignored --short` falló porque no hay `.git/`; limitación esperada por la spec. |

## Evidencia de comandos

| Comando | Resultado | Uso |
|---|---:|---|
| `rtk git status --ignored --short` | WARNING | Falló con `fatal: no es un repositorio git`; se documenta la limitación. |
| Script Python de verificación segura por paths | PASS | Confirmó listas vacías para faltantes críticos: `.gitignore`, AGENTS, prompts, temporales, manifests de producto, SQL de database y sensibles de raíz. |

No se ejecutaron tests de producto porque este cambio no crea producto, dependencias, runtime Angular/PHP ni migraciones. Para esta spec documental, la evidencia ejecutable aplicable fue validación de paths, presencia/ausencia de archivos y lectura cruzada de documentación.

## Matriz de cumplimiento de spec

| Requirement / Scenario | Estado | Evidencia |
|---|---:|---|
| `.gitignore` completo para credenciales PHP y cache | PASS | Todos los patrones requeridos están presentes. |
| Patrones PHP sensibles presentes | PASS | Incluye `config.php`, `config.local.php`, `database.php`, `db.php`, `conexion.php`, `connection.php`, `credentials.php`, `secrets.php`. |
| Cache de tooling ignorado | PASS | Incluye `.atl/*.cache.json`. |
| Material privado sigue ignorado | PASS | Mantiene reglas para material privado, SQL, zips, logs, `.env` y Git interno. |
| AGENTS.md por carpeta activa | PASS | Ocho rutas requeridas existen y contienen reglas de dominio. |
| Prompts operativos por rol en raíz | PASS | Marcos: backend/DB/deploy/seguridad; Matías: Angular 20/UI. |
| Índice general alineado | PASS | Todas las rutas backtick verificables del índice existen. |
| Matriz `sdd-archive` explícita | PASS | Incluye prompts raíz por rol. |
| Archivado de prompts viejos | PASS | Prompts 07/08 movidos a `docs/opencode/archive/`; el índice declara prompts raíz como vigentes. |
| Eliminación controlada de temporales | PASS | Temporales ausentes; `apply-progress.md` registra promoción/verificación. |
| Verificación final sin commits peligrosos | PASS WITH WARNING | No hay Git; se usó fallback por paths. No se detectaron producto, dependencias ni sensibles de raíz. |
| Restricciones de producto vigentes | PASS | Sin Angular, PHP, DB schema/migrations ni dependencias. |

## Coherencia con diseño

| Decisión de diseño | Estado | Evidencia |
|---|---:|---|
| Reutilizar paquete temporal como fuente, no copia literal | PASS | `apply-progress.md` registra promoción resumida y reemplazo por documentos activos. |
| Validación por path cuando no hay Git | PASS | Se ejecutó fallback por paths tras fallo esperado de Git. |
| Prompts raíz como guía vigente | PASS | Índice apunta a prompts raíz; 07/08 están archivados. |
| Stacked-to-main sin PRs | PASS | `tasks.md` y `apply-progress.md` registran estrategia sin commits. |
| No producto ni runtime | PASS | Estructuras de app/backend/DB permanecen vacías o documentales. |

## Hallazgos

### CRITICAL

- Ninguno.

### WARNING

- El directorio `/home/marcos/Escritorio/ifts14` no es un repositorio Git. No se pudo obtener `git status --ignored --short`; antes del primer commit seguro, ejecutar la verificación Git real luego de inicializar o clonar el repo con `.git/`.

### SUGGESTION

- Considerar un `README.md` breve en `docs/opencode/archive/` para explicar que los prompts archivados son históricos; no bloquea este cambio porque el índice ya aclara que los prompts raíz son los vigentes.

## Resumen de aceptación del usuario

1. `.gitignore` contiene todos los patrones solicitados, incluidos `.atl/*.cache.json` y `conexion.php`: **PASS**.
2. Docs útiles promovidos o ya presentes; temporales removidos; carpeta solicitada inexistente ausente y aclarada por decisión aprobada: **PASS**.
3. `AGENTS.md` existe en las ocho carpetas solicitadas: **PASS**.
4. Prompts raíz existen y son acordes a los roles: **PASS**.
5. `docs/00-indice-general.md` referencia archivos reales y cubre áreas solicitadas: **PASS**.
6. `README.md`, `GUIA.md` y `AGENTS.md` raíz mencionan stack, SDD, seguridad y workflow necesarios: **PASS**.
7. `docs/07-sdd-archive-y-mantenimiento-documentacion.md` incluye matriz explícita: **PASS**.
8. Prompts antiguos reemplazados movidos a `docs/opencode/archive/` y el índice aclara vigencia de prompts raíz: **PASS**.
9. `muestra_pagina/` existe y sigue solo documental/referencia: **PASS**.
10. `git status --ignored --short`: **WARNING**, no hay repo Git; limitación reportada.
11. Sin producto Angular/PHP/DB/dependencias: **PASS**.
12. Sin dumps, well-known, zips, logs ni credenciales en raíz listos para commit: **PASS**.

## Result Contract

**Archive readiness**: Ready, with one operational warning.  
**Recommended next action**: run `sdd-archive` for `limpieza-unificacion-repo`; after Git is initialized or restored, rerun `git status --ignored --short` before staging any files.
