# Diseño: Corregir fechas y estados en F4-02

## Enfoque técnico

Cambio Angular mínimo sobre la vista imprimible existente. El componente seguirá consumiendo `CertificacionDetalle`: formateará cada `attendedDates` sin colapsarla, derivará una única presentación de estado y el template renderizará fechas auditables más marca/banda solo para estados no vigentes. Se preservan `window.print()`, las reglas A4 verificadas, la frontera mock y la impresión no bloqueada. No se agregan DTO, backend, rutas, dependencias ni abstracciones nuevas.

## Decisiones de arquitectura

| Opción | Trade-off | Decisión y fundamento |
|---|---|---|
| Helpers locales en la página vs pipe/componente nuevo | Menos reutilización, mucha menos superficie | Usar helpers locales: `formatearFechaAsistida(fecha)` conserva `YYYY-MM-DD` y `estadoPresentacion()` devuelve `null` para `vigente` o `{ clave, marca, titulo, detalle }` para los otros estados. No existe segundo consumidor que justifique una abstracción. |
| Lista compacta vs tabla completa | La lista ocupa menos alto y conserva todas las fechas | Renderizar un bloque semántico compacto “Fechas asistidas” con cada ISO y secuencia; evita el período inventado y protege una A4. |
| CSS por estado duplicado vs base compartida | Los modificadores requieren clases dinámicas simples | Reemplazar `cert-revocado-*` por bases `.cert-estado-marca`/`.cert-estado-banda` y modificadores `--borrador`, `--vencido`, `--revocado`; geometría y compactación se definen una vez. |
| Editar evidencia archivada vs checker activo | Duplicar el checker cuesta un archivo | Crear el checker en el cambio activo. La evidencia archivada es inmutable y sirve solo como base conocida. |

## Flujo de datos

```text
id de ruta → CERTIFICATIONS_SOURCE.obtener(id) → CertificacionDetalle
  ├─ attendedDates → helper de fecha → lista exacta en folio
  └─ estado → estadoPresentacion → marca + banda (o nada si vigente)
                                      ↓
                        window.print() sin guard por estado
                                      ↓
                 checker app real: ids 1 / 3 / 4 / 5
```

## Cambios de archivos

| Archivo completo | Acción | Descripción |
|---|---|---|
| `/home/marcos/Escritorio/ifts14/apps/frontend-angular/src/app/features/admin/certifications/pages/pdf/certification-pdf-preview-page.ts` | Modificar | Eliminar `periodo()`; agregar helpers locales de fecha y presentación de estado. No tocar carga ni `imprimir()`. |
| `/home/marcos/Escritorio/ifts14/apps/frontend-angular/src/app/features/admin/certifications/pages/pdf/certification-pdf-preview-page.html` | Modificar | Listar fechas exactas; renderizar una marca y banda derivadas. |
| `/home/marcos/Escritorio/ifts14/apps/frontend-angular/src/app/features/admin/certifications/pages/pdf/certification-pdf-preview-page.css` | Modificar | Bases, tres modificadores y bloque compacto de fechas; conservar `overflow: visible`, `break-inside: avoid`, `@page` y `print-color-adjust`. |
| `/home/marcos/Escritorio/ifts14/apps/frontend-angular/src/app/features/admin/certifications/pages/pdf/certification-pdf-preview-page.spec.ts` | Modificar | RED primero: fechas exactas, ausencia de “dictado entre”, estados 1/3/4/5 y no bloqueo de impresión. |
| `/home/marcos/Escritorio/ifts14/apps/frontend-angular/src/app/features/admin/certifications/__checks__/no-real-data.spec.ts` | Modificar | Parametrizar privacidad para ids 1/3/4/5: sin DNI, UUID, email, legajo o matrícula; documento enmascarado y URL truncada. |
| `/home/marcos/Escritorio/ifts14/apps/frontend-angular/src/app/features/admin/certifications/__checks__/no-secrets.spec.ts` | Modificar | Mantener el barrido automático de métodos y explicitar cobertura del nuevo helper sin red/storage/cookies/claves. |
| `/home/marcos/Escritorio/ifts14/openspec/changes/f4-02-codex-feedback/evidence/print-app-check.mjs` | Crear | Adaptar el checker conocido a cuatro casos sin modificar el archivo archivado. |
| `/home/marcos/Escritorio/ifts14/docs/frontend/F4-02-vista-previa-pdf.md` | Modificar al archivar | Registrar fechas exactas, estados y evidencia nueva. |

## Interfaces / contratos

Contrato interno, sin exportar: `estadoPresentacion(): { clave: 'borrador' | 'vencido' | 'revocado'; marca: string; titulo: string; detalle: string } | null`. Las fechas se muestran en su valor ISO existente; entradas vacías no crean bloque. `vigente` no produce marca/banda. Ningún estado deshabilita el botón ni evita `window.print()`.

## Estrategia de pruebas

| Capa | Qué probar | Enfoque |
|---|---|---|
| Componente | Fechas y estado | RED parametrizado para 1/3/4/5; luego cambio mínimo. |
| Frontera | Privacidad y ausencia de integraciones | Checks DOM por los cuatro ids y `no-secrets` existente/ampliado. |
| App real | Una A4, sin clipping/chrome, copy/fechas correctos | Checker CDP + `printToPDF`, `pdfinfo` y `pdftotext`; debe fallar si falta una fecha/marca, aparece “dictado entre”, hay datos prohibidos, `overflow !== visible` o páginas ≠ 1. |

## Matriz de amenazas

| Límite | Aplicabilidad | Respuesta / RED |
|---|---|---|
| Rutas tipo documentación | N/A: el checker ejecuta binarios fijos; no clasifica archivos ejecutables. | Sin tarea. |
| Selección de repositorio Git | N/A: no usa Git. | Sin tarea. |
| Estado de commit | N/A: no crea commits. | Sin tarea. |
| Estado de push | N/A: no hace push. | Sin tarea. |
| Comandos PR | N/A: no automatiza PR. | Sin tarea. |

## Migración, despliegue y reversión

No requiere migración ni rollout. Rollback: revertir conjuntamente los seis archivos Angular y eliminar el checker activo; restaurar `periodo()` y las clases `cert-revocado-*`. No hay datos, API ni configuración que revertir. Si el checker excede una A4, falla sin bloquear ni recortar: se reduce únicamente espaciado del nuevo bloque, nunca se reinstala `overflow: hidden`.

## Preguntas abiertas

Ninguna.
