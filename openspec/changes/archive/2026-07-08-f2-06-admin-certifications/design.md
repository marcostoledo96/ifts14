# Diseño — F2-06 Certificaciones admin

## Enfoque técnico

Activar Certificaciones como feature Angular 20 mock-only dentro del shell admin existente. Se replica el patrón validado en Cursos/Asistencias: modelos + `InjectionToken` + servicio en memoria + páginas standalone + checks negativos. No se conecta backend, no se agrega storage, no se adelantan PDF/QR/revocación/entrega real ni auth con `X-Admin-Key`.

## Decisiones de arquitectura

| Tema | Decisión | Fundamento |
|---|---|---|
| Feature | Crear `features/admin/certifications/` con `certifications.models.ts`, `certifications.service.ts`, `in-memory-certifications.service.ts` en la raíz de la feature; subcarpetas `pages/list`, `pages/preview` y `__checks__`. Sin subcarpeta `data/` (el servicio en memoria vive en la raíz de la feature, igual que en Cursos). | Mantiene estructura por feature y evita mezclar certificaciones con cursos/asistencias. |
| Source | `CERTIFICATIONS_SOURCE = InjectionToken<CertificationsService>` + `InMemoryCertificationsService`. | Mismo seam que `COURSES_SOURCE`/`ATTENDANCE_SOURCE`; futura sustitución HTTP sin tocar componentes. |
| Datos | Seed ficticio de 3–6 certificados, clonado por instancia; `listar`, `obtener`, `contar`. | Suficiente para UI navegable sin persistencia ni mutaciones especulativas. |
| Rutas | Agregar `certificaciones/:id` y `certificaciones` (estática) después de las rutas `cursos/*` existentes y antes del catch-all admin. Provider en la ruta `admin`. | Preserva `adminGuard`, route injector y orden seguro ya cubierto por `app.routes.spec.ts`; los paths no solapan con `cursos/*`, así que el orden relativo es seguro. |
| Alcance | CTAs de PDF, entrega y revocación deshabilitados con handoff explícito. | Evita scope creep hacia F4-F6 y no promete acciones reales. |

## Flujo de datos

```txt
Sidebar/Dashboard → /admin/certificaciones → CertificationsListPage
                                      │
                                      └→ CERTIFICATIONS_SOURCE.listar/contar()

Lista → /admin/certificaciones/:id → CertificationPreviewPage
                                  └→ CERTIFICATIONS_SOURCE.obtener(id)
```

La previsualización consume DTO seguro: `documentMasked`, `tokenPrefix`, `publicValidationUrl` truncado, `attendedDates`, `auditEvents` y `links` no operativos.

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `features/admin/certifications/certifications.models.ts` | Crear | Tipos `EstadoCertificado`, `Certificacion`, `CertificacionDetalle`, filtros y DTOs seguros. |
| `features/admin/certifications/certifications.service.ts` | Crear | Interfaz y `CERTIFICATIONS_SOURCE`. |
| `features/admin/certifications/in-memory-certifications.service.ts` | Crear | Seed ficticio, clone defensivo, `listar/obtener/contar`. |
| `features/admin/certifications/pages/list/*` | Crear | Listado, búsqueda, filtro por estado, banner demo y enlaces a preview. |
| `features/admin/certifications/pages/preview/*` | Crear | Vista segura con `<dl>`, fechas, auditoría mínima y CTAs deshabilitados. |
| `features/admin/certifications/__checks__/*` | Crear | Checks de secretos/storage/red y datos reales. |
| `app.routes.ts`, `app.routes.spec.ts` | Modificar | Rutas, provider y tests runtime con `RouterTestingHarness` + `withComponentInputBinding()`. |
| `sidebar-admin.*`, `admin-dashboard-page.*` | Modificar | Certificaciones pasa de placeholder a navegación real con conteo demo. |

## Contratos

```ts
type EstadoCertificado = 'borrador' | 'vigente' | 'revocado' | 'vencido';
interface CertificationsService {
  listar(filtros?: CertificacionesFiltros): Promise<readonly Certificacion[]>;
  obtener(id: number): Promise<CertificacionDetalle>;
  contar(): Promise<number>;
}
```

Campos prohibidos en modelos/UI admin: DNI completo, token completo, email, legajo, matrícula, hashes, claves, rutas internas reales.

## Comportamiento de componentes

- Lista: `input type="search"`, `select` por estado, resultados en `<article>`, vacío con `<output aria-live="polite">`, error con `role="alert"`.
- Preview: valida `id` numérico; id inválido o inexistente muestra “Certificación no encontrada” sin excepción. URLs públicas se muestran truncadas; el token completo nunca aparece como campo separado.
- Copy seguro: “Datos de demostración”, “No persiste al recargar”, “Disponible en F4/F5/F6”.

## Estrategia de pruebas

| Capa | Qué probar | Enfoque |
|---|---|---|
| Unit | Filtros, `obtener`, `contar`, id inválido, clone defensivo. | Specs del servicio en memoria. |
| Component | Lista, filtros, empty state, preview segura, CTAs deshabilitados. | Specs de páginas con providers mock reales. |
| Runtime | Guard sin sesión, navegación con sesión, provider real, orden de rutas. | `app.routes.spec.ts` con `RouterTestingHarness`. |
| Seguridad | Sin `X-Admin-Key`, HTTP, fetch, storage, cookies, DNI/token completos, emails o datos plausibles. | `__checks__/no-secrets.spec.ts` y `no-real-data.spec.ts`. |

Verificación esperada: `npm run test:ci` y `npm run build` en `apps/frontend-angular/`.

## Migración, rollback y riesgos

No hay migración. Rollback: revertir PR, quitar rutas/provider y carpeta `certifications`, restaurar sidebar/dashboard como placeholder.

Riesgos: scope creep a F4-F6, token completo en URL visible, provider faltante en runtime, ids inválidos sin manejo. Mitigación: CTAs deshabilitados, truncado, tests runtime y checks negativos.

## Preguntas abiertas

Ninguna bloqueante.
