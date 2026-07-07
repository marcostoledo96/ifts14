# Propuesta: M3-06 final — smoke Angular/API

## Intención

Cerrar el checkpoint final post-merge de integración Angular → API PHP, confirmando contrato público D0 con datos ficticios, sin deploy ni cambios de producto salvo brechas concretas.

## Alcance

### Incluido
- Documentar checklist compartido Angular/API: DTOs, errores, estados no verificables, privacidad y D0.
- Registrar evidencia reproducible: CI backend Docker/MariaDB, `npm test`, `npm run build` y smoke/manual con token ficticio.
- Corregir sólo brechas mínimas de contrato si aparecen durante specs/tasks; la exploración no detectó brecha de producto.

### Fuera de alcance
- Deploy, cPanel, staging y M4-07.
- Integración Angular admin F4-F6.
- Rotación de token/QR, email, SMTP/PHPMailer o lectura de datos reales.

## Capacidades

### Nuevas capacidades
- Ninguna.

### Capacidades modificadas
- `frontend-api-readiness`: cerrar smoke/checklist de consumo real local con API PHP usando datos ficticios.
- `frontend-public-validation`: confirmar DTO D0 público y mapeo 404/no verificable sin cambiar UI.
- `backend-contrato-api-certificados`: registrar checklist D0, privacidad, errores y evidencia CI post-merge.

## Enfoque

Ciclo verify-only/documental. Usar la exploración como fuente: PR #30 y #31 ya alinearon contrato y CI. La implementación sólo se habilita si specs/tasks encuentran una contradicción concreta.

## Áreas afectadas

| Área | Impacto | Descripción |
|------|---------|-------------|
| `docs/frontend/00-angular20-port-v0.md` | Modificado | Anexo checkpoint M3-06 final. |
| `docs/backend/01-contrato-api-certificados.md` | Modificado | Checklist Angular/API y D0. |
| `openspec/changes/m3-06-final-angular-api-smoke/` | Nuevo | Propuesta, specs, diseño, tareas y evidencia. |
| `.github/workflows/backend-tests.yml` | Referencia | Evidencia backend reproducible; sin modificar salvo brecha. |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|--------|--------------|------------|
| Smoke local bloqueado por PHP CLI/sudo Docker | Media | Usar CI Docker/MariaDB y documentar bloqueo local. |
| `useRealApi` no corrido contra PHP local | Baja | Evidencia con HttpTestingController, CI backend y checklist manual. |

## Plan de reversión

Revertir sólo cambios documentales/spec del change. No hay migraciones, deploy ni cambios de runtime previstos.

## Dependencias

- PR #30 y #31 mergeados en `main`.
- Workflow backend con MariaDB 10.6.
- Token ficticio/demo; no usar datos reales.

## Criterios de éxito

- [ ] Checklist D0 documentado en frontend y backend.
- [ ] Specs mínimas del checkpoint creadas o justificadas como sin cambio funcional.
- [ ] Evidencia de backend CI, Angular test/build y smoke/manual registrada.
- [ ] D0 preservado: DNI completo sólo en UI pública; admin usa `documentMasked`; token/QR permanente.
