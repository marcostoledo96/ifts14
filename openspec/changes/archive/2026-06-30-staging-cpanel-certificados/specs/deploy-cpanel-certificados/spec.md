# Delta para deploy-cpanel-certificados

## ADDED Requirements

### Requirement: Guía documental de staging separada

La documentación DEBE agregar una guía de staging separada para `/certificados_staging/` y DEBE distinguirla del deploy productivo `/certificados/`. La guía DEBE declarar que este ciclo solo prepara documentación y no ejecuta deploy, uploads ni cambios en cPanel o `public_html`.

#### Scenario: Preparación documental de staging

- DADO un operador que prepara un despliegue futuro de staging
- CUANDO consulta la documentación de deploy
- ENTONCES encuentra una guía específica para `/certificados_staging/`
- Y puede distinguirla de la guía productiva para `/certificados/`.

#### Scenario: Staging no ejecutable en este ciclo

- DADO este ciclo SDD documental
- CUANDO una persona busque pasos de ejecución real
- ENTONCES la guía indica que uploads, cPanel y `public_html` quedan fuera de alcance.

### Requirement: Checklist seguro de paquete de staging

La guía de staging DEBE incluir un checklist verificable para preparar un paquete futuro sin secretos, sin material privado, sin dumps, sin logs, sin `vendor/`, sin ZIPs descargados del servidor y sin configuración real.

#### Scenario: Paquete revisado sin material prohibido

- DADO un paquete futuro de staging antes de una ventana operativa
- CUANDO se revisa contra el checklist
- ENTONCES se confirma que solo contiene artefactos versionables o ficticios
- Y se rechaza cualquier secreto, dump, log, `vendor/`, ZIP de servidor o configuración real.

#### Scenario: Duda sobre un artefacto

- DADO un archivo cuyo origen o sensibilidad no está claro
- CUANDO el operador revisa el checklist
- ENTONCES la guía exige no incluirlo en el paquete de staging.

### Requirement: Configuración de staging con placeholders

La guía DEBE documentar configuración de staging solo con placeholders ficticios y DEBE indicar que `public_base_url` apunta a la ruta de staging ficticia `/certificados_staging/`. La configuración real DEBE permanecer fuera de Git y preferentemente fuera del webroot.

#### Scenario: Plantilla de configuración ficticia

- DADO la guía de staging
- CUANDO describe claves como `db_*`, `token_pepper`, `public_base_url` o `certificate_storage_path`
- ENTONCES usa valores ficticios o placeholders
- Y no solicita `.env`, credenciales reales ni rutas privadas reales.

#### Scenario: Base pública de staging

- DADO una revisión de rutas antes del deploy futuro
- CUANDO se valida `public_base_url`
- ENTONCES la guía espera una URL ficticia bajo `/certificados_staging/`, no `/certificados/`.

### Requirement: Smoke y rollback de staging

La guía DEBE incluir smoke checks con datos ficticios para `/certificados_staging/` y un rollback manual por backup/restauración desde cPanel File Manager. El rollback DEBE limitarse a la carpeta de staging y no afectar producción.

#### Scenario: Smoke seguro de staging

- DADO una instalación futura en `/certificados_staging/`
- CUANDO se ejecuten verificaciones posteriores
- ENTONCES se validan health, ruta pública, API y protección de internos con datos ficticios
- Y no se consultan certificados, DNI, logs ni base real.

#### Scenario: Rollback limitado a staging

- DADO una falla posterior a una subida futura de staging
- CUANDO el operador sigue el rollback
- ENTONCES restaura el backup de `/certificados_staging/`
- Y no modifica `/certificados/` productivo.
