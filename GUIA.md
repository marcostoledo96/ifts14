# GUIA.md — Guía humana del proyecto IFTS14

Esta guía es para Marcos, Matías o cualquier persona que necesite entender el repositorio sin leer todos los archivos.

## 1. Objetivo del repositorio

Este repositorio privado se usa para:

1. estudiar el sitio actual del IFTS 14 descargado desde cPanel;
2. proteger material sensible y evitar subir credenciales;
3. planificar el módulo de certificaciones QR;
4. implementar una nueva sección en `/certificados/`;
5. mantener documentación y prompts para trabajar con OpenCode/Gentle-AI.

## 2. Stack confirmado

```txt
Frontend: Angular 20
Backend: PHP 8.4.21
Base de datos: MariaDB 10.6.27
Hosting: cPanel
Gestión DB: phpMyAdmin / MySQL Databases de cPanel
Ruta final: /certificados/
```

## 3. Alcance del módulo `/certificados/`

El módulo debe permitir que una persona externa valide una certificación/constancia mediante QR o link.

Ruta pública conceptual:

```txt
/certificados/validar/:tokenCertificacion
```

El flujo esperado es:

```txt
Bedelía carga curso y fechas
→ registra asistencias presentes
→ emite certificación
→ genera PDF horizontal con QR
→ envía o reenvía al alumno
→ usuario externo escanea QR
→ verifica autenticidad
```

## 4. Estado actual

Al inicio puede existir material descargado del servidor en raíz:

- dumps SQL;
- carpeta `well-known/`;
- archivos PHP;
- zips;
- logs;
- configuraciones con credenciales.

Ese material debe moverse a:

```txt
material_privado_no_versionar/
```

y nunca debe subirse a GitHub.

## 5. Carpeta `muestra_pagina/`

`muestra_pagina/` será la carpeta donde Marcos deje el diseño generado en v0.

Puede estar vacía al inicio.

Mientras esté vacía:

- no se implementa el frontend final;
- no se inventan pantallas;
- no se copia UI genérica;
- solo se puede preparar estructura y documentación.

Cuando tenga contenido, Matías deberá:

- analizar composición, tokens visuales y comportamiento;
- portar el diseño a Angular 20;
- mejorar accesibilidad, rendimiento y estructura;
- no copiar React/Next literalmente;
- mantener una interfaz institucional, moderna y no genérica.

## 6. Roles

### Marcos

Responsable de:

- backend PHP;
- MariaDB;
- integración front/back;
- deploy en cPanel;
- arquitectura;
- seguridad;
- documentación;
- auditoría del servidor descargado.

### Matías

Responsable de:

- Angular 20;
- adaptación de `muestra_pagina/`;
- UI/UX;
- Tailwind o sistema visual elegido;
- responsive;
- accesibilidad.

## 7. Metodología

Se trabaja con Spec-Driven Development.

Cada ciclo debe seguir:

```txt
spec → criterios → fixture/contrato → plan → implementación → pruebas → QA → sdd-archive → commit → PR
```

`sdd-archive` significa cerrar el ciclo actualizando la documentación relacionada.

## 8. Documentación mínima

Para empezar:

1. `README.md`
2. `AGENTS.md`
3. `docs/00-indice-general.md`
4. Prompt raíz del rol: `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` o `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`
5. `docs/07-sdd-archive-y-mantenimiento-documentacion.md`

Los prompts viejos de `docs/opencode/` quedan como archivo histórico. Las guías operativas vigentes están en la raíz.

## 9. Git

No trabajar directo sobre `main` salvo primer commit de estructura inicial.

Ramas sugeridas:

```txt
docs/<tema>
frontend/<modulo>
backend/<modulo>
database/<tema>
deploy/<tema>
qa/<tema>
```

OpenCode puede proponer comandos, pero Marcos/Matías ejecutan commit, push y merge manualmente.

## 10. Regla principal

Si una tarea no está clara, no se implementa.

Primero se actualiza:

```txt
spec → criterio → contrato/fixture → plan
```
