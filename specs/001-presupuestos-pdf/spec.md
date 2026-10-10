# Feature Specification: PresupuestosPro v0 — Presupuestos profesionales en PDF

**Feature Branch**: `001-presupuestos-pdf`

**Created**: 2026-10-03

**Status**: Draft

**Input**: User description: "PresupuestosPro v0: herramienta para que un freelancer español cree presupuestos profesionales con su marca (perfil, catálogo de servicios, cálculo automático de base, IVA 21 %, retención de IRPF 15 %/7 % solo a empresas/autónomos, numeración AAAA-NNN, validez 30 días) y los descargue en PDF. Datos guardados en el equipo del freelancer. Ver `prompt_speckit_specify.md`."

## Contexto

Hoy el freelancer prepara los presupuestos copiando una hoja de cálculo antigua, cambiando los conceptos a mano y calculando el IVA con la calculadora. Tarda demasiado, es fácil equivocarse y el resultado no parece profesional. **El objetivo de negocio es emitir un presupuesto correcto y con buena imagen en menos de 5 minutos.**

**Actores**

- **Freelancer**: es quien usa la aplicación. Es autónomo en España, trabaja solo y no tiene perfil técnico.
- **Cliente**: no usa la aplicación; recibe el PDF por email. Puede ser **empresa/autónomo** o **particular**. Este tipo decide si se aplica la retención de IRPF.

## Clarifications

### Session 2026-10-03

- Q: ¿Qué se puede hacer con un presupuesto ya guardado? → A: Hay una lista de presupuestos. Cualquiera se puede reabrir, editar, volver a descargar en PDF o eliminar, en cualquier momento. El número asignado no cambia nunca y no se reutiliza aunque se elimine el presupuesto, así que puede haber huecos en la numeración.
- Q: ¿Los clientes se guardan en una agenda que se pueda reutilizar? → A: No. Los datos del cliente se escriben en cada presupuesto y no hay agenda de clientes.
- Q: ¿El IVA es siempre el 21 %? → A: Sí. En la v0 es fijo y no se puede cambiar.
- Q: ¿Cuándo se asignan el número y la fecha de emisión? → A: Al crear el presupuesto. La fecha de emisión es la de ese día y no se puede editar. El año del número es el de la fecha de emisión.
- Q: ¿Debe el presupuesto tener un campo de texto libre de "Notas / condiciones" que aparezca en el PDF? → A: Sí. Es un único campo de texto libre y opcional en cada presupuesto, que se imprime al pie del PDF solo si tiene contenido. No hay texto por defecto en el perfil.
- Q: ¿Se puede duplicar un presupuesto existente para crear uno nuevo a partir de él? → A: Sí. Desde la lista, "Duplicar" crea un presupuesto nuevo con los mismos datos del cliente, líneas, configuración de retención y notas, pero con un número nuevo y la fecha de emisión de hoy.
- Q: ¿Incluimos una copia de seguridad en la v0? → A: Sí, como archivo local. "Descargar copia de seguridad" genera un único archivo con el perfil, el catálogo, los presupuestos y la numeración. "Restaurar copia" carga ese archivo y sustituye todos los datos actuales, después de pedir confirmación. No se usa la nube.
- Q: Cuando el freelancer reabre un presupuesto cuya validez ya pasó, ¿qué debe pasar? → A: Solo se marca como "Caducado" en la lista y al abrirlo. Se puede seguir editando y descargando con sus fechas originales. Para renovarlo, se duplica.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear un presupuesto con los importes calculados solos (Priority: P1)

El freelancer crea un presupuesto nuevo. Escribe los datos del cliente e indica si es empresa/autónomo o particular. Añade líneas, que pueden salir de su catálogo o escribirse a mano. Si corresponde, activa la retención de IRPF. Mientras trabaja, ve en todo momento la base imponible, el IVA, la retención y el total, ya calculados y correctos.

**Why this priority**: es el corazón del producto. Sin un cálculo correcto de los impuestos no hay presupuesto que se pueda enviar, y esto es lo que hoy obliga a usar la calculadora y genera errores.

**Independent Test**: crear un presupuesto con las líneas del ejemplo de referencia, escritas a mano, y comprobar en pantalla que los importes coinciden al céntimo con los de la sección "Reglas de negocio", en sus tres variantes.

**Acceptance Scenarios**:

1. **Given** un presupuesto nuevo para un cliente empresa/autónomo, **When** el freelancer añade "Diseño de página web" (1 × 1.500,00 €) y "Sesión de fotos de producto" (1 × 500,00 €) y activa la retención del 15 %, **Then** la pantalla muestra base imponible 2.000,00 €, IVA (21 %) 420,00 €, retención de IRPF (15 %) −300,00 € y total 2.120,00 €.
2. **Given** el presupuesto del escenario 1, **When** el freelancer cambia la retención al 7 %, **Then** la retención pasa a −140,00 € y el total a 2.280,00 € sin pulsar ningún botón de "calcular".
3. **Given** el presupuesto del escenario 1, **When** el freelancer desactiva la retención, **Then** desaparece la retención y el total pasa a 2.420,00 €.
4. **Given** el presupuesto del escenario 1, **When** el freelancer cambia el tipo de cliente a "particular", **Then** la retención no se aplica (aunque estuviera activada), el total pasa a 2.420,00 € y se muestra un aviso que explica que a los particulares no se les aplica retención.
5. **Given** un presupuesto con varias líneas, **When** el freelancer cambia la cantidad o el precio de una línea, o la elimina, **Then** el importe de la línea, la base, el IVA, la retención y el total se actualizan al momento.
6. **Given** que ya existe el presupuesto 2026-001, **When** el freelancer crea un presupuesto nuevo en 2026, **Then** este recibe automáticamente el número 2026-002.
7. **Given** un presupuesto creado el 03/10/2026, **When** el freelancer lo consulta, **Then** la fecha de emisión es 03/10/2026 y la validez llega hasta el 02/11/2026 (30 días después).

---

### User Story 2 - Descargar el presupuesto en PDF (Priority: P2)

Cuando el presupuesto está listo, el freelancer lo descarga en PDF para enviárselo él mismo al cliente. El PDF tiene buena imagen, lleva su marca y contiene toda la información que el cliente necesita.

**Why this priority**: el PDF es lo que recibe el cliente. Sin él, el presupuesto no sale de la aplicación. Depende de la historia 1, porque necesita un presupuesto con importes.

**Independent Test**: con el presupuesto del ejemplo de referencia creado, descargar el PDF, abrirlo con cualquier lector de PDF y comprobar que aparece cada uno de los elementos de FR-016.

**Acceptance Scenarios**:

1. **Given** un perfil completo con logo y el presupuesto del ejemplo de referencia con retención del 15 %, **When** el freelancer descarga el PDF, **Then** el documento muestra el logo, los datos del freelancer y del cliente, el número, la fecha de emisión, la fecha de validez, la tabla de líneas y el desglose: base 2.000,00 €, IVA 420,00 €, retención −300,00 € y total 2.120,00 €.
2. **Given** un presupuesto para un cliente particular, **When** el freelancer descarga el PDF, **Then** el desglose no incluye ninguna fila de retención y el total es la base más el IVA.
3. **Given** un presupuesto sin ninguna línea, **When** el freelancer intenta descargar el PDF, **Then** no se genera el PDF y aparece un aviso que indica que hay que añadir al menos una línea.
4. **Given** un perfil sin nombre o sin NIF, **When** el freelancer intenta descargar el PDF, **Then** no se genera el PDF y aparece un aviso que le indica que complete su perfil.
5. **Given** un perfil sin logo, **When** el freelancer descarga el PDF, **Then** el PDF se genera correctamente sin logo.
6. **Given** un presupuesto con el texto "Pago: 50 % al aceptar, 50 % a la entrega" en Notas / condiciones, **When** el freelancer descarga el PDF, **Then** ese texto aparece al pie del documento. Si el campo está vacío, el PDF no muestra ninguna sección de notas.

---

### User Story 3 - Configurar mi perfil y mi marca (Priority: P3)

El freelancer guarda una sola vez su nombre, su NIF, sus datos de contacto y su logo. A partir de ahí, todos sus presupuestos salen con su marca sin tener que volver a escribirlos.

**Why this priority**: da la imagen profesional y es necesario para el PDF, pero se configura una sola vez.

**Independent Test**: rellenar el perfil, cerrar la aplicación, volver a abrirla y comprobar que los datos y el logo siguen ahí y aparecen en el PDF de cualquier presupuesto.

**Acceptance Scenarios**:

1. **Given** un perfil vacío, **When** el freelancer escribe su nombre, su NIF, su email, su teléfono y su dirección, sube un logo y guarda, **Then** los datos quedan guardados y aparecen en los PDF que genere después.
2. **Given** un perfil ya guardado, **When** el freelancer cambia su teléfono y guarda, **Then** los PDF que se generen a partir de ese momento muestran el teléfono nuevo.
3. **Given** el formulario del perfil, **When** el freelancer intenta guardar sin nombre o sin NIF, **Then** el perfil no se guarda y se indica qué campo falta.
4. **Given** el formulario del perfil, **When** el freelancer intenta subir un archivo que no es una imagen PNG ni JPG, **Then** el archivo se rechaza con un mensaje claro.

---

### User Story 4 - Mantener mi catálogo de servicios (Priority: P4)

El freelancer guarda los servicios que ofrece habitualmente, cada uno con un precio por defecto, para poder añadirlos a un presupuesto con un par de clics.

**Why this priority**: acelera la creación de presupuestos y es clave para bajar de 5 minutos, pero se puede trabajar sin catálogo escribiendo las líneas a mano.

**Independent Test**: crear un servicio en el catálogo, añadirlo a un presupuesto, comprobar que la línea se rellena con su nombre y su precio, y después editar y eliminar el servicio.

**Acceptance Scenarios**:

1. **Given** el catálogo, **When** el freelancer crea el servicio "Diseño de página web" a 1.500,00 €, **Then** el servicio aparece en el catálogo.
2. **Given** ese servicio en el catálogo, **When** el freelancer lo añade a un presupuesto, **Then** se crea una línea con la descripción "Diseño de página web", la cantidad 1 y el precio unitario 1.500,00 €, y todos esos valores se pueden modificar en la línea.
3. **Given** un presupuesto que ya contiene una línea de un servicio del catálogo, **When** el freelancer cambia el precio de ese servicio en el catálogo o lo elimina, **Then** la línea del presupuesto existente no cambia.
4. **Given** el catálogo, **When** el freelancer edita el nombre o el precio de un servicio, **Then** el cambio queda guardado y se usa en las líneas que se añadan después.

---

### User Story 5 - Volver a mis presupuestos guardados (Priority: P5)

El freelancer cierra la aplicación y, otro día, la vuelve a abrir. Su perfil, su catálogo y sus presupuestos siguen ahí. Puede ver la lista de presupuestos, reabrir cualquiera para editarlo o descargarlo de nuevo, duplicarlo como punto de partida de uno nuevo, o eliminarlo.

**Why this priority**: sin esto habría que rehacer todo cada vez. Aun así, el valor principal (crear y descargar) se puede demostrar en una sola sesión.

**Independent Test**: crear el perfil, dos servicios y dos presupuestos, cerrar la aplicación, volver a abrirla y comprobar que todo está ahí sin cambios.

**Acceptance Scenarios**:

1. **Given** un perfil, un catálogo y varios presupuestos guardados, **When** el freelancer cierra la aplicación y la vuelve a abrir, **Then** todo sigue presente y sin cambios.
2. **Given** la lista de presupuestos, **When** el freelancer la consulta, **Then** ve de cada presupuesto el número, el nombre del cliente, la fecha de emisión y el total, ordenados del más reciente al más antiguo.
3. **Given** un presupuesto guardado, **When** el freelancer lo reabre, cambia una línea y lo descarga de nuevo, **Then** el PDF refleja el cambio y el presupuesto conserva el mismo número y la misma fecha de emisión.
4. **Given** un presupuesto guardado, **When** el freelancer pulsa eliminar, **Then** se le pide confirmación y, si confirma, el presupuesto desaparece de la lista.
5. **Given** un perfil, un catálogo y varios presupuestos, **When** el freelancer descarga una copia de seguridad, borra los datos del equipo (o cambia de equipo) y restaura esa copia, **Then** el perfil, el catálogo y los presupuestos vuelven a estar completos, y el siguiente presupuesto continúa la numeración donde estaba.
6. **Given** los presupuestos 2026-001, 2026-002 y 2026-003, **When** el freelancer elimina el 2026-003 y crea uno nuevo, **Then** el nuevo recibe el número 2026-004. Los números eliminados no se reutilizan.
7. **Given** el presupuesto 2026-001, emitido el 01/09/2026 con dos líneas y retención del 15 %, **When** el freelancer lo duplica el 03/10/2026, **Then** se crea un presupuesto con el número siguiente disponible y fecha de emisión 03/10/2026, con el mismo cliente, las mismas líneas, la misma retención y las mismas notas. El 2026-001 no cambia.

---

### Edge Cases

- **Presupuesto sin líneas**: se puede guardar, pero no descargar en PDF. Se avisa al freelancer (CL1).
- **Línea escrita a mano, sin servicio de catálogo**: está permitida y funciona exactamente igual que una línea del catálogo (CL2).
- **Cliente particular con la retención activada**: la retención no se aplica, porque manda el tipo de cliente (CL3). Si después se cambia el cliente a empresa/autónomo, vuelve a aplicarse la retención que estaba elegida.
- **Cambio de año**: el primer presupuesto creado en 2027 recibe el número 2027-001, aunque en 2026 se llegara a cualquier otro número.
- **Más de 999 presupuestos en un año**: el contador sigue más allá de 999 (por ejemplo, 2026-1000). No se espera que ocurra con el volumen de un freelancer.
- **Céntimos con decimales en el cálculo**: con 3 × 33,33 € la base es 99,99 €, el IVA 21,00 € (20,9979 redondeado), la retención del 15 % 15,00 € (14,9985 redondeado) y el total 105,99 €.
- **Datos inválidos en una línea**: si falta la descripción, la cantidad es 0 o negativa, o el precio es negativo, se marca el campo y la línea no cuenta en el total hasta que se corrige. Mientras haya líneas inválidas no se puede descargar el PDF.
- **Cliente sin nombre**: el presupuesto no se puede descargar en PDF hasta que el cliente tenga nombre. Si el cliente es empresa/autónomo, también hace falta su NIF/CIF.
- **Servicio de catálogo eliminado**: los presupuestos que ya lo usaban conservan sus líneas tal como estaban.
- **Presupuesto caducado**: un presupuesto emitido el 01/09/2026 (válido hasta el 01/10/2026) aparece como "Caducado" a partir del 02/10/2026. Se puede seguir editando y descargando, y su PDF conserva las fechas originales (FR-019b).
- **Validez que cruza el cambio de mes o de año**: los 30 días se cuentan como días naturales (por ejemplo, una emisión el 15/12/2026 vale hasta el 14/01/2027).

## Requirements *(mandatory)*

### Functional Requirements

**Perfil del freelancer**

- **FR-001**: El sistema MUST permitir guardar y editar un único perfil del freelancer con nombre o razón social (obligatorio), NIF (obligatorio), email, teléfono y dirección (opcionales) y un logo (opcional, imagen PNG o JPG).
- **FR-002**: El sistema MUST rechazar con un mensaje claro un perfil sin nombre o sin NIF, y también un logo que no sea PNG ni JPG.

**Catálogo de servicios**

- **FR-003**: El sistema MUST permitir crear, editar y eliminar servicios del catálogo, cada uno con nombre (obligatorio) y precio por defecto en euros (obligatorio, mayor o igual que 0).
- **FR-004**: Al eliminar un servicio, el sistema MUST pedir confirmación.

**Presupuestos**

- **FR-005**: El sistema MUST permitir crear un presupuesto con los datos del cliente escritos en el propio presupuesto: nombre o razón social (obligatorio), tipo de cliente (obligatorio: "empresa/autónomo" o "particular"), NIF/CIF (obligatorio solo si es empresa/autónomo), dirección y email (opcionales). No hay agenda de clientes.
- **FR-006**: Cada línea del presupuesto MUST tener descripción (obligatoria), cantidad (mayor que 0; se admiten decimales, como 1,5) y precio unitario en euros (mayor o igual que 0).
- **FR-007**: El sistema MUST permitir añadir una línea desde el catálogo, que copia el nombre del servicio como descripción, su precio como precio unitario y pone la cantidad a 1. También MUST permitir añadir una línea escrita a mano. En ambos casos todos los valores de la línea se pueden modificar.
- **FR-008**: Los cambios posteriores en el catálogo (editar o eliminar un servicio) MUST NOT modificar las líneas de los presupuestos que ya existen.
- **FR-009**: El sistema MUST permitir editar y eliminar cualquier línea de un presupuesto en cualquier momento, también después de haber descargado su PDF.

**Cálculos**

- **FR-010**: El sistema MUST calcular automáticamente, y actualizar al momento ante cualquier cambio, lo siguiente:
  - Importe de cada línea = cantidad × precio unitario, redondeado al céntimo.
  - Base imponible = suma de los importes de las líneas.
  - IVA = base imponible × 21 %, redondeado al céntimo.
  - Retención de IRPF = base imponible × porcentaje elegido (15 % o 7 %), redondeado al céntimo, solo si se cumplen las condiciones de FR-012.
  - Total = base imponible + IVA − retención de IRPF.
  - Todos los redondeos se hacen al céntimo más próximo; cuando el valor queda justo en la mitad, se redondea hacia arriba.
- **FR-011**: El tipo de IVA MUST ser siempre del 21 % y el freelancer no lo puede cambiar en la v0.
- **FR-012**: El freelancer MUST poder activar o desactivar la retención de IRPF en cada presupuesto y elegir el 15 % o el 7 %. La retención viene desactivada en los presupuestos nuevos y, al activarla, propone el 15 %. Solo se aplica cuando el cliente es empresa/autónomo.
- **FR-013**: Si el cliente es "particular", la retención MUST NOT aplicarse en ningún caso, aunque esté activada, y el sistema MUST mostrar un aviso que lo explique.

**Numeración y fechas**

- **FR-014**: Al crear un presupuesto, el sistema MUST asignarle automáticamente un número con el formato AAAA-NNN, donde AAAA es el año de la fecha de emisión y NNN es un contador de al menos tres dígitos (con ceros a la izquierda) que empieza en 001 cada año. El número no cambia nunca y no se reutiliza aunque el presupuesto se elimine.
- **FR-015**: Al crear un presupuesto, el sistema MUST fijar como fecha de emisión la fecha del día, que no se puede editar, y mostrar la fecha de validez, igual a la fecha de emisión más 30 días naturales. Las fechas se muestran como dd/mm/aaaa.

**PDF**

- **FR-016**: El sistema MUST permitir descargar cada presupuesto como PDF con el logo (si existe), los datos del freelancer, los datos del cliente, el número, la fecha de emisión, la fecha de validez, la tabla de líneas (descripción, cantidad, precio unitario e importe) y el desglose: base imponible, IVA (21 %), retención de IRPF (solo si se aplica, con su porcentaje) y total.
- **FR-016a**: Cada presupuesto MUST tener un campo opcional de texto libre llamado "Notas / condiciones" (por ejemplo, forma de pago o plazos). Si tiene contenido, el PDF lo muestra al pie; si está vacío, el PDF no muestra esa sección.
- **FR-017**: El sistema MUST impedir la descarga del PDF, con un aviso que explique el motivo, cuando el presupuesto no tenga líneas, tenga líneas inválidas, al cliente le falten datos obligatorios o al perfil del freelancer le falten nombre o NIF.
- **FR-018**: El PDF MUST indicar claramente que se trata de un "Presupuesto" y no de una factura.

**Lista y persistencia**

- **FR-019**: El sistema MUST mostrar la lista de presupuestos guardados (número, cliente, fecha de emisión y total), ordenada del más reciente al más antiguo, desde la que se puede abrir, volver a descargar, duplicar o eliminar cada uno. Para eliminar, el sistema pide confirmación.
- **FR-019a**: Al duplicar un presupuesto, el sistema MUST crear uno nuevo con copia de los datos del cliente, las líneas, la configuración de retención y las notas / condiciones. El nuevo recibe un número nuevo (FR-014) y la fecha de emisión del día (FR-015). El presupuesto original no cambia.
- **FR-019b**: Cuando la fecha de hoy es posterior a la fecha de validez de un presupuesto, el sistema MUST mostrarlo como "Caducado" en la lista y al abrirlo. Esa marca no impide editarlo ni descargarlo, no cambia sus fechas y no aparece en el PDF.
- **FR-020**: El perfil, el catálogo y los presupuestos MUST guardarse en el equipo del freelancer y seguir disponibles al cerrar y volver a abrir la aplicación.
- **FR-020a**: El sistema MUST permitir descargar una copia de seguridad: un único archivo que contiene el perfil (logo incluido), el catálogo, todos los presupuestos y el estado de la numeración.
- **FR-020b**: El sistema MUST permitir restaurar una copia de seguridad. Antes de hacerlo, avisa de que se sustituirán todos los datos actuales y pide confirmación. Si el archivo no es una copia válida de PresupuestosPro, se rechaza con un mensaje claro y no se modifica ningún dato.

**Presentación**

- **FR-021**: Todos los textos de la aplicación y del PDF MUST estar en español de España, y los importes MUST mostrarse en euros con formato español (por ejemplo, 1.500,00 €).

### Key Entities

- **Perfil del freelancer**: hay uno solo. Contiene nombre o razón social, NIF, email, teléfono, dirección y logo.
- **Servicio (del catálogo)**: un servicio que el freelancer ofrece habitualmente. Tiene nombre y precio por defecto. Sirve como plantilla para crear líneas.
- **Presupuesto**: tiene número (AAAA-NNN), fecha de emisión, fecha de validez, datos del cliente, una o más líneas, unas notas / condiciones opcionales y la configuración de retención (activada o no, y 15 % o 7 %). Sus importes (base, IVA, retención y total) se calculan siempre a partir de sus líneas, su tipo de cliente y su configuración de retención.
- **Datos del cliente**: forman parte de cada presupuesto (no son una entidad independiente). Son el nombre o razón social, el tipo (empresa/autónomo o particular), el NIF/CIF, la dirección y el email.
- **Línea de presupuesto**: pertenece a un presupuesto. Tiene descripción, cantidad, precio unitario e importe. Es independiente del catálogo una vez creada.
- **Contador anual de numeración**: el último número asignado en cada año. Garantiza que los números no se repiten ni se reutilizan.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Con el perfil y el catálogo ya configurados, el freelancer crea un presupuesto de 3 líneas y descarga su PDF en menos de 5 minutos, a la primera.
- **SC-002**: Los tres casos del ejemplo de referencia (15 %: 2.120,00 €; 7 %: 2.280,00 €; particular: 2.420,00 €) y el caso de redondeo de los casos límite (105,99 €) coinciden al céntimo en pantalla y en el PDF, en el 100 % de las comprobaciones.
- **SC-003**: Al cambiar una línea, el tipo de cliente o la retención, los importes se actualizan de forma visiblemente inmediata, sin pulsar ningún botón.
- **SC-004**: Después de cerrar y volver a abrir la aplicación se conservan el 100 % de los datos del perfil, del catálogo y de los presupuestos.
- **SC-005**: Al crear 10 presupuestos seguidos en el mismo año, reciben números consecutivos sin repeticiones (por ejemplo, de 2026-001 a 2026-010).
- **SC-006**: En una prueba con personas no técnicas, al menos 9 de cada 10 crean y descargan su primer presupuesto sin ayuda.
- **SC-007**: El PDF de un presupuesto de hasta 15 líneas cabe en una página A4 y se puede leer en cualquier lector de PDF habitual.

## Assumptions

- Hay un solo freelancer por instalación. No hay cuentas, contraseñas ni varios usuarios.
- El freelancer usa la aplicación desde un solo equipo cada vez. No hay sincronización automática; para cambiar de equipo o protegerse ante la pérdida de datos, usa la copia de seguridad manual (FR-020a, FR-020b).
- Los presupuestos no tienen estados de flujo (borrador, enviado, aceptado, etc.) y todos se pueden editar siempre. La marca "Caducado" (FR-019b) se calcula a partir de la fecha y no es un estado que el freelancer cambie.
- Con un 7 % o un 15 % de retención basta para la v0. No se contemplan otros porcentajes ni recargos de equivalencia.
- La retención se elige en cada presupuesto, no en el perfil.
- El nombre del archivo PDF incluye el número del presupuesto (por ejemplo, "Presupuesto-2026-001.pdf").
- Fuera de alcance (v0): facturas, facturación electrónica y VeriFactu; cuentas de usuario; almacenamiento en la nube; otras monedas distintas del euro; envío del PDF por email desde la aplicación; descuentos por línea o globales; agenda de clientes; tipos de IVA distintos del 21 %; edición de la fecha de emisión.
