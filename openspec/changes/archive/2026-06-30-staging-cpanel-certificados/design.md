# Diseño: staging cPanel para certificados

## Enfoque técnico

El cambio será documental y mínimo: crear una guía de preparación para staging en `docs/deploy/01-staging-cpanel-certificados.md` y enlazarla desde `deploy/README.md`. La guía reutiliza el contrato productivo existente de `/certificados/`, pero cambia explícitamente el contexto a `/certificados_staging/`. No se implementa código, no se ejecuta deploy, no se toca cPanel, `public_html`, `vendor/`, material privado ni secretos.

Este diseño aplica la propuesta, la exploración y el delta spec del cambio: `openspec/changes/staging-cpanel-certificados/specs/deploy-cpanel-certificados/spec.md`. La trazabilidad se apoya en ese delta spec y en sus requisitos de guía separada, checklist seguro, configuración con placeholders, smoke ficticio y rollback limitado a staging; no agrega plantillas versionables salvo que `sdd-tasks` detecte una necesidad concreta.

## Decisiones de arquitectura

| Opción | Tradeoff | Decisión |
|---|---|---|
| Guía separada `docs/deploy/01-staging-cpanel-certificados.md` | Suma un archivo, pero evita mezclar staging con producción. | Elegida: reduce el riesgo operativo de confundir `/certificados_staging/` con `/certificados/`. |
| Agregar una sección staging a `docs/deploy/00-cpanel-certificados.md` | Menos archivos, pero más carga cognitiva y mayor riesgo de ejecutar pasos productivos. | Rechazada: el lector debe poder revisar staging sin reconstruir el deploy productivo. |
| Crear `deploy/staging/` con plantillas | Puede acelerar un futuro paquete, pero parece artefacto ejecutable. | Rechazada por ahora: el alcance pedido es documentación/checklist; Ponytail favorece no crear archivos “por si acaso”. |
| Usar placeholders y referencias a `.example` | Requiere que la configuración real se complete fuera del repo. | Elegida: evita versionar credenciales y mantiene la preparación segura. |

## Flujo de información

```txt
proposal + exploration + delta spec del cambio
        │
        ├── docs/deploy/01-staging-cpanel-certificados.md
        │       ├── alcance: preparación documental
        │       ├── ruta: /certificados_staging/
        │       ├── checklist: paquete, configuración, smoke, rollback
        │       └── guardas: sin secretos, sin vendor, sin deploy real
        │
        └── deploy/README.md ── enlace y distinción staging/producción
```

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `docs/deploy/01-staging-cpanel-certificados.md` | Crear | Guía breve de preparación para staging: alcance, rutas, checklist, configuración ficticia, smoke con datos ficticios y rollback documental. |
| `deploy/README.md` | Modificar | Agregar enlace a la guía de staging y separar explícitamente staging `/certificados_staging/` de producción `/certificados/`. |
| `openspec/changes/staging-cpanel-certificados/design.md` | Crear | Este diseño técnico/documental. |
| `deploy/staging/` | No crear | Se posterga: no hay necesidad clara de plantillas versionables en este ciclo. |

## Interfaces / contratos

No hay interfaces de código nuevas. La guía debe mantener estos contratos documentales:

| Contrato | Valor de staging |
|---|---|
| Ruta pública propuesta | `/certificados_staging/` |
| API propuesta | `/certificados_staging/api/` |
| Health smoke | `GET /certificados_staging/api/health` |
| Ruta frontend ficticia | `GET /certificados_staging/validar/TOKEN_FICTICIO` |
| Configuración real | Fuera de Git y preferentemente fuera del webroot |
| Referencia versionable | `apps/backend-php/config/certificados-config.example.php` |

## Estrategia de validación

| Capa | Qué validar | Enfoque |
|---|---|---|
| Documental | Que la guía sea breve, escaneable y no duplique la guía productiva. | Revisión Markdown contra propuesta, exploración y spec vigente. |
| Seguridad | Que no haya secretos, `.env`, dumps, logs, `vendor/`, uploads ni rutas privadas reales. | Revisión textual de archivos modificados. |
| Contrato | Que staging use `/certificados_staging/` y no confunda `base href` con API. | Trazar checklist y smoke ficticio contra `docs/deploy/00-cpanel-certificados.md`. |
| E2E | No aplica en este ciclo. | No hay deploy ni ejecución contra cPanel. |

## Migración / rollout

No hay migración. El rollout real queda fuera de alcance y deberá tener ciclo propio antes de tocar cPanel. La reversión de este ciclo es documental: eliminar la guía nueva y retirar el enlace de `deploy/README.md`.

## Preguntas abiertas

- [ ] Confirmar si el staging futuro usará definitivamente `/certificados_staging/` en el dominio principal o un subdominio.
- [ ] Confirmar quién aprueba la ventana operativa futura.
