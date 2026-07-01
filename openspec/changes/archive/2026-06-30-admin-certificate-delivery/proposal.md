# Propuesta: Entrega y reenvío administrativo de certificados

## Intención

Habilitar que un certificado emitido por administración pueda entregarse o reenviarse por email mediante un enlace público de validación, sin exponer DNI, token completo, secretos ni rutas internas. Este ciclo desbloquea el contrato backend/DB/deploy para Marcos y deja a Matías una API consumible en un ciclo frontend posterior.

## Supuestos

- El reenvío no debe persistir tokens públicos en texto plano.
- Si se reenvía un certificado ya emitido, el backend puede generar un nuevo token, revocar el activo anterior y enviar el enlace nuevo.
- SMTP/cPanel y política de `composer.lock` siguen pendientes; no se agrega dependencia sin decisión explícita.

## Alcance

### Incluido
- Contrato de `POST /certificados/api/admin/certificados/{id}/reenviar`, protegido por `X-Admin-Key`.
- Regla de entrega segura: enlace de validación por email; token completo solo viaja en el email, nunca en respuesta JSON ni logs.
- Trazabilidad con auditoría segura usando tablas `cert_` existentes salvo que diseño justifique migración mínima.
- Documentación de impacto en backend, base y deploy cPanel.

### No incluido
- UI de Matías, pantallas admin o estilos.
- Envío masivo, métricas de entregabilidad, templates HTML complejos o cola de jobs.
- Credenciales reales SMTP/cPanel, lectura de material privado o deploy a `public_html`.

## Capacidades

### Nuevas capacidades
- `admin-certificate-delivery`: entrega/reenvío administrativo por email con enlace público, auditoría segura y adaptador de transporte.

### Capacidades modificadas
- `backend-contrato-api-certificados`: reemplazar la exclusión del reenvío por contrato operativo, DTOs y errores.
- `backend-modelo-datos-certificados`: formalizar reutilización de `cert_tokens_verificacion`/`cert_eventos_auditoria` o delta mínimo si diseño exige persistencia adicional.

## Enfoque

Implementar diseño mínimo compatible con PHP 8.4/cPanel: servicio de entrega desacoplado, transporte configurable y testeable, rotación de token en reenvío para evitar guardar tokens en texto plano. Si Marcos confirma SMTP y acepta reproducibilidad Composer, evaluar PHPMailer; si no, dejar transporte stub registrado como fallback explícito y no declarar email real como completado.

## Áreas afectadas

| Área | Impacto | Descripción |
|---|---|---|
| `apps/backend-php/` | Modificado/Nuevo | Ruta admin, servicio de entrega y configuración example. |
| `database/migrations/001_certificados_qr.sql` | Condicional | Solo si el diseño exige tabla de entregas. |
| `docs/backend/01-contrato-api-certificados.md` | Modificado | Endpoint, DTOs, privacidad y errores. |
| `docs/deploy/00-cpanel-certificados.md` | Modificado | SMTP/cPanel, credenciales externas y rollback. |

## Puntos de decisión

- Transporte: SMTP+PHPMailer con `composer.lock` versionado, `mail()` acotado o stub sin envío real.
- Contenido: enlace solamente o enlace más PDF adjunto.
- Persistencia: auditoría existente o tabla `cert_entregas`.

## Riesgos

| Riesgo | Prob. | Mitigación |
|---|---|---|
| Email no confirmado | Media | Diseñar adaptador y bloquear envío real sin configuración. |
| Dependencia rompe deploy | Media | Exigir decisión Composer antes de PHPMailer. |
| Exposición de token | Media | Rotación, no logs, no respuesta JSON con token. |

## Rollback

Retirar la ruta de reenvío, desactivar transporte en configuración externa y revertir deltas docs/specs. Si hubo migración nueva, aplicar rollback documentado; los certificados existentes permanecen válidos.

## Criterios de aceptación

- [ ] El contrato define request, response, errores y autorización del reenvío.
- [ ] El token completo no aparece en JSON, logs, auditoría ni base en texto plano.
- [ ] El plan de deploy explica impacto Composer/SMTP o declara stub sin envío real.
