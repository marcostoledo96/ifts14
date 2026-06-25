# Apply Progress — php84-docker-runtime

## Estado

- Modo: Standard apply.
- Persistencia: OpenSpec + Engram.
- Alcance: entorno local Docker PHP 8.4 y documentación mínima.
- Strict TDD: no activo; no hay runner de tests y el cambio crea herramientas locales de verificación.

## Tareas completadas

- [x] Crear `docker/php84/Dockerfile` con imagen oficial `php:8.4-cli` y extensiones requeridas.
- [x] Crear `docker/php84/README.md` con uso, alcance y verificaciones.
- [x] Crear `scripts/php-docker-build.sh` con `sudo docker build`.
- [x] Crear `scripts/php-docker-version.sh` con `sudo docker run` para `php -v`.
- [x] Crear `scripts/php-docker-modules-check.sh` para validar módulos requeridos.
- [x] Crear `scripts/php-docker-lint.sh` para ejecutar `php -l` solo sobre `apps/backend-php/`.
- [x] Actualizar `apps/backend-php/README.md` con una sección breve de QA local con Docker PHP 8.4.

## Verificación realizada

- [x] Lectura de plan y documentación mínima del proyecto.
- [x] Revisión de alcance: no se modificó lógica de producto, endpoints, credenciales ni configuración real.
- [ ] Docker build: pendiente; Marcos lo ejecutará localmente.
- [ ] Verificación de versión/módulos/lint dentro del contenedor: pendiente; Marcos lo ejecutará localmente.

## Desvíos

Ninguno. Se mantuvo el plan mínimo sin Docker Compose, Makefile, CI ni wrappers adicionales.

## Riesgos abiertos

- La validez final del Dockerfile y de los módulos queda pendiente hasta ejecutar `bash scripts/php-docker-build.sh` y los scripts de verificación en una máquina con Docker disponible.
