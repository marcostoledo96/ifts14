# Propuesta: backend-admin-certificados — endpoints administrativos mínimos de certificados

## Intención

El backend PHP 8.4 solo expone validación pública. Los administradores necesitan emitir y revocar certificados de forma segura, auditada y sin acceso directo a la base. Esta propuesta agrega el mínimo seguro de endpoints administrativos para el ciclo M3-03.

## Alcance

### En alcance
- Gate `X-Admin-Key` contra configuración externa; *fail closed* si falta o no coincide; comparación con `hash_equals()`.
- `POST /admin/certificados`: emisión de certificado + token de verificación, con plan/demo de validación ficticio.
- `POST /admin/certificados/{id}/revocar`: revocación del certificado, invalidación de tokens activos y registro de auditoría.
- DTOs seguros: nunca devolver DNI completo ni token completo.

### Fuera de alcance
- `POST /admin/certificados/{id}/reenviar`: excluido explícitamente hasta confirmar el mecanismo de email/reenvío.
- Angular, frontend, migraciones SQL, usuarios/roles, sesiones y envío real de correo.

## Capacidades

> Contrato con la fase de specs. Cada capacidad nueva genera un `openspec/specs/<nombre>/spec.md`; cada capacidad modificada genera un delta spec en esta carpeta.

### Nuevas capacidades
- `admin-auth`: autorización mínima por header `X-Admin-Key` comparado con configuración externa en tiempo constante.
- `admin-certificate-emission`: emisión de certificado y token, validación demo y auditoría.
- `admin-certificate-revocation`: revocación de certificado, invalidación de tokens activos y auditoría.

### Capacidades modificadas
- `backend-contrato-api-certificados`: agregar endpoints administrativos y escenarios al contrato de API.

## Enfoque

Aplicar la opción 1 recomendada en la exploración: extender el front controller con rutas admin, agregar `AuthGate` para el header `X-Admin-Key`, y `AdminCertificateService` para emisión/revocación con PDO preparado. Se reutiliza el modelo `cert_` existente; no se crean migraciones. La auditoría sigue el patrón no bloqueante ya usado en validación pública.

## Áreas afectadas

| Área | Impacto | Descripción |
|------|---------|-------------|
| `apps/backend-php/index.php` | Modificado | Agregar rutas `/admin/certificados` y `/admin/certificados/{id}/revocar`. |
| `apps/backend-php/src/Config.php` | Modificado | Validar `admin_api_key` en configuración externa; falla cerrada. |
| `apps/backend-php/src/AuthGate.php` | Nuevo | Gate de autorización mínimo con `hash_equals()`. |
| `apps/backend-php/src/AdminCertificateService.php` | Nuevo | Lógica de emisión, revocación y auditoría. |
| `docs/backend/01-contrato-api-certificados.md` | Modificado | Documentar endpoints y DTOs admin. |
| `openspec/specs/backend-contrato-api-certificados/spec.md` | Modificado | Agregar escenarios administrativos. |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|--------|--------------|------------|
| API key única y compartida no permite auditoría por administrador. | Media | Documentar como mínimo viable de M3-03; sistema de usuarios queda como deuda técnica explícita. |
| Endpoints admin expuestos si falta `admin_api_key`. | Baja | Fail closed: rechazo 401 cuando la clave no está configurada. |
| Filtración de DNI/token en respuestas o logs. | Baja | DTOs con datos enmascarados; auditoría solo con huellas seguras. |
| Emisión con validación demo puede confundirse con reglas reales. | Media | Documentar plan/demo como ficticio; no integrar validadores reales. |
| Presupuesto de 400 líneas excedido. | Media | Slice acotado a auth + emisión + revocación; reenvío excluido. |

## Plan de rollback

1. Revertir `apps/backend-php/index.php` y `src/Config.php`.
2. Eliminar `apps/backend-php/src/AuthGate.php` y `src/AdminCertificateService.php`.
3. Restaurar docs y specs a la versión previa.
4. Confirmar que `/health` y validación pública siguen respondiendo.

## Dependencias

- Configuración externa con `admin_api_key` no vacío fuera del repositorio.
- Plan/demo de validación de emisión acordado y documentado como ficticio.
- Mecanismo de email/reenvío aún no definido; por eso queda fuera de este ciclo.

## Criterios de éxito

- [ ] Sin `X-Admin-Key` válido los endpoints administrativos responden `401 UNAUTHORIZED`.
- [ ] `POST /admin/certificados` emite certificado + token y devuelve solo datos seguros (sin token completo ni DNI completo).
- [ ] `POST /admin/certificados/{id}/revocar` cambia el estado a revocado e invalida tokens activos.
- [ ] Cada acción admin registra auditoría con tipo, resultado y `request_id`, sin datos sensibles.
- [ ] No se agregan migraciones SQL nuevas.
- [ ] No se exponen secretos, DNI ni tokens completos en respuestas, logs ni documentación.
