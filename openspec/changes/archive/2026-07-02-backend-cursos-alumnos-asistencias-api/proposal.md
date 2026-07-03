# Proposal: API admin mínima para cursos, alumnos, fechas y asistencias

## Intent

Permitir que Bedelía cargue datos reales de cursos, alumnos, fechas y asistencias desde la API administrativa, sin editar MariaDB manualmente, para que la emisión de certificados use el modelo `cert_` existente.

## Scope

### In Scope
- Endpoints admin con `X-Admin-Key` para crear/listar/consultar/actualizar cursos, alumnos y fechas.
- Endpoints admin para registrar y anular asistencias con eliminación lógica.
- DTOs administrativos seguros: DNI enmascarado; nunca DNI completo, token, SQL ni secretos.
- Pruebas procedurales PHP con fixtures ficticios y documentación del contrato.

### Out of Scope
- Frontend Angular, login admin real, roles y permisos granulares.
- SMTP, email, reenvío automático o cola de entregas.
- Migraciones nuevas o cambios de emisión/PDF/validación pública salvo integración mínima.

## Capabilities

### New Capabilities
- `admin-master-data-api`: API administrativa para cursos, alumnos, fechas y asistencias que alimentan la emisión desde datos reales.

### Modified Capabilities
- `backend-contrato-api-certificados`: agrega endpoints, DTOs y errores administrativos de datos maestros.

## Approach

Agregar un servicio único `AdminMasterDataService` y rutas en `apps/backend-php/index.php`, reutilizando `requireAdmin`, `requireJsonContentType`, `readJsonBody`, `respondToAdmin`, `Database::pdo` y `DniCipher`. Mantener operaciones transaccionales pequeñas, prepared statements y validación de estado antes de registrar asistencias.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/backend-php/index.php` | Modified | Nuevas rutas admin de datos maestros. |
| `apps/backend-php/src/AdminMasterDataService.php` | New | Servicio CRUD mínimo y asistencias. |
| `apps/backend-php/tests/` | Modified | Scripts procedurales con fixtures ficticios. |
| `docs/backend/01-contrato-api-certificados.md` | Modified | Contrato HTTP y DTOs admin. |
| `openspec/specs/backend-contrato-api-certificados/spec.md` | Modified | Requerimientos de API admin. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Filtrar DNI completo en admin | Med | Responder solo `dniMostrar`/máscara y auditar sin datos sensibles. |
| `dni_cipher_key` ausente | Med | Falla cerrada `500 CONFIGURATION_ERROR` sin persistir alumno. |
| Asistencia activa duplicada | Med | Validar y mapear unique DB a `409 CONFLICT`. |
| Servicio único crece | Low | Mantener métodos atómicos; separar servicios solo cuando duela. |

## Rollback Plan

Remover rutas nuevas, `AdminMasterDataService`, pruebas y deltas de docs/specs. No tocar migraciones ni datos existentes; las asistencias anuladas siguen como historial lógico.

## Dependencies

- Migraciones `003` y `004` aplicadas/verificadas en el entorno objetivo.
- Configuración externa `admin_api_key` y `dni_cipher_key` válida.

## Success Criteria

- [ ] La API permite cargar curso, alumno cifrado, fechas y asistencias sin edición manual de DB.
- [ ] Las respuestas admin no exponen DNI completo ni secretos.
- [ ] La emisión existente puede usar esos datos para generar certificado, PDF y link permanente de entrega manual.
