# Spec: P7-04 Seguridad y Docs CI

**Change**: `p7-04-seguridad-docs`
**Phase**: P7-04
**Status**: draft

## Delta Summary

Siete requisitos para seguridad y calidad documental en CI: gitleaks, whitespace, enlaces, términos obsoletos, OpenSpec huérfano, limpieza de carpetas activas, y corrección de términos residuales.

---

## Added Requirements

### REQ-SEC-001 — Gitleaks secret scanning

Un paso de CI debe ejecutar gitleaks sobre el repositorio y fallar si detecta secretos no allowlisteados.

#### Scenario: Sin secretos
- **Given** el repositorio sin secretos reales
- **When** se ejecuta gitleaks
- **Then** sale con código `0`

#### Scenario: Secreto detectado
- **Given** un archivo con un secreto real (API key, token)
- **When** se ejecuta gitleaks
- **Then** reporta el hallazgo y sale con código distinto de `0`

---

### REQ-SEC-002 — git diff --check

Un paso de CI debe ejecutar `git diff --check origin/main...HEAD` y fallar si hay errores de whitespace.

---

### REQ-SEC-003 — Enlaces internos válidos

Un paso de CI debe verificar que los enlaces internos en `docs/` y `openspec/specs/` apunten a archivos existentes.

---

### REQ-SEC-004 — Términos obsoletos

Un paso de CI debe buscar términos obsoletos en docs activas y fallar si los encuentra: `SMTP` (como feature activo), `PHPMailer` (activo), `firma digital verificada`, `reenvío automático`, `M4-01B` (como pendiente), `entregado` (como estado), `pendiente-entrega`, `requiere-nueva-entrega`.

---

### REQ-SEC-005 — OpenSpec sin huérfanos

Un paso de CI debe verificar que no haya carpetas en `openspec/changes/` que no estén también en `openspec/changes/archive/` con fecha.

---

### REQ-SEC-006 — Limpieza de carpetas huérfanas

Mover las carpetas huérfanas existentes (`m4-01a-*`, `m4-02-*`, `p5-03-environments`) a `openspec/changes/archive/` con prefijo de fecha.

---

### REQ-SEC-007 — Corrección de términos residuales

- `openspec/specs/frontend-http-services/spec.md`: eliminar o actualizar referencia a `pendiente-entrega`.
- `public-validation-page.html`: reemplazar "último entregado por el instituto" por texto sin "entregado".

---

## Non-Goals

- No se modifica `muestra_pagina/`.
- No se agregan hooks de pre-commit.
- No se escanea `material_privado_no_versionar/`.
