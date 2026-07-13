# F6-01: Revocar certificación (Frontend)

Este documento registra la finalización del ciclo F6-01 de la especificación SDD.

## Alcance Implementado
Se integró el flujo de revocación de certificaciones en el dashboard administrativo (Angular 20).
El flujo incluye:
- Servicio actualizado (`CertificationsService` y su implementación In-Memory) para exponer el método `revocar(id, motivo)`.
- Estado actualizado para inyectar eventos de auditoría simulando la acción irreversible (`revocacion`).
- Nueva ruta `/admin/certificaciones/:id/revocar` asociada al modal de confirmación `CertificationRevokePage`.
- Paridad visual verificada frente a la maqueta Next.js/React (`muestra_pagina`).
- Actualización de `CertificationPreviewPage` para reemplazar el botón "Revocar certificación" de desactivado a un enlace `[routerLink]` activo.
- Cobertura total de pruebas (543 tests en verde), confirmando cero fugas de datos sensibles y ausencia de peticiones de red reales (`no-secrets.spec.ts` y `no-real-data.spec.ts`).

## Siguientes Pasos
Este componente se encuentra listo para su integración con el backend PHP (F5-XX / F6-XX), al momento de contar con APIs reales y bases de datos persistentes. Mientras tanto, se mantiene bajo la fuente de datos ficticia `InMemoryCertificationsService`.
