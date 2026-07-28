# Cierre documental y mantenimiento

## Objetivo

Cuando un cambio altera comportamiento, contratos, rutas, tablas o flujos de usuario, actualizar la documentación mínima del área para que humanos e IA no trabajen con info vieja.

Usar Spec-Driven Development y este cierre es **recomendable** en cambios no triviales; no es un ritual obligatorio para typos o fixes locales evidentes.

## Matriz de actualización

| Tipo de cambio | Documentos a revisar |
|---|---|
| Alcance / decisiones | `README.md`, `GUIA.md`, `docs/01-contexto-decisiones-stack.md`, `docs/03-changelog.md`, `docs/04-roadmap.md` |
| Arquitectura | `docs/02-arquitectura.md` |
| Frontend | `docs/frontend/00-angular20-port-v0.md`, `docs/frontend/03-modulos-admin.md`, sistema visual si aplica |
| Backend | `docs/backend/00-php84-api.md`, `docs/backend/API.md`, contrato si cambia API |
| Base de datos | `docs/database/00-mariadb.md`, `database/docs/`, migraciones |
| Deploy | `docs/deploy/*`, `deploy/README.md`, `deploy/staging/CHECKLIST.md` |
| Seguridad / auth | `AGENTS.md`, `docs/01-contexto-decisiones-stack.md`, specs `admin-auth` |
| Flujo de trabajo / prompts | `docs/opencode/`, `docs/00-indice-general.md` |
| Specs | `openspec/specs/` |

## Cierre sugerido de un ciclo sustancial

```txt
- archivos de producto modificados
- documentación actualizada
- documentación pendiente (si quedó algo)
- pruebas ejecutadas
- QA manual recomendado
- mensaje de commit sugerido
```

## Changelog

Si el cambio es visible para usuarios o operadores, agregar una viñeta breve en `docs/03-changelog.md`.

## Roadmap

Si se completa o descarta un ítem de `docs/04-roadmap.md`, actualizarlo en el mismo PR documental.
