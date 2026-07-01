# Progreso de aplicación: staging cPanel para certificados

## Estado

| Campo | Resultado |
|---|---|
| Cambio | `staging-cpanel-certificados` |
| Modo | Standard, docs-only |
| Estrategia | Single PR aprobado por Marcos |
| Presupuesto | 250-350 líneas estimadas, bajo el límite aprobado de 800 |
| TDD estricto | No aplica: `openspec/config.yaml` define `strict_tdd: false` y no hay runner formal |

## Tareas completadas

- [x] 1.1 Confirmación de guía productiva y `deploy/README.md`.
- [x] 1.2 Confirmación de rama `deploy/staging-cpanel-certificados`; el estado inicial contenía artefactos SDD activos sin trackear.
- [x] 1.3 Trazabilidad de requisitos ADDED hacia la guía nueva.
- [x] 2.1-2.6 Guía documental de staging creada con objetivo, alcance, rutas, estructura, checklist, configuración ficticia, smoke, rollback, reversión documental y preguntas abiertas.
- [x] 3.1-3.2 `deploy/README.md` enlaza la guía de staging y separa staging de producción.
- [x] 4.1-4.6 Path checks, scan restringido equivalente, scan de credenciales, cross-reference, trazabilidad y enlaces relativos validados.
- [x] 5.1-5.2 `tasks.md` sigue bajo 530 palabras y no incorpora prosa especulativa ni capturas.

## Pendiente

- [ ] 5.3 Cerrar con `sdd-archive` después de `sdd-verify`.

## Archivos modificados

| Archivo | Acción | Descripción |
|---|---|---|
| `docs/deploy/01-staging-cpanel-certificados.md` | Creado | Guía de staging para `/certificados_staging/`, separada de producción `/certificados/`. |
| `deploy/README.md` | Modificado | Agrega enlace a staging y nota de separación de rutas. |
| `openspec/changes/staging-cpanel-certificados/tasks.md` | Modificado | Marca tareas completadas durante apply; deja archive pendiente. |
| `openspec/changes/staging-cpanel-certificados/apply-progress.md` | Creado | Evidencia acumulada de implementación y verificación. |

## Verificación ejecutada

| Comando / revisión | Resultado |
|---|---|
| `git branch --show-current` | `deploy/staging-cpanel-certificados`. |
| `git status --short --untracked-files=all` antes de editar | Rama con artefactos SDD activos sin trackear; sin modificaciones rastreadas previas fuera del cambio. |
| Path check con `test` y Python | Guía nueva, guía productiva, README, config example y delta spec existen; `deploy/staging` no existe. |
| Scan restringido con `rg` | Bloqueado: `rg` no está instalado en este entorno. |
| Scan restringido equivalente con Python | Sin coincidencias en `docs/deploy/01-staging-cpanel-certificados.md` ni `deploy/README.md`. |
| Scan de credenciales con Python | Sin IPs, rutas privadas reales, dominio real ni asignaciones sospechosas. |
| Conteo de rutas staging/producción | `/certificados_staging/` aparece explícito en la guía y README; `/certificados/` queda identificado como producción. |
| Conteo de palabras de `tasks.md` | 468 palabras. |

## Escenarios cubiertos

- Guía separada para `/certificados_staging/` y distinción explícita de `/certificados/`.
- Ciclo documental sin deploy, uploads ni cambios en cPanel.
- Checklist seguro para paquete futuro con exclusión de material sensible o no verificable.
- Configuración de staging solo con placeholders y `public_base_url` de staging.
- Smoke checks con datos ficticios para health, frontend, token inexistente e internos API.
- Rollback manual limitado a staging mediante copia de resguardo/restauración desde cPanel File Manager.

## Escenarios no cubiertos

- No se hizo deploy real ni smoke remoto.
- No se creó paquete ejecutable ni carpeta de plantillas.
- No se ejecutó `sdd-archive`; queda para después de verify.

## Desviaciones y notas

- Para sostener el scan restringido, la guía usa términos descriptivos en español para exclusiones sensibles en lugar de repetir rutas o nombres que el propio scan debe bloquear.
- El chequeo con `rg` no pudo ejecutarse porque la herramienta no existe en el entorno; se reemplazó por un scan Python equivalente y reproducible.
- La tarea 1.2 se considera operativamente satisfecha con rama correcta y estado inicial conocido: los archivos sin trackear correspondían al ciclo SDD activo.
