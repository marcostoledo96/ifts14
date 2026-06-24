# Arquitectura propuesta — Angular 20 + PHP 8.4 + MariaDB

## Decisión técnica

```txt
Frontend: Angular 20
Backend: PHP 8.4.21
Base de datos: MariaDB 10.6.27
Hosting: cPanel
Ruta: /certificados/
```

## Objetivo arquitectónico

Crear un módulo aislado para certificados que pueda convivir con la web oficial sin romperla.

```txt
https://ifts14.com.ar/certificados/
```

## Estructura final esperada en servidor

```txt
public_html/
├── sitio actual del IFTS 14
└── certificados/
    ├── index.html
    ├── assets/
    ├── .htaccess
    └── api/
        ├── index.php
        ├── src/
        ├── public/
        └── config/
```

## Frontend Angular

Ubicación en repo:

```txt
apps/frontend-angular/
```

Responsable: Matías.

Principios:

- Angular 20.
- Tailwind.
- Organización por features.
- Componentes standalone si aplica.
- Diseños portados desde `muestra_pagina/`.
- No copiar Next.js ni React literalmente.
- Servicios preparados para consumir API PHP.
- Primero usar mocks/fixtures.
- Luego conectar endpoints reales.

Estructura sugerida:

```txt
apps/frontend-angular/src/app/
├── publico/
│   └── validacion/
├── admin/
│   ├── login/
│   ├── dashboard/
│   ├── cursos/
│   ├── asistencias/
│   └── certificaciones/
├── compartido/
│   ├── componentes/
│   ├── modelos/
│   ├── servicios/
│   └── mocks/
└── app.routes.ts
```

## Backend PHP

Ubicación en repo:

```txt
apps/backend-php/
```

Responsable: Marcos.

Principios:

- PHP 8.4.21.
- API bajo `/certificados/api/`.
- PDO con prepared statements.
- No framework inicialmente salvo decisión posterior.
- Separación liviana:
  - dominio;
  - casos de uso;
  - infraestructura;
  - presentación HTTP.
- Sin secretos en repo.
- Logs sin DNI completo ni tokens completos.
- Respuestas JSON consistentes.

Estructura sugerida:

```txt
apps/backend-php/
├── public/
│   └── index.php
├── src/
│   ├── Dominio/
│   ├── Aplicacion/
│   ├── Infraestructura/
│   └── Presentacion/
├── config/
│   ├── config.example.php
│   └── .gitkeep
└── tests/
```

## Base de datos

Ubicación en repo:

```txt
database/
├── migrations/
├── seeds/
└── docs/
```

Reglas:

- No versionar dumps reales.
- Crear migraciones SQL controladas.
- Nombres de tablas en español.
- Prefijo sugerido para evitar colisiones:

```txt
cert_
```

Ejemplos:

```txt
cert_alumnos
cert_cursos
cert_fechas_curso
cert_asistencias
cert_certificaciones
cert_envios
cert_usuarios_admin
cert_auditoria
```

## API conceptual

```txt
GET    /certificados/api/validar/{token}
POST   /certificados/api/admin/login
GET    /certificados/api/admin/dashboard
POST   /certificados/api/admin/cursos
PATCH  /certificados/api/admin/cursos/{id}
POST   /certificados/api/admin/asistencias
POST   /certificados/api/admin/certificaciones
GET    /certificados/api/admin/certificaciones/{id}
POST   /certificados/api/admin/certificaciones/{id}/reenviar
POST   /certificados/api/admin/certificaciones/{id}/revocar
GET    /certificados/api/admin/certificaciones/{id}/pdf
```

## Seguridad mínima

- Tokens opacos, aleatorios y largos.
- Guardar hash del token, no token plano.
- Prepared statements con PDO.
- No exponer datos si token no existe.
- Validar entradas.
- Sesión admin segura.
- No guardar DNI ni token completo en logs.
- No subir credenciales al repo.
- Config real fuera del control de versiones.
