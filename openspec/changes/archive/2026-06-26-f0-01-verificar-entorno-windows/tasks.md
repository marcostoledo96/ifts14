# Tasks: F0-01 — Verificar entorno Windows

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~130 (reporte ~50 + tasks.md ~80) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Delivery strategy | single-pr |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single-pr
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Reporte de verificación Windows | PR 1 | Único entregable; sin tests, solo docs |

## 1. Preparación

- [x] 1.1 Confirmar rama activa con `git branch --show-current`; debe devolver `docs/matias-onboarding-windows`.
- [x] 1.2 Registrar el baseline del working tree con `git status --short`. Solo se aceptan artefactos de fases SDD previas (`openspec/changes/f0-01-verificar-entorno-windows/`, `.atl/skill-registry.md`, `openspec/config.yaml`); cualquier otro cambio es un bloqueo que se reporta antes de seguir.

## 2. Escritura del reporte

- [x] 2.1 Crear `docs/opencode/verificacion-entorno-windows.md` con título `# Verificación de entorno Windows` y las cinco secciones en el orden de `design.md` §"Ubicación y estructura del reporte". La carpeta `docs/opencode/` ya existe.
- [x] 2.2 Completar **Entorno** con fecha (2026-06-26), SO `win32 x64`, shell PowerShell y rama activa.
- [x] 2.3 Completar **Herramientas verificadas** con tabla Markdown de 5 filas (Node.js v22.18.0, npm 10.9.3, Git 2.47.1.windows.1, VS Code 1.126.0, Angular CLI 20.3.30) y columnas `Herramienta | Versión | Estado`.
- [x] 2.4 Completar **Compatibilidad Angular** declarando que el Angular CLI global es 20.3.30 y que cumple el requirement `20.x` del spec.
- [x] 2.5 Completar **Alcance confirmado** listando no-objetivos: F0-02, F0-03, código de producto, backend PHP, MariaDB, deploy cPanel.
- [x] 2.6 Completar **Próximos pasos** con una referencia breve al ciclo F0-02.

## 3. Validación automática

- [x] 3.1 Verificar existencia con `Test-Path docs/opencode/verificacion-entorno-windows.md`; debe devolver `True`.
- [x] 3.2 Leer el archivo y comprobar que contiene las 5 herramientas con sus versiones y las 5 secciones obligatorias.
- [x] 3.3 Verificar que `git status --short` lista solo el archivo nuevo; no debe listar `node_modules/`, `package-lock.json` ni archivos de producto.
- [x] 3.4 Verificar con `git diff --name-only` que no se modificaron archivos bajo `apps/`, `database/`, `public_html/`, `muestra_pagina/` ni `material_privado_no_versionar/`.

## 4. Cierre

- [x] 4.1 Listar archivos tocados y comparar contra el impacto declarado en `proposal.md` (esperado: un único archivo nuevo bajo `docs/opencode/`).
- [x] 4.2 Documentar los comandos Git propuestos pero NO ejecutarlos: `git add docs/opencode/verificacion-entorno-windows.md` y `git commit -m "docs(matias): registrar verificacion de entorno windows"`.
- [x] 4.3 Redactar el reporte final con bloqueos, riesgos residuales y referencia al cierre con `sdd-archive`; dejar asentado que no aplica `sdd-verify` con tests automatizados según `openspec/config.yaml` §`testing`.
