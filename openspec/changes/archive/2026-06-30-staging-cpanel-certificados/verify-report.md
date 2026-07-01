# Verify Report: staging-cpanel-certificados

## Resultado

| Campo | Valor |
|---|---|
| Cambio | `staging-cpanel-certificados` |
| Modo | Standard verify, docs-only |
| Fecha | 2026-06-30 |
| Veredicto final | **PASS WITH WARNINGS** |

El cambio satisface el delta spec y las tareas documentales principales. No se detectaron cambios en rutas restringidas, material privado, `public_html`, `vendor/`, secretos ni artefactos ejecutables. La única advertencia bloquea el cierre total del ciclo hasta ejecutar `sdd-archive`, que está pendiente por diseño después de esta verificación.

## Artefactos leídos

| Artefacto | Estado |
|---|---|
| `openspec/changes/staging-cpanel-certificados/proposal.md` | Leído |
| `openspec/changes/staging-cpanel-certificados/design.md` | Leído |
| `openspec/changes/staging-cpanel-certificados/tasks.md` | Leído |
| `openspec/changes/staging-cpanel-certificados/apply-progress.md` | Leído |
| `openspec/changes/staging-cpanel-certificados/specs/deploy-cpanel-certificados/spec.md` | Leído |
| `docs/deploy/01-staging-cpanel-certificados.md` | Leído |
| `deploy/README.md` | Leído |
| `openspec/config.yaml` | Leído para confirmar `strict_tdd: false` |

## Completeness

| Dimensión | Resultado | Evidencia |
|---|---|---|
| Proposal | PASS | Alcance documental: guía staging + enlace, sin deploy real. |
| Spec | PASS | Los 4 requisitos ADDED tienen secciones verificables en la guía. |
| Design | PASS | Se implementó guía separada y no se creó `deploy/staging/`. |
| Tasks core | PASS | Tareas 1.1 a 5.2 marcadas como completas y verificadas. |
| Cleanup / archive | WARNING | Tarea 5.3 sigue pendiente: cerrar con `sdd-archive` después de verify. |
| Runtime evidence docs-only | PASS | Scans Python, path checks, link checks y route separation ejecutados localmente. |

## Build, tests y scans ejecutados

| Comando / verificación | Resultado |
|---|---|
| `git rev-parse --show-toplevel && git branch --show-current && git status --short --untracked-files=all && git diff --name-only && git diff --cached --name-only` | PASS. Repo correcto, branch `deploy/staging-cpanel-certificados`; cambios/untracked limitados a `deploy/README.md`, `docs/deploy/01-staging-cpanel-certificados.md` y artefactos OpenSpec del cambio. Sin staged files. |
| Path check Python | PASS. Existen guía staging, `deploy/README.md`, guía productiva, config example y delta spec; `deploy/staging` no existe. |
| Restricted scan exacto Python sobre `docs/deploy/01-staging-cpanel-certificados.md` y `deploy/README.md` para `public_html`, `vendor/`, `.env`, `material_privado`, `/home/`, `secrets`, `backup`, `.zip` | PASS. 0 hits. |
| Allowed-path scan Python sobre `git status --porcelain` | PASS. No hay rutas fuera del change set ni rutas restringidas (`public_html/`, `material_privado_no_versionar/`, `vendor/`, `secrets/`, `storage/`, `uploads/`, `.env`, `credentials.json`). |
| Credential / real-host scan Python | PASS. Sin IPs, rutas privadas reales, dominio real, ni asignaciones sospechosas; la URL de ejemplo usa `example.edu.ar/certificados_staging`. |
| Route separation count Python | PASS. `docs/deploy/01-staging-cpanel-certificados.md` contiene 14 menciones a `/certificados_staging/` y 7 a `/certificados/`; las menciones productivas son explícitamente de no modificación. `deploy/README.md` separa ambas rutas. |
| Markdown link validity Python | PASS. Todos los enlaces relativos versionados resuelven a archivos existentes. |
| `tasks.md` word count y unchecked tasks Python | PASS/WARNING. 468 palabras; solo queda sin marcar `5.3 sdd-archive`. |
| `openspec validate staging-cpanel-certificados --strict` | SKIPPED. `openspec` CLI no está instalado en este entorno. |

No se ejecutó build de Angular/PHP porque el cambio es exclusivamente documental y `openspec/config.yaml` no define `test_command`; `strict_tdd` está en `false`. La evidencia relevante para este cambio son los scans reproducibles, checks de rutas y validación documental contra spec.

## Matriz de cumplimiento del spec

| Requirement / Scenario | Estado | Evidencia |
|---|---|---|
| Guía documental de staging separada | PASS | `docs/deploy/01-staging-cpanel-certificados.md` existe y abre con `/certificados_staging/`; `deploy/README.md` la enlaza como staging documental. |
| Preparación documental de staging | PASS | La guía apunta a `/certificados_staging/` y distingue la guía productiva `00-cpanel-certificados.md`. |
| Staging no ejecutable en este ciclo | PASS | Alcance declara sin deploy real, uploads ni cambios en cPanel; scan de rutas restringidas OK. |
| Checklist seguro de paquete de staging | PASS | Sección `Checklist seguro de paquete` exige excluir credenciales, tokens, configuraciones reales, volcados, bitácoras, paquetes comprimidos, dependencias instaladas y material privado. |
| Paquete revisado sin material prohibido | PASS | Checklist cubre artefactos versionables/ficticios y rechazo de material sensible; restricted scan OK. |
| Duda sobre un artefacto | PASS | La guía indica excluir archivos de origen o sensibilidad dudosa y consultar antes de continuar. |
| Configuración de staging con placeholders | PASS | La sección de configuración usa placeholders ficticios (`HOST_STAGING_FICTICIO`, `CLAVE_STAGING_FICTICIA`, `PEPPER_STAGING_FICTICIO`) y referencia el `.example`. |
| Plantilla de configuración ficticia | PASS | Credential scan no detectó hosts reales, IPs, rutas privadas ni secretos reales. |
| Base pública de staging | PASS | `public_base_url` usa `https://example.edu.ar/certificados_staging` y la guía advierte no reutilizar `/certificados/`. |
| Smoke y rollback de staging | PASS | Smoke checks usan `TOKEN_FICTICIO`; rollback restaura solo `/certificados_staging/` y confirma no modificar `/certificados/`. |
| Smoke seguro de staging | PASS | Checks cubren health, ruta pública, token inexistente e internos API con datos ficticios, sin DNI, logs ni base real. |
| Rollback limitado a staging | PASS | Pasos limitados a copia de resguardo de `/certificados_staging/`; producción queda explícitamente fuera. |

## Correctness documental

| Check | Estado | Nota |
|---|---|---|
| Separación `/certificados_staging/` vs `/certificados/` | PASS | La ruta staging domina la guía; producción se menciona solo como referencia que no se toca. |
| Placeholder config segura | PASS | No incluye valores reales ni rutas privadas; usa placeholders y dominio reservado `example.edu.ar`. |
| Smoke staging-only | PASS | Todos los ejemplos usan `/certificados_staging/` y datos ficticios. |
| Rollback staging-only | PASS | El rollback no toca `/certificados/` ni indica acciones productivas. |
| No deploy real | PASS | No hay scripts, paquetes, uploads ni carpeta `deploy/staging/`. |
| No material privado o secreto | PASS | Scans de rutas, patrones restringidos y credenciales pasaron. |

## Coherencia con diseño

| Decisión de diseño | Estado | Evidencia |
|---|---|---|
| Crear guía separada `docs/deploy/01-staging-cpanel-certificados.md` | PASS | Archivo presente y enlazado. |
| Actualizar `deploy/README.md` con separación staging/producción | PASS | README contiene enlace staging y advertencia explícita de no mezclar rutas. |
| No crear `deploy/staging/` ni artefactos ejecutables | PASS | Path check confirma ausencia de `deploy/staging/`; cambios son documentales/OpenSpec. |
| Configuración real fuera de Git | PASS | La guía usa placeholders y remite a configuración externa. |

## Issues

### CRITICAL

- Ninguno.

### WARNING

- `tasks.md` mantiene pendiente `5.3 Cerrar ciclo con sdd-archive una vez completada la verificación`. Es cleanup esperado posterior a este verify, pero impide declarar el ciclo archivado.

### SUGGESTION

- Registrar en `sdd-archive` que `openspec validate` no pudo ejecutarse porque el CLI no está instalado en este entorno.

## Riesgos abiertos

- El staging real todavía no fue ejecutado; requiere ciclo operativo separado antes de tocar cPanel.
- Sigue abierta la decisión futura entre dominio principal con `/certificados_staging/` y subdominio.
- La guía asume que el operador completará la configuración real fuera de Git y fuera de la carpeta pública.

## Result Contract

| Campo | Resultado |
|---|---|
| Verdict | **PASS WITH WARNINGS** |
| Commands/results | Git status, path checks, restricted scans, credential scan, route separation, link validity y task check ejecutados; todos PASS salvo `openspec validate` SKIPPED por CLI ausente. |
| Restricted material | PASS: no se detectaron cambios en `public_html`, `vendor/`, secretos, material privado, dumps, logs, zips ni rutas privadas. |
| Main risk | `sdd-archive` pendiente y futura ejecución real de staging fuera de este ciclo. |
