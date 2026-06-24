# Base de datos MariaDB 10.6.27

## Objetivo

Documentar el uso de MariaDB para el módulo de certificaciones QR.

## Reglas

- No versionar dumps reales.
- Usar migraciones SQL controladas.
- Usar seeds ficticios para demo.
- Preferir tablas con prefijo `cert_`.
- No modificar bases existentes sin backup y documentación.

## Material descargado

Los dumps originales deben estar en:

```txt
material_privado_no_versionar/db_dumps_originales/
```

No deben versionarse.
