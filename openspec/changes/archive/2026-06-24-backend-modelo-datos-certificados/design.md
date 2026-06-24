# Diseño: modelo de datos para certificados QR

## Enfoque técnico

El cambio agrega una base mínima para validar certificados por QR sin implementar backend. El esquema se limita a tres tablas `cert_`, migración controlada, seed ficticio y documentación enlazada al contrato de API.

## Decisiones de arquitectura

| Decisión | Elección | Alternativas | Motivo |
|---|---|---|---|
| Tablas | `cert_certificados`, `cert_tokens_verificacion`, `cert_eventos_auditoria` | Normalizar alumnos/cursos ahora | Menor superficie; evita depender de dumps reales. |
| Token | `BINARY(32)` con SHA-256 + pepper externo | Token plano o hash sin pepper | Reduce impacto ante lectura de DB. |
| Auditoría | Eventos mínimos con huellas truncadas | Guardar payloads completos | Cumple no exponer DNI/token. |
| Seed | Demo ficticio explícito | Sin seed | Permite revisar estructura sin datos reales. |

## Flujo de datos futuro

```txt
QR token público
  -> backend futuro valida formato
  -> calcula hash con pepper externo
  -> cert_tokens_verificacion.token_hash
  -> cert_certificados vigente
  -> DTO público mínimo
  -> cert_eventos_auditoria sin valores sensibles
```

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `database/migrations/001_certificados_qr.sql` | Crear | Tablas, claves, índices y rollback comentado. |
| `database/seeds/001_certificados_qr_demo.sql` | Crear | Fixture ficticio seguro. |
| `docs/database/01-modelo-datos-certificados.md` | Crear | Contrato de datos y lookup público. |
| `docs/database/00-mariadb.md` | Modificar | Enlace al modelo real. |
| `docs/backend/01-contrato-api-certificados.md` | Modificar | Cross-link al modelo y hash strategy. |
| `docs/00-indice-general.md` | Modificar | Rutas nuevas. |
| `openspec/specs/backend-modelo-datos-certificados/spec.md` | Crear | Spec promovida. |

## Contratos

- `codigo_certificado` es visible públicamente y único.
- `token_hash` es único y no reversible.
- `documento_enmascarado` sostiene el DTO público; `documento_hash` queda para control interno futuro.
- La API futura debe tratar inexistente, revocado o vencido como `404 CERTIFICATE_NOT_FOUND`.

## Verificación

| Capa | Qué verificar | Método |
|---|---|---|
| SQL | Rutas permitidas, tablas `cert_`, sin tokens/DNI reales | inspección y `git check-ignore` |
| Docs | Links y coherencia con contrato API | inspección |
| Producto | Sin PHP/Angular/dependencias | búsqueda por rutas/manifiestos |

## Migración / rollout

Aplicar manualmente solo en entorno controlado. Configurar pepper fuera de Git antes de implementar backend real.

## Preguntas abiertas

- [ ] Definir fuente administrativa real de alumno/curso en un ciclo posterior.
