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
- En ciclos SDD verificados (post `sdd-verify` PASS), OpenCode PUEDE ejecutar `git add` + `git commit` SOLO cuando Matías lo apruebe explícitamente en el mismo turno del chat, con el mensaje exacto propuesto. Permanecen PROHIBIDOS `git push`, `git merge`, `git rebase`, `git switch`, `git checkout` (excepto lectura de rama) y cualquier operación sobre el remoto o `main`. El workflow de Marcos se mantiene intacto.
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

`muestra_pagina/` contiene o contendrá el diseño generado por v0.

Si está vacía:

- no implementar frontend final;
- no inventar pantallas;
- dejar documentado que el frontend visual está pendiente.

Si tiene contenido:

- usarla como referencia visual;
- portar a Angular 20;
- no copiar React/Next literalmente;
- mejorar accesibilidad, rendimiento y estructura;
- respetar identidad institucional del IFTS 14.

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
- No exponer DNI ni tokens completos en logs.
- No guardar tokens públicos en texto plano si se implementa persistencia real.
- Separar configuración, controladores, servicios y acceso a datos.

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
