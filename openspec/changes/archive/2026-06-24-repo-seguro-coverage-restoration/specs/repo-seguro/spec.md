# Delta for repo-seguro

## MODIFIED Requirements

### Requirement: Protección de material sensible antes de versionar

El repositorio MUST impedir que dumps, backups, logs, credenciales, configuraciones reales y carpetas `.git` internas queden listos para commit. La regla global `*.sql` MUST permitir únicamente negation para archivos ubicados bajo `database/migrations/` y `database/seeds/`; todo `*.sql` bajo `material_privado_no_versionar/`, en raíz, o en cualquier otra ubicación MUST permanecer ignorado. El material bajo `material_privado_no_versionar/` MAY consultarse de forma local para auditoría estructural sin exponer valores, manteniendo siempre la prohibición de versionado.
(Previously: el archive de `auditoria-material-original` preservó solo los escenarios audit-focused y dejó fuera cuatro escenarios de cobertura histórica.)

#### Scenario: Reglas de ignorado presentes

- **Given** el repositorio luego de este ciclo
- **When** se inspecciona `.gitignore`
- **Then** MUST incluir reglas para `material_privado_no_versionar/`, `*.sql`, `*.sql.gz`, `*.zip`, `error_log`, `*.log`, `.env`, archivos de configuración sensible y `**/.git/`.
- **And** MUST incluir reglas de negation `!database/migrations/**/*.sql` y `!database/seeds/**/*.sql`.

#### Scenario: Artefactos sensibles fuera de la raíz

- **Given** existían dumps SQL y `well-known/` en la raíz
- **When** finaliza la reorganización
- **Then** esos artefactos MUST estar bajo `material_privado_no_versionar/` sin haber sido inspeccionados ni copiados a documentación.

#### Scenario: SQL controlado versionable

- **Given** un archivo en `database/migrations/` o `database/seeds/`
- **When** se inspecciona `.gitignore`
- **Then** MUST estar cubierto por una regla de negation que permita su versionado.

#### Scenario: SQL sensible sigue ignorado

- **Given** un archivo `*.sql` en raíz o bajo `material_privado_no_versionar/`
- **When** se inspecciona `.gitignore`
- **Then** MUST seguir ignorado por la regla global `*.sql` o por patrones específicos más restrictivos.

#### Scenario: Auditoría local sin staging

- **Given** material privado bajo `material_privado_no_versionar/`
- **When** se realiza una auditoría local autorizada
- **Then** MUST consultarse únicamente con `ls`, `stat` y `grep` sobre DDL.
- **And** MUST NOT quedar ningún archivo del directorio staged ni untracked para commit.
- **And** MUST NOT figurar credenciales, DNI, tokens, filas de dump ni contenido de zips en los documentos resultantes.

#### Scenario: `.gitignore` y validación al cerrar auditoría

- **Given** un ciclo de auditoría finalizado
- **When** se valida el estado del repositorio
- **Then** `.gitignore` MUST seguir cubriendo `material_privado_no_versionar/`, `*.sql` sensible, `*.zip`, `error_log`, `*.log` y `**/.git/`.
- **And** SHOULD ejecutarse `git status --ignored --short` o, si no hay Git, verificación equivalente por path.
