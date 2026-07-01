# Staging cPanel — /certificados_staging/

Guía documental para preparar un futuro staging del módulo de certificaciones en cPanel. Este ciclo no ejecuta deploy, no sube archivos, no modifica cPanel y no afecta la ruta productiva `/certificados/`.

## Objetivo

Dejar una ruta de revisión segura para una instalación futura bajo:

```txt
/certificados_staging/
```

La guía productiva vigente sigue siendo [`00-cpanel-certificados.md`](00-cpanel-certificados.md). Este documento solo cubre staging.

## Alcance

### Incluye

- Checklist para preparar un paquete futuro de staging.
- Rutas esperadas para frontend, API y smoke checks con datos ficticios.
- Configuración de ejemplo con placeholders, basada en [`certificados-config.example.php`](../../apps/backend-php/config/certificados-config.example.php).
- Rollback manual limitado a staging.

### No incluye

- Deploy real, uploads ni cambios en cPanel.
- Uso de datos reales, credenciales, tokens, claves privadas, volcados, bitácoras o configuraciones reales.
- Cambios en producción bajo `/certificados/`.
- Artefactos descargados del servidor ni contenido privado fuera de versión.

## Rutas y estructura esperada

| Elemento | Ruta de staging | Observación |
|---|---|---|
| Frontend | `/certificados_staging/` | Debe usar base pública de staging. |
| API | `/certificados_staging/api/` | Debe responder `GET /certificados_staging/api/health`. |
| Validación pública | `/certificados_staging/validar/TOKEN_FICTICIO` | Solo con token ficticio. |
| Producción | `/certificados/` | No se modifica en este ciclo. |

Antes de considerar seguro cualquier paquete de staging, revisar que no queden prefijos productivos hard-codeados:

| Punto de control | Valor esperado para staging |
|---|---|
| Angular `baseHref` | `/certificados_staging/` |
| Base de API usada por el frontend | `/certificados_staging/api` |
| `.htaccess` de raíz | `RewriteBase /certificados_staging/` y fallback a `/certificados_staging/index.html`. |
| `.htaccess` de API | Fallback o rewrite hacia `/certificados_staging/api/index.php`. |
| Backend | Normalizadores, validaciones o checks de prefijo deben aceptar `/certificados_staging/` y no forzar `/certificados/`. |

Si cualquiera de estos puntos todavía apunta a `/certificados/`, el paquete de staging no es seguro para subir.

Estructura orientativa para una ventana futura:

```txt
certificados_staging/
├── index.html
├── assets/
├── .htaccess
└── api/
    ├── index.php
    ├── .htaccess
    ├── src/
    └── config/
```

## Checklist seguro de paquete

Antes de cualquier ventana operativa futura, confirmar:

- [ ] El paquete apunta a `/certificados_staging/`, no a `/certificados/`.
- [ ] La configuración real queda fuera de Git y fuera del paquete versionable.
- [ ] No contiene credenciales, tokens, peppers ni claves privadas.
- [ ] No contiene archivos de entorno reales ni configuraciones reales de conexión.
- [ ] No contiene volcados SQL, bitácoras, copias de resguardo ni paquetes comprimidos descargados del servidor.
- [ ] No contiene carpetas de dependencias instaladas por Composer ni artefactos generados innecesarios.
- [ ] No contiene material privado ni archivos cuyo origen o sensibilidad no esté claro.
- [ ] Frontend, API, `.htaccess` y checks backend fueron reescritos para `/certificados_staging/`.
- [ ] Existe una copia de resguardo de staging antes de subir; si es primera instalación, existe plan de reversión por retiro/renombre de la carpeta nueva.
- [ ] Dependencias Composer resueltas operativamente sin versionar `vendor/`.
- [ ] Staging usa una ubicación de configuración externa propia, sin fallback a producción.
- [ ] `certificate_storage_path` de staging queda fuera del webroot público o protegido por `.htaccess`.
- [ ] Si hay duda sobre un archivo, se excluye del paquete y se consulta antes de continuar.

## Dependencias Composer para staging

`vendor/` no se versiona ni se incorpora al repo. Antes de excluirlo del paquete versionable, resolver dependencias de una de estas dos formas operativas:

1. Preferente: ejecutar en el hosting `composer install --no-dev --no-interaction` junto al `composer.lock` versionado.
2. Si el hosting no tiene Composer: generar `vendor/` localmente desde el `composer.lock` y subirlo solo como artefacto operativo del deploy, sin agregarlo a Git.

Sin una de estas dos opciones confirmada, la API de staging puede quedar incompleta y el paquete no debe considerarse listo.

## Configuración de staging con placeholders

Usar solo placeholders ficticios. La configuración real se completa fuera de Git y preferentemente fuera de la carpeta pública.

```php
return [
    'db_host' => 'HOST_STAGING_FICTICIO',
    'db_name' => 'DB_STAGING_FICTICIA',
    'db_user' => 'USUARIO_STAGING_FICTICIO',
    'db_pass' => 'CLAVE_STAGING_FICTICIA',
    'token_pepper' => 'PEPPER_STAGING_FICTICIO',
    'public_base_url' => 'https://example.edu.ar/certificados_staging',
    'certificate_storage_path' => 'RUTA_STORAGE_STAGING_FICTICIA',
    'delivery_transport' => 'stub',
];
```

La clave `public_base_url` debe apuntar a `/certificados_staging/`. No reutilizar la base productiva `/certificados/` para staging.

La ubicación de configuración real de staging debe ser explícita y separada de producción. Usar `CERTIFICADOS_CONFIG_PATH` o un mecanismo equivalente apuntando a un archivo externo propio de staging. Si esa ruta no está definida o no existe, staging debe fallar cerrado; no debe caer al archivo productivo ni a una ruta default compartida.

## Almacenamiento de PDFs de staging

`certificate_storage_path` de staging debe apuntar a un storage ficticio o de prueba separado del productivo. La opción preferente es ubicarlo fuera del webroot público. Si por restricción del hosting queda dentro de una carpeta pública, protegerlo con `.htaccess` para impedir listado y acceso directo:

```apache
Options -Indexes
Deny from all
```

No servir PDFs de staging por URL directa. Las pruebas deben usar certificados ficticios y archivos de prueba eliminables.

## Smoke checks con datos ficticios

Después de una instalación futura autorizada, validar únicamente con datos ficticios:

| Caso | Check | Resultado esperado |
|---|---|---|
| Health API | `GET /certificados_staging/api/health` | Respuesta controlada de salud. |
| Ruta frontend | `GET /certificados_staging/validar/TOKEN_FICTICIO` | Fallback o pantalla pública de staging. |
| Token inexistente | `GET /certificados_staging/api/certificados/TOKEN_FICTICIO/verificacion` | Respuesta pública controlada, sin datos reales. |
| Internos API | Ruta interna de `src/` o `config/` | No queda expuesta públicamente. |

No consultar certificados reales, DNI reales, tokens reales ni bitácoras productivas durante este smoke.

## Rollback limitado a staging

Antes de cualquier subida futura, crear una copia de resguardo de `/certificados_staging/` si la carpeta existe. Registrar nombre, fecha y responsable sin copiar contenido sensible al repo.

Si es la primera instalación y no existe staging previo, el plan de reversión es retirar o renombrar la carpeta nueva de staging y dejar constancia operativa. No usar archivos de producción como reemplazo automático.

Si una subida futura de staging falla:

1. Detener cambios manuales en curso.
2. Conservar evidencia general sin copiar datos sensibles.
3. Desde cPanel File Manager, restaurar la copia de resguardo de `/certificados_staging/` si existía.
4. Si era primera instalación, retirar o renombrar la carpeta nueva de staging.
5. Verificar nuevamente `GET /certificados_staging/api/health` cuando corresponda.
6. Confirmar que `/certificados/` no fue modificado.

El rollback de staging no debe tocar producción ni reutilizar archivos productivos sin revisión.

## Plan de reversión documental

Para revertir este ciclo documental:

1. Eliminar este archivo.
2. Quitar el enlace en `deploy/README.md` (ruta desde la raíz del repositorio).
3. Descartar el delta OpenSpec del cambio `staging-cpanel-certificados`.

No hay reversión de servidor porque este ciclo no modifica cPanel ni producción.

## Trazabilidad OpenSpec

| Requisito ADDED | Sección verificable |
|---|---|
| Guía documental de staging separada | `Objetivo`, `Alcance`, `Rutas y estructura esperada` |
| Checklist seguro de paquete de staging | `Checklist seguro de paquete` |
| Configuración de staging con placeholders | `Configuración de staging con placeholders` |
| Smoke y rollback de staging | `Smoke checks con datos ficticios`, `Rollback limitado a staging` |
| Reescritura de prefijos productivos | `Rutas y estructura esperada`, `Checklist seguro de paquete` |
| Dependencias Composer sin versionar `vendor/` | `Dependencias Composer para staging` |
| Configuración externa separada de staging | `Configuración de staging con placeholders` |
| PDFs de staging protegidos | `Almacenamiento de PDFs de staging` |

Spec vigente: [`openspec/specs/deploy-cpanel-certificados/spec.md`](../../openspec/specs/deploy-cpanel-certificados/spec.md). Delta archivado: [`openspec/changes/archive/2026-06-30-staging-cpanel-certificados/specs/deploy-cpanel-certificados/spec.md`](../../openspec/changes/archive/2026-06-30-staging-cpanel-certificados/specs/deploy-cpanel-certificados/spec.md).

## Preguntas abiertas

- [ ] Confirmar si el staging futuro usará definitivamente `/certificados_staging/` en el dominio principal o un subdominio.
- [ ] Confirmar quién aprueba la ventana operativa futura.
