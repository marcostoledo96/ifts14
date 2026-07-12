# AGENTS.md — IFTS14

## Propósito

Este archivo orienta a OpenCode/Gentle-AI dentro del repositorio privado `ifts14`.

El objetivo es mantener el trabajo ordenado, seguro y guiado por Spec-Driven Development.

## Reglas obligatorias

- Trabajar con Spec-Driven Development.
- Trabajar un ciclo SDD por vez y cerrarlo con `sdd-archive`.
- Aplicar TDD cuando exista implementación.
- No leer todo el repositorio por defecto.
- No pegar salidas largas de terminal sin resumen operativo; usar `RTK` o compresión equivalente cuando corresponda.
- Leer lo mínimo necesario: índice, ciclo activo, specs afectadas y documentación puntual.
- Usar resúmenes Graphify aprobados si existen; ejecutar Graphify solo con `.graphifyignore` válido y nunca sobre material privado.
- Compactar/prunear contexto al cerrar ciclos largos y guardar resumen de sesión.
- Aplicar `Ponytail` y `karpathy-guidelines` para cambios chicos o quirúrgicos.
- No procesar material privado, dumps, logs ni secretos fuera de auditorías explícitamente autorizadas.
- **Token/QR permanente**: el reenvío normal NO rota token/QR. Solo revocación explícita o regeneración excepcional auditada.
- **DNI completo en UI pública**: visible por decisión institucional aprobada. Logs, auditoría, errores y respuestas administrativas NO deben exponer DNI completo.
- **Auth admin simple** con `X-Admin-Key` es temporal; login real es fase posterior.
- **Paridad visual con `muestra_pagina`**: todo trabajo frontend debe mantener paridad visual igual o mejor que la referencia en `muestra_pagina/` (o `proyecto_muestra` si existe). La vía preferida es copiar o simular el diseño/estilo de `muestra_pagina` al portar a Angular 20; no portar React/Next literalmente. La paridad visual es criterio de aceptación obligatorio en specs y verify de UI.
- **`.codegraph/`** es metadata local de indexado: no se versiona ni se incluye en stage.
- OpenCode PUEDE ejecutar operaciones Git solo con aprobación explícita de Matías o Marcos en el mismo turno y con el comando exacto propuesto. `git add` + `git commit` + `git push` a la rama de trabajo (nunca a `main`) requieren ciclo SDD verificado, **diff-confirmation gate** antes de stage (`git status --short` y `git diff --name-only`) y **pre-push safety** antes de push: si existe `origin/<rama>`, correr `git log origin/<rama>..<rama> --oneline` y `git diff origin/<rama>..<rama> --stat`; si es primer push, declarar que la ref remota no existe y comparar contra la base aprobada con `git log <base>..HEAD --oneline` y `git diff <base>...HEAD --stat`. La preparación de ramas o PR puede ocurrir antes de `sdd-verify` cuando el ciclo lo necesita; `git switch`, `git checkout`, `git branch`, `git switch -c`, `git checkout -b`, PR, `git merge` y `git rebase` requieren aprobación explícita, evidencia previa y árbol limpio, o una decisión explícita de stash/commit/abortar. La única operación siempre prohibida para el flujo de Matías es `git push` directo a `main`.
- No subir secretos.
- No imprimir credenciales reales en respuestas.
- No copiar dumps SQL ni logs a documentación.
- Mantener documentación y comentarios en español argentino formal.
- Los comentarios deben ser breves y útiles. No comentar obviedades.

## Stack confirmado

```txt
Frontend: Angular 20
Backend: PHP 8.4.21
Base de datos: MariaDB 10.6.27
Hosting: cPanel
Ruta pública: /certificados/
Staging: /certificados_staging/
```

## Lectura mínima

Antes de trabajar:

1. `README.md`.
2. `GUIA.md`.
3. `docs/00-indice-general.md`.
4. `docs/opencode/optimizacion-tokens.md` cuando el ciclo use OpenCode/Gentle-AI.
5. `AGENTS.md` de la carpeta correspondiente.
6. Prompt raíz del rol si aplica: `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` o `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`.
7. Spec correspondiente en `openspec/specs/`, si existe.
8. Fixture o contrato si aplica.

No leer documentación pesada ni carpetas descargadas del servidor salvo que la tarea sea auditoría.

## Material privado

La carpeta `material_privado_no_versionar/` puede contener datos sensibles.

Reglas:

- nunca versionar;
- nunca copiar credenciales a documentación;
- nunca imprimir contenido sensible;
- solo listar nombres de archivos y riesgos generales;
- usarla solo para auditoría local autorizada.

## Carpeta `muestra_pagina/`

`muestra_pagina/` contiene la referencia visual exportada desde v0 (Next.js/React).

Reglas:

- usarla como referencia visual para portar a Angular 20;
- no compilar ni ejecutar este proyecto;
- no portar React/Next literalmente a Angular;
- mejorar accesibilidad, rendimiento y estructura;
- respetar identidad institucional del IFTS 14;
- las credenciales demo de `login-form.tsx` son mock visual: no portarlas ni usarlas en el producto;
- respetar D0: QR permanente, DNI completo público, fechas asistidas, auth simple temporal;
- `muestra_pagina/` contiene la referencia visual v0 final y completa (export de Next.js/React con capturas para todos los flujos 4-22). El `MANIFIESTO_V0.md` histórico fue retirado al reemplazar la carpeta por el export final; el inventario se completa contra el listado seguro de la carpeta.

## Frontend

- Usar Angular 20.
- Usar Tailwind o el sistema visual documentado si se confirma.
- Organizar por features.
- Separar componentes, servicios y modelos.
- Evitar UI genérica de IA.
- Priorizar accesibilidad, responsive y rendimiento.

## Backend

- Usar PHP 8.4.21.
- Usar PDO y prepared statements.
- Mantener API bajo `/certificados/api/` o equivalente documentado.
- El token/QR es permanente: el reenvío normal no rota token.
- No exponer DNI ni tokens completos en logs.
- Logs, auditoría y errores no deben incluir DNI completo ni token completo.
- No guardar tokens públicos en texto plano si se implementa persistencia real.
- Separar configuración, controladores, servicios y acceso a datos.
- Auth admin con `X-Admin-Key` es temporal; login real es fase posterior.

## Base de datos

- Usar MariaDB 10.6.27.
- No versionar dumps reales.
- Crear migraciones SQL controladas.
- Usar prefijo `cert_` para tablas nuevas salvo decisión contraria.
- Documentar cambios en `database/docs/`.

## Deploy

- Publicar en `/certificados/`.
- No tocar `public_html` sin backup.
- Documentar `.htaccess`.
- Build Angular con base href `/certificados/`.
- Configuración real fuera de Git.

## sdd-archive

Al cerrar cada ciclo, actualizar la documentación correspondiente:

- cambios frontend → `docs/frontend/`;
- cambios backend → `docs/backend/`;
- cambios de base → `database/docs/`;
- cambios de deploy → `docs/deploy/`;
- cambios de arquitectura → `docs/` y `openspec/`;
- cambios de flujo operativo → `docs/opencode/`.

Si la documentación queda duplicada o confusa, proponer consolidación antes de seguir.
