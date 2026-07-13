# Paridad visual F5-02 — Alumnos

## Referencia y alcance

Comparación manual entre `muestra_pagina/components/admin/lista-alumnos.tsx` y la implementación Angular de `/admin/alumnos`. La referencia v0 se usó para composición; no se portaron React, Next, Tailwind ni Lucide.

| Aspecto | Referencia v0 | Angular F5-02 | Resultado |
|---|---|---|---|
| Jerarquía | Encabezado de alumnos y listado administrativo | Kicker, `h1` y subtítulo equivalente | Igual o mejor |
| Filtros | Búsqueda y filtros rápidos | Búsqueda por nombre/documento enmascarado y chips accesibles | Mejor: restringe datos privados |
| Desktop | Tabla de alumnos | `<caption>`, seis `th[scope="col"]`, cinco filas visibles | Mejor: semántica explícita |
| Mobile | Tarjetas de alumnos | Lista de tarjetas equivalente, sin tabla visible a 390 px | Igual o mejor |
| Estados | Carga, error y vacíos | Estados diferenciados, `role="alert"`, reintento y CTA de limpieza | Mejor: anuncios accesibles |
| Contacto | Dirección de email visible | Solo `Contacto disponible` / `Sin email` desde booleano | Mejor: no expone direcciones |
| Acción de detalle | Navegación de detalle | Botón `disabled` y `aria-disabled="true"` con `Disponible en F5-03` | Conforme al handoff |
| Foco | Estilo de la referencia | Tokens F1-02 y `var(--focus-ring)` en controles | Igual o mejor |

## Capturas runtime

- `desktop-1280.png`: tabla visible, tarjetas ocultas y cinco filas.
- `mobile-390.png`: tarjetas visibles, tabla oculta y cinco tarjetas.
- `loading.png`, `error.png`, `empty-total.png`, `no-results.png`: estados QA de desarrollo y consulta sin coincidencias.

## Límites confirmados

No se agregaron dependencias, red de datos, storage, cookies, IndexedDB, detalle ni ruta `/admin/alumnos/:id`. F5-03 conserva la responsabilidad de habilitar detalle.
