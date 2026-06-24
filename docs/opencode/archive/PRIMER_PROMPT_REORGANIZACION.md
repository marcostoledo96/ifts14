# Primer prompt para reorganizar el repo con OpenCode

Copiar este prompt en OpenCode/Gentle-AI después de crear o revisar `.gitignore`.

```txt
Ejecutá el ciclo SDD inicial de reorganización segura del repo `ifts14`.

Modo:
Planificación + implementación documental mínima si el plan es claro.
No implementes producto.
No crees Angular.
No crees backend PHP.
No crees base de datos.

Contexto actual:
La documentación inicial no está en raíz. Está dentro de:

ifts14_planificacion_opencode_inicial/

Dentro de esa carpeta existen:

- README_PAQUETE.md
- 01_GUIA_ARRANQUE_REPO_IFTS14.md
- 02_ESTRUCTURA_REPO_Y_GITIGNORE.md
- 03_BACKUP_SANITIZACION_AUDITORIA.md
- 04_ARQUITECTURA_ANGULAR20_PHP84_MARIADB.md
- 05_DEPLOY_CPANEL_CERTIFICADOS.md
- 06_SKILLS_DEPENDENCIAS_OPENCODE.md
- 07_PROMPTS_MARCOS_ORDENAMIENTO.md
- 08_PROMPTS_MATIAS_FRONTEND_ANGULAR.md
- 09_PRIMER_COMMIT_GITHUB.md
- 10_DESCARGAR_ESTUDIAR_CODIGO_LOCAL.md
- plantillas/README.md
- plantillas/GUIA.md
- plantillas/AGENTS.md
- plantillas/.gitignore
- plantillas/docs/00-indice-general.md

También existen archivos sensibles o potencialmente sensibles en raíz:

- ifts14_db.sql
- ifts14_dev.sql
- well-known/

Regla crítica:
Antes de cualquier `git add`, crear o aplicar `.gitignore` seguro.
No imprimir credenciales.
No abrir archivos de configuración sensible salvo que sea estrictamente necesario para auditoría, y en ese caso no copiar valores secretos a la respuesta.

Objetivo del ciclo:
Reacomodar el repo para que quede una estructura segura y entendible:

1. Crear `.gitignore` en raíz usando `ifts14_planificacion_opencode_inicial/plantillas/.gitignore` como base.
2. Confirmar que `.gitignore` ignora:
   - material_privado_no_versionar/
   - *.sql
   - *.sql.gz
   - *.zip
   - error_log
   - *.log
   - .env
   - archivos de credenciales tipo db.php, database.php, config.php
   - **/.git/
3. Crear carpeta:
   material_privado_no_versionar/db_dumps_originales/
   material_privado_no_versionar/servidor_original/
4. Mover sin inspeccionar contenido sensible:
   - ifts14_db.sql → material_privado_no_versionar/db_dumps_originales/
   - ifts14_dev.sql → material_privado_no_versionar/db_dumps_originales/
   - well-known/ → material_privado_no_versionar/servidor_original/well-known/
5. Crear archivos raíz desde plantillas si no existen:
   - README.md
   - GUIA.md
   - AGENTS.md
6. Crear docs/00-indice-general.md desde plantillas/docs/00-indice-general.md si no existe.
7. Mover documentación inicial:
   - 01 a 06, 09, 10 y README_PAQUETE.md → docs/planificacion-inicial/
   - 07_PROMPTS_MARCOS_ORDENAMIENTO.md y 08_PROMPTS_MATIAS_FRONTEND_ANGULAR.md → docs/opencode/
8. Crear carpetas base:
   - docs/
   - openspec/specs/
   - apps/frontend-angular/
   - apps/backend-php/
   - database/migrations/
   - database/seeds/
   - database/docs/
   - deploy/cpanel/
   - deploy/htaccess/
   - scripts/
   - muestra_pagina/
9. Crear README o AGENTS breve en carpetas importantes si hace falta.
10. Crear documentación de `sdd-archive`:
    docs/07-sdd-archive-y-mantenimiento-documentacion.md
11. Documentar que `muestra_pagina/` puede estar vacía y que no se debe implementar frontend final hasta que Marcos agregue el diseño v0.
12. Si la carpeta `ifts14_planificacion_opencode_inicial/` queda vacía o duplicada, proponer eliminarla después de verificar que su contenido útil fue movido. No la borres sin listar qué se movió.

Reglas de estilo:
- Español argentino formal.
- Documentación clara y amigable.
- No crear archivos enormes.
- No duplicar documentación innecesaria.
- Si hay contradicciones, frená y preguntá.

Validaciones:
- Ejecutar `git status --ignored` o equivalente si está disponible.
- Confirmar que los SQL y well-known ahora están ignorados.
- Confirmar que `muestra_pagina/` existe aunque esté vacía.
- Confirmar que no hay dumps, logs ni zips listos para commit.

Salida esperada:
1. Archivos leídos.
2. Archivos creados o movidos.
3. Material sensible movido a carpeta ignorada.
4. Confirmación de `.gitignore`.
5. Estado de `muestra_pagina/`.
6. Documentación creada.
7. Riesgos pendientes.
8. Comandos Git sugeridos.
9. Mensaje de commit sugerido.

No hagas commit, push ni merge automáticamente.
```
