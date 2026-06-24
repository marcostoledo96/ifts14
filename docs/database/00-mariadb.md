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

## Modelo para certificados QR

El modelo inicial queda definido en `docs/database/01-modelo-datos-certificados.md` y en la migración controlada `database/migrations/001_certificados_qr.sql`.

| Concepto | Propósito |
|---|---|
| `cert_certificados` | Estado, código público, fecha de emisión y referencia al alumno/curso. |
| `cert_tokens_verificacion` | Hash del token público, vigencia, revocación y último uso. |
| `cert_eventos_auditoria` | Eventos no sensibles de emisión, verificación, revocación o reenvío. |

Los tokens públicos no se guardan en texto plano. El backend futuro debe comparar contra `token_hash` calculado con hash criptográfico y pepper fuera de Git.

## Hallazgos de auditoría (hipótesis)

- **Observado**: hay dos dumps SQL originales bajo `material_privado_no_versionar/db_dumps_originales/`, ambos ignorados por Git.
- **Observado**: la extracción DDL segura detectó tablas vinculadas a materias, docentes, carreras/tecnicaturas, horarios, publicaciones, anuncios y contacto.
- **Hipótesis**: los dumps corresponden a modelos relacionados pero no equivalentes; cualquier reutilización requiere migración controlada.
- **Hipótesis**: el módulo de certificaciones debe crear tablas nuevas con prefijo `cert_` y no depender de dumps reales versionados.
