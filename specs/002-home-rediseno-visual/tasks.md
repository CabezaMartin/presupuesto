---

description: "Task list for Página de inicio y rediseño visual profesional"
---

# Tasks: Página de inicio y rediseño visual profesional

**Input**: Design documents from `/specs/002-home-rediseno-visual/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/ui.md](contracts/ui.md), [quickstart.md](quickstart.md)

**Tests**: solo las pruebas automáticas de la lógica pura nueva (`tests/calc.test.js`, `node --test`), mismo criterio que la spec 001 (R10 de research.md). El resto se valida a mano con [quickstart.md](quickstart.md) (Principio IV).

**Organization**: tareas agrupadas por historia de usuario, en el orden de prioridad de spec.md.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede hacer en paralelo (otro archivo, sin dependencias pendientes)
- **[Story]**: historia de usuario (US1…US6)

## Convenciones para todas las tareas

- Se reutiliza el proyecto plano de la spec 001: **ningún archivo ni carpeta nuevos**, salvo los propios de `specs/002-home-rediseno-visual/`. Todo el código va en `index.html`, `styles.css`, `js/app.js`, `js/calc.js`, `js/store.js`, `js/pdf.js`. Nada de `public/` ni `src/`.
- Sin dependencias nuevas.
- Todos los textos visibles nuevos en **español de España**.
- `js/calc.js` sigue sin tocar el DOM ni `localStorage` (debe poder importarse desde Node).
- Cada cambio del usuario se sigue guardando con `persistir()`; sin botones "Guardar" nuevos salvo donde ya exista uno (spec 001).
- No añadir nada que no esté en spec.md (Principio III): sin historial de cambios de estado, sin alta/edición de clientes, sin nuevas pantallas más allá de Inicio y Clientes.

---

## Phase 1: Setup

**Purpose**: confirmar la base antes de tocar código.

- [X] T001 Ejecutar `node --test tests/` y comprobar que las pruebas de la spec 001 pasan (línea base antes de empezar)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: sistema visual centralizado, lógica pura nueva, el campo `estado` y el esqueleto de navegación/rutas, que usan varias historias.

**⚠️ CRITICAL**: ninguna historia puede empezar hasta terminar esta fase.

- [X] T002 [P] Añadir en `styles.css`, al principio del archivo, las variables CSS del sistema visual dentro de `:root`: color primario, color de texto, color de fondo, color de borde, un color por estado (Borrador/Enviado/Aceptado/Rechazado), fuente base y tamaños, espaciados (`--espaciado-s/m/l`) y radio de tarjeta, según [research.md](research.md#r1-sistema-visual-centralizado) y [research.md](research.md#r2-paleta-y-tipografía-concretas). No sustituir todavía los usos existentes (eso es T016).
- [X] T003 [P] Implementar en `js/calc.js` (exportadas, puras, sin DOM) `resumenActividad(presupuestos, hoy)` → `{ total, porEstado: { Borrador, Enviado, Aceptado, Rechazado }, caducados }` y `agruparClientes(presupuestos)` → lista de `{ nombre, tipo, nif, numPresupuestos }` agrupando por `nombre.trim().toLowerCase()` + `tipo`, con el `nif` del presupuesto más reciente (por `fechaEmision` y, a igualdad, por `numero`) del grupo que tenga `nif` no vacío, según [data-model.md](data-model.md#vistas-derivadas-no-se-guardan-se-calculan-siempre-con-jscalcjs)
- [X] T004 Implementar en `js/store.js` (exportada) `normalizarPresupuesto(presupuesto)` → copia de `presupuesto` con `estado: presupuesto.estado ?? "Borrador"`; `cargar()` aplica esta función a cada elemento de `estado.presupuestos` antes de devolver el estado, según [data-model.md](data-model.md#cambio-en-presupuesto-spec-001)
- [X] T005 Actualizar en `js/app.js`: `crearPresupuesto()` añade `estado: "Borrador"` al nuevo presupuesto; `duplicarPresupuesto()` crea el duplicado también con `estado: "Borrador"` (no copia el estado del original), según [data-model.md](data-model.md#operaciones-y-efectos-sobre-el-estado-adicionales-a-la-spec-001)
- [X] T006 Ampliar el router de `js/app.js`: reconocer `#/` (sin hash o hash vacío) como ruta **Inicio** y `#/clientes` como ruta **Clientes** (vistas vacías por ahora, solo título); actualizar `marcarNavActivo()` para los 5 destinos (Inicio, Presupuestos, Clientes, Catálogo, Perfil), manteniendo que el editor de presupuesto (`#/presupuesto/<id>`) marca activo "Presupuestos"
- [X] T007 [P] Actualizar la barra `<nav>` de `index.html`: añadir los enlaces "Inicio" (`#/`, `data-ruta="/"`) y "Clientes" (`#/clientes`, `data-ruta="/clientes"`), quedando el orden Inicio · Presupuestos · Clientes · Catálogo · Perfil
- [X] T008 [P] Añadir a `tests/calc.test.js` las pruebas de la fase: `resumenActividad` con presupuestos en varios estados y algunos caducados (un presupuesto Aceptado y caducado cuenta en ambos); `agruparClientes` con un cliente repetido (incluyendo mayúsculas/espacios distintos) que se agrupa en una sola fila y suma sus presupuestos, y con ningún presupuesto que tenga NIF (resultado `nif` vacío); `normalizarPresupuesto` (importada de `../js/store.js`) conserva el estado si ya existe y lo pone a `"Borrador"` si falta

**Checkpoint**: `node --test tests/` pasa con las pruebas nuevas; la navegación de 5 accesos aparece y cambia de vista; crear o duplicar un presupuesto le da estado `"Borrador"`.

---

## Phase 3: User Story 1 - Llegar y orientarse desde una página de inicio (Priority: P1) 🎯 MVP

**Goal**: ver, al abrir la raíz, un resumen de la actividad y accesos directos a las demás secciones.

**Independent Test**: abrir la URL raíz sin hash con presupuestos en varios estados y comprobar que el resumen muestra el total, el desglose por estado y los caducados correctamente (pasos 1 de [quickstart.md](quickstart.md)).

### Implementation for User Story 1

- [X] T009 [US1] Implementar la vista Inicio en `js/app.js` (ruta `#/`): usa `resumenActividad(estado.presupuestos, hoyISO())` para mostrar el total de presupuestos, el desglose por estado y el número de caducados, y ofrece un acceso directo (con un toque) a Presupuestos, Clientes, Catálogo y Perfil
- [X] T010 [US1] En la vista Inicio, cuando `resumenActividad(...).total` es 0, mostrar el resumen en cero junto con el botón "Nuevo presupuesto" (reutiliza `crearPresupuesto()`)
- [X] T011 [P] [US1] Añadir a `styles.css` los estilos de Inicio: tarjetas del resumen (total y desglose por estado) y accesos directos a las secciones, usando las variables de T002

**Checkpoint**: abrir la raíz muestra Inicio con el resumen correcto; cada acceso directo abre su sección.

---

## Phase 4: User Story 2 - Moverse entre secciones sin perderse (Priority: P1)

**Goal**: la misma navegación visible en todas las pantallas, sin usar el botón "atrás".

**Independent Test**: recorrer las cinco secciones (Inicio, Presupuestos, Clientes, Catálogo, Perfil) usando solo la barra de navegación, sin usar nunca "atrás" (paso 2 de [quickstart.md](quickstart.md)).

### Implementation for User Story 2

- [X] T012 [US2] Verificar y ajustar en `js/app.js` que `marcarNavActivo()` resalta correctamente el destino activo en las seis pantallas (Inicio, Presupuestos, editor de presupuesto, Clientes, Catálogo, Perfil)
- [X] T013 [P] [US2] Añadir a `styles.css` los estilos de la barra de navegación con 5 accesos: que quepan a 360 px de ancho sin desbordar ni solapar (ajustar tamaño de fuente o espaciado si hace falta), usando las variables de T002

**Checkpoint**: las cinco secciones son alcanzables solo con la navegación visible, que siempre indica dónde se está.

---

## Phase 5: User Story 3 - Marcar y cambiar el estado de un presupuesto (Priority: P2)

**Goal**: asignar y cambiar libremente el estado de un presupuesto desde su editor.

**Independent Test**: crear un presupuesto (nace en Borrador), cambiarlo a Enviado y luego a Aceptado, recargar y comprobar que se mantiene; abrir un presupuesto guardado sin campo de estado y verlo como Borrador (paso 3 de [quickstart.md](quickstart.md)).

### Implementation for User Story 3

- [X] T014 [US3] Añadir en la cabecera del editor de presupuesto en `js/app.js` un `<select>` de **Estado** con las opciones Borrador, Enviado, Aceptado y Rechazado; al cambiarlo, actualiza `presupuesto.estado` y llama a `persistir()`, sin validar la transición (cualquier valor a cualquier otro, según [data-model.md](data-model.md#reglas-para-cambiar-el-estado-de-un-presupuesto))

**Checkpoint**: el estado de un presupuesto se puede cambiar libremente desde el editor y persiste tras recargar; los presupuestos antiguos sin este campo se comportan como Borrador (ya cubierto por T004/T008).

---

## Phase 6: User Story 4 - Una apariencia profesional y consistente, con estados reconocibles (Priority: P2)

**Goal**: todas las pantallas comparten tipografía, colores y espaciado, y cada presupuesto muestra su estado con una etiqueta de color distinguible.

**Independent Test**: recorrer las seis pantallas y comprobar que usan la misma paleta y tipografía; ver en la lista de presupuestos una etiqueta de color distinta para cada uno de los 4 estados, y que "Caducado" se distingue de "Rechazado" (paso 4 de [quickstart.md](quickstart.md)).

### Implementation for User Story 4

- [X] T015 [US4] Sustituir en `styles.css` los colores, tamaños de fuente y espaciados sueltos ya existentes (de la spec 001: editor, lista de presupuestos, catálogo, perfil) por las variables CSS de T002, sin cambiar la estructura HTML ni el comportamiento
- [X] T016 [US4] Añadir en la lista de presupuestos (`js/app.js`) una etiqueta visual de **Estado** junto a la de "Caducado" (que ya existe), con una clase CSS distinta por cada uno de los 4 valores (`.estado-borrador`, `.estado-enviado`, `.estado-aceptado`, `.estado-rechazado`)
- [X] T017 [US4] Mostrar la misma etiqueta de Estado en la cabecera del editor de presupuesto (`js/app.js`), junto a "Caducado" cuando corresponda (ambas pueden aparecer a la vez)
- [X] T018 [P] [US4] Añadir a `styles.css` los estilos de las 4 etiquetas de estado (un color distinto por cada una, usando las variables de T002) y confirmar que el total del desglose (ya destacado en la spec 001) usa las nuevas variables de tipografía/color

**Checkpoint**: la lista y el editor muestran el estado con su propio color; toda la app usa la misma paleta, tipografía y espaciado.

---

## Phase 7: User Story 5 - Un PDF con la misma imagen de marca (Priority: P2)

**Goal**: el PDF descargado usa la misma paleta y tipografía que la aplicación, sin cambiar su contenido.

**Independent Test**: descargar el PDF de un presupuesto de ejemplo y comprobar que los colores y la tipografía coinciden con el rediseño, que todos los datos de la spec 001 siguen presentes, y que no aparece ni "Caducado" ni el estado (paso 5 de [quickstart.md](quickstart.md)).

### Implementation for User Story 5

- [X] T019 [US5] Declarar al principio de `js/pdf.js` constantes de color con los mismos valores que las variables CSS de T002 (jsPDF no puede leer CSS) y aplicarlas con `doc.setTextColor(...)` / `doc.setFillColor(...)` en el título, los datos del freelancer/cliente y la cabecera de la tabla (`headStyles.fillColor`, ya usado en la spec 001)
- [X] T020 [US5] Ajustar en `js/pdf.js` los tamaños de fuente y espaciados del desglose y el total para reforzar la misma jerarquía visual del rediseño (total más grande/negrita), sin cambiar el contenido, el orden de los bloques ni los datos existentes (spec 001)

**Checkpoint**: el PDF descargado usa la misma paleta/tipografía que la app; todos los datos de la spec 001 siguen presentes y con los mismos importes; no muestra "Caducado" ni el estado.

---

## Phase 8: User Story 6 - Ver quiénes son mis clientes (Priority: P3)

**Goal**: lista de solo lectura de los clientes ya escritos en los presupuestos existentes.

**Independent Test**: crear presupuestos para dos clientes distintos y repetir uno de ellos en un tercero; abrir Clientes y comprobar que aparecen 2 filas (no 3), la del repetido con 2 presupuestos (paso 6 de [quickstart.md](quickstart.md)).

### Implementation for User Story 6

- [X] T021 [US6] Implementar la vista `#/clientes` en `js/app.js` usando `agruparClientes(estado.presupuestos)`: lista con nombre, tipo, NIF/CIF (si existe) y número de presupuestos asociados; sin ninguna acción de alta, edición ni borrado
- [X] T022 [US6] En la vista Clientes, cuando no haya ningún presupuesto todavía, mostrar "Todavía no tienes clientes" sin error
- [X] T023 [P] [US6] Añadir a `styles.css` los estilos de la lista de Clientes (tarjeta por cliente, mismo criterio visual que el resto de listas), usando las variables de T002

**Checkpoint**: Clientes agrupa correctamente sin duplicar y no ofrece ninguna acción de edición.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: revisión final según la constitución y el plan, y validación completa.

- [X] T024 Revisar que ningún archivo ni carpeta fuera de `index.html`, `styles.css`, `js/app.js`, `js/calc.js`, `js/store.js`, `js/pdf.js` y `specs/002-home-rediseno-visual/` fue creado o modificado (sin `public/`, sin `src/`, sin dependencias nuevas en `vendor/`), y que todos los textos nuevos están en español de España (Principio III)
- [ ] T025 Comprobar el diseño a 360 px de ancho (herramientas de desarrollo del navegador) en Inicio y en la navegación de 5 accesos: sin scroll horizontal ni elementos solapados; corregir en `styles.css`
- [X] T026 Ejecutar `node --test tests/` y confirmar que todas las pruebas (spec 001 + spec 002) pasan
- [ ] T027 Recorrer todos los escenarios de [quickstart.md](quickstart.md) en la app servida localmente

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias.
- **Foundational (Phase 2)**: depende de Setup; bloquea todas las historias.
- **US1 (Phase 3)**: depende de Foundational (necesita `resumenActividad` y las rutas básicas).
- **US2 (Phase 4)**: depende de Foundational (necesita el router y el `<nav>` ampliados); se apoya en la vista de Inicio de US1 para probarse por completo, pero su propio trabajo (resaltar el destino activo, estilos de la barra) es independiente.
- **US3 (Phase 5)**: depende de Foundational (necesita `estado` en el presupuesto); no depende de US1/US2.
- **US4 (Phase 6)**: depende de Foundational (variables CSS) y de US3 (necesita que exista `estado` para poder mostrarlo); se prueba del todo junto con la lista de presupuestos ya existente (spec 001).
- **US5 (Phase 7)**: depende de Foundational (variables CSS); no depende de las demás historias.
- **US6 (Phase 8)**: depende de Foundational (necesita `agruparClientes` y la ruta `#/clientes`).
- **Polish (Phase 9)**: depende de todas las historias.

### Within Each User Story

- Las funciones puras de `js/calc.js`/`js/store.js` y sus pruebas (Foundational) van antes que la UI de `js/app.js` que las usa.
- Dentro de `js/app.js`, las tareas de una misma historia van en serie, en el orden de su ID (mismo archivo).

### Parallel Opportunities

- Foundational: T002 (`styles.css`), T003 (`js/calc.js`) y T007 (`index.html`) en paralelo; T004 y T005 después de T003 (mismo módulo de datos); T006 depende de T005; T008 (pruebas) en paralelo una vez estén T003/T004.
- US1: T011 (CSS) en paralelo con T009–T010.
- US2: T013 (CSS) en paralelo con T012.
- US4: T018 (CSS) en paralelo con T015–T017.
- US6: T023 (CSS) en paralelo con T021–T022.

---

## Parallel Example: Foundational

```bash
Task: "T002 variables CSS en styles.css"
Task: "T003 resumenActividad y agruparClientes en js/calc.js"
Task: "T007 enlaces de navegación en index.html"
```

---

## Implementation Strategy

### MVP (US1 + US2)

1. Phase 1 Setup y Phase 2 Foundational.
2. Phase 3 (US1) → **validar** el resumen de Inicio con datos de ejemplo.
3. Phase 4 (US2) → **validar** que las 5 secciones se alcanzan sin "atrás".

### Incremental Delivery

4. Phase 5 (US3) → el estado se puede marcar y cambiar.
5. Phase 6 (US4) → estados visibles con color y apariencia consistente en toda la app.
6. Phase 7 (US5) → PDF con la misma imagen.
7. Phase 8 (US6) → sección Clientes.
8. Phase 9 Polish → revisión final y validación completa con quickstart.md.

---

## Notes

- [P] = otro archivo y sin dependencias pendientes.
- [USx] = trazabilidad con la historia de spec.md.
- Parar en cada checkpoint para validar la historia con quickstart.md.
- Evitar: tocar `js/calc.js` desde el navegador (debe seguir siendo importable desde Node), crear carpetas nuevas, o cualquier "ya que estamos" fuera de spec.md (Principio III).
