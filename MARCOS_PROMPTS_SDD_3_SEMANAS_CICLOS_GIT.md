# Marcos — guía operativa SDD para backend, datos y deploy

Esta guía es el punto de entrada para que Marcos trabaje ciclos chicos del módulo `/certificados/` con Spec-Driven Development. Marcos ya conoce el proyecto: este documento prioriza ruta rápida, puntos de parada para QA manual y handoff revisable.

> Regla base: un ciclo por vez. Cerrar siempre con `sdd-archive` antes de proponer commit.

## Ruta rápida

1. Leer `README.md`, `GUIA.md`, `AGENTS.md` y `docs/00-indice-general.md`.
2. Elegir un ciclo M1-01..M3-03 y abrir sus archivos mínimos.
3. Pedir a OpenCode el ciclo SDD completo: explore → propose → spec → design → tasks → apply → verify → archive.
4. Frenar en cada checkpoint de QA manual y guardar evidencia breve del resultado.
5. Entregar handoff final con archivos, validaciones, bloqueos, riesgos y comandos Git solo propuestos.

## Rol y límites

| Tema | Regla |
|---|---|
| Rol | Backend PHP 8.4.21, MariaDB 10.6.27, integración front/back, deploy cPanel, arquitectura, seguridad y documentación. |
| Ruta pública | `/certificados/`. |
| Frontend | No tocar Angular salvo coordinación explícita con el ciclo frontend. |
| Material privado | No modificar ni copiar contenido de `material_privado_no_versionar/`; solo nombres y riesgos generales cuando el ciclo lo autorice. |
| Datos sensibles | No imprimir credenciales, dumps, logs, DNI completo ni tokens completos. |
| Git | OpenCode puede proponer comandos; commit, push, merge y rebase son manuales de Marcos. |

## Cuándo detenerse para QA manual

Usar esta tabla como semáforo. Si falla un checkpoint, no seguir: registrar salida, causa probable y próxima acción.

| Hito | Comando o revisión | Esperado | Si falla |
|---|---|---|---|
| Antes de tocar archivos | `git status --ignored --short` | Estado conocido; sin material sensible listo para stage. | Frenar y separar cambios ajenos o privados. |
| PHP creado/modificado | `php -l <archivo.php>` | `No syntax errors detected`. | Corregir sintaxis antes de avanzar. |
| Dependencias PHP del entorno | `php -m` | Ver `pdo_mysql`, `openssl`, `mbstring` cuando apliquen. | Documentar bloqueo de entorno; no instalar sin decisión. |
| Esquema MariaDB | `mysqldump --no-data <db_fixture>` | Solo estructura ficticia, sin datos reales. | No versionar salida; ajustar migración/fixture. |
| API pública | `curl -i http://localhost/certificados/api/.../TOKEN_FICTICIO` | Respuesta documentada, sin datos sensibles. | Revisar contrato, logs y errores. |
| Deploy cPanel | Revisar `.htaccess`, base href `/certificados/` y rollback | Rutas resuelven dentro de `/certificados/`. | No subir; documentar corrección necesaria. |
| Antes de commit manual | `git status --ignored --short` | Solo archivos seguros y esperados. | Quitar privados, dumps, logs o cambios de otro ciclo. |

## Flujo OpenCode/Gentle-AI

```txt
explore → propose → spec → design → tasks → apply → verify → archive → handoff final
```

Reglas:

- No saltar de idea a código sin spec, diseño y tasks.
- Si hay implementación y existe runner, aplicar TDD; si no hay runner, dejar QA manual verificable.
- No declarar terminado un ciclo solo porque compila o porque el documento existe.
- `sdd-archive` sincroniza la documentación que cambió durante el ciclo.

### Prompt base para iniciar un ciclo

```txt
Trabajemos el ciclo <ID> — <nombre> para IFTS14.
Usá SDD completo: explore, propose, spec, design, tasks, apply, verify y archive.
Leé AGENTS.md, README.md, GUIA.md, docs/00-indice-general.md y los docs/specs indicados por el ciclo.
No toques Angular salvo coordinación explícita. No modifiques material_privado_no_versionar/.
No ejecutes commit, push, merge ni rebase; proponé comandos Git al final.
Frená en los checkpoints de QA manual y reportá comando, resultado, bloqueos y riesgos.
```

## Plantilla de ciclo

~~~markdown
### Ciclo <ID> — <nombre>

Objetivo: <resultado observable>.
Rama sugerida: `<prefijo>/<tema>`.
Leer antes: `AGENTS.md`, `README.md`, `GUIA.md`, `docs/00-indice-general.md`, <rutas específicas>.

Pedir a OpenCode:
```txt
<prompt exacto del ciclo>
```

Ejecutar/verificar:
```bash
<comandos disponibles o validación manual>
```

QA manual (checkpoint de parada): <qué validar, con qué comando y qué hacer si falla>.
No hacer: <límites concretos del ciclo>. Commit, push, merge y rebase quedan manuales de Marcos.
Archive: <docs/specs a sincronizar durante sdd-archive>.
Commit sugerido: `<tipo>(<scope>): <resultado>`.
~~~

## Semana 1 — seguridad, auditoría y modelo

### Ciclo M1-01 — limpieza final del repo

Objetivo: dejar el repo navegable, `.gitignore` validado y documentación raíz consistente.
Rama sugerida: `docs/limpieza-final-repo`.
Leer antes: `AGENTS.md`, `README.md`, `GUIA.md`, `.gitignore`, `docs/00-indice-general.md`, `docs/07-sdd-archive-y-mantenimiento-documentacion.md`.

Pedir a OpenCode:
```txt
Trabajemos M1-01 — limpieza final del repo. Es documentación/orden seguro.
Validá el estado del repo, .gitignore y documentación raíz sin leer material privado.
No borres archivos, no stages, no commits, no push. Proponé cambios y comandos al final.
```

Ejecutar/verificar:
```bash
git status --ignored --short
```

QA manual (checkpoint de parada): antes de cualquier cambio, confirmar que no hay dumps, zips, logs, `.env` ni material privado listos para commit.
No hacer: no limpiar a ciegas, no tocar `material_privado_no_versionar/`. Commit, push, merge y rebase quedan manuales de Marcos.
Archive: `docs/00-indice-general.md`, `docs/07-sdd-archive-y-mantenimiento-documentacion.md` si cambia el flujo.
Commit sugerido: `docs(repo): ordenar cierre seguro inicial`.

### Ciclo M1-02 — auditoría servidor y bases

Objetivo: documentar estructura y riesgos del material descargado sin exponer secretos.
Rama sugerida: `docs/auditoria-material-servidor`.
Leer antes: `AGENTS.md`, `GUIA.md`, `docs/auditoria/00-inventario-material-descargado.md`, `docs/auditoria/01-auditoria-material-original.md`, `docs/auditoria/02-hallazgos-dumps-sql.md`.

Pedir a OpenCode:
```txt
Trabajemos M1-02 — auditoría servidor y bases.
Solo puede listar nombres de archivos y riesgos generales de material_privado_no_versionar/.
No copies dumps, logs, credenciales ni contenido sensible. Cerrá con hallazgos y próximos pasos.
```

Ejecutar/verificar:
```bash
git status --ignored --short
```

QA manual (checkpoint de parada): revisar que el reporte no incluya credenciales, fragmentos de dumps, logs reales, DNI completo ni tokens completos.
No hacer: no versionar material privado, no mover secretos a docs, no abrir contenido sensible salvo auditoría local autorizada. Commit, push, merge y rebase quedan manuales de Marcos.
Archive: `docs/auditoria/`, `docs/00-indice-general.md` si cambia el mapa documental.
Commit sugerido: `docs(auditoria): registrar riesgos del material servidor`.

### Ciclo M1-03 — modelo MariaDB de certificados

Objetivo: diseñar tablas `cert_`, reglas de persistencia y migraciones controladas con datos ficticios.
Rama sugerida: `database/modelo-certificados`.
Leer antes: `database/AGENTS.md`, `docs/database/00-mariadb.md`, `docs/database/01-modelo-datos-certificados.md`, `openspec/specs/backend-modelo-datos-certificados/spec.md`.

Pedir a OpenCode:
```txt
Trabajemos M1-03 — modelo MariaDB de certificados.
Usá MariaDB 10.6.27, prefijo cert_, migraciones controladas y fixtures ficticios.
No uses dumps reales ni datos personales. Frená antes de cualquier cambio destructivo.
```

Ejecutar/verificar:
```bash
mysqldump --no-data <db_fixture> > /tmp/cert_schema_check.sql
```

QA manual (checkpoint de parada): confirmar que la salida contiene solo estructura ficticia y que no se agrega al repo si no corresponde.
No hacer: no tocar bases reales, no versionar dumps, no guardar tokens públicos en texto plano si hay persistencia real. Commit, push, merge y rebase quedan manuales de Marcos.
Archive: `docs/database/`, `database/docs/`, `openspec/specs/backend-modelo-datos-certificados/spec.md`.
Commit sugerido: `docs(database): definir modelo certificados`.

## Semana 2 — API PHP e integración

### Ciclo M2-01 — contrato API

Objetivo: definir endpoints, DTOs, errores y fixtures antes de implementar PHP.
Rama sugerida: `backend/contrato-api-certificados`.
Leer antes: `apps/backend-php/AGENTS.md`, `docs/backend/00-php84-api.md`, `docs/backend/01-contrato-api-certificados.md`, `openspec/specs/backend-contrato-api-certificados/spec.md`.

Pedir a OpenCode:
```txt
Trabajemos M2-01 — contrato API.
Definí contrato HTTP, DTOs, errores y fixtures ficticios antes de código PHP.
No implementes endpoints todavía salvo que el ciclo lo apruebe explícitamente.
```

Ejecutar/verificar:
```bash
git diff -- openspec/specs/backend-contrato-api-certificados/spec.md docs/backend/01-contrato-api-certificados.md
```

QA manual (checkpoint de parada): revisar que request/response, errores y privacidad queden claros para Angular sin exponer DNI ni tokens completos.
No hacer: no inventar comportamiento no especificado, no acoplar a Angular. Commit, push, merge y rebase quedan manuales de Marcos.
Archive: `openspec/specs/backend-contrato-api-certificados/spec.md`, `docs/backend/01-contrato-api-certificados.md`.
Commit sugerido: `docs(api): definir contrato certificados`.

### Ciclo M2-02 — base PHP segura

Objetivo: crear estructura mínima PHP con PDO, configuración externa y manejo de errores seguro.
Rama sugerida: `backend/base-php-certificados`.
Leer antes: `apps/backend-php/AGENTS.md`, `docs/backend/00-php84-api.md`, `docs/backend/01-contrato-api-certificados.md`, `docs/01-contexto-decisiones-stack.md`.

Pedir a OpenCode:
```txt
Trabajemos M2-02 — base PHP segura.
Implementá lo mínimo para PHP 8.4.21 con PDO, prepared statements y configuración fuera de Git.
No agregues dependencias sin aprobación. Validá sintaxis y extensiones PHP.
```

Ejecutar/verificar:
```bash
php -l <archivo.php>
php -m
```

QA manual (checkpoint de parada): cada archivo PHP modificado pasa `php -l`; `php -m` muestra `pdo_mysql`, `openssl` y `mbstring` si el ciclo los requiere.
No hacer: no subir `.env`, no registrar credenciales, no crear abstracciones para futuro sin uso real. Commit, push, merge y rebase quedan manuales de Marcos.
Archive: `docs/backend/00-php84-api.md`, `docs/backend/01-contrato-api-certificados.md`, `docs/02-arquitectura.md` si cambia estructura.
Commit sugerido: `feat(backend): crear base php certificados`.

### Ciclo M2-03 — validación pública

Objetivo: implementar o validar consulta pública por token con reglas de privacidad.
Rama sugerida: `backend/validacion-publica-certificados`.
Leer antes: `apps/backend-php/AGENTS.md`, `docs/backend/01-contrato-api-certificados.md`, `openspec/specs/backend-contrato-api-certificados/spec.md`, `docs/database/01-modelo-datos-certificados.md`.

Pedir a OpenCode:
```txt
Trabajemos M2-03 — validación pública.
Usá token ficticio para pruebas, no muestres DNI completo ni token completo en logs o respuestas.
Validá contrato, errores y privacidad antes de cerrar.
```

Ejecutar/verificar:
```bash
curl -i http://localhost/certificados/api/validar/TOKEN_FICTICIO
php -l <archivo.php>
```

QA manual (checkpoint de parada): la respuesta de `curl` coincide con el contrato y no expone datos sensibles; logs sin DNI/token completo.
No hacer: no probar con datos reales, no loguear secretos, no publicar endpoint sin manejo de errores documentado. Commit, push, merge y rebase quedan manuales de Marcos.
Archive: `docs/backend/01-contrato-api-certificados.md`, `docs/funcionalidades` o equivalente si se documenta capacidad pública.
Commit sugerido: `feat(backend): validar certificados por token`.

## Semana 3 — integración, deploy y cierre

### Ciclo M3-01 — integración con Angular

Objetivo: coordinar contrato PHP/Angular sin acoplar implementaciones ni tocar frontend salvo acuerdo.
Rama sugerida: `docs/integracion-angular-api`.
Leer antes: `docs/backend/01-contrato-api-certificados.md`, `docs/frontend/00-angular20-port-v0.md`, `openspec/specs/backend-contrato-api-certificados/spec.md`, `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` como referencia de handoff.

Pedir a OpenCode:
```txt
Trabajemos M3-01 — integración con Angular.
Revisá contrato, DTOs y errores esperados para que frontend consuma la API.
No modifiques Angular salvo coordinación explícita; dejá checklist de contrato para Matías.
```

Ejecutar/verificar:
```bash
git diff -- docs/backend/01-contrato-api-certificados.md docs/frontend/00-angular20-port-v0.md
```

QA manual (checkpoint de parada): confirmar que DTOs, códigos de error, estados vacío/no encontrado y privacidad están documentados para frontend.
No hacer: no cambiar componentes Angular, no inventar pantallas, no alterar endpoints sin actualizar spec. Commit, push, merge y rebase quedan manuales de Marcos.
Archive: `docs/backend/`, `docs/frontend/`, `openspec/specs/backend-contrato-api-certificados/spec.md` si cambia contrato.
Commit sugerido: `docs(integracion): alinear contrato angular php`.

### Ciclo M3-02 — deploy cPanel

Objetivo: documentar build/subida a `/certificados/`, `.htaccess`, configuración externa y rollback.
Rama sugerida: `deploy/cpanel-certificados`.
Leer antes: `deploy/AGENTS.md`, `deploy/README.md`, `docs/deploy/00-cpanel-certificados.md`, `GUIA.md`.

Pedir a OpenCode:
```txt
Trabajemos M3-02 — deploy cPanel.
Documentá ruta /certificados/, .htaccess, base href, configuración real fuera de Git y rollback.
No toques public_html ni subas archivos; todo deploy real queda manual y con backup.
```

Ejecutar/verificar:
```bash
git status --ignored --short
```

QA manual (checkpoint de parada): antes de subir, revisar `.htaccess`, base href `/certificados/`, lista de archivos, backup y plan de rollback.
No hacer: no tocar `public_html` sin backup, no subir configuración real, no ejecutar deploy automático desde OpenCode. Commit, push, merge y rebase quedan manuales de Marcos.
Archive: `docs/deploy/00-cpanel-certificados.md`, `deploy/README.md`, docs backend/frontend si cambia la ruta pública.
Commit sugerido: `docs(deploy): documentar cpanel certificados`.

### Ciclo M3-03 — hardening final

Objetivo: revisar seguridad, logs, backups, documentación, QA y cierre Git revisable.
Rama sugerida: `qa/hardening-certificados`.
Leer antes: `AGENTS.md`, `GUIA.md`, `docs/00-indice-general.md`, `docs/07-sdd-archive-y-mantenimiento-documentacion.md`, docs backend/database/deploy tocadas.

Pedir a OpenCode:
```txt
Trabajemos M3-03 — hardening final.
Auditá seguridad, privacidad, logs, backups, .gitignore, documentación y specs.
No ejecutes commit, push, merge ni rebase. Cerrá con verify, archive y handoff final.
```

Ejecutar/verificar:
```bash
git status --ignored --short
php -l <archivo.php>
curl -i http://localhost/certificados/api/validar/TOKEN_FICTICIO
```

QA manual (checkpoint de parada): confirmar que no hay datos sensibles en logs/respuestas/docs, que `.gitignore` cubre privados y que `docs/` quedó sincronizado.
No hacer: no cerrar si falta `sdd-archive`, no aceptar material privado staged. Commit, push, merge y rebase quedan manuales de Marcos.
Archive: documentación afectada completa: backend, database, deploy, arquitectura, seguridad, `openspec/specs/`.
Commit sugerido: `chore(qa): cerrar hardening certificados`.

## Handoff al cierre de cada ciclo

~~~markdown
# Handoff — Ciclo <ID> <nombre>

## Resumen
- <qué se completó>

## Archivos tocados
- `<ruta>` — <motivo>

## Comandos y validaciones
- `<comando>` — <resultado>

## QA manual
- <checkpoint> — <resultado>

## Documentación / archive
- <docs actualizadas o pendiente justificado>

## Bloqueos y riesgos
- Bloqueos: <si no hay, "sin bloqueos">
- Riesgos: <riesgo y mitigación>

## Comandos Git propuestos, no ejecutados por OpenCode
```bash
git status --ignored --short
git add <archivos-seguros>
git commit -m "<mensaje>"
git push -u origin <rama-del-ciclo>
gh pr create --base main --head <rama-del-ciclo> --title "<titulo>" --body "<descripcion>"
```
~~~

## Anexo breve: skills y agentes

Fuentes verificadas: `.atl/skill-registry.md` actualizado el 2026-06-24 y referencias de `~/.config/opencode/opencode.json` inspeccionadas sin copiar configuración completa.

| Elemento | Estado | Uso práctico |
|---|---|---|
| `sdd-apply` | Verificado en configuración OpenCode. | Implementa tasks del ciclo. |
| `sdd-verify` | Verificado en configuración OpenCode. | Verifica specs, diseño, tasks y evidencia. |
| `sdd-archive` | Verificado en configuración OpenCode. | Cierra ciclo y sincroniza docs/specs. |
| `karpathy-guidelines` | Verificado en `.atl/skill-registry.md`. | Cambios quirúrgicos y criterios verificables. |
| `ponytail` | Verificado en configuración OpenCode como plugin; skill no listado en `.atl/skill-registry.md`. | Mantener solución mínima y sin sobreingeniería. |

Si una skill/agente no aparece en la sesión activa, pedir a OpenCode que lea `.atl/skill-registry.md` o la configuración local y marcar el punto como “pendiente de validar”.

## Reglas finales

- Git real queda en manos de Marcos.
- No usar datos reales para fixtures, QA ni documentación.
- No copiar contenido de `material_privado_no_versionar/`.
- No cerrar un ciclo sin `verify`, `sdd-archive` y handoff final.
