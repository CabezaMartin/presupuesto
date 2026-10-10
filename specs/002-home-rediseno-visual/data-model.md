# Data Model: Página de inicio y rediseño visual profesional

**Feature**: `002-home-rediseno-visual` | **Date**: 2026-10-10

Extiende el modelo de datos de la spec 001 ([data-model.md](../001-presupuestos-pdf/data-model.md)). Todo sigue siendo **un único objeto JSON** en `localStorage` bajo la clave `presupuestospro`; esta funcionalidad añade un solo campo y define dos vistas derivadas que no se guardan.

## Cambio en Presupuesto (spec 001)

| Campo | Tipo | Reglas |
|---|---|---|
| `estado` | `"Borrador"` \| `"Enviado"` \| `"Aceptado"` \| `"Rechazado"` | **Nuevo.** Por defecto `"Borrador"` al crear. Se cambia libremente desde el editor, sin restricción de orden ni historial. Independiente de "Caducado" (que sigue siendo una etiqueta calculada, no un campo). |

**Compatibilidad con datos existentes**: un presupuesto guardado antes de esta funcionalidad (en `localStorage` o en una copia de seguridad de la spec 001) no tiene `estado`. Al **cargar** el estado de la aplicación (`js/store.js`), cualquier presupuesto sin `estado` se trata como `"Borrador"` (se asigna en memoria; no se reescribe en `localStorage` hasta el siguiente cambio real del usuario sobre ese presupuesto). El formato de copia de seguridad de la spec 001 ([contracts/backup-file.md](../001-presupuestos-pdf/contracts/backup-file.md)) no cambia: un archivo de copia sin `estado` en sus presupuestos se sigue aceptando igual, y se normaliza con la misma regla al restaurarlo.

Ningún otro campo de Presupuesto, Perfil, Servicio o DatosCliente cambia.

## Vistas derivadas (no se guardan; se calculan siempre con `js/calc.js`)

### Resumen de actividad (página de inicio)

A partir de `estado.presupuestos` y la fecha de hoy:

- `total`: número de presupuestos.
- `porEstado`: `{ Borrador: n, Enviado: n, Aceptado: n, Rechazado: n }` — cuenta por el campo `estado` (normalizado a `"Borrador"` si falta).
- `caducados`: número de presupuestos con `estaCaducado(fechaEmision, hoy)` verdadero, **independientemente** de su `estado` (un presupuesto puede contar a la vez en `porEstado.Aceptado` y en `caducados`).

### Lista de clientes (sección Clientes)

A partir de `estado.presupuestos[].cliente`, agrupando por `nombre.trim().toLowerCase()` + `tipo`:

- `nombre`, `tipo`: los del grupo.
- `nif`: el del presupuesto más reciente (por `fechaEmision`, y a igualdad por `numero`) del grupo que tenga `nif` no vacío; si ninguno lo tiene, cadena vacía.
- `numPresupuestos`: cuántos presupuestos pertenecen al grupo.

Esta lista es puramente de lectura: no se guarda en `estado`, no tiene `id` propio y no se referencia desde ningún presupuesto (sigue sin existir una "agenda de clientes" como entidad; ver spec 001, Servicio, para el único catálogo real que sí persiste).

## Reglas para cambiar el estado de un presupuesto

Cualquier valor puede pasar a cualquier otro valor (`Borrador` ↔ `Enviado` ↔ `Aceptado` ↔ `Rechazado`), sin validar la transición ni guardar un historial (spec.md, Assumptions). El cambio se persiste igual que cualquier otro campo del editor (guardado automático, sin botón "Guardar").

## Operaciones y efectos sobre el estado (adicionales a la spec 001)

| Operación | Efecto |
|---|---|
| Crear presupuesto | Además de lo ya definido en la spec 001, el nuevo presupuesto nace con `estado: "Borrador"`. |
| Duplicar presupuesto | El duplicado nace con `estado: "Borrador"` (no copia el estado del original, igual que ya no copia `numero` ni `fechaEmision`). |
| Cambiar estado | Actualiza `presupuesto.estado` a uno de los cuatro valores; se guarda de inmediato. No afecta a ningún cálculo (base, IVA, retención, total) ni a la numeración. |
| Cargar estado de la app | Normaliza a `"Borrador"` cualquier presupuesto sin `estado` (ver Compatibilidad arriba). |
