# Spec — frontend-angular-shell

## Purpose

Definir la base técnica mínima de Angular 20 para el módulo público `/certificados/`, sin fijar diseño visual final ni alcance administrativo.

## Requirements

### Requirement: Shell Angular bajo `/certificados/`

El sistema DEBE proveer una aplicación Angular 20 ejecutable bajo la ruta pública `/certificados/`, con routing standalone y compatibilidad con rutas profundas del módulo.

#### Scenario: Entrada al módulo público

- **Dado** un despliegue servido desde `/certificados/`
- **Cuando** una persona abre la raíz del módulo
- **Entonces** la aplicación DEBE renderizar el shell público sin depender de datos reales.

#### Scenario: Ruta profunda refrescada

- **Dado** la ruta `/certificados/validar/{token}`
- **Cuando** el navegador refresca esa URL
- **Entonces** el shell DEBE conservar la navegación Angular prevista.

### Requirement: Estructura mínima y reemplazable

El shell DEBE usar estructura semántica, accesible y responsive mínima. NO DEBE definir sistema visual final, admin ni componentes de UI definitivos.

#### Scenario: Layout no final

- **Dado** que el diseño final corresponde a Matías
- **Cuando** se revisa este ciclo
- **Entonces** la interfaz DEBE distinguirse como base técnica reemplazable.

#### Scenario: Accesibilidad básica

- **Dado** una persona que navega con teclado
- **Cuando** recorre el shell
- **Entonces** DEBE existir foco visible y orden de lectura coherente.

### Requirement: Límites de seguridad y origen

El shell NO DEBE leer `material_privado_no_versionar/`, copiar React/Next desde `muestra_pagina/` ni incorporar datos reales.

#### Scenario: Sin datos reales ni copia literal

- **Dado** la referencia visual disponible o futura
- **Cuando** se construye la base Angular
- **Entonces** se DEBE portar intención funcional propia de Angular, no código React/Next.
