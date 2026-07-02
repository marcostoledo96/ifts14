# Propuesta: modelo de cursos, alumnos y asistencias

## Intento

Crear la base MariaDB real para certificados de curso con fechas asistidas. Hoy la emisión usa texto libre en `cert_certificados`; M4-02 estabiliza el modelo de datos antes de API admin, emisión desde asistencias, validación pública y PDF.

## Alcance

### Incluido
- Migración `003_cursos_alumnos_asistencias.sql` con tablas `cert_` para alumnos, cursos, fechas, asistencias, snapshot y configuración institucional.
- Spec OpenSpec y documentación de base de datos actualizadas.
- Seed ficticio opcional para verificar relaciones sin datos reales.

### Fuera de alcance
- Cambios PHP, Angular, API, DTO público, auth, PDF o deploy.
- Vincular `cert_certificados` con `cert_alumnos`/`cert_cursos`; queda para M4-04.
- Login admin real, email o tablas de entrega futuras.

## Capacidades

### Nuevas capacidades
- `database-cursos-alumnos-asistencias`: modelo MariaDB de cursos, alumnos, fechas, asistencias por presencia y snapshot de fechas certificadas.

### Capacidades modificadas
- `backend-modelo-datos-certificados`: las tablas planificadas para cursos/asistencias pasan a contrato migrable, manteniendo D0 y sin cambiar comportamiento PHP.

## Enfoque

Implementar solo capa de datos/documentación. `cert_alumnos` usará `dni_hash`, `dni_cifrado` y `dni_mostrar` controlado. `cert_asistencias` representa presencia por existencia de fila, con `eliminado_en` nullable para correcciones. `cert_certificado_fechas` conservará FK a `cert_curso_fechas` y campos materializados de fecha, descripción y orden para estabilidad histórica.

## Áreas afectadas

| Área | Impacto | Descripción |
|------|---------|-------------|
| `database/migrations/003_cursos_alumnos_asistencias.sql` | Nuevo | Tablas, FKs, índices y rollback manual. |
| `database/seeds/001_certificados_qr_demo.sql` | Modificado | Datos ficticios si se amplía el demo. |
| `docs/database/00-mariadb.md` | Modificado | Tablas dejan de ser solo futuras. |
| `docs/database/01-modelo-datos-certificados.md` | Modificado | Modelo migrado M4-02 y reglas de DNI/asistencias/snapshot. |
| `openspec/specs/` | Nuevo/Modificado | Nueva spec y delta del modelo existente. |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|--------|--------------|------------|
| `003` aplicada sin `001`/`002` | Media | Documentar prerequisitos y verificación SQL. |
| Clave de cifrado de DNI no configurada | Media | Usar placeholders ficticios y gate operativo externo a Git. |
| Confundir snapshot con fechas vivas | Media | Nombrar campos materializados y escenarios explícitos. |

## Plan de reversión

Revertir archivos de documentación/spec y, si la migración fue aplicada en un entorno aprobado, ejecutar rollback manual con backup previo: dropear tablas nuevas en orden inverso de FK. No tocar tablas existentes.

## Dependencias

- Migraciones `001` y `002` aplicadas o verificadas antes de `003`.
- Clave real de cifrado de DNI fuera de Git para uso operativo posterior.

## Criterios de éxito

- [ ] La propuesta/spec define el modelo sin PHP, Angular, API ni PDF.
- [ ] `003` cubre tablas `cert_`, FKs, índices, DNI seguro, asistencias por fila y snapshot estable.
- [ ] Docs distinguen modelo migrado, D0 público y trabajo futuro.
