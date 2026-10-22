# Feature Specification: Exportar todos los presupuestos en un .zip

**Feature Branch**: `003-exportar-zip`

**Created**: 2026-10-22

**Status**: Draft

**Input**: User description: "Exportar todos mis presupuestos en un .zip. Que el freelancer pueda llevarse TODOS sus presupuestos de una sola vez, en un único archivo comprimido .zip, como copia de seguridad y para archivarlos donde quiera. Un botón «Exportar todo (.zip)» en un lugar visible de la lista de presupuestos; al pulsarlo se descarga un único .zip con un PDF por cada presupuesto (exactamente el mismo PDF que ya genera la app) y un único archivo de datos con toda la información (presupuestos, catálogo y perfil, logo incluido) pensado para poder restaurar la aplicación en el futuro. Nombre del zip «presupuestospro-copia-AAAA-MM-DD.zip»; cada PDF «número - cliente.pdf»; la exportación es solo lectura; los PDF deben cuadrar al céntimo con los individuales (ejemplo de control: total 3.604,00 €). Sin presupuestos: aviso y sin descarga. Nombres de cliente con caracteres conflictivos se limpian. Con 50+ presupuestos debe verse que está trabajando. Fuera de alcance: importar la copia, Excel/CSV, copias automáticas, envío por email o nube."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Descargar todo en un único .zip (Priority: P1)

Un freelancer con varios presupuestos guardados entra en la lista de presupuestos, pulsa «Exportar todo (.zip)» y su navegador descarga un único archivo llamado `presupuestospro-copia-AAAA-MM-DD.zip`. Al descomprimirlo con doble clic encuentra un PDF por cada presupuesto, con nombre «número - cliente», y un archivo de datos con toda su información. Guarda ese .zip donde quiera (disco externo, pendrive, su nube personal) como seguro ante la pérdida de los datos del navegador.

**Why this priority**: es el núcleo de la funcionalidad: sin esta descarga no hay copia de seguridad ni archivo. Por sí sola ya entrega todo el valor prometido.

**Independent Test**: con 3 presupuestos creados, pulsar el botón, descomprimir el archivo descargado y comprobar que contiene exactamente 3 PDF con nombre «número - cliente» y 1 archivo de datos.

**Acceptance Scenarios**:

1. **Given** existen 3 presupuestos guardados, **When** el usuario pulsa «Exportar todo (.zip)» el 15/03/2026, **Then** se descarga un único archivo llamado `presupuestospro-copia-2026-03-15.zip`.
2. **Given** se ha descargado el .zip de 3 presupuestos, **When** el usuario lo descomprime, **Then** ve exactamente 3 PDF y 1 archivo de datos, sin carpetas ni archivos adicionales.
3. **Given** un presupuesto con número 2026-001 para el cliente «Estudio García», **When** se exporta, **Then** su PDF dentro del .zip se llama `2026-001 - Estudio García.pdf`.
4. **Given** el usuario ha exportado, **When** vuelve a usar la aplicación, **Then** todos sus presupuestos, estados, catálogo, perfil y numeración siguen exactamente igual que antes de exportar.

---

### User Story 2 - PDF del .zip idénticos a los individuales (Priority: P1)

El freelancer abre cualquiera de los PDF del .zip y lo compara con el que descarga desde la propia app para ese mismo presupuesto: son el mismo documento, con los mismos datos, el mismo diseño y los mismos importes al céntimo.

**Why this priority**: si los PDF del archivo no coinciden con los que el cliente recibió, la copia no sirve como archivo fiable; es un requisito de confianza tan crítico como la descarga.

**Independent Test**: crear el presupuesto de control del Módulo 2 (total 3.604,00 €), descargar su PDF individual desde el editor, exportar el .zip y comparar ambos PDF visualmente, línea a línea e importe a importe.

**Acceptance Scenarios**:

1. **Given** el presupuesto de control con total 3.604,00 €, **When** se abre su PDF dentro del .zip, **Then** muestra base imponible, IVA, IRPF y total idénticos al céntimo a los del PDF individual (total 3.604,00 €).
2. **Given** cualquier presupuesto exportado, **When** se compara su PDF del .zip con el PDF individual, **Then** coinciden en contenido y diseño: logo y datos del freelancer, datos del cliente, número, fechas de emisión y validez, líneas, desglose y total.

---

### User Story 3 - Aviso cuando no hay nada que exportar (Priority: P2)

Un freelancer que todavía no ha creado ningún presupuesto pulsa «Exportar todo (.zip)» y la app le dice con claridad que no hay presupuestos que exportar, sin descargar ningún archivo vacío.

**Why this priority**: evita confusión y archivos inútiles, pero no bloquea el valor principal.

**Independent Test**: en un navegador sin presupuestos guardados, pulsar el botón y comprobar que aparece el aviso y que no se descarga nada.

**Acceptance Scenarios**:

1. **Given** no existe ningún presupuesto, **When** el usuario pulsa «Exportar todo (.zip)», **Then** ve el aviso «No hay presupuestos que exportar.» y no se descarga ningún archivo.

---

### User Story 4 - Ver que la exportación está trabajando (Priority: P3)

Un freelancer con muchos presupuestos (50 o más) pulsa el botón; mientras se prepara el archivo, la app le muestra que está trabajando (por ejemplo, «Preparando presupuesto 12 de 80…») e impide lanzar una segunda exportación a la vez. Al terminar, se descarga el .zip y la indicación desaparece.

**Why this priority**: solo afecta a volúmenes grandes; mejora la experiencia pero el resultado final es el mismo sin ella.

**Independent Test**: con 50+ presupuestos, pulsar el botón y comprobar que aparece una indicación de progreso visible, que el botón no se puede volver a pulsar mientras tanto y que al final se descarga un único .zip completo.

**Acceptance Scenarios**:

1. **Given** existen 60 presupuestos, **When** el usuario pulsa el botón, **Then** ve una indicación de progreso que avanza hasta completar los 60 y el botón queda desactivado mientras dura.
2. **Given** la exportación ha terminado, **When** se descarga el .zip, **Then** la indicación de progreso desaparece y el botón vuelve a estar disponible.

---

### Edge Cases

- **Sin presupuestos**: aviso «No hay presupuestos que exportar.» y ninguna descarga (User Story 3).
- **Caracteres conflictivos en el nombre del cliente** (p. ej. «Diseño/Web S.L.»): los caracteres no válidos en nombres de archivo (`/ \ : * ? " < > |` y caracteres de control) se sustituyen por un guion, se eliminan espacios y puntos sobrantes al principio y al final, y se conservan tildes y la «ñ». Ejemplo: `2026-002 - Diseño-Web S.L.pdf`.
- **Presupuesto sin nombre de cliente**: se usa «Sin cliente», igual que en la lista de la app. Ejemplo: `2026-003 - Sin cliente.pdf`.
- **Nombres repetidos tras la limpieza**: no pueden coincidir porque el número del presupuesto es único y forma parte del nombre.
- **Nombre de cliente muy largo**: se recorta la parte del cliente para que el nombre completo del archivo no supere 100 caracteres, conservando siempre el número.
- **Presupuestos de cualquier estado** (Borrador, Enviado, Aceptado, Rechazado) **o caducados**: todos se incluyen; la exportación no filtra.
- **Perfil sin completar o sin logo**: la exportación funciona igual; los PDF se generan tal como los genera hoy la app para ese caso y el archivo de datos refleja lo que haya.
- **Fallo durante la preparación** (p. ej. falta de memoria del navegador): se muestra el aviso «No se ha podido crear el archivo .zip. Inténtalo de nuevo.», no se descarga un .zip incompleto y los datos no se modifican.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La pantalla de lista de presupuestos MUST mostrar un botón visible con el texto «Exportar todo (.zip)», también en pantallas de 360 px de ancho.
- **FR-002**: Al pulsarlo, con al menos un presupuesto guardado, el sistema MUST descargar un único archivo comprimido .zip.
- **FR-003**: El archivo MUST llamarse `presupuestospro-copia-AAAA-MM-DD.zip`, con la fecha local del día de la exportación.
- **FR-004**: El .zip MUST contener un PDF por cada presupuesto guardado, sin excepción por estado ni caducidad, y nada más que esos PDF y el archivo de datos (FR-007), todos en la raíz del .zip.
- **FR-005**: Cada PDF del .zip MUST ser el mismo documento que la app genera para ese presupuesto con su descarga individual: mismo contenido, diseño e importes al céntimo.
- **FR-006**: Cada PDF MUST llamarse `<número> - <cliente>.pdf`, aplicando las reglas de limpieza, «Sin cliente» y longitud descritas en Edge Cases.
- **FR-007**: El .zip MUST contener un único archivo de datos con toda la información de la aplicación: presupuestos (con su estado), catálogo de servicios, perfil del freelancer (logo incluido) y numeración. Su contenido y formato MUST ser los mismos que los de la «copia de seguridad» que la app ya descarga desde Perfil, y se llamará `presupuestospro-copia-AAAA-MM-DD.json`.
- **FR-008**: La exportación MUST ser de solo lectura: no puede crear, modificar ni borrar presupuestos, estados, catálogo, perfil ni contadores de numeración.
- **FR-009**: Si no hay ningún presupuesto, el sistema MUST mostrar el aviso «No hay presupuestos que exportar.» y MUST NOT descargar ningún archivo.
- **FR-010**: Mientras se prepara el .zip, el sistema MUST mostrar una indicación visible de progreso (presupuestos preparados sobre el total) y MUST impedir iniciar otra exportación hasta que termine.
- **FR-011**: Si la preparación falla, el sistema MUST mostrar el aviso «No se ha podido crear el archivo .zip. Inténtalo de nuevo.», MUST NOT descargar un archivo incompleto y MUST dejar los datos intactos.
- **FR-012**: Todos los textos nuevos (botón, avisos, progreso) MUST estar en español de España.

### Key Entities

- **Archivo de exportación (.zip)**: archivo comprimido generado bajo demanda; contiene N PDF (uno por presupuesto) y 1 archivo de datos. No se guarda en la app; solo se descarga.
- **PDF de presupuesto**: el documento existente de la spec 001 (con el diseño de la spec 002), identificado en el .zip por número y cliente.
- **Archivo de datos**: la copia de seguridad existente de la spec 001 (estado completo de la app: perfil con logo, catálogo, presupuestos con estado y contadores). No se cambia su formato.

No se añade ningún campo ni entidad al modelo de datos guardado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Con 3 presupuestos creados, una sola pulsación del botón produce exactamente 1 archivo descargado llamado `presupuestospro-copia-<fecha de hoy>.zip`.
- **SC-002**: Al descomprimir ese archivo con doble clic en el explorador del sistema se ven exactamente 3 PDF con nombre «número - cliente» y 1 archivo de datos.
- **SC-003**: El 100 % de los PDF comparados (al menos 3, incluido el de control) coinciden con su PDF individual en todos los textos e importes; el de control muestra un total de 3.604,00 €.
- **SC-004**: Con 0 presupuestos, al pulsar el botón aparece el aviso y no se descarga ningún archivo.
- **SC-005**: Un cliente llamado «Diseño/Web S.L.» produce un PDF cuyo nombre se muestra correctamente al descomprimir y que se abre sin errores.
- **SC-006**: Con 50 presupuestos, la indicación de progreso aparece en menos de 1 segundo tras pulsar y la descarga completa termina en menos de 1 minuto en un ordenador corriente.
- **SC-007**: Después de exportar, la lista de presupuestos, sus estados, el catálogo, el perfil y el número del siguiente presupuesto nuevo son los mismos que antes de exportar.
- **SC-008**: El archivo de datos extraído del .zip se acepta sin errores en «Restaurar copia» de Perfil y la app queda con los mismos datos.

## Assumptions

- El «archivo de datos» reutiliza la copia de seguridad JSON que ya existe (spec 001). Por eso ya puede restaurarse con el botón «Restaurar copia» de Perfil tras extraerlo del .zip; esta spec no añade ninguna importación del .zip (fuera de alcance, irá en otra spec).
- «Idéntico» significa mismo contenido visible, diseño e importes; los metadatos internos del PDF (como la marca de fecha y hora de creación) pueden diferir entre dos generaciones y no forman parte de la comparación.
- La fecha del nombre del .zip y del archivo de datos es la fecha local del dispositivo en el momento de pulsar el botón.
- El botón vive solo en la lista de presupuestos (no en Inicio ni en Perfil); el botón «Descargar copia de seguridad» de Perfil se mantiene sin cambios.
- La compresión y descarga ocurren íntegramente en el navegador: no se envía nada a ningún servidor (coherente con la constitution y con la ausencia de backend).
- Restricción para el plan: CLAUDE.md fija jsPDF como única dependencia y prohíbe dependencias nuevas; el plan deberá crear el .zip sin añadir librerías o justificar explícitamente cualquier desviación frente a la constitution.
- Volumen orientativo: hasta unos 200 presupuestos por usuario.
