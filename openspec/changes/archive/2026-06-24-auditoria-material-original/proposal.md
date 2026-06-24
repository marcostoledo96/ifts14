# Proposal: Auditoría segura del material original descargado

## Intent

Inventariar de manera segura el material original bajo `material_privado_no_versionar/`, para mapear la estructura del sitio actual sin exponer credenciales, datos personales, secretos, dumps completos, logs ni contenido sensible. El material ya está ignorado por `.gitignore` desde `repo-seguro`; este cambio lo consulta de forma controlada para producir un mapa estructural e hipótesis sobre backend, frontend, base de datos y deploy. Toda la salida es estructural; ningún valor real se persiste.

## Scope

### In Scope

- Inventariar nombres, tamaños y estructura de `material_privado_no_versionar/servidor_original/` y `material_privado_no_versionar/db_dumps_originales/`.
- Documentar hipótesis de áreas PHP, configuración sensible, endpoints candidatos, integración con base de datos y artefactos cPanel/deploy, sin copiar ni citar valores.
- Intentar extracción de DDL con `grep` sobre los dos `*.sql` si es viable; documentar tablas y relaciones a alto nivel sin persistir filas.
- Actualizar `docs/auditoria/00-inventario-material-descargado.md` y crear documentos de hallazgos en `docs/auditoria/`.
- Reforzar `docs/backend/`, `docs/database/` y `docs/deploy/` solo con hipótesis estructurales.
- Ajustar `docs/00-indice-general.md` para listar las nuevas rutas reales.
- Crear la capacidad OpenSpec `auditoria-material-original`.
- Validar que `material_privado_no_versionar/` siga ignorado.

### Out of Scope

- Producto (Angular 20, PHP 8.4.21, MariaDB 10.6.27), dependencias, primer commit, push, merge.
- Lectura de credenciales, tokens, claves, logs completos, contenido de zips, filas de dumps SQL.
- Implementar endpoints reales o tocar el hosting.

## Capabilities

### New Capabilities

- `auditoria-material-original`: práctica de auditoría segura de material privado descargado, con reglas de inspección estructural, DDL condicional, separación hallazgos/valores y obligaciones reforzadas sobre `material_privado_no_versionar/`.

### Modified Capabilities

- `repo-seguro`: el delta documenta la excepción controlada de auditoría local sin debilitar la prohibición de versionado.

## Approach

SDD híbrido (OpenSpec + Engram). Planificación primero; ejecución de auditoría encapsulada en `tasks.md` con orden seguro: (1) confirmar ignorado, (2) listar estructura, (3) intentar DDL con `grep`, (4) redactar hallazgos, (5) actualizar índice. Entrega `force-chained` con `stacked-to-main`, presupuesto 800 líneas.

## Affected Areas

| Área | Acción |
|---|---|
| `docs/auditoria/00-inventario-material-descargado.md` | Modify |
| `docs/auditoria/01-auditoria-material-original.md` | Create |
| `docs/auditoria/02-hallazgos-dumps-sql.md` | Create (condicional) |
| `docs/backend/00-php84-api.md` | Modify (hipótesis) |
| `docs/database/00-mariadb.md` | Modify (hipótesis) |
| `docs/deploy/00-cpanel-certificados.md` | Modify (hipótesis) |
| `docs/00-indice-general.md` | Modify (rutas reales) |
| `openspec/specs/auditoria-material-original/spec.md` | Create |
| `openspec/specs/repo-seguro/spec.md` | Modify (delta) |

## Risks

| Riesgo | Mitigación |
|---|---|
| Exponer credenciales, DNI o secretos al documentar | Solo nombres, rutas y patrones; revisar diff antes de persistir. |
| Persistir filas de dumps SQL por error | `grep`/`head` solo con `CREATE TABLE`/`CREATE INDEX`; nunca pegar filas. Si no se puede limitar, omitir. |
| Romper el ignore de `material_privado_no_versionar/` | Validar `.gitignore` antes y después; `git status --ignored --short` si hay Git, o path-based si no. |
| Lectura de zips grandes en contexto | No descomprimir `browser.zip`/`api.zip`; documentar tamaño y nombre. |
| Hipótesis mal calibradas sobre backend real | Diferenciar explícitamente "Observado" vs "Hipótesis". |

## Rollback Plan

Borrar documentos de auditoría creados, revertir modificaciones a `docs/backend/`, `docs/database/`, `docs/deploy/` e índice, descartar la nueva spec y mover el change folder a `archive/` con motivo. Sin estado remoto; nada dentro de `material_privado_no_versionar/` se modificó.

## Dependencies

- `repo-seguro` como base de protección.
- `repo-limpio` y `repo-precommit` como contratos vigentes.
- `docs/auditoria/00-inventario-material-descargado.md` como punto de partida.
- `material_privado_no_versionar/` como única fuente.

## Success Criteria

- [ ] Existe inventario con nombre, ruta relativa y tamaño verificable con `ls -la`.
- [ ] Existe documento de hallazgos con hipótesis separadas en frontend, backend, DB y deploy.
- [ ] Si la extracción es viable, existe documento de esquema a alto nivel; si no, queda documentada la limitación.
- [ ] `docs/backend/`, `docs/database/` y `docs/deploy/` actualizados solo con hipótesis.
- [ ] `docs/00-indice-general.md` lista solo archivos reales.
- [ ] `material_privado_no_versionar/` y los dumps `*.sql` sensibles siguen ignorados.
- [ ] `git status --ignored --short` (o equivalente) confirma que ningún ítem sensible está listo para commit.
- [ ] No se imprimieron ni persistieron credenciales, DNI, tokens, filas de dump, logs ni contenido de zips.
