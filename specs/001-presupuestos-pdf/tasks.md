---

description: "Task list for PresupuestosPro v0 — Presupuestos profesionales en PDF"
---

# Tasks: PresupuestosPro v0 — Presupuestos profesionales en PDF

**Input**: Design documents from `/specs/001-presupuestos-pdf/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/ui.md](contracts/ui.md), [contracts/backup-file.md](contracts/backup-file.md), [quickstart.md](quickstart.md)

**Tests**: solo las pruebas automáticas de la lógica pura (`tests/calc.test.js`, `node --test`) que fija el [plan](plan.md) (R11 de research). El resto se valida a mano con [quickstart.md](quickstart.md) (Principio IV).

**Organization**: tareas agrupadas por historia de usuario, en el orden de prioridad de la spec.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede hacer en paralelo (otro archivo, sin dependencias pendientes)
- **[Story]**: historia de usuario (US1…US5)

## Convenciones para todas las tareas

- Proyecto plano en la raíz: `index.html`, `styles.css`, `js/`, `vendor/`, `tests/`. Sin framework, sin build, módulos ES nativos.
- Importes internos en **céntimos enteros**; fechas como texto `AAAA-MM-DD` en hora local; `id` con `crypto.randomUUID()`.
- Todos los textos visibles en **español de España**. Importes `1.500,00 €`, fechas `dd/mm/aaaa`.
- `js/calc.js` no toca el DOM ni `localStorage` (debe poder importarse desde Node).
- Cada cambio del usuario se guarda automáticamente con `guardar(estado)`; no hay botones "Guardar" ni "Calcular" en el editor.
- Al actualizar importes mientras se escribe, **no** volver a pintar los `<input>` (en el móvil se cerraría el teclado y se perdería el foco): actualizar solo los nodos de texto de importes y totales.
- No añadir nada que no esté en la spec (Principio III).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: esqueleto del proyecto y dependencia de PDF.

- [X] T001 Crear la estructura del proyecto en la raíz: `index.html`, `styles.css`, `js/app.js`, `js/calc.js`, `js/store.js`, `js/pdf.js`, carpetas `vendor/` y `tests/`, y un `package.json` mínimo con solo `{ "private": true, "type": "module", "scripts": { "test": "node --test tests/" } }` (sin dependencias; solo para que Node trate los `.js` como módulos ES en las pruebas)
- [X] T002 [P] Descargar jsPDF y su plugin de tablas a `vendor/jspdf.umd.min.js` (desde `https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js`) y `vendor/jspdf.plugin.autotable.min.js` (desde `https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.4/dist/jspdf.plugin.autotable.min.js`)
- [X] T003 Escribir `index.html`: `<html lang="es">`, `<meta charset="utf-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1">`, `<title>PresupuestosPro</title>`, `<link rel="stylesheet" href="styles.css">`, `<main id="app"></main>`, una zona `<div id="aviso" role="status">` para mensajes, barra de navegación `<nav>` con enlaces `#/presupuestos` (Presupuestos), `#/catalogo` (Catálogo) y `#/perfil` (Perfil), y al final `<script src="vendor/jspdf.umd.min.js">`, `<script src="vendor/jspdf.plugin.autotable.min.js">` y `<script type="module" src="js/app.js">`
- [X] T004 [P] Escribir los estilos base *mobile first* en `styles.css`: una columna con márgenes laterales de 16 px, fuente del sistema, `input, select, textarea, button { font-size: 16px }` (evita el zoom de iOS), botones y campos de al menos 44 px de alto, barra `<nav>` fija abajo en pantallas estrechas (y con `padding-bottom` en `main` para que no tape contenido), clases `.error` (borde y texto rojo) y `.etiqueta-caducado`, y una media query `min-width: 720px` que centre el contenido con un ancho máximo de ~720 px

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: formato, fechas, almacenamiento y router, que usan todas las historias.

**⚠️ CRITICAL**: ninguna historia puede empezar hasta terminar esta fase.

- [X] T005 [P] Implementar en `js/calc.js` (exportadas) las funciones de formato y entrada: `formatEuros(centimos)` → `"1.500,00 €"` con punto de miles en **todos** los números de 4 o más cifras, coma decimal, espacio y `€` (no usar `Intl.NumberFormat`, que da `1500,00 €`); `formatEurosNegativo(centimos)` → `"−300,00 €"`; `formatCantidad(n)` → coma decimal sin ceros sobrantes (`1,5`, `3`); `parseDecimal(texto)` que acepta coma o punto como separador decimal (`"1,5"` y `"1.5"` → `1.5`, `"33,33"` → `33.33`) y devuelve `NaN` si no es un número; `eurosACentimos(numero)` → `Math.round(Number((numero * 100).toPrecision(12)))`; `formatFecha("2026-10-03")` → `"03/10/2026"`
- [X] T006 Implementar en `js/calc.js` (exportadas) las funciones de fecha: `hoyISO()` → fecha local de hoy como `AAAA-MM-DD` (no usar `toISOString()`, que es UTC); `fechaValidez(fechaEmision)` → `new Date(a, m-1, d + 30)` formateada `AAAA-MM-DD` (30 días naturales; `2026-10-03` → `2026-11-02`, `2026-12-15` → `2027-01-14`); `estaCaducado(fechaEmision, hoy)` → `hoy > fechaValidez(fechaEmision)` comparando textos `AAAA-MM-DD`
- [X] T007 [P] Implementar `js/store.js`: `estadoInicial()` → `{ app: "presupuestospro", version: 1, perfil: null, catalogo: [], presupuestos: [], contadores: {} }`; `cargar()` lee `localStorage.getItem("presupuestospro")`, hace `JSON.parse` y devuelve `estadoInicial()` si no existe o falla; `guardar(estado)` hace `localStorage.setItem("presupuestospro", JSON.stringify(estado))` dentro de `try/catch` y devuelve `false` si falla (p. ej. cuota llena), `true` si va bien
- [X] T008 Implementar en `js/app.js` la base de la app: `let estado = cargar()`; función `persistir()` que llama a `guardar(estado)` y, si devuelve `false`, muestra el aviso "No se han podido guardar los datos: el almacenamiento del navegador está lleno."; función `mostrarAviso(texto)` que escribe en `#aviso` y lo oculta a los ~4 s; helper `escaparHTML(texto)`; router por hash que escucha `hashchange` y `DOMContentLoaded` y pinta en `#app` la vista de `#/presupuestos`, `#/presupuesto/<id>`, `#/catalogo` o `#/perfil` (por ahora con vistas vacías que solo muestran su título); cualquier ruta desconocida o `id` inexistente redirige a `#/presupuestos`; marca como activo el enlace de la `<nav>` correspondiente
- [X] T009 [P] Crear `tests/calc.test.js` con `node:test` y `node:assert/strict`, importando de `../js/calc.js`, con pruebas de la fase: `formatEuros(150000)` = `"1.500,00 €"`, `formatEuros(50000)` = `"500,00 €"`, `formatEuros(10599)` = `"105,99 €"`, `formatEuros(123456789)` = `"1.234.567,89 €"`, `formatEuros(0)` = `"0,00 €"`; `parseDecimal("1,5")` = `1.5`, `parseDecimal("abc")` es `NaN`; `formatFecha("2026-10-03")` = `"03/10/2026"`; `fechaValidez("2026-10-03")` = `"2026-11-02"`; `fechaValidez("2026-12-15")` = `"2027-01-14"`; `estaCaducado("2026-09-01", "2026-10-01")` = `false` y `estaCaducado("2026-09-01", "2026-10-02")` = `true`

**Checkpoint**: `npm test` (o `node --test tests/`) pasa; la app abre en un servidor local y la navegación inferior cambia de vista.

---

## Phase 3: User Story 1 - Crear un presupuesto con los importes calculados solos (Priority: P1) 🎯 MVP

**Goal**: crear un presupuesto con cliente, líneas a mano, retención y notas, viendo base, IVA, retención y total correctos y actualizados al momento, con número AAAA-NNN y validez de 30 días.

**Independent Test**: crear un presupuesto con las líneas del ejemplo de referencia escritas a mano y comprobar en pantalla 2.120,00 € (15 %), 2.280,00 € (7 %) y 2.420,00 € (sin retención o particular), como en los pasos 3.1–3.7 de [quickstart.md](quickstart.md).

### Implementation for User Story 1

- [X] T010 [P] [US1] Implementar en `js/calc.js` (exportadas): `redondear(x)` → `Math.round(Number(x.toPrecision(12)))`; `validarLinea(linea)` → objeto de errores por campo según data-model: `descripcion` "Obligatoria." (vacía tras quitar espacios), `cantidad` "> 0; admite decimales (1,5)." (error si no es número o ≤ 0, mensaje visible "La cantidad debe ser mayor que 0."), `precio` "≥ 0." (error si no es número o < 0, mensaje "El precio no puede ser negativo."); `calcularTotales(presupuesto)` → `{ lineas: [{ importe, errores, valida }], base, iva, retencionAplicada, importeRetencion, total, avisoParticular }` con: `importe = redondear(cantidad × precio)` (precio en céntimos); `base` = suma de importes de las líneas **válidas** (las inválidas no cuentan); `iva = redondear(base × 21 / 100)`; `retencionAplicada = retencion.activa && cliente.tipo === "empresa"`; `importeRetencion = retencionAplicada ? redondear(base × retencion.porcentaje / 100) : 0`; `total = base + iva − importeRetencion`; `avisoParticular = retencion.activa && cliente.tipo === "particular"`
- [X] T011 [US1] Implementar en `js/calc.js` (exportada) `siguienteNumero(contadores, fechaEmision)` → `{ numero, contadores }` sin mutar la entrada: `año = fechaEmision.slice(0, 4)`, `n = (contadores[año] ?? 0) + 1`, `numero = año + "-" + String(n).padStart(3, "0")` (al menos tres dígitos; `2026-1000` si se pasa de 999), y devuelve una copia de `contadores` con `[año]: n`
- [X] T012 [US1] Añadir a `tests/calc.test.js` las pruebas de US1 (depende de T010, T011): presupuesto empresa con líneas `{ "Diseño de página web", 1, 150000 }` y `{ "Sesión de fotos de producto", 1, 50000 }`: con retención 15 % → base `200000`, iva `42000`, retención `30000`, total `212000`; con 7 % → retención `14000`, total `228000`; retención desactivada → total `242000`; cliente particular con retención activa → `retencionAplicada` `false`, total `242000`, `avisoParticular` `true`; línea `3 × 3333` empresa 15 % → base `9999`, iva `2100`, retención `1500`, total `10599`; redondeo medio hacia arriba: `1,5 × 3333` → importe `5000`; línea con cantidad `0` → no válida y no suma en la base; `siguienteNumero({}, "2026-10-03")` → `"2026-001"`; con `{ "2026": 1 }` → `"2026-002"`; 10 llamadas seguidas → `2026-001` … `2026-010`; con `{ "2026": 57 }` y fecha `2027-01-02` → `"2027-001"`; con `{ "2026": 999 }` → `"2026-1000"`
- [X] T013 [US1] Implementar en `js/app.js` la operación `crearPresupuesto()`: `hoy = hoyISO()`; obtiene número con `siguienteNumero(estado.contadores, hoy)` y actualiza `estado.contadores`; añade a `estado.presupuestos` `{ id: crypto.randomUUID(), numero, fechaEmision: hoy, cliente: { nombre: "", tipo: "empresa", nif: "", direccion: "", email: "" }, lineas: [], retencion: { activa: false, porcentaje: 15 }, notas: "" }`; llama a `persistir()` y navega a `#/presupuesto/<id>`
- [X] T014 [US1] Implementar en `js/app.js` una vista mínima de `#/presupuestos`: botón principal "Nuevo presupuesto" (llama a `crearPresupuesto()`) y una lista sencilla de enlaces a `#/presupuesto/<id>` mostrando número y nombre del cliente (o "Sin cliente"). La lista completa se termina en US5
- [X] T015 [US1] Implementar en `js/app.js` la vista del editor `#/presupuesto/<id>`, parte superior: cabecera no editable con número, "Fecha de emisión: dd/mm/aaaa" y "Válido hasta: dd/mm/aaaa" (`fechaValidez`); sección **Cliente** con selector de tipo (`empresa` → "Empresa / autónomo", `particular` → "Particular"), nombre o razón social, NIF/CIF (con asterisco de obligatorio solo si el tipo es empresa), dirección (textarea) y email (`type="email"`); cada `input` actualiza `presupuesto.cliente`, llama a `persistir()` y recalcula los totales (T018)
- [X] T016 [US1] Implementar en `js/app.js` la sección **Líneas** del editor: cada línea como tarjeta con descripción, cantidad (`inputmode="decimal"`, se lee con `parseDecimal`), precio unitario en euros (`inputmode="decimal"`, se guarda en céntimos con `eurosACentimos(parseDecimal(texto))`), importe calculado y botón "Eliminar línea"; botón "Añadir línea" que añade `{ descripcion: "", cantidad: 1, precio: 0 }`; los campos con error según `validarLinea` reciben la clase `.error` y muestran su mensaje debajo; al escribir, actualizar solo importes, errores y totales sin volver a pintar los inputs; añadir o eliminar una línea sí repinta la sección; cada cambio llama a `persistir()`
- [X] T017 [US1] Implementar en `js/app.js` la sección **Retención de IRPF** del editor: casilla/interruptor "Aplicar retención de IRPF" (desactivada por defecto) y selector 15 % / 7 % visible solo cuando está activada (al activarla por primera vez queda en 15 %); si `avisoParticular` es verdadero, mostrar "A los clientes particulares no se les aplica retención de IRPF."; al volver a empresa, la retención elegida vuelve a aplicarse; y la sección **Notas / condiciones** con un `textarea` opcional ligado a `presupuesto.notas`. Cada cambio llama a `persistir()` y recalcula
- [X] T018 [US1] Implementar en `js/app.js` el **desglose fijo al pie** del editor y su función `actualizarTotales()`: Base imponible, IVA (21 %), "Retención IRPF (15 %)" o "(7 %)" en negativo con `formatEurosNegativo` **solo** si `retencionAplicada`, y **Total** destacado; `actualizarTotales()` usa `calcularTotales` y se llama tras cualquier cambio de cliente, líneas o retención (SC-003). Dejar en el pie el hueco para el botón "Descargar PDF" (US2)
- [X] T019 [P] [US1] Añadir a `styles.css` los estilos del editor: secciones con título, tarjetas de línea apiladas (cantidad y precio uno al lado del otro dentro de la tarjeta), desglose `position: sticky; bottom` por encima de la barra de navegación, total en negrita y tamaño mayor, y aviso de particular con fondo suave

**Checkpoint**: US1 funciona sola: el paso 3 de [quickstart.md](quickstart.md) da los importes exactos y los datos siguen tras recargar.

---

## Phase 4: User Story 2 - Descargar el presupuesto en PDF (Priority: P2)

**Goal**: descargar un PDF profesional con marca, datos, tabla, desglose y notas, bloqueando la descarga con un aviso cuando falten datos.

**Independent Test**: con el presupuesto del ejemplo de referencia y un perfil con nombre y NIF, descargar el PDF y comprobar cada elemento de FR-016 (paso 4 de [quickstart.md](quickstart.md)). Nota: el PDF necesita un perfil con nombre y NIF; hasta que exista la pantalla de US3, sin perfil solo se puede probar el aviso de bloqueo (escenario 4).

### Implementation for User Story 2

- [X] T020 [P] [US2] Implementar en `js/calc.js` (exportada) `puedeDescargar(perfil, presupuesto)` → `{ ok: true }` o `{ ok: false, motivo }`, comprobando en este orden y devolviendo el primer fallo: (1) perfil existe y tiene `nombre` y `nif` no vacíos → "Completa tu perfil (nombre y NIF) antes de descargar el PDF."; (2) `cliente.nombre` no vacío → "Escribe el nombre del cliente."; (3) si `cliente.tipo === "empresa"`, `cliente.nif` no vacío → "Escribe el NIF/CIF del cliente (obligatorio para empresas y autónomos)."; (4) al menos una línea → "Añade al menos una línea al presupuesto."; (5) ninguna línea inválida según `validarLinea` → "Corrige las líneas marcadas en rojo antes de descargar el PDF."
- [X] T021 [P] [US2] Añadir a `tests/calc.test.js` pruebas de `puedeDescargar`: perfil `null` → motivo del perfil; perfil sin NIF → motivo del perfil; cliente empresa sin NIF → motivo del NIF; cliente particular sin NIF y con una línea válida → `ok: true`; sin líneas → motivo de líneas; con una línea de cantidad 0 → motivo de líneas inválidas
- [X] T022 [US2] Implementar `js/pdf.js` con `export function descargarPdf(perfil, presupuesto)` usando `const { jsPDF } = window.jspdf` en A4 vertical, unidades mm, fuente Helvetica, según [contracts/ui.md](contracts/ui.md#pdf-fr-016-fr-016a-fr-018): (1) arriba a la izquierda el logo si existe (`doc.addImage` con el data URL, formato `PNG` o `JPEG` según el prefijo, alto máx. ~25 mm conservando proporción) y los datos del freelancer (nombre en negrita, "NIF: …", dirección, email, teléfono solo los que existan); (2) arriba a la derecha el título **PRESUPUESTO** grande, "Nº 2026-001", "Fecha de emisión: dd/mm/aaaa", "Válido hasta: dd/mm/aaaa"; (3) bloque "Cliente" con nombre, "NIF/CIF: …", dirección y email los que existan; (4) tabla con `doc.autoTable` y columnas Descripción · Cantidad · Precio unitario · Importe (números alineados a la derecha, formatos `formatCantidad` y `formatEuros`); (5) desglose a la derecha bajo la tabla: Base imponible, IVA (21 %), "Retención IRPF (x %)" en negativo solo si `retencionAplicada`, y **Total** en negrita; (6) si `notas.trim()` no está vacío, bloque "Notas / condiciones" con el texto ajustado al ancho (`doc.splitTextToSize`); nunca mostrar "Caducado"; (7) `doc.save("Presupuesto-" + numero + ".pdf")`. Con 15 líneas debe caber en una página A4 (SC-007); si hay más, autotable continúa en páginas nuevas
- [X] T023 [US2] Conectar en `js/app.js` el botón "Descargar PDF" del pie del editor: llama a `puedeDescargar(estado.perfil, presupuesto)`; si no es `ok`, `mostrarAviso(motivo)` y no genera nada; si es `ok`, llama a `descargarPdf(estado.perfil, presupuesto)` (importado de `./pdf.js`)

**Checkpoint**: con un perfil válido, el PDF del ejemplo muestra los mismos importes que la pantalla, y los bloqueos de FR-017 muestran su aviso.

---

## Phase 5: User Story 3 - Configurar mi perfil y mi marca (Priority: P3)

**Goal**: guardar una vez nombre, NIF, contacto y logo, que aparecen en todos los PDF.

**Independent Test**: rellenar el perfil con logo, recargar la página y comprobar que todo sigue y aparece en el PDF (paso 1 de [quickstart.md](quickstart.md)).

### Implementation for User Story 3

- [X] T024 [US3] Implementar en `js/app.js` la vista `#/perfil` con un formulario precargado desde `estado.perfil`: "Nombre o razón social *", "NIF *", "Email" (`type="email"`), "Teléfono" (`type="tel"`), "Dirección" (textarea) y botón "Guardar"; al guardar, si `nombre` o `nif` están vacíos tras quitar espacios, marcar el campo con `.error` y el mensaje "Este campo es obligatorio." y **no** guardar; si es válido, guardar en `estado.perfil` (`{ nombre, nif, email, telefono, direccion, logo }`), `persistir()` y `mostrarAviso("Perfil guardado.")`
- [X] T025 [US3] Añadir al formulario de perfil en `js/app.js` el campo de logo: `<input type="file" accept="image/png,image/jpeg">`; si `file.type` no es `image/png` ni `image/jpeg`, rechazar con "El logo debe ser una imagen PNG o JPG." sin cambiar nada; si es válido, cargarlo en un `Image`, reducirlo con un `<canvas>` a un máximo de 600 px de lado conservando proporción y formato (`canvas.toDataURL(file.type, 0.9)`), mostrar la vista previa y guardarlo en el perfil al pulsar "Guardar"; botón "Quitar logo" que lo pone a `null`. Si `persistir()` falla por espacio, mostrar el aviso de T008
- [X] T026 [P] [US3] Añadir a `styles.css` los estilos del formulario de perfil: etiquetas encima de los campos, vista previa del logo con alto máximo de 80 px

**Checkpoint**: el perfil persiste tras recargar y el PDF muestra logo y datos; sin logo, el PDF se genera igual.

---

## Phase 6: User Story 4 - Mantener mi catálogo de servicios (Priority: P4)

**Goal**: guardar servicios con precio por defecto y añadirlos a un presupuesto con un par de toques.

**Independent Test**: crear un servicio, añadirlo a un presupuesto (la línea se rellena con su nombre, cantidad 1 y su precio), editarlo y eliminarlo sin que cambie la línea existente (paso 2 de [quickstart.md](quickstart.md) y escenarios de US4).

### Implementation for User Story 4

- [X] T027 [US4] Implementar en `js/app.js` la vista `#/catalogo`: lista de servicios con nombre y precio (`formatEuros`); botón "Nuevo servicio" y botón "Editar" por servicio que abren un pequeño formulario en línea con "Nombre *" y "Precio por defecto (€) *" (`inputmode="decimal"`); validación según data-model: `nombre` "Obligatorio." y `precio` "Obligatorio, ≥ 0." (mensajes "El nombre es obligatorio." y "Escribe un precio igual o mayor que 0."); al guardar, crear `{ id: crypto.randomUUID(), nombre, precio }` (precio en céntimos) o actualizar el existente y `persistir()`; botón "Eliminar" con `confirm("¿Eliminar el servicio «<nombre>»?")` (FR-004). Catálogo vacío: "Todavía no tienes servicios en el catálogo."
- [X] T028 [US4] Añadir en la sección Líneas del editor en `js/app.js` el botón "Añadir del catálogo": muestra la lista de servicios (o "Tu catálogo está vacío. Añade servicios en Catálogo." si no hay) y, al elegir uno, añade la línea `{ descripcion: servicio.nombre, cantidad: 1, precio: servicio.precio }` — una **copia** de los valores, sin guardar referencia al servicio (FR-008) — repinta las líneas, recalcula y `persistir()`
- [X] T029 [P] [US4] Añadir a `styles.css` los estilos de la lista del catálogo y del selector de servicios del editor (filas tocables de al menos 44 px)

**Checkpoint**: añadir del catálogo rellena la línea; editar o eliminar el servicio no cambia presupuestos existentes.

---

## Phase 7: User Story 5 - Volver a mis presupuestos guardados (Priority: P5)

**Goal**: lista completa con caducados, reabrir, volver a descargar, duplicar, eliminar y copia de seguridad.

**Independent Test**: crear perfil, dos servicios y dos presupuestos, cerrar y volver a abrir el navegador, y comprobar que todo sigue igual; probar duplicar, eliminar (sin reutilizar números) y copia/restauración (pasos 5–7 de [quickstart.md](quickstart.md)).

### Implementation for User Story 5

- [X] T030 [US5] Completar en `js/app.js` la vista `#/presupuestos` (sustituye la lista mínima de T014): cada elemento muestra número, nombre del cliente (o "Sin cliente"), fecha de emisión `dd/mm/aaaa`, total (`calcularTotales(...).total` con `formatEuros`) y la etiqueta "Caducado" si `estaCaducado(fechaEmision, hoyISO())`; orden por `fechaEmision` descendente y, a igualdad, por `numero` descendente (comparando año y contador como números); tocar el elemento abre `#/presupuesto/<id>`; lista vacía: "Todavía no tienes presupuestos" con el botón "Nuevo presupuesto"
- [X] T031 [US5] Añadir en `js/app.js` las acciones de cada elemento de la lista: "Descargar PDF" (mismo flujo que T023: `puedeDescargar` → aviso o `descargarPdf`), "Duplicar" y "Eliminar"; **Duplicar** (FR-019a): obtiene número nuevo con `siguienteNumero` y `fechaEmision = hoyISO()`, copia en profundidad (`structuredClone`) `cliente`, `lineas`, `retencion` y `notas`, añade el presupuesto, `persistir()` y abre el nuevo; el original no cambia; **Eliminar**: `confirm("¿Eliminar el presupuesto <numero>? Esta acción no se puede deshacer.")` y, si se acepta, lo quita de `estado.presupuestos` **sin tocar `estado.contadores`** (los números no se reutilizan) y `persistir()`
- [X] T032 [US5] Mostrar en la cabecera del editor en `js/app.js` la etiqueta "Caducado" cuando `estaCaducado(fechaEmision, hoyISO())`, sin bloquear la edición ni la descarga (FR-019b)
- [X] T033 [P] [US5] Implementar en `js/store.js` (exportadas): `exportarCopia(estado)` que crea un `Blob` con `JSON.stringify(estado, null, 2)` (`application/json`) y lo descarga con un enlace temporal `download="presupuestospro-copia-" + hoyISO() + ".json"`; `validarCopia(texto)` → objeto de estado o `null`, aceptando solo si: es JSON válido, `app === "presupuestospro"`, `version === 1`, `catalogo` y `presupuestos` son arrays, `contadores` es un objeto (no array, no `null`) y `perfil` es un objeto o `null` ([contracts/backup-file.md](contracts/backup-file.md))
- [X] T034 [US5] Añadir en la vista `#/perfil` de `js/app.js` la sección "Copia de seguridad" con: botón "Descargar copia de seguridad" (`exportarCopia(estado)`) y botón "Restaurar copia" con `<input type="file" accept="application/json,.json">`; al elegir archivo, leer su texto y `validarCopia`; si es `null` → `mostrarAviso("Este archivo no es una copia de seguridad válida de PresupuestosPro.")` y no tocar nada; si es válido → `confirm("Se sustituirán todos tus datos actuales por los de la copia. ¿Continuar?")`, y solo si se acepta: `estado = copia`, `persistir()`, `mostrarAviso("Copia restaurada.")` y navegar a `#/presupuestos`
- [X] T035 [P] [US5] Añadir a `tests/calc.test.js` (o a un nuevo `tests/store.test.js` importando solo `validarCopia` de `../js/store.js`) pruebas de `validarCopia`: el ejemplo de [contracts/backup-file.md](contracts/backup-file.md) → objeto; texto no JSON → `null`; `app` distinto → `null`; `version: 2` → `null`; `presupuestos` no array → `null`
- [X] T036 [P] [US5] Añadir a `styles.css` los estilos de la lista de presupuestos: tarjeta por presupuesto con número y total destacados, etiqueta "Caducado" visible, y acciones como botones pequeños en fila (que no desborden a 360 px)

**Checkpoint**: todas las historias funcionan; se conservan los datos al cerrar y abrir; la copia restaura todo y la numeración continúa.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: revisión según la constitución, móvil y publicación.

- [X] T037 Revisar `index.html`, `js/app.js`, `js/pdf.js` y `js/calc.js`: todos los textos visibles en español de España, importes con `formatEuros`, fechas con `formatFecha`, ninguna funcionalidad fuera de la spec (Principio III) y ningún secreto en el código (Principio V)
- [ ] T038 Comprobar el diseño a 360 px de ancho (herramientas de desarrollo del navegador) en las cuatro pantallas: sin scroll horizontal, la barra inferior no tapa el desglose ni los botones, y el teclado numérico con coma aparece en cantidad y precio; corregir en `styles.css`
- [X] T039 Ejecutar `node --test tests/` y confirmar que todas las pruebas pasan
- [ ] T040 Publicar la carpeta del proyecto en Netlify Drop (o GitHub Pages) siguiendo [quickstart.md](quickstart.md#publicar-online) — paso manual del usuario
- [ ] T041 Recorrer todos los escenarios de [quickstart.md](quickstart.md) en la URL publicada, en un iPhone (Safari) y en un Android (Chrome), incluido el cronometrado de SC-001 (< 5 minutos) y la comprobación de acentos, ñ y € en el PDF

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias.
- **Foundational (Phase 2)**: depende de Setup; bloquea todas las historias.
- **US1 (Phase 3)**: depende de Foundational.
- **US2 (Phase 4)**: depende de US1 (necesita el editor y `calcularTotales`). Para descargar un PDF real necesita un perfil válido, que se crea en US3.
- **US3 (Phase 5)**: depende de Foundational; se prueba del todo junto con US2 (el perfil se ve en el PDF).
- **US4 (Phase 6)**: depende de US1 (T028 añade un botón al editor).
- **US5 (Phase 7)**: depende de US1 (lista y duplicado) y de US2 (descarga desde la lista); T033–T034 dependen de la vista de perfil de US3.
- **Polish (Phase 8)**: depende de todas las historias.

### Within Each User Story

- Las funciones puras de `js/calc.js` y sus pruebas antes de la UI de `js/app.js` que las usa.
- Casi toda la UI vive en `js/app.js`: las tareas que tocan ese archivo van en serie, en el orden de su ID.

### Parallel Opportunities

- Setup: T002 y T004 en paralelo con T001/T003.
- Foundational: T005 (`js/calc.js`), T007 (`js/store.js`) y T009 (`tests/`) en paralelo; T006 después de T005 (mismo archivo); T008 después de T007.
- US1: T010 y luego T011 (mismo archivo, `js/calc.js`) antes de T013; T012 (pruebas) y T019 (CSS) en paralelo con T013–T018.
- US2: T020 y T021 en paralelo con T022 (`js/pdf.js`).
- US3/US4/US5: las tareas de `styles.css` y de `js/store.js` (T026, T029, T033, T035, T036) en paralelo con las de `js/app.js`.

---

## Parallel Example: User Story 1

```bash
# Pruebas en paralelo con la UI (una vez hechos T010–T011):
Task: "T012 pruebas de US1 en tests/calc.test.js"
Task: "T013–T014 crear presupuesto y lista mínima en js/app.js"

# Mientras se construye el editor en js/app.js (T013–T018):
Task: "T019 estilos del editor en styles.css"
```

## Parallel Example: User Story 2

```bash
Task: "T020 puedeDescargar en js/calc.js"
Task: "T022 descargarPdf en js/pdf.js"
```

---

## Implementation Strategy

### MVP publicable (US1 + US2 + US3)

1. Phase 1 Setup y Phase 2 Foundational.
2. Phase 3 (US1) → **validar** los importes del paso 3 del quickstart.
3. Phase 4 (US2) y Phase 5 (US3) → **validar** el PDF con perfil y logo.
4. **Publicar** (T040): ya se puede emitir un presupuesto profesional en PDF desde el móvil.

US1 sola es demostrable, pero no se puede enviar a un cliente sin PDF ni perfil, por eso el primer despliegue útil incluye US2 y US3.

### Incremental Delivery

5. Phase 6 (US4) → catálogo para bajar de 5 minutos (SC-001) → volver a publicar.
6. Phase 7 (US5) → lista completa, duplicar, eliminar, copia de seguridad → volver a publicar.
7. Phase 8 Polish → validación completa en móviles reales.

Volver a publicar es arrastrar otra vez la carpeta: no hay build.

---

## Notes

- [P] = otro archivo y sin dependencias pendientes.
- [USx] = trazabilidad con la historia de la spec.
- Parar en cada checkpoint para validar la historia con el quickstart.
- Evitar: tareas vagas, conflictos en `js/app.js` por trabajo simultáneo, y cualquier "ya que estamos" (Principio III).
