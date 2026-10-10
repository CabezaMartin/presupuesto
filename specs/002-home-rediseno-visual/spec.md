# Feature Specification: Página de inicio y rediseño visual profesional

**Feature Branch**: `002-home-rediseno-visual`

**Created**: 2026-10-05

**Status**: Draft

**Input**: User description: "Mejorar la presentación de PresupuestosPro (aplicación ya implementada en la spec 001) con dos cambios, sin alterar ninguna funcionalidad ni dato existente. Primero: añadir una página de inicio (index) que sea el punto de entrada de la aplicación al acceder a la raíz del servidor, con navegación clara hacia las cuatro secciones existentes (Presupuestos, Clientes, Catálogo y Perfil) y un pequeño resumen de actividad (por ejemplo, número de presupuestos por estado). Además, todas las páginas deben compartir una navegación común visible para moverse entre secciones sin usar el botón atrás. Segundo: rediseñar la apariencia visual de toda la aplicación para que resulte profesional y sobria: tipografía consistente, paleta de colores limitada definida en un único lugar, espaciado uniforme, jerarquía visual clara entre títulos, tablas, formularios y totales, y estados visuales distinguibles para los presupuestos (Borrador, Enviado, Aceptado, Rechazado, Caducado). El rediseño debe aplicarse también a la plantilla del PDF para que el documento que recibe el cliente transmita la misma imagen profesional. Debe mantenerse el enfoque mobile-first ya existente y todos los textos en español de España. La lógica de negocio, los cálculos, la API y el esquema de datos no deben cambiar en absoluto."

**Clarifications**:

- **Sección "Clientes"**: se añade como sección nueva de solo lectura (opción A). Lista los clientes ya escritos en los presupuestos existentes; no crea una entidad ni una pantalla de alta/edición.
- **Estados del presupuesto**: se añade un campo nuevo `estado` (opción A) con los valores Borrador, Enviado, Aceptado y Rechazado, asignable manualmente desde el editor. "Caducado" sigue siendo, como en la spec 001, una etiqueta calculada a partir de la fecha, no un valor de este campo nuevo.
- Con esto, esta funcionalidad deja de ser "cero cambios de datos": añade un único campo aditivo (`estado`) al presupuesto, documentado en Key Entities. El resto del esquema, los cálculos, la numeración y el formato de copia de seguridad de la spec 001 no cambian.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Llegar y orientarse desde una página de inicio (Priority: P1)

Un freelancer abre PresupuestosPro y, antes de entrar en ninguna sección de trabajo, ve una pantalla de bienvenida que le dice de un vistazo cómo está su actividad (cuántos presupuestos tiene y en qué estado) y le ofrece ir directamente a Presupuestos, Clientes, Catálogo o Perfil con un solo toque.

**Why this priority**: es el primer cambio pedido explícitamente y el punto de entrada de toda la experiencia; sin esto no hay "página de inicio" que mostrar.

**Independent Test**: abrir la URL raíz de la aplicación (sin ningún hash) y comprobar que aparece la página de inicio, con el resumen y los accesos a cada sección, antes de ver la lista de presupuestos.

**Acceptance Scenarios**:

1. **Given** la aplicación nunca se ha usado en ese navegador (sin datos guardados), **When** se abre la URL raíz, **Then** se muestra la página de inicio con el resumen en cero y los accesos a las secciones, sin errores.
2. **Given** ya existen varios presupuestos guardados en distintos estados, **When** se abre la página de inicio, **Then** el resumen muestra el número total de presupuestos y cuántos hay en cada estado (Borrador, Enviado, Aceptado, Rechazado), además de cuántos están caducados.
3. **Given** el usuario está en la página de inicio, **When** toca el acceso a una sección, **Then** se abre esa sección directamente.

---

### User Story 2 - Moverse entre secciones sin perderse (Priority: P1)

Un freelancer está trabajando en cualquier pantalla (editando un presupuesto, en Clientes, en el catálogo, en su perfil) y en todo momento ve la misma barra de navegación para saltar a otra sección, sin tener que usar el botón "atrás" del navegador ni perder de vista dónde está.

**Why this priority**: es el segundo requisito explícito del primer cambio y condiciona cómo se construye cada pantalla.

**Independent Test**: recorrer las cinco secciones (Inicio, Presupuestos, Clientes, Catálogo, Perfil) desde cualquier punto de la aplicación usando solo la navegación visible en pantalla, sin usar nunca el botón "atrás".

**Acceptance Scenarios**:

1. **Given** el usuario está dentro del editor de un presupuesto, **When** mira la pantalla, **Then** ve la misma barra de navegación que en el resto de la aplicación y puede tocar cualquier otra sección.
2. **Given** el usuario navega de una sección a otra usando esa barra, **When** llega a la nueva sección, **Then** la navegación le indica en qué sección está.

---

### User Story 3 - Marcar y cambiar el estado de un presupuesto (Priority: P2)

Un freelancer crea un presupuesto (que empieza como Borrador) y, a medida que avanza con el cliente, lo marca como Enviado, y después como Aceptado o Rechazado, para saber de un vistazo en qué punto está cada uno.

**Why this priority**: sin esta acción, el campo "estado" nunca reflejaría la realidad y los estados visuales de la historia 4 y el resumen de la historia 1 no tendrían sentido; es la base que las sostiene.

**Independent Test**: crear un presupuesto nuevo (debe nacer en Borrador), cambiarlo a Enviado y luego a Aceptado (o Rechazado) desde el editor, y comprobar que el cambio se guarda y se refleja en la lista y en el resumen de inicio.

**Acceptance Scenarios**:

1. **Given** se crea un presupuesto nuevo, **When** se guarda, **Then** su estado inicial es Borrador.
2. **Given** un presupuesto en Borrador, **When** el usuario elige otro estado (Enviado, Aceptado o Rechazado) desde el editor, **Then** el presupuesto queda en ese estado y se guarda automáticamente, sin botón adicional de confirmación.
3. **Given** un presupuesto guardado con una versión anterior de la aplicación (sin campo de estado), **When** se abre o se lista, **Then** se trata como Borrador.
4. **Given** un presupuesto en cualquier estado, **When** el usuario lo cambia a otro estado distinto, **Then** la aplicación permite el cambio sin restricciones de orden (no hay un flujo obligatorio de pasos).

---

### User Story 4 - Una apariencia profesional y consistente, con estados reconocibles (Priority: P2)

Un freelancer (o su cliente, al ver la app por encima del hombro) percibe que todas las pantallas —listas, formularios, tablas y totales— comparten el mismo estilo visual sobrio y profesional, con una jerarquía clara entre lo más importante (p. ej. el total) y lo secundario, y distingue de un vistazo el estado de cada presupuesto (Borrador, Enviado, Aceptado, Rechazado, Caducado).

**Why this priority**: es el segundo cambio pedido; depende de que existan ya las pantallas (spec 001), la navegación común (historia 2) y el campo de estado (historia 3).

**Independent Test**: recorrer las cinco secciones y comprobar visualmente que usan la misma tipografía, los mismos colores y el mismo espaciado, y que cada presupuesto de la lista muestra una etiqueta de estado distinta según su situación.

**Acceptance Scenarios**:

1. **Given** el usuario abre cualquier pantalla de la aplicación, **When** la observa, **Then** la tipografía, los colores y el espaciado son los mismos que en las demás pantallas.
2. **Given** un presupuesto tiene base, IVA, retención y total, **When** se muestra el desglose, **Then** el total se distingue visualmente del resto de importes.
3. **Given** la lista de presupuestos muestra varios elementos con distintos estados, **When** se observa la lista, **Then** cada estado (Borrador, Enviado, Aceptado, Rechazado) tiene una etiqueta visual propia y distinguible.
4. **Given** un presupuesto está caducado, **When** se muestra en la lista o en el editor, **Then** se distingue visualmente de los que no lo están, independientemente de su estado.

---

### User Story 5 - Un PDF con la misma imagen de marca (Priority: P2)

Un freelancer descarga el PDF de un presupuesto y el cliente que lo recibe percibe el mismo cuidado visual (tipografía, colores, espaciado) que ve en la aplicación, sin que cambie ninguno de los datos ni el orden de la información que ya contiene el PDF.

**Why this priority**: es la extensión explícita del rediseño al entregable que ve el cliente final; depende de que exista un estilo definido en la historia 4.

**Independent Test**: descargar el PDF de un presupuesto con datos de ejemplo y comprobar que usa la misma paleta y tipografía que la aplicación, y que todos los datos de la spec 001 (perfil, cliente, líneas, desglose, notas) siguen apareciendo igual.

**Acceptance Scenarios**:

1. **Given** un presupuesto listo para descargar, **When** se genera el PDF, **Then** el documento usa la paleta de colores y la tipografía definidas para el rediseño.
2. **Given** el PDF rediseñado, **When** se compara con los requisitos de contenido de la spec 001, **Then** toda la información (freelancer, cliente, tabla, desglose, notas) sigue presente y con los mismos importes, y el estado o la etiqueta "Caducado" del presupuesto no aparecen en el PDF (igual que ya establece la spec 001).

---

### User Story 6 - Ver quiénes son mis clientes (Priority: P3)

Un freelancer quiere ver, de un vistazo, la lista de clientes a los que ya ha hecho presupuestos, sin tener que abrir presupuesto por presupuesto.

**Why this priority**: es un complemento de navegación pedido explícitamente, pero de menor impacto que la página de inicio, la navegación común o el rediseño visual; no introduce ninguna acción nueva sobre los clientes (solo lectura).

**Independent Test**: crear dos presupuestos con clientes distintos y uno más con un cliente repetido, abrir la sección Clientes y comprobar que aparecen los clientes únicos (sin duplicar el repetido) con sus datos básicos.

**Acceptance Scenarios**:

1. **Given** existen presupuestos con varios clientes, **When** se abre la sección Clientes, **Then** se lista cada cliente una sola vez (agrupado por nombre y tipo), con su NIF/CIF cuando exista y el número de presupuestos asociados.
2. **Given** no existe ningún presupuesto todavía, **When** se abre la sección Clientes, **Then** se muestra un mensaje indicando que todavía no hay clientes, sin error.
3. **Given** el usuario toca un cliente de la lista, **When** se le muestra información adicional, **Then** no se ofrece ninguna acción de edición o creación (la sección es de solo lectura; los datos del cliente solo se cambian desde el presupuesto correspondiente, como ya permite la spec 001).

---

### Edge Cases

- ¿Qué pasa si se abre la página de inicio sin ningún presupuesto, servicio o perfil guardado todavía? Debe mostrarse sin errores, con el resumen en cero y una invitación clara a crear el primer presupuesto.
- ¿Qué pasa si el perfil aún no se ha configurado? El acceso a Perfil desde la página de inicio y desde la navegación común debe funcionar igual que hoy (sin bloquear la navegación).
- ¿Qué ocurre con una pantalla muy estrecha (360 px)? La navegación común (ahora con cinco accesos) y la página de inicio deben seguir sin scroll horizontal ni elementos superpuestos, igual que el resto de la aplicación (spec 001).
- ¿Qué pasa si se accede directamente a una sección concreta (por ejemplo `#/perfil`) en lugar de a la raíz? Debe abrir esa sección con la navegación común visible, sin forzar el paso por la página de inicio.
- ¿Qué pasa con un presupuesto guardado antes de esta funcionalidad (sin campo `estado`)? Se trata como Borrador, tanto en la lista como en el resumen de inicio.
- ¿Puede un presupuesto estar "Caducado" y en cualquier estado (incluso Aceptado o Rechazado) a la vez? Sí: "Caducado" sigue siendo una etiqueta calculada por fecha, independiente del campo `estado`; ambas pueden mostrarse juntas.
- ¿Qué pasa si dos clientes distintos tienen el mismo nombre? Se agrupan por nombre y tipo (empresa/particular); si además coincide el NIF/CIF se considera el mismo cliente, y si no, se listan como clientes distintos con el mismo nombre.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST mostrar una página de inicio al acceder a la raíz de la aplicación (sin ninguna sección concreta indicada), antes de cualquier sección de trabajo.
- **FR-002**: La página de inicio MUST ofrecer un acceso directo, con un solo toque, a cada una de las secciones de la aplicación: Presupuestos, Clientes, Catálogo y Perfil.
- **FR-003**: La página de inicio MUST mostrar un resumen numérico de la actividad guardada: el número total de presupuestos, su desglose por estado (Borrador, Enviado, Aceptado, Rechazado) y, por separado, cuántos están caducados.
- **FR-004**: Todas las pantallas de la aplicación (página de inicio, Presupuestos, editor de presupuesto, Clientes, Catálogo, Perfil) MUST compartir la misma navegación visible, que permite moverse a cualquier sección con un solo toque y sin usar el botón "atrás" del navegador.
- **FR-005**: La navegación común MUST indicar en qué sección se encuentra el usuario en cada momento.
- **FR-006**: La aplicación MUST usar una paleta de colores limitada, definida en un único lugar y reutilizada en todas las pantallas y en el PDF.
- **FR-007**: La aplicación MUST usar una tipografía y un espaciado consistentes en todas las pantallas, con una jerarquía visual clara entre títulos, tablas, formularios y totales (los totales deben destacar sobre el resto de importes).
- **FR-008**: La plantilla del PDF MUST aplicar la misma paleta de colores y tipografía del rediseño, sin cambiar el contenido, el orden ni los datos que ya incluye según la spec 001 (perfil, cliente, tabla de líneas, desglose, notas); el PDF NO MUST mostrar el estado ni la etiqueta "Caducado" (igual que ya establece la spec 001 para "Caducado").
- **FR-009**: Cada presupuesto MUST tener un campo de estado con uno de estos valores: Borrador, Enviado, Aceptado o Rechazado. El sistema MUST permitir cambiarlo manualmente desde el editor del presupuesto, en cualquier momento y sin un orden obligatorio entre estados, guardándose automáticamente igual que el resto de cambios del editor (spec 001).
- **FR-010**: Todo presupuesto nuevo MUST crearse con estado Borrador. Un presupuesto guardado antes de esta funcionalidad (sin campo de estado) MUST tratarse como Borrador al cargarlo o listarlo, sin pedir ninguna acción al usuario para ello.
- **FR-011**: El sistema MUST distinguir visualmente, al menos en la lista de presupuestos y en el editor, cada uno de los cuatro estados (Borrador, Enviado, Aceptado, Rechazado) y, por separado y de forma independiente del estado, si el presupuesto está caducado (calculado por fecha, sin cambios respecto a la spec 001).
- **FR-012**: El sistema MUST incluir una sección "Clientes", accesible desde la navegación común y desde la página de inicio, que liste —de solo lectura— los clientes ya escritos en los presupuestos existentes (nombre, tipo, NIF/CIF cuando exista, y número de presupuestos asociados), agrupando como el mismo cliente las entradas con el mismo nombre y tipo. Esta sección NO MUST ofrecer alta, edición ni borrado de clientes: esos datos solo se cambian desde el presupuesto correspondiente, como ya permite la spec 001.
- **FR-013**: El rediseño MUST mantener el diseño mobile-first ya existente (pantallas utilizables desde 360 px de ancho, sin scroll horizontal), incluyendo la navegación común con sus cinco accesos.
- **FR-014**: Todos los textos nuevos o modificados por esta funcionalidad MUST estar en español de España.
- **FR-015**: Esta funcionalidad NO MUST alterar ningún cálculo, regla de negocio, ni el comportamiento de guardado/carga de la spec 001 (PresupuestosPro v0): los importes, el IVA, la retención, la numeración y la caducidad se mantienen exactamente igual. El único cambio de datos permitido es el campo `estado` descrito en Key Entities.

### Key Entities

- **Presupuesto** (ya existente, spec 001): se añade el atributo `estado`, con valores Borrador | Enviado | Aceptado | Rechazado. Valor por defecto al crear: Borrador. Un presupuesto guardado sin este campo se trata como Borrador. Este campo es independiente de "Caducado", que sigue siendo una etiqueta calculada a partir de la fecha de emisión y no se guarda.
- **Cliente** (ya existente, embebido en cada presupuesto, spec 001): sin cambios en su forma de guardarse. La sección "Clientes" de esta funcionalidad solo lee y agrupa estos datos ya guardados (por nombre y tipo); no crea una entidad ni un almacén de datos nuevo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Desde la página de inicio, cualquier persona llega a cada una de las secciones de la aplicación con un solo toque.
- **SC-002**: Un freelancer puede saber cuántos presupuestos tiene en cada estado (Borrador, Enviado, Aceptado, Rechazado) en menos de 5 segundos desde que abre la aplicación, sin entrar en la lista de presupuestos.
- **SC-003**: Al recorrer las cinco secciones y el PDF, se usa siempre la misma paleta de colores y la misma tipografía, sin inconsistencias visibles entre pantallas.
- **SC-004**: Tras el rediseño, los importes, fechas y demás datos mostrados en cada presupuesto existente coinciden exactamente con los que mostraba la aplicación antes del cambio (cero regresiones de cálculo).
- **SC-005**: La aplicación rediseñada sigue sin mostrar scroll horizontal ni elementos solapados en una pantalla de 360 px de ancho.
- **SC-006**: Un usuario distingue el estado de un presupuesto (Borrador, Enviado, Aceptado, Rechazado) y si está caducado en menos de 2 segundos de observación en la lista, y puede cambiar su estado en menos de 2 toques desde el editor.
- **SC-007**: Un freelancer encuentra, en menos de 10 segundos, si ya le ha hecho algún presupuesto a un cliente concreto, usando la sección Clientes.

## Assumptions

- La paleta de colores y la tipografía exactas (qué colores, qué fuente) son un detalle de diseño que se definirá en la fase de planificación; esta especificación solo exige que estén limitadas, definidas en un único lugar y aplicadas de forma consistente.
- "Resumen de actividad" en la página de inicio significa conteos y cifras agregadas por estado, no una lista detallada que duplique la sección Presupuestos.
- El cambio de estado de un presupuesto es libre (cualquier estado a cualquier otro, sin flujo obligatorio): la spec no pide validar transiciones ni impedir "retroceder" de Aceptado a Borrador, por ejemplo.
- La navegación común sustituye o amplía la barra de navegación que ya existe en la spec 001, añadiendo Inicio y Clientes a Presupuestos, Catálogo y Perfil; no se elimina ninguna sección actual.
- El rediseño del PDF cambia solo su apariencia (colores, tipografía, espaciado); el contenido, el orden de los bloques y los datos que incluye son los que ya fija la spec 001 (contrato de UI), y no incorpora el nuevo campo `estado`.
- Los cambios de código para esta funcionalidad se aplican sobre los archivos reales del proyecto ya implementado en la spec 001 (`index.html`, `styles.css`, `js/app.js`, `js/store.js`, `js/pdf.js`), sin introducir carpetas ni dependencias nuevas.
