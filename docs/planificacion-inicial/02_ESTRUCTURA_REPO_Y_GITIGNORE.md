# Estructura de repo y `.gitignore`

## Estructura propuesta

```txt
ifts14/
├── README.md
├── GUIA.md
├── AGENTS.md
├── .gitignore
├── docs/
│   ├── 00-indice-general.md
│   ├── 01-contexto-decisiones.md
│   ├── 02-arquitectura.md
│   ├── 03-seguridad-sanitizacion.md
│   ├── 04-deploy-cpanel.md
│   ├── 05-skills-dependencias.md
│   ├── frontend/
│   ├── backend/
│   ├── database/
│   ├── opencode/
│   └── auditoria/
├── openspec/
│   ├── AGENTS.md
│   ├── 00-indice-specs.md
│   └── specs/
├── apps/
│   ├── AGENTS.md
│   ├── frontend-angular/
│   │   └── AGENTS.md
│   └── backend-php/
│       └── AGENTS.md
├── database/
│   ├── AGENTS.md
│   ├── migrations/
│   ├── seeds/
│   └── docs/
├── deploy/
│   ├── AGENTS.md
│   ├── cpanel/
│   └── htaccess/
├── muestra_pagina/
│   └── README.md
├── scripts/
│   └── AGENTS.md
└── material_privado_no_versionar/
    └── README.md
```

## Razón de esta estructura

- `docs/` contiene decisiones y planificación.
- `openspec/` contiene specs SDD.
- `apps/frontend-angular/` será la app Angular 20.
- `apps/backend-php/` será la API PHP.
- `database/` tendrá SQL controlado, no dumps reales.
- `deploy/` tendrá guías y plantillas para cPanel.
- `muestra_pagina/` tendrá la referencia de v0.
- `material_privado_no_versionar/` guarda material sensible local.

## `.gitignore` recomendado

Ver `plantillas/.gitignore`.

Puntos importantes:

- Ignorar dumps SQL.
- Ignorar zips/backups.
- Ignorar credenciales.
- Ignorar carpetas `.git` internas que vengan del servidor.
- Ignorar `material_privado_no_versionar/`.
- Ignorar `node_modules`, `.next`, `dist`, Angular cache.
- Ignorar logs.

## Regla de oro

Antes de cada commit:

```bash
git status --ignored
```

Y revisar que no aparezcan:

```txt
.sql
.sql.gz
.zip
error_log
.env
db.php
database.php
config.php
material_privado_no_versionar/
```

## Archivos `.example`

Si el backend necesita configuración, crear:

```txt
apps/backend-php/config/config.example.php
```

No crear:

```txt
apps/backend-php/config/config.php
```

con credenciales reales versionadas.
