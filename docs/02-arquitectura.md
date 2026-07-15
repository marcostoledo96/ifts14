# Arquitectura general

## Estado operativo P5-01

El candidato aislado de staging aprobó el runtime de autenticación el 2026-07-15. Producción no fue activada ni validada. La configuración usa `.user.ini` protegido con `auto_prepend_file` hacia bootstrap privado fuera del webroot, porque el host no dispone de `mod_env`/`SetEnv`. El esquema de staging es dedicado y vacío, con migraciones 001–010; la evidencia de permisos es sanitizada (`0600` para configuración y `0700` para directorios).

## Enfoque

Arquitectura modular por capas simples, ajustada a hosting cPanel.

No se busca una arquitectura pesada. Se busca separar responsabilidades para mantener el sistema mantenible.

## Estructura esperada

```txt
apps/frontend-angular/   Angular 20
apps/backend-php/        API PHP 8.4.21
database/                migraciones SQL y seeds ficticios
deploy/                  documentación y archivos de deploy cPanel
muestra_pagina/          referencia visual v0
```

## Frontend

- Angular 20.
- Organización por features.
- Servicios HTTP separados de componentes.
- Modelos tipados.
- Diseño inspirado en `muestra_pagina/`.
- Build con base href `/certificados/`.

## Backend

- PHP 8.4.21.
- API bajo `/certificados/api/` o ruta equivalente documentada.
- PDO con prepared statements.
- Separación mínima:
  - configuración;
  - rutas/controladores;
  - servicios/casos de uso;
  - repositorios/acceso a datos.

## Base de datos

- MariaDB 10.6.27.
- Migraciones SQL propias para el módulo.
- No modificar bases existentes sin documentación y backup.
- Preferir tablas con prefijo `cert_` para evitar colisiones.

## Deploy

El deploy inicial se hará manualmente por cPanel/File Manager, salvo que se confirme un flujo mejor.
