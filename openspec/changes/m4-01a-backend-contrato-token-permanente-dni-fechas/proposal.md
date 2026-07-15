# Propuesta: M4-01A — backend-contrato-token-permanente-dni-fechas

## Descripción
Dado que el ciclo M4-01A no implementa código de producto (PHP/Angular/SQL) y que los contratos ya reflejan en su mayoría las decisiones D0 exigidas, la propuesta es ejecutar una pasada de auditoría formal sobre las especificaciones para asegurar un cierre hermético de las reglas de negocio.

## Pasos propuestos (Interactive Mode)
1. **Spec & Design**: No es necesario crear nuevos archivos de especificación, ya que las specs de `backend-contrato-api-certificados` y `backend-modelo-datos-certificados` son el objetivo y ya están actualizadas. Crearemos los archivos `spec.md` y `design.md` dentro de la carpeta del cambio referenciando a los contratos maestros.
2. **Tasks & Apply**: Generar el checklist final de tareas (validar lectura de archivos, buscar inconsistencias residuales de SMTP o rotación de QR en la documentación general).
3. **Verify**: Verificar que las restricciones (como la prohibición de devolver token completo en responses, o la ausencia de SMTP) estén 100% claras.
4. **Archive**: Guardar el ciclo SDD M4-01A utilizando el protocolo `sdd-archive` y actualizar `docs/00-indice-general.md` si fuese necesario.

## Consideraciones
- **Staging `/certificados_staging/`**: Se confirmará que la documentación de despliegue y URL públicas asuman el path de staging correcto.
- **Gates Composer**: Se verificará que esté claro en el contrato de deploy / backend.

Se solicitará aprobación a Marcos para proceder con las fases de specs y tareas.
