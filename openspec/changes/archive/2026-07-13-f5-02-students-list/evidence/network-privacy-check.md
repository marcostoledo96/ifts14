# Runtime: red y privacidad F5-02

## Escenario

Se inició el frontend local, se autenticó con la sesión mock y se recorrió `/admin/alumnos` en desktop y mobile. Se observaron las requests del navegador durante la carga y las interacciones de filtro/QA.

## Resultado

| Control | Resultado |
|---|---|
| Requests de datos/API | 0 |
| `fetch` / XHR | 0 |
| Rutas `/api/` | 0 |
| Requests permitidas | Documento local, runtime Angular/Vite, estilos y chunks estáticos |
| Storage/cookies/IndexedDB | No usados por la pantalla; cubierto también por `no-secrets.spec.ts` |
| Datos visibles | Documento ficticio enmascarado, booleano de contacto y métricas demo |
| Datos no visibles | DNI completo, dirección de email, legajo, token, UUID y matrícula |
| Consola | 0 errores y 0 warnings |

La observación de red se documenta sin URLs internas de archivos, encabezados, cuerpos ni logs crudos.
