# Descargar y estudiar todo el código localmente

## 1. Clonar repositorio nuevo

```bash
cd ~/Escritorio
git clone https://github.com/marcostoledo96/ifts14.git
cd ifts14
```

## 2. Crear carpetas privadas locales

```bash
mkdir -p material_privado_no_versionar/servidor_original
mkdir -p material_privado_no_versionar/db_dumps_originales
mkdir -p material_privado_no_versionar/backups_cpanel
```

## 3. Copiar archivos descargados

Copiar manualmente:

```txt
well-known.zip
ifts14c8_dev.sql.gz
ifts14c8_db.sql.gz
```

a:

```txt
material_privado_no_versionar/
```

## 4. Extraer sin versionar

```bash
cd material_privado_no_versionar/servidor_original
unzip ../well-known.zip -d sitio_original
```

No hacer `git add` sobre esta carpeta.

## 5. Revisar estado Git

```bash
cd ../../
git status --ignored
```

`material_privado_no_versionar/` debe aparecer ignorada.

## 6. Abrir con editor

```bash
code .
```

## 7. Trabajar con OpenCode

Primero pedir auditoría, no implementación.

Usar prompts de:

```txt
07_PROMPTS_MARCOS_ORDENAMIENTO.md
```

especialmente Ciclo M0-03 y M0-04.
