# Marcos — prompts SDD por ciclos, Git y deploy cPanel

Guía operativa para que Marcos trabaje en ciclos chicos. Ejecutar un ciclo por vez y cerrar siempre con `sdd-archive`.

## Rol

- Backend PHP 8.4.21.
- MariaDB 10.6.27.
- Integración frontend/backend.
- Deploy en cPanel bajo `/certificados/`.
- Seguridad, arquitectura y documentación.

## Reglas generales

- No trabajar directo sobre `main` salvo decisión explícita.
- OpenCode no debe commitear, pushear, mergear ni rebasear automáticamente.
- No subir dumps SQL, zips, logs, credenciales ni material de `material_privado_no_versionar/`.
- No imprimir credenciales reales ni copiar contenido de dumps.
- Antes de commit, revisar `git status --ignored --short`.

## Comandos base

```bash
git checkout main
git pull origin main
git checkout -b <rama-del-ciclo>
```

Al cerrar:

```bash
git status --ignored --short
git add <archivos-seguros>
git commit -m "<mensaje-sugerido>"
git push -u origin <rama-del-ciclo>
gh pr create --base main --head <rama-del-ciclo> --title "<titulo>" --body "<descripcion>"
```

## Semana 1 — seguridad, auditoría y modelo

### Ciclo M1-01 — limpieza final del repo

Objetivo: validar `.gitignore`, eliminar temporales aplicados y dejar documentación raíz lista.

Lectura: `AGENTS.md`, `README.md`, `GUIA.md`, `.gitignore`, `docs/00-indice-general.md`, `docs/07-sdd-archive-y-mantenimiento-documentacion.md`.

Resultado: repo navegable, sin material sensible listo para commit, prompts por rol vigentes.

### Ciclo M1-02 — auditoría servidor y bases

Objetivo: documentar estructura del material descargado sin exponer secretos.

Lectura segura: índice, docs de auditoría, `material_privado_no_versionar/` solo por nombres/riesgos generales.

Resultado: inventario seguro, riesgos y decisiones para reutilizar o aislar material.

### Ciclo M1-03 — modelo MariaDB de certificados

Objetivo: diseñar tablas `cert_` y reglas de persistencia sin tocar dumps reales.

Resultado: docs de modelo, migración solo si el diseño está aprobado y sin datos reales.

## Semana 2 — API PHP e integración

### Ciclo M2-01 — contrato API

Objetivo: definir endpoints, DTOs, errores y fixtures antes de implementar.

Resultado: spec y documentación backend actualizadas.

### Ciclo M2-02 — base PHP segura

Objetivo: crear estructura mínima con PDO, configuración externa y manejo de errores.

Resultado: backend inicial verificable, sin credenciales en Git.

### Ciclo M2-03 — validación pública

Objetivo: endpoint de consulta por token con reglas de privacidad.

Resultado: contrato probado con fixtures ficticios.

## Semana 3 — deploy y cierre operativo

### Ciclo M3-01 — integración con Angular

Objetivo: coordinar contrato PHP/Angular sin acoplar implementaciones.

Resultado: documentación de integración y pruebas de contrato.

### Ciclo M3-02 — deploy cPanel

Objetivo: documentar build, subida a `/certificados/`, `.htaccess` y rollback.

Resultado: guía de deploy y validación manual.

### Ciclo M3-03 — hardening final

Objetivo: revisar seguridad, logs, backups, documentación y QA.

Resultado: checklist final y PR listo para revisión.
