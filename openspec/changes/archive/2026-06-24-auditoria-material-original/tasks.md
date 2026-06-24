# Tasks: Auditoría segura del material original

## Review Workload Forecast

| Campo | Valor |
|---|---|
| Estimated changed lines | ~250-450 (documental) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR (force-chained heredado) |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: stacked-to-main
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Auditoría completa + docs + spec | PR 1 | Base main; cubre inventario, hallazgos, docs/00, dos archivos de spec. |

## Phase 1: Validación previa del ignore

- [x] 1.1 Confirmar que `material_privado_no_versionar/`, `db_dumps_originales/`, `servidor_original/`, `*.sql` en raíz, `*.zip`, `error_log`, `*.log` y `**/.git/` siguen ignorados (`grep` sobre `.gitignore`).
- [x] 1.2 Si existe `.git/`, ejecutar `git status --ignored --short` y documentar el resultado; si no, documentar la limitación y usar `ls` + `grep`.

## Phase 2: Inventario estructural

- [x] 2.1 Ejecutar `ls -la` sobre `material_privado_no_versionar/servidor_original/` y `db_dumps_originales/` para nombre, ruta relativa y tamaño.
- [x] 2.2 Ejecutar `ls -la` sobre `servidor_original/well-known/` para listar artefactos del build Angular.
- [x] 2.3 Reemplazar `docs/auditoria/00-inventario-material-descargado.md` con inventario tabular (ítem, ruta, tamaño, tipo probable). Sin valores.

## Phase 3: Hallazgos del sitio original

- [x] 3.1 Crear `docs/auditoria/01-auditoria-material-original.md` con cuatro secciones: frontend, backend, base de datos, deploy/cPanel.
- [x] 3.2 Etiquetar cada bullet como `Observado` o `Hipótesis`; nunca pegar credenciales, rutas internas, hosts reales ni hashes.
- [x] 3.3 Confirmar que no se descomprimen `browser.zip` ni `api.zip`; documentar tamaño y nombre como evidencia.

## Phase 4: Extracción de esquema SQL (condicional)

- [x] 4.1 Intentar `grep -nE 'CREATE TABLE|PRIMARY KEY|FOREIGN KEY|KEY |INDEX|ENGINE=|CHARSET='` sobre cada dump; registrar solo DDL.
- [x] 4.2 Si la salida cabe en pocas líneas y no incluye filas, crear `docs/auditoria/02-hallazgos-dumps-sql.md` con tablas, columnas clave y relaciones a alto nivel.
- [x] 4.3 Si la salida no puede limitarse a DDL de forma segura, omitir el documento y registrar la limitación en `01-auditoria-material-original.md` o `apply-progress.md`.

## Phase 5: Actualización de áreas

- [x] 5.1 Agregar sección breve "Hallazgos de auditoría (hipótesis)" al final de `docs/backend/00-php84-api.md`, `docs/database/00-mariadb.md` y `docs/deploy/00-cpanel-certificados.md`.
- [x] 5.2 Diferenciar `Observado` vs `Hipótesis` en cada bullet; no pegar credenciales ni hosts reales.
- [x] 5.3 Actualizar `docs/00-indice-general.md` para listar la nueva ruta de auditoría y validar cada ruta con `ls`.

## Phase 6: Verificación final

- [x] 6.1 Confirmar que `material_privado_no_versionar/` y los dumps sensibles siguen ignorados.
- [x] 6.2 Ejecutar `grep -nE 'pass|token|secret|key=|dni=|INSERT INTO' docs/auditoria/*.md` y validar que el resultado esté vacío o contenga solo referencias a reglas.
- [x] 6.3 Confirmar que no se creó producto Angular/PHP/MariaDB ni `package.json`/`composer.json` de producto.
- [x] 6.4 Registrar en `apply-progress.md` la nota sobre el alcance limitado del ciclo y, si corresponde, la limitación de extracción de DDL.

## Notas operativas

- No commitear, pushear ni mergear.
- Mantener español argentino formal en todo archivo nuevo.
- Si aparece un archivo sensible no cubierto por `.gitignore`, agregarlo antes de continuar.
- Si un hallazgo parece requerir más profundidad (por ejemplo, descomprimir `api.zip`), diferirlo a un ciclo SDD posterior; este cambio es solo documental.
