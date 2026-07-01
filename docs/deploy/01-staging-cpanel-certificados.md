# Staging cPanel — /certificados_staging/

Runbook de preparación local ejecutable y ejecución manual gated para staging del módulo de certificaciones. Distingue staging (`/certificados_staging/`) de producción (`/certificados/`). El agente no ejecuta deploy remoto, no sube archivos, no modifica cPanel, no toca DB real ni SMTP real.

La guía productiva vigente sigue siendo [`00-cpanel-certificados.md`](00-cpanel-certificados.md). Este documento solo cubre staging.

## Objetivo

Preparar localmente un paquete revisable para `/certificados_staging/` y dejar gates manuales para que Marcos ejecute la subida real en una ventana acordada. Hasta que los gates estén confirmados, el cambio queda como preparación local + documentación.

## Alcance

### Incluye

- Preparación local: build Angular `production-staging`, `normalizePath()` compatible con staging, artefactos versionables en `deploy/staging/`.
- Paquete revisable: manifiesto, plantillas `.htaccess`, checklist de gates.
- Ejecución manual gated: pasos para Marcos en cPanel, con backup, config externa, DB ficticia, Composer y SMTP `stub`.
- Rollback manual limitado a staging.

### No incluye

- Deploy real, uploads ni cambios en cPanel ejecutados por el agente.
- Uso de datos reales, credenciales, tokens, claves privadas, volcados, bitácoras o configuraciones reales.
- Cambios en producción bajo `/certificados/`.
- Artefactos descargados del servidor ni contenido privado fuera de versión.

## Gates humanos (Phase 0 — bloqueante)

Antes de cualquier ejecución real, confirmar los 7 gates con Marcos:

1. **Ruta final**: `/certificados_staging/` en dominio principal o subdominio.
2. **Ventana cPanel**: pasos manuales aprobados. El agente no toca cPanel.
3. **Config externa staging**: `CERTIFICADOS_CONFIG_PATH` apuntando a archivo externo propio de staging, separado de producción. Sin fallback a config productiva.
4. **DB/schema staging**: nombre, usuario, migración y seed ficticios. No usar datos reales.
5. **Backup**: copia de resguardo de `/certificados_staging/` si existe; si es primera instalación, plan de reversión por retiro/renombre.
6. **Composer/vendor**: `composer install --no-dev` en hosting o `vendor/` local. Nunca versionar `vendor/`.
7. **SMTP**: `stub` por defecto. SMTP real solo con credenciales de prueba y aprobación explícita.

Sin los 7 gates: el cambio queda en preparación local. No subir, no tocar `public_html`, no modificar DB real, no acceder a cPanel.

Ver checklist completo en [`deploy/staging/CHECKLIST.md`](../../deploy/staging/CHECKLIST.md).

## Preparación local (agente, ya realizada)

| Artefacto | Acción | Descripción |
|---|---|---|
| `apps/backend-php/index.php` | Modificado | `normalizePath()` acepta `/certificados/api`, `/certificados_staging/api` e `/index.php` con un solo router. |
| `apps/frontend-angular/src/environments/environment.staging.ts` | Creado | `useRealApi: true`, `apiBaseUrl: '/certificados_staging/api'`. |
| `apps/frontend-angular/angular.json` | Modificado | Configuración `production-staging` con `baseHref /certificados_staging/` y `fileReplacement` a `environment.staging.ts`. |
| `deploy/staging/MANIFIESTO.md` | Creado | Artefactos a copiar y exclusiones (`vendor/`, `.env*`, dumps, logs, `public_html/`, configs reales). |
| `deploy/staging/.htaccess-root` | Creado | Plantilla SPA para `/certificados_staging/` sin capturar `/api/`. |
| `deploy/staging/.htaccess-api` | Creado | Plantilla API: bloqueo `src/`/`config/` + `FallbackResource` + `SetEnv CERTIFICADOS_CONFIG_PATH`. |
| `deploy/staging/CHECKLIST.md` | Creado | Gates manuales de Phase 0, 2 y 3. |

## Rutas y estructura esperada

| Elemento | Ruta de staging | Observación |
|---|---|---|
| Frontend | `/certificados_staging/` | Build `production-staging` con `baseHref /certificados_staging/`. |
| API | `/certificados_staging/api/` | Responde `GET /certificados_staging/api/health`. |
| Validación pública | `/certificados_staging/validar/TOKEN_FICTICIO` | Solo con token ficticio. |
| Producción | `/certificados/` | No se modifica. |

Estructura esperada en cPanel:

```txt
certificados_staging/
├── index.html
├── assets/
├── .htaccess          ← desde deploy/staging/.htaccess-root
└── api/
    ├── index.php
    ├── .htaccess      ← desde deploy/staging/.htaccess-api
    ├── src/
    ├── config/        ← solo .example
    ├── composer.json
    └── composer.lock
```

## Build Angular de staging

```bash
cd apps/frontend-angular
npm run build -- --configuration production-staging
```

El output queda en `apps/frontend-angular/dist/frontend-angular/` con `baseHref /certificados_staging/` y `apiBaseUrl /certificados_staging/api`. `angular.json` define `outputPath.browser: ""`, por lo que no se genera subcarpeta `browser/`. Verificar `href="/certificados_staging/"` en `index.html`.

## API PHP compatible con staging y producción

`normalizePath()` en `apps/backend-php/index.php` quita los prefijos `/certificados_staging/api`, `/certificados/api` e `/index.php` antes de enrutar. Un solo router sirve producción y staging sin duplicar `index.php` ni editar PHP manualmente en cPanel.

```php
// Entradas esperadas:
/certificados_staging/api/health  => /health
/certificados/api/health          => /health
/index.php/health                  => /health
```

## Paquete revisable

Armar el paquete a mano siguiendo [`deploy/staging/MANIFIESTO.md`](../../deploy/staging/MANIFIESTO.md). El manifiesto lista qué copiar y qué excluir. Regla clave: si un archivo no es claramente seguro, excluirlo y consultar antes de continuar.

Exclusiones obligatorias:

- `vendor/` (regenerar con Composer).
- `.env*`, config real (`certificados-config.php`).
- `*.sql`, `*.dump`, `*.bak`, `*.log`.
- `public_html/`, `material_privado_no_versionar/`.
- Credenciales, tokens, peppers, claves privadas.

## Dependencias Composer para staging

`vendor/` no se versiona ni se incorpora al repo. Resolver de una de estas dos formas operativas:

1. Preferente: ejecutar en el hosting `composer install --no-dev --no-interaction` junto a `composer.json` y `composer.lock` versionados. El lock fija versiones; el `composer.json` es requerido por `composer install`.
2. Si el hosting no tiene Composer: generar `vendor/` localmente desde `composer.json`/`composer.lock` y subirlo solo como artefacto operativo del deploy, sin agregarlo a Git.

`.htaccess-api` bloquea el acceso directo a `vendor/`, `composer.json` y `composer.lock` por si quedan bajo el webroot; la opción preferente sigue siendo mantener `vendor/` y los manifiestos fuera del webroot público.

Sin una de estas dos opciones confirmada, la API de staging puede quedar incompleta y el paquete no debe considerarse listo.

## Configuración externa de staging

La config real de staging se carga vía `CERTIFICADOS_CONFIG_PATH` apuntando a un archivo externo propio de staging, separado de producción. Declarar en `.htaccess-api`:

```apache
SetEnv CERTIFICADOS_CONFIG_PATH "/ruta/externa/staging/certificados-config.php"
```

Si esa ruta no está definida o no existe, staging debe fallar cerrado; no debe caer al archivo productivo ni a una ruta default compartida.

Plantilla con placeholders ficticios (no usar en producción):

```php
return [
    'db_host' => 'HOST_STAGING_FICTICIO',
    'db_name' => 'DB_STAGING_FICTICIA',
    'db_user' => 'USUARIO_STAGING_FICTICIO',
    'db_pass' => 'CLAVE_STAGING_FICTICIA',
    'token_pepper' => 'PEPPER_STAGING_FICTICIO',
    'public_base_url' => 'https://example.edu.ar/certificados_staging',
    'certificate_storage_path' => 'RUTA_STORAGE_STAGING_FICTICIA',
    'delivery_transport' => 'stub',
];
```

`public_base_url` debe apuntar a `/certificados_staging/`. No reutilizar la base productiva `/certificados/`.

## Almacenamiento de PDFs de staging

`certificate_storage_path` de staging debe apuntar a un storage ficticio o de prueba separado del productivo. Opción preferente: fuera del webroot público. Si por restricción del hosting queda dentro de una carpeta pública, protegerlo con `.htaccess`:

```apache
Options -Indexes
Deny from all
```

No servir PDFs de staging por URL directa. Las pruebas deben usar certificados ficticios y archivos de prueba eliminables.

## Smoke checks con datos ficticios

Después de una instalación autorizada, validar únicamente con datos ficticios:

| Caso | Check | Resultado esperado |
|---|---|---|
| Health API | `GET /certificados_staging/api/health` | JSON con `status: ok`. |
| Ruta frontend | `GET /certificados_staging/validar/TOKEN_FICTICIO` | Fallback SPA, pantalla pública de staging. |
| Token inexistente | `GET /certificados_staging/api/certificados/TOKEN_FICTICIO/verificacion` | Respuesta pública controlada, sin datos reales. |
| Internos API | `GET /certificados_staging/api/src/Response.php` | Bloqueado (403). |
| Config example | `GET /certificados_staging/api/config/certificados-config.example.php` | Bloqueado (403). |
| Vendor | `GET /certificados_staging/api/vendor/` | Bloqueado (403). |
| Manifiestos Composer | `GET /certificados_staging/api/composer.json` | Bloqueado (403). |

No consultar certificados reales, DNI reales, tokens reales ni bitácoras productivas durante este smoke.

## Rollback limitado a staging

Antes de cualquier subida, crear copia de resguardo de `/certificados_staging/` si la carpeta existe. Registrar nombre, fecha y responsable sin copiar contenido sensible al repo.

Si es la primera instalación y no existe staging previo, el plan de reversión es retirar o renombrar la carpeta nueva y dejar constancia operativa. No usar archivos de producción como reemplazo automático.

Si una subida falla:

1. Detener cambios manuales en curso.
2. Conservar evidencia general sin copiar datos sensibles.
3. Desde cPanel File Manager, restaurar la copia de resguardo de `/certificados_staging/` si existía.
4. Si era primera instalación, retirar o renombrar la carpeta nueva.
5. Verificar `GET /certificados_staging/api/health` cuando corresponda.
6. Confirmar que `/certificados/` no fue modificado.

El rollback de staging no debe tocar producción ni reutilizar archivos productivos sin revisión.

## Plan de reversión documental

Para revertir este ciclo:

1. Revertir los cambios locales del PR (PHP, Angular, `deploy/staging/`, este runbook).
2. Descartar el delta OpenSpec del cambio `deploy-staging-cpanel-ejecucion`.

No hay reversión de servidor porque este ciclo no modifica cPanel ni producción.

## Trazabilidad OpenSpec

| Requisito | Sección verificable |
|---|---|
| Preparación local ejecutable para staging | `Preparación local`, `Build Angular de staging`, `API PHP compatible` |
| Paquete versionable de staging | `Paquete revisable`, `deploy/staging/MANIFIESTO.md` |
| Gates humanos para ejecución real | `Gates humanos`, `deploy/staging/CHECKLIST.md` |
| Guía documental de staging separada (MODIFIED) | Este documento completo, distinto de `00-cpanel-certificados.md` |
| Configuración externa separada de staging | `Configuración externa de staging` |
| Dependencias Composer sin versionar `vendor/` | `Dependencias Composer para staging` |
| PDFs de staging protegidos | `Almacenamiento de PDFs de staging` |

Spec vigente: [`openspec/specs/deploy-cpanel-certificados/spec.md`](../../openspec/specs/deploy-cpanel-certificados/spec.md). Delta archivado: [`openspec/changes/archive/2026-07-01-deploy-staging-cpanel-ejecucion/specs/deploy-cpanel-certificados/spec.md`](../../openspec/changes/archive/2026-07-01-deploy-staging-cpanel-ejecucion/specs/deploy-cpanel-certificados/spec.md).

## Preguntas abiertas

- [ ] Confirmar si el staging futuro usará definitivamente `/certificados_staging/` en el dominio principal o un subdominio.
- [ ] Confirmar quién aprueba la ventana operativa futura.
- [ ] Confirmar ruta externa final de `CERTIFICADOS_CONFIG_PATH` para staging.
- [ ] Confirmar Composer en hosting o subida operativa de `vendor/`.
- [ ] Confirmar si SMTP queda en `stub` o usa SMTP de prueba.
