# Data Model: Exportar todos los presupuestos en un .zip

**Feature**: `003-exportar-zip` | **Plan**: [plan.md](plan.md)

## Estado guardado (`localStorage`)

**Sin cambios.** El objeto de estado es exactamente el de la spec 001 ([data-model.md](../001-presupuestos-pdf/data-model.md)) con el campo `estado` de la spec 002 ([data-model.md](../002-home-rediseno-visual/data-model.md)). No se añaden campos, entidades ni versiones (`version` sigue en `1`). La exportación solo **lee** el estado (FR-008).

## Entidades transitorias (solo existen durante la exportación, nunca se guardan)

### ArchivoZip (entrada del generador)

Lista ordenada de entradas que recibe `crearZip`:

| Campo | Tipo | Regla |
|---|---|---|
| `nombre` | string | Nombre del archivo en la raíz del .zip (sin carpetas, sin `/`). Se codifica en UTF-8. |
| `datos` | `Uint8Array` | Bytes del archivo. |

Orden: los PDF en el mismo orden que la lista de presupuestos (más reciente primero) y, al final, el JSON de datos.

### Contenido del .zip

| Elemento | Cantidad | Nombre | Origen |
|---|---|---|---|
| PDF de presupuesto | 1 por presupuesto guardado (todos los estados, caducados incluidos) | `nombreArchivoPdf(numero, cliente.nombre)` → `<número> - <cliente>.pdf` | `generarPdf(perfil ?? perfilVacío, presupuesto).output("arraybuffer")` |
| Archivo de datos | 1 | `presupuestospro-copia-AAAA-MM-DD.json` | `textoCopia(estado)` codificado en UTF-8 (formato de [backup-file.md](../001-presupuestos-pdf/contracts/backup-file.md)) |

Nombre del propio .zip: `presupuestospro-copia-AAAA-MM-DD.zip` (misma fecha local que el JSON, tomada una sola vez al pulsar).

### Perfil vacío (sustituto cuando `perfil` es `null`)

`{ nombre: "", nif: "", direccion: "", email: "", telefono: "", logo: null }` — solo se usa para dibujar el PDF; no se guarda.

## Reglas de validación

- **Nombre de PDF** (R6 de [research.md](research.md)): caracteres `/ \ : * ? " < > |` y de control → `-`; recorte de espacios y puntos en los extremos; vacío → `Sin cliente`; NFC; longitud total ≤ 100 caracteres conservando siempre el número.
- **Exportación con 0 presupuestos**: no se crea ninguna entidad transitoria; solo se muestra el aviso (FR-009).

## Estados de la exportación (en memoria, `app.js`)

```text
inactiva ──clic con N ≥ 1──▶ preparando (i de N) ──todo generado──▶ descarga ──▶ inactiva
    │                               │
    └─clic con N = 0─▶ aviso «No hay presupuestos que exportar.» (sigue inactiva)
                                    └─excepción─▶ aviso «No se ha podido crear el archivo .zip. Inténtalo de nuevo.» ─▶ inactiva
```

Mientras está en «preparando», el botón está desactivado y los clics se ignoran (FR-010).
