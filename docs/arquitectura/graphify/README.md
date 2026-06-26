# Uso seguro de Graphify

Graphify puede ayudar a Marcos a consultar la arquitectura del repositorio, pero no debe indexar material privado, dumps, logs ni artefactos pesados.

## Reglas obligatorias

- Solo Marcos ejecuta Graphify en este proyecto.
- Matías consume únicamente resúmenes versionados y aprobados.
- `.graphifyignore` debe existir antes de cualquier ejecución.
- `graphify-out/` no se versiona.
- No se indexa `material_privado_no_versionar/`, secretos, dumps, backups, uploads, logs ni capturas pesadas.

## Flujo seguro

1. Revisar `.graphifyignore`.
2. Confirmar que `.gitignore` excluye `graphify-out/`.
3. Ejecutar Graphify solo sobre el repo seguro.
4. Extraer conclusiones en un resumen breve versionable.
5. Borrar o mantener localmente artefactos pesados según necesidad; no commitearlos.

## Evidencia permitida

| Permitido | Prohibido |
|---|---|
| Rutas de archivos seguros | Contenido de dumps SQL |
| Resumen de módulos y dependencias | Credenciales o `.env` |
| Decisiones de arquitectura | Logs reales o datos personales |
| Riesgos generales | Capturas pesadas o material privado |

## Para Matías

Matías no ejecuta Graphify. Si necesita contexto, debe pedir a Marcos un resumen aprobado y versionado en `docs/`.
