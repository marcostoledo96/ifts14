# Guía de arranque — Repositorio privado `ifts14`

## Objetivo

Este repositorio privado será el espacio de trabajo para estudiar el sitio actual del IFTS 14 y preparar el nuevo módulo:

```txt
/certificados/
```

El módulo final deberá convivir con la web actual dentro del mismo hosting cPanel.

## Stack confirmado

```txt
Frontend: Angular 20
Backend: PHP 8.4.21
Base de datos: MariaDB 10.6.27
Hosting: cPanel
Base de datos visual: phpMyAdmin
Ruta de publicación: /certificados/
```

## Responsabilidades actualizadas

### Marcos

Marcos se encarga de:

- backend PHP;
- base de datos MariaDB;
- integración frontend/backend;
- deploy en cPanel;
- documentación;
- arquitectura;
- seguridad;
- planificación con OpenCode/Gentle-AI;
- revisión de contratos y prompts.

### Matías

Matías se encarga de:

- frontend Angular 20;
- portar el diseño generado en v0 desde `muestra_pagina/`;
- optimizar UI/UX;
- respetar identidad visual institucional;
- implementar componentes Angular;
- mantener responsive, accesibilidad y calidad visual.

## Carpetas importantes

```txt
ifts14/
├── README.md
├── GUIA.md
├── AGENTS.md
├── docs/
├── openspec/
├── apps/
│   ├── frontend-angular/
│   └── backend-php/
├── database/
├── deploy/
├── muestra_pagina/
├── material_privado_no_versionar/
└── scripts/
```

## Carpeta `muestra_pagina/`

Esta carpeta contendrá el diseño generado por v0, probablemente en Next.js/React/Tailwind.

Reglas:

- Matías la usa como referencia visual.
- No se copia React literalmente.
- Se porta a Angular 20 + Tailwind.
- Se puede mejorar el diseño si ayuda a calidad, performance o accesibilidad.
- No debe cambiar el comportamiento funcional acordado.
- Si incluye `.env`, `.next`, `node_modules` o secretos, no se versionan.

## Carpeta `material_privado_no_versionar/`

Esta carpeta es local y no debe subirse a GitHub.

Debe contener:

```txt
material_privado_no_versionar/
├── servidor_original/
├── db_dumps_originales/
├── backups_cpanel/
└── notas_privadas/
```

Ahí vas a poner:

- ZIP descargado desde cPanel;
- dumps `.sql` o `.sql.gz`;
- archivos reales del servidor;
- backups;
- capturas con datos sensibles;
- credenciales temporales.

## Qué se commitea

Sí se commitea:

- documentación;
- estructuras de carpetas;
- `.gitignore`;
- plantillas `.example`;
- contratos sanitizados;
- diagramas sin secretos;
- código propio.

No se commitea:

- dumps reales;
- backups;
- archivos con credenciales;
- `error_log`;
- zips de cPanel;
- carpetas `.git` descargadas del servidor;
- `node_modules`;
- `.next`;
- `dist`;
- `.env`;
- claves SMTP;
- credenciales de cPanel;
- credenciales de MariaDB.

## Flujo de trabajo

1. Crear rama.
2. Ejecutar un ciclo SDD chico.
3. OpenCode primero planifica.
4. Marcos/Matías aprueban.
5. OpenCode implementa o documenta.
6. Se revisan archivos modificados.
7. Se actualiza documentación.
8. Commit manual.
9. Push.
10. PR.
11. Merge solo si cumple criterios.

## Primer objetivo

El primer commit debe dejar el repo listo para trabajar, sin subir código sensible.

Debe incluir:

```txt
README.md
GUIA.md
AGENTS.md
.gitignore
docs/
openspec/
apps/
database/
deploy/
muestra_pagina/README.md
material_privado_no_versionar/README.md
```
