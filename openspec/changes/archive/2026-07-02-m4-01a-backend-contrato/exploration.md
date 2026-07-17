# Exploración: M4-01A — backend-contrato-token-permanente-dni-fechas

## Objetivo
Analizar el estado actual de los contratos documentales para asegurar que reflejen todas las decisiones D0 (QR permanente, DNI completo público, fechas asistidas, auth simple temporal, firmantes institucionales, entrega manual sin SMTP, gates Composer y staging `/certificados_staging/`).

## Hallazgos
Tras revisar los archivos base:
- `docs/backend/01-contrato-api-certificados.md`
- `openspec/specs/backend-contrato-api-certificados/spec.md`
- `docs/database/01-modelo-datos-certificados.md`
- `openspec/specs/backend-modelo-datos-certificados/spec.md`

Se constata que **ya incluyen las definiciones principales** solicitadas para este ciclo:
1. **DNI completo**: se especifica `student.documentNumber` en el DTO público.
2. **Fechas asistidas**: se especifica `course.attendedDates`.
3. **Entrega manual sin SMTP**: se removió `POST /admin/certificados/{id}/reenviar` y se detalla `GET /admin/certificados/{id}/entrega-manual`.
4. **Token permanente y recuperable**: se detalla la estrategia de `token_cifrado` (AES-256-GCM) para conservar el QR.
5. **Autenticación temporal**: se sigue requiriendo `X-Admin-Key`.
6. **Firmantes**: se exige Rector/a y Asesor/a Pedagógica vía configuración institucional.

## Conclusión
El ciclo documental M4-01A se encuentra prácticamente cubierto en los contratos existentes. El trabajo restante consiste en realizar una verificación de completitud y proceder con la consolidación y archivo del ciclo para habilitar el inicio de la fase M4-01B (implementación).
