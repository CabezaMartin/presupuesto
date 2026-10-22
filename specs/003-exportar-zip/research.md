# Research: Exportar todos los presupuestos en un .zip

**Feature**: `003-exportar-zip` | **Fecha**: 2026-10-22 | **Plan**: [plan.md](plan.md)

Todas las incógnitas del Technical Context quedan resueltas aquí. No queda ningún «NEEDS CLARIFICATION».

---

## R1. Cómo crear el .zip sin añadir dependencias

**Decision**: escribir un generador de ZIP mínimo propio, como función pura `crearZip(archivos, fecha)` en `js/calc.js`, usando el método **STORE** (sin compresión, método 0 del formato ZIP): cabecera local + datos + directorio central + registro final, con CRC-32 calculado por una tabla de 256 entradas. Nombres de archivo en UTF-8 marcados con el bit 11 («language encoding flag») para que tildes y «ñ» se vean bien al descomprimir en Windows, macOS y Linux.

**Rationale**:
- CLAUDE.md prohíbe dependencias nuevas (jsPDF es la única) y la spec lo recuerda explícitamente como restricción.
- El formato ZIP con STORE es pequeño y estable (unas 80–100 líneas): no hace falta compresión real para cumplir la spec, que pide «un único archivo .zip» que se descomprima con doble clic (SC-002). Un ZIP STORE es un .zip estándar que abren todos los exploradores de archivos.
- Al ser una función pura (recibe bytes, devuelve bytes), se prueba con `node --test` como el resto de `calc.js`, sin navegador.
- Máximo previsto (~200 presupuestos) queda muy por debajo de los límites del ZIP clásico (65.535 entradas, 4 GB), así que no hace falta ZIP64.

**Alternatives considered**:
- **JSZip / fflate en `vendor/`**: resuelve el problema con más funciones, pero es una dependencia nueva, prohibida por CLAUDE.md, y no aporta nada que la spec pida. Rechazada.
- **Compresión DEFLATE con `CompressionStream("deflate-raw")`**: reduciría el tamaño, pero no está disponible en Safari iOS 15–16.3 (plataforma objetivo heredada de la spec 001) y añade código asíncrono por archivo. La spec no fija un tamaño máximo. Rechazada por simplicidad (Principio I).
- **Descargar N PDF sueltos + JSON**: incumple FR-002 (un único archivo) y los navegadores bloquean descargas múltiples. Rechazada.

---

## R2. Garantizar que el PDF del .zip es el mismo que el individual

**Decision**: separar en `js/pdf.js` la construcción del documento de su descarga:
- `generarPdf(perfil, presupuesto)` → devuelve el objeto jsPDF ya dibujado (todo el código actual de dibujo, sin cambios).
- `descargarPdf(perfil, presupuesto)` → `generarPdf(...).save("Presupuesto-<número>.pdf")` (comportamiento actual intacto).
- La exportación usa `generarPdf(...).output("arraybuffer")` para obtener los bytes.

**Rationale**: un único camino de código para dibujar el PDF hace que FR-005 se cumpla por construcción: mismo contenido, diseño e importes al céntimo (los importes salen de `calcularTotales`, ya probado). Solo pueden diferir los metadatos internos de fecha de creación, que la spec excluye explícitamente de la comparación.

**Alternatives considered**: duplicar el código de dibujo en una función «para el zip» (riesgo de divergencia, rechazada); interceptar `doc.save` (frágil, rechazada).

---

## R3. Presupuestos que hoy no se pueden descargar individualmente

**Contexto**: la descarga individual está protegida por `puedeDescargar` (perfil con nombre y NIF, cliente con nombre, NIF si es empresa, al menos una línea válida). La spec, en cambio, exige un PDF por **cada** presupuesto «sin excepción» (FR-004), contempla borradores «Sin cliente» y perfil sin completar (Edge Cases).

**Decision**: la exportación **no** aplica `puedeDescargar`. Llama a `generarPdf` para todos los presupuestos; si el perfil es `null`, se le pasa un perfil vacío (`nombre`, `nif`, `direccion`, `email`, `telefono` = `""`, `logo` = `null`) para que el dibujo no falle. El código de dibujo no cambia: el PDF sale «tal como la app lo genera para ese caso» (líneas vacías donde falta el dato).

**Rationale**: es la única forma de cumplir FR-004 sin tocar el diseño del PDF (FR-005) ni inventar reglas nuevas. Como estos presupuestos no tienen PDF individual, FR-005 no aplica a ellos.

**Limitación conocida (aceptada)**: una línea de borrador con cantidad no numérica puede mostrarse en el PDF con un texto técnico en la columna «Cantidad» (p. ej. `null`). Corregirlo exigiría cambiar el dibujo del PDF, fuera del alcance de esta spec (Principio III). No afecta a presupuestos válidos.

**Alternatives considered**: omitir los presupuestos no descargables (incumple FR-004); bloquear la exportación hasta que todos sean válidos (incumple el Edge Case «perfil sin completar: la exportación funciona igual»).

---

## R4. Archivo de datos idéntico a la copia de seguridad

**Decision**: extraer en `js/store.js` la serialización actual a `textoCopia(estado)` (= `JSON.stringify(estado, null, 2)`), que usan tanto `exportarCopia` (Perfil, sin cambios visibles) como la exportación .zip. El JSON se codifica en UTF-8 (`TextEncoder`) y se guarda como `presupuestospro-copia-AAAA-MM-DD.json`.

**Rationale**: FR-007 y SC-008 piden el mismo contenido y formato que la copia de Perfil, para que «Restaurar copia» lo acepte sin cambios en `validarCopia`. Compartir la función lo garantiza.

---

## R5. Instantánea, fecha y solo lectura

**Decision**:
- Al pulsar el botón se toma **una sola vez** la fecha (`hoyISO()`) y una instantánea del estado: `texto = textoCopia(estado)` y `copia = JSON.parse(texto)`. Todos los PDF se generan desde `copia`; el JSON del .zip es `texto`.
- La exportación nunca llama a `persistir()`, `guardar()` ni modifica `estado`.

**Rationale**: el .zip es coherente consigo mismo aunque el usuario navegue o edite durante la exportación; la fecha del .zip y del .json es la misma aunque se cruce la medianoche; FR-008/SC-007 se cumplen porque no hay ninguna escritura.

---

## R6. Nombres de archivo de los PDF

**Decision**: función pura `nombreArchivoPdf(numero, nombreCliente)` en `js/calc.js`:
1. Cliente = `nombreCliente.trim()`; si queda vacío → `Sin cliente`.
2. Normalizar a Unicode NFC (tildes escritas en macOS/iOS se ven igual en Windows).
3. Sustituir cada carácter de `/ \ : * ? " < > |` y de control (U+0000–U+001F, U+007F) por `-`.
4. Quitar espacios y puntos al principio y al final; si queda vacío → `Sin cliente`.
5. Recortar la parte del cliente (por caracteres completos, sin partir emojis/surrogates) para que `<número> - <cliente>.pdf` no supere 100 caracteres; tras recortar se repite el paso 4.
6. Resultado: `<número> - <cliente>.pdf`.

Ejemplos (casos de test): `Estudio García` → `2026-001 - Estudio García.pdf`; `Diseño/Web S.L.` → `2026-002 - Diseño-Web S.L.pdf`; `""` → `2026-003 - Sin cliente.pdf`.

**Rationale**: reglas literales de la spec (Edge Cases), en lógica pura y con test. El número va siempre primero e intacto, y es único, así que no hay colisiones (la spec lo asume).

---

## R7. Progreso, bloqueo de doble exportación y fluidez

**Decision**:
- Función asíncrona `exportarZip()` en `app.js` que recorre los presupuestos en el mismo orden que la lista; antes de cada PDF actualiza el texto «Preparando presupuesto i de N…» y cede el control al navegador (`await new Promise((r) => setTimeout(r, 0))`) para que se pinte.
- Variable de módulo `exportando` (booleana): si es `true`, el botón se pinta desactivado (también si el usuario sale y vuelve a la lista) y un segundo clic no hace nada.
- Al terminar (bien o mal) se restablece en un bloque `finally`.

**Rationale**: cumple FR-010 y SC-006 (indicación en < 1 s: se muestra antes del primer PDF) con lo mínimo; sin Web Workers (jsPDF depende de `window` y añadiría complejidad).

**Alternatives considered**: Web Worker (rechazado por complejidad y por la dependencia de jsPDF del `window`); barra de progreso gráfica (no pedida; el texto basta).

---

## R8. Descarga del .zip y errores

**Decision**:
- Extraer el patrón de descarga actual de `exportarCopia` a un ayudante `descargarArchivo(blob, nombre)` en `store.js`, que usan ambos. El `URL.revokeObjectURL` se retrasa unos segundos para no cortar descargas grandes en Safari.
- El Blob del .zip (`application/zip`) se crea y descarga **solo** cuando todos los PDF y el JSON se han generado. Todo el proceso va en `try/catch`: ante cualquier excepción se muestra «No se ha podido crear el archivo .zip. Inténtalo de nuevo.» y no se descarga nada (FR-011).

**Rationale**: no puede haber .zip incompleto porque la descarga es el último paso; no hay escrituras que deshacer (R5).

---

## R9. Ubicación del botón y estado vacío

**Decision**: el botón «Exportar todo (.zip)» (estilo `secundario`) va junto a «Nuevo presupuesto» en la cabecera de la lista, en un contenedor que se ajusta en varias líneas a 360 px. Se muestra **también** cuando la lista está vacía, porque la User Story 3 exige poder pulsarlo y recibir el aviso «No hay presupuestos que exportar.» (que usa el `mostrarAviso` existente).

**Rationale**: FR-001 (visible en la lista, también a 360 px) y FR-009. No se toca Inicio ni Perfil (Assumptions).

---

## R10. Rendimiento y memoria

**Decision**: no se aplica optimización adicional. Estimación: un PDF de jsPDF se genera en decenas de milisegundos; con logo (≤ 600 px) cada PDF ocupa del orden de decenas a cientos de KB. 50 presupuestos → muy por debajo de 1 minuto (SC-006); 200 presupuestos → .zip de unas decenas de MB como máximo, manejable en memoria por cualquier navegador actual.

**Rationale**: Principio I; si en la validación manual (quickstart) no se cumple SC-006, se revisará entonces.
