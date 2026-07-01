## Exploration: M4-02 — Entrega/Reenvío de certificados por email

### Current State

- El backend PHP 8.4.21 en `apps/backend-php/` tiene validación pública, emisión administrativa, revocación y descarga del PDF/QR.
- El ciclo M4-01 `backend-pdf-qr-certificados` cerró con **PASS WITH WARNINGS**: el PDF se genera sincrónicamente durante `emitir()`, el token completo no persiste y el admin puede descargar el PDF.
- El token de verificación solo existe en memoria durante `emitir()`; por eso no se puede reenviar después sin definir un mecanismo de entrega.
- El contrato vigente (`docs/backend/01-contrato-api-certificados.md`) y las specs `backend-contrato-api-certificados` / `admin-certificate-emission` dejan explícitamente fuera de alcance `POST /certificados/api/admin/certificados/{id}/reenviar` hasta definir un mecanismo de email/entrega.
- Matías necesita este contrato para el ciclo F5-04 "Enviar/reenviar certificación" (`MATIAS_PROMPTS_SDD_FASE2.md`).
- Pendientes: transporte de email, si se adjunta PDF, si el cuerpo incluye token completo o link de validación, y la política de `composer.lock`/`vendor/`.

### Affected Areas

- `apps/backend-php/index.php` — registrar `POST /admin/certificados/{id}/reenviar` (o similar) protegido por `X-Admin-Key`.
- `apps/backend-php/src/AdminCertificateService.php` — lógica de entrega/reenvío sin exponer token completo en logs ni respuestas.
- `apps/backend-php/src/EmailDeliveryService.php` (nuevo) — abstraer el transporte y permitir stub en tests.
- `apps/backend-php/config/certificados-config.example.php` — placeholders de SMTP/canal sin valores reales.
- `apps/backend-php/composer.json` — posible dependencia de email y decisión sobre `composer.lock`.
- `docs/backend/01-contrato-api-certificados.md` — endpoint, DTO, errores y reglas de privacidad.
- `docs/deploy/00-cpanel-certificados.md` — implicancias de envío de email en cPanel.
- `database/migrations/001_certificados_qr.sql` — posible tabla `cert_entregas` para trazabilidad (a decidir en diseño).

### Approaches

1. **PHPMailer vía Composer (recomendado condicional)**
   - Usar `phpmailer/phpmailer` para SMTP con TLS; enviar link de validación y/o PDF adjunto.
   - Pros: maduro, documentado, adjuntos, auth SMTP.
   - Cons: nueva dependencia; requiere Composer/cPanel; credenciales fuera de Git.
   - Effort: Medium.

2. **Symfony Mailer vía Composer**
   - Más moderno, basado en DSN.
   - Pros: arquitectura limpia, desacoplado.
   - Cons: más dependencias transitivas; posible overkill para cPanel.
   - Effort: Medium.

3. **Función nativa `mail()` de PHP**
   - Sin dependencias; usar headers básicos.
   - Pros: siempre disponible en cPanel.
   - Cons: poco confiable, difícil de testear, riesgo de headers inseguros, alta tasa de spam.
   - Effort: Low, pero riesgo alto.

4. **API externa (SendGrid / AWS SES)**
   - Cliente HTTP propio o SDK.
   - Pros: entregabilidad y métricas.
   - Cons: cuenta/API key, costo, complejidad, posible bloqueo institucional.
   - Effort: High.

5. **Stub de entrega registrada (fallback seguro)**
   - El endpoint guarda en base que se solicitó reenvío, pero no envía realmente.
   - Pros: desbloquea UI/auditoría sin depender de SMTP.
   - Cons: no entrega el token automáticamente; deja deuda funcional explícita.
   - Effort: Low.

### Recommendation

- El próximo ciclo de Marcos debe ser **M4-02 `admin-certificate-delivery`** (entrega/reenvío de certificado por email).
- Elegir **PHPMailer** si se confirma SMTP/cPanel; si no se confirma, empezar con un **stub de entrega registrada** que persista el intento y permita a Matías avanzar la UI, dejando el envío real como deuda explícita.
- Resolver en el mismo ciclo (o inmediatamente antes) la política de `composer.lock`/`vendor/` porque cualquier nueva dependencia la afecta.

### Risks

- **Transporte de email no confirmado**: sin decisión de SMTP/cPanel no se puede fijar dependencia ni contrato definitivo.
- **`composer.lock` ignorado**: agregar PHPMailer amplía la deuda de reproducibilidad; necesita decisión de Marcos antes de merge.
- **Token completo en email**: el cuerpo del mail puede ser el único lugar donde el token completo viaja; hay que definir TTL, link de validación y si se adjunta PDF.
- **cPanel/SPF/DKIM**: si el remitente no está autorizado, los mails pueden ir a spam.

### Ready for Proposal

Sí, como ciclo de exploración/propuesta. Antes de `sdd-design`/`sdd-tasks` se necesita confirmación de:

1. Mecanismo de email preferido (SMTP/PHPMailer, `mail()`, servicio externo o stub).
2. Si el email adjunta PDF y/o envía link de validación con token completo.
3. Decisión sobre versionar `apps/backend-php/composer.lock`.
