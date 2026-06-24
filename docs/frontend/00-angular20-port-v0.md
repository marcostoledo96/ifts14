# Frontend Angular 20 — Port desde muestra_pagina

## Objetivo

Implementar el frontend del módulo `/certificados/` en Angular 20 tomando como referencia visual el contenido de `muestra_pagina/`.

## Estado inicial

`muestra_pagina/` puede estar vacía al inicio. Si está vacía, no se implementan pantallas finales.

## Reglas

- No copiar React/Next literalmente.
- Extraer composición, jerarquía, tokens visuales y comportamiento.
- Adaptar a Angular 20 con componentes propios.
- Mejorar accesibilidad, performance y responsive.
- Evitar UI genérica de IA.
- Mantener identidad institucional del IFTS 14.

## Build para cPanel

Cuando corresponda:

```bash
ng build --configuration production --base-href /certificados/
```

## Expectativas de contrato API

Cuando exista la aplicación real:

- la ruta pública de validación debería ser `/certificados/validar/:tokenCertificacion`;
- el servicio Angular debería consultar `/certificados/api/certificados/{token}/verificacion`;
- un `404 CERTIFICATE_NOT_FOUND` debe mostrarse como certificado no verificable, no como error técnico;
- la UI pública no debe pedir DNI completo para validar un certificado;
- los modelos TypeScript futuros deben representar el DTO público documentado en `docs/backend/01-contrato-api-certificados.md`.
