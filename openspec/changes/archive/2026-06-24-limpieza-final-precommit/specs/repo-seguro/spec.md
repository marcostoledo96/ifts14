# Delta for repo-seguro

## MODIFIED Requirements

### Requirement: Protección de material sensible antes de versionar

El repositorio MUST impedir que dumps, backups, logs, credenciales, configuraciones reales y carpetas `.git` internas queden listos para commit. La regla global `*.sql` MUST permitir únicamente negation para archivos ubicados bajo `database/migrations/` y `database/seeds/`; todo `*.sql` bajo `material_privado_no_versionar/`, en raíz, o en cualquier otra ubicación MUST permanecer ignorado.
(Previously: la regla `*.sql` ignoraba todo archivo SQL sin excepciones.)

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
