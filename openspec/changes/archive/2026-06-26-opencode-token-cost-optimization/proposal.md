# Propuesta: optimización de costo de tokens en OpenCode/Gentle-AI

## Intención

Cada ciclo SDD arrastra ~400 líneas de contexto repetido entre `AGENTS.md`, `README.md` y `GUIA.md`; los prompts de Matías superan las 1.100 líneas; y faltan reglas documentadas sobre compresión de terminal (`RTK`), compactación de sesión y uso seguro de `Graphify`.

Se propone un documento operativo breve, exclusiones de Graphify y ajustes de lectura para reducir tokens/contexto/costo sin modificar código de producto.

## Alcance

### Dentro de alcance
- Crear `docs/opencode/eficiencia-token.md` con reglas de lectura mínima, `RTK`, compactación, perfiles eficientes, `Ponytail`, `karpathy-guidelines` y Graphify seguro.
- Crear `.graphifyignore` adaptado del template global para excluir material sensible.
- Modificar `.gitignore` para ignorar `graphify-out/`.
- Actualizar `docs/00-indice-general.md` y `AGENTS.md` para referenciar el nuevo documento.
- Ajustar el prompt base de Marcos y Matías para leer solo el ciclo activo + el doc de eficiencia.

### Fuera de alcance
- Reescribir `README.md` o `GUIA.md` en este ciclo.
- Tocar código Angular, PHP, MariaDB, deploy real o `material_privado_no_versionar/`.
- Instalar herramientas ni modificar `~/.config/opencode/opencode.json` sin decisión explícita de Marcos.

## Capacidades

Ninguna. Este cambio es operativo/documental; no modifica requisitos de producto.

## Enfoque

Aplicar el enfoque 3 de la exploración: reglas operativas mínimas de bajo riesgo. La consolidación raíz de documentación queda evaluada en un ciclo posterior si el cuello de botella persiste.

## Áreas afectadas

| Área | Impacto | Descripción |
|---|---|---|
| `docs/opencode/eficiencia-token.md` | Nuevo | Reglas de eficiencia de tokens |
| `.graphifyignore` | Nuevo | Exclusiones seguras para Graphify |
| `.gitignore` | Modificado | Agregar `graphify-out/` |
| `docs/00-indice-general.md` | Modificado | Enlace al doc de eficiencia |
| `AGENTS.md` | Modificado | Referencia a lectura mínima y reglas |
| `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | Modificado | Prompt base ciclado + eficiencia |
| `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | Modificado | Prompt base ciclado + eficiencia |
| `MATIAS_PROMPTS_SDD_FASE2.md` | Modificado | Prompt base ciclado + eficiencia |

## Roles

| Acción | Marcos | Matías | Solo Marcos |
|---|---|---|---|
| Crear/modificar docs raíz y `.gitignore` | Sí | No | Sí |
| Ejecutar `Graphify` | Sí | No | Sí |
| Ajustar perfiles/modelos en `~/.config/opencode/opencode.json` | Sí | No | Sí |
| Leer doc de eficiencia + ciclo activo | Sí | Sí | — |
| Comprimir salidas con `RTK` | Sí | Sí | — |
| Aplicar `Ponytail` / `karpathy-guidelines` | Sí | Sí | — |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Matías sigue pegando el prompt monolítico | Media | Advertencia explícita en el doc y en los prompts maestros |
| Graphify indexa material sensible antes de tener el ignore | Media | Crear `.graphifyignore` antes de cualquier ejecución; solo Marcos ejecuta Graphify |
| Perfiles más baratos degradan calidad en tareas complejas | Baja | Usar perfiles eficientes solo en documentación/tareas mecánicas; arquitectura y verificación mantienen perfil base |
| Olvido de usar `RTK` | Media | Incluir comando de ejemplo en el doc de eficiencia |

## Plan de rollback

- Eliminar `.graphifyignore`.
- Revertir `.gitignore`.
- Quitar referencias en `docs/00-indice-general.md`, `AGENTS.md` y prompts maestros.
- Conservar `docs/opencode/eficiencia-token.md` como referencia histórica o eliminarlo por decisión de Marcos.

## Dependencias

Ninguna. `RTK`, `Graphify` y los perfiles de Gentle AI ya están disponibles globalmente.

## Criterios de éxito

- [ ] Existe `docs/opencode/eficiencia-token.md` y está referenciado en `docs/00-indice-general.md`.
- [ ] `.gitignore` incluye `graphify-out/`.
- [ ] `.graphifyignore` excluye `material_privado_no_versionar/`, `.env`, `*.sql`, `backups/` y `graphify-out/`.
- [ ] Los prompts maestros indican leer solo el ciclo activo y el doc de eficiencia.
- [ ] No se modifica código de producto.
