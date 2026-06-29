# IFTS14 — Certificaciones QR

Repositorio privado para estudiar el sitio actual del IFTS N.° 14 y desarrollar el módulo de certificaciones QR dentro de:

```txt
/certificados/
```

## Stack confirmado

```txt
Frontend: Angular 20
Backend: PHP 8.4.21
Base de datos: MariaDB 10.6.27
Hosting: cPanel
Gestión DB: phpMyAdmin / herramientas MySQL de cPanel
Ruta objetivo: /certificados/
```

## Objetivo inicial

Ordenar el material descargado del servidor, proteger datos sensibles, documentar la arquitectura actual y preparar el trabajo con OpenCode/Gentle-AI usando Spec-Driven Development y TDD.

El desarrollo del producto comienza después de que el repositorio quede seguro, documentado y con estructura mínima.

## Responsables

### Marcos

- Backend PHP.
- Base de datos MariaDB.
- Integración backend/frontend.
- Desbloqueos frontend técnicos cuando haga falta: base Angular, validación pública, mocks/contratos y build `/certificados/`.
- Deploy en cPanel.
- Arquitectura, seguridad y documentación.

### Matías

- Liderazgo UI/UX del frontend Angular 20.
- Adaptación del diseño generado en v0.
- Uso de `muestra_pagina/` como referencia visual.
- Admin, sistema visual, responsive, accesibilidad, QA y handoff visual.

## Carpetas principales

| Carpeta | Uso |
|---|---|
| `docs/` | Documentación del proyecto. |
| `openspec/` | Specs SDD por módulo. |
| `apps/frontend-angular/` | Aplicación Angular 20. |
| `apps/backend-php/` | API PHP 8.4.21. |
| `database/` | Migraciones, seeds ficticios y documentación de MariaDB. |
| `deploy/` | Documentación y archivos de deploy cPanel. |
| `muestra_pagina/` | Referencia visual exportada/generada desde v0. Puede estar vacía al inicio. |
| `scripts/` | Scripts auxiliares seguros. |
| `material_privado_no_versionar/` | Material descargado del servidor. No se versiona. |

## Regla de seguridad

No subir al repositorio:

- dumps SQL reales;
- backups;
- ZIPs descargados del servidor;
- logs;
- credenciales;
- archivos `.env`;
- configuraciones reales de conexión;
- carpetas `.git` internas descargadas desde cPanel.

## Cómo empezar

1. Leer `GUIA.md`.
2. Leer `AGENTS.md`.
3. Leer `docs/00-indice-general.md`.
4. Ejecutar un ciclo chico desde el prompt raíz correspondiente: `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` o `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`.
5. No implementar Angular/PHP hasta cerrar la etapa de ordenamiento seguro.
6. Cerrar cada ciclo con `sdd-archive` antes de proponer commit.
