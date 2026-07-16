# Especificaciones (Spec): M4-01A — backend-contrato-token-permanente-dni-fechas

Este ciclo es estrictamente documental. No introduce código nuevo ni altera la lógica de negocio ejecutada por PHP.

## Archivos Maestros Afectados
- `openspec/specs/backend-contrato-api-certificados/spec.md`
- `openspec/specs/backend-modelo-datos-certificados/spec.md`

## Reglas de Negocio a Consolidar (D0)
- **DNI Completo**: `student.documentNumber` debe utilizarse en lugar de versiones enmascaradas para la validación pública.
- **Fechas Asistidas**: `course.attendedDates` debe ser listado en la emisión y validación.
- **Token Permanente**: Se elimina la rotación de token.
- **Entrega Manual**: Sin uso de email/SMTP/PHPMailer. Se documenta la estrategia de token cifrado para lectura.

Dado que las especificaciones maestras ya fueron actualizadas y contemplan esto, este documento solo sella la traza de requerimientos para el archivo de este ciclo.
