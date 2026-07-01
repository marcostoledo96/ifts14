## Exploración: deploy-staging-cpanel-ejecucion

### Estado actual

- `main` está en el merge `17ea896` del PR #18 (`deploy/staging-cpanel-certificados`), que solo agregó la guía documental `docs/deploy/01-staging-cpanel-certificados.md` y actualizó `deploy/README.md`.
- La rama `deploy/staging-cpanel-ejecucion` es limpia y basada en `main`.
- El backend PHP en `apps/backend-php/` funciona para `/certificados/api/`, pero `normalizePath()` en `index.php` solo reconoce el prefijo productivo `/certificados/api`. El `.htaccess` apunta a `/certificados/api/index.php`.
- El frontend Angular tiene `baseHref: /certificados/` y `apiBaseUrl: /certificados/api` hardcodeado en `environment.ts`; no existe configuración de staging.
- La migración `database/migrations/001_certificados_qr.sql` y el seed `database/seeds/001_certificados_qr_demo.sql` ya están versionados.
- El ciclo anterior no ejecutó deploy ni subió archivos; este ciclo busca preparar un paquete local de staging y un runbook para que Marcos lo ejecute manualmente en cPanel.

### Áreas afectadas

- `apps/backend-php/index.php` — `normalizePath()` y los patrones de ruta asumen `/certificados/api`; hay que soportar `/certificados_staging/api` (o prefijo configurable).
- `apps/backend-php/.htaccess` — `FallbackResource` apunta a `/certificados/api/index.php`; necesita una variante de staging.
- `apps/frontend-angular/angular.json` — falta una configuración `production-staging` con `baseHref: /certificados_staging/`.
- `apps/frontend-angular/src/environments/environment.staging.ts` (nuevo) — `apiBaseUrl: /certificados_staging/api` y `useRealApi: true`.
- `apps/frontend-angular/src/app/shared/certificates/http-validation.source.ts` — usa `environment.apiBaseUrl`, así que con el entorno staging resuelve correctamente.
- `deploy/staging/` (nuevo) — manifiesto de paquete, plantillas de `.htaccess` para staging y checklist del operador.
- `docs/deploy/01-staging-cpanel-certificados.md` — actualizar de "documental" a "ejecución real con pasos manuales en cPanel".
- `database/migrations/` y `database/seeds/` — el operador debe ejecutarlos en la DB de staging; el agente no toca DB real.

### Enfoques

1. **Paquete local de staging + runbook operativo + cambios mínimos de código**
   - Descripción: agregar build `production-staging` en Angular, entorno staging, hacer configurable el prefijo de la API en PHP (o detectar el segmento previo a `/api`), crear `deploy/staging/` con `.htaccess`, manifiesto y checklist, y actualizar la guía. Sin subir nada a cPanel.
   - Pros: permite compilar localmente un paquete listo para staging, reduce errores de prefijo, mantiene secretos fuera del repo, el agente puede implementarlo sin acceso a cPanel.
   - Contras: requiere tocar backend y frontend; igual necesita a Marcos para DB, config real y cPanel.
   - Esfuerzo: Medio

2. **Solo documentación / runbook sin cambios de código**
   - Descripción: extender `docs/deploy/01-staging-cpanel-certificados.md` con pasos manuales para que el operador edite prefijos y `.htaccess` a mano.
   - Pros: bajo esfuerzo, sin riesgo de romper código.
   - Contras: el backend `normalizePath()` no soporta `/certificados_staging/api`, así que el operador debería editar PHP a mano en cada subida; alto riesgo de error humano.
   - Esfuerzo: Bajo

3. **Automatización local completa con script de empaquetado y validación**
   - Descripción: script que buildea Angular para staging, copia backend, genera `.htaccess`, valida que no queden prefijos productivos y empaqueta un ZIP.
   - Pros: reproducible y autoverificable.
   - Contras: más código para mantener; sigue bloqueado en credenciales/cPanel; puede ser excesivo para la primera ventana de staging.
   - Esfuerzo: Alto

### Recomendación

**Opción 1, en modo Ponytail full.** Hacer los cambios mínimos para que el backend y el frontend soporten `/certificados_staging/`, crear `deploy/staging/` con plantillas y checklist, y dejar la ejecución real en cPanel como pasos manuales para Marcos. No subir nada, no crear `.env` ni leer secretos.

Puntos clave:

- El prefijo de la API en PHP debe ser configurable (por ejemplo, leyendo `REQUEST_URI` y detectando `*/api` o mediante una variable de entorno). Así un mismo código sirve para `/certificados/api` y `/certificados_staging/api`.
- Angular necesita una configuración `production-staging` con `baseHref /certificados_staging/` y un `environment.staging.ts` con `apiBaseUrl /certificados_staging/api`.
- `deploy/staging/` debe contener `.htaccess` de raíz y de API con prefijo de staging, un `MANIFIESTO.md` que liste qué copiar desde `dist/frontend-angular/` y `apps/backend-php/`, y un checklist del operador.
- La guía `docs/deploy/01-staging-cpanel-certificados.md` debe pasar de "futuro" a "pasos concretos", siempre marcando qué hace el agente local y qué hace Marcos en cPanel.

### Riesgos

- **Prefijo productivo hardcodeado**: si no se modifica `normalizePath()` ni `baseHref`, staging llamará a producción o devolverá 404.
- **Mezcla de staging con producción**: el checklist debe distinguir explícitamente `/certificados/` de `/certificados_staging/` en cada paso.
- **Subida accidental de secretos**: el paquete local no debe incluir configs reales, `.env`, `vendor/` ni dumps.
- **DB de staging**: el operador debe crearla/apuntarla manualmente; el agente no debe conocer credenciales.
- **SMTP**: en staging el default debe ser `stub`; si se prueba SMTP real, las credenciales van en config externa, nunca en el repo.

### Bloqueos y entradas humanas requeridas

Antes de pasar a `sdd-apply` se necesita que Marcos confirme:

1. **Ruta/subdominio de staging**: ¿se usa `https://ifts14.com.ar/certificados_staging/` o un subdominio distinto?
2. **Acceso a cPanel**: ¿aprueba la ventana operativa y los pasos manuales exactos?
3. **Ruta de config real de staging**: dónde quedará el archivo externo y cómo se define `CERTIFICADOS_CONFIG_PATH` (por ejemplo, `SetEnv` en `.htaccess`).
4. **Base de datos de staging**: nombre, usuario y contraseña para que el operador ejecute la migración/seed (sin pasarle estos valores al agente).
5. **Backup**: confirmar que se hará backup previo de `/certificados_staging/` si existe.
6. **Composer en hosting**: ¿cPanel tiene Composer disponible o se sube `vendor/` generado localmente?
7. **SMTP**: ¿staging usa `stub` o se prueba con un servidor SMTP de test?

### Nombre de cambio y rama propuestos

- **Change name**: `deploy-staging-cpanel-ejecucion`
- **Branch**: `deploy/staging-cpanel-ejecucion` (ya existe y es la actual)

### ¿Listo para propuesta?

**Sí, con alcance acotado.** Se puede avanzar a `sdd-propose` con el objetivo "paquete local de staging + runbook operativo para ejecución manual en cPanel". Se debe incluir en la propuesta un gate de entradas humanas antes de `sdd-apply`; el agente no debe tocar cPanel, `public_html` ni secretos hasta que Marcos apruebe explícitamente.

### Documentos leídos

1. `AGENTS.md` (raíz)
2. `README.md`
3. `GUIA.md`
4. `docs/00-indice-general.md`
5. `docs/opencode/optimizacion-tokens.md`
6. `docs/deploy/01-staging-cpanel-certificados.md`
7. `docs/deploy/00-cpanel-certificados.md`
8. `deploy/README.md`
9. `deploy/AGENTS.md`
10. `openspec/config.yaml`
11. `openspec/specs/deploy-cpanel-certificados/spec.md`
12. `openspec/changes/archive/2026-06-30-staging-cpanel-certificados/exploration.md`
13. `openspec/changes/archive/2026-06-30-staging-cpanel-certificados/proposal.md`
14. `openspec/changes/archive/2026-06-30-staging-cpanel-certificados/tasks.md`
15. `apps/backend-php/index.php`
16. `apps/backend-php/src/Config.php`
17. `apps/backend-php/.htaccess`
18. `apps/backend-php/config/certificados-config.example.php`
19. `apps/backend-php/composer.json`
20. `apps/backend-php/README.md`
21. `apps/frontend-angular/angular.json`
22. `apps/frontend-angular/src/environments/environment.ts`
23. `apps/frontend-angular/src/environments/environment.development.ts`
24. `apps/frontend-angular/src/app/app.config.ts`
25. `apps/frontend-angular/src/app/app.routes.ts`
26. `apps/frontend-angular/src/app/shared/certificates/http-validation.source.ts`
27. `apps/frontend-angular/proxy.conf.json`
28. `database/migrations/001_certificados_qr.sql`
29. `database/seeds/001_certificados_qr_demo.sql`
30. `scripts/m3-06-smoke.sh`

### Documentos a actualizar

- `apps/backend-php/index.php` (prefijo configurable/detectable).
- `apps/backend-php/.htaccess` (plantilla de staging en `deploy/staging/`).
- `apps/frontend-angular/angular.json` (configuración `production-staging`).
- `apps/frontend-angular/src/environments/environment.staging.ts` (nuevo).
- `deploy/staging/MANIFIESTO.md` (nuevo).
- `deploy/staging/.htaccess-root` y `deploy/staging/.htaccess-api` (nuevos).
- `docs/deploy/01-staging-cpanel-certificados.md` (runbook de ejecución real).
