# AGENTS.md — scripts/

## Alcance

Scripts auxiliares seguros para tareas locales, auditoría o deploy.

## Reglas

- Preferir scripts chicos, explícitos y reversibles.
- No imprimir secretos ni datos personales.
- Validar rutas antes de borrar, mover o sobrescribir.
- Documentar uso y prerequisitos cerca del script.
- Actualizar documentación durante `sdd-archive` si cambia un flujo operativo.

## Prohibido

No automatizar commits, push, merge, deploy destructivo ni lectura de dumps sin aprobación explícita.
