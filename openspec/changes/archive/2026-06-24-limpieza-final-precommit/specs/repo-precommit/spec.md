# Spec — repositorio en estado precommit documental

## Purpose

Definir la capacidad del repositorio `ifts14` de mantener un estado documental final previo al primer commit seguro, con `.gitignore` afinado para permitir migraciones y seeds controlados, archivado correcto de prompts viejos, marcadores históricos en carpetas activas vacías e índice alineado, sin implementar producto ni relajar la protección de material sensible ya establecida por `repo-seguro`.

## Requirements

### Requirement: SQL controlado versionable, dumps y privados siguen ignorados

El repositorio MUST versionar únicamente `*.sql` que viva bajo `database/migrations/` o `database/seeds/`. Todo otro `*.sql`, incluidos los ubicados en raíz y bajo `material_privado_no_versionar/`, MUST permanecer ignorado.

#### Scenario: Migración en directorio permitido

- **Given** un archivo `database/migrations/2026_06_24_create_alumnos.sql`
- **When** se inspecciona `.gitignore`
- **Then** MUST estar cubierto por una regla de negation que permita versionarlo.
- **And** MUST permanecer ignorado `material_privado_no_versionar/**/*.sql`.

#### Scenario: Dump global sigue ignorado

- **Given** un dump `ifts14c8_db.sql` en la raíz
- **When** se inspecciona `.gitignore`
- **Then** MUST seguir ignorado por la regla global `*.sql`.

### Requirement: Marcador histórico para planificación inicial

El repositorio MUST contar con un `AGENTS.md` breve en `docs/planificacion-inicial/` que declare el directorio como histórico y desaconseje ediciones mayores, sin mover la carpeta.

#### Scenario: AGENTS.md presente y mínimo

- **Given** el directorio `docs/planificacion-inicial/`
- **When** finaliza este ciclo
- **Then** MUST existir `docs/planificacion-inicial/AGENTS.md` con declaración histórica y enlace al índice vigente.

#### Scenario: Carpeta no movida

- **Given** que el directorio es histórico pero conservado
- **When** se aplica este ciclo
- **Then** MUST NOT moverse ni renombrarse la carpeta.

### Requirement: Archivos `.gitkeep` en carpetas activas vacías

Las carpetas activas versionadas que estén vacías MUST contener un `.gitkeep` para asegurar su presencia en el repositorio.

#### Scenario: Cobertura de carpetas vacías

- **Given** las carpetas activas `database/migrations/`, `database/seeds/`, `database/docs/`, `deploy/cpanel/`, `deploy/htaccess/`
- **When** finaliza este ciclo
- **Then** MUST existir `.gitkeep` en cada una.

#### Scenario: `.gitkeep` no carga contenido

- **Given** los archivos creados
- **When** se inspecciona su contenido
- **Then** SHOULD estar vacíos o contener una sola línea declarativa corta.

### Requirement: `docs/opencode/` con AGENTS.md y archivo navegable

El directorio `docs/opencode/` MUST contar con su propio `AGENTS.md` y un `archive/README.md` que explique el propósito del histórico.

#### Scenario: AGENTS.md de opencode

- **Given** el directorio `docs/opencode/`
- **When** finaliza este ciclo
- **Then** MUST existir `docs/opencode/AGENTS.md` con reglas de uso y enlace al índice.

#### Scenario: README del archivo

- **Given** el subdirectorio `docs/opencode/archive/`
- **When** finaliza este ciclo
- **Then** MUST existir `archive/README.md` describiendo el carácter histórico y los criterios de archivo.

### Requirement: Archivo de prompts viejos cuando aplica

Cuando un prompt de `docs/opencode/` quede reemplazado por un prompt raíz, MUST moverse a `docs/opencode/archive/`.

#### Scenario: PRIMER_PROMPT_REORGANIZACION archivado

- **Given** `docs/opencode/PRIMER_PROMPT_REORGANIZACION.md` reemplazado por el ciclo `reorganizacion-segura-inicial` ya archivado
- **When** finaliza este ciclo
- **Then** MUST existir en `docs/opencode/archive/PRIMER_PROMPT_REORGANIZACION.md` y MUST NOT existir en su ubicación original.

### Requirement: Índice general alineado con archivos reales

El `docs/00-indice-general.md` MUST listar únicamente archivos existentes y SHOULD segmentar la lectura por rol y por área.

#### Scenario: Rutas válidas

- **Given** el índice vigente
- **When** se valida cada ruta mencionada
- **Then** MUST existir en el árbol versionado.

#### Scenario: Mención del registro de skills

- **Given** que `.atl/skill-registry.md` solo aplica a trabajo con skills
- **When** se aplica este ciclo
- **Then** el índice SHOULD mencionarlo como referencia condicional sin listarlo como lectura por defecto.

### Requirement: Verificación final sin commits peligrosos

El ciclo MUST validar el estado documental sin ejecutar `git add`, `commit`, `push` ni `merge`.

#### Scenario: Con Git disponible

- **Given** que existe `.git/`
- **When** se aplica este ciclo
- **Then** SHOULD ejecutarse `git status --ignored --short` y confirmarse la cobertura de los patrones sensibles.

#### Scenario: Sin Git

- **Given** que el repositorio no es Git
- **When** se aplica este ciclo
- **Then** MUST documentarse la limitación y aplicar verificación por path con `ls` + `grep` sobre `.gitignore` y carpetas sensibles.

### Requirement: Restricciones de producto siguen vigentes

El ciclo MUST NO implementar Angular, PHP, base de datos, dependencias, ni hacer commit, push o merge.

- **Given** que este es un cambio solo documental
- **When** finaliza el ciclo
- **Then** MUST NOT existir `apps/frontend-angular/src/`, `apps/backend-php/src/`, migraciones reales con lógica de negocio ni `package.json`/`composer.json` de producto.

### Requirement: Expansión de prompts operativos diferida

La expansión de `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` y `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` MUST diferirse a un ciclo futuro de prioridad media, registrado en el backlog de `sdd-apply`.

- **Given** que los prompts raíz existen y son vigentes
- **When** se aplica este ciclo
- **Then** MUST NOT modificarse su contenido; SHOULD quedar registrada la nota de diferimiento.
