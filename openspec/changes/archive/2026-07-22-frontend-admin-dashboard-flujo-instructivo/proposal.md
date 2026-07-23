# Proposal: Instructivo de flujo en dashboard admin

## Intent

Orientar a Bedelía en el orden operativo del panel: cursos → alumnos → asistencias → certificaciones → configuración, sin saturar el dashboard ni inventar features.

## Scope

### In Scope
- Panel «Flujo de trabajo» en `/admin/dashboard` **antes** de Pendientes (5 pasos + Ver guía).
- Página única `/admin/guia` con detalle de los 5 temas, anclas y `UiBackLink`.
- Ruta admin protegida, tests y actualización de contrato dashboard.

### Out of Scope
- Modales, dismiss con localStorage, 5 rutas separadas.
- Backend, SMTP, carga masiva, cambios en `muestra_pagina/`.
- Sidebar item dedicado (acceso desde dashboard basta).

## Capabilities

### Modified Capabilities
- `admin-dashboard-workbench`: instructivo de flujo + enlace a guía.
- `admin-foundation`: ruta `/admin/guia`.

## Approach

Híbrido compacto: mapa de 5 pasos en dashboard; detalle en una sola página `/admin/guia`.

## Rollback

Revertir archivos del dashboard, guide y delta de rutas/specs.
