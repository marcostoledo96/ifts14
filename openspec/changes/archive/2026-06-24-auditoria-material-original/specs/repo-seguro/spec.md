# Delta for repo-seguro

## MODIFIED Requirements

### Requirement: Protección de material sensible antes de versionar

El repositorio MUST impedir que dumps, backups, logs, credenciales, configuraciones reales y carpetas `.git` internas queden listos para commit. La regla global `*.sql` MUST permitir únicamente negation para archivos ubicados bajo `database/migrations/` y `database/seeds/`; todo `*.sql` bajo `material_privado_no_versionar/`, en raíz, o en cualquier otra ubicación MUST permanecer ignorado. El material bajo `material_privado_no_versionar/` MAY consultarse de forma local para auditoría estructural sin exponer valores, manteniendo siempre la prohibición de versionado.
(Previously: solo se prohibía versionar; ahora se documenta también la práctica de auditoría local con reglas reforzadas.)

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

## ADDED Requirements

### Requirement: Práctica de auditoría local con reglas reforzadas

Una auditoría local del material privado MUST limitarse a información estructural y nunca incluir valores reales. Los productos de la auditoría (inventarios y hallazgos) viven bajo `docs/auditoria/` y son los únicos documentos que pueden referenciar el material privado; cualquier referencia a contenido del material está prohibida.

#### Scenario: Productos de auditoría aislados

- **Given** un ciclo de auditoría finalizado
- **When** se inspecciona el árbol versionado
- **Then** los documentos de hallazgos MUST estar bajo `docs/auditoria/`.
- **And** MUST NOT existir documentos en otras áreas que peguen contenido del material privado.

#### Scenario: Sin secretos en productos de auditoría

- **Given** los documentos de hallazgos redactados
- **When** se hace `grep` por patrones sensibles
- **Then** MUST NOT encontrarse contraseñas, claves, DNIs, hashes de tokens ni contenido de filas SQL.
