# Contexto, decisiones y stack confirmado

## Contexto

El IFTS N.° 14 necesita un módulo de certificaciones QR integrado en su web bajo la ruta:

```txt
/certificados/
```

El módulo permitirá validar constancias/certificaciones por QR o link.

## Stack confirmado

```txt
Frontend: Angular 20
Backend: PHP 8.4.21
Base de datos: MariaDB 10.6.27
Hosting: cPanel
Gestión base: phpMyAdmin y herramientas MySQL de cPanel
```

## Decisiones vigentes

- El repositorio es privado.
- El material descargado del servidor no se versiona.
- La implementación nueva vive separada en `apps/frontend-angular/` y `apps/backend-php/`.
- El diseño generado en v0 se coloca en `muestra_pagina/` como referencia.
- El frontend se porta a Angular 20, sin copiar Next/React literalmente.
- El backend se implementa en PHP 8.4.21.
- La base de datos usa MariaDB 10.6.27.
- El deploy objetivo es `/certificados/` en cPanel.

## Pendientes

- Confirmar si Composer está disponible.
- Confirmar mecanismo final de email.
- Confirmar si se podrá usar Git Version Control de cPanel.
- Confirmar estructura exacta del document root.
- Conseguir logos limpios y autorizados.
