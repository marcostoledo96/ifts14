# Spec: frontend-parity-login (P-03)

## Purpose

Paridad visual del login `/admin/login` con `muestra_pagina` (capturas + layout TSX), sin credenciales demo ni cambios de auth.

## Requirements

### REQ-PLOGIN-001: Texturas grid

El aside y el main MUST mostrar patrón de grilla de fondo (densidad ~44px aside / ~32px main con mask radial en main), como v0.

#### Scenario: Grid visible

- GIVEN `/admin/login`
- WHEN se renderiza el layout
- THEN existen capas decorativas de textura en aside y main (`aria-hidden`)

### REQ-PLOGIN-002: Protocolo aside

El bloque de estado del aside (desktop) MUST mostrar `Protocolo` → `SHA-256 / SSL` (chrome visual de paridad). MUST NOT exponer secretos.

#### Scenario: Protocolo en aside

- GIVEN viewport desktop
- WHEN se lee el aside institucional
- THEN aparece `SHA-256 / SSL` junto a `Protocolo`

### REQ-PLOGIN-003: Placeholder institucional

El input de ID/email MUST usar placeholder `docente.apellido@ifts14.edu.ar`. MUST NOT incluir `usuario.demo` ni credenciales demo de v0.

#### Scenario: Placeholder sin demo

- GIVEN el formulario de login
- WHEN se inspecciona el input de usuario
- THEN el placeholder es institucional y el HTML no contiene `usuario.demo`

### REQ-PLOGIN-004: CTA Ingresar con flecha

El submit idle MUST mostrar «Ingresar» + flecha SVG. En loading MUST mostrar «Verificando…» + spinner y `aria-busy`.

#### Scenario: Idle y loading

- GIVEN loading=false → texto «Ingresar» con flecha
- GIVEN loading=true → «Verificando…», fieldset disabled, `aria-busy`

### REQ-PLOGIN-005: Error arriba y copy de captura

Errores de validación local MUST mostrarse al inicio del fieldset (`role="alert"`). Error 401 de página MUST usar copy cercano a captura: credenciales no coinciden / verificar datos. MUST NOT mostrar «Acceso simulado».

#### Scenario: Error de validación

- GIVEN envío vacío
- WHEN falla la validación
- THEN el alert aparece antes de los campos y recibe foco

#### Scenario: Error 401

- GIVEN login rechazado
- WHEN la página muestra error
- THEN el mensaje menciona registro autorizado o verificación de datos (paridad captura)

### REQ-PLOGIN-006: Sin demo credentials

El DOM del login MUST NOT contener `usuario.demo@example.invalid` ni password demo.

## Non-goals

Cambiar `AdminAuthService`, rutas, shell, o inventar recuperación de clave.
