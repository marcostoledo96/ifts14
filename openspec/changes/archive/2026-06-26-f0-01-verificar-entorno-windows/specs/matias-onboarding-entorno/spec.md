# Delta para matias-onboarding-entorno

## Purpose

Verificación formal del entorno de desarrollo Windows de Matías antes de iniciar ciclos de producto Angular 20 en el módulo `/certificados/`.

## ADDED Requirements

### Requirement: Herramientas base disponibles

El sistema DEBE confirmar que `node`, `npm`, `git`, `code` y `ng` responden a sus comandos de versión sin error en PowerShell.

#### Scenario: Node.js responde

- GIVEN PowerShell en Windows
- WHEN se ejecuta `node --version`
- THEN la salida DEBE mostrar una versión
- AND el código de salida DEBE ser 0

#### Scenario: npm responde

- GIVEN PowerShell en Windows
- WHEN se ejecuta `npm --version`
- THEN la salida DEBE mostrar una versión
- AND el código de salida DEBE ser 0

#### Scenario: Git responde

- GIVEN PowerShell en Windows
- WHEN se ejecuta `git --version`
- THEN la salida DEBE mostrar una versión
- AND el código de salida DEBE ser 0

#### Scenario: VS Code responde

- GIVEN PowerShell en Windows
- WHEN se ejecuta `code --version`
- THEN la salida DEBE mostrar una versión
- AND el código de salida DEBE ser 0

#### Scenario: Angular CLI responde

- GIVEN PowerShell en Windows
- WHEN se ejecuta `ng version`
- THEN la salida DEBE mostrar la versión del Angular CLI
- AND el código de salida DEBE ser 0

### Requirement: Angular CLI compatible con Angular 20

El sistema DEBE verificar que la versión global del Angular CLI sea 20.x.

#### Scenario: Versión 20.x confirmada

- GIVEN que `ng version` finalizó correctamente
- WHEN se lee la versión del Angular CLI
- THEN ésta DEBE comenzar con `20.`

### Requirement: Reporte de verificación documentado

El sistema DEBE escribir un reporte de verificación bajo `docs/` que registre las versiones confirmadas.

#### Scenario: Creación del reporte

- GIVEN que todas las herramientas respondieron con sus versiones
- WHEN se concluye la verificación
- THEN DEBE existir un archivo en `docs/frontend/` o `docs/opencode/`
- AND el archivo DEBE listar las versiones sin credenciales ni rutas privadas

### Requirement: Sin dependencias de proyecto instaladas

El sistema NO DEBE instalar dependencias dentro del repositorio. Solo se admite Angular CLI como herramienta global.

#### Scenario: Working tree limpio de dependencias

- GIVEN la rama `docs/matias-onboarding-windows`
- WHEN finaliza el ciclo
- THEN NO DEBE existir `node_modules/` nuevo ni cambios en `package-lock.json`
- AND el working tree DEBE permanecer limpio salvo el reporte

### Requirement: Sin modificación de código de producto

El sistema NO DEBE modificar código fuente de Angular, PHP, base de datos ni configuración de deploy.

#### Scenario: Sin cambios en código de producto

- GIVEN la estructura del repositorio
- WHEN finaliza el ciclo
- THEN ningún archivo de producto DEBE modificarse
- AND solo DEBE agregarse o modificarse el reporte bajo `docs/`

## MODIFIED Requirements

None.

## REMOVED Requirements

None.

## RENAMED Requirements

None.
