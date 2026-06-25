## Exploration: backend-base-php-certificados (M2-02)

### Current State
- `apps/backend-php/` contiene únicamente `AGENTS.md`; no existe código PHP.
- El contrato API (`docs/backend/01-contrato-api-certificados.md` y OpenSpec) y el modelo de datos (`docs/database/01-modelo-datos-certificados.md` y OpenSpec) están definidos y aprobados documentalmente.
- El material original del servidor incluye una carpeta `api/` procedural y `api.zip` sin descomprimir ni auditar en profundidad; no se debe reutilizar a ciegas.
- El hosting objetivo es cPanel con ruta pública `public_html/certificados/api/`.
- PHP objetivo: 8.4.21. Se requiere PDO, prepared statements, configuración externa y manejo de errores seguro.

### Affected Areas
- `apps/backend-php/` — estructura nueva completa.
- `docs/backend/00-php84-api.md` — actualizar al cerrar con estructura real creada.
- `docs/02-arquitectura.md` — validar que la estructura mínima propuesta sigue la separación de capas documentada.
- `deploy/` — `.htaccess` para reescritura de rutas bajo `/certificados/api/`.

### Approaches
1. **Monolito procedural mínimo** (`index.php` + includes planos)
   - Pros: Un solo archivo ejecutable, sin clases, fácil de validar con `php -l`, cero abstracciones especulativas.
   - Cons: Difícil de mantener cuando crezca a M2-03/M3-01; mezcla configuración, routing y respuesta.
   - Effort: Low

2. **Separación mínima por responsabilidad** (`index.php`, `Response.php`, `Config.php`, `Database.php`)
   - Pros: Cumple la separación mínima de `docs/02-arquitectura.md` (config, rutas, acceso a datos), mantiene PDO y el manejo de errores en archivos pequeños y testeables, evita el desorden del monolito.
   - Cons: Cuatro archivos en lugar de uno; riesgo de sobreingeniería si se agregan capas de servicio/repositorio antes de M2-03.
   - Effort: Low

3. **Reutilizar estructura original descargada**
   - Pros: Podría aprovechar código existente del servidor.
   - Cons: El código original no fue auditado ni descomprimido; riesgo de heredar credenciales, patrones inseguros o procedimientos obsoletos. Prohibido por las reglas de seguridad del repo.
   - Effort: High (requiere auditoría previa)

### Recommendation
**Opción 2, en modo Ponytail ultra:** crear únicamente los archivos imprescindibles que habiliten PDO y errores seguros, sin endpoints de negocio (salvo `GET /health` como prueba de vida inocua).

Estructura recomendada:
```
apps/backend-php/
├── index.php              # Front controller: carga config, enruta /health, captura errores
├── src/
│   ├── Config.php         # Carga configuración real desde ruta fuera de Git; falla segura si no existe
│   ├── Response.php       # Helper estático para envelope JSON (data/meta y error/meta)
│   └── Database.php       # Fábrica PDO lazy; usa Config; no conecta en M2-02 si no hay config real
└── .htaccess              # RewriteEngine On + FallbackResource /certificados/api/index.php (o equivalente)
```

Notas clave:
- **No `public/` subcarpeta**: en cPanel la carpeta `apps/backend-php/` se copiará directamente a `public_html/certificados/api/`; un subdirectorio `public/` agregaría un nivel de ruta innecesario y riesgo de deploy.
- **No credenciales en repo**: `Config.php` solo define *cómo* cargar un archivo externo (ej. `../../../config/certificados-config.php` fuera del webroot). El archivo real lo crea Marcos manualmente en el servidor.
- **No `.env` versionado**: se usa un archivo PHP plano externo (retorna array) en lugar de `.env`, evitando dependencias y cumpliendo la prohibición de versionar `.env`.
- **`GET /health`**: endpoint trivial que devuelve `{"status":"ok","service":"certificados-api"}` y verifica que el envelope JSON funciona. No toca base de datos ni expone datos sensibles. Está explícitamente fuera del alcance de M2-03.

### Risks
- **Riesgo de ruta de config externa**: si la ruta hardcodeada en `Config.php` no coincide con la estructura de cPanel, el deploy fallará. Mitigación: documentar la ruta esperada y validar en M3-02.
- **Riesgo de `php -m` sin `pdo_mysql`**: el entorno local de desarrollo de Marcos podría no tener la extensión habilitada. Mitigación: el ciclo debe incluir `php -m` como checkpoint obligatorio antes de avanzar.
- **Riesgo de `.htaccess` incompatible con cPanel**: reglas de rewrite pueden variar según la configuración de Apache del hosting. Mitigación: usar `FallbackResource` (Apache 2.4+) o reglas `mod_rewrite` mínimas y probar en carpeta aislada.
- **Riesgo de abstracción prematura**: crear `Database.php` o `Response.php` podría verse como "para el futuro". Mitigación: son necesarios para el objetivo explícito de M2-02 (PDO + errores seguros). No se crean servicios, controladores ni repositorios hasta M2-03.

### Ready for Proposal
**Yes.** Se cuenta con contrato, modelo de datos, stack confirmado y área de trabajo vacía. El alcance entre M2-02 (base segura) y M2-03 (validación pública) es claro: M2-02 no implementa `/{token}/verificacion` ni `POST /consulta`, ni conecta a base real.

### Archivos leídos
1. `AGENTS.md` (raíz)
2. `README.md`
3. `GUIA.md`
4. `docs/00-indice-general.md`
5. `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` (M2-02 y contexto)
6. `apps/backend-php/AGENTS.md`
7. `docs/backend/00-php84-api.md`
8. `docs/backend/01-contrato-api-certificados.md`
9. `docs/database/01-modelo-datos-certificados.md`
10. `docs/02-arquitectura.md`
11. `openspec/specs/backend-contrato-api-certificados/spec.md`
12. `openspec/specs/backend-modelo-datos-certificados/spec.md`

### Verificación de estado del repo
- `git status --ignored --short`: solo `!! .atl/.skill-registry.cache.json` y `!! material_privado_no_versionar/`. Sin archivos sensibles en stage.
- `apps/backend-php/`: únicamente `AGENTS.md`. Sin archivos PHP previos.
