# Spec — auditoría segura del material original

## Purpose

Definir la capacidad del proyecto `ifts14` de auditar de forma segura y trazable el material privado descargado bajo `material_privado_no_versionar/`, produciendo solo información estructural (nombres, tamaños, patrones, hipótesis, esquema a alto nivel) y reforzando la prohibición de versionar credenciales, datos personales, filas de dumps, logs y contenido de zips, sin debilitar las garantías de `repo-seguro`.

## Requirements

### Requirement: Inventario estructural sin valores

El ciclo MUST listar únicamente nombres, rutas relativas, tamaños y tipo probable, sin citar ni pegar contenido.

#### Scenario: Listado completo y verificable

- **Given** el material en `material_privado_no_versionar/`
- **When** finaliza la inspección
- **Then** MUST existir inventario tabular con nombre, ruta y tamaño verificable con `ls -la`.
- **And** MUST NOT figurar contenido textual, hashes, credenciales, DNI, tokens ni filas de dump.

#### Scenario: Ausencia de valores en docs

- **Given** los documentos de hallazgos redactados
- **When** se hace `grep` por patrones sensibles
- **Then** MUST NOT encontrarse contraseñas, claves, DNIs, hashes de tokens ni contenido de filas SQL.

### Requirement: Extracción de esquema SQL solo si es viable y segura

El ciclo MAY intentar DDL desde los `*.sql` usando `grep`/`head` con patrones `CREATE TABLE`, `CREATE INDEX`, `INSERT IGNORE`, `USE` y `SET`. MUST limitarse a nombres de tabla, columnas y relaciones; MUST NOT incluir filas reales. Si no puede limitarse de forma segura, MUST omitirse y documentarse la limitación.

#### Scenario: DDL extraído de forma segura

- **Given** un dump bajo `material_privado_no_versionar/db_dumps_originales/`
- **When** `grep -E 'CREATE TABLE|PRIMARY KEY|FOREIGN KEY|INDEX'` devuelve solo DDL
- **Then** MUST documentarse tablas, columnas clave y relaciones en `docs/auditoria/02-hallazgos-dumps-sql.md`.
- **And** MUST NOT persistirse ninguna fila.

#### Scenario: DDL no extraíble de forma segura

- **Given** un dump donde `grep` no diferencia DDL de DML de forma confiable
- **When** se evalúa el riesgo
- **Then** MUST omitirse la extracción y documentarse por qué no se hizo.

### Requirement: Hallazgos del sitio original separados por dominio

Los hallazgos MUST separarse en cuatro secciones: frontend Angular, backend PHP, base de datos y deploy/cPanel. Cada hallazgo MUST etiquetar si fue Observado o Hipótesis.

#### Scenario: Frontend Angular observado

- **Given** artefactos `main-*.js`, `chunk-*.js`, `styles-*.css`, `index.html` y `prerendered-routes.json`
- **When** se redacta la sección frontend
- **Then** SHOULD documentarse como evidencia de build Angular prerenderizado.

#### Scenario: Backend PHP observado

- **Given** archivos como `test-connection.php`, `api.zip` y `3rdpartylicenses.txt`
- **When** se redacta la sección backend
- **Then** SHOULD documentarse la existencia de un endpoint PHP de prueba de conexión y que el resto del backend podría estar empaquetado en `api.zip` sin descomprimirlo.

#### Scenario: Deploy cPanel observado

- **Given** `.htaccess`, `favicon.ico`, `error_log` y rutas como `.well-known/`, `cgi-bin/`, `media/`, `assets/`
- **When** se redacta la sección deploy
- **Then** SHOULD documentarse compatibilidad con hosting compartido tipo cPanel y que `error_log` confirma tráfico real pero no debe inspeccionarse.

### Requirement: Documentación de áreas actualizada con hipótesis

`docs/backend/00-php84-api.md`, `docs/database/00-mariadb.md` y `docs/deploy/00-cpanel-certificados.md` SHOULD incorporar al final una sección "Hallazgos de auditoría (hipótesis)" con bullets breves.

#### Scenario: Lenguaje de hipótesis explícito

- **Given** las secciones agregadas
- **When** se las lee
- **Then** MUST distinguir entre "Observado" e "Hipótesis" en cada bullet, y MUST NOT contener credenciales, rutas internas, hosts reales ni hashes.

### Requirement: Índice general alineado con la nueva ruta de auditoría

Si se crean nuevos documentos en `docs/auditoria/`, `docs/00-indice-general.md` MUST referenciarlos en la fila de Auditoría. Cada ruta MUST existir en el árbol.

### Requirement: `material_privado_no_versionar/` sigue ignorado

El ciclo MUST terminar con `material_privado_no_versionar/`, los dumps `*.sql` sensibles, los zips, los logs y los `.git/` internos ignorados por `.gitignore`.

#### Scenario: Verificación con Git

- **Given** que existe `.git/`
- **When** se ejecuta `git status --ignored --short`
- **Then** los ítems sensibles MUST figurar como ignorados.

#### Scenario: Verificación sin Git

- **Given** que el repositorio no es Git
- **When** se aplica la verificación
- **Then** MUST documentarse la limitación y usar `ls` + `grep` sobre `.gitignore` y rutas sensibles.

### Requirement: Restricciones de producto siguen vigentes

El ciclo MUST NO implementar Angular, PHP, base de datos, dependencias, ni hacer commit, push o merge.

- **Given** que este es un cambio solo de auditoría y documentación
- **When** finaliza el ciclo
- **Then** MUST NOT existir `apps/frontend-angular/src/`, `apps/backend-php/src/`, migraciones reales con lógica de negocio, ni `package.json`/`composer.json` de producto.

### Requirement: Validación final sin contenido sensible staged

Antes de cerrar, MUST validarse que no hay contenido sensible staged ni untracked relevante. Con Git, `git status --short` no debe listar nada bajo `material_privado_no_versionar/`, ningún dump `*.sql` ni `*.zip`. Sin Git, MUST documentarse la limitación y validar por path con `ls`.
