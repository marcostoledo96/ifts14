# Delta: eficiencia de tokens en OpenCode/Gentle-AI

## ADDED Requirements

### Requirement: Documento operativo de eficiencia

El proyecto DEBE incorporar una guía operativa breve que resuelva el exceso de contexto repetido en ciclos SDD, indicando lectura mínima, herramientas permitidas, evidencias a preservar, aceptación y riesgos.

#### Scenario: Marcos inicia un ciclo documental

- DADO un ciclo SDD de documentación o configuración segura
- CUANDO Marcos prepara el contexto
- ENTONCES lee el ciclo activo y la guía de eficiencia, sin reescribir `README.md` ni `GUIA.md`

#### Scenario: Matías evita el prompt monolítico

- DADO que Matías inicia una tarea guiada
- CUANDO usa el prompt maestro actualizado
- ENTONCES recibe instrucción de leer solo el ciclo activo y `docs/opencode/eficiencia-token.md`

### Requirement: Herramientas y perfiles permitidos

La guía DEBE mencionar el uso de `RTK`, `Graphify`, perfiles Gentle AI, `Ponytail`, `karpathy-guidelines`, modelos eficientes de OpenCode Go y compactación/prune. La guía DEBE aclarar que no se instalan herramientas ni se modifica `~/.config/opencode/opencode.json` sin decisión explícita de Marcos.

#### Scenario: Salida extensa de terminal

- DADO un comando con salida larga
- CUANDO la evidencia sea necesaria para revisión
- ENTONCES se resume o comprime con `RTK` sin perder el resultado relevante

#### Scenario: Tarea mecánica o documental

- DADO un cambio de bajo riesgo
- CUANDO se elige perfil/modelo
- ENTONCES se PUEDEN usar perfiles eficientes y modelos OpenCode Go, reservando perfiles base para arquitectura o verificación compleja

### Requirement: Seguridad de Graphify

El proyecto DEBE crear `.graphifyignore` antes de cualquier ejecución de Graphify y DEBE excluir material sensible o costoso: `material_privado_no_versionar/`, `.env`, `*.sql`, `backups/` y `graphify-out/`. `.gitignore` DEBE ignorar `graphify-out/`.

#### Scenario: Marcos evalúa Graphify

- DADO que Marcos quiere indexar el repositorio
- CUANDO `.graphifyignore` no existe o no excluye material sensible
- ENTONCES Graphify NO DEBE ejecutarse

#### Scenario: Evidencia de seguridad preservada

- DADO que se cierra el ciclo
- CUANDO se revisan los artefactos
- ENTONCES queda evidencia de exclusiones sin copiar secretos, dumps ni logs

### Requirement: Alcance y aceptación

El cambio DEBE limitarse a documentación y configuración segura. NO DEBE tocar Angular, PHP, MariaDB, deploy real ni `material_privado_no_versionar/`. La aceptación DEBE verificar: guía creada y enlazada, `.gitignore` con `graphify-out/`, `.graphifyignore` seguro, prompts maestros ajustados y cero cambios de producto.

#### Scenario: Cierre por archive

- DADO que la implementación documental fue aplicada
- CUANDO se ejecuta `sdd-archive`
- ENTONCES la documentación vigente referencia la guía y conserva los riesgos: prompt monolítico, Graphify inseguro, degradación por perfiles baratos y olvido de `RTK`

#### Scenario: Cambio fuera de alcance

- DADO que una tarea intenta modificar producto o deploy real
- CUANDO se revisa contra esta spec
- ENTONCES el cambio se rechaza o se mueve a otro ciclo SDD
