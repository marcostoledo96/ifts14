# Propuesta: P6-04 — Validación Pública Refinada

## Intención

La página de validación pública (`/validar/:token`) muestra datos correctos pero con diseño genérico. Se necesita refinarla para alcanzar paridad visual con `muestra_pagina`: layout folio con sidebar, membrete institucional, tabla de fechas, trazabilidad, sello oficial, responsive.

## Alcance

### En alcance
- Layout folio (grid 2 columnas: principal + sidebar)
- Header institucional (membrete IFTS 14)
- Datos completos del certificado: folio, alumno, DNI, curso, fechas (tabla), código, consulta
- Sidebar: trazabilidad + sello oficial decorativo
- Estados `not-verifiable` y `technical-error` con cuerpo editorial
- Responsive (mobile: sidebar debajo del folio)

### Fuera de alcance
- Backend (sin cambios)
- QR (no se dibuja QR decorativo)
- Nuevos componentes compartidos (inline refactor)

## Enfoque

Opción 1 del explore: refactor inline del page component actual.
