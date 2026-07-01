# Especificación: deploy-cpanel-certificados

## Propósito

Definir los requisitos documentales para preparar un deploy manual seguro del módulo `/certificados/` en cPanel, sin ejecutar subidas, sin tocar `public_html` y sin usar datos reales.

## Requisitos

### Requisito: Checklist manual previo

La documentación DEBE incluir un checklist imprimible previo al deploy que confirme alcance, rutas, artefactos permitidos, exclusiones y responsable de aprobación.

#### Escenario: Checklist completo
- DADO un operador que prepara el deploy manual
- CUANDO revisa la guía antes de subir archivos
- ENTONCES encuentra una lista verificable de pasos previos, subida, validación y cierre
- Y confirma explícitamente que este ciclo no ejecuta la subida.

### Requisito: Exclusiones de no subida

La documentación DEBE declarar que no se suben archivos a `public_html`, no se ejecuta deploy real, no se crean `.env` y no se modifica configuración real del servidor.

#### Escenario: Exclusión operativa
- DADO este ciclo SDD documental
- CUANDO una persona busque instrucciones de ejecución
- ENTONCES la spec y la guía indican que la ejecución queda fuera de alcance.

### Requisito: Guardia de material privado

La documentación DEBE prohibir leer, copiar, listar en detalle o versionar material privado, dumps, logs, zips, credenciales, `.env` y configuraciones reales.

#### Escenario: Material sensible detectado
- DADO que existe material privado fuera de versión
- CUANDO se prepara la documentación de deploy
- ENTONCES solo se registran riesgos generales
- Y no se incorporan valores, rutas privadas detalladas ni contenido sensible.

### Requisito: Rutas `.htaccess` para API

La documentación DEBE especificar que las reglas para `/certificados/` no deben capturar `/certificados/api/` y que la API debe responder bajo esa ruta. Además DEBE documentar la separación entre `base href` del frontend y la base URL de la API para `ng serve` y cPanel, de modo que el checkpoint local y el deploy futuro usen el mismo contrato de rutas.

#### Escenario: Rutas profundas y API
- DADO una instalación bajo `/certificados/`
- CUANDO se accede a una ruta de frontend y a `/certificados/api/health`
- ENTONCES la guía espera fallback del frontend fuera de `/api/`
- Y respuesta API controlada dentro de `/api/`.

#### Escenario: Separación `base href` vs `apiBaseUrl`
- DADO la guía de deploy revisable y el smoke local
- CUANDO se documenta la configuración de rutas
- ENTONCES DEBE distinguir `base href /certificados/` (frontend) de `apiBaseUrl` (API).
- Y DEBE NO usar `baseHref` para resolver la URL de la API en `ng serve`.

### Requisito: Compatibilidad `/certificados/` + `/api/` previa al deploy

La documentación DEBE describir la convivencia de la ruta pública Angular `/certificados/` con la API bajo `/certificados/api/` previa a cualquier deploy real, de modo que el smoke local y la guía de deploy usen la misma separación. La separación DEBE mantenerse tanto para `ng serve` (base URL local) como para cPanel (`base href /certificados/`).

#### Escenario: Smoke local con base URL separada
- DADO Angular en `ng serve` con `apiBaseUrl` apuntando a la API PHP local
- CUANDO se accede a `/validar/:tokenCertificacion`
- ENTONCES el frontend DEBE servir la ruta pública y consultar la API sin mezclar `baseHref` con `apiBaseUrl`.

#### Escenario: cPanel con `/certificados/` y `/api/` separados
- DADO la guía de deploy revisable
- CUANDO se describen rutas profundas del frontend y de la API
- ENTONCES DEBE indicar que `.htaccess` aplica fallback solo fuera de `/api/`.
- Y DEBE mantener `/certificados/api/` como ruta API controlada sin capturarla el frontend.

### Requisito: Configuración externa con placeholders

La documentación DEBE usar únicamente placeholders o archivos `.example`, y DEBE indicar que la configuración real queda fuera de Git y preferentemente fuera del webroot.

#### Escenario: Configuración segura
- DADO una guía de deploy revisable
- CUANDO menciona credenciales MariaDB o `token_pepper`
- ENTONCES usa nombres ficticios o placeholders
- Y no crea ni solicita `.env` ni configuración real.

### Requisito: Backup y rollback manual

La documentación DEBE exigir backup previo de `/certificados/` y describir rollback manual mediante restauración del backup en cPanel.

#### Escenario: Rollback documentado
- DADO una falla posterior a una subida futura
- CUANDO el operador sigue el rollback
- ENTONCES puede renombrar o remover la carpeta afectada
- Y restaurar el backup previo sin improvisar pasos.
### Requisito: Validación posterior con datos ficticios

La documentación DEBE incluir validación posterior a una subida futura usando endpoints públicos y datos ficticios, sin base real ni certificados reales.

#### Escenario: Validación segura

- DADO un deploy futuro ya realizado manualmente
- CUANDO se ejecutan pruebas posteriores
- ENTONCES se valida health check y respuestas públicas con tokens ficticios
- Y no se consulta base real desde este ciclo.

### Requisito: Almacenamiento protegido de PDFs de certificados

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

### Requisito: Configuración externa de `public_base_url` y `certificate_storage_path`

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

### Requisito: Rollback de PDFs en plan de reversión

La documentación DEBE incluir en el plan de reversión la eliminación de PDFs ficticios generados en pruebas y la remoción de la ruta de descarga sin afectar certificados emitidos previamente.

#### Escenario: Reversión de PDFs de prueba

- DADO una reversión del cambio PDF/QR
- CUANDO el operador aplica el plan
- ENTONCES DEBE poder retirar PDFs ficticios del storage de prueba
- Y DEBE poder remover la ruta de descarga sin perder certificados previos.

### Requisito: Guía documental de staging separada

La documentación DEBE agregar una guía de staging separada para `/certificados_staging/` y DEBE distinguirla del deploy productivo `/certificados/`. La guía DEBE declarar que este ciclo solo prepara documentación y no ejecuta deploy, uploads ni cambios en cPanel o `public_html`.

#### Escenario: Preparación documental de staging

- DADO un operador que prepara un despliegue futuro de staging
- CUANDO consulta la documentación de deploy
- ENTONCES encuentra una guía específica para `/certificados_staging/`
- Y puede distinguirla de la guía productiva para `/certificados/`.

#### Escenario: Staging no ejecutable en este ciclo

- DADO este ciclo SDD documental
- CUANDO una persona busque pasos de ejecución real
- ENTONCES la guía indica que uploads, cPanel y `public_html` quedan fuera de alcance.

### Requisito: Checklist seguro de paquete de staging

La guía de staging DEBE incluir un checklist verificable para preparar un paquete futuro sin secretos, sin material privado, sin dumps, sin logs, sin `vendor/`, sin ZIPs descargados del servidor y sin configuración real.

#### Escenario: Paquete revisado sin material prohibido

- DADO un paquete futuro de staging antes de una ventana operativa
- CUANDO se revisa contra el checklist
- ENTONCES se confirma que solo contiene artefactos versionables o ficticios
- Y se rechaza cualquier secreto, dump, log, `vendor/`, ZIP de servidor o configuración real.

#### Escenario: Duda sobre un artefacto

- DADO un archivo cuyo origen o sensibilidad no está claro
- CUANDO el operador revisa el checklist
- ENTONCES la guía exige no incluirlo en el paquete de staging.

### Requisito: Configuración de staging con placeholders

La guía DEBE documentar configuración de staging solo con placeholders ficticios y DEBE indicar que `public_base_url` apunta a la ruta de staging ficticia `/certificados_staging/`. La configuración real DEBE permanecer fuera de Git y preferentemente fuera del webroot.

#### Escenario: Plantilla de configuración ficticia

- DADO la guía de staging
- CUANDO describe claves como `db_*`, `token_pepper`, `public_base_url` o `certificate_storage_path`
- ENTONCES usa valores ficticios o placeholders
- Y no solicita `.env`, credenciales reales ni rutas privadas reales.

#### Escenario: Base pública de staging

- DADO una revisión de rutas antes del deploy futuro
- CUANDO se valida `public_base_url`
- ENTONCES la guía espera una URL ficticia bajo `/certificados_staging/`, no `/certificados/`.

### Requisito: Smoke y rollback de staging

La guía DEBE incluir smoke checks con datos ficticios para `/certificados_staging/` y un rollback manual por backup/restauración desde cPanel File Manager. El rollback DEBE limitarse a la carpeta de staging y no afectar producción.

#### Escenario: Smoke seguro de staging

- DADO una instalación futura en `/certificados_staging/`
- CUANDO se ejecuten verificaciones posteriores
- ENTONCES se validan health, ruta pública, API y protección de internos con datos ficticios
- Y no se consultan certificados, DNI, logs ni base real.

#### Escenario: Rollback limitado a staging

- DADO una falla posterior a una subida futura de staging
- CUANDO el operador sigue el rollback
- ENTONCES restaura el backup de `/certificados_staging/`
- Y no modifica `/certificados/` productivo.

### Requisito: Reescritura obligatoria de prefijos productivos en staging

La guía de staging DEBE exigir que frontend, API, `.htaccess` y checks backend usen `/certificados_staging/` y `/certificados_staging/api`, sin conservar prefijos hard-codeados de producción.

#### Escenario: Paquete de staging sin prefijos productivos

- DADO un paquete futuro de staging
- CUANDO se revisa antes de subir
- ENTONCES Angular usa `baseHref /certificados_staging/`
- Y el frontend usa la API `/certificados_staging/api`
- Y `.htaccess` y el backend no fuerzan `/certificados/`.

### Requisito: Backup y primera instalación de staging

La guía de staging DEBE exigir backup previo si ya existe `/certificados_staging/` y DEBE definir rollback de primera instalación cuando no exista staging anterior.

#### Escenario: Staging existente con backup

- DADO una instalación previa de staging
- CUANDO se prepara una nueva subida
- ENTONCES se crea copia de resguardo antes de subir
- Y el rollback restaura esa copia sin tocar producción.

#### Escenario: Primera instalación sin backup previo

- DADO que `/certificados_staging/` no existe todavía
- CUANDO falla la primera instalación
- ENTONCES el rollback retira o renombra la carpeta nueva
- Y no usa archivos productivos como reemplazo automático.

### Requisito: Dependencias Composer de staging sin versionar vendor

La guía de staging DEBE documentar que `vendor/` no se versiona y que las dependencias se instalan con Composer en hosting o se suben como artefacto operativo generado desde `composer.lock` si el hosting no tiene Composer.

#### Escenario: Dependencias resueltas antes del paquete

- DADO un operador que prepara staging
- CUANDO excluye `vendor/` del repo
- ENTONCES confirma `composer install --no-dev --no-interaction` en hosting
- O sube `vendor/` generado operativamente sin versionarlo.

### Requisito: Configuración externa separada para staging

La guía de staging DEBE exigir `CERTIFICADOS_CONFIG_PATH` o mecanismo equivalente hacia una configuración externa propia de staging, sin fallback a producción ni a una ruta default compartida.

#### Escenario: Configuración de staging aislada

- DADO una instalación futura de staging
- CUANDO la ruta de configuración de staging no está definida o no existe
- ENTONCES staging falla cerrado
- Y no reutiliza configuración productiva.

### Requisito: Storage protegido de PDFs de staging

La guía de staging DEBE exigir que `certificate_storage_path` para PDFs de staging quede fuera del webroot público o protegido por `.htaccess`, sin servir PDFs por URL directa.

#### Escenario: PDFs de staging no públicos

- DADO pruebas de certificados ficticios en staging
- CUANDO se configura `certificate_storage_path`
- ENTONCES apunta a storage separado del productivo
- Y queda fuera del webroot público o bloqueado por `.htaccess`.
