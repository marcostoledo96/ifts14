# Delta for admin-certifications-frontend

Canonical requirements: change-root `spec.md` (REQ-CPREV-001…007).

## MODIFIED Requirements

### Requirement: Previsualización segura y handoff explícito

El sistema DEBE mostrar en `/admin/certificaciones/:id` un expediente con estado, alumno, curso, asistencias, documento réplica, auditoría, QR decorativo, zona de riesgo, `documentMasked`, `tokenPrefix` y URL truncada decorativa. `Descargar PDF` y `Regenerar PDF` DEBEN navegar a `/admin/certificaciones/:id/pdf`; `Revocar certificación` DEBE navegar a `/admin/certificaciones/:id/revocar`; `Entrega manual` DEBE navegar al flujo de entrega vigente. `Copiar link` y `Compartir` DEBEN comportarse según REQ-CPREV-002…004 (URL canónica de `obtenerEntregaManual().publicValidationUrl`; deshabilitados si revocado o sin URL). Autoridades según REQ-CPREV-005…006. El QR/token DEBE permanecer permanente. NO DEBE exponer DNI/token completos, email, legajo ni matrícula.
(Previously: Copiar link y Entrega manual deshabilitados con handoff F6-03/F5-04; sin Compartir ni autoridades reales.)

#### Scenario: Expediente de una certificación

- **Given** Bedelía abre un expediente con id válido
- **When** la pantalla carga
- **Then** DEBE mostrar datos seguros, URL truncada decorativa y permitir volver al listado.

#### Scenario: Acciones PDF, revocación, entrega y copy/share

- **Given** Bedelía visualiza un expediente
- **When** selecciona PDF, revocación, entrega, o inspecciona Copiar/Compartir
- **Then** las acciones PDF DEBEN abrir la vista imprimible sin rotar QR/token.
- **And** la revocación DEBE navegar a `/admin/certificaciones/:id/revocar`.
- **And** Entrega manual DEBE navegar al flujo de entrega vigente.
- **And** Copiar/Compartir DEBEN seguir REQ-CPREV-003 y REQ-CPREV-004.

#### Scenario: Id inexistente, inválido o ausente

- **Given** el expediente recibe un id inexistente, inválido o ausente
- **When** se carga la ruta administrativa
- **Then** DEBE mostrar un estado seguro sin romper la navegación admin.

#### Scenario: Frontera de datos administrativa

- **Given** el expediente se renderiza en la UI admin
- **When** se inspecciona la información visible
- **Then** NO DEBE exponer DNI completo, token completo, email, legajo ni matrícula.

## ADDED Requirements

Covered by REQ-CPREV-001…007 in change-root `spec.md` (carga paralela, URL canónica, Copiar, Compartir/`AbortError`, autoridades, config pendiente, privacidad/cierre F6-03).
