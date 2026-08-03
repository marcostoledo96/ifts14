# GUIA.md — Onboarding del proyecto IFTS14

Guía corta para humanos (y agentes) que necesitan entender el repo sin leerlo entero.

## 1. Qué es esto

Módulo de **certificaciones de curso con QR** para el IFTS N.° 14.

Flujo de negocio:

```txt
Bedelía carga curso y fechas
→ marca asistencias (presentes)
→ emite certificación
→ genera PDF con QR (token permanente)
→ entrega link/PDF por canal externo (WhatsApp, mail manual, etc.)
→ el destinatario valida en /validar/:token
```

Entorno de trabajo diario: **staging** (`/certificados_staging/`). Producción aún no está activada para este módulo.

## 2. Stack

```txt
Frontend: Angular 20
Backend:  PHP 8.4.22 CGI/FastCGI (staging)
Base:     MariaDB 10.6.27
Hosting:  cPanel (sin SSH/Terminal útiles; deploy por File Manager / ZIP)
```

## 3. Decisiones que no se negocian (D0)

| Tema | Regla |
|---|---|
| Token/QR | Permanente. Reemitir PDF, actualizar contenido o reenviar link **no** rota el QR. Solo revocación o regeneración excepcional auditada. |
| DNI | Completo en UI pública y admin. Nunca completo en logs/auditoría/errores/dumps. |
| Auth | Sesión PHP + CSRF. `X-Admin-Key` no autoriza HTTP. |
| Email | Opcional en alumno; sin SMTP automático todavía. |
| PDF | Folio Angular y TCPDF backend son ambos válidos; elige el instituto. |
| Secretos | Fuera de Git. Config real fuera del webroot. |

Detalle: [`docs/01-contexto-decisiones-stack.md`](docs/01-contexto-decisiones-stack.md).

## 4. Mapa del repositorio

| Ruta | Para qué |
|---|---|
| `apps/frontend-angular/` | UI admin + validación pública |
| `apps/backend-php/` | API bajo `…/api/` |
| `database/migrations/` | SQL versionado (`001`…`015`+) |
| `docs/` | Documentación vigente |
| `openspec/specs/` | Contratos/specs por módulo |
| `deploy/staging/` | Checklists y plantillas de staging |
| `material_privado_no_versionar/` | Privado local; no versionar |

Índice completo: [`docs/00-indice-general.md`](docs/00-indice-general.md).

## 5. Primer día (orden sugerido)

1. Clonar el repo y leer este archivo + `README.md`.
2. Seguir [`docs/05-desarrollo-local.md`](docs/05-desarrollo-local.md).
3. Mirar [`docs/03-changelog.md`](docs/03-changelog.md) (qué ya existe).
4. Mirar [`docs/04-roadmap.md`](docs/04-roadmap.md) (qué viene).
5. Para un cambio concreto, abrir solo el área afectada (backend/frontend/database/deploy).

## 6. Cómo trabajamos (recomendado, no obligatorio)

### Spec-Driven Development (recomendado)

Para cambios no triviales:

```txt
spec → criterios → fixture/contrato → implementación → pruebas → docs → PR
```

Specs en `openspec/specs/`. Al cerrar un ciclo sustancial, actualizar la doc del área (`docs/07-sdd-archive-y-mantenimiento-documentacion.md`).

Para fixes chicos: TDD o tests focalizados + PR alcanza.

### Git (recomendado)

- No trabajar directo en `main`.
- Rama por tema: `docs/…`, `frontend/…`, `backend/…`, `fix/…`.
- PR hacia `main`; revisar diff antes de merge.
- Nunca subir secretos, `vendor/`, `dist/`, dumps ni material privado.
- Detalle: [`docs/06-flujo-git-recomendado.md`](docs/06-flujo-git-recomendado.md).

### Agentes IA

- Lectura mínima + `AGENTS.md`.
- Prompts de rol en `docs/opencode/`.
- Operaciones Git destructivas o push solo con aprobación explícita humana.

## 7. Autores y roles

Desarrollado por **Marcos Ezequiel Toledo** y **Matías Ríos**, con colaboración del **IFTS N.° 16**.

| Persona | Alcance | LinkedIn |
|---|---|---|
| Marcos Ezequiel Toledo | Backend, DB, integración, deploy, seguridad, arquitectura, documentación, UI/UX Angular 20, sistema visual, panel admin, responsive y accesibilidad. | [linkedin.com/in/marcos-ezequiel-toledo](https://www.linkedin.com/in/marcos-ezequiel-toledo/) |
| Matías Ríos | Desarrollo frontend Angular, documentación, QA y planificación del port visual. | [linkedin.com/in/matiasgermanrios](https://www.linkedin.com/in/matiasgermanrios/) |
| IFTS N.° 16 | Colaboración institucional. | — |

## 8. Deploy (resumen)

1. Build Angular con `baseHref` de staging o producción.
2. Empaquetar backend (con `vendor/` local si hace falta).
3. Subir a cPanel (File Manager / ZIP).
4. Aplicar migraciones SQL pendientes en la DB del entorno.
5. Smoke: `GET …/api/health`, login admin, un flujo corto de emisión/validación.

Guías: [`docs/deploy/`](docs/deploy/) · artefactos: [`deploy/`](deploy/).

## 9. Referencia visual

El diseño institucional vive en `apps/frontend-angular/`. La referencia React/Next de diseño ya no forma parte del repositorio.

## 10. Si algo no está claro

No inventar contratos, rotación de QR, SMTP ni auth nueva. Abrir o actualizar spec/docs y acordar con el responsable del área.
