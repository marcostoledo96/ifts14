# Diseño: F5-01 — Listado de certificaciones

## Enfoque técnico

Evolucionar `CertificationsListPage` in-place, conservando `/admin/certificaciones`, `CERTIFICATIONS_SOURCE` y `InMemoryCertificationsService`. Una carga obtiene el seed mock completo; signals de filtros, página y vista QA alimentan `computed()` para filtrar, contar y paginar de a 5. Tabla desktop y tarjetas mobile consumen la misma página derivada. Se toma la composición visual de `muestra_pagina/components/admin/lista-certificaciones.tsx`, pero se implementa con Angular 20, HTML semántico, CSS local y tokens existentes; no se portan React, Tailwind, lucide ni subcomponentes innecesarios.

## Decisiones de arquitectura

| Opción | Trade-off | Decisión y fundamento |
|---|---|---|
| Página nueva vs. evolución in-place | Una página nueva aislaría el cambio, pero duplicaría ruta, carga y pruebas. | Modificar `pages/list/certifications-list-page.*`; preserva los handoffs F4-01/F4-02 y permite rollback unitario. |
| Filtrar/paginar en servicio vs. componente | El servicio simularía una API, pero la paginación requerida es exclusivamente local. | `listar()` carga el seed; `computed()` aplica búsqueda, validez, entrega, curso y `slice()` de 5. No se cambia `CertificationsService`. |
| Estado QA por URL/storage vs. signal local | URL o storage harían reproducible el estado, pero ampliarían contratos o persistencia. | `vistaQa` local (`datos|cargando|error|vacio-total`) con controles explícitos de revisión; se reinicia al recargar y nunca sale del componente. |
| Componentes visuales nuevos vs. plantilla única | Extraer badges/cards reduciría fragmentos, pero agregaría abstracciones de un solo uso. | Mantener helpers de presentación y una plantilla; tabla y cards comparten los mismos computed y rutas. |
| Copiar estados v0 vs. modelo vigente | v0 usa tres validez; Angular admite cuatro estados. | Mantener `EstadoCertificado`; agregar `EnvioCertificacion` y `numero` solo al mock. `documentMasked` sigue siendo el único documento visible. |

## Flujo de datos

    recargar() ──→ CERTIFICATIONS_SOURCE.listar() ──→ certificados signal
        │                    generación de carga             │
        └── vista QA / error                         filtros computed
                                                            │
                      página segura ← conteos ← resultados filtrados
                                                            │
                                             tabla desktop + cards mobile

Cada cambio de filtro o limpieza vuelve a página 1. `paginaActual` se acota al total calculado. Un contador de generación descarta resultados, errores y `finally` obsoletos de cargas superpuestas, replicando la corrección probada en F4-03.

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `apps/frontend-angular/src/app/features/admin/certifications/certifications.models.ts` | Modificar | Agregar `EnvioCertificacion`, `envio` y `numero` mock-only. |
| `apps/frontend-angular/src/app/features/admin/certifications/in-memory-certifications.service.ts` | Modificar | Completar los 6 registros ficticios sin DNI/token completos ni red. |
| `apps/frontend-angular/src/app/features/admin/certifications/pages/list/certifications-list-page.{ts,html,css}` | Modificar | Signals/computed, paginación, QA, estados, tabla/cards y links existentes a detalle/PDF. |
| `apps/frontend-angular/src/app/features/admin/certifications/pages/list/certifications-list-page.spec.ts` | Modificar | RED/GREEN de filtros, páginas, carreras, QA, semántica y navegación. |
| `apps/frontend-angular/src/app/features/admin/certifications/certifications.service.spec.ts` | Modificar | Contrato del seed enriquecido y privacidad. |
| `apps/frontend-angular/src/app/features/admin/certifications/__checks__/{no-secrets,no-real-data}.spec.ts` | Modificar | Incluir nuevos campos, métodos y DOM en checks negativos. |
| `openspec/changes/f5-01-certifications-list/evidence/*` | Crear en verify | Capturas y notas de paridad/estados. |

No se modifican `app.routes.ts`, detalle, PDF, servicio, backend, configuración ni dependencias.

## Interfaces / contratos

```ts
type EnvioCertificacion = 'entregado' | 'pendiente-entrega' | 'requiere-nueva-entrega';
interface Certificacion {
  readonly numero: string;
  readonly envio: EnvioCertificacion;
}
```

## Estrategia de pruebas

| Capa | Qué probar | Enfoque |
|---|---|---|
| Unidad | Seed ficticio, `numero`/`envio`, búsqueda combinada y privacidad | Specs del servicio; primero expectativas RED. |
| Componente | Filtros combinables, reset/acotado, páginas 1/2, cargas stale, retry, cuatro vacíos/QA, tabla, `dl`, caption, live regions y links | `TestBed` con promesas controladas y consultas DOM. Trazar cada escenario del spec a un `it`. |
| Runtime/evidencia | Paridad y responsive real | `npm run test:ci`, `npm run build`, `git diff --check`; capturas 1280×800 y 390×844 de datos, carga, error, vacío y sin coincidencias; teclado y consola. |

## Threat Matrix

N/A — no cambia routing, shell, subprocess, automatización VCS/PR, clasificación de ejecutables ni integración de procesos.

## Migración / rollout

No requiere migración ni rollout: son datos en memoria. Rollback: revertir el work unit F5-01 y eliminar su evidencia; las rutas y contratos de detalle/PDF permanecen intactos.

## Preguntas abiertas

Ninguna.
