# Contract: pantallas, navegación y PDF (extensión de la spec 001)

Extiende [contracts/ui.md](../001-presupuestos-pdf/contracts/ui.md) de la spec 001. Lo que no se menciona aquí no cambia.

## Rutas (reemplaza la tabla de rutas de la spec 001)

| Ruta | Pantalla | Requisitos |
|---|---|---|
| `#/` (o sin hash) | **Inicio**: resumen de actividad + accesos a las demás secciones | FR-001, FR-002, FR-003 |
| `#/presupuestos` | Lista de presupuestos + botón "Nuevo presupuesto" | FR-019, FR-019b (spec 001) |
| `#/presupuesto/<id>` | Editor de un presupuesto (añade el selector de estado) | FR-005…FR-017 (spec 001), FR-009 (spec 002) |
| `#/clientes` | **Clientes**: lista de solo lectura agrupada | FR-012 |
| `#/catalogo` | Catálogo de servicios | FR-003, FR-004 (spec 001) |
| `#/perfil` | Perfil + copia de seguridad | FR-001, FR-002, FR-020a, FR-020b (spec 001) |

Una ruta desconocida o un `id` inexistente sigue llevando a `#/presupuestos` (spec 001), salvo la raíz, que ahora lleva a Inicio en vez de a Presupuestos.

Navegación común, fija abajo en el móvil: **Inicio · Presupuestos · Clientes · Catálogo · Perfil** (5 accesos), visible e idéntica en las seis pantallas, indicando en cuál se está.

## Inicio

- Resumen: número total de presupuestos; desglose por estado (Borrador, Enviado, Aceptado, Rechazado); número de presupuestos caducados (aparte, no excluyente con el desglose por estado).
- Un acceso directo (botón o tarjeta tocable) por cada sección: Presupuestos, Clientes, Catálogo, Perfil.
- Sin presupuestos todavía: el resumen muestra todo en cero y se añade una invitación a crear el primer presupuesto (botón "Nuevo presupuesto", igual que en la lista de la spec 001).

## Editor de presupuesto (añade a la spec 001)

Se añade, junto a la cabecera (número/fechas), un selector de **Estado** con las cuatro opciones (Borrador, Enviado, Aceptado, Rechazado); cambiarlo se guarda igual que cualquier otro campo del editor (sin botón "Guardar"). El resto del editor (cliente, líneas, retención, notas, desglose, PDF) no cambia de comportamiento, solo de apariencia (ver Rediseño visual).

## Lista de presupuestos (añade a la spec 001)

Cada elemento añade una etiqueta visual de **Estado** (una de las cuatro, con su propio color) junto a la etiqueta "Caducado" cuando corresponda (pueden coexistir).

## Clientes (nueva)

- Lista de clientes agrupados (ver [data-model.md](../data-model.md#lista-de-clientes-sección-clientes)): nombre, tipo, NIF/CIF (si lo hay) y número de presupuestos.
- Sin clientes todavía (ningún presupuesto creado): mensaje "Todavía no tienes clientes" (sin acción de alta: se crean clientes escribiéndolos dentro de un presupuesto, como ya permite la spec 001).
- No hay edición, borrado ni alta desde esta pantalla.

## Rediseño visual (todas las pantallas)

- Paleta y tipografía definidas como variables CSS en `:root` de `styles.css` (ver [research.md](../research.md#r1-sistema-visual-centralizado)); ninguna pantalla usa colores o fuentes fuera de esas variables.
- Jerarquía: los totales de cada presupuesto (en el editor y en la lista) se destacan tipográficamente sobre el resto de importes, igual que ya exigía la spec 001 (FR-018), ahora con un estilo consistente en toda la app.
- Etiquetas de estado: una por cada uno de los 4 valores, con su propio color (ver [research.md](../research.md#r8-color-por-estado)); la etiqueta "Caducado" conserva su propio estilo, distinto de "Rechazado".

## PDF (extiende FR-016/FR-016a/FR-018 de la spec 001)

- Mismo contenido, mismo orden de bloques y mismos datos que la spec 001 (logo, freelancer, título, número y fechas, cliente, tabla, desglose, notas). No cambia nada de lo que se imprime, solo su apariencia.
- Usa los mismos colores y la misma familia tipográfica (Helvetica, ya usada en jsPDF) que las variables CSS de la app, declarados como constantes en `js/pdf.js`.
- Sigue sin mostrar ni "Caducado" ni el nuevo `estado`: el PDF es un documento para el cliente externo, no un reflejo del flujo de trabajo interno del freelancer (igual criterio que ya aplicaba la spec 001 a "Caducado").
