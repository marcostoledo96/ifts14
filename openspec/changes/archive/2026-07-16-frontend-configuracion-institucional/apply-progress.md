# Apply progress: Configuración institucional Angular

Estrategia de entrega: **single-cycle apply** (decisión de orquestador; split a PRs
posible después de verify/archive si Marcos lo pide).

Idioma resuelto: identificadores/comentarios de código en el estilo del repo;
UI copy visible en español (consistente con el admin Angular existente).

## Fase 1: Seam (modelo + mock + HTTP) — COMPLETA

- [x] 1.1 RED — `institutional-config.service.spec.ts` reescrito: GET 1:1, PUT `guardar`,
      4xx/5xx GET/PUT. Evidencia RED: compilación falla contra el modelo viejo
      (`advisorRole`/`updatedAt`/`guardar` inexistentes).
- [x] 1.2 GREEN — Modelo 1:1 (`InstitutionalConfig`, `InstitutionalConfigWrite`,
      `INSTITUTIONAL_CONFIG_LIMITS`) + `guardar()`; HTTP GET/PUT leyendo `envelope.data`
      con normalización null→''.
- [x] 1.3 RED→GREEN — `in-memory-institutional-config.service.ts` con seed default
      + tests obtener/guardar (muta seed, actualiza `updatedAt`).
- [x] 1.4 — Provider en `app.routes.ts`: `useRealApi ? Http : InMemory`.

Evidencia: `ng test --include=**/institutional-config.service.spec.ts` → 10/10 SUCCESS.

## Fase 2: Página (TDD) — COMPLETA

Archivos: `features/admin/institutional-config/pages/institutional-config-page.{ts,html,css,spec.ts}`

- [x] 2.1 RED — Specs de página escritos antes del componente (fallan por componente
      inexistente). Load success popula form + `updatedAt`; load fail + retry.
- [x] 2.2 GREEN — Load/`cargando`/`error`/retry vía stub del seam.
- [x] 2.3 RED→GREEN — Identidad/Certificados/Autoridades editables; sin logo, dirección
      ni upload (assertion de ausencia); preview tipográfica reactiva; banner de impacto;
      bloque estático Contacto/Validación sin inputs.
- [x] 2.4 RED→GREEN — Sticky bar: Guardar/Descartar deshabilitados sin dirty,
      "Cambios sin guardar", `updatedAt` como metadata; descartar restaura snapshot.
- [x] 2.5 RED→GREEN — Validación bloquea PUT (nombre vacío, límites 160/80/255);
      save success limpia dirty + mensaje ok + `updatedAt` nuevo; save error conserva edits.

Evidencia: `ng test --include=**/institutional-config-page.spec.ts` → 12/12 SUCCESS.

## Fase 3: Ruta + sidebar — COMPLETA

- [x] 3.1 RED→GREEN — Child lazy `configuracion` bajo AdminShell + specs en
      `app.routes.spec.ts` (registro, loadComponent, guard sin sesión, runtime harness
      con seed, regresión sin provider, rutas públicas intactas).
- [x] 3.2 RED→GREEN — Ítem "Configuración" (ícono settings inline) + `isActive` por
      prefijo en `sidebar-admin.ts|html|spec.ts`; specs de conteo 5→6 actualizados.

Evidencia: `ng test --include=**/app.routes.spec.ts --include=**/sidebar-admin.spec.ts`
→ 116/116 SUCCESS.

## Fase 4: Tracking + verify — COMPLETA

- [x] 4.1 — Este archivo.
- [x] 4.2 — Verify local final:
  - `npm run test:ci` → 663/663 SUCCESS.
  - `npx tsc --noEmit -p tsconfig.app.json` → sin errores.
  - `npm run build` → OK (warnings de budget CSS preexistentes en páginas de
    certificaciones/alumnos, ajenas a este ciclo).

## Desvíos respecto del design

- Ninguno funcional. El ítem Configuración se agregó a la lista principal del sidebar
  (el design admitía "pie o lista").
- El copy del banner de impacto quedó fijado en apply (open question del design):
  "Los cambios impactan en los documentos nuevos. Los certificados ya emitidos no
  cambian hasta regenerar su PDF."

## Pendiente para archive

- Actualizar spec openspec P5-02 ("HTTP-only") por la incorporación del mock
  `InMemoryInstitutionalConfigService` con toggle `useRealApi`.
