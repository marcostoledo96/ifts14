# Diseño (Design): M4-01A

## Arquitectura Documental
Se basa en los documentos ya existentes del contrato de API y modelo de base de datos.
No se requiere diseño de nuevos esquemas en base de datos ni firmas de endpoints adicionales.

## Criterios de Aceptación
1. No debe existir ninguna mención de "reenvío por email" que esté documentada como una funcionalidad activa (MVP).
2. No debe haber endpoints de rotación de tokens (salvo explícitamente listado como algo externo/excepcional).
3. Todas las referencias a autenticación en la capa admin deben confirmar el uso temporal de `X-Admin-Key`.
