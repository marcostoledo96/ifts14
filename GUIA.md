# GUIA.md — Guía humana del proyecto IFTS14

Esta guía es para Marcos, Matías o cualquier persona que necesite entender el repositorio sin leer todos los archivos.

## 1. Objetivo del repositorio

Este repositorio privado se usa para:

1. estudiar el sitio actual del IFTS 14 descargado desde cPanel;
2. proteger material sensible y evitar subir credenciales;
3. planificar el módulo de certificaciones QR;
4. implementar una nueva sección en `/certificados/`;
5. mantener documentación y prompts para trabajar con OpenCode/Gentle-AI.

## 2. Stack confirmado

```txt
Frontend: Angular 20
Backend: PHP 8.4.21
Base de datos: MariaDB 10.6.27
Hosting: cPanel
Gestión DB: phpMyAdmin / MySQL Databases de cPanel
Ruta final: /certificados/
Staging: /certificados_staging/
```

## 3. Alcance del módulo `/certificados/`

El módulo debe permitir que una persona externa valide un certificado de curso mediante QR o link.

Ruta pública conceptual:

```txt
/certificados/validar/:tokenCertificacion
```

El flujo esperado es:

```txt
Bedelía carga curso y fechas
→ registra asistencias presentes
→ emite certificación (certificado de curso con fechas asistidas)
→ genera PDF horizontal con QR (token permanente)
→ envía o reenvía al alumno (mismo QR/token, no rota)
→ usuario externo escanea QR
→ verifica autenticidad (ve DNI completo del alumno)
```

### Decisiones vigentes (D0)

| Tema | Regla |
|---|---|
| QR / token | Permanente. Reenvío normal no rota token. Solo revocación o regeneración excepcional auditada. |
| DNI en validación pública | DNI completo visible por decisión institucional. Logs/auditoría/errores sin DNI completo. |
| Certificado | Certificado de curso con fechas asistidas del alumno. |
| Auth admin | `X-Admin-Key` temporal. Login real es fase posterior. |
| Email | Cuenta de prueba / `stub`. Producción gated. |
| Composer | Gate: si no disponible en cPanel, `vendor/` local como artefacto, nunca versionado. |
| Firmantes PDF | Rector/a y Asesor/a Pedagógica vía configuración institucional. |
| Staging | `/certificados_staging/` separado de `/certificados/`. |

## 4. Estado actual

Al inicio puede existir material descargado del servidor en raíz:

- dumps SQL;
- carpeta `well-known/`;
- archivos PHP;
- zips;
- logs;
- configuraciones con credenciales.

Ese material debe moverse a:

```txt
material_privado_no_versionar/
```

y nunca debe subirse a GitHub.

## 5. Carpeta `muestra_pagina/`

`muestra_pagina/` contiene la referencia visual exportada desde v0 (Next.js/React). Se usa **solo como referencia visual** para portar a Angular 20.

Reglas:

- No compilar ni ejecutar este proyecto.
- No portar componentes, hooks, rutas ni estilos literalmente a Angular.
- No copiar credenciales demo al producto: son mock visual v0.
- `login-form.tsx` es mock visual; el producto usa `X-Admin-Key` temporal.
- Respetar D0: QR permanente, DNI completo público, fechas asistidas, auth simple temporal.
- Inventario en `muestra_pagina/MANIFIESTO_V0.md`.

## 6. Roles

### Marcos

Responsable de:

- backend PHP;
- MariaDB;
- integración front/back;
- desbloqueos frontend técnicos cuando hagan falta: base Angular, validación pública, mocks/contratos y build `/certificados/`;
- deploy en cPanel;
- arquitectura;
- seguridad;
- documentación;
- auditoría del servidor descargado.

### Matías

Responsable de:

- liderazgo UI/UX del frontend Angular 20;
- adaptación de `muestra_pagina/` (referencia visual v0);
- port visual a Angular (sin copiar React/Next literalmente);
- UI/UX;
- Tailwind o sistema visual elegido;
- responsive;
- accesibilidad;
- admin, QA y handoff visual.

## 7. Metodología

Se trabaja con Spec-Driven Development.

Cada ciclo debe seguir:

```txt
spec → criterios → fixture/contrato → plan → implementación → pruebas → QA → sdd-archive → commit → PR
```

`sdd-archive` significa cerrar el ciclo actualizando la documentación relacionada.

## 8. Documentación mínima

Para empezar:

1. `README.md`
2. `AGENTS.md`
3. `docs/00-indice-general.md`
4. Prompt raíz del rol: `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` o `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`
5. `docs/07-sdd-archive-y-mantenimiento-documentacion.md`

Los prompts viejos de `docs/opencode/` quedan como archivo histórico. Las guías operativas vigentes están en la raíz.

## 9. Git

No trabajar directo sobre `main` salvo primer commit de estructura inicial.

Ramas sugeridas:

```txt
docs/<tema>
frontend/<modulo>
backend/<modulo>
database/<tema>
deploy/<tema>
qa/<tema>
```

OpenCode puede ejecutar operaciones Git solo con aprobación explícita de Matías o Marcos en el mismo turno y con el comando exacto indicado. `git add` + `git commit` + `git push` a la rama de trabajo (nunca a `main`) requieren ciclo SDD verificado, diff-confirmation gate antes de stage (`git status --short` y `git diff --name-only`) y pre-push safety antes de push: si existe `origin/<rama>`, correr `git log origin/<rama>..<rama> --oneline` y `git diff origin/<rama>..<rama> --stat`; si es primer push, declarar que la ref remota no existe y comparar contra la base aprobada con `git log <base>..HEAD --oneline` y `git diff <base>...HEAD --stat`. La preparación de ramas o PR puede ocurrir antes de `sdd-verify` cuando el ciclo lo necesita; `git switch`, `git checkout`, `git branch`, `git switch -c`, `git checkout -b`, PR, merge y rebase requieren aprobación explícita, evidencia previa y árbol limpio, o una decisión explícita de stash/commit/abortar. Para Matías, la única prohibición dura es `git push` directo a `main`.

## 10. Regla principal

Si una tarea no está clara, no se implementa.

Primero se actualiza:

```txt
spec → criterio → contrato/fixture → plan
```
