# Apply progress — backend-base-php-certificados

## Estado

Parcial: implementación M2-02 creada, QA PHP/HTTP bloqueada porque el binario `php` no está instalado en esta sesión.

## Archivos modificados

| Archivo | Acción | Detalle |
|---|---|---|
| `apps/backend-php/index.php` | Creado | Front controller con `/health`, 404, 405 y 500 seguro. |
| `apps/backend-php/src/Response.php` | Creado | Helper JSON con envelope `data/meta` y `error/meta`. |
| `apps/backend-php/src/Config.php` | Creado | Carga config externa desde `CERTIFICADOS_CONFIG_PATH` o ruta externa documentada. |
| `apps/backend-php/src/Database.php` | Creado | Fábrica PDO lazy con opciones seguras y `utf8mb4`. |
| `apps/backend-php/config/certificados-config.example.php` | Creado | Config ficticia, sin credenciales reales. |
| `apps/backend-php/.htaccess` | Creado | `FallbackResource` mínimo para Apache. |
| `apps/backend-php/README.md` | Creado | Guía de estructura, config externa y QA manual. |
| `openspec/changes/backend-base-php-certificados/tasks.md` | Actualizado | Marcadas tareas implementadas y `git status` ejecutado. |

## Tareas completadas

- [x] 1.1 Front controller `index.php`.
- [x] 1.2 Helper `Response.php`.
- [x] 1.3 404 y 405 con `Allow: GET`.
- [x] 1.4 `.htaccess` local de backend.
- [x] 2.1 `Config.php` con config externa.
- [x] 2.2 `Database.php` con PDO lazy.
- [x] 2.3 Config example ficticia.
- [x] 2.4 `/health` no carga `Config` ni `Database`.
- [x] 3.1 README backend.
- [x] 3.2 Nota para archive: actualizar `docs/backend/00-php84-api.md` y validar `docs/02-arquitectura.md`.
- [x] 3.3 No se tocaron rutas prohibidas de deploy, `.atl/skill-registry.md` ni `.gitignore`.
- [x] 4.1 `git status --ignored --short` ejecutado.

## QA ejecutado

### `git status --ignored --short`

Resultado:

```txt
 M .atl/skill-registry.md
 M .gitignore
?? apps/backend-php/.htaccess
?? apps/backend-php/README.md
?? apps/backend-php/config/
?? apps/backend-php/index.php
?? apps/backend-php/src/
?? openspec/changes/backend-base-php-certificados/
!! .atl/.skill-registry.cache.json
!! material_privado_no_versionar/
```

No aparecen `config.php`, `db.php`, `database.php` ni `conexion.php` reales versionados.

### `php -l` sobre archivos creados

Comando intentado:

```bash
php -l "apps/backend-php/index.php" && php -l "apps/backend-php/src/Response.php" && php -l "apps/backend-php/src/Config.php" && php -l "apps/backend-php/src/Database.php" && php -l "apps/backend-php/config/certificados-config.example.php"
```

Resultado:

```txt
/bin/bash: línea 1: php: orden no encontrada
```

### `php -m`

Resultado:

```txt
/bin/bash: línea 1: php: orden no encontrada
```

No fue posible confirmar `pdo_mysql`, `openssl` ni `mbstring` porque PHP no está instalado en el entorno de ejecución.

### Smoke HTTP

Comando intentado:

```bash
php -S 127.0.0.1:8080 -t apps/backend-php
```

Resultado:

```txt
/bin/bash: línea 1: php: orden no encontrada
```

No fue posible iniciar el servidor embebido ni ejecutar `curl` contra `/health`.

## Cobertura

- Cubierto por implementación: `/health` 200, 405 para métodos no GET, 404 seguro, 500 seguro, carga de config externa diferida, fábrica PDO lazy.
- Cubierto por inspección: `index.php` sólo requiere `Response.php`; no carga `Config.php`, `Database.php` ni PDO en `/health`.
- No cubierto por ejecución: lint PHP, extensiones PHP y smoke HTTP por ausencia local de `php`.

## Riesgos

- Requiere verificación en un entorno con PHP 8.4.21 y extensiones `pdo_mysql`, `openssl`, `mbstring` instaladas antes de cerrar `sdd-verify`.
- El servidor embebido de PHP no procesa `.htaccess`; si se necesita probar rutas limpias localmente puede requerir router explícito o Apache local.

## Workload / PR boundary

- Modo: chained PR slice, estrategia `stacked-to-main` provista por el orquestador.
- Unidad actual: M2-02 backend base completo.
- Límite: desde `apps/backend-php/AGENTS.md` existente hasta base PHP mínima con README y apply notes.
- Impacto estimado: dentro del presupuesto de 800 líneas; sin tocar rutas prohibidas.
