# Backup, sanitización y auditoría del material descargado

## Material recibido

Se descargaron desde el servidor:

```txt
ifts14_dev.sql.gz
ifts14_db.sql.gz
well-known.zip
```

Hay dos bases separadas. Se deben estudiar, pero no versionar como dumps reales.

## Dónde colocar los archivos

En tu PC, dentro del repo local:

```txt
material_privado_no_versionar/
├── servidor_original/
│   └── well-known.zip
└── db_dumps_originales/
    ├── ifts14_dev.sql.gz
    └── ifts14_db.sql.gz
```

Esa carpeta está ignorada por Git.

## Objetivo de la auditoría

OpenCode debe analizar estos archivos para generar documentación sanitizada:

```txt
docs/auditoria/
├── inventario-servidor.md
├── arquitectura-sitio-actual.md
├── base-datos-dev-resumen.md
├── base-datos-db-resumen.md
├── riesgos-seguridad.md
└── decisiones-integracion-certificados.md
```

## Qué se puede documentar

Sí se puede documentar:

- tecnologías detectadas;
- estructura de carpetas;
- rutas públicas;
- existencia de API PHP;
- existencia de Angular compilado;
- tablas y columnas de la base;
- relaciones inferidas;
- `.htaccess` y reglas de routing;
- riesgos generales;
- recomendaciones.

No se puede documentar:

- contraseñas;
- usuarios de base reales;
- tokens;
- rutas internas sensibles si comprometen seguridad;
- correos/credenciales;
- contenido de `error_log` con datos sensibles;
- datos personales reales.

## Prompts de auditoría

Usar los prompts del archivo:

```txt
07_PROMPTS_MARCOS_ORDENAMIENTO.md
```

En particular:

- Ciclo M0-02: inventario y sanitización.
- Ciclo M0-03: análisis de bases de datos.
- Ciclo M0-04: arquitectura actual del sitio.
