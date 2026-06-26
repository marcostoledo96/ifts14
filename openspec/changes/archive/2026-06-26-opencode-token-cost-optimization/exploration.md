# Exploration: opencode-token-cost-optimization

## Estado actual

La documentación raíz del proyecto está **triplicada** en contenido esencial:

- `AGENTS.md` (121 líneas): stack, carpetas, reglas de seguridad, flujo SDD.
- `README.md` (77 líneas): stack, carpetas, objetivo, reglas de seguridad.
- `GUIA.md` (163 líneas): stack, carpetas, roles, metodología, reglas de seguridad.

Los tres documentos repiten el stack técnico (Angular 20, PHP 8.4.21, MariaDB 10.6.27, cPanel), la estructura de carpetas y las prohibiciones de seguridad. `docs/00-indice-general.md` (50 líneas) suma un cuarto nivel de índice que también replica parte de esa información.

Los prompts operativos amplifican el desperdicio:

- `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` (446 líneas): obliga a leer `AGENTS.md`, `README.md`, `GUIA.md` y `docs/00-indice-general.md` al inicio de **cada ciclo** (~411 líneas de contexto redundante por ejecución).
- `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` (1131+ líneas): mismo patrón, con la diferencia de que el archivo es monolítico; OpenCode lo lee completo aunque solo se ejecute un ciclo puntual.
- `MATIAS_PROMPTS_SDD_FASE2.md` (134 líneas): repite la lectura base y deriva a la guía principal.

Además, faltan reglas de eficiencia operativa:

- **Sin compresión de terminal documentada**: RTK (`rtk init --show`, `rtk gain`) está instalado globalmente pero ningún doc del repo lo menciona.
- **Sin reglas de compactación/prune**: no hay instrucciones sobre cuándo ejecutar `mem_session_summary`, cómo actuar ante mensajes de "compaction" o "FIRST ACTION REQUIRED", ni cómo manejar sesiones largas.
- **Sin protección contra Graphify sobre datos sensibles**: no existe `graphifyignore-seguro.txt` en el repo y `.gitignore` no excluye `graphify-out/`.
- **Sin lazy-loading de prompts**: los documentos de ciclos se leen enteros en lugar de referenciar solo la sección activa.

## Áreas afectadas

- `AGENTS.md` — contiene información que también vive en `README.md` y `GUIA.md`; debe reducirse a reglas específicas de agentes.
- `README.md` — debe ser la carta de presentación del repo, no un duplicado del manual operativo.
- `GUIA.md` — debe orientar a humanos, no replicar el índice ni las reglas técnicas ya existentes en `AGENTS.md`.
- `docs/00-indice-general.md` — índice útil pero con redundancias que pueden simplificarse.
- `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` — fuerza lectura masiva repetida; su anexo de skills duplica `.atl/skill-registry.md`.
- `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` — monolítico; cada ciclo repite el prompt base y las validaciones en un mismo archivo gigante.
- `MATIAS_PROMPTS_SDD_FASE2.md` — repite la lectura base y deriva al doc principal.
- `.gitignore` — falta exclusión para salida de Graphify.

## Enfoques

### 1. Consolidar contexto común en un único documento raíz

Crear un `docs/00-contexto-ifs14.md` (o similar) con el stack, carpetas, reglas de seguridad y flujo SDD que hoy están en tres archivos. Reducir `AGENTS.md`, `README.md` y `GUIA.md` a sus roles específicos. Los prompts operativos solo referenciarían este doc único + el ciclo puntual.

- **Pros**: elimina la triplicación raíz; reduce ~300 líneas de contexto redundante por ciclo; fuente de verdad única.
- **Cons**: requiere un ciclo de refactor documental; los tres archivos raíz deben reescribirse coordinadamente.
- **Esfuerzo**: Medio.

### 2. Refactor de prompts a índice + ciclos desacoplados

Extraer cada ciclo de Marcos y Matías a archivos pequeños bajo `docs/opencode/ciclos/<id>.md`. Los prompts maestros se convierten en índices que solo indican qué archivo leer para el ciclo activo.

- **Pros**: se lee solo el ciclo necesario (20–50 líneas vs. 1100); permite mantenimiento granular.
- **Cons**: más archivos; requiere actualizar `docs/00-indice-general.md` y los prompts maestros.
- **Esfuerzo**: Medio.

### 3. Reglas operativas mínimas de eficiencia de tokens (recomendado como primer paso)

Agregar un documento breve `docs/opencode/eficiencia-token.md` (o una sección en `AGENTS.md`) con reglas concretas:

- Usar RTK para salidas de terminal largas.
- No leer `README.md` + `GUIA.md` + `AGENTS.md` si el índice ya cubre el contexto; leer solo el doc mínimo del rol.
- Ejecutar `mem_session_summary` antes de finalizar sesiones largas.
- Ante "compaction" o "FIRST ACTION REQUIRED", persistir resumen inmediatamente.
- Ejecutar Graphify solo con `graphifyignore-seguro.txt` y nunca sobre `material_privado_no_versionar/`, dumps ni `.env`.
- Los prompts deben referenciar secciones, no leer documentos monolíticos enteros.

- **Pros**: no reestructura documentación existente; bajo riesgo; impacto inmediato en cada ciclo futuro.
- **Cons**: no elimina la redundancia raíz, solo la mitiga mediante reglas de lectura.
- **Esfuerzo**: Bajo.

### 4. Híbrido: consolidación + reglas de eficiencia (ideal a mediano plazo)

Combinar 1 y 3: consolidar contexto común, agregar reglas de eficiencia, y actualizar prompts para leer solo el doc consolidado + ciclo específico.

- **Pros**: máxima reducción de tokens; sostenible a largo plazo.
- **Cons**: mayor esfuerzo inicial; requiere validar que Matías y Marcos entienden la nueva ruta de lectura.
- **Esfuerzo**: Medio-Alto.

## Recomendación

**Ejecutar primero el enfoque 3 (reglas operativas mínimas)** como ciclo independiente de bajo riesgo. Inmediatamente después, evaluar el enfoque 1 (consolidación raíz) si los tokens redundantes siguen siendo un cuello de botella.

Razonamiento:

- El enfoque 3 no toca la estructura actual de prompts ni docs; solo agrega un doc de ~30–40 líneas y actualiza `.gitignore`. Es el cambio viable más chico que produce beneficio real en cada ciclo SDD futuro.
- Una vez validado, la consolidación raíz (enfoque 1) será más segura porque ya existirá una política de lectura mínima documentada.
- No se propone el enfoque 2 (ciclos desacoplados) como primera medida porque fragmentaría los prompts actuales sin resolver primero la redundancia de contexto.

## Riesgos

- **Regresión documental**: al consolidar, se puede perder información que algún lector (humano o IA) esperaba encontrar en su doc habitual. Mitigación: mantener `docs/00-indice-general.md` actualizado como mapa de navegación.
- **Matías lee el prompt monolítico por costumbre**: aunque se documente la lectura mínima, el usuario puede seguir pegando prompts largos. Mitigación: incluir en `AGENTS.md` una regla explícita de "lectura mínima" y en los prompts maestros una advertencia de token-cost.
- **Graphify indexa material sensible antes de que se agregue el ignore**: riesgo inmediato si alguien ejecuta Graphify sin el archivo de exclusión. Mitigación: crear `graphifyignore-seguro.txt` y actualizar `.gitignore` en este mismo ciclo.
- **Olvido de RTK**: si no se documenta, seguirá siendo un conocimiento solo del entorno global. Mitigación: agregar una línea en el doc de eficiencia.

## Listo para propuesta

**Sí.** El siguiente paso es `sdd-propose` para definir:

1. El contenido exacto de `docs/opencode/eficiencia-token.md` (o sección equivalente).
2. Las actualizaciones a `.gitignore` para cubrir `graphify-out/`.
3. La creación de `graphifyignore-seguro.txt` con exclusiones mínimas.
4. Si se incluye también una reducción inicial de `AGENTS.md` / `README.md` / `GUIA.md` o si queda para un ciclo posterior.
