# AGENTS.md — openspec/

## Alcance

Esta carpeta contiene specs SDD, cambios activos y archivo histórico.

## Reglas

- Trabajar un cambio SDD por vez.
- No implementar producto desde esta carpeta.
- Mantener specs con escenarios Given/When/Then cuando aplique.
- No borrar cambios archivados: son evidencia.
- Al cerrar un ciclo, ejecutar `sdd-archive` y actualizar `openspec/specs/` si el contrato cambió.

## Seguridad

No registrar secretos, dumps, logs ni rutas privadas con valores reales.
