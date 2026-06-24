# Propuesta: modelo de datos para certificados QR

## Intención

Definir el esquema MariaDB seguro para la verificación pública de certificados QR, alineado al contrato de API ya documentado.

## Alcance

### Incluido
- Modelo `cert_` para certificados, tokens y auditoría.
- Migración SQL controlada y seed demo ficticio.
- Documentación de base, backend e índice.
- Spec OpenSpec archivada y promovida.

### Fuera de alcance
- Código PHP o Angular.
- Datos reales, dumps, credenciales o material privado.
- Endpoints administrativos, PDF, QR real, mails o dependencias.

## Capacidades

### Nuevas capacidades
- `backend-modelo-datos-certificados`: esquema MariaDB y contrato de persistencia para certificados QR.

### Capacidades modificadas
- `backend-contrato-api-certificados`: se agrega enlace al modelo de datos que sostiene el DTO público.

## Enfoque

Usar tres tablas mínimas: `cert_certificados`, `cert_tokens_verificacion` y `cert_eventos_auditoria`. El token público se guarda como hash con pepper externo a Git; los eventos registran solo huellas truncadas y metadatos seguros.

## Áreas afectadas

| Área | Impacto | Descripción |
|---|---|---|
| `database/migrations/` | Nuevo | Migración versionable. |
| `database/seeds/` | Nuevo | Seed ficticio. |
| `docs/database/` | Nuevo/Modificado | Modelo y resumen MariaDB. |
| `docs/backend/` | Modificado | Cross-link al modelo. |
| `openspec/specs/` | Nuevo | Spec promovida. |

## Riesgos

| Riesgo | Prob. | Mitigación |
|---|---|---|
| Filtrar tokens/DNI | Baja | Hash, enmascarado y seed ficticio. |
| Acoplarse a dumps reales | Baja | No leer ni copiar filas reales. |

## Rollback

Revertir archivos creados/modificados y ejecutar `DROP TABLE` en orden inverso si la migración fue aplicada en entorno local.

## Criterios de éxito

- [x] SQL controlado bajo rutas permitidas.
- [x] Docs enlazan API y modelo.
- [x] No hay PHP, Angular ni dependencias nuevas.
