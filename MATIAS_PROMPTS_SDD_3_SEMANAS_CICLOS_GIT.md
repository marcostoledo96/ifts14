# Matías — prompts SDD por ciclos, Angular 20 y Git

Guía operativa para que Matías trabaje en ciclos chicos. Ejecutar un ciclo por vez y cerrar siempre con `sdd-archive`.

## Rol

- Frontend Angular 20.
- Port del diseño generado en v0 desde `muestra_pagina/`.
- UI/UX institucional, accesible y responsive.
- Componentes Angular propios.
- Conexión futura con la API PHP de Marcos.

## Reglas generales

- No trabajar directo sobre `main` salvo decisión explícita.
- OpenCode no debe commitear, pushear, mergear ni rebasear automáticamente.
- Si `muestra_pagina/` está vacía o solo tiene documentación, no implementar pantallas finales.
- No copiar React, Next.js, hooks ni rutas de v0 literalmente.
- Usar Angular 20 y Tailwind cuando se cree la app.

## Comandos base

```bash
git checkout main
git pull origin main
git checkout -b <rama-del-ciclo>
```

Al cerrar:

```bash
git status --ignored --short
git add <archivos-seguros>
git commit -m "<mensaje-sugerido>"
git push -u origin <rama-del-ciclo>
gh pr create --base main --head <rama-del-ciclo> --title "<titulo>" --body "<descripcion>"
```

## Semana 1 — auditoría visual y base Angular

### Ciclo F1-01 — auditar `muestra_pagina/`

Objetivo: determinar si hay diseño v0 suficiente para avanzar.

Lectura: `AGENTS.md`, `GUIA.md`, `docs/00-indice-general.md`, `docs/frontend/00-angular20-port-v0.md`, `muestra_pagina/`.

Resultado: si falta diseño, documentar bloqueo; si existe, extraer pantallas, tokens, layout y componentes.

### Ciclo F1-02 — base Angular 20

Objetivo: crear app Angular 20 con routing y estructura por features solo si el ciclo está aprobado.

Resultado: build verificable y documentación frontend actualizada.

### Ciclo F1-03 — pantalla pública válida

Objetivo: portar estado válido usando diseño aprobado y mocks ficticios.

Resultado: UI responsive, accesible y lista para conectar API después.

## Semana 2 — estados y administración

### Ciclo F2-01 — estados no exitosos

Objetivo: implementar revocada, no encontrada y error técnico sin filtrar datos personales.

Resultado: escenarios visuales documentados y probados.

### Ciclo F2-02 — login y dashboard admin

Objetivo: crear estructura admin con mocks, sin autenticación real hasta tener contrato PHP.

Resultado: pantallas base verificables.

### Ciclo F2-03 — cursos, asistencias y certificaciones

Objetivo: construir flujos de Bedelía con datos ficticios y componentes reutilizables.

Resultado: UX revisable antes de integración real.

## Semana 3 — conexión futura y QA

### Ciclo F3-01 — contrato con API PHP

Objetivo: conectar servicios Angular al contrato definido por Marcos.

Resultado: integración por endpoints documentados, sin credenciales en frontend.

### Ciclo F3-02 — responsive y accesibilidad

Objetivo: revisar 360/390/430, tablet y desktop, foco visible, contraste y navegación por teclado.

Resultado: checklist QA frontend.

### Ciclo F3-03 — preparación para deploy

Objetivo: validar build con base href `/certificados/` y documentación de entrega.

Resultado: build listo para cPanel y rollback documentado.
