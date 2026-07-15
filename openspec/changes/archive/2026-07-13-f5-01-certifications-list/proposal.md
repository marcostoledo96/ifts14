# Propuesta: F5-01 — Listado de certificaciones

## Intención

Evolucionar in-place `/admin/certificaciones` desde el listado mock básico hacia la experiencia aprobada en v0: filtrable, paginada, responsive, accesible y verificable. El cambio prepara la futura integración sin incorporar red ni ampliar la exposición de datos administrativos.

## Alcance

### Incluido
- Tabla desktop y tarjetas mobile con navegación al detalle/PDF existentes.
- Búsqueda segura por alumno, documento enmascarado, curso y número ficticio; filtros por validez, entrega y curso.
- Paginación client-side de 5 elementos, conteos, limpiar filtros y estados diferenciados: carga, error, vacío total y sin coincidencias.
- Harness de QA para forzar estados y evidencia de paridad desktop/mobile.
- Extensión mock-only del modelo con `envio` y `numero`; tests de comportamiento y privacidad.

### Fuera de alcance
- Alta/emisión, entrega, revocación, cambios al detalle o PDF existentes.
- Backend, HTTP, DB, deploy, auth real, storage, dependencias nuevas o cambios de contratos API.
- DNI o token completos, email, legajo, matrícula, datos reales o material privado.

## Capacidades

### Capacidades nuevas

Ninguna.

### Capacidades modificadas
- `admin-certifications-frontend`: ampliar el listado mock seguro con filtros, vistas responsive, paginación, estados y QA verificable, preservando rutas y handoffs actuales.

## Enfoque

Reutilizar `CERTIFICATIONS_SOURCE`, los patrones Angular del listado de cursos y los tokens visuales existentes. Mantener filtros y paginación en signals/computed del componente, sin servicios nuevos; paginar únicamente el seed local. Adaptar la composición de `muestra_pagina` sin portar React/Next literalmente. El harness QA será explícito y no persistente.

## Áreas afectadas

| Área | Impacto | Descripción |
|---|---|---|
| `features/admin/certifications/` | Modificado | Modelo mock, seed, listado y checks de privacidad |
| `openspec/specs/admin-certifications-frontend/spec.md` | Modificado | Requisitos del listado |
| `docs/frontend/` | Modificado | Estado F5-01 y evidencia de paridad |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Filtros/página inconsistentes | Media | Reiniciar o acotar página al cambiar resultados; tests de bordes |
| Exposición administrativa indebida | Baja | Solo `documentMasked` y mocks ficticios; checks negativos |
| Desvío visual o accesible | Media | Tabla semántica, cards con `dl`, ARIA y QA desktop/mobile |

## Plan de reversión

Revertir el PR único. Las rutas, el detalle, el PDF y el seam de datos permanecen compatibles y no requieren migración.

## Dependencias

- Base F2-06/F4-01/F4-02 y patrones de F4-03 ya integrados.
- Referencia visual `muestra_pagina/components/admin/lista-certificaciones.tsx`.

## Criterios de éxito

- [ ] Filtros combinables, búsqueda y paginación de 5 producen conteos y estados correctos.
- [ ] Tabla/cards mantienen navegación existente y paridad visual responsive.
- [ ] Tests, build y QA harness verifican carga, error, vacíos, accesibilidad y privacidad estricta.
- [ ] No hay red, datos reales, secretos, dependencias nuevas ni cambios fuera del frontend.
