# Backend PHP 8.4.21

## Objetivo

Implementar la API del módulo de certificaciones QR usando PHP 8.4.21.

## Principios

- Usar PDO.
- Usar prepared statements.
- No exponer credenciales.
- No imprimir DNI ni tokens completos en logs.
- Separar configuración, rutas, servicios y acceso a datos.
- Mantener documentación en español argentino formal.

## Ruta conceptual

```txt
/certificados/api/
```

## Pendientes

- Confirmar si Composer está disponible.
- Confirmar mecanismo de email.
- Confirmar generación de PDF/QR viable en el hosting.

## Hallazgos de auditoría (hipótesis)

- **Observado**: el material original incluye una carpeta `api/` con subcarpetas PHP por recurso y operaciones CRUD candidatas.
- **Observado**: existen archivos de conexión/configuración bajo `api/`; no fueron abiertos por riesgo de credenciales.
- **Observado**: `api.zip` existe como artefacto comprimido y no fue descomprimido.
- **Hipótesis**: el backend original parece procedural y desplegado en carpeta pública; el nuevo módulo debe separar configuración, servicios y acceso a datos.
