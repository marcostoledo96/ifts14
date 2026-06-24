# Paquete inicial — Planificación, prompts y primer commit para `marcostoledo96/ifts14`

Este paquete está pensado para iniciar el nuevo repositorio privado:

```txt
https://github.com/marcostoledo96/ifts14
```

El objetivo de este repo no es reemplazar todavía a `ifts14-certificados`, sino crear un espacio privado y seguro para:

- estudiar el código descargado del servidor cPanel;
- estudiar las dos bases de datos descargadas;
- documentar la arquitectura real del sitio;
- planificar el nuevo módulo `/certificados/`;
- preparar Angular 20 + PHP 8.4.21 + MariaDB 10.6.27;
- ordenar el trabajo con OpenCode/Gentle-AI;
- instalar skills y dependencias de forma controlada;
- evitar subir secretos, dumps o backups por accidente.

## Archivos incluidos

| Archivo | Uso |
|---|---|
| `01_GUIA_ARRANQUE_REPO_IFTS14.md` | Guía humana para entender cómo iniciar el repo privado. |
| `02_ESTRUCTURA_REPO_Y_GITIGNORE.md` | Estructura recomendada de carpetas y `.gitignore` seguro. |
| `03_BACKUP_SANITIZACION_AUDITORIA.md` | Cómo tratar archivos descargados desde cPanel, SQL dumps y credenciales. |
| `04_ARQUITECTURA_ANGULAR20_PHP84_MARIADB.md` | Arquitectura propuesta del módulo `/certificados/`. |
| `05_DEPLOY_CPANEL_CERTIFICADOS.md` | Plan de deploy en cPanel dentro de `/certificados/`. |
| `06_SKILLS_DEPENDENCIAS_OPENCODE.md` | Skills, dependencias y configuración inicial recomendada. |
| `07_PROMPTS_MARCOS_ORDENAMIENTO.md` | Prompts para Marcos: backend, DB, cPanel, integración, deploy. |
| `08_PROMPTS_MATIAS_FRONTEND_ANGULAR.md` | Prompts para Matías: frontend Angular 20 desde `muestra_pagina/`. |
| `09_PRIMER_COMMIT_GITHUB.md` | Paso a paso para preparar el primer commit seguro al repo privado. |
| `plantillas/README.md` | README inicial propuesto para la raíz del repo. |
| `plantillas/GUIA.md` | GUIA inicial propuesta para la raíz del repo. |
| `plantillas/AGENTS.md` | AGENTS inicial propuesto para la raíz del repo. |
| `plantillas/.gitignore` | `.gitignore` recomendado para no subir dumps, backups ni secretos. |

## Regla principal

No subir al repositorio archivos descargados del servidor sin revisar.

Los ZIPs, SQL dumps, `error_log`, archivos de configuración con credenciales, `.env`, `db.php`, `database.php`, carpetas `.git` internas y backups deben quedar en una carpeta local ignorada por Git.

## Orden recomendado

1. Crear/abrir repo local `ifts14`.
2. Copiar los archivos de `plantillas/` a la raíz.
3. Crear carpetas seguras.
4. Instalar skills.
5. Ejecutar prompts de auditoría con OpenCode.
6. Generar inventario sanitizado.
7. Hacer primer commit solo con documentación segura.
8. Recién después empezar código Angular/PHP.
