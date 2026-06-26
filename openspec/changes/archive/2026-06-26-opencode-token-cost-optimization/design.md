# Diseño: optimización de costo de tokens en OpenCode/Gentle-AI

## Enfoque técnico

El cambio será solo documental y de configuración segura. Se agregará una guía operativa breve, una política mínima para Graphify y referencias desde las fuentes de lectura vigentes. No se tocará producto Angular/PHP/MariaDB, deploy real ni `material_privado_no_versionar/`.

Se adopta `docs/opencode/eficiencia-token.md` como nombre final porque ya está fijado por la propuesta y la spec. `docs/opencode/optimizacion-tokens.md` queda descartado para evitar dos rutas para el mismo concepto.

## Decisiones de arquitectura

| Tema | Opción descartada | Decisión y fundamento |
|---|---|---|
| Guía principal | Reescribir `README.md`/`GUIA.md` | Crear `docs/opencode/eficiencia-token.md`: menor diff, fuente específica y enlazable. |
| Graphify | Documentarlo dentro de la guía general solamente | Crear `docs/arquitectura/graphify/README.md`: separa reglas de indexado, seguridad y lectura de grafo. |
| `.graphifyignore` | Copiar un template global sin adaptar | Crear ignore local explícito; el repo tiene material privado, dumps y salidas generadas. |
| Prompts | Reescribir ciclos completos | Ajustar ruta rápida y prompt base; el resto queda intacto para bajar riesgo. |
| `.gitignore` | Ignorar solo `graphify-out/` | Ignorar `graphify-out/` y, si aparece en verificación, caches/salidas generadas equivalentes de Graphify. |

## Flujo documental

```txt
AGENTS.md / prompts raíz
        │
        ├─→ docs/00-indice-general.md
        │        └─→ docs/opencode/eficiencia-token.md
        │
        └─→ docs/arquitectura/graphify/README.md
                 └─→ .graphifyignore + .gitignore
```

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `.graphifyignore` | Crear | Exclusiones previas obligatorias para Graphify. |
| `.gitignore` | Modificar | Agregar `graphify-out/` y salidas generadas equivalentes si corresponde. |
| `docs/opencode/eficiencia-token.md` | Crear | Guía operativa: lectura mínima, RTK, compactación/prune, perfiles, Ponytail, Karpathy y evidencia. |
| `docs/arquitectura/graphify/README.md` | Crear | Uso seguro de Graphify, alcance, exclusiones y prohibición de indexar secretos. |
| `AGENTS.md` | Modificar | Referenciar la guía de eficiencia en lectura mínima y regla de Graphify seguro. |
| `docs/00-indice-general.md` | Modificar | Enlazar guía OpenCode y README de Graphify. |
| `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | Modificar | Ruta rápida y prompt base leen ciclo activo + guía de eficiencia. |
| `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | Modificar | Igual ajuste para F0-F3, sin reescribir ciclos. |
| `MATIAS_PROMPTS_SDD_FASE2.md` | Modificar | Igual ajuste para Fase 2. |
| `docs/07-sdd-archive-y-mantenimiento-documentacion.md` | Modificar | Agregar cambio de flujo OpenCode/Graphify a la matriz de archive. |

## Contratos

Contenido mínimo de `.graphifyignore`:

```gitignore
material_privado_no_versionar/
backups/
backups_originales/
db_dumps_originales/
servidor_original/
*.sql
*.sql.gz
*.dump
*.log
.env
.env.*
graphify-out/
node_modules/
dist/
coverage/
```

Principio: Graphify no se ejecuta si falta `.graphifyignore` o si no excluye material sensible/costoso. La evidencia solo debe mostrar rutas y reglas, nunca contenido privado.

## Estrategia de verificación

| Capa | Qué verificar | Enfoque |
|---|---|---|
| Seguridad | `.graphifyignore` cubre privados, dumps, logs, `.env` y `graphify-out/` | Revisión de archivo y `git status --ignored --short`. |
| Documentación | Rutas enlazadas existen y no duplican contenido | Revisión manual de enlaces y nombres. |
| Alcance | No hay cambios en Angular/PHP/MariaDB/deploy/material privado | `git diff --name-only` filtrado por rutas prohibidas. |
| OpenSpec | Artefactos SDD actualizados | Revisar `openspec/changes/opencode-token-cost-optimization/`. |

## Rollback

Revertir los cambios de documentación y `.gitignore`, eliminar `.graphifyignore`, `docs/opencode/eficiencia-token.md` y `docs/arquitectura/graphify/README.md`. No hay migración ni datos a revertir.

## Preguntas abiertas

- Ninguna bloqueante.
