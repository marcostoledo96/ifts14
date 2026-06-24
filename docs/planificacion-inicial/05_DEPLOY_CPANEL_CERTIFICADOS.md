# Deploy en cPanel para `/certificados/`

## Ruta final

```txt
https://ifts14.com.ar/certificados/
```

## Estrategia inicial

No usar Git en cPanel al principio.

Primero:

1. Compilar Angular localmente.
2. Preparar backend PHP localmente.
3. Crear ZIP de despliegue.
4. Subir por File Manager.
5. Extraer en `public_html/certificados/`.
6. Importar SQL por phpMyAdmin.
7. Probar rutas.

## Build Angular

Desde el repo:

```bash
cd apps/frontend-angular
npm install
ng build --configuration production --base-href /certificados/
```

El output estará en `dist/...`.

## `.htaccess` dentro de `/certificados/`

Archivo:

```txt
public_html/certificados/.htaccess
```

Contenido sugerido:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /certificados/

  # No capturar API PHP
  RewriteRule ^api/ - [L]

  # Servir archivos y carpetas reales
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  # Rutas Angular
  RewriteRule ^ index.html [L]
</IfModule>
```

## Por qué hace falta

Angular maneja rutas del lado del cliente. Si alguien abre:

```txt
/certificados/validar/abc123
```

Apache puede buscar una carpeta real y devolver 404. El `.htaccess` debe enviar esas rutas a `index.html`, pero sin capturar `/api/`.

## Estructura final en cPanel

```txt
public_html/certificados/
├── index.html
├── assets/
├── media/
├── .htaccess
└── api/
    ├── index.php
    ├── src/
    └── config/
```

## Checklist antes de tocar servidor

- Backup de `public_html`.
- Backup de bases de datos.
- Confirmar que `public_html/certificados/` no existe o está vacío.
- Confirmar PHP 8.4 en MultiPHP Manager.
- Confirmar base MariaDB.
- Crear usuario/base desde cPanel MySQL Databases.
- Probar en una carpeta temporal si es posible.

## Importar SQL

Usar phpMyAdmin para importar migraciones controladas desde:

```txt
database/migrations/
database/seeds/
```

No importar dumps completos sin revisar.

## Deploy manual con File Manager

1. Crear build local.
2. Crear ZIP con contenido de `dist` + `api`.
3. Entrar a cPanel → File Manager.
4. Ir a `public_html/certificados/`.
5. Upload ZIP.
6. Extract.
7. Verificar permisos.
8. Probar `/certificados/`.
9. Probar `/certificados/validar/demo`.
10. Probar `/certificados/api/health`.

## Pendientes

- Confirmar si Composer está disponible.
- Confirmar email.
- Confirmar SSL/HTTPS.
- Confirmar si Git Version Control se usará más adelante.
