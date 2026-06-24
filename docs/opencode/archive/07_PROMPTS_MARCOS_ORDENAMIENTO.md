# Prompts OpenCode — Marcos — Ordenamiento inicial, backend, DB, cPanel

## Cómo usar esta guía

Copiar **un ciclo por vez** en OpenCode/Gentle-AI.

Cada ciclo debe:

1. leer documentación mínima;
2. planificar;
3. pedir aprobación;
4. ejecutar;
5. actualizar documentación;
6. proponer commit;
7. no commitear automáticamente.

## Ciclo M0-01 — Inicializar documentación segura del repo

**Rama sugerida:** `docs/kickoff-planificacion`  
**Objetivo:** crear estructura base segura y documentación inicial.

```txt
Ejecutá un ciclo SDD completo para inicializar la documentación segura del repositorio privado `ifts14`.

Rol:
Sos asistente de arquitectura, documentación y seguridad. No implementes todavía Angular ni PHP.

Contexto:
El repo privado `marcostoledo96/ifts14` va a contener el nuevo trabajo sobre el sitio del IFTS 14.
El stack confirmado es Angular 20, PHP 8.4.21 y MariaDB 10.6.27.
El hosting será cPanel y el módulo se publicará en `/certificados/`.

Reglas:
- No subir dumps SQL, ZIPs, backups, credenciales ni archivos sensibles.
- Crear una estructura clara y segura.
- Mantener documentación en español argentino formal.
- No hacer commit/push automáticamente.

Lectura mínima:
- README.md si existe.
- AGENTS.md si existe.
- GUIA.md si existe.
- Archivos de planificación que ya estén en la raíz si existen.

Tareas SDD:
1. Confirmar si existe estructura previa.
2. Crear o actualizar README.md, GUIA.md y AGENTS.md.
3. Crear docs/00-indice-general.md.
4. Crear .gitignore seguro.
5. Crear carpetas: docs, openspec, apps, database, deploy, muestra_pagina, material_privado_no_versionar.
6. Agregar README.md interno en material_privado_no_versionar explicando que no se versiona.
7. Agregar README.md en muestra_pagina explicando que será referencia de v0.
8. Documentar estructura esperada del proyecto.
9. Documentar que Marcos toma backend/db/deploy e integración, y Matías frontend Angular.
10. Documentar que OpenCode no debe commitear automáticamente.

Al finalizar:
- listá archivos creados/modificados;
- indicá si hay archivos sensibles detectados;
- proponé mensaje de commit;
- proponé comandos Git para primer commit.
```

## Ciclo M0-02 — Instalar skills y preparar Gentle-AI

**Rama sugerida:** `docs/skills-opencode`  
**Objetivo:** instalar skills útiles y documentarlas.

```txt
Ejecutá un ciclo SDD completo para instalar y documentar skills de OpenCode/Gentle-AI.

Rol:
Sos asistente de configuración del entorno de IA.

Contexto:
El proyecto usará Angular 20, PHP 8.4, MariaDB, cPanel, UI/UX cuidada, TDD y SDD.

Tareas:
1. Revisar si existe .agents/, .opencode/ o configuración de skills.
2. Instalar skills recomendadas usando npx skills add.
3. Ejecutar gentle-ai skill-registry refresh.
4. Ejecutar gentle-ai doctor si está disponible.
5. Crear docs/05-skills-dependencias.md o actualizarlo.
6. Documentar qué skill usar para cada tipo de tarea.
7. Si alguna skill falla al instalar, registrarlo como pendiente y no bloquear el ciclo.

Skills recomendadas:
- https://github.com/angular/skills
- frontend-design
- web-design-guidelines
- extract-design-system
- design-taste-frontend
- high-end-visual-design
- stitch-design-taste
- improve-codebase-architecture
- tdd
- to-issues
- webapp-testing
- verification-before-completion
- systematic-debugging
- finishing-a-development-branch

Reglas:
- No instalar skills dudosas sin pedir aprobación.
- No permitir que una skill cambie archivos del proyecto sin revisar.
- Documentar todo en español argentino formal.

Al finalizar:
- listá skills instaladas;
- listá skills que fallaron;
- indicá archivos modificados;
- proponé commit.
```

## Ciclo M0-03 — Inventariar material descargado del servidor

**Rama sugerida:** `docs/auditoria-servidor`  
**Objetivo:** estudiar archivos descargados sin exponer secretos.

```txt
Ejecutá un ciclo SDD completo para inventariar el material descargado desde cPanel.

Rol:
Sos asistente de auditoría técnica y seguridad.

Contexto:
En `material_privado_no_versionar/` voy a dejar:
- ZIP descargado desde el servidor;
- dumps SQL;
- archivos actuales del sitio;
- posible código Angular compilado;
- API PHP existente.

Reglas estrictas:
- No copiar credenciales a documentación.
- No copiar tokens.
- No copiar contenido sensible de logs.
- No versionar dumps SQL.
- No versionar ZIPs.
- No versionar carpetas .git internas descargadas.
- Si encontrás secretos, registrá “se detectaron credenciales” sin revelar valores.

Lectura mínima:
- AGENTS.md.
- docs/00-indice-general.md.
- material_privado_no_versionar/ solo para auditoría local.
- .gitignore.

Tareas:
1. Inspeccionar estructura del ZIP descargado.
2. Detectar si hay Angular compilado, assets, api PHP, .htaccess, logs, configs.
3. Generar docs/auditoria/inventario-servidor.md.
4. Generar docs/auditoria/riesgos-seguridad.md.
5. Generar docs/auditoria/arquitectura-sitio-actual.md.
6. Confirmar qué NO debe subirse a Git.
7. Actualizar .gitignore si hace falta.
8. Proponer plan de sanitización.

Al finalizar:
- listá hallazgos sin secretos;
- listá archivos creados/modificados;
- listá riesgos;
- proponé commit.
```

## Ciclo M0-04 — Analizar bases MariaDB descargadas

**Rama sugerida:** `docs/auditoria-bases-datos`  
**Objetivo:** documentar las dos bases sin versionar dumps.

```txt
Ejecutá un ciclo SDD completo para analizar las bases MariaDB descargadas.

Rol:
Sos asistente de análisis de base de datos y arquitectura.

Contexto:
Hay dos dumps:
- ifts14_dev.sql.gz
- ifts14_db.sql.gz

Ambos están en material_privado_no_versionar/db_dumps_originales/.
No deben versionarse.

Tareas:
1. Leer estructura de tablas sin exponer datos sensibles.
2. Identificar tablas, columnas y relaciones probables.
3. Determinar cuál parece más actual/completa.
4. Documentar si conviene reutilizar alguna base o crear tablas nuevas prefijadas.
5. Crear docs/database/00-auditoria-bases-existentes.md.
6. Crear docs/database/01-modelo-certificados-mariadb.md con propuesta de tablas nuevas.
7. Proponer prefijo `cert_` para evitar colisiones.
8. Proponer migraciones SQL futuras en database/migrations/.

Reglas:
- No copiar registros reales.
- No copiar datos personales.
- No versionar dumps.
- No modificar dumps originales.
- No ejecutar migraciones reales todavía.

Al finalizar:
- listá tablas detectadas;
- listá decisión recomendada;
- listá archivos modificados;
- proponé commit.
```

## Ciclo M0-05 — Planificar arquitectura Angular/PHP/MariaDB

**Rama sugerida:** `docs/arquitectura-angular-php-mariadb`  
**Objetivo:** documentar la arquitectura final.

```txt
Ejecutá un ciclo SDD completo para documentar la arquitectura técnica final del módulo `/certificados/`.

Rol:
Sos asistente de arquitectura.

Stack confirmado:
- Angular 20.
- PHP 8.4.21.
- MariaDB 10.6.27.
- cPanel.
- Deploy en /certificados/.

Tareas:
1. Crear docs/02-arquitectura.md.
2. Crear docs/frontend/00-angular20.md.
3. Crear docs/backend/00-php84-api.md.
4. Crear docs/database/02-migraciones-certificados.md.
5. Crear docs/deploy/00-cpanel-certificados.md.
6. Definir estructura apps/frontend-angular y apps/backend-php.
7. Definir API base `/certificados/api/`.
8. Definir que Angular se compila con base href `/certificados/`.
9. Definir `.htaccess` para Angular Router y exclusión de API.
10. Definir seguridad mínima.

Al finalizar:
- listá documentos creados;
- listá decisiones;
- listá pendientes;
- proponé commit.
```

## Ciclo M0-06 — Preparar primer commit seguro

**Rama sugerida:** `main` si el repo está vacío, o `docs/kickoff-planificacion` si ya existe commit.  
**Objetivo:** dejar el primer commit seguro.

```txt
Ejecutá un ciclo SDD completo para preparar el primer commit seguro del repositorio.

Rol:
Sos asistente de control de calidad documental y seguridad Git.

Tareas:
1. Revisar git status.
2. Revisar .gitignore.
3. Confirmar que material_privado_no_versionar/ está ignorado.
4. Confirmar que no se están versionando .sql, .sql.gz, .zip, error_log, .env, config real, db.php real ni carpetas .git internas.
5. Confirmar que README.md, GUIA.md, AGENTS.md y docs/ existen.
6. Confirmar que muestra_pagina/ tiene README y no contiene secretos.
7. Proponer comandos exactos para primer commit.
8. No ejecutar commit automáticamente.

Comandos esperados:
git status --ignored
git add README.md GUIA.md AGENTS.md .gitignore docs openspec apps database deploy muestra_pagina scripts
git status
git commit -m "docs: inicializar planificación y estructura del proyecto"
git push -u origin main

Al finalizar:
- indicar si es seguro commitear;
- listar archivos a agregar;
- listar archivos ignorados sensibles;
- proponer mensaje de commit final.
```
