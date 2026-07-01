# Tasks: staging cPanel para certificados

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 250-350 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr-default |
| Chain strategy | size-exception |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Guía de staging + enlace en `deploy/README.md` + `tasks.md` | PR 1 | Base: `deploy/staging-cpanel-certificados`. Un grupo de commits documentales. |

## Phase 1: Verificación previa

- [x] 1.1 Confirmar que `docs/deploy/00-cpanel-certificados.md` y `deploy/README.md` existen y son la versión vigente.
- [x] 1.2 Confirmar branch `deploy/staging-cpanel-certificados` y árbol limpio antes de empezar.
- [x] 1.3 Releer el delta spec y trazar cada requisito ADDED hacia una sección o escenario de la guía.

## Phase 2: Guía de staging documental

- [x] 2.1 Crear `docs/deploy/01-staging-cpanel-certificados.md` con secciones Objetivo, Alcance (declarar "no deploy"), Rutas `/certificados_staging/` y Estructura esperada.
- [x] 2.2 Agregar **Checklist seguro de paquete** con exclusiones: sin secretos, sin `.env`, sin `vendor/`, sin dumps, sin logs, sin zips de servidor, sin material privado.
- [x] 2.3 Agregar **Configuración de staging con placeholders** referenciando `apps/backend-php/config/certificados-config.example.php`; `public_base_url` apuntando a `/certificados_staging/`.
- [x] 2.4 Agregar **Smoke checks con datos ficticios**: `GET /certificados_staging/api/health` y `GET /certificados_staging/validar/TOKEN_FICTICIO`.
- [x] 2.5 Agregar **Rollback limitado a staging** vía backup/restauración desde cPanel File Manager, sin tocar `/certificados/`.
- [x] 2.6 Cerrar la guía con **Plan de reversión documental** y **Preguntas abiertas** (subdominio vs path, ventana futura).

## Phase 3: Enlace y separación en `deploy/README.md`

- [x] 3.1 En `deploy/README.md`, agregar entrada a la guía de staging bajo "Guía vigente", etiquetada "staging" y con ruta `/certificados_staging/`.
- [x] 3.2 Agregar una nota breve que distinga staging `/certificados_staging/` de producción `/certificados/`.

## Phase 4: Verificación (path checks y restricted scan)

- [x] 4.1 Path check: `docs/deploy/01-staging-cpanel-certificados.md` existe; `deploy/staging/` NO existe.
- [x] 4.2 Restricted path scan: `rg -n "public_html|vendor/|\.env|material_privado|/home/|secrets|backup|\.zip" docs/deploy/01-staging-cpanel-certificados.md deploy/README.md` debe devolver vacío.
- [x] 4.3 Credenciales scan: el documento no contiene passwords, hosts reales, IPs, tokens ni rutas privadas reales.
- [x] 4.4 Cross-reference: la guía enlaza a `00-cpanel-certificados.md` y referencia el delta spec vigente.
- [x] 4.5 Trazabilidad spec→doc: cada requisito ADDED del delta spec tiene al menos una sección o escenario reflejado.
- [x] 4.6 Link validity: los enlaces relativos a archivos versionados resuelven a archivos existentes.

## Phase 5: Cierre del ciclo

- [x] 5.1 `tasks.md` bajo 530 palabras; cada tarea 1-2 líneas, sin párrafos largos.
- [x] 5.2 Sin prosa especulativa, sin texto de relleno, sin capturas de cPanel.
- [x] 5.3 Cerrar ciclo con `sdd-archive` una vez completada la verificación. (Marcada durante `sdd-archive` por instrucción explícita del orquestador: `apply-progress` y `verify-report` prueban que esta tarea era el único pendiente.)
