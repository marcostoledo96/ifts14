# Propuesta: Verificar entorno Windows (F0-01)

## Why

Matías necesita confirmar que su equipo Windows cuenta con las herramientas mínimas para desarrollar el frontend Angular 20 del módulo `/certificados/` del IFTS14. Este ciclo de documentación registra la verificación formal del entorno antes de iniciar cualquier ciclo de producto (F0-F3). Es el primer paso del onboarding definido en `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`.

## What Changes

- Se escribe un reporte de verificación en `docs/frontend/` o `docs/opencode/` que registre las versiones confirmadas de cada herramienta.
- No se modifica código de producto (Angular, PHP, base de datos, deploy).
- No se instalan dependencias dentro del repositorio (solo Angular CLI global como herramienta de desarrollo).

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- None

## Impact

| Área | Impacto | Descripción |
|------|---------|-------------|
| `docs/frontend/` o `docs/opencode/` | Nuevo | Reporte de verificación de herramientas |
| `openspec/changes/f0-01-verificar-entorno-windows/` | Nuevo | Artefactos SDD del ciclo |
| Código de producto | Sin cambio | No se toca Angular, PHP, DB ni deploy |

## Out of Scope

- F0-02 (verificar OpenCode/Gentle-AI) y F0-03 (crear app Angular): ciclos separados.
- Crear la aplicación Angular: corresponde a F0-03 o posterior.
- Backend PHP, base de datos MariaDB, deploy en cPanel: responsabilidad de Marcos, fuera del alcance de Matías.
- Integración con `sample_page` o cualquier endpoint: corresponde a ciclos de integración.
- Commit, push, merge: no se ejecutan automáticamente según `AGENTS.md`.
- `material_privado_no_versionar/`: nunca se toca.

## Approach

1. Verificar que las cinco herramientas responden correctamente en PowerShell.
2. Registrar las versiones confirmadas como evidencia.
3. Escribir un reporte formal en el árbol de documentación.
4. Cerrar el ciclo con `sdd-archive`.

## Affected Areas

| Área | Impacto | Descripción |
|------|---------|-------------|
| `docs/frontend/` | Nuevo | Reporte de verificación de entorno Windows |
| `openspec/changes/f0-01-verificar-entorno-windows/` | Nuevo | Proposal, spec, design, tasks del ciclo |

## Risks

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| Versión de Angular CLI incompatible con Angular 20 | Baja | Se instaló `@angular/cli@20` explícitamente; versión confirmada 20.3.30 |
| Herramienta no disponible en nueva terminal | Baja | Instalaciones globales verificadas; PowerShell reconoce los PATHs |
| Confusión con otro cambio activo (`backend-public-endpoint-hardening`) | Baja | Cambio de Marcos, carpeta separada; no se cruza con F0-01 |

## Rollback Plan

Al ser un ciclo de documentación sin código de producto, el rollback consiste en:
1. Eliminar el reporte de verificación escrito en `docs/frontend/` o `docs/opencode/`.
2. Eliminar la carpeta `openspec/changes/f0-01-verificar-entorno-windows/`.
3. No hay dependencias instaladas ni configuración modificada que revertir.

## Dependencies

- Ninguna externa. Las herramientas ya están instaladas y verificadas.

## Evidence

| Herramienta | Versión | Estado |
|-------------|---------|--------|
| Node.js | v22.18.0 | ✅ |
| npm | 10.9.3 | ✅ |
| Git | 2.47.1.windows.1 | ✅ |
| VSCode (code) | 1.126.0 | ✅ |
| Angular CLI (ng) | 20.3.30 | ✅ |

Entorno: win32 x64, PowerShell, rama `docs/matias-onboarding-windows`, working tree limpio.

## Acceptance

- [x] Los cinco comandos de versión responden sin error
- [x] `ng version` no falla (Angular CLI 20.3.30)
- [x] No se instalaron dependencias del proyecto
- [x] Rama activa: `docs/matias-onboarding-windows`
- [x] Working tree limpio
- [x] Proposal escrito y persistido (OpenSpec + Engram)
- [ ] Reporte de verificación escrito en `docs/frontend/` o `docs/opencode/` (apply phase)
- [ ] Ciclo cerrado con `sdd-archive`
