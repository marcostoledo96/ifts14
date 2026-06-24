# Design: Contrato de API para certificados QR

## Technical Approach

El cambio es exclusivamente documental. El contrato se define en `docs/backend/01-contrato-api-certificados.md`, se referencia desde docs existentes y se promueve como capability OpenSpec nueva.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Contrato antes que código | Documentar endpoints y DTOs sin crear runtime. | Crear stubs PHP o Angular. | Respeta la regla de no implementar producto. |
| Verificación pública mínima | `GET /certificados/{token}/verificacion` y `POST /certificados/consulta`. | Endpoints administrativos completos. | Evita sobrediseño y datos sensibles. |
| Token seguro | Validar formato y planear persistencia por hash. | Guardar token plano. | Reduce impacto ante filtraciones futuras. |
| Datos futuros a alto nivel | Nombrar conceptos `cert_` sin DDL. | Crear migraciones. | Mantiene el ciclo libre de esquema real. |

## Data Flow

```txt
QR/link público
  → Angular futuro /certificados/validar/{token}
  → PHP futuro /certificados/api/certificados/{token}/verificacion
  → MariaDB futura con prepared statements
  → DTO público mínimo
```

## File Changes

| File | Action | Description |
|---|---|---|
| `docs/backend/01-contrato-api-certificados.md` | Create | Contrato API completo. |
| `docs/backend/00-php84-api.md` | Modify | Referencia al contrato. |
| `docs/database/00-mariadb.md` | Modify | Conceptos futuros sin migración. |
| `docs/frontend/00-angular20-port-v0.md` | Modify | Expectativas de consumo API. |
| `docs/00-indice-general.md` | Modify | Índice actualizado. |
| `openspec/specs/backend-contrato-api-certificados/spec.md` | Create | Spec promovida. |

## Interfaces / Contracts

Contrato principal:

- `GET /certificados/api/health`
- `GET /certificados/api/certificados/{token}/verificacion`
- `POST /certificados/api/certificados/consulta`
- Sobre de error `{ error: { code, message, details }, meta: { requestId } }`

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Docs | Rutas y contrato presentes | Inspección de archivos Markdown. |
| Seguridad | Sin producto ni secretos | Buscar manifiestos/código/migraciones y patrones sensibles obvios en docs creados. |
| OpenSpec | Spec promovida y archivo histórico | Verificar rutas finales. |

## Migration / Rollout

No migration required. El ciclo no toca base ni runtime.

## Open Questions

- [ ] Definir en ciclo futuro endpoints administrativos y reglas de emisión/revocación.
- [ ] Confirmar mecanismo real de PDF/QR y correo en cPanel.
