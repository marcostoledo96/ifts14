# Propuesta: deploy/cpanel-certificados (M3-05)

## Intención

Documentar el proceso manual de deploy del backend PHP en cPanel bajo `/certificados/`, dejando un checklist operativo, una spec SDD y un plan de rollback. No se ejecuta deploy ni se sube contenido al servidor: el ciclo solo prepara documentación y especificaciones.

## Alcance

### En alcance
- Crear spec OpenSpec `openspec/specs/deploy-cpanel-certificados/spec.md` con escenarios de checklist, backup, subida, verificación y rollback.
- Actualizar `docs/deploy/00-cpanel-certificados.md` con el backend actual, checklist manual, `.htaccess`, backup y lecciones del smoke test.
- Ampliar `deploy/README.md` con estructura de archivos a subir y enlaces a docs.
- Documentar/validar `apps/backend-php/.htaccess` para cPanel.

### Fuera de alcance
- Subir archivos a `public_html` o a `/certificados/`.
- Crear o modificar configuración real del servidor.
- Generar paquete zip automatizado o scripts de deploy.
- Implementar frontend Angular; se deja nota para ciclo posterior.
- Cambios de código backend o base de datos.

## Capabilities

### Nuevas capabilities
- `deploy-cpanel-certificados`: Proceso manual de deploy en cPanel para `/certificados/`, con checklist, backup, subida controlada, verificación y rollback.

### Capabilities modificadas
- Ninguna. El cambio es documental/spec.

## Enfoque

Seguir la recomendación de la exploración en modo Ponytail full: una spec OpenSpec mínima que formalice el deploy manual, más actualización de la documentación operativa. No se agrega empaquetado automatizado porque el deploy es manual y se prefiere control paso a paso.

## Áreas afectadas

| Área | Impacto | Descripción |
|------|---------|-------------|
| `docs/deploy/00-cpanel-certificados.md` | Modificado | Backend actual, checklist, backup, rollback, smoke test. |
| `openspec/specs/deploy-cpanel-certificados/spec.md` | Nuevo | Escenarios Given/When/Then del deploy manual. |
| `deploy/README.md` | Modificado | Estructura de archivos y enlaces. |
| `apps/backend-php/.htaccess` | Documentado | Reglas de reescritura para cPanel. |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|--------|--------------|------------|
| Subir `certificados-config.php` real | Medio | Checklist que verifique que solo existe `.example.php` en la carpeta de subida. |
| `.htaccess` incompatible con producción | Medio | Documentar reglas mínimas probadas y probar en carpeta aislada antes. |
| Publicar backend-only sin frontend | Medio | Dejar claro que el deploy inicial puede ser API-only con `index.html` mínimo o esperar M3-06. |
| No tener rollback claro | Bajo | Incluir paso de backup vía File Manager y restauración del zip. |

## Plan de rollback

1. Desde cPanel File Manager, identificar el zip de backup creado antes del deploy.
2. Eliminar o renombrar la carpeta `/certificados/` afectada.
3. Descomprimir el backup en `/certificados/`.
4. Verificar que `config/certificados-config.php` real sigue en su lugar si estaba fuera del webroot.
5. Ejecutar smoke test básico: health check y un endpoint público.

## Dependencias

- Acceso a cPanel con permisos de File Manager (solo para lectura de estructura, no para ejecutar cambios).
- Backend PHP actual establecido en `apps/backend-php/`.
- Smoke test previo `certificados_qa` como referencia.

## Criterios de aceptación

- [ ] Spec OpenSpec de deploy creada con al menos cinco escenarios (checklist, backup, subida, verificación, rollback).
- [ ] `docs/deploy/00-cpanel-certificados.md` actualizado y con checklist imprimible.
- [ ] `deploy/README.md` ampliado con estructura de archivos a subir.
- [ ] Reglas de `.htaccess` documentadas y alineadas con backend actual.
- [ ] Ningún archivo se sube a cPanel ni se crea configuración real.
