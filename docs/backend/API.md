# API backend — emisión desde asistencias

Resumen operativo del ciclo `backend-emision-desde-asistencias`. El contrato completo vive en `docs/backend/01-contrato-api-certificados.md`.

## Emisión administrativa

`POST /certificados/api/admin/certificados` ahora emite desde entidades reales:

```json
{
  "alumnoId": 1,
  "cursoId": 2,
  "issuedAt": "2026-07-02",
  "expiresAt": null
}
```

La respuesta administrativa conserva `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix`. No devuelve DNI completo ni token completo como campo separado.

## Validación pública

Para certificados nuevos, el DTO público usa:

- `student.documentNumber`: DNI descifrado desde `cert_alumnos.dni_cifrado`.
- `course.attendedDates`: fechas del snapshot `cert_certificado_fechas`.

Los certificados legacy mantienen fallback con `documentMasked` y no inventan `attendedDates`.

## Configuración obligatoria

- `token_encryption_key`: recupera el token permanente para entrega manual/PDF.
- `dni_cipher_key`: descifra DNI para validación pública y PDF.

Ambas claves deben vivir fuera de Git y decodificar a 32 bytes.
