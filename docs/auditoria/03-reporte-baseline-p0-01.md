# Reporte Baseline P0-01

**Commit:** 9bc0dbd (Merge pull request #57)
**Rama actual:** audit/preproduction-baseline

## Migraciones
- `001_certificados_qr.sql`
- `002_token_cifrado_entrega_manual.sql`
- `003_cursos_alumnos_asistencias.sql`
- `004_certificados_alumno_curso.sql`
- `005_prevenir_certificados_duplicados.sql`

**Estado Migración 003:**
003 aplicada en DB persistente: NO

## Tests Frontend
Ejecución de `npm ci`, `npm run test:ci`, `npm run build -- --configuration production`, `npm run build -- --configuration production-staging`
- Resultados: 543 SUCCESS.
- Builds: OK (Production and Staging).

## Tests Backend
- Comandos ejecutados: variante Docker directa sin `sudo`.
- Resultado: Fallo `unexpected EOF` al enviar contexto a Docker daemon (341MB).
- Documentación de sustitución: Se intentó comando directo sin `sudo` debido a error de permisos (`sudo: A terminal is required to authenticate`), pero el build falló por tamaño de contexto / EOF. No hay PHP instalado localmente, por lo que no se pudieron correr scripts de módulo y lint.
