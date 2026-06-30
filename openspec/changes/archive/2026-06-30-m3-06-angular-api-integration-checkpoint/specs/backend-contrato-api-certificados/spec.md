# Delta para backend-contrato-api-certificados

## ADDED Requirements

### Requirement: Soporte de consumo browser local seguro

La API DEBE permitir el consumo desde `ng serve` en local para el smoke de integración. Cuando se requiera CORS/preflight, la API PUEDE responder `Access-Control-Allow-Origin` acotado al origen local de Angular y DEBE limitar los headers/methods expuestos a los del contrato público. El soporte DEBE quedar restringido a configuración local y NO DEBE habilitar CORS abierto en producción.

#### Scenario: Preflight local exitoso

- **Dado** Angular en `ng serve` sobre `http://localhost:4200` y API PHP local configurada para aceptar ese origen
- **Cuando** el navegador envía `OPTIONS /certificados/api/certificados/{token}/verificacion`
- **Entonces** la API DEBE responder preflight exitoso con `Access-Control-Allow-Origin: http://localhost:4200`.
- **Y** DEBE NO exponer headers administrativos ni `X-Admin-Key` en el preflight público.

#### Scenario: CORS abierto prohibido en producción

- **Dado** la configuración de producción de la API
- **Cuando** llega un request con `Origin` no autorizado
- **Entonces** la API DEBE NO devolver `Access-Control-Allow-Origin: *` para endpoints públicos.

#### Scenario: Preflight no requerido

- **Dado** que el smoke local se resuelve vía proxy/base URL sin CORS
- **Cuando** Angular consume la API PHP local
- **Entonces** la API PUEDE no agregar headers CORS y el smoke DEBE completarse sin preflight.

## MODIFIED Requirements

### Requirement: Pendientes de hardening documentados

La documentación backend SHOULD registrar como diferidos: límite de tamaño de body, rate limiting distribuido, observabilidad real y `ultimo_uso_en` en verificación pública. CORS/preflight queda resuelto de forma acotada para el smoke local de este checkpoint y DEBE registrarse como excepción local, no como hardening productivo.

(Previously: CORS/preflight figuraba como pendiente de hardening; ahora se resuelve lo mínimo para el smoke local y el resto permanece diferido.)

#### Scenario: Gaps explícitos restantes

- **Dado** este ciclo archivado
- **Cuando** se revisa la documentación backend
- **Entonces** SHOULD listar límite de tamaño de body, rate limiting distribuido, observabilidad real y `ultimo_uso_en` como fuera de alcance.
- **Y** DEBE registrar CORS/preflight local como excepción resuelta del checkpoint, no como hardening productivo.