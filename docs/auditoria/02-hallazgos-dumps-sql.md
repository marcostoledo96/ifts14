# Hallazgos de dumps SQL

Extracción limitada a DDL: nombres de tablas, columnas clave y relaciones. No se copiaron filas ni valores reales.

## `ifts14c8_db.sql`

| Tabla | Columnas estructurales | Relaciones observadas |
|---|---|---|
| `materias` | `id`, `dia`, `franja_horaria`, `anio`, `nombre`, `profesor_id` | `profesor_id` referencia `profesores.id`. |
| `posts` | `id`, `tipo`, `titulo`, `descripcion`, `fecha`, `termina`, `tecnicatura_id`, `status`, `file_path`, timestamps | `tecnicatura_id` referencia `tecnicaturas.id`. |
| `profesores` | `id`, `nombre` | Sin relaciones salientes observadas. |
| `tecnicaturas` | `id`, `nombre` | Sin relaciones salientes observadas. |

## `ifts14c8_dev.sql`

| Tabla | Columnas estructurales | Relaciones observadas |
|---|---|---|
| `Carreras` | `id_carrera`, `nombre` | Sin relaciones salientes observadas. |
| `Horarios` | `id_horario`, `id_materia`, `id_profesor`, `dia_semana`, `hora_inicio`, `hora_fin` | Referencia `Materias.id_materia` y `Profesores.id_profesor`. |
| `Materias` | `id_materia`, `nombre`, `anio`, `division`, `id_carrera` | Referencia `Carreras.id_carrera`. |
| `Profesores` | `id_profesor`, `nombre_completo` | Sin relaciones salientes observadas. |
| `anuncios` | `id`, `id_carrera`, `titulo`, `contenido`, `imagen_url`, fechas, `estado`, `autor`, `destacado`, timestamps | Referencia `Carreras.id_carrera`. |
| `contact_messages` | `id`, `nombre`, `email`, `telefono`, `motivo`, `mensaje`, `created_at` | Sin relaciones salientes observadas. |

## Observaciones seguras

- **Observado**: `ifts14c8_db.sql` usa `latin1` en las tablas detectadas.
- **Observado**: `ifts14c8_dev.sql` usa `utf8mb4` en las tablas detectadas.
- **Hipótesis**: los dumps representan modelos de datos relacionados pero no idénticos; no deben mezclarse sin migración explícita.
- **Hipótesis**: `contact_messages` puede contener datos personales en filas reales, por lo que el dump debe seguir fuera de Git.
