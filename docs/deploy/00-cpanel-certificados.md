# Deploy cPanel — /certificados/

## Objetivo

Publicar el módulo en:

```txt
https://ifts14.com.ar/certificados/
```

## Estructura esperada en cPanel

```txt
public_html/
└── certificados/
    ├── index.html
    ├── assets/
    ├── .htaccess
    └── api/
```

## Frontend Angular

Compilar localmente con:

```bash
ng build --configuration production --base-href /certificados/
```

Subir el contenido de `dist/...` a `public_html/certificados/`.

## Backend PHP

Subir API PHP a:

```txt
public_html/certificados/api/
```

## .htaccess

Debe permitir que Angular maneje rutas profundas y no capturar `/api/`.

## Seguridad

- No subir credenciales al repo.
- No tocar `public_html` sin backup.
- No sobrescribir la web oficial.
- Probar primero en carpeta aislada.

## Hallazgos de auditoría (hipótesis)

- **Observado**: el material original incluye `.htaccess`, `.well-known/acme-challenge/`, `cgi-bin/`, zips de despliegue y logs.
- **Observado**: existe una carpeta con `.git/` interno dentro del material descargado; permanece bajo `material_privado_no_versionar/`.
- **Observado**: `browser.zip` y `api.zip` no fueron descomprimidos por seguridad.
- **Hipótesis**: el sitio actual combina frontend compilado y API PHP en una misma raíz pública compatible con cPanel/Apache.
