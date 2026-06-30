# Delta para deploy-cpanel-certificados

## ADDED Requirements

### Requirement: Almacenamiento protegido de PDFs de certificados

La documentación de deploy DEBE describir `certificate_storage_path` como ubicación preferentemente fuera del webroot público para persistir los PDFs generados, o protegida por `.htaccess` si debe quedar dentro de `public_html`. La documentación DEBE indicar que los PDFs no deben servirse por URL pública directa ni listarse en índices.

#### Escenario: Storage fuera del webroot documentado

- DADO la guía de deploy revisable
- CUANDO se documenta el almacenamiento de PDFs
- ENTONCES DEBE indicar `certificate_storage_path` preferentemente fuera del webroot
- Y NO DEBE exponer rutas reales con valores productivos.

#### Escenario: Storage bajo `.htaccess`

- DADO una restricción del hosting que obliga al storage dentro del webroot
- CUANDO se documenta la protección
- ENTONCES DEBE incluir una regla `.htaccess` que deniegue el acceso directo a PDFs
- Y DEBE registrar la excepción con justificación.

### Requirement: Configuración externa de `public_base_url` y `certificate_storage_path`

La documentación DEBE registrar las claves `public_base_url` y `certificate_storage_path` como configuración externa requerida para la generación/descarga de PDFs, usando únicamente placeholders ficticios en archivos `.example`. La configuración real NO DEBE versionarse en Git ni crearse como `.env`.

#### Escenario: Placeholders en `.example`

- DADO el archivo `certificados-config.example.php`
- CUANDO un operador revisa la configuración de ejemplo
- ENTONCES DEBE encontrar `public_base_url` y `certificate_storage_path` con valores ficticios
- Y NO DEBE encontrar valores reales ni secretos.

#### Escenario: Configuración real fuera de Git

- DADO la guía de deploy revisable
- CUANDO se describe la configuración real
- ENTONCES DEBE indicar que queda fuera de Git y preferentemente fuera del webroot
- Y NO DEBE solicitar `.env` ni credenciales reales.

### Requirement: Rollback de PDFs en plan de reversión

La documentación DEBE incluir en el plan de reversión la eliminación de PDFs ficticios generados en pruebas y la remoción de la ruta de descarga sin afectar certificados emitidos previamente.

#### Escenario: Reversión de PDFs de prueba

- DADO una reversión del cambio PDF/QR
- CUANDO el operador aplica el plan
- ENTONCES DEBE poder retirar PDFs ficticios del storage de prueba
- Y DEBE poder remover la ruta de descarga sin perder certificados previos.