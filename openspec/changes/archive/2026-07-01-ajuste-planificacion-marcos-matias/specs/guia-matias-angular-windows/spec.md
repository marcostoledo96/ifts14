# Delta — guia-matias-angular-windows

## MODIFIED Requirements

### Requirement: Contexto operativo y misión

La guía DEBE explicar que Matías lidera UI/UX Angular 20, adaptación de `muestra_pagina/`, sistema visual, responsive, accesibilidad, admin y QA visual. DEBE declarar que backend PHP, MariaDB, deploy cPanel, auth real, SMTP real y decisiones de QR/token quedan bajo coordinación con Marcos.
(Previously: la misión no incorporaba las decisiones D0 ni el nuevo reparto Marcos/Matías.)

#### Scenario: Inicio correcto

- DADO que Matías abre la guía
- CUANDO lee la primera sección
- ENTONCES entiende rol UI/UX, límites técnicos y coordinación con Marcos.
- Y no asume backend, deploy ni auth real como propios.

### Requirement: Uso de `muestra_pagina/`

La guía DEBE tratar `muestra_pagina/` como referencia visual actualizada de v0. Matías DEBE usarla como insumo para portar a Angular 20 sin copiar React/Next literalmente, y DEBE respetar DNI completo ficticio, fechas asistidas y QR permanente en pantallas públicas.
(Previously: la guía contemplaba carpeta vacía o estado anterior de v0.)

#### Scenario: Referencia v0 disponible

- DADO que `muestra_pagina/` contiene exportación v0 actualizada
- CUANDO Matías planifica un ciclo frontend
- ENTONCES usa la referencia visual sin portar código React/Next literalmente.
- Y conserva las decisiones de DNI completo, fechas asistidas y QR permanente.

#### Scenario: Credenciales demo no portables

- DADO que la referencia v0 contiene credenciales de demo
- CUANDO se diseñe o porte una pantalla admin
- ENTONCES la guía DEBE prohibir copiarlas al producto.
- Y DEBE mantener auth real fuera de alcance salvo decisión explícita.
