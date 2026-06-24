# Skills, dependencias y configuración inicial

## Objetivo

Preparar OpenCode/Gentle-AI para trabajar con:

```txt
Angular 20
PHP 8.4
MariaDB
cPanel
UI/UX cuidada
Seguridad
TDD
GitHub
Arquitectura
```

## Instalación de skills

Primero, desde la raíz del repo:

```bash
DISABLE_TELEMETRY=1 npx skills add https://github.com/angular/skills
DISABLE_TELEMETRY=1 npx skills add vercel-labs/skills --skill find-skills
DISABLE_TELEMETRY=1 npx skills add anthropics/skills --skill frontend-design
DISABLE_TELEMETRY=1 npx skills add vercel-labs/agent-skills --skill web-design-guidelines
DISABLE_TELEMETRY=1 npx skills add arvindrk/extract-design-system --skill extract-design-system
DISABLE_TELEMETRY=1 npx skills add leonxlnx/taste-skill --skill design-taste-frontend
DISABLE_TELEMETRY=1 npx skills add leonxlnx/taste-skill --skill high-end-visual-design
DISABLE_TELEMETRY=1 npx skills add leonxlnx/taste-skill --skill stitch-design-taste
DISABLE_TELEMETRY=1 npx skills add mattpocock/skills --skill improve-codebase-architecture
DISABLE_TELEMETRY=1 npx skills add mattpocock/skills --skill tdd
DISABLE_TELEMETRY=1 npx skills add mattpocock/skills --skill to-issues
DISABLE_TELEMETRY=1 npx skills add anthropics/skills --skill webapp-testing
DISABLE_TELEMETRY=1 npx skills add obra/superpowers --skill verification-before-completion
DISABLE_TELEMETRY=1 npx skills add obra/superpowers --skill systematic-debugging
DISABLE_TELEMETRY=1 npx skills add obra/superpowers --skill finishing-a-development-branch
```

## Después de instalar skills

```bash
gentle-ai skill-registry refresh
gentle-ai doctor
```

## Cuándo usar cada skill

### Angular

Usar para:

- crear app Angular 20;
- componentes;
- routing;
- servicios;
- formularios;
- accesibilidad;
- testing;
- estructura idiomática.

### frontend-design / design-taste / high-end-visual-design

Usar para:

- portar diseño de v0 sin caer en interfaz genérica;
- mejorar espaciados, jerarquía, color y responsive;
- mantener identidad IFTS 14.

### extract-design-system

Usar para:

- analizar `muestra_pagina/`;
- extraer paleta, tipografía, componentes y patrones;
- crear tokens visuales para Angular.

### web-design-guidelines

Usar para:

- accesibilidad;
- contraste;
- foco visible;
- responsive;
- performance;
- evitar anti-patrones.

### tdd / test-driven-development

Usar para:

- reglas backend;
- casos de uso;
- contratos API;
- integración PHP/MariaDB.

### improve-codebase-architecture

Usar para:

- estructura modular;
- separación frontend/backend;
- Clean Architecture liviana en PHP;
- evitar mezcla de responsabilidades.

### systematic-debugging

Usar cuando algo falla:

- rutas Angular;
- API PHP;
- conexión DB;
- `.htaccess`;
- cPanel.

## Dependencias frontend recomendadas

En Angular:

```bash
npm install
ng add tailwindcss
```

Opcionales:

```bash
ng add @angular/material
```

Recomendación:

- Usar Tailwind para identidad visual.
- Usar Angular CDK/Material solo si aporta accesibilidad o componentes admin.
- Evitar que Angular Material imponga un look genérico.

## Dependencias backend

Si Composer está disponible:

```bash
composer init
composer require vlucas/phpdotenv
```

Opcional para PDF/QR si se permite:

```bash
composer require dompdf/dompdf
composer require endroid/qr-code
```

Si Composer no está disponible:

- usar PHP puro;
- crear configuración manual;
- generar PDF como vista HTML imprimible inicialmente;
- generar QR desde frontend o librería simple incluida manualmente solo si es seguro.

## Dependencias base de datos

No usar ORM inicialmente.

Usar:

- SQL migrations;
- PDO;
- prepared statements;
- scripts de seed sanitizados.
