# Data Model: PresupuestosPro v0

**Feature**: `001-presupuestos-pdf` | **Date**: 2026-10-03

Todo el estado de la aplicación es **un único objeto JSON**, guardado en `localStorage` bajo la clave `presupuestospro`. Ese mismo objeto es el contenido del archivo de copia de seguridad ([contracts/backup-file.md](contracts/backup-file.md)).

Convenciones:
- Importes en **céntimos enteros** (`150000` = 1.500,00 €).
- Fechas como texto `AAAA-MM-DD` en hora local.
- `id`: texto único generado con `crypto.randomUUID()`.

## Estado (raíz)

| Campo | Tipo | Descripción |
|---|---|---|
| `app` | `"presupuestospro"` | Marca para reconocer una copia válida. |
| `version` | `1` | Versión del formato. |
| `perfil` | Perfil \| `null` | `null` hasta que se guarda por primera vez. |
| `catalogo` | Servicio[] | Servicios del catálogo. |
| `presupuestos` | Presupuesto[] | Todos los presupuestos. |
| `contadores` | `{ [año: string]: number }` | Último número asignado por año. Ej.: `{ "2026": 4 }`. |

## Perfil (FR-001, FR-002)

| Campo | Tipo | Reglas |
|---|---|---|
| `nombre` | string | Obligatorio, no vacío tras quitar espacios. |
| `nif` | string | Obligatorio, no vacío. (Sin validar el formato: la spec no lo pide.) |
| `email` | string | Opcional. |
| `telefono` | string | Opcional. |
| `direccion` | string | Opcional (multilínea). |
| `logo` | string \| `null` | Opcional. Data URL `image/png` o `image/jpeg`; se reduce a ≤ 600 px de lado al subirlo. Otro tipo de archivo → rechazo con mensaje. |

## Servicio (FR-003, FR-004)

| Campo | Tipo | Reglas |
|---|---|---|
| `id` | string | Único. |
| `nombre` | string | Obligatorio. |
| `precio` | integer (céntimos) | Obligatorio, ≥ 0. |

Eliminar pide confirmación. Ningún presupuesto guarda referencia al servicio (FR-008): las líneas copian los valores.

## Presupuesto (FR-005 … FR-019b)

| Campo | Tipo | Reglas |
|---|---|---|
| `id` | string | Único. |
| `numero` | string | `AAAA-NNN`, asignado al crear. Inmutable. |
| `fechaEmision` | string `AAAA-MM-DD` | Fecha del día al crear. Inmutable. |
| `cliente` | DatosCliente | Embebido (no hay agenda). |
| `lineas` | Linea[] | Puede estar vacío (se guarda, pero no se descarga en PDF). |
| `retencion` | `{ activa: boolean, porcentaje: 15 \| 7 }` | Nuevo: `{ activa: false, porcentaje: 15 }`. |
| `notas` | string | Opcional; vacío por defecto. |

**Campos derivados (no se guardan; se calculan siempre con `js/calc.js`):**
- `fechaValidez` = `fechaEmision` + 30 días naturales.
- `caducado` = hoy > `fechaValidez`.
- `importe` de cada línea, `base`, `iva`, `retencionAplicada`, `importeRetencion`, `total` (fórmulas en [research.md](research.md#r4-cálculos-y-redondeo)).
- `retencionAplicada` = `retencion.activa && cliente.tipo === "empresa"`. Si `activa` y el cliente es particular → se muestra el aviso de FR-013. Al volver a empresa, vuelve a aplicarse (la configuración no se pierde).

### DatosCliente

| Campo | Tipo | Reglas |
|---|---|---|
| `nombre` | string | Obligatorio para descargar el PDF. |
| `tipo` | `"empresa"` \| `"particular"` | Obligatorio. "empresa" = empresa/autónomo. Por defecto `"empresa"`. |
| `nif` | string | Obligatorio para descargar solo si `tipo = "empresa"`. |
| `direccion` | string | Opcional. |
| `email` | string | Opcional. |

### Linea

| Campo | Tipo | Reglas |
|---|---|---|
| `descripcion` | string | Obligatoria. |
| `cantidad` | number | > 0; admite decimales (1,5). |
| `precio` | integer (céntimos) | ≥ 0. |

Una línea inválida se marca en pantalla y **no cuenta en los totales**; mientras exista, no se puede descargar el PDF.

## Reglas para descargar el PDF (FR-017)

Se puede descargar solo si se cumplen todas; si no, se muestra el primer motivo que falle:
1. El perfil existe y tiene `nombre` y `nif` → si no: "Completa tu perfil (nombre y NIF) antes de descargar el PDF."
2. `cliente.nombre` no vacío, y `cliente.nif` si es empresa/autónomo.
3. Al menos una línea.
4. Ninguna línea inválida.

## Operaciones y efectos sobre el estado

| Operación | Efecto |
|---|---|
| Crear presupuesto | `año = fechaHoy.año`; `contadores[año] = (contadores[año] ?? 0) + 1`; nuevo presupuesto con ese número y `fechaEmision = hoy`. |
| Duplicar (FR-019a) | Igual que crear, copiando (copia profunda) `cliente`, `lineas`, `retencion` y `notas`. El original no cambia. |
| Editar presupuesto | Cambia `cliente`, `lineas`, `retencion`, `notas`. Nunca `numero` ni `fechaEmision`. Se guarda en cada cambio. |
| Eliminar presupuesto | Tras confirmar, se quita del array. `contadores` no cambia (sin reutilización de números). |
| Lista (FR-019) | Ordenada por `fechaEmision` desc y, a igualdad, por número desc. |
| Restaurar copia | Si es válida y se confirma, sustituye el estado completo. |

No hay transiciones de estado: los presupuestos no tienen estados de flujo (solo "Caducado", calculado).
