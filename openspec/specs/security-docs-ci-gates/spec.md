# Spec — Security & Docs CI Quality Gates

## Purpose

Definir los quality gates de seguridad y mantenimiento documental que el job `security-docs-gates` de `.github/workflows/backend-tests.yml` MUST ejecutar en cada PR, para impedir que un secreto versionado, errores de whitespace, enlaces internos rotos, términos obsoletos en docs vigentes, carpetas de OpenSpec activas mal archivadas o términos residuales relacionados con `pendiente-entrega` / `entregado` reintroduzcan regresiones conocidas en el repositorio.

Este contrato se materializa con el ciclo `p7-04-seguridad-docs` (2026-07-16) y queda como spec canónica del repositorio. Las tres carpetas huérfanas detectadas en `openspec/changes/` (`m4-01a-backend-contrato`, `m4-02-database`, `p5-03-environments`) ya fueron movidas a `openspec/changes/archive/` con prefijo de fecha, y los dos términos residuales (`pendiente-entrega` en `openspec/specs/frontend-http-services/spec.md` y `último entregado por el instituto` en `public-validation-page.html`) ya fueron corregidos. ESLint, hooks de pre-commit, escaneo de `muestra_pagina/` y escaneo de `material_privado_no_versionar/` se difieren a ciclos posteriores y no forman parte de estos requisitos.

## Requirements

### Requirement: Gitleaks secret scanning

El job `security-docs-gates` MUST ejecutar un paso de escaneo de secretos con [`gitleaks/gitleaks-action@v2`](https://github.com/gitleaks/gitleaks-action) sobre el repositorio y MUST fallar con código distinto de `0` cuando detecte un secreto real no allowlisteado. La configuración de allowlist MUST vivir en `.gitleaks.toml` versionado en la raíz del repositorio y SHOULD cubrir como mínimo: `muestra_pagina/` (referencia visual), código de test (`apps/backend-php/tests/**`, `apps/frontend-angular/src/**/*.spec.ts`) y migraciones SQL (`database/migrations/**/*.sql`).

#### Scenario: Sin secretos

- **Given** el repositorio sin secretos reales
- **When** se ejecuta el paso de gitleaks
- **Then** el job termina con código `0`

#### Scenario: Secreto detectado

- **Given** un archivo versionado con un secreto real (API key, token, private key)
- **When** se ejecuta gitleaks
- **Then** el job falla con código distinto de `0`
- **And** el hallazgo es visible en el log de CI

---

### Requirement: git diff --check

El job `security-docs-gates` MUST ejecutar `git diff --check origin/main...HEAD` y MUST fallar con código distinto de `0` cuando detecte errores de whitespace (espacios al final de línea, tabs mezclados, líneas con `\ No newline at end of file`). El paso SHOULD ejecutarse **antes** de los chequeos de enlaces y de términos obsoletos para detectar regresiones de formato de forma temprana.

---

### Requirement: Enlaces internos válidos

El job `security-docs-gates` MUST verificar que los enlaces internos en `docs/` y en `openspec/specs/` apunten a archivos existentes en el repositorio. La verificación MUST implementarse en `scripts/ci-link-check.sh` y MUST fallar con código distinto de `0` cuando encuentre un enlace roto (target inexistente, archivo faltante o path mal formado). Los enlaces externos (http/https) quedan fuera del alcance de este gate.

---

### Requirement: Términos obsoletos

El job `security-docs-gates` MUST buscar términos obsoletos en docs activas y MUST fallar con código distinto de `0` cuando los encuentre. La verificación MUST implementarse en `scripts/ci-obsolete-terms.sh` (rewrite con `awk` para performance sobre repositorio de tamaño medio) y MUST cubrir como mínimo: `SMTP` (como feature activo), `PHPMailer` (como feature activo), `firma digital verificada`, `reenvío automático`, `M4-01B` (como pendiente cuando ya está implementado), `entregado` (como estado), `pendiente-entrega` y `requiere-nueva-entrega`. El script MUST aplicar un filtro de contexto para reducir falsos positivos en frases históricas o de remoción (ej. "sin SMTP", "se removió PHPMailer") y SHOULD ejecutarse **después** del chequeo de enlaces para minimizar ruido.

---

### Requirement: OpenSpec sin huérfanos

El job `security-docs-gates` MUST verificar que no haya carpetas en `openspec/changes/` que sigan activas pese a estar ya archivadas en `openspec/changes/archive/`. La verificación MUST implementarse en `scripts/ci-openspec-orphan-check.sh` y MUST fallar con código distinto de `0` cuando detecte una carpeta que está **simultáneamente** en `openspec/changes/<nombre>/` y en `openspec/changes/archive/YYYY-MM-DD-<nombre>/` (folder activo duplicado de archivo). Esta interpretación previene falsos positivos sobre ciclos SDD en curso: un ciclo activo que no esté todavía archivado no es huérfano.

---

### Requirement: Limpieza de carpetas huérfanas

Las carpetas huérfanas detectadas en `openspec/changes/` MUST moverse a `openspec/changes/archive/` con prefijo de fecha ISO (`YYYY-MM-DD-<nombre>/`). Las tres carpetas que motivan este requisito al cierre del ciclo P7-04 son:

| Carpeta activa (antes) | Carpeta de archivo (después) |
|---|---|
| `openspec/changes/m4-01a-backend-contrato-token-permanente-dni-fechas/` | `openspec/changes/archive/2026-07-02-m4-01a-backend-contrato/` |
| `openspec/changes/m4-02-database-cursos-alumnos-asistencias/` | `openspec/changes/archive/2026-07-02-m4-02-database/` |
| `openspec/changes/p5-03-environments/` | `openspec/changes/archive/2026-07-15-p5-03-environments/` |

El script `scripts/ci-openspec-orphan-check.sh` (REQ-SEC-005) previene futuras regresiones.

---

### Requirement: Corrección de términos residuales

Dos correcciones documentales MUST aplicarse para eliminar términos residuales ligados a estados no sustentados:

1. `openspec/specs/frontend-http-services/spec.md` línea 174: la frase que contiene `pendiente-entrega` MUST reemplazarse por una referencia a `no_emitido` (alineado con D1-11).
2. `public-validation-page.html` línea 256: la frase "último entregado por el instituto" MUST reemplazarse por "el emitido por el instituto" (alineado con D1-11; sin afirmación de entrega manual).

El script `scripts/ci-obsolete-terms.sh` (REQ-SEC-004) previene que estos términos regresen en commits futuros.

---

## Non-Goals (explicit)

- No se modifica `muestra_pagina/` (referencia visual v0; queda allowlisteada en `.gitleaks.toml`).
- No se agregan hooks de pre-commit (el gate opera en CI, no en developer machine).
- No se escanea `material_privado_no_versionar/` (carpeta fuera de versión por convención).
- No se escanean secretos en `apps/backend-php/vendor/` (excluido por configuración de gitleaks).
- No se agregan herramientas adicionales de SAST/DAST en este ciclo (gitleaks cubre el caso de secretos versionados).
- No se migra `gitleaks-action` a v3 ni se cambia la acción de GitHub.

## Notes operativas

- El job `security-docs-gates` opera de forma independiente de `php-tests` y `frontend-tests`; un fallo en este job bloquea el merge aunque los otros pasen.
- `.gitleaks.toml` está versionado en la raíz del repositorio y aplica un allowlist de 3 paths explícitos (`muestra_pagina/`, tests, migraciones SQL). El resto del repositorio se escanea sin excepciones.
- Los tres scripts (`scripts/ci-link-check.sh`, `scripts/ci-obsolete-terms.sh`, `scripts/ci-openspec-orphan-check.sh`) son POSIX-shellscripts validables con `bash -n` y exit-code explícito (`0` ok, distinto de `0` fallo).
- La spec se redacta en español argentino formal, consistente con el resto del repositorio. Los requisitos usan MUST/SHOULD/MAY según RFC 2119.
- `openspec/config.yaml` puede declarar la sección `testing.quality.gates.security-docs` con la ruta del workflow y referencia al job; este ciclo no modifica la estructura de OpenSpec, solo crea la spec canónica.
