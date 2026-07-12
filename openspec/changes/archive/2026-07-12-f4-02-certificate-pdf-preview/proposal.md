# Propuesta — F4-02 Vista previa imprimible de certificado

## Problema

El expediente F4-01 muestra una réplica, pero no una vista dedicada e imprimible: sus acciones PDF continúan deshabilitadas con handoff F4-02. Bedelía necesita imprimir una representación segura sin generación PDF real ni backend.

## Objetivo

Incorporar `/admin/certificaciones/:id/pdf` como página standalone mock-only, con paridad v0 e impresión nativa.

## Alcance

- Renderizar en Angular 20 reutilizando `CERTIFICATIONS_SOURCE` y modelos vigentes.
- Imprimir mediante `window.print()`, `@media print`, A4 apaisado y elementos `.no-print`.
- Navegar desde `Descargar PDF` y `Regenerar PDF` de F4-01 hacia la nueva ruta; permitir volver al expediente.
- Mantener `Copiar link`, `Entrega manual` y `Revocar certificación` deshabilitadas con handoffs F6-03, F5-04 y F6-01.
- Cubrir rutas, ids inválidos, privacidad, impresión y paridad.

## No-objetivos

- PDF, QR o token reales; backend, HTTP, persistencia, email, entrega o revocación.
- Rotación: el QR/token permanece permanente.
- Dependencias nuevas o port literal de React/Next.
- DNI o token completos, email, legajo, matrícula, UUID, datos reales o nombres plausibles de autoridades.

## Capacidades

### Nuevas

- Ninguna.

### Modificadas

- `admin-certifications-frontend`: agrega la ruta imprimible mock-only y materializa el handoff F4-02 desde el expediente.

## Enfoque

Crear una página presentacional con CSS local, tokens globales y `window.print()` como única API. Portar la intención visual de `muestra_pagina/components/admin/vista-previa-pdf.tsx`, su ruta y capturas, sin trasladar React/Next. Usar datos enmascarados, URL truncada, QR decorativo y autoridades `Autoridad Demo Uno/Dos`.

## Impacto

| Área | Impacto |
|---|---|
| Página y rutas Angular | Nueva vista `/admin/certificaciones/:id/pdf` |
| Expediente F4-01 | Dos CTAs navegan a la vista; demás handoffs no cambian |
| Tests/checks | Rutas, privacidad, impresión y paridad |
| Spec `admin-certifications-frontend` | Delta de requisitos |

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Diferencias entre pantalla e impresión | Evidencia desktop, mobile y media print |
| Fuga de datos por copiar la v0 | Checks negativos y datos neutros/enmascarados |
| Colisión de rutas o CSS budget | Ruta específica antes de `:id`; build y tests |

## Reversión

Revertir ruta, página y enlaces F4-01; restaurar ambos CTAs deshabilitados. No hay migraciones ni datos persistidos.

## Criterios de éxito

- [ ] La ruta renderiza ids mock válidos y resuelve inválidos sin excepciones ni red.
- [ ] La impresión A4 apaisada oculta controles y conserva colores.
- [ ] La paridad visual es igual o mejor que las referencias v0 en desktop y mobile.
- [ ] No aparecen datos prohibidos ni se rota QR/token.
- [ ] Tests y build Angular finalizan correctamente sin dependencias nuevas.

## Delivery

Un único PR: F4-02 y el delta mínimo de F4-01. Forecast 700–1100 líneas, dentro del presupuesto acordado de 4000.
