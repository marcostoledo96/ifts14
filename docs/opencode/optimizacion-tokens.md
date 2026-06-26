# Optimización de tokens y costo en OpenCode/Gentle-AI

Guía operativa para reducir contexto repetido, salidas extensas y costo de ciclos SDD sin perder evidencia crítica ni tocar código de producto.

## Ruta rápida

1. Leer solo `AGENTS.md`, `docs/00-indice-general.md`, el ciclo SDD activo y esta guía.
2. Abrir documentos específicos solo cuando el ciclo los cite.
3. Resumir salidas largas; no pegar terminal completa sin síntesis.
4. Cerrar cada ciclo con verify, `sdd-archive`, resumen Engram y evidencia breve.

## Problema que resuelve

| Problema | Regla operativa |
|---|---|
| Contexto raíz repetido | No releer todo el repo; usar índice y ciclo activo. |
| Salidas de terminal largas | Usar `RTK` o resumen equivalente antes de pegar evidencia. |
| Graphify con material sensible | Solo Marcos puede ejecutarlo y únicamente con `.graphifyignore` válido. |
| Prompts monolíticos | Marcos y Matías usan guías breves y referencias enlazadas. |
| Cierre sin limpieza de contexto | Compactar/prunear y guardar resumen al cerrar el ciclo. |

## Herramientas y cuándo usarlas

| Herramienta | Usar cuando | No usar para |
|---|---|---|
| `RTK` | Comandos con salida larga, diffs, listados o logs de build. | Reemplazar evidencia crítica: conservar resultado, error y rutas relevantes. |
| Graphify | Marcos necesita mapa consultable del repo o arquitectura. | Matías, material privado, dumps, logs, capturas pesadas o secretos. |
| Ponytail | Cambios chicos, documentales o mecánicos. | Reducir validación, seguridad, accesibilidad o evidencia solicitada. |
| `karpathy-guidelines` | Cambios quirúrgicos con riesgo de sobrealcance. | Saltar lectura de specs, diseño o tasks. |
| Perfiles eficientes | Documentación, revisión mecánica o bajo riesgo. | Arquitectura compleja, seguridad sensible o verificación crítica. |

OpenCode Go puede reducir costo en tareas de código o análisis adecuadas, usando modelos aprobados por Marcos. Los modelos chicos o baratos no deben usarse solos para decisiones críticas de seguridad, contratos, deploy o base de datos sin revisión humana.

No instalar herramientas ni modificar `~/.config/opencode/opencode.json` sin decisión explícita de Marcos.

## RTK y salidas extensas

Usar compresión o resumen cuando la salida supere lo necesario para revisión.

```bash
rtk gain
```

Targets típicos para envolver o resumir:

- `git diff --stat` y `git diff --name-only`;
- builds y tests con salida larga;
- listados grandes;
- errores repetidos de linters;
- reportes de herramientas IA.

La evidencia mínima debe conservar: comando, resultado, archivo/ruta afectada, error relevante y decisión tomada.

## Graphify seguro

Graphify no se ejecuta si falta `.graphifyignore` o si no excluye material sensible/costoso. Antes de usarlo:

1. Confirmar que existe `.graphifyignore`.
2. Confirmar exclusiones de `material_privado_no_versionar/`, `.env`, dumps SQL, backups, logs, uploads y `graphify-out/`.
3. No indexar secretos, dumps, logs reales ni capturas pesadas.
4. Versionar solo resúmenes aprobados; nunca `graphify-out/`.

Matías no ejecuta Graphify. Si necesita contexto de arquitectura, consume resúmenes versionados y aprobados por Marcos.

## Responsabilidades por rol

| Rol | Responsabilidad |
|---|---|
| Marcos | Validar `.graphifyignore`, ejecutar Graphify si corresponde, aprobar resúmenes versionados, decidir cambios de perfiles o configuración global. |
| Matías | Usar guías breves, ejecutar checks F0, no ejecutar Graphify, no leer material privado y pedir contexto aprobado cuando falte. |

## Acciones prohibidas

- Pegar salidas largas sin resumen.
- Leer todo el repositorio por defecto.
- Ejecutar Graphify sin `.graphifyignore` válido.
- Procesar `material_privado_no_versionar/` fuera de una auditoría autorizada.
- Copiar secretos, dumps SQL, logs reales o credenciales a documentación.
- Instalar herramientas o cambiar configuración global sin aprobación de Marcos.

## Evidencia y cierre

Al cerrar un ciclo, registrar:

- comandos ejecutados y resultado breve;
- archivos tocados;
- rutas omitidas por seguridad;
- si se consultó Graphify o no;
- cómo se resumieron salidas extensas;
- riesgos no cubiertos.

Antes de responder “listo”, guardar resumen de sesión con Engram:

```txt
mem_session_summary: objetivo, descubrimientos, realizado, próximos pasos y archivos relevantes.
```
