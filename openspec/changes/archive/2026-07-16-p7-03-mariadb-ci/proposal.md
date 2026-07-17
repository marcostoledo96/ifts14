# Proposal: P7-03 MariaDB CI

## Intent

Reforzar el job `php-tests` para que MariaDB CI cumpla P7-03: aplicar migraciones como paso explícito, eliminar el patrón SKIP de los tests E2E, cablear el schema contract y los upgrade tests, y garantizar que ningún test se saltee silenciosamente.

## Problem

Actualmente 8 tests E2E usan este patrón cuando faltan variables de entorno:

```php
if (!getenv('IFTS14_TEST_DB_DSN')) {
    echo "SKIP: DB not configured\n";
    return;  // exit 0 — CI pasa aunque el test no corra
}
```

Esto viola P7-03 explícitamente: **"El E2E no puede hacer SKIP en este job."**

Además:
- No hay un paso de `database-setup` que aplique migraciones → cada test las aplica inline (duplicación).
- `scripts/test-database-schema-contract.sh` existe pero no está en CI.
- `scripts/test-database-upgrade.sh` existe pero no está en CI.

## Scope

### In
- Agregar paso `database-setup` en CI que aplique todas las migraciones (001–010) antes de los tests E2E.
- Reemplazar el patrón SKIP por hard-fail (`exit(1)` o `throw RuntimeException`) en los 8 tests.
- Cablear `test-database-schema-contract.sh` como paso de CI (o crear `DatabaseSchemaContractTest.php`).
- Cablear `test-database-upgrade.sh` como paso de CI.
- Eliminar la aplicación inline de migraciones de los tests individuales (opcional, reduce duplicación).

### Out
- No se modifica la lógica de negocio de los tests.
- No se agregan nuevos tests funcionales (solo CI wiring).
- No se modifica la estructura del workflow.

## Approach

**Option 2 (recomendada):** Agregar paso `database-setup`, convertir SKIP a hard-fail, cablear schema contract + upgrade tests.

1. **database-setup step**: nuevo paso antes de "E2E con MariaDB" que aplica `001.sql` a `010.sql` en orden usando el servicio MariaDB.
2. **Hard-fail**: reemplazar `echo "SKIP..."; return;` → `fwrite(STDERR, "ERROR: DB not configured\n"); exit(1);` en todos los tests.
3. **Schema contract**: agregar `test-database-schema-contract.sh` como paso o crear un test PHP equivalente.
4. **Upgrade test**: agregar `test-database-upgrade.sh` como paso.

## Risks

| Risk | Mitigation |
|------|------------|
| Cambios en 8 tests pueden romper compatibilidad local | Mantener detección de env vars; solo cambiar comportamiento de skip → fail |
| Schema contract script depende de Docker local | Adaptar para usar el servicio MariaDB de CI |
| Upgrade test necesita fixtures históricos | Verificar que los fixtures existen en el repo |

## Success Criteria

- [ ] Paso `database-setup` aplica migraciones 001–010 antes de E2E.
- [ ] Ningún test E2E hace SKIP — todos fallan ruidosamente si falta DB.
- [ ] Schema contract se ejecuta en CI y verifica el esquema.
- [ ] Upgrade test se ejecuta en CI.
- [ ] 11/11 tests E2E pasan con MariaDB.
