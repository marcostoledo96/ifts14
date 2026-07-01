# muestra_pagina/ — referencia visual v0

Esta carpeta contiene la exportación v0 generada como **referencia visual** para el port a Angular 20. No es código de producto ni se compila.

## Uso permitido

- Insumo visual para portar a Angular 20 (`apps/frontend-angular/`).
- Análisis de composición, tokens visuales, layout, estados y componentes.
- Capturas como referencia de diseño institucional.

## Prohibiciones

- No compilar ni ejecutar este proyecto Next.js/React.
- No portar componentes, hooks, rutas ni estilos literalmente a Angular.
- No copiar credenciales demo al producto: son mock visual v0, no credenciales reales.
- No usar `login-form.tsx` como implementación de auth: el producto usa `X-Admin-Key` temporal hasta que se defina login real.
- No instalar dependencias desde aquí en el producto Angular.

## Decisiones D0 que la referencia debe respetar

- QR/token permanente: el reenvío no rota token.
- Validación pública muestra DNI completo (decisión institucional aprobada).
- Certificado de curso con fechas asistidas.
- Auth admin simple temporal (`X-Admin-Key`).
- Firmantes PDF: Rector/a y Asesor/a Pedagógica vía configuración institucional.
- Staging `/certificados_staging/`.

## Inventario

Ver `MANIFIESTO_V0.md` para el detalle de pantallas, prompts, rutas y pendientes.

## Credenciales demo

La referencia v0 puede incluir credenciales de demostración dentro de componentes admin (ej.: `login-form.tsx`). Estas son **mock visual** y no deben portarse al producto ni usarse como credenciales reales.