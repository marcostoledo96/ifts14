# Diseño: deploy/cpanel-certificados

## Enfoque técnico

El cambio será documental y mínimo: consolidar una guía manual de deploy para cPanel en `/certificados/`, actualizar el índice operativo de `deploy/` y dejar la spec de capacidad lista para archivado. No se suben archivos, no se toca `public_html`, no se crean configuraciones reales y no se agregan scripts. El diseño sigue la propuesta M3-05 y cubre los requisitos de checklist, exclusiones, privacidad, rutas `.htaccess`, configuración externa, backup, rollback y validación segura.

## Decisiones de arquitectura

| Opción | Tradeoff | Decisión |
|---|---|---|
| Guía manual en `docs/deploy/00-cpanel-certificados.md` | Menos automatización, más control humano en cPanel | Elegida: el objetivo es preparar documentación, no ejecutar deploy. |
| Script/ZIP de deploy | Reduce pasos manuales pero aumenta riesgo de empaquetar secretos o ejecutar fuera de alcance | Rechazado: no es necesario para este ciclo y contradice Ponytail. |
| Documentar `.htaccess` con fragmentos mínimos | Requiere que el operador copie con cuidado, pero mantiene revisión simple | Elegida: debe explicar raíz SPA y API sin modificar código. |
| Crear spec principal directamente | Acelera el archivo final pero saltea el flujo SDD activo | Rechazado: el delta vive en `openspec/changes/...`; `sdd-archive` lo fusiona. |

## Flujo de información

```txt
Proposal + Spec activa
        │
        ├── docs/deploy/00-cpanel-certificados.md  ── guía operativa principal
        ├── deploy/README.md                       ── mapa corto y enlaces
        └── openspec/specs/deploy-cpanel-certificados/spec.md  ── destino de archive

Operador futuro ── lee checklist ── prepara backup ── sube manualmente ── valida ── rollback si falla
```

## Metadatos de fase y ruteo

| Campo | Valor |
|---|---|
| `status` | `success` |
| `artifacts` | `openspec/changes/deploy-cpanel-certificados/design.md`; Engram `sdd/deploy-cpanel-certificados/design` |
| `next_phase` | `sdd-tasks` |
| `risks` | Mantener el alcance documental; no ejecutar deploy; archive debe fusionar la spec principal existente. |
| `skill_resolution` | `paths-injected` — `sdd-design`, `cognitive-doc-design`, `karpathy-guidelines`. |

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `docs/deploy/00-cpanel-certificados.md` | Modificar | Convertir en guía operativa principal con ruta `/certificados/`, checklist imprimible, exclusiones, `.htaccess`, backup, validación y rollback. |
| `deploy/README.md` | Modificar | Agregar mapa breve de deploy, artefactos permitidos/prohibidos y enlace a la guía principal. |
| `openspec/changes/deploy-cpanel-certificados/specs/deploy-cpanel-certificados/spec.md` | Mantener | Usar como delta vigente; no duplicar escenarios en la guía. |
| `openspec/specs/deploy-cpanel-certificados/spec.md` | Actualizar en archive | Ya existe; `sdd-archive` debe fusionar/actualizar sin recrear ni pisar a ciegas. |
| `apps/backend-php/.htaccess` | No modificar | Solo documentar que hoy contiene `FallbackResource /certificados/api/index.php`; cualquier cambio de código queda fuera. |

## Contratos y supuestos

- Ruta pública objetivo: `https://ifts14.com.ar/certificados/`.
- API esperada: `/certificados/api/`; el front controller PHP normaliza el prefijo `/certificados/api` antes de rutear.
- Health check futuro: `GET /certificados/api/health`.
- Validación pública: `GET /certificados/api/certificados/{token}/verificacion` y `POST /certificados/api/certificados/consulta`.
- Frontend futuro: rutas profundas bajo `/certificados/` con fallback SPA, excluyendo `/certificados/api/`.
- Configuración real: fuera de Git, sin `.env`, con placeholders o `.example` únicamente.

## Enfoque `.htaccess`

La guía debe separar dos responsabilidades: raíz `/certificados/` para Angular y subcarpeta `/certificados/api/` para PHP. Debe advertir que el fallback SPA no puede capturar `/api/`. La documentación puede mostrar fragmentos orientativos, marcados como ejemplo revisable, y debe indicar validar primero en carpeta aislada o ventana controlada.

## Guardia de privacidad

La guía y la spec deben declarar que no se lee ni copia `material_privado_no_versionar/`, dumps, logs, zips, `.env`, credenciales ni configuraciones reales. Si se menciona material sensible, solo se registran riesgos generales, sin valores ni rutas privadas detalladas.

## Estrategia de validación

| Capa | Qué validar | Enfoque |
|---|---|---|
| Documental | Checklist, exclusiones, rutas, backup y rollback | Revisión manual de Markdown contra la spec activa. |
| Contrato | Escenarios Given/When/Then | Confirmar trazabilidad spec → secciones de guía. |
| Seguridad | Ausencia de secretos y acciones reales | Revisar que no haya `.env`, credenciales, comandos de subida ni lectura privada. |

## Migración / rollout

No hay migración. El rollout real queda para un ciclo posterior; este ciclo solo deja instrucciones y criterios de aceptación. El archive debe actualizar `openspec/specs/deploy-cpanel-certificados/spec.md`, mantener evidencia en `openspec/changes/archive/...` y verificar si `docs/deploy/` y `deploy/README.md` quedaron como fuente vigente sin duplicación confusa.

## Preguntas abiertas

- Ninguna bloqueante.
