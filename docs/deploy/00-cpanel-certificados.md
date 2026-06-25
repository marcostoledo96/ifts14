# Deploy cPanel — /certificados/

## Objetivo

Publicar el módulo en:

```txt
https://ifts14.com.ar/certificados/
```

## Estructura esperada en cPanel

```txt
public_html/
└── certificados/
    ├── index.html
    ├── assets/
    ├── .htaccess
    └── api/
```

## Frontend Angular

Compilar localmente con:

```bash
ng build --configuration production --base-href /certificados/
```

Subir el contenido de `dist/...` a `public_html/certificados/`.

## Backend PHP

Subir API PHP a:

```txt
public_html/certificados/api/
```

## .htaccess

Debe permitir que Angular maneje rutas profundas y no capturar `/api/`.

## Seguridad

- No subir credenciales al repo.
- No tocar `public_html` sin backup.
- No sobrescribir la web oficial.
- Probar primero en carpeta aislada.

## Smoke aislado (`certificados_qa`)

Existe un paquete de humo local en `deploy/cpanel/certificados_qa_smoke/` para validar manualmente que cPanel sirve una carpeta aislada en `public_html/certificados_qa/`, que el fallback de raíz funciona y que la API responde `GET /api/health` sin tocar configuración ni PDO.

- Subida: manual por cPanel File Manager (comprimir el paquete en ZIP y extraer en `public_html/certificados_qa/`).
- No incluye credenciales reales, no valida certificados y no reemplaza al módulo final en `/certificados/`.
- Se debe eliminar `public_html/certificados_qa/` desde File Manager al terminar la prueba.
- Detalle operativo y comandos `curl.exe` en `deploy/cpanel/certificados_qa_smoke/README.md`.

### Resultado del smoke en cPanel real

**Veredicto: REMOTE VERIFY PASSED.** El usuario ejecutó el bloque de pruebas contra `https://ifts14.com.ar/certificados_qa/` y los siete casos respondieron según lo esperado: `200` en raíz y SPA-fallback, `200 application/json` en `/api/health`, `404` JSON controlado en `/api/no-existe`, `403` en `/api/src/Response.php` y `/api/config/certificados-config.example.php` (archivos no expuestos), y `405` con header `Allow: GET` en `POST /api/health`. Evidencia completa en `openspec/changes/archive/2026-06-25-certificados-qa-smoke-cpanel/verify-report.md`.

#### Advertencias no bloqueantes

- **Cuerpo HTML en respuestas 403**: cPanel entrega código HTTP 403 correcto y no expone archivos internos; el cuerpo de la respuesta es HTML del sitio principal, no JSON controlado por la API. Severidad WARNING no bloqueante. Mitigación futura opcional: `ErrorDocument 403` propio en `certificados_qa/.htaccess` o `certificados_qa/api/.htaccess`.
- **`php -l` local SKIPPED/BLOCKED**: el entorno local de la sesión de verify no tiene PHP instalado. No es falla del smoke cPanel de este ciclo. Permanece como pendiente para futuros ciclos del backend (p. ej. `backend-base-php-certificados`). No se instaló PHP en este ciclo por decisión explícita.

> Recordatorio: una vez validado, eliminar `public_html/certificados_qa/` desde cPanel File Manager para no dejar el paquete expuesto en producción.

## Hallazgos de auditoría (hipótesis)

- **Observado**: el material original incluye `.htaccess`, `.well-known/acme-challenge/`, `cgi-bin/`, zips de despliegue y logs.
- **Observado**: existe una carpeta con `.git/` interno dentro del material descargado; permanece bajo `material_privado_no_versionar/`.
- **Observado**: `browser.zip` y `api.zip` no fueron descomprimidos por seguridad.
- **Hipótesis**: el sitio actual combina frontend compilado y API PHP en una misma raíz pública compatible con cPanel/Apache.
