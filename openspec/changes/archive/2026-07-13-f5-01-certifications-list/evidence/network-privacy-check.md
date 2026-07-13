# QA runtime de red y privacidad — F5-01

## Ejecución

| Campo | Valor |
|---|---|
| Fecha | 2026-07-13 |
| App local | `npm start -- --host 127.0.0.1 --port 4200` |
| Browser | Chrome 149 headless, automatizado mediante Chrome DevTools Protocol (CDP) |
| Viewport | 1280×800 |
| Login | Formulario mock real completado; redirección verificada a `/certificados/admin/dashboard` |

Recorrido reproducible:

1. Abrir `/certificados/admin/login`, completar valores ficticios válidos y enviar el formulario.
2. Navegar dentro de la SPA a `/certificados/admin/certificaciones`.
3. Abrir el detalle existente `/certificados/admin/certificaciones/1`.
4. Desde el detalle, abrir el PDF existente `/certificados/admin/certificaciones/1/pdf`.
5. Antes de navegar, habilitar el dominio `Network` de CDP y escuchar sin filtro `requestWillBeSent`, `responseReceived`, `webSocketCreated` y `webSocketHandshakeResponseReceived`.
6. Clasificar todos los tipos informados por el browser, incluidos `document`, `xhr`, `fetch`, `script`, `image`, `stylesheet`, `font`, `media`, `ping` (beacon), `eventsource`, `websocket` y `other`.
7. Sanitizar cada URL conservando solo path, método, tipo, estado y conteo. Eliminar query strings, origen local y rutas absolutas del filesystem; no registrar headers ni cuerpos.
8. Separar navegación, assets estáticos, infraestructura del servidor de desarrollo y requests de datos no estáticos. Considerar de datos a `xhr`, `fetch`, `eventsource`, `ping`/beacon, WebSocket de aplicación, `/api/`, storage o backend; el WebSocket de live-reload de Vite es infraestructura local y no transporta datos de la aplicación.
9. Revisar el texto visible de listado, detalle y PDF con patrones para DNI completo, email, UUID, JWT, cadenas opacas de token y prefijos mock.

## Resultado

**PASS**: las tres vistas cargaron mediante 1 navegación `document` local permitida y assets del servidor de desarrollo. La captura exhaustiva confirmó 0 paths `/api/`, 0 requests de datos no estáticos y ningún dato prohibido visible.

### Requests observadas

| Conteo | Resultado |
|---|---:|
| Observadas | 46 |
| Agrupaciones sanitizadas únicas | 21 |
| `document` local permitido | 1 |
| `fetch` | 0 |
| `xhr` | 0 |
| Paths `/api/` | 0 |
| Requests de datos no estáticos | 0 |
| Assets estáticos | 44 |
| Infraestructura local de desarrollo | 1 WebSocket de live-reload |

Conteo exhaustivo por tipo:

| Tipo CDP | Conteo | Clasificación | Resultado |
|---|---:|---|---|
| `document` | 1 | Navegación local permitida | PASS |
| `script` | 42 | Assets estáticos | PASS |
| `stylesheet` | 1 | Asset estático | PASS |
| `other` | 1 | Favicon estático | PASS |
| `websocket` | 1 | Live-reload de Vite; infraestructura local, no datos de aplicación | PASS |
| `xhr` | 0 | Datos no estáticos | PASS |
| `fetch` | 0 | Datos no estáticos | PASS |
| `image` | 0 | Asset estático | PASS |
| `font` | 0 | Asset estático | PASS |
| `media` | 0 | Asset estático | PASS |
| `ping` / beacon | 0 | Datos no estáticos | PASS |
| `eventsource` | 0 | Datos no estáticos | PASS |

URLs sanitizadas observadas, agrupadas sin omitir requests repetidas:

| Método | Tipo | Path sanitizado | Estado | Conteo | Clasificación |
|---|---|---|---:|---:|---|
| GET | `document` | `/certificados/admin/login` | 200 | 1 | Navegación local |
| GET | `script` | `/certificados/@vite/client` | 200 | 1 | Asset de desarrollo |
| GET | `stylesheet` | `/certificados/styles.css` | 200 | 1 | Asset estático |
| GET | `script` | `/certificados/polyfills.js` | 200 | 1 | Asset estático |
| GET | `script` | `/certificados/main.js` | 200 | 1 | Asset estático |
| GET | `script` | `/certificados/@fs/<módulo-estático-local>` | 200 | 17 | Módulos estáticos; filesystem redactado |
| GET | `script` | `/certificados/chunk-UOIIN3OD.js` | 200 | 1 | Asset estático |
| GET | `script` | `/certificados/chunk-FLEXZMEW.js` | 200 | 1 | Asset estático |
| GET | `script` | `/certificados/chunk-D4RIFSUJ.js` | 200 | 1 | Asset estático |
| GET | `script` | `/certificados/chunk-NJOHQNJG.js` | 200 | 1 | Asset estático |
| GET | `script` | `/certificados/chunk-MWRBWLHA.js` | 200 | 1 | Asset estático |
| GET | `script` | `/certificados/chunk-WDMUDEB6.js` | 200 | 1 | Asset estático |
| GET | `script` | `/certificados/@ng/component` | 200 | 10 | Componentes compilados de desarrollo |
| GET | `script` | `/certificados/chunk-O54GRSA6.js` | 200 | 1 | Asset estático |
| GET | `other` | `/certificados/favicon.ico` | 200 | 1 | Favicon estático |
| GET | `script` | `/certificados/chunk-25QY7OOY.js` | 200 | 1 | Asset estático |
| GET | `script` | `/certificados/chunk-BYPM6JXI.js` | 200 | 1 | Asset estático |
| GET | `script` | `/certificados/chunk-EO7BSOPM.js` | 200 | 1 | Asset estático |
| GET | `script` | `/certificados/chunk-2WKQL2MH.js` | 200 | 1 | Asset estático |
| GET | `script` | `/certificados/chunk-UL5HYF3V.js` | 200 | 1 | Asset estático |
| WS | `websocket` | `/certificados/` | 101 | 1 | Live-reload de Vite; no datos de aplicación |

Las transiciones posteriores fueron navegaciones internas de Angular. No generaron requests de datos mediante `fetch`, XHR, beacon, EventSource o WebSocket de aplicación, ni accedieron a paths `/api/`, storage o backend. El único WebSocket fue el canal técnico de live-reload abierto por `@vite/client` bajo el mismo origen local.

### Privacidad visible

| Control | Listado | Detalle 1 | PDF 1 | Resultado |
|---|---:|---:|---:|---|
| DNI completo (7–8 dígitos) | 0 | 0 | 0 | PASS |
| Email | 0 | 0 | 0 | PASS |
| UUID | 0 | 0 | 0 | PASS |
| JWT | 0 | 0 | 0 | PASS |
| Token opaco de 24+ caracteres | 0 | 0 | 0 | PASS |
| Prefijo mock `prefijo_demo_*` | 0 | 3 | 1 | Informativo; dato ficticio truncado permitido, no token completo |

No se conservaron logs crudos, credenciales introducidas, headers, cuerpos, query strings, rutas absolutas locales ni texto de datos de las vistas. Los archivos temporales de captura y el perfil efímero de Chrome se eliminaron al finalizar.
