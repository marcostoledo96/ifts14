# Diseño — reorganización segura inicial

## Decisión principal

Usar una reorganización mínima basada en archivos y documentación existente, sin crear producto ni dependencias nuevas.

La fuente de estructura y contenido inicial fueron las plantillas y guías disponibles en `ifts14_planificacion_opencode_inicial/`, copiadas o movidas hacia la raíz y `docs/` según correspondiera.

## Principios

| Principio | Aplicación |
|---|---|
| Seguridad primero | Mover material sensible a `material_privado_no_versionar/` sin abrir contenidos. |
| Mínimo cambio suficiente | Crear solo archivos y carpetas necesarios para orientar futuros ciclos. |
| Sin producto | No crear Angular, PHP, esquema de base de datos ni dependencias. |
| Documentación navegable | Mantener entrada por `README.md`, `GUIA.md`, `AGENTS.md` y `docs/00-indice-general.md`. |
| Trazabilidad SDD | Registrar tareas, avance y verificación en Engram y OpenSpec. |

## Estructura prevista

```txt
ifts14/
├── README.md
├── GUIA.md
├── AGENTS.md
├── docs/
│   ├── 00-indice-general.md
│   ├── 07-sdd-archive-y-mantenimiento-documentacion.md
│   ├── planificacion-inicial/
│   └── opencode/
├── openspec/
├── apps/
│   ├── frontend-angular/
│   └── backend-php/
├── database/
├── deploy/
├── scripts/
├── muestra_pagina/
└── material_privado_no_versionar/
```

## Manejo de material sensible

- `.gitignore` debe cubrir dumps, backups, logs, `.env`, configuraciones reales, ZIPs y carpetas `.git` internas.
- Los dumps SQL se trasladan a `material_privado_no_versionar/db_dumps_originales/`.
- `well-known/` se traslada a `material_privado_no_versionar/servidor_original/well-known/`.
- No se leen ni se copian contenidos sensibles a documentación.

## Documentación

- `README.md`: objetivo, stack y archivos importantes.
- `GUIA.md`: guía humana de alcance, roles y flujo.
- `AGENTS.md`: reglas obligatorias para agentes.
- `docs/00-indice-general.md`: mapa documental mínimo.
- `docs/07-sdd-archive-y-mantenimiento-documentacion.md`: regla de mantenimiento documental al archivar cambios SDD.

## Decisiones diferidas

- No eliminar automáticamente `ifts14_planificacion_opencode_inicial/`; reportarlo para revisión posterior.
- No implementar frontend final hasta que exista referencia v0 en `muestra_pagina/`.
- No validar commit-readiness con Git si el directorio local no es un repositorio Git.

## Verificación esperada

- Confirmar existencia de documentos raíz y carpetas base.
- Confirmar ausencia de dumps SQL y `well-known/` en raíz.
- Confirmar existencia de rutas privadas esperadas sin abrir contenidos.
- Confirmar que no se creó producto ni dependencias.
- Ejecutar `git status --ignored --short` solo cuando el directorio sea un repositorio Git válido.
