# AGENTS.md — IFTS14

Orientación para agentes (OpenCode/Gentle-AI/Cursor) en el repo privado `ifts14`.

## Propósito

Mantener trabajo ordenado, seguro y documentado. Spec-Driven Development y TDD son **recomendables** para cambios no triviales; no bloquean fixes evidentes.

## Reglas obligatorias

- No leer todo el repositorio por defecto.
- Leer lo mínimo: `README.md`, `GUIA.md`, `docs/00-indice-general.md`, área afectada y specs tocadas.
- No pegar salidas largas de terminal; resumir.
- No procesar material privado, dumps, logs ni secretos fuera de auditorías autorizadas.
- **Token/QR permanente**: actualizar certificado o regenerar PDF **no** rota token/QR. Solo revocación explícita o regeneración excepcional auditada.
- **DNI completo en UI** (pública y admin). Logs/auditoría/errores/dumps **sin** DNI ni token completos.
- **Auth admin**: sesión PHP + CSRF. `X-Admin-Key` solo CLI/smokes; no autoriza HTTP.
- **Paridad visual** con `muestra_pagina/`: intención visual a Angular 20; no portar React/Next literalmente.
- **`.codegraph/`** no se versiona ni se stagea.
- Git: commit/push/switch/merge solo con aprobación explícita humana cuando apliquen las reglas del equipo; nunca push directo a `main` como atajo. Diff-confirmation antes de stage; pre-push safety en ramas con tracking.
- No subir secretos ni imprimir credenciales reales.
- No copiar dumps SQL ni logs a documentación.
- Español argentino formal en docs y comentarios útiles (sin obviedades).

## Stack

```txt
Frontend: Angular 20
Backend: PHP 8.4.22 (staging)
Base: MariaDB 10.6.27
Hosting: cPanel
Staging: /certificados_staging/   (operativo)
Producción: /certificados/        (aún no activada)
```

## Lectura mínima

1. `README.md`
2. `GUIA.md`
3. `docs/00-indice-general.md`
4. `docs/03-changelog.md` / `docs/04-roadmap.md` según el caso
5. Prompt de rol en `docs/opencode/` si el ciclo usa la guía extendida
6. Spec en `openspec/specs/` si existe para el módulo
7. `docs/opencode/optimizacion-tokens.md` si el ciclo es OpenCode/Gentle-AI

## Recomendado (no obligatorio)

- Un ciclo SDD por vez y cierre documental (`docs/07-sdd-archive-y-mantenimiento-documentacion.md`).
- TDD cuando haya implementación.
- Graphify solo con `.graphifyignore` válido; nunca sobre material privado.
- `Ponytail` / cambios quirúrgicos en fixes chicos.

## Material privado

`material_privado_no_versionar/`: nunca versionar, nunca copiar secretos a docs, solo listar riesgos generales salvo auditoría autorizada.

## `muestra_pagina/`

Referencia visual v0. No compilar. No portar credenciales demo. Respetar D0.

## Frontend / Backend / DB / Deploy

Ver `AGENTS.md` de cada carpeta y docs del área en `docs/`. Deploy canónico en `docs/deploy/`; artefactos en `deploy/`.

## sdd-archive (recomendado)

Al cerrar ciclos sustanciales: actualizar docs del área tocada y una viñeta en `docs/03-changelog.md` si el cambio es visible.
