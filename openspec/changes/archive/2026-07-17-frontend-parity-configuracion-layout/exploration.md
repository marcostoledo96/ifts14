# Exploration: P-14 frontend-parity-configuracion-layout

## Current state (Angular)

- Página funcional con GET/PUT vía `INSTITUTIONAL_CONFIG_SOURCE`.
- Layout plano: 3 fieldsets + aside estático + sticky bar.
- Copy header «Administración»; banner de impacto de una línea.
- Sin nav de anclas; sin cards numeradas ni iconos de sección.

## Referencia v0

`muestra_pagina/components/admin/configuracion-institucional.tsx` (~1029 líneas):

| Sección | v0 | DTO real | Decisión P-14 |
|---------|----|----------|----------------|
| Identidad · nombre | editable | `institutionName` | Editable |
| Identidad · logos | upload mock | — | Nota honesta / omit upload |
| Identidad · texto institucional | editable | — | Omitir (no es `certificateText`) |
| Certificados · texto base | editable | `certificateText` | Editable |
| Certificados · título/formato/QR/sello | mock | — | Disabled u omit + nota |
| Autoridades · nombre/cargo | editable | rector/advisor Name/Role | Editable |
| Autoridades · firma upload | mock | — | Disabled + nota |
| Contacto · email | editable mock | — | Sin input; nota entrega manual / sin SMTP |
| Validación · mensajes | editable mock | — | Sin inputs; nota «no editable acá» |

## Gaps a cerrar

1. Sticky nav lateral + `scroll-mt` en secciones.
2. Headers de sección 01–05 con icono + descripción.
3. Copy de impacto y sticky bar más cercanos a v0.
4. Preview de firmas con placeholder tipográfico si nombre vacío.

## Non-goals confirmados

No inventar persistencia; no `input[type=file]` activo; no PUT de campos fantasma.
