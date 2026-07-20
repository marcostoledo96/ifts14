# Marcos — guía operativa SDD para backend, datos y deploy

> **Estado global (2026-07-17): CERRADA — sin ciclos pendientes en esta guía.**
>
> Todos los bloques planificados **M1 → M4** están completados, verificados y documentados (`sdd-archive`). No quedan tareas M1-01..M4-07 por abrir desde este archivo.
>
> Trabajo operativo posterior (auth sesión PHP, CI P7, staging P8, QA manual, producción) **no forma parte de esta guía de 3 semanas**: se sigue en `docs/planificacion/IFTS14_PLAN_CORRECCIONES_PREPRODUCCION_SDD_TDD.md` y en `docs/qa/CHECKLIST-TESTING-MANUAL.md`.
>
> Esta guía queda como **referencia histórica ejecutable** (prompts, checkpoints, plantillas). No iniciar ciclos M1–M4 nuevos salvo regresión o decisión explícita de reabrir alcance.

Esta guía fue el punto de entrada para que Marcos trabaje ciclos chicos del módulo `/certificados/` con Spec-Driven Development. Marcos ya conoce el proyecto: prioriza ruta rápida, puntos de parada para QA manual y handoff revisable.

> Regla base (sigue vigente para ciclos futuros fuera de M1–M4): un ciclo por vez. Cerrar siempre con `sdd-archive` antes de proponer commit.

## Herramientas de reducción de tokens y costo

Marcos debe aplicar estas reglas antes de iniciar ciclos con OpenCode/Gentle-AI:

- Leer `docs/opencode/optimizacion-tokens.md` junto con el ciclo activo.
- Usar `RTK` o resumen equivalente para salidas largas de terminal.
- Ejecutar Graphify solo si `.graphifyignore` existe y excluye material privado, dumps, logs, `.env` y `graphify-out/`.
- Versionar únicamente resúmenes Graphify aprobados; nunca `graphify-out/` ni artefactos pesados.
- Compactar/prunear contexto y guardar resumen Engram al cerrar ciclos largos.
- Reservar perfiles/modelos caros para arquitectura, seguridad y verificación crítica.

## Ruta rápida

> **Nota (2026-07-17):** los ciclos M1–M4 de esta guía ya están cerrados. La ruta rápida aplica a **ciclos futuros** fuera de M1–M4 (p. ej. remediaciones del plan P8+), no a reabrir M1–M4.

1. Leer `AGENTS.md`, `docs/00-indice-general.md`, `docs/opencode/optimizacion-tokens.md` y el ciclo activo.
2. Elegir un ciclo **nuevo** autorizado (no M1–M4 salvo regresión) y abrir sus archivos mínimos.
3. Pedir a OpenCode el ciclo SDD completo: explore → propose → spec → design → tasks → apply → verify → archive.
4. Frenar en cada checkpoint de QA manual y guardar evidencia breve del resultado.
5. Entregar handoff final con archivos, validaciones, bloqueos, riesgos y comandos Git solo propuestos.

## Rol y límites

| Tema | Regla |
|---|---|
| Rol | Backend PHP 8.4.21, MariaDB 10.6.27, integración front/back, deploy cPanel, arquitectura, seguridad, documentación, estructura funcional y desbloqueos frontend técnicos. |
| Ruta pública | `/certificados/`. Staging: `/certificados_staging/`. |
| Frontend | Puede tomar solo fundación Angular, validación pública, mocks/contratos frontend y build `/certificados/` cuando Matías esté bloqueado o se necesite destrabar backend. No inventar diseño final. |
| Material privado | No modificar ni copiar contenido de `material_privado_no_versionar/`; solo nombres y riesgos generales cuando el ciclo lo autorice. |
| Datos sensibles | No imprimir credenciales, dumps, logs, DNI completo en logs/auditoría/errores ni tokens completos. DNI completo visible en validación pública y UI admin (D0, 2026-07-20). |
| Decisiones D0 | QR/token permanente (no se rota en operaciones operativas; solo revocación explícita o regeneración excepcional auditada); DNI completo en validación pública y UI admin (listados/detalle/expediente); certificado de curso con fechas asistidas; logs/auditoría/errores/dumps sin DNI ni token completos; **auth admin = sesión PHP nativa + CSRF** (P5-01; `X-Admin-Key` solo CLI/smokes, no autoriza HTTP); firmantes Rector/a + Asesor/a Pedagógica; entrega manual (copiar link + descargar PDF/QR) sin email, SMTP, PHPMailer ni transporte `stub`; staging `/certificados_staging/`. |
| Git | Trabajar con ramas por unidad revisable/deployable, no necesariamente una rama por ciclo SDD. OpenCode puede crear o cambiar ramas (`git switch`, `git checkout`, `git branch`, `git switch -c`, `git checkout -b`) solo con aprobación explícita de Marcos, árbol limpio y rama fuente explícita/actualizada. |
| Git — nota | Commit, push y PR requieren aprobación explícita de Marcos en el mismo turno. `git merge`, `git rebase`, `git push` a `main` y merge de PR quedan fuera de OpenCode. |

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
- La rama Git agrupa trabajo revisable; el ciclo SDD agrupa planificación. Si dos ciclos forman una misma capacidad revisable y verificable, pueden compartir rama.

### Estrategia de ramas recomendada

| Rama | Ciclos incluidos | Criterio |
|---|---|---|
| `backend/public-endpoint-hardening` | `M3-01`, `M3-02` | Rate limiting y fault-injection endurecen el endpoint público ya implementado. |
| `backend/admin-certificados` | `M3-03` | Emisión, revocación y entrega manual comparten permisos, escritura, auditoría y API administrativa. |
| `qa/backend-hardening-certificados` | `M3-04` | Seguridad, privacidad, logs y QA backend antes de deploy. |
| `deploy/cpanel-certificados` | `M3-05` | Ruta `/certificados/`, `.htaccess`, config externa, rollback y checklist se revisan juntos cuando backend esté listo. |
| `integration/angular-api-contract` | `M3-06` | Checkpoint final PHP/Angular cuando exista flujo público y checklist compartida. |
| `frontend/angular-shell` | `F1-03`, `F1-04`, `F1-05` | Desbloqueo técnico: app Angular, Tailwind aprobado y layout semántico mínimo. |
| `frontend/public-validation-flow` | `F2-01`, `F2-02` | Desbloqueo técnico: pantalla pública y estados con mocks ficticios y contrato vigente. |
| `frontend/api-readiness` | `F3-01`, `F3-02`, `F3-05` | Desbloqueo técnico: servicios mock, frontera futura API PHP y build `/certificados/`. |

No juntar deploy con integración Angular salvo cambio de ruta pública que obligue a ambos. No juntar endpoints administrativos con validación pública: tienen distinto riesgo y superficie de seguridad. La integración real Angular/API queda al final; mientras tanto Matías puede avanzar con mocks y el contrato vigente sin bloquear a Marcos.

### Desbloqueo frontend que puede tomar Marcos

Marcos puede ejecutar trabajo frontend backend-facing/estructural para que el backend no quede bloqueado por espera visual:

- `F1-03` Crear app Angular 20, `F1-04` Configurar Tailwind y `F1-05` Layout base público/admin en `frontend/angular-shell`.
- `F2-01` Pantalla pública válida y `F2-02` estados revocada/no encontrada/error en `frontend/public-validation-flow`.
- `F3-01` servicios mock/contratos frontend, `F3-02` conexión futura API PHP y `F3-05` build `/certificados/` en `frontend/api-readiness`.

Límites: no inventar diseño final, no copiar React/Next, no usar datos reales, coordinar archivos globales Angular y dejar a Matías la UI/UX final, admin, QA visual y handoff. Secuencia sugerida: Marcos `frontend/angular-shell` → Matías `frontend/v0-design-system` → Marcos `frontend/public-validation-flow` → Matías visual/admin → Marcos `frontend/api-readiness` → Matías QA/handoff.

### Prompt base para iniciar un ciclo

```txt
Trabajemos el ciclo <ID> — <nombre> para IFTS14.
Usá SDD completo: explore, propose, spec, design, tasks, apply, verify y archive.
Leé AGENTS.md, docs/00-indice-general.md, docs/opencode/optimizacion-tokens.md y los docs/specs indicados por el ciclo activo.
No toques Angular salvo que el ciclo sea uno de los desbloqueos frontend autorizados. No modifiques material_privado_no_versionar/.
No ejecutes commit, push ni PR sin aprobación explícita de Marcos. No ejecutes `git merge`, `git rebase`, `git push` a `main` ni merge de PR. Para cambiar o crear rama, primero verificá árbol limpio y rama fuente explícita/actualizada.
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
No hacer: <límites concretos del ciclo>. Commit, push y PR requieren aprobación explícita de Marcos; `git merge`, `git rebase`, `git push` a `main` y merge de PR quedan fuera de OpenCode. Cambio o creación de rama solo con árbol limpio, aprobación explícita y rama fuente explícita/actualizada.
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
No hacer: no limpiar a ciegas, no tocar `material_privado_no_versionar/`. Commit y push requieren aprobación explícita de Marcos; merge y rebase quedan fuera de OpenCode.
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
No hacer: no versionar material privado, no mover secretos a docs, no abrir contenido sensible salvo auditoría local autorizada. Commit y push requieren aprobación explícita de Marcos; merge y rebase quedan fuera de OpenCode.
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
No hacer: no tocar bases reales, no versionar dumps, no guardar tokens públicos en texto plano si hay persistencia real. Commit y push requieren aprobación explícita de Marcos; merge y rebase quedan fuera de OpenCode.
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
No hacer: no inventar comportamiento no especificado, no acoplar a Angular. Commit y push requieren aprobación explícita de Marcos; merge y rebase quedan fuera de OpenCode.
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
No hacer: no subir `.env`, no registrar credenciales, no crear abstracciones para futuro sin uso real. Commit y push requieren aprobación explícita de Marcos; merge y rebase quedan fuera de OpenCode.
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
No hacer: no probar con datos reales, no loguear secretos, no publicar endpoint sin manejo de errores documentado. Commit y push requieren aprobación explícita de Marcos; merge y rebase quedan fuera de OpenCode.
Archive: `docs/backend/01-contrato-api-certificados.md`, `docs/funcionalidades` o equivalente si se documenta capacidad pública.
Commit sugerido: `feat(backend): validar certificados por token`.

## Semana 3 — backend, base, seguridad, deploy e integración final

> **Cierre (2026-07-17):** M3 y M4 están **completados y archivados**. El texto de los ciclos abajo se conserva como historial de prompts; **no hay foco pendiente en M3 ni en M4** desde esta guía.

### Ciclo M3-01 — rate limiting del endpoint público

Objetivo: implementar límite de consultas para validación pública y responder `429 RATE_LIMITED` según contrato.
Rama sugerida: `backend/public-endpoint-hardening`.
Leer antes: `apps/backend-php/AGENTS.md`, `docs/backend/00-php84-api.md`, `docs/backend/01-contrato-api-certificados.md`, `docs/database/01-modelo-datos-certificados.md`.

Pedir a OpenCode:
```txt
Trabajemos M3-01 — rate limiting del endpoint público.
Usá SDD completo. Endurecé la validación pública sin exponer IP, token, DNI completo ni detalles internos.
No toques Angular, deploy real ni material_privado_no_versionar/.
```

Ejecutar/verificar:
```bash
php -l <archivo.php>
curl -i http://localhost/certificados/api/certificados/TOKEN_FICTICIO/verificacion
```

QA manual (checkpoint de parada): confirmar `429 RATE_LIMITED` reproducible con datos ficticios, sin logs sensibles.
No hacer: no guardar IP cruda ni token completo. Commit y push requieren aprobación explícita de Marcos; merge y rebase quedan fuera de OpenCode.
Archive: `docs/backend/00-php84-api.md`, `docs/backend/01-contrato-api-certificados.md`, docs de seguridad si aplica.
Commit sugerido: `feat(backend): limitar validacion publica`.

### Ciclo M3-02 — fault-injection de auditoría pública

Objetivo: probar fallas de auditoría sobre `cert_eventos_auditoria` y confirmar que no rompen la respuesta pública.
Rama sugerida: `backend/public-endpoint-hardening`.
Leer antes: `docs/backend/00-php84-api.md`, `docs/backend/01-contrato-api-certificados.md`, `docs/database/01-modelo-datos-certificados.md`.

Pedir a OpenCode:
```txt
Trabajemos M3-02 — fault-injection de auditoría pública.
Usá SDD completo. Forzá una falla controlada de auditoría con entorno ficticio y verificá que el endpoint público siga respondiendo de forma segura.
No uses base real, dumps, logs reales ni material_privado_no_versionar/.
```

Ejecutar/verificar:
```bash
php -l <archivo.php>
curl -i http://localhost/certificados/api/certificados/TOKEN_FICTICIO/verificacion
```

QA manual (checkpoint de parada): registrar evidencia mínima de que la auditoría falla controladamente y la API no expone detalles internos.
No hacer: no copiar logs reales ni credenciales. Commit y push requieren aprobación explícita de Marcos; merge y rebase quedan fuera de OpenCode.
Archive: `docs/backend/00-php84-api.md`, `docs/database/01-modelo-datos-certificados.md` si cambia la auditoría documentada.
Commit sugerido: `test(backend): validar auditoria tolerante a fallas`.

### Ciclo M3-03 — endpoints administrativos de certificados

Objetivo: definir e implementar, por SDD, endpoints/admin de emisión, revocación y entrega manual con permisos, auditoría y privacidad.
Rama sugerida: `backend/admin-certificados`.
Leer antes: `apps/backend-php/AGENTS.md`, `docs/backend/00-php84-api.md`, `docs/backend/01-contrato-api-certificados.md`, `docs/database/01-modelo-datos-certificados.md`.

Pedir a OpenCode:
```txt
Trabajemos M3-03 — endpoints administrativos de certificados.
Primero definí contrato y permisos para emisión, revocación y entrega manual; después implementá solo lo aprobado.
No toques Angular ni simules seguridad falsa. No uses datos reales.
```

Ejecutar/verificar:
```bash
php -l <archivo.php>
curl -i http://localhost/certificados/api/admin/<endpoint-ficticio>
```

QA manual (checkpoint de parada): confirmar permisos, errores, auditoría y privacidad antes de habilitar cualquier acción crítica.
No hacer: no mezclar endpoints administrativos con validación pública ni con integración Angular. Commit y push requieren aprobación explícita de Marcos; merge y rebase quedan fuera de OpenCode.
Archive: `docs/backend/01-contrato-api-certificados.md`, `docs/backend/00-php84-api.md`, `docs/database/01-modelo-datos-certificados.md`, specs administrativas.
Commit sugerido: `feat(backend): agregar administracion de certificados`.

### Ciclo M3-04 — hardening de seguridad y logs backend

Objetivo: revisar seguridad, privacidad, logs, errores, `.gitignore`, documentación y QA backend antes de deploy.
Rama sugerida: `qa/backend-hardening-certificados`.
Leer antes: `AGENTS.md`, `GUIA.md`, `docs/00-indice-general.md`, `docs/backend/00-php84-api.md`, `docs/backend/01-contrato-api-certificados.md`, `docs/database/01-modelo-datos-certificados.md`.

Pedir a OpenCode:
```txt
Trabajemos M3-04 — hardening de seguridad y logs backend.
Auditá respuestas, logs, privacidad, manejo de errores, documentación y specs backend/base.
No ejecutes commit ni push sin aprobación explícita de Marcos. No ejecutes merge ni rebase. No toques Angular ni deploy real.
```

Ejecutar/verificar:
```bash
git status --ignored --short
php -l <archivo.php>
curl -i http://localhost/certificados/api/certificados/TOKEN_FICTICIO/verificacion
```

QA manual (checkpoint de parada): confirmar que no hay datos sensibles en logs/respuestas/docs y que `.gitignore` cubre privados.
No hacer: no cerrar si falta `sdd-archive`, no aceptar material privado staged. Commit y push requieren aprobación explícita de Marcos; merge y rebase quedan fuera de OpenCode.
Archive: documentación afectada de backend, database, seguridad y `openspec/specs/`.
Commit sugerido: `chore(qa): endurecer backend certificados`.

### Ciclo M3-05 — deploy cPanel backend listo

Objetivo: documentar y preparar deploy en `/certificados/` solo cuando backend, seguridad y contratos estén listos.
Rama sugerida: `deploy/cpanel-certificados`.
Leer antes: `deploy/AGENTS.md`, `deploy/README.md`, `docs/deploy/00-cpanel-certificados.md`, `docs/backend/00-php84-api.md`, `GUIA.md`.

Pedir a OpenCode:
```txt
Trabajemos M3-05 — deploy cPanel backend listo.
Documentá ruta /certificados/, .htaccess, config externa, backup, rollback y checklist de subida manual.
No toques public_html ni subas archivos; todo deploy real queda manual y con backup.
```

Ejecutar/verificar:
```bash
git status --ignored --short
```

QA manual (checkpoint de parada): antes de subir, revisar `.htaccess`, lista de archivos, configuración externa, backup y rollback.
No hacer: no tocar `public_html` sin backup, no subir configuración real, no ejecutar deploy automático desde OpenCode. Commit y push requieren aprobación explícita de Marcos; merge y rebase quedan fuera de OpenCode.
Archive: `docs/deploy/00-cpanel-certificados.md`, `deploy/README.md`, docs backend si cambia la ruta pública.
Commit sugerido: `docs(deploy): preparar cpanel certificados`.

### Ciclo M3-06 — checkpoint final de integración Angular/API

Objetivo: coordinar consumo real PHP/Angular recién cuando exista `frontend/public-validation-flow`, los contratos backend estén estables y haya checklist compartida.
Rama sugerida: `integration/angular-api-contract`.
Leer antes: `docs/backend/01-contrato-api-certificados.md`, `docs/frontend/00-angular20-port-v0.md`, `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`, reporte o handoff de `frontend/public-validation-flow`.

Pedir a OpenCode:
```txt
Trabajemos M3-06 — checkpoint final de integración Angular/API.
Verificá consumo real solo si ya existe `frontend/public-validation-flow`, los contratos backend están estables y hay checklist compartida.
Si falta alguna condición, dejá integración como pendiente no bloqueante. No modifiques Angular salvo coordinación explícita.
```

Ejecutar/verificar:
```bash
git diff -- docs/backend/01-contrato-api-certificados.md docs/frontend/00-angular20-port-v0.md
```

QA manual (checkpoint de parada): confirmar checklist compartida, DTOs, errores, estados no verificables y privacidad antes de activar llamadas reales.
No hacer: no bloquear backend por falta de Angular, no inventar endpoints ni pantallas, no cambiar componentes Angular sin ciclo frontend coordinado. Commit y push requieren aprobación explícita de Marcos; merge y rebase quedan fuera de OpenCode.
Archive: `docs/backend/`, `docs/frontend/`, specs de integración si cambia contrato.
Commit sugerido: `docs(integracion): cerrar checklist angular api`.

## Semana 4 — sincronización D0 y backend de certificados de curso

> **Bloque M4 — CERRADO.** Histórico: alineó backend, DB, PDF, entrega manual, auth y deploy con D0 (QR/token permanente, DNI completo público, fechas asistidas, firmantes institucionales, Composer/vendor, staging). Entrega manual (link + PDF/QR); sin email/SMTP/PHPMailer/`stub`. **No reabrir ciclos M4 salvo regresión.**

| Ciclo | Nombre | Objetivo | Rama sugerida |
|---|---|---|---|
| M4-01A | `backend-contrato-token-permanente-dni-fechas` | Contrato documental: DTO público con DNI completo + `attendedDates`, reenvío sin rotación, estrategia de token recuperable (`token_cifrado`), revocación invalida token, storage seguro de DNI (`dni_hash`+`dni_cifrado`). No implementa producto. | `backend/contrato-token-permanente-dni-fechas` |
| M4-01B | `backend-token-permanente-dni-fechas` | Implementación del contrato M4-01A sobre backend/modelo. Depende de M4-02 (modelo de cursos/alumnos/asistencias) para emisión real desde asistencias y del storage de token recuperable. | `backend/token-permanente-dni-fechas` |
| M4-02 | `database-cursos-alumnos-asistencias` | Modelo real de cursos, alumnos, fechas y asistencias con prefijo `cert_`. | `database/cursos-alumnos-asistencias` |
| M4-03 | `backend-cursos-alumnos-asistencias-api` | API admin mínima para cursos, alumnos, fechas y asistencias con `X-Admin-Key`. | `backend/cursos-alumnos-asistencias-api` |
| M4-04 | `backend-emision-desde-asistencias` | Emisión desde alumno+curso+fechas presentes, no texto libre. Token permanente. | `backend/emision-desde-asistencias` |
| M4-05 | `pdf-certificado-curso-fechas` | PDF institucional de certificado de curso con QR, fechas asistidas y firmantes. | `backend/pdf-certificado-curso-fechas` |
| M4-06 | `email-reenvio-token-permanente` | **Cancelado por D0**: no se ejecuta email, SMTP, PHPMailer, transporte `stub` ni reenvío automático. La entrega es manual (copiar link público + descargar PDF) y la fila se conserva solo para trazabilidad histórica. | `backend/email-reenvio-token-permanente` (no se ejecuta) |
| M4-07 | `staging-cpanel-real-certificados` | Subida integrada a `/certificados_staging/` con gates Composer/vendor, SMTP, DB staging y rollback. | `deploy/staging-cpanel-real` |

### Reglas del split M4-01

- **M4-01A (contrato)** puede avanzar sin dependencias de implementación: solo docs/specs. No crea migraciones ni código.
- **M4-01B (implementación)** depende de M4-02 (modelo de cursos/alumnos/asistencias) para emisión real y del storage de token recuperable (`token_cifrado`). No implementar M4-01B antes de que existan las dependencias del modelo.
- M4-06 queda cancelado por D0: no se ejecuta email, SMTP, PHPMailer, transporte `stub` ni reenvío automático. La entrega es manual (copiar link + descargar PDF) y no requiere ciclo de implementación adicional.

### Reglas del bloque M4

- Los IDs M1-M3 se preservan; M4 es bloque nuevo sin renumerar.
- M4 no habilita implementación fuera de ciclo SDD verificado.
- Marcos lidera backend, DB, integración, deploy, arquitectura y seguridad.
- Matías conserva UI/UX, adaptación visual y QA frontend; no hacer diseño final desde backend.
- Coordinar con Matías sobre la referencia v0 final (`muestra_pagina/` — listado seguro); el `MANIFIESTO_V0.md` histórico fue retirado al reemplazar la carpeta por el export final.
- Gates: Composer pendiente de localizar en cPanel; `vendor/` nunca versionado. NO hay SMTP real ni cuenta de prueba: la entrega es manual.
- QR/token permanente: el token NO se rota en ninguna operación operativa del MVP. Solo revocación explícita o regeneración excepcional auditada pueden reemplazarlo.
- DNI completo visible en validación pública y UI admin (D0, 2026-07-20); logs/auditoría/errores/dumps sin DNI ni token completos.

### Prompt base M4

```txt
Trabajemos el ciclo M4-XX — <nombre> para IFTS14.
Usá SDD completo: explore, propose, spec, design, tasks, apply, verify y archive.
Leé AGENTS.md, docs/00-indice-general.md, docs/backend/01-contrato-api-certificados.md,
docs/database/01-modelo-datos-certificados.md y los docs/specs indicados por el ciclo.
Respetá D0: QR permanente, DNI completo en validación pública y UI admin, fechas asistidas, auth simple temporal,
firmantes Rector/a + Asesor/a Pedagógica, entrega manual sin SMTP en el MVP, gates Composer, staging /certificados_staging/.
No toques Angular salvo coordinación explícita. No modifiques material_privado_no_versionar/.
No ejecutes commit, push ni PR sin aprobación explícita de Marcos. No ejecutes `git merge`,
`git rebase`, `git push` a `main` ni merge de PR. Para cambiar o crear rama, primero verificá
árbol limpio y rama fuente explícita/actualizada.
Frená en los checkpoints de QA manual y reportá comando, resultado, bloqueos y riesgos.
```

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

- Git real queda en manos de Marcos; cambio/creación de ramas solo con aprobación explícita, árbol limpio y rama fuente explícita/actualizada.
- No usar datos reales para fixtures, QA ni documentación.
- No copiar contenido de `material_privado_no_versionar/`.
- No cerrar un ciclo sin `verify`, `sdd-archive` y handoff final.
