# Contract: archivo de exportación (.zip) y funciones puras

**Requisitos**: FR-002, FR-003, FR-004, FR-005, FR-006, FR-007

## Archivo descargado

- **Nombre**: `presupuestospro-copia-AAAA-MM-DD.zip` (fecha local al pulsar el botón).
- **Tipo**: `application/zip`. ZIP estándar (PKWARE APPNOTE), método 0 (STORE), sin ZIP64, sin cifrado, sin comentarios.
- **Nombres internos**: UTF-8 con el bit 11 del «general purpose bit flag» activado. Todas las entradas en la raíz, sin entradas de carpeta.
- **Contenido**: exactamente N + 1 entradas (N = número de presupuestos guardados):
  - N PDF `<número> - <cliente>.pdf`
  - 1 JSON `presupuestospro-copia-AAAA-MM-DD.json` con el formato de [backup-file.md](../../001-presupuestos-pdf/contracts/backup-file.md), aceptado por «Restaurar copia».

### Ejemplo (3 presupuestos, exportado el 15/03/2026)

```text
presupuestospro-copia-2026-03-15.zip
├── 2026-003 - Sin cliente.pdf
├── 2026-002 - Diseño-Web S.L.pdf
├── 2026-001 - Estudio García.pdf
└── presupuestospro-copia-2026-03-15.json
```

## Funciones nuevas (interfaz entre módulos)

### `js/calc.js` (puras, con test en `tests/calc.test.js`)

| Función | Entrada | Salida | Notas |
|---|---|---|---|
| `nombreArchivoPdf(numero, nombreCliente)` | `string`, `string` | `string` | Reglas de limpieza, «Sin cliente» y ≤ 100 caracteres ([research.md](../research.md) R6). |
| `crc32(bytes)` | `Uint8Array` | `number` (entero sin signo de 32 bits) | `crc32(utf8("123456789")) === 0xCBF43926`. |
| `crearZip(archivos, fecha)` | `[{ nombre: string, datos: Uint8Array }]`, `Date` | `Uint8Array` | ZIP STORE; `fecha` se usa como fecha/hora DOS de todas las entradas (local). Sin DOM. |

Propiedades que los tests comprueban sobre `crearZip`:
- Empieza por la firma `PK\x03\x04` y termina con un registro final `PK\x05\x06` cuyo número de entradas = `archivos.length`.
- Por cada entrada, el directorio central contiene su nombre en UTF-8, el bit 11 activo, método 0, CRC-32 y tamaños correctos, y el desplazamiento apunta a su cabecera local.
- Los bytes de cada archivo aparecen intactos tras su cabecera local.

### `js/pdf.js`

| Función | Cambio |
|---|---|
| `generarPdf(perfil, presupuesto)` | **Nueva**: contiene el dibujo actual íntegro y devuelve el documento jsPDF sin guardarlo. |
| `descargarPdf(perfil, presupuesto)` | Igual que hoy por fuera: `generarPdf(...).save("Presupuesto-<número>.pdf")`. |

### `js/store.js`

| Función | Cambio |
|---|---|
| `textoCopia(estado)` | **Nueva**: `JSON.stringify(estado, null, 2)`. |
| `descargarArchivo(blob, nombre)` | **Nueva**: descarga mediante enlace temporal; revoca la URL con retraso. |
| `exportarCopia(estado)` | Igual que hoy por fuera; internamente usa `textoCopia` y `descargarArchivo`. |
