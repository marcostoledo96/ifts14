# sdd-archive y mantenimiento de documentación

## Objetivo

Al cerrar cada ciclo SDD, se debe actualizar la documentación mínima necesaria para que el repositorio siga entendible para humanos e IA.

`sdd-archive` no es opcional. Es el cierre del ciclo.

## Matriz de actualización

| Tipo de cambio | Documentos a revisar |
|---|---|
| Cambio de alcance | `README.md`, `GUIA.md`, `docs/01-contexto-decisiones-stack.md` |
| Cambio frontend | `docs/frontend/00-angular20-port-v0.md`, listado seguro de `muestra_pagina/` si aplica |
| Cambio backend | `docs/backend/00-php84-api.md` |
| Cambio base de datos | `docs/database/00-mariadb.md`, `database/docs/` |
| Cambio deploy | `docs/deploy/00-cpanel-certificados.md`, `deploy/` |
| Cambio de seguridad | `AGENTS.md`, `docs/auditoria/00-inventario-material-descargado.md` |
| Cambio de prompts de Marcos | `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`, `docs/00-indice-general.md` |
| Cambio de prompts de Matías | `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`, `docs/00-indice-general.md` |
| Cambio de prompts históricos | `docs/opencode/archive/` |
| Cambio de specs | `openspec/specs/` |
| Cambio de reglas por carpeta | `AGENTS.md` de la carpeta afectada y este índice si cambia la lectura mínima |
| Cambio de flujo operativo | `GUIA.md`, `docs/00-indice-general.md`, prompt raíz del rol afectado |
| Cambio de flujo OpenCode/Graphify | `docs/opencode/optimizacion-tokens.md`, `docs/arquitectura/graphify/README.md`, `.graphifyignore`, `AGENTS.md`, prompts raíz |

## Regla

Si un cambio modifica comportamiento, contrato, ruta, tabla, configuración o flujo de usuario, debe quedar documentado.

## Cierre esperado de cada ciclo

Al finalizar, OpenCode debe responder:

```txt
- archivos modificados;
- documentación actualizada;
- documentación pendiente;
- pruebas o validaciones ejecutadas;
- QA manual recomendado;
- mensaje de commit sugerido;
- comandos Git sugeridos.
```

OpenCode no debe hacer commit, push ni merge automáticamente.

## Registro de cierre para costo de tokens

Cuando el ciclo use OpenCode/Gentle-AI, agregar al reporte final:

- salida extensa resumida o comprimida con `RTK`/equivalente;
- si Graphify fue consultado, ruta del resumen aprobado usado;
- confirmación de compactación/prune o motivo para omitirlo;
- ubicación de logs o reportes guardados, sin copiar logs completos al contexto;
- evidencia crítica conservada y evidencia omitida por costo, peso o seguridad.
