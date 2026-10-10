# Contract: pantallas y PDF

La aplicación no expone API. Su interfaz es la UI (rutas por hash) y el PDF generado. Todos los textos en español de España (FR-021).

## Rutas

| Ruta | Pantalla | Requisitos |
|---|---|---|
| `#/presupuestos` (inicio) | Lista de presupuestos + botón "Nuevo presupuesto" | FR-019, FR-019b |
| `#/presupuesto/<id>` | Editor de un presupuesto | FR-005 … FR-017 |
| `#/catalogo` | Catálogo de servicios | FR-003, FR-004 |
| `#/perfil` | Perfil + copia de seguridad | FR-001, FR-002, FR-020a, FR-020b |

Barra de navegación fija abajo en el móvil: **Presupuestos · Catálogo · Perfil**. Una ruta desconocida o un `id` inexistente lleva a `#/presupuestos`.

## Lista de presupuestos

- Cada elemento: número, nombre del cliente (o "Sin cliente"), fecha de emisión (dd/mm/aaaa), total y la etiqueta **Caducado** si corresponde.
- Orden: más reciente primero.
- Acciones por elemento: **Abrir** (tocar el elemento), **Descargar PDF**, **Duplicar**, **Eliminar** (con confirmación).
- Lista vacía: mensaje "Todavía no tienes presupuestos" y el botón de crear.

## Editor de presupuesto

Orden de arriba abajo (una columna en el móvil):
1. Cabecera: número, fecha de emisión, "Válido hasta dd/mm/aaaa" y etiqueta Caducado si corresponde (no editables).
2. **Cliente**: tipo (empresa/autónomo · particular), nombre, NIF/CIF (marcado obligatorio solo si empresa/autónomo), dirección, email.
3. **Líneas**: tarjetas con descripción, cantidad, precio unitario, importe calculado y botón eliminar. Botones **Añadir del catálogo** (lista de servicios para elegir) y **Añadir línea**. Los campos inválidos se marcan en rojo con su mensaje.
4. **Retención de IRPF**: interruptor (desactivado por defecto) y selector 15 % / 7 % (visible al activarla). Si el cliente es particular: aviso "A los clientes particulares no se les aplica retención de IRPF."
5. **Notas / condiciones**: área de texto libre opcional.
6. **Desglose fijo al pie**: Base imponible · IVA (21 %) · Retención IRPF (x %) (solo si se aplica, en negativo) · **Total**, y botón **Descargar PDF**.

Comportamiento: cada cambio se guarda automáticamente y los importes se recalculan al momento (no hay botón "Calcular" ni "Guardar"). Si no se puede descargar, el botón muestra el motivo (ver reglas en [data-model.md](../data-model.md#reglas-para-descargar-el-pdf-fr-017)).

## Catálogo

Lista de servicios (nombre y precio). Botón **Nuevo servicio**; cada servicio se puede editar y eliminar (con confirmación). Validación: nombre obligatorio, precio ≥ 0.

## Perfil

Formulario: nombre o razón social*, NIF*, email, teléfono, dirección, logo (PNG/JPG, con vista previa y botón quitar). Botón **Guardar**; si falta un obligatorio, se indica qué campo. Debajo: **Descargar copia de seguridad** y **Restaurar copia** ([backup-file.md](backup-file.md)).

## PDF (FR-016, FR-016a, FR-018)

- Archivo: `Presupuesto-<numero>.pdf`. Tamaño A4 vertical; hasta 15 líneas caben en una página (SC-007); si hay más, la tabla continúa en páginas siguientes.
- Contenido, de arriba abajo:
  1. Logo (si existe) y datos del freelancer (nombre, NIF, dirección, email, teléfono los que existan).
  2. Título bien visible **PRESUPUESTO**, número, fecha de emisión y "Válido hasta".
  3. Datos del cliente (nombre, NIF/CIF, dirección, email los que existan).
  4. Tabla: Descripción · Cantidad · Precio unitario · Importe.
  5. Desglose alineado a la derecha: Base imponible, IVA (21 %), Retención IRPF (x %) en negativo solo si se aplica, **Total**.
  6. Notas / condiciones al pie, solo si tienen contenido.
- No aparece la marca "Caducado". Importes con formato `1.500,00 €`, fechas `dd/mm/aaaa`, cantidades con coma decimal (`1,5`).
