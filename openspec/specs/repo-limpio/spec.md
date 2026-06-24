# Spec — repositorio limpio y unificado

## Purpose

Definir la capacidad del repositorio `ifts14` de mantener una única fuente vigente de documentación raíz, `AGENTS.md` por carpeta activa, prompts operativos por rol, índice alineado y ausencia de carpetas temporales de paquetes aplicados, sin debilitar la protección de material sensible establecida en `repo-seguro`.

## Requirements

### Requirement: `.gitignore` completo para credenciales PHP y cache de tooling

El repositorio MUST mantener un `.gitignore` que cubra credenciales PHP, cache de tooling y material privado, además de lo ya exigido por `repo-seguro`.

#### Scenario: Patrones PHP sensibles presentes

- **Given** el repositorio luego de este ciclo
- **When** se inspecciona `.gitignore`
- **Then** MUST incluir reglas para `**/config.php`, `**/config.local.php`, `**/database.php`, `**/db.php`, `**/conexion.php`, `**/connection.php`, `**/credentials.php` y `**/secrets.php`.

#### Scenario: Cache de tooling ignorado

- **Given** que `.atl/` puede contener cache regenerable
- **When** se inspecciona `.gitignore`
- **Then** MUST incluir la regla `.atl/*.cache.json`.

#### Scenario: Material privado sigue ignorado

- **Given** que `repo-seguro` ya exige ignorar `material_privado_no_versionar/`, `*.sql`, `*.zip`, `error_log`, `*.log`, `.env` y `**/.git/`
- **When** se completa este ciclo
- **Then** esas reglas MUST permanecer vigentes.

### Requirement: AGENTS.md por carpeta activa con contenido útil

#### Scenario: Cobertura

- **Given** las carpetas activas
- **When** se inspecciona cada una
- **Then** MUST existir `AGENTS.md` en las 8 carpetas activas.

#### Scenario: Contenido accionable

- **Given** que los `AGENTS.md` actuales son placeholders
- **When** se aplica este ciclo
- **Then** SHOULD quedar con reglas de dominio: qué se versiona, qué se prohíbe, qué se actualiza en `sdd-archive`.

### Requirement: Prompts operativos por rol en la raíz

- **Given** que Marcos ejecuta backend/DB/integración/deploy/seguridad y Matías ejecuta frontend Angular 20
- **When** se aplica este ciclo
- **Then** MUST existir en raíz `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` y `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` con ciclos semanales y comandos Git base.

### Requirement: Índice general alineado con archivos reales

- **Given** que el índice puede referenciar documentos inexistentes
- **When** se aplica este ciclo
- **Then** MUST listar solo archivos vigentes y SHOULD segmentar la lectura por rol.

### Requirement: Matriz de `sdd-archive` explícita

- **Given** la matriz vigente que cubre dominios clásicos
- **When** se aplica este ciclo
- **Then** MUST incluir filas para `MARCOS_PROMPTS_*.md` y `MATIAS_PROMPTS_*.md`.

### Requirement: Archivado de prompts viejos cuando aplica

#### Scenario: Movimiento de prompts viejos

- **Given** los prompts viejos en `docs/opencode/07_...` y `08_...`
- **When** los prompts raíz los reemplazan
- **Then** MUST moverse a `docs/opencode/archive/` y el índice SHOULD indicar que los prompts raíz son la guía vigente.

#### Scenario: Conservación de soporte útil

- **Given** un prompt viejo con detalles todavía relevantes
- **When** no hay reemplazo completo
- **Then** MAY permanecer en `docs/opencode/` con aclaración en el índice.

### Requirement: Eliminación controlada de carpetas temporales

Las carpetas `ifts14_post_reorg_auditoria_y_prompts/` y `ifts14_planificacion_opencode_inicial/` MUST eliminarse solo después de promover o verificar que su contenido útil ya está en el árbol activo.

#### Scenario: Promoción verificada

- **Given** carpetas temporales con duplicados y únicos
- **When** se aplica este ciclo
- **Then** SHOULD listarse qué únicos se promovieron o ya existían antes de cada `rm -rf`.

#### Scenario: Verificación post-eliminación

- **Given** ambas carpetas eliminadas
- **When** se aplica este ciclo
- **Then** MUST quedar registrado en `tasks.md` qué se eliminó y qué no.

### Requirement: Verificación final sin commits peligrosos

#### Scenario: Con Git disponible

- **Given** que existe `.git/`
- **When** se aplica este ciclo
- **Then** MUST ejecutarse `git status --ignored --short` y confirmarse ignorados los patrones sensibles clave.

#### Scenario: Sin Git

- **Given** que el repositorio no es Git
- **When** se aplica este ciclo
- **Then** MUST documentarse la limitación y aplicar verificación basada en `ls` + `grep` sobre rutas sensibles.

### Requirement: Restricciones de producto siguen vigentes

El ciclo MUST NO implementar Angular, PHP, base de datos, dependencias, ni hacer commit, push o merge.

- **Given** que este es un cambio solo documental
- **When** finaliza el ciclo
- **Then** MUST NOT existir `apps/frontend-angular/src/`, `apps/backend-php/src/`, migraciones reales ni `package.json`/`composer.json` de producto.

## REMOVED Requirements

### Requirement: Carpeta temporal de paquete de reorganización

(Reason: la carpeta cumplió su función y debe desaparecer para evitar duplicación.)
