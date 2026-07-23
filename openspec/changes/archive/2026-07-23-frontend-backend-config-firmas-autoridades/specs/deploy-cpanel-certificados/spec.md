# Delta for deploy-cpanel-certificados

## ADDED Requirements

### Requisito: Documentar `signature_storage_path`

La documentación de deploy DEBE registrar `signature_storage_path` como configuración externa para firmas de autoridades, preferentemente fuera del webroot (o protegida si el hosting obliga webroot), usando solo placeholders en `.example`. La guía DEBE indicar que firmas NO se sirven por URL pública directa ni se versionan. La configuración real NO DEBE versionarse en Git.
(Relacionado: mismo patrón que `certificate_storage_path`.)

#### Escenario: Placeholder en `.example`

- DADO `certificados-config.example.php` (o equivalente)
- CUANDO un operador revisa claves de storage
- ENTONCES DEBE encontrar `signature_storage_path` con valor ficticio
- Y NO DEBE encontrar rutas productivas reales ni secretos

#### Escenario: Storage de firmas no público

- DADO la guía de deploy revisable
- CUANDO documenta firmas institucionales
- ENTONCES DEBE exigir storage fuera de webroot o `.htaccess` denegatorio
- Y DEBE distinguir staging vs producción con placeholders

#### Escenario: Rollback de firmas de prueba

- DADO reversión del cambio de firmas
- CUANDO el operador aplica el plan
- ENTONCES DEBE poder vaciar el directorio de firmas de prueba
- Y NO DEBE alterar PDFs de certificados emitidos previamente
