# Diseño: F4-01 Detalle de certificación administrativo

## Enfoque técnico

Reemplazar la previsualización mínima de `/admin/certificaciones/:id` por un expediente administrativo mock-only dentro del mismo componente/ruta actual. Se conserva `CERTIFICATIONS_SOURCE`, `CertificacionDetalle`, `InMemoryCertificationsService`, el provider de `app.routes.ts` y el patrón `effect` + `loadGen` para route reuse. La referencia v0 se porta como intención visual a Angular 20 con CSS local y tokens globales (`--color-ink`, `--color-circuit`, `--color-valid`, `--color-destructive`), sin Tailwind ni dependencias nuevas.

F4-02 queda **diferido**: la réplica documental visible en F4-01 cubre el expediente; una ruta/vista PDF imprimible agregaría alcance, ruta y tests propios.

## Decisiones de arquitectura

| Decisión | Alternativas | Fundamento |
|---|---|---|
| Mantener `CertificationPreviewPage` y `/admin/certificaciones/:id` | Renombrar componente o crear `/detalle` | Menor diff, mantiene rutas/tests F2-06 y cumple la consigna de anclar en la ruta existente. |
| No ampliar `CertificacionDetalle` salvo necesidad real durante apply | Agregar DTO nuevo para número, módulos, autoridades | Los datos visuales faltantes se pueden derivar de `id`, `attendedDates`, `emitidoEn` y copy de handoff. Evita contrato especulativo. |
| Acciones 100% deshabilitadas | Simular clipboard, descarga, entrega o revocación local | La spec exige no ejecutar PDF/QR/link/entrega/revocación. Botones disabled + copy de handoff reducen riesgo. |
| QR decorativo CSS/HTML local | QR real, librería o SVG con token | Cumple paridad visual sin dato sensible ni dependencia nueva. |
| F4-02 diferido | Acoplar PDF preview al mismo cambio | F4-02 necesita alcance propio; F4-01 ya puede mostrar documento réplica sin ruta PDF real. |

## Flujo de datos

```txt
Ruta /admin/certificaciones/:id
  → input id string + certId() validado
  → CERTIFICATIONS_SOURCE.obtener(id)
  → detalle signal
  → expediente Angular: ficha + acciones disabled + QR decorativo + documento + auditoría
  → error seguro si id inválido/inexistente
```

No hay HTTP, storage, sesión real, token completo, DNI completo, email, PDF real ni revocación real.

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `apps/frontend-angular/src/app/features/admin/certifications/pages/preview/certification-preview-page.ts` | Modificar | Mantener carga actual; agregar helpers puros de presentación si hacen falta: número visual, fechas formateadas, estado/handOff labels. |
| `.../certification-preview-page.html` | Modificar | Portar layout v0: breadcrumb, encabezado, columna de control, ficha, acciones disabled, QR decorativo, zona de riesgo, documento réplica y auditoría. |
| `.../certification-preview-page.css` | Modificar | Implementar grilla responsive, paneles, documento institucional, badges, botones disabled y QR decorativo con tokens existentes. |
| `.../certification-preview-page.spec.ts` | Modificar | Cubrir expediente, secciones, acciones disabled/`aria-disabled`, id inválido, route reuse, privacidad y handoffs. |
| `apps/frontend-angular/src/app/features/admin/certifications/__checks__/no-secrets.spec.ts` | Modificar | Incluir nuevos helpers/clases y prohibir red, storage, admin key y datos sensibles. |
| `apps/frontend-angular/src/app/features/admin/certifications/__checks__/no-real-data.spec.ts` | Modificar | Validar que seed/DOM no expongan DNI completo, token completo, email, legajo, matrícula ni UUID. |
| `apps/frontend-angular/src/app/app.routes.spec.ts` | Modificar | Ajustar expectativa runtime de `/admin/certificaciones/1` al expediente sin tocar la ruta. |
| `apps/frontend-angular/src/app/features/admin/certifications/in-memory-certifications.service.ts` | Sin cambio previsto | Reusar F2-06. Modificar solo si apply prueba que la paridad requiere un campo mock seguro no derivable. |

## Interfaces / contratos

No se agrega API ni ruta nueva. Contrato vigente:

```ts
interface CertificationsService {
  listar(filtros?: CertificacionesFiltros): Promise<readonly Certificacion[]>;
  obtener(id: number): Promise<CertificacionDetalle>;
  contar(): Promise<number>;
}
```

La UI solo consume `documentMasked`, `tokenPrefix`, `publicValidationUrl` truncada, `attendedDates` y `auditEvents`.

## Estrategia de testing

| Capa | Qué probar | Enfoque |
|---|---|---|
| Unit/component | Render del expediente, grilla/secciones, acciones disabled, QR decorativo, zona de riesgo, documento réplica, auditoría | `npm run test:ci` con specs Angular existentes. |
| Runtime/routing | `/admin/certificaciones/:id`, provider real, id inválido/inexistente y route reuse | `app.routes.spec.ts` + `RouterTestingHarness`. |
| Privacidad | Sin DNI completo, token completo, email, legajo, matrícula, HTTP, storage, `X-Admin-Key` | Checks negativos existentes endurecidos. |
| Visual/verify | Paridad contra `muestra_pagina/app/admin/certificaciones/[id]` y `expediente-certificacion.tsx` | `sdd-verify` debe adjuntar captura Angular y captura/referencia v0, con observaciones de jerarquía, layout, secciones y estados. |
| Build | Sin dependencias nuevas ni warnings | `npm run build`. |

## Migración / rollout

No requiere migración. Rollback: revertir los cambios en `preview/`, specs/checks asociados y volver al `<dl>` F2-06.

## Preguntas abiertas

- Ninguna bloqueante.

> **F4-02 diferido**: la réplica documental visible en F4-01 cubre el expediente; una ruta/vista PDF imprimible (F4-02) agregaría alcance, ruta y tests propios. No se implementa en este cambio.
