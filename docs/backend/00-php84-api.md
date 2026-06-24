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
