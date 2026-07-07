# Diseño: M3-06 final — smoke Angular/API

## Enfoque técnico

Ciclo mínimo, verify-only y documental. No se modifica runtime salvo contradicción concreta entre specs y código. El cierre registra checklist compartido Angular/API, evidencia reproducible y bloqueos locales con datos ficticios. La fuente técnica es el estado post-merge: Angular ya alterna `MockValidationSource`/`HttpValidationSource` por `environment.useRealApi`, el backend expone contrato público/admin seguro y CI backend usa Docker + MariaDB 10.6.

## Decisiones de arquitectura

| Opción | Tradeoff | Decisión |
|---|---|---|
| Documentar checkpoint sin tocar producto | Menor cobertura runtime local, menor riesgo de regresión | Elegido: las specs piden verificación y evidencia; la exploración no detectó brecha funcional. |
| Usar CI backend como evidencia principal | Depende del workflow remoto, evita exigir PHP/Docker/MariaDB local | Elegido: local está bloqueado por PHP CLI/sudo Docker/MariaDB; CI reproduce Docker + MariaDB. |
| Mantener `X-Admin-Key` temporal | No resuelve login real, evita scope creep | Elegido: login real queda fuera; admin no debe llegar al bundle Angular público. |
| Corregir sólo si aparece gap contractual | Puede dejar mejoras no críticas para después | Elegido: respeta Ponytail/YAGNI y el alcance M3-06. |

## Flujo de datos

```txt
Angular PublicValidationPage
  → ValidationService
  → VALIDATION_SOURCE
      ├─ MockValidationSource (default local)
      └─ HttpValidationSource → /certificados/api/certificados/{token}/verificacion
  → result-mapper → UI pública

Backend PHP index.php
  → CertificateValidator
  → Response JSON/no-store headers
  → DTO público D0: documentNumber + attendedDates
```

Admin queda como contrato documentado: `AdminCertificateService` expone `documentMasked`, `tokenPrefix`, `links` relativos y `attendedDates`, sin DNI completo ni token completo.

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `docs/frontend/00-angular20-port-v0.md` | Modificar | Agregar anexo “Checkpoint M3-06 final” con checklist Angular/API, comandos Angular y estado smoke/manual. |
| `docs/backend/01-contrato-api-certificados.md` | Modificar | Agregar checklist D0: DTO público, DTO admin, errores, privacidad, token permanente y evidencia CI. |
| `openspec/changes/m3-06-final-angular-api-smoke/design.md` | Crear | Este diseño. |
| `.github/workflows/backend-tests.yml` | Referenciar | Fuente de evidencia backend; no modificar salvo brecha. |
| `scripts/m3-06-smoke.sh` | Referenciar | Registrar estado: smoke backend-only bloqueado localmente si falta PHP CLI. |

Si durante apply aparece una contradicción concreta, el cambio permitido es mínimo y localizado en el contrato afectado (`dto.ts`, `result-mapper.ts`, `http-validation.source.ts`, `CertificateValidator.php`, `Response.php` o `index.php`) más su test existente. No crear endpoints, migraciones ni dependencias.

## Interfaces / contratos

- Público D0: `student.documentNumber` y `course.attendedDates` para certificados vigentes nuevos; DNI completo sólo en UI/DTO público.
- Legado tolerado: `student.documentMasked` sin fechas cuando no exista snapshot D0.
- No verificable: `CERTIFICATE_NOT_FOUND`, revocado, vencido, faltante o formato inválido → estado público no verificable; sin revelar causa sensible.
- Técnico: 5xx/red/JSON inválido → error técnico genérico.
- Admin: `documentMasked`, `tokenPrefix`, `links` relativos; nunca DNI completo ni token completo.
- Invariantes: token/QR permanente; sin rotación normal, sin email, sin SMTP/PHPMailer, sin vendor versionado.

## Estrategia de verificación

| Capa | Qué verificar | Enfoque |
|---|---|---|
| Backend CI | Docker PHP + MariaDB 10.6, unit y E2E | Referenciar resultado de `.github/workflows/backend-tests.yml`; comandos locales Docker sólo si el entorno lo permite. |
| Frontend unit | Mapper, fuente HTTP/mock, página pública | Ejecutar en apply/verify: `cd apps/frontend-angular && npm test --watch=false`. |
| Frontend build | Build Angular `/certificados/` | Ejecutar: `cd apps/frontend-angular && npm run build`. |
| Smoke/manual | Angular→PHP con token ficticio | Registrar `scripts/m3-06-smoke.sh` y bloqueo local; no usar datos reales. |

No se ejecuta deploy, cPanel, staging ni lectura de material privado.

## Migración / rollout

No requiere migración. Rollout documental dentro del ciclo SDD; cierre posterior con `sdd-archive`.

## Preguntas abiertas

Ninguna bloqueante.
