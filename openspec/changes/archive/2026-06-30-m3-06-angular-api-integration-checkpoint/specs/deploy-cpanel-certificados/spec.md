# Delta para deploy-cpanel-certificados

## ADDED Requirements

### Requirement: Compatibilidad `/certificados/` + `/api/` previa al deploy

La documentación DEBE describir la convivencia de la ruta pública Angular `/certificados/` con la API bajo `/certificados/api/` previa a cualquier deploy real, de modo que el smoke local y la guía de deploy usen la misma separación. La separación DEBE mantenerse tanto para `ng serve` (base URL local) como para cPanel (`base href /certificados/`).

#### Scenario: Smoke local con base URL separada

- **Dado** Angular en `ng serve` con `apiBaseUrl` apuntando a la API PHP local
- **Cuando** se accede a `/validar/:tokenCertificacion`
- **Entonces** el frontend DEBE servir la ruta pública y consultar la API sin mezclar `baseHref` con `apiBaseUrl`.

#### Scenario: cPanel con `/certificados/` y `/api/` separados

- **Dado** la guía de deploy revisable
- **Cuando** se describen rutas profundas del frontend y de la API
- **Entonces** DEBE indicar que `.htaccess` aplica fallback solo fuera de `/api/`.
- **Y** DEBE mantener `/certificados/api/` como ruta API controlada sin capturarla el frontend.

## MODIFIED Requirements

### Requisito: Rutas `.htaccess` para API

La documentación DEBE especificar que las reglas para `/certificados/` no deben capturar `/certificados/api/` y que la API debe responder bajo esa ruta. Además DEBE documentar la separación entre `base href` del frontend y la base URL de la API para `ng serve` y cPanel, de modo que el checkpoint local y el deploy futuro usen el mismo contrato de rutas.

(Previously: la spec solo exigía excluir `/api/` del fallback; ahora también exige documentar la separación `base href` vs `apiBaseUrl` para local y cPanel.)

#### Escenario: Rutas profundas y API

- **Dado** una instalación bajo `/certificados/`
- **Cuando** se accede a una ruta de frontend y a `/certificados/api/health`
- **Entonces** la guía espera fallback del frontend fuera de `/api/`
- **Y** respuesta API controlada dentro de `/api/`.

#### Escenario: Separación `base href` vs `apiBaseUrl`

- **Dado** la guía de deploy revisable y el smoke local
- **Cuando** se documenta la configuración de rutas
- **Entonces** DEBE distinguir `base href /certificados/` (frontend) de `apiBaseUrl` (API).
- **Y** DEBE NO usar `baseHref` para resolver la URL de la API en `ng serve`.