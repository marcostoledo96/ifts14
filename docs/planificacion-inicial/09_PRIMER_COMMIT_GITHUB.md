# Primer commit seguro al repositorio privado `ifts14`

## Repositorio

```txt
https://github.com/marcostoledo96/ifts14
```

## Opción A — Repo vacío

```bash
git clone https://github.com/marcostoledo96/ifts14.git
cd ifts14
```

Copiar al repo:

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
muestra_pagina/
scripts/
```

Crear carpeta local ignorada:

```bash
mkdir -p material_privado_no_versionar/servidor_original
mkdir -p material_privado_no_versionar/db_dumps_originales
```

Mover ahí los archivos privados:

```txt
well-known.zip
ifts14_dev.sql.gz
ifts14_db.sql.gz
```

No agregarlos a Git.

## Revisar antes del commit

```bash
git status --ignored
```

No debe aparecer para agregar:

```txt
*.sql
*.sql.gz
*.zip
error_log
.env
db.php
database.php
config.php
material_privado_no_versionar/
```

## Primer commit

```bash
git add README.md GUIA.md AGENTS.md .gitignore docs openspec apps database deploy muestra_pagina scripts
git status
git commit -m "docs: inicializar planificación y estructura del proyecto"
git push -u origin main
```

## Después del primer commit

Crear rama de trabajo para auditoría:

```bash
git checkout -b docs/auditoria-servidor-cpanel
```

Ejecutar el ciclo M0-03 desde:

```txt
07_PROMPTS_MARCOS_ORDENAMIENTO.md
```

## Si el repo ya tiene commits

```bash
git checkout main
git pull origin main
git checkout -b docs/kickoff-planificacion
git add README.md GUIA.md AGENTS.md .gitignore docs openspec apps database deploy muestra_pagina scripts
git commit -m "docs: agregar planificación inicial del proyecto"
git push -u origin docs/kickoff-planificacion
gh pr create --base main --head docs/kickoff-planificacion --title "docs: planificación inicial" --body "Agrega documentación, estructura, guías y prompts iniciales para organizar el proyecto IFTS14."
```

## Regla

No usar:

```bash
git add .
```

hasta haber revisado muy bien que no haya secretos.

Para el primer commit, usar `git add` explícito.
