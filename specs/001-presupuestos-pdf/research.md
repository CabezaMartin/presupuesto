# Research: PresupuestosPro v0

**Feature**: `001-presupuestos-pdf` | **Date**: 2026-10-03

Guía de todas las decisiones: **simplicidad ante todo** (Principio I), publicar online enseguida y funcionar bien en el móvil.

## R1. Tipo de aplicación y stack

- **Decision**: Aplicación web estática de una sola página. HTML + CSS + JavaScript sin framework, con módulos ES nativos. Sin backend y sin paso de compilación (no hay npm build, bundler ni transpilación).
- **Rationale**: la spec pide que los datos queden en el equipo del freelancer (FR-020) y no hay cuentas ni nube, así que no hace falta servidor. Sin build, publicar = subir la carpeta. Pocas pantallas (lista, editor, catálogo, perfil): un framework no aporta lo suficiente para compensar su coste.
- **Alternatives considered**: React/Vue + Vite (requiere build y dependencias; innecesario para 4 pantallas). App con backend + base de datos (contradice FR-020 y añade hosting, cuentas y seguridad). App nativa / PWA instalable (más trabajo; no lo pide la spec).

## R2. Persistencia local

- **Decision**: `localStorage`, con **una sola clave** (`presupuestospro`) que guarda un único objeto JSON con todo el estado (ver [data-model.md](data-model.md)). Se lee al arrancar y se reescribe entero en cada cambio.
- **Rationale**: API síncrona y trivial; el volumen de un freelancer (decenas o cientos de presupuestos) ocupa muy poco. Guardar todo como un objeto hace que la copia de seguridad sea simplemente ese mismo objeto en un archivo.
- **Logo**: se guarda como data URL. Para no agotar el límite de ~5 MB de `localStorage`, al subirlo se reduce con un `<canvas>` a un máximo de 600 px de lado, conservando el formato (PNG o JPG). Si aun así no cabe, se muestra un mensaje claro.
- **Alternatives considered**: IndexedDB (asíncrona, más código; sobra para este volumen). Archivos en disco (no hay acceso desde una web).

## R3. Generación del PDF

- **Decision**: **jsPDF** + **jspdf-autotable** (para la tabla de líneas), copiados en `vendor/` como archivos `.min.js` y cargados con `<script>`. El PDF se descarga con `doc.save("Presupuesto-2026-001.pdf")`.
- **Rationale**: genera un PDF real en el navegador, con nombre de archivo controlado, igual en escritorio y móvil. Sin dependencia de CDN en tiempo de ejecución (los archivos se sirven junto a la app).
- **Fuente**: Helvetica estándar de jsPDF, que cubre los caracteres del español (á, é, ñ, ü, ¿, ¡) y el símbolo €. Se valida en el [quickstart](quickstart.md).
- **Alternatives considered**: `window.print()` + CSS de impresión (cero dependencias, pero en el móvil "Guardar como PDF" es confuso o no existe, y no se controla el nombre del archivo; riesgo para SC-001/SC-006). html2pdf/html2canvas (PDF rasterizado, texto no seleccionable, peor calidad). Generar el PDF en servidor (requiere backend).

## R4. Cálculos y redondeo

- **Decision**: todos los importes se manejan internamente en **céntimos enteros**. Fórmulas (FR-010):
  - `importeLinea = redondear(cantidad × precioCentimos)`
  - `base = Σ importeLinea` (solo líneas válidas)
  - `iva = redondear(base × 21 / 100)`
  - `retencion = aplica ? redondear(base × pct / 100) : 0`, con `aplica = retencion.activa && cliente.tipo === "empresa"`
  - `total = base + iva − retencion`
- `redondear(x) = Math.round(Number(x.toPrecision(12)))`: medio hacia arriba (todos los valores son ≥ 0) y elimina errores de coma flotante del tipo `4999.4999999`.
- **Rationale**: con enteros no hay errores acumulados al sumar. Verificado a mano con los casos de la spec: 2.120,00 / 2.280,00 / 2.420,00 € y 3 × 33,33 € → base 9.999 c, IVA 2.100 c, retención 1.500 c, total 10.599 c (105,99 €).
- Todo esto vive en un módulo puro (`js/calc.js`) sin acceso al DOM, para poder probarlo aislado.

## R5. Formato de importes, números y fechas

- **Decision**: formateo propio, sin `Intl.NumberFormat`.
  - Importes: `1.500,00 €` (punto de miles, coma decimal, espacio y €).
  - Entrada de números: se aceptan coma o punto como separador decimal (`1,5` y `1.5`); los teclados móviles en español muestran la coma.
  - Fechas: `dd/mm/aaaa`.
- **Rationale**: `Intl.NumberFormat('es-ES')` **no pone separador de miles en números de 4 cifras** (da `1500,00 €`, regla CLDR de agrupación mínima), y la spec exige `1.500,00 €` (FR-021). Un formateador propio son ~10 líneas.

## R6. Fechas, numeración y caducidad

- **Decision**:
  - La fecha de emisión se guarda como texto `AAAA-MM-DD` en **hora local** del dispositivo (no UTC, para evitar desfases de un día por la noche).
  - Validez = `new Date(a, m-1, d + 30)` → días naturales; cruza meses y años correctamente (15/12/2026 → 14/01/2027).
  - Numeración: un mapa `contadores[año] = último número asignado`. Al crear o duplicar: `n = (contadores[año] ?? 0) + 1`, se guarda y se forma `AAAA-` + `n` con al menos 3 dígitos. Eliminar un presupuesto no toca el contador (sin reutilización).
  - Caducado: `hoy > validez` (comparando textos `AAAA-MM-DD`). Se calcula al mostrar; no se guarda.

## R7. Diseño para móvil

- **Decision**: CSS propio, *mobile first*, una columna; a partir de ~720 px se aprovecha el ancho. Sin librería de CSS.
  - `<meta name="viewport" content="width=device-width, initial-scale=1">`.
  - Campos con `font-size ≥ 16px` (evita el zoom automático de iOS) y botones de al menos 44 px de alto.
  - Cantidad y precio con `inputmode="decimal"` (teclado numérico con coma).
  - En el editor, las líneas se muestran como tarjetas apiladas (no como tabla ancha) y el desglose de totales queda fijo al pie de la pantalla, siempre visible (SC-003).
  - Navegación con barra inferior: Presupuestos · Catálogo · Perfil.
- **Rationale**: es la forma más simple de que funcione igual de bien en el móvil y en el ordenador.

## R8. Navegación

- **Decision**: rutas por hash (`#/presupuestos`, `#/presupuesto/<id>`, `#/catalogo`, `#/perfil`) y una función que pinta la vista según el hash.
- **Rationale**: el botón "atrás" del móvil funciona sin más código y no requiere configuración en el hosting (cualquier servidor estático vale).

## R9. Copia de seguridad

- **Decision**: "Descargar copia de seguridad" descarga el objeto de estado como `presupuestospro-copia-AAAA-MM-DD.json` (Blob + enlace `download`). "Restaurar copia" usa `<input type="file">`, valida el archivo (ver [contracts/backup-file.md](contracts/backup-file.md)), pide confirmación con `confirm()` y sustituye el estado. Si no es válido, mensaje y no se toca nada (FR-020b). Ambas acciones están en la pantalla Perfil.

## R10. Publicación online

- **Decision**: hosting estático gratuito con HTTPS. Recomendado **Netlify Drop** (arrastrar la carpeta a app.netlify.com/drop: publicado en minutos). Alternativa equivalente: GitHub Pages.
- **Rationale**: no hay backend ni build, así que cualquier hosting estático sirve. No se necesitan claves ni secretos (Principio V).
- **Nota para el usuario final**: los datos viven en el navegador de cada dispositivo; la copia de seguridad es la forma de pasarlos a otro dispositivo o protegerlos (ya contemplado en la spec).

## R11. Pruebas

- **Decision**:
  - **Automáticas, solo para la lógica crítica**: `tests/calc.test.js` con el *test runner* integrado de Node (`node --test`), sin dependencias. Cubre los casos de referencia (SC-002), el redondeo, la numeración (SC-005), la validez de 30 días y el formato de importes.
  - **Manuales**: el [quickstart](quickstart.md), hecho como lo haría una persona no técnica (Principio IV), en móvil y en ordenador.
- **Alternatives considered**: Jest/Vitest (dependencias y configuración innecesarias). Pruebas E2E con Playwright (sobra para la v1; la verificación manual la exige igualmente la constitución).

## Sin aclaraciones pendientes

Todas las incógnitas del contexto técnico quedan resueltas. No queda ningún NEEDS CLARIFICATION.
