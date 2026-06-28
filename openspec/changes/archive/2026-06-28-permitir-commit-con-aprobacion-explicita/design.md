# Design: Permitir commit con aprobación explícita

## Contexto

Se relaja la prohibición absoluta de `git add` + `git commit` en el flujo de Matías. La nueva regla permite que OpenCode ejecute estos comandos **solo** tras aprobación explícita de Matías en el mismo turno de chat, dentro de un ciclo SDD que haya pasado `sdd-verify`. `git push`, `git merge`, `git rebase`, `git switch` y `git checkout` (salvo lectura) permanecen prohibidos. El flujo de Marcos no se modifica.

## Decisiones de diseño

1. **AGENTS.md (línea 21)**
   - **Qué**: reemplazar `- No commitear, pushear ni mergear automáticamente.` por el párrafo con alcance que lista operaciones permitidas (bajo aprobación) y prohibidas.
   - **Por qué**: es la fuente de verdad raíz; debe quedar explícito que Marcos conserva autoridad total.

2. **GUIA.md (línea 153)**
   - **Qué**: reemplazar `OpenCode puede proponer comandos, pero Marcos/Matías ejecutan commit, push y merge manualmente.` por la redacción que refleja la excepción de aprobación explícita para Matías.
   - **Por qué**: guía humana; debe ser consistente con `AGENTS.md` sin duplicar la prohibición absoluta.

3. **MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md (~18 instancias)**
   - **Qué**: en cada bloque "Prompt exacto para OpenCode" que contenga la prohibición absoluta, reemplazarla por: `No ejecutes push, merge, rebase ni cambio de rama. Podés ejecutar git add y git commit solo cuando yo apruebe el comando exacto en este mismo turno.`
   - **Cómo**: identificar los 18 bloques mediante `grep -n -i "commit, push, merge"` y aplicar reemplazo por variantes de texto exacto (`No ejecutes...`, `no ejecutes...`, `No hagas...`). Se agrupan por variante para usar `replaceAll` donde sea posible, minimizando llamadas `edit`.
   - **Por qué**: mantener consistencia documental y evitar omitir instancias.

4. **MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md (tabla Rol y límites, línea 35)**
   - **Qué**: agregar una fila adicional inmediatamente debajo de la fila `Git` con la nota aclaratoria: `Nota: la relajación de commits aprobados aplica solo al flujo de Matías. Los prompts y reglas de Marcos mantienen la prohibición absoluta.`
   - **Por qué**: maximiza visibilidad para Marcos al regresar; no modifica sus reglas operativas.

5. **Rollout y traceability**
   - Un solo PR que contiene 4 commits atómicos (uno por archivo), con mensajes convencionales:
     - `docs(agents): relajar prohibicion git con aprobacion explicita matias`
     - `docs(guia): actualizar seccion git para aprobacion explicita`
     - `docs(matias-prompts): permitir commit con aprobacion explicita en prompts`
     - `docs(marcos-prompts): agregar nota aclaratoria sobre alcance de matias`

## Estrategia de aplicación atómica

Orden recomendado (mismo PR, commits separados):

1. **AGENTS.md**
   - Reemplazar línea 21 (1 línea → ~6 líneas).
   - Delta estimado: +5 líneas.

2. **GUIA.md**
   - Reemplazar línea 153 (1 línea → 1 línea de redacción actualizada).
   - Delta estimado: 0 líneas (longitud similar).

3. **MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md**
   - Reemplazar ~18 instancias; cada una pasa de 1 línea a 2 líneas.
   - Delta estimado: +18 líneas.

4. **MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md**
   - Agregar 1 fila debajo de la fila `Git` en la tabla "Rol y límites".
   - Delta estimado: +1 línea.

**Total delta estimado**: ~+24 líneas (muy por debajo del presupuesto de 800 líneas).

## Validación de cobertura

Antes de aplicar:
```powershell
rg -n -i "commit, push, merge" MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md | Measure-Object
# Esperado: ~18 líneas
rg -n "No commitear, pushear ni mergear" AGENTS.md
# Esperado: 1 línea (línea 21)
rg -n "ejecutan commit, push y merge" GUIA.md
# Esperado: 1 línea (línea 153)
```

Después de aplicar:
```powershell
rg -n -i "commit, push, merge" MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md | Measure-Object
# Esperado: 0 (o solo en ejemplos de comandos propuestos, no en prohibiciones)
rg -n "No commitear, pushear ni mergear" AGENTS.md
# Esperado: 0
rg -n "ejecutan commit, push y merge" GUIA.md
# Esperado: 0
git status --short
# Esperado: 4 archivos modificados (AGENTS.md, GUIA.md, MATIAS_PROMPTS..., MARCOS_PROMPTS...)
git diff --stat
# Esperado: ~24 líneas insertadas, ~18-20 eliminadas
```

## Diagrama de flujo de aprobación

```
Matías: "cerrá el ciclo y commiteá"
        │
        ▼
OpenCode: ejecuta git status --short + git diff --staged
        │
        ▼
OpenCode: muestra diff a Matías y espera confirmación
        │
        ▼
Matías: "dale, commiteá con este mensaje exacto: docs(matias): verificar entorno"
        │
        ▼
OpenCode: ejecuta git add <archivos> && git commit -m "<mensaje>"
        │
        ▼
OpenCode: reporta hash del commit a Matías
        │
        ▼
Hecho (push/merge/rebase siguen prohibidos)
```

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|-----------|
| Olvidar alguna instancia en MATIAS_PROMPTS | Validación con `grep` antes y después; cuenta debe ser 0. |
| Deriva de redacción entre AGENTS.md y GUIA.md | Aplicar ambos archivos en la misma sesión de apply. |
| Marcos no nota la nota aclaratoria | Ubicarla en fila propia debajo de la fila Git, no como pie de página genérico. |

## Migración / Rollout

No se requiere migración de datos ni feature flags. Es un cambio puramente documental.
- **Entrega**: un solo PR desde la rama activa (`docs/matias-onboarding-windows` o rama dedicada si se prefiere) hacia `main`.
- **Rollback**: `git checkout HEAD -- AGENTS.md GUIA.md MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`.
