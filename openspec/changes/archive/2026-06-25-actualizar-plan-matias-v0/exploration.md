## Exploration: actualizar-plan-matias-v0

### Current State

`muestra_pagina/` ya contiene diseño v0 utilizable generado en Next.js/React. No está vacía.

**Prompts implementados (7 pantallas):**

| # | Prompt | Archivo v0 generado |
|---|--------|---------------------|
| 4 | Validación pública válida | `app/page.tsx` + `components/validacion/*` |
| 5 | Validación pública no exitosa | `app/estados/page.tsx` + `components/validacion/estado-*` |
| 6 | Dashboard admin | `app/admin/dashboard/page.tsx` + `components/admin/*` |
| 7 | Login administrativo | `app/admin/login/page.tsx` + `components/admin/login-form.tsx` |
| 8 | Crear / editar curso con fechas | `app/admin/cursos/nuevo/page.tsx`, `app/admin/cursos/[id]/editar/page.tsx` + `components/admin/curso-editor.tsx` |
| 9 | Registrar asistencias presentes | `app/admin/cursos/[id]/asistencias/page.tsx` + `components/admin/asistencias-editor.tsx` |
| 10 | Emitir certificación directa | `app/admin/certificaciones/nueva/page.tsx` + `components/admin/nueva-certificacion-editor.tsx` |

**Prompts pendientes (12 pantallas/componentes):**

| # | Prompt | Complejidad |
|---|--------|-------------|
| 11 | Detalle de certificación | Alta (vista previa PDF, QR, historial, revocar) |
| 12 | Vista previa PDF complementario | Alta (debe parecerse al certificado real) |
| 13 | Listado de cursos | Media |
| 14 | Detalle de curso | Media |
| 15 | Listado de certificaciones | Media |
| 16 | Listado de alumnos | Media |
| 17 | Detalle de alumno administrativo | Media |
| 18 | Enviar / reenviar certificación | Baja (modal/confirmación) |
| 19 | Revocar certificación | Baja (modal/confirmación crítica) |
| 20 | Carga masiva placeholder | Baja |
| 21 | Auditoría básica | Media |
| 22 | Configuración institucional | Alta (5 secciones, datos globales) |

**Stack observado en v0:**
- Next.js App Router (no Angular).
- Tailwind CSS con tokens custom (`bg-background`, `text-foreground`, etc.) vía `globals.css`.
- Componentes React en `components/admin/` y `components/validacion/`.
- UI base en `components/ui/button.tsx` (patrón shadcn/ui-like).
- Sin tests, sin servicios, sin routing Angular.

### Affected Areas

- `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` — el plan F0-F3 asume `muestra_pagina/` puede estar vacía; solo cubre hasta prompt 10; no prevé los 12 prompts pendientes.
- `docs/frontend/00-angular20-port-v0.md` — está en estado mínimo (36 líneas); no documenta el inventario real de páginas, componentes ni tokens extraídos.
- `muestra_pagina/README.md` — dice "puede estar vacía al inicio" y "cuando Marcos agregue el diseño"; es información desactualizada que puede confundir a Matías.
- `docs/00-indice-general.md` — puede necesitar nuevas entradas si se agregan documentos de planificación extendida.

### Approaches

#### 1. Extender el plan actual con ciclos F4 (Semana 4+)

Añadir una nueva semana al final de `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` con ciclos F4-01 a F4-04 que cubran los prompts 11-22 agrupados por afinidad.

- **Pros:** Mantiene la estructura conocida de F0-F3; Matías ya entiende el formato; cada ciclo sigue teniendo objetivo, rama, prompt, QA y archive.
- **Cons:** El documento se vuelve largo (~1500+ líneas); los ciclos F4 pueden quedar lejos en el tiempo y perder prioridad.
- **Effort:** Medium (documentación/planificación).

#### 2. Crear un segundo documento `MATIAS_PROMPTS_SDD_F4_F5.md`

Dejar `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` como "Fase 1 — Base y features mínimos" y crear un nuevo documento para "Fase 2 — Listados, detalles, configuración y cierre".

- **Pros:** No rompe el documento vigente que Matías ya leyó; permite versionar por fase; más fácil de mantener.
- **Cons:** Matías debe saber cuándo cambiar de documento; hay que actualizar `docs/00-indice-general.md` y `AGENTS.md` para referenciarlo.
- **Effort:** Medium.

#### 3. Actualizar solo la documentación de estado y dejar que Matías pida ciclos bajo demanda

Sincronizar `docs/frontend/00-angular20-port-v0.md` con el inventario real, actualizar `muestra_pagina/README.md`, y agregar una sección de "Próximos prompts pendientes" en la guía de Matías sin escribir todos los ciclos F4 de antemano.

- **Pros:** Mínimo cambio en el plan; evita planificación excesiva de ciclos que pueden cambiar de prioridad; Matías pide ciclo a ciclo como lo hace hoy.
- **Cons:** Requiere que Matías (o Marcos) proactivamente pida el siguiente ciclo; falta visibilidad de todo el trabajo restante.
- **Effort:** Low.

### Recommendation

**Opción 2 (documento separado para Fase 2)** es la mejor combinación de orden y flexibilidad.

Razones:
1. La guía actual F0-F3 tiene un scope claro: 3 semanas, onboarding + base + features mínimos. Agrandarla con 12 pantallas más desdibuja ese contrato.
2. Un segundo documento permite que Matías cierre F3-06 (handoff) y luego Marcos decida si continúa con F4 o cambia prioridades.
3. Es más fácil de revisar en PR sin tener que re-leer 1400 líneas de guía anterior.
4. Los prompts pendientes se pueden agrupar en 4-5 ciclos nuevos con su propia semana asignada.

**Acciones concretas necesarias:**

1. **Actualizar `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`:**
   - En `Ciclo F1-01 — Auditar muestra_pagina/`, cambiar el estado de "puede estar vacía" a "ya contiene 7 pantallas implementadas; pendientes 12".
   - Agregar una sección "Prompts pendientes post-F3" con la tabla de 12 ítems faltantes y enlace al futuro documento Fase 2.
   - En `Ciclo F1-02 — Extraer sistema visual desde v0`, agregar referencia explícita a los tokens observados (paleta, tipografía, layout documental).

2. **Actualizar `docs/frontend/00-angular20-port-v0.md`:**
   - Agregar inventario completo de pantallas implementadas y pendientes.
   - Documentar tokens visuales observados: paleta institucional, tipografía sans-serif sobria, monoespaciada para DNI/códigos, composición tipo folio/documento.
   - Listar componentes reutilizables identificados en v0: `HeaderInstitucional`, `FolioCertificado`, `BloqueTrazabilidad`, `AdminShell`, `AccionesPrincipales`, `BandejaPendientes`, etc.
   - Registrar riesgos de portado: Next.js App Router → Angular Router; React hooks → Angular signals/componentes; shadcn/ui-like tokens → Tailwind en Angular.

3. **Actualizar `muestra_pagina/README.md`:**
   - Reemplazar texto de "puede estar vacía" con estado actual: contiene referencia visual v0 activa, 7 pantallas generadas, 12 pendientes. No copiar literalmente.

4. **Crear borrador de `MATIAS_PROMPTS_SDD_FASE2.md`** (opcional, puede dejarse para propose/spec):
   - Semana 4: Detalle certificación + PDF preview + Listado cursos + Detalle curso.
   - Semana 5: Listado certificaciones + Listado alumnos + Detalle alumno + Enviar/Reenviar/Revocar.
   - Semana 6: Carga masiva + Auditoría + Configuración institucional + QA final + build.

### Risks

- **Riesgo de copia literal:** Con 19 pantallas totales, la tentación de copiar JSX de v0 a Angular es alta. La guía y `docs/frontend/` deben reforzar "extraer intención visual, no código".
- **Riesgo de desactualización:** Si se generan más pantallas en v0 (prompts 11-22) antes de que Matías porte las primeras, la referencia visual cambia y el port se desfasa.
- **Riesgo de scope creep:** Los prompts 11-22 incluyen funcionalidades complejas (PDF preview, QR, revocación, config institucional). Si no se definen specs previas, Matías podría implementar más allá del MVP.
- **Riesgo de documentación fragmentada:** Si no se actualiza `docs/frontend/00-angular20-port-v0.md` ahora, Matías operará sin una fuente de verdad visual consolidada.
- **Riesgo de ruta pública:** `AGENTS.md` dice "no versionar builds pesados"; `muestra_pagina/` ya tiene `pnpm-lock.yaml` (122K) y `node_modules` no está (bien), pero hay que asegurar que no se versione la carpeta completa.

### Ready for Proposal

**Sí.**

El orchestrator debería proponerle al usuario:
1. Actualizar `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` para reflejar que `muestra_pagina/` ya tiene contenido y que faltan 12 prompts.
2. Actualizar `docs/frontend/00-angular20-port-v0.md` con inventario, tokens y riesgos de portado.
3. Actualizar `muestra_pagina/README.md` con estado real.
4. Decidir si se crea un segundo documento de planificación (Fase 2) o se dejan los prompts pendientes como lista trazable.

No se requiere implementación de código Angular/PHP/DB en esta fase.
