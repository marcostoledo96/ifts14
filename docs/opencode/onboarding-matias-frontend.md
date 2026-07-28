# Onboarding de Matías — Frontend Angular 20

Síntesis del rol. Onboarding general: `GUIA.md` + `docs/frontend/03-modulos-admin.md`. Guía histórica F0–F6: `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` en esta misma carpeta.

Ante duda de alcance, consultar la fuente vigente; no inventar.

## Misión

Matías lidera el frontend Angular 20 del módulo `/certificados/`, adaptando la referencia visual de `muestra_pagina/` a componentes propios.
Su trabajo cubre UI/UX, sistema visual, responsive, accesibilidad, QA y handoff visual, manteniendo la identidad institucional del IFTS 14.
No construye backend, base de datos ni gestiona deploy.

## Alcance permitido

- Trabajar con Angular 20 en `apps/frontend-angular/`.
- Extraer la intención visual de `muestra_pagina/` y portarla a componentes Angular propios.
- Construir el sistema visual, layout público/admin y pantallas aprobadas.
- Aplicar Tailwind o el sistema visual confirmado por el equipo.
- Garantizar responsive, accesibilidad y rendimiento en cada pantalla.
- Definir jerarquías de contenido, foco visible, navegación por teclado y contraste.
- Mantener y actualizar la documentación de frontend en `docs/frontend/`.
- Revisar el inventario v0 al iniciar cada ciclo para detectar cambios en `muestra_pagina/` (listado seguro de la carpeta).
- Coordinar con Marcos cuando un cambio técnico requiera tocar estructura base, contratos o build.
- Dejar evidencia de cierre en cada ciclo con `sdd-archive`.

## Fuera de alcance

- Backend PHP, API REST, base de datos MariaDB y lógica de negocio.
- Deploy, configuración de cPanel, `.htaccess` y publicación en `/certificados/`.
- Abrir, listar o versionar contenido de `material_privado_no_versionar/`.
- Guardar datos sensibles, copias de base de datos, registros de servidor ni configuraciones reales en documentación.
- Instalar dependencias no aprobadas ni copiar React/Next literalmente.
- Rehacer el scaffold Angular 20 ya existente en `apps/frontend-angular/`.
- Inventar pantallas o flujos para los prompts 11-22 sin spec y diseño aprobados.
- Implementar PDF, QR, revocación, entrega manual de certificaciones o configuración institucional sin spec previa.
- Decidir cambios en `angular.json`, `package.json` o estilos globales sin coordinar con Marcos.
- Ejecutar `git push` directo a `main`. `git merge`, `git rebase` y merge de PR requieren aprobación explícita, comando exacto y evidencia previa.

## Fuentes de verdad

La síntesis enlaza las 7 fuentes vigentes en lugar de duplicarlas (`docs/AGENTS.md:11`).
Cada fuente se describe brevemente y se vuelve a citar con link en la sección de enlaces.

| Fuente | Qué aporta a la misión |
|---|---|
| `README.md` | Objetivo del repo, stack confirmado, responsables de Matías y reglas de seguridad generales. |
| `GUIA.md` | Guía humana del proyecto: metodología SDD, roles, alcance `/certificados/` y política de ramas. |
| `AGENTS.md` | Reglas obligatorias para OpenCode: lectura mínima, prohibiciones y política Git. |
| `docs/00-indice-general.md` | Mapa de navegación: lectura base por rol y documentación por área. |
| `docs/frontend/00-angular20-port-v0.md` | Inventario v0, división de responsabilidades, elementos visuales y reglas de portado. |
| `muestra_pagina/` (listado seguro) | Referencia visual v0 final y completa (export Next.js/React con capturas para flujos 4-22). El `MANIFIESTO_V0.md` histórico fue retirado al reemplazar la carpeta por el export final. |
| `apps/frontend-angular/AGENTS.md` | Reglas del scaffold Angular 20: estructura por features, no UI sin diseño aprobado. |

Si una fuente cambia, este documento se actualiza solo para mantener los links y la interpretación operativa.
No se copia texto extenso de las fuentes originales.

## Estado del proyecto

`muestra_pagina/` contiene la referencia visual v0 final y completa exportada de Next.js/React, con capturas y prompts Stitch para todos los flujos 4-22. La regla "si está vacía, bloquea UI final" ya no aplica literalmente; la regla efectiva es "no inventar pantallas para flujos sin diseño aprobado".
Esto significa que Matías puede trabajar sobre todos los flujos 4-22, pero debe esperar spec y diseño aprobados antes de implementar los flujos 11-22 (ciclos F4-F6 de la guía unificada).

Los flujos disponibles incluyen: validación pública válida, estados públicos no exitosos, dashboard administrativo, login administrativo, crear/editar curso, registrar asistencias, emitir certificación directa, detalle de certificación, vista previa PDF, listados de cursos, alumnos y certificaciones, entrega manual, revocación, carga masiva, auditoría y configuración institucional.

`apps/frontend-angular/` ya cuenta con el scaffold Angular 20 creado por Marcos: 35/35 tests pasando y build de producción verde.
El scaffold incluye estructura semántica, shell accesible, servicio de validación pública y build preparado para `/certificados/`.
Matías debe respetar esa base técnica y construir el diseño visual sobre ella, sin rehacer el scaffold.
Cualquier propuesta de reorganizar el scaffold requiere spec previa y coordinación con Marcos.

Este documento es la evidencia del capability `mision-matias-sintetizada` del ciclo F0-03.
F0-03 no genera código de producto ni modifica `apps/`, `muestra_pagina/` ni ninguna otra carpeta de producto.
Su único entregable nuevo es esta síntesis operativa y el apply-progress del change.

## Qué sigue

El trabajo de producto frontend arranca en los ciclos F1+:

- F1-01: auditar `muestra_pagina/` y confirmar qué pantallas están listas para portar.
- F1-02: extraer el sistema visual (paleta, tipografía, espaciado, componentes base).
- F1-03 a F1-05: coordinar con Marcos para mantener el scaffold, Tailwind y layouts base.
- A partir de F2: pantallas de administración (cursos, asistencias, certificaciones).
- A partir de F3: validación pública refinada, QA visual, handoff y cierre de la fase.

Antes de F1-01 conviene releer `docs/frontend/00-angular20-port-v0.md` y el listado seguro de `muestra_pagina/` para confirmar el inventario vigente.
Durante F1-01 y F1-02 la rama de trabajo sugerida es `frontend/v0-design-system`. Para F2, usar las ramas específicas de la tabla "Estrategia de ramas recomendada".
La integración con backend y la publicación final siempre quedan en manos de Marcos salvo acuerdo explícito.

Cada ciclo futuro debe cerrarse con `sdd-archive`, actualizar la documentación correspondiente y proponer commit solo con aprobación explícita de Matías o Marcos.

## Evidencia por ciclo

Al cerrar cada ciclo Matías debe dejar:

- Un resumen ejecutivo de lo hecho, por qué se hizo y qué se decidió.
- Lista de archivos tocados y motivo de cada cambio.
- Pruebas automáticas ejecutadas (tests, build, lint) cuando aplique.
- Registro de QA manual: qué se revisó, en qué resoluciones y navegadores.
- Bloqueos encontrados, riesgos materializados y decisiones pendientes.
- Documentación actualizada en `docs/frontend/` u otra área correspondiente.
- Registro de decisiones de diseño que afecten el sistema visual o la experiencia de usuario.
- `verify-report.md` con veredicto PASS y escenarios mapeados a evidencia.
- En `sdd-archive` se fusiona el delta de spec con la spec principal de la capacidad trabajada.
- Comandos Git propuestos (no ejecutados) con diff-confirmation gate.
- Mensaje de commit sugerido, por ejemplo: `docs(matias): registrar onboarding frontend`.

## Prohibiciones operativas

Política Git vigente:

- No ejecutar `git push` directo a `main`. `git merge`, `git rebase` y merge de PR requieren aprobación explícita, comando exacto y evidencia previa.
- `git add` + `git commit` + `git push` a la rama actual solo con aprobación explícita de Matías o Marcos en el mismo turno.
- **Diff-confirmation gate**: antes de `git add`, correr `git status --short` y `git diff --name-only`, presentar el diff y esperar confirmación.
- **Branch-confirmation gate**: antes de crear o cambiar de rama, confirmar rama fuente, árbol limpio y aprobación explícita.
- Pre-push safety: `git log origin/<rama>..<rama> --oneline` y `git diff origin/<rama>..<rama> --stat` antes de `git push`.

Estas reglas evitan que OpenCode ejecute cambios destructivos o commitee sin revisión.
Matías siempre debe aprobar explícitamente en el mismo turno del chat y confirmar el diff antes de cualquier stage o push.

Operativas generales:

- No procesar material privado, copias de base de datos, registros de servidor ni datos sensibles (`AGENTS.md`).
- No duplicar documentación: enlazar la fuente vigente (`docs/AGENTS.md:11`).
- No inventar pantallas o flujos sin diseño aprobado.
- No tocar el cambio activo de Marcos (`openspec/changes/backend-public-endpoint-hardening/`) ni las ramas ajenas.

## Enlaces a las 7 fuentes

- [README.md](../../README.md): define el objetivo del módulo `/certificados/`, el stack confirmado y la división de responsabilidades entre Marcos y Matías. Es el primer documento que debe leerse al arrancar y el punto de partida para entender qué parte del frontend le corresponde.

- [GUIA.md](../../GUIA.md): explica la metodología SDD, el alcance del módulo, la política de ramas y la regla principal de no implementar lo que no está claro. Sirve como guía humana cuando hay que decidir si un flujo entra o no en el ciclo.

- [AGENTS.md](../../AGENTS.md): contiene las reglas obligatorias para OpenCode/Gentle-AI, la lectura mínima, las prohibiciones Git y el tratamiento de material privado. Es la referencia para las prohibiciones operativas.

- [docs/00-indice-general.md](../00-indice-general.md): mapa de navegación que indica qué documentos leer según el rol y el área afectada por el ciclo activo. Permite no perderse entre la documentación del proyecto.

- [docs/frontend/00-angular20-port-v0.md](../frontend/00-angular20-port-v0.md): fuente de verdad del portado: inventario de pantallas v0, división de trabajo frontend, elementos visuales y reglas de portado. Debe consultarse antes de cada ciclo frontend.

- [muestra_pagina/](../../muestra_pagina/): referencia visual v0 final y completa (export Next.js/React con capturas para flujos 4-22). El `MANIFIESTO_V0.md` histórico fue retirado al reemplazar la carpeta por el export final; el inventario se completa contra el listado seguro de la carpeta.

- [apps/frontend-angular/AGENTS.md](../../apps/frontend-angular/AGENTS.md): reglas del scaffold Angular 20 existente: estructura por features, prioridad de accesibilidad/responsive/rendimiento y conexión futura con la API PHP. Define la base técnica sobre la que trabaja Matías.

---

Este documento se mantiene como referencia operativa.
Cualquier cambio de alcance, stack o división de responsabilidades debe reflejarse primero en la fuente vigente y luego en esta síntesis.
