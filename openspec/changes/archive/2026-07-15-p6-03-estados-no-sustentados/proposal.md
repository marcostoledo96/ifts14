# Propuesta: P6-03 — Eliminar Estados No Sustentados

## Intención

El frontend muestra estados de entrega (`entregado`, `pendiente-entrega`, `requiere-nueva-entrega`) y copy legal (`firma digital verificada`, `validez legal`) que no tienen persistencia en el backend ni aprobación institucional. Se eliminan para alinear UI con realidad del sistema.

## Alcance

### En alcance
- Eliminar `TipoEnvio` del modelo y campo `envio` de `Certificacion`
- Eliminar filtros de envío del listado de certificaciones
- Eliminar columna "Entrega" de la tabla de certificaciones
- Suprimir "firma digital verificada" en preview y PDF preview
- Suprimir "validez legal" / "validez legal y académica"

### Fuera de alcance
- Reemplazar con estados reales (eso es rediseño, no cleanup)
- Cambios en backend
