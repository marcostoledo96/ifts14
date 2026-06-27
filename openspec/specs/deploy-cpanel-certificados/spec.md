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

La documentación DEBE especificar que las reglas para `/certificados/` no deben capturar `/certificados/api/` y que la API debe responder bajo esa ruta.

#### Escenario: Rutas profundas y API
- DADO una instalación bajo `/certificados/`
- CUANDO se accede a una ruta de frontend y a `/certificados/api/health`
- ENTONCES la guía espera fallback del frontend fuera de `/api/`
- Y respuesta API controlada dentro de `/api/`.

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
