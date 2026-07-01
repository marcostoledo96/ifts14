# Propuesta: staging cPanel para certificados

## Intención

Preparar una guía segura y revisable para un futuro staging en cPanel bajo `/certificados_staging/`, sin ejecutar deploy, subir archivos, tocar `public_html`, ni registrar secretos. La guía separa staging de producción para reducir errores operativos antes de una ventana real.

## Alcance

### Incluido
- Crear `docs/deploy/01-staging-cpanel-certificados.md` con ruta, checklist, configuración, smoke y rollback de staging.
- Actualizar `deploy/README.md` con enlace y distinción entre staging y producción.
- Mantener comandos de smoke con datos ficticios y sin material privado.

### Excluido
- Deploy real, uploads, cambios en cPanel o `public_html`.
- Paquetes ZIP, scripts de subida, `vendor/`, secretos, dumps, logs o configuración real.
- Port completo del diseño v0 y cambio funcional de frontend/backend.

## Capacidades

### Nuevas capacidades
- Ninguna.

### Capacidades modificadas
- `deploy-cpanel-certificados`: agrega preparación documental de staging para `/certificados_staging/`, diferenciada del deploy productivo `/certificados/`.

## Enfoque

Seguir la opción recomendada en la exploración: documento de staging separado + checklist. Reusar las reglas productivas existentes, cambiando explícitamente rutas a `/certificados_staging/`, configuración externa ficticia y rollback por backup/restauración desde cPanel File Manager. No crear artefactos ejecutables.

## Áreas afectadas

| Área | Impacto | Descripción |
|---|---|---|
| `docs/deploy/01-staging-cpanel-certificados.md` | Nuevo | Guía operativa de staging. |
| `deploy/README.md` | Modificado | Enlace y separación staging/producción. |
| `openspec/changes/staging-cpanel-certificados/` | Modificado | Proposal y futuros deltas SDD. |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Confundir staging con producción | Media | Usar `/certificados_staging/` en todo el documento. |
| Versionar configuración real | Media | Checklist con exclusión de `.env`, configs reales, dumps y logs. |
| Parecer deploy ejecutable | Baja | Declarar que es preparación documental únicamente. |

## Plan de reversión

Revertir los cambios documentales: eliminar `docs/deploy/01-staging-cpanel-certificados.md`, retirar el enlace de `deploy/README.md` y descartar el delta OpenSpec. No hay rollback de servidor porque este ciclo no toca cPanel ni `public_html`.

## Dependencias

- Guía productiva vigente `docs/deploy/00-cpanel-certificados.md`.
- Spec existente `openspec/specs/deploy-cpanel-certificados/spec.md`.

## Criterios de éxito

- [ ] La guía de staging existe y distingue `/certificados_staging/` de `/certificados/`.
- [ ] Incluye checklist de paquete, plantilla de configuración, smoke ficticio y rollback.
- [ ] No incluye secretos, material privado, vendor, dumps, logs ni pasos de upload real.

## Ronda de preguntas de propuesta

Pendiente de revisión: confirmar si staging debe usar dominio principal con `/certificados_staging/` o subdominio; si `public_base_url` ficticia debe apuntar a staging; y quién aprueba la ventana futura.
