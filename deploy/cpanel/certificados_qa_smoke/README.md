# Smoke cPanel — certificados_qa

Paquete mínimo para probar manualmente que cPanel sirve una carpeta aislada en `public_html/certificados_qa/`, que el fallback de rutas funciona y que la API responde `GET /api/health` sin conexión a base de datos.

## Alcance

- No incluye credenciales reales.
- No incluye dumps ni logs.
- No valida certificados.
- No requiere dependencias ni conexión a base de datos para `/api/health`.
- No reemplaza el módulo final en `/certificados/`.

## Generar el ZIP local

Desde la raíz del repositorio:

```bash
cd deploy/cpanel/certificados_qa_smoke
zip -r certificados_qa_smoke.zip . -x "certificados_qa_smoke.zip"
```

El ZIP debe contener directamente `index.html`, `.htaccess` y `api/`, sin una carpeta superior adicional.

## Subir en cPanel File Manager

1. Entrar a cPanel File Manager.
2. Crear la carpeta `public_html/certificados_qa/` si no existe.
3. Subir `certificados_qa_smoke.zip` dentro de `public_html/certificados_qa/`.
4. Extraer el ZIP en esa misma carpeta.
5. Verificar permisos habituales: archivos `644` y carpetas `755`.

## URLs de prueba

| URL | Resultado esperado |
|---|---|
| `https://ifts14.com.ar/certificados_qa/` | Muestra la página estática de smoke. |
| `https://ifts14.com.ar/certificados_qa/validar/ABC123` | Muestra la misma página por fallback. No valida certificados. |
| `https://ifts14.com.ar/certificados_qa/api/health` | Responde JSON con `status: ok` y `service: certificados-api`. |
| `https://ifts14.com.ar/certificados_qa/api/no-existe` | Responde JSON 404 `NOT_FOUND`. |
| `https://ifts14.com.ar/certificados_qa/api/src/Response.php` | Debe bloquear acceso directo. |
| `https://ifts14.com.ar/certificados_qa/api/config/certificados-config.example.php` | Debe bloquear acceso directo. |

## Pruebas con Windows PowerShell

```powershell
curl.exe -i https://ifts14.com.ar/certificados_qa/
curl.exe -i https://ifts14.com.ar/certificados_qa/validar/ABC123
curl.exe -i https://ifts14.com.ar/certificados_qa/api/health
curl.exe -i https://ifts14.com.ar/certificados_qa/api/no-existe
curl.exe -i https://ifts14.com.ar/certificados_qa/api/src/Response.php
curl.exe -i https://ifts14.com.ar/certificados_qa/api/config/certificados-config.example.php
```

## Notas de seguridad

- El archivo `api/config/certificados-config.example.php` contiene valores ficticios y no debe usarse en producción.
- La configuración real debe quedar fuera del repositorio y fuera de este paquete.
- La subida es manual; este repositorio no publica ni sube archivos a cPanel.
- Si la prueba finalizó, eliminar `public_html/certificados_qa/` desde File Manager para no dejar el paquete de humo activo.
