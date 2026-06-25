# Diseño: Actualizar plan de Matías tras disponibilidad de v0

## Enfoque técnico

Cambio solo documental. Se actualizan fuentes vigentes para que Matías vea el estado real de `muestra_pagina/`, cierre F0-F3 sin ampliar alcance y continúe en un documento separado de Fase 2. La fuente de verdad del port visual queda en `docs/frontend/00-angular20-port-v0.md`; los demás documentos enlazan o resumen lo mínimo necesario.

## Decisiones de arquitectura documental

| Decisión | Alternativas consideradas | Resolución y fundamento |
|---|---|---|
| Separar Fase 2 | Extender la guía F0-F3 con F4-F6 | Crear `MATIAS_PROMPTS_SDD_FASE2.md`. Evita una guía demasiado larga y conserva el contrato original de 3 semanas. |
| Fuente única del port v0 | Repetir inventario en cada guía | `docs/frontend/00-angular20-port-v0.md` concentra inventario, tokens, componentes, estados y riesgos. Reduce duplicación. |
| README liviano en `muestra_pagina/` | Documentar todo el análisis visual ahí | Mantenerlo como puerta de entrada y advertencia de uso. El análisis vive en `docs/frontend/`. |
| Índice como mapa | Copiar estado, prompts o inventario en el índice | `docs/00-indice-general.md` solo enlaza F0-F3, Fase 2 y fuente frontend. Facilita descubrimiento sin duplicar. |
| Español formal argentino | Mantener defaults SDD en inglés | Los artefactos documentales del repo deben respetar `AGENTS.md`: español argentino formal, claro y breve. |

## Flujo documental

```txt
muestra_pagina/ ──estado visual──→ docs/frontend/00-angular20-port-v0.md
       │                                      │
       └──uso permitido──→ muestra_pagina/README.md
                                              │
MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md ──handoff──→ MATIAS_PROMPTS_SDD_FASE2.md
                                              │
                         docs/00-indice-general.md enlaza fuentes vigentes
```

## Cambios por archivo

| Archivo | Acción | Descripción |
|---|---|---|
| `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | Modificar | Actualizar ruta rápida, uso de `muestra_pagina/` y cierre F3-06: 7 pantallas disponibles para prompts 4-10, prompts 11-22 pendientes y enlace a Fase 2. No agregar F4-F6 aquí. |
| `MATIAS_PROMPTS_SDD_FASE2.md` | Crear | Guía operativa de prompts 11-22 agrupados en F4-F6, con lecturas mínimas, restricciones, validaciones, QA, archive y reporte. |
| `docs/frontend/00-angular20-port-v0.md` | Modificar | Convertir en fuente de verdad: estado de referencia v0, inventario de pantallas/capturas, tokens visuales, componentes candidatos, estados, riesgos y regla de no copiar React/Next. |
| `muestra_pagina/README.md` | Modificar | Describir estado actual de carpeta no vacía, uso permitido como referencia visual/funcional y derivación al documento frontend. |
| `docs/00-indice-general.md` | Modificar | Agregar `MATIAS_PROMPTS_SDD_FASE2.md` como planificación vigente diferenciada, sin replicar contenido. |

## Responsabilidades y límites

| Documento | Responsabilidad | No debe contener |
|---|---|---|
| F0-F3 | Onboarding, entorno, ciclos 0-3, handoff | Prompts F4-F6 completos. |
| Fase 2 | Ejecución futura de prompts 11-22 | Inventario visual detallado duplicado. |
| Port v0 | Fuente visual/técnica del port | Prompts operativos extensos. |
| README `muestra_pagina` | Estado y reglas de uso | Análisis largo ni instrucciones Angular. |
| Índice | Descubrimiento de rutas vigentes | Estado duplicado, prompts o checklist extensas. |

## Estructura Fase 2

| Ciclo | Prompts | Tema | Bloqueos esperados |
|---|---:|---|---|
| F4 | 11-14 | Detalle de certificación, PDF complementario, cursos y detalle de curso | PDF/QR o contrato backend no aprobado. |
| F5 | 15-18 | Listados administrativos, alumnos y reenvío | Datos personales, contrato de alumnos/envíos. |
| F6 | 19-22 | Revocación, carga masiva, auditoría y configuración institucional | Seguridad, permisos, importación masiva y configuración real. |

Cada ciclo debe exigir spec previa si depende de API, PDF, QR, permisos, auditoría o configuración no aprobada.

## Estrategia de revisión y rollback

Mantener el cambio en 5 archivos documentales, dentro del presupuesto de 800 líneas. Revisar primero límites/fuentes, luego Fase 2. Rollback por archivo con `git checkout -- <archivo>` o eliminación de `MATIAS_PROMPTS_SDD_FASE2.md` antes de commit.

## Pruebas

| Capa | Qué validar | Enfoque |
|---|---|---|
| Documental | Rutas existentes y enlaces correctos | Revisión manual + `git diff --stat`. |
| Spec | Requirements cubiertos | Matriz spec → documento. |
| Seguridad | Sin material privado ni datos sensibles | No leer ni copiar `material_privado_no_versionar/`, dumps, logs o zips. |

## Migración / despliegue

No requiere migración ni despliegue.

## Preguntas abiertas

- [ ] Confirmar si Fase 2 se ejecuta inmediatamente o queda como planificación preparada.
