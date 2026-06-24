# Design: Auditoría segura del material original

## Technical Approach

Cambio puramente documental y de inspección local de `material_privado_no_versionar/`. Sin código de producto, sin dependencias, sin `git add`/`commit`/`push`/`merge`. La secuencia segura es: (1) confirmar ignorado, (2) listar estructura, (3) intentar DDL solo si es viable, (4) redactar hallazgos, (5) actualizar índice. Reforzar `.gitignore` solo si la auditoría genera archivos de soporte versionables.

## Architecture Decisions

### Decision: Inspección con `ls`, `stat` y `grep` sobre DDL, sin abrir contenido completo

**Choice**: `ls -la` + `stat` para inventario; `grep -E` con patrones DDL para esquema; nunca abrir binarios grandes ni dumps completos.
**Alternatives**: (a) abrir dumps completos; (b) descomprimir zips; (c) `cat` con pipes largos.
**Rationale**: (a) y (b) filtran datos sensibles al contexto y disco; `grep` mantiene el contexto mínimo y audit-able.

### Decision: Extracción de DDL condicional y limitada a patrones estructurales

**Choice**: `grep -nE 'CREATE TABLE|PRIMARY KEY|FOREIGN KEY|KEY |INDEX|ENGINE=|CHARSET='`; si el output cabe en pocas líneas y no incluye filas, documentar; si no, omitir.
**Alternatives**: (a) `sed`/`awk` para recortar; (b) phpMyAdmin headless; (c) volcar a archivo temporal.
**Rationale**: (a) y (b) amplían la superficie de error; (c) crea archivo que no debe quedar en el árbol. `grep` es el mínimo viable.

### Decision: No descomprimir `browser.zip` ni `api.zip`

**Choice**: registrar tamaño y nombre; nunca descomprimir.
**Alternatives**: (a) descomprimir en `material_privado_no_versionar/`; (b) descomprimir a `/tmp/opencode/`.
**Rationale**: pueden contener rutas internas, hashes o credenciales. Documentar tamaño y nombre basta para inferir el tipo de artefacto.

### Decision: Hallazgos separados por dominio con etiqueta "Observado"/"Hipótesis"

**Choice**: cuatro secciones en `01-auditoria-material-original.md` (frontend, backend, DB, deploy); cada bullet etiquetado.
**Alternatives**: (a) documento monolítico; (b) documento por dominio.
**Rationale**: (a) mezcla evidencia con hipótesis; (b) sobredimensiona. Cuatro secciones equilibran claridad y trazabilidad.

### Decision: `.gitignore` modificado solo si la auditoría genera archivos de soporte versionables

**Choice**: revisar `.gitignore`; si aparecen borradores o notas intermedias, agregar patrón específico.
**Alternatives**: (a) `docs/auditoria/scratch/` ignorado; (b) no tocar `.gitignore`.
**Rationale**: (a) preferible si hay intermedios; (b) puede dejar staged accidental. Decisión diferible a `apply`.

## Data Flow

No aplica para producto. Solo se mueve información estructural desde el material privado hacia documentos, sin pasar por código ejecutable.

```
material_privado_no_versionar/  ──(ls, stat, grep DDL)──>  docs/auditoria/*.md
        │                                                          │
        └───(verificación con git status / grep)───────────────────┘
```

## File Changes

| Archivo | Acción | Descripción |
|---|---|---|
| `docs/auditoria/00-inventario-material-descargado.md` | Modify | Inventario tabular (ítem, ruta, tamaño, tipo probable). |
| `docs/auditoria/01-auditoria-material-original.md` | Create | Hallazgos por dominio, etiquetados Observado/Hipótesis. |
| `docs/auditoria/02-hallazgos-dumps-sql.md` | Create (condicional) | Solo si la extracción de DDL es viable. |
| `docs/backend/00-php84-api.md` | Modify | Sección "Hallazgos de auditoría (hipótesis)". |
| `docs/database/00-mariadb.md` | Modify | Idem para base de datos. |
| `docs/deploy/00-cpanel-certificados.md` | Modify | Idem para deploy/cPanel. |
| `docs/00-indice-general.md` | Modify | Listar las nuevas rutas reales. |
| `.gitignore` | Modify (condicional) | Solo si aparecen archivos intermedios. |
| `openspec/changes/auditoria-material-original/specs/auditoria-material-original/spec.md` | Create | Spec full nueva. |
| `openspec/changes/auditoria-material-original/specs/repo-seguro/spec.md` | Create | Delta sobre auditoría local. |
| `openspec/specs/repo-seguro/spec.md` | Modify (archive) | Aplicar delta. |

## Interfaces / Contracts

No aplica. No se introducen interfaces ni contratos. La auditoría describe, no conecta.

## Testing Strategy

| Capa | Qué verificar | Cómo |
|---|---|---|
| Estática | Cada ruta del inventario existe | `ls -la` por ítem. |
| Estática | Ningún bullet contiene valores reales | `grep -nE 'pass|token|secret|key=|dni=|INSERT INTO' docs/auditoria/*.md` debe estar vacío o solo referenciar reglas. |
| Estática | DDL extraído no incluye filas | Conteo de líneas del output `grep`; descartar si aparecen strings largos. |
| Estática | `.gitignore` sigue cubriendo lo sensible | `grep` sobre `.gitignore`. |
| Git | `git status --ignored --short` | Confirmar ignorado de `material_privado_no_versionar/`, `*.sql` y `*.zip`. |
| Sin Git | Path-based | Documentar limitación y usar `ls` + `grep`. |
| Estática | Rutas del índice existen | `ls` por cada ruta listada en `docs/00-indice-general.md`. |

## Migration / Rollout

No requiere migración. Cambios solo a nivel de árbol en `docs/`, `openspec/` y `.gitignore` (condicional). Sin estado remoto. Sin feature flags.

## Open Questions

- Si el DDL incluye alguna fila accidental, ¿descartar el documento o intentar un `grep` más restrictivo? Propuesta: descartar y documentar la limitación.
- Si Marcos prefiere una sola spec unificada con `repo-seguro` en lugar de una capacidad nueva, el delta debería absorber todo. Propuesta: mantener capacidad nueva por trazabilidad.
- La ruta del hosting real (`https://ifts14.com.ar/certificados/`) ya está en `docs/deploy/00-cpanel-certificados.md`; no repetirla en los hallazgos, solo enlazar.
