# Checklist de staging — /certificados_staging/

Gates manuales obligatorios. La ejecución real en cPanel queda bloqueada hasta que todos los gates estén confirmados por Marcos. El agente no ejecuta estos pasos: solo documenta.

## Phase 0 — Gates previos (confirmar con Marcos antes de aplicar/ejecutar)

- [ ] **0.a Ruta final**: staging bajo `/certificados_staging/` en dominio principal o subdominio.
- [ ] **0.b Ventana cPanel**: pasos manuales aprobados y ventana operativa acordada. El agente no toca cPanel.
- [ ] **0.c Config externa staging**: `CERTIFICADOS_CONFIG_PATH` apuntando a archivo externo propio de staging, separado de producción, con `admin_api_key` presente fuera de Git, 16+ caracteres y coincidente con el `X-Admin-Key` de los smokes. Sin fallback a config productiva.
- [ ] **0.d DB/schema staging**: nombre, usuario, esquema, migración y seed ficticios confirmados. No usar datos reales.
- [ ] **0.e Backup**: copia de resguardo de `/certificados_staging/` si la carpeta existe. Si es primera instalación, plan de reversión por retiro/renombre.
- [ ] **0.f Composer/vendor**: `composer install --no-dev` en hosting o `vendor/` generado localmente. Nunca versionar `vendor/`.
- [ ] **0.g SMTP**: `stub` por defecto. SMTP real solo con credenciales de prueba y aprobación explícita.

Sin los 7 gates: el cambio queda en preparación local/documental. No subir, no tocar `public_html`, no modificar DB real, no acceder a cPanel.

## Phase 1 — Preparación local (agente, ya realizada)

- [x] `normalizePath()` soporta `/certificados_staging/api`.
- [x] `environment.staging.ts` con `apiBaseUrl: '/certificados_staging/api'`.
- [x] `production-staging` en `angular.json` con `baseHref: /certificados_staging/`.
- [x] `deploy/staging/` con manifiesto, plantillas `.htaccess` y este checklist.
- [x] Runbook `docs/deploy/01-staging-cpanel-certificados.md` reescrito.

## Phase 2 — Verificación local (agente)

- [ ] Build `npm run build -- --configuration production-staging` verde.
- [ ] Lint PHP limpio.
- [ ] Test procedural `normalizePath()` con 3 prefijos verde.
- [ ] Scan `deploy/staging/` sin `.env`, `password`, `secret`, `vendor/`, `*.sql`, `public_html/`, `*.dump`, `*.bak`.
- [ ] `git status` sin `dist/`, `vendor/`, `public_html/`, `.env*`.

## Phase 3 — Ejecución real en cPanel (MANUAL, Marcos, NO agente)

- [ ] 3.1 Backup de `/certificados_staging/` si existe.
- [ ] 3.2 Subir `dist/frontend-angular/` a `public_html/certificados_staging/`.
- [ ] 3.3 Subir backend PHP (sin `vendor/`) a `public_html/certificados_staging/api/`.
- [ ] 3.4 Instalar `.htaccess-root` y `.htaccess-api` desde plantillas.
- [ ] 3.5 `SetEnv CERTIFICADOS_CONFIG_PATH` en `.htaccess-api` con ruta externa staging; confirmar `admin_api_key` externo a Git sin registrar su valor.
- [ ] 3.6 Migración + seed en DB staging (datos ficticios).
- [ ] 3.7 Subir `composer.json` + `composer.lock`; Composer en hosting o `vendor/` local (nunca commitear).
- [ ] 3.8 SMTP `stub`; SMTP real solo si gate 0.g lo aprobó.
- [ ] 3.9 Smoke: `curl /certificados_staging/api/health` → 200; sin 404.
- [ ] 3.9b Confirmar `token_encryption_key` en config externa (32 bytes decode); no registrar el valor.
- [ ] 3.9c Si hay `409` en entrega-manual de certificados viejos: backup DB staging + ejecutar `LIMPIA-DATOS-NEGOCIO.sql` solo en staging; reemitir.
- [ ] 3.10 Si falla, rollback limitado a `/certificados_staging/`. Nunca tocar `/certificados/`.

## Rollback

- Detener cambios manuales en curso.
- Restaurar copia de `/certificados_staging/` si existía.
- Si era primera instalación, retirar o renombrar la carpeta nueva.
- Verificar `GET /certificados_staging/api/health` cuando corresponda.
- Confirmar que `/certificados/` no fue modificado.
