# Spec: Frontend Environments (P5-03)

## Capability: `frontend-environments`

Delta spec para P5-03 — asegurar que cada entorno de build use la fuente de datos correcta.

### REQ-ENV-001: Producción usa API real

**Prioridad**: CRITICAL

**Given** un build productivo (`ng build --configuration production`) sin fileReplacements de entorno  
**When** la constante `environment` es importada desde `environments/environment.ts`  
**Then** `environment.useRealApi` DEBE ser `true`

### REQ-ENV-002: Desarrollo usa mocks

**Prioridad**: HIGH

**Given** un build de desarrollo (`ng serve` o `ng build --configuration development`)  
**When** la constante `environment` es importada (resuelta a `environment.development.ts` vía fileReplacements)  
**Then** `environment.useRealApi` DEBE ser `false`

### REQ-ENV-003: Staging usa API real

**Prioridad**: HIGH

**Given** un build de staging (`ng build --configuration production-staging`)  
**When** la constante `environment` es importada (resuelta a `environment.staging.ts` vía fileReplacements)  
**Then** `environment.useRealApi` DEBE ser `true`  
**And** `environment.apiBaseUrl` DEBE ser `/certificados_staging/api`

### REQ-ENV-004: Guarda de build en CI

**Prioridad**: CRITICAL

**Given** un test que importa el entorno por defecto (`environment.ts`)  
**When** el test se ejecuta en CI (`npm run test:ci`)  
**Then** el test DEBE fallar con exit code ≠ 0 si `environment.useRealApi !== true`

### REQ-ENV-005: Environment de staging conserva apiBaseUrl

**Prioridad**: MEDIUM

**Given** el archivo `environment.staging.ts` existente  
**When** se verifican sus valores  
**Then** `apiBaseUrl` DEBE permanecer como `/certificados_staging/api`  
**And** `useRealApi` DEBE permanecer `true`

### REQ-ENV-006: angular.json sin reemplazos incorrectos

**Prioridad**: MEDIUM

**Given** la configuración `production` en `angular.json`  
**When** se inspecciona la sección `fileReplacements`  
**Then** NO DEBE reemplazar `environment.ts` por `environment.development.ts`
