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
Staging: /certificados_staging/
```

## Estado actual y decisiones vigentes (D0)

Decisiones confirmadas por Marcos, fuente de verdad del proyecto hasta nueva orden:

| Tema | Decisión |
|---|---|
| QR / token | Permanente. El reenvío normal NO rota token/QR. Solo revocación explícita o regeneración excepcional auditada invalidan el token. |
| DNI en validación pública | DNI completo visible públicamente por decisión institucional. Logs, auditoría y errores no exponen DNI completo. |
| Tipo de documento | Certificado de curso. Debajo muestra las fechas del curso a las que asistió el alumno. |
| Auth admin | Auth simple protegida con `X-Admin-Key` temporal. Login real queda para fase posterior. |
| Email | Cuenta de prueba / `stub`. Producción queda gated hasta aprobación. |
| Composer en cPanel | Gate: si no está disponible, `vendor/` se genera localmente y se sube como artefacto operativo, nunca versionado. |
| Firmantes PDF | Rector/a y Asesor/a Pedagógica vía configuración institucional. |
| Staging | `/certificados_staging/` separado de producción `/certificados/`. |

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
- Estructura funcional y contratos API.

### Matías

- Liderazgo UI/UX del frontend Angular 20.
- Adaptación del diseño generado en v0 desde `muestra_pagina/`.
- Port visual a Angular (sin copiar React/Next literalmente).
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
| `muestra_pagina/` | Referencia visual exportada desde v0. No es código de producto; no se compila ni porta literalmente. |
| `scripts/` | Scripts auxiliares seguros. |
| `material_privado_no_versionar/` | Material descargado del servidor. No se versiona. |
| `docs/auditoria/` | Auditorías e insumos de ajuste documental. |

## Regla de seguridad

No subir al repositorio:

- dumps SQL reales;
- backups;
- ZIPs descargados del servidor;
- logs;
- credenciales;
- archivos `.env`;
- configuraciones reales de conexión;
- carpetas `.git` internas descargadas desde cPanel;
- `.codegraph/` (metadata local de indexado, no se versiona).

## Cómo empezar

1. Leer `GUIA.md`.
2. Leer `AGENTS.md`.
3. Leer `docs/00-indice-general.md`.
4. Ejecutar un ciclo chico desde el prompt raíz correspondiente: `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` o `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`.
5. No implementar Angular/PHP hasta cerrar la etapa de ordenamiento seguro.
6. Cerrar cada ciclo con `sdd-archive` antes de proponer commit.
