# Implementation Plan: Página de inicio y rediseño visual profesional

**Branch**: `002-home-rediseno-visual` | **Date**: 2026-10-10 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-home-rediseno-visual/spec.md`

**Directrices del usuario para este plan**: solo cambia la capa de presentación de la aplicación ya implementada (spec 001); reutilizar su stack, convenciones y estructura sin repetirlas ni cambiarlas; limitar el código a los archivos reales ya existentes (`index.html`, `styles.css`, `js/app.js`, `js/store.js`, `js/pdf.js`), sin dependencias ni carpetas nuevas; centralizar el sistema visual en variables CSS (`:root`) dentro de `styles.css`.

## Summary

Añadir una página de inicio (ruta raíz) con resumen de actividad y accesos directos a las secciones; unificar la navegación visible en todas las pantallas; añadir una sección "Clientes" de solo lectura derivada de los presupuestos existentes; introducir un campo aditivo `estado` (Borrador/Enviado/Aceptado/Rechazado) en el presupuesto, editable libremente desde el editor; y rediseñar la apariencia visual de toda la app y de la plantilla del PDF con una paleta y tipografía centralizadas en variables CSS. Sin backend, sin build y sin dependencias nuevas: se reutiliza íntegro el stack de la spec 001 ([specs/001-presupuestos-pdf/plan.md](../001-presupuestos-pdf/plan.md)).

## Technical Context

**Language/Version**: igual que la spec 001 — JavaScript (ES2020, módulos ES nativos), HTML5, CSS3. Sin TypeScript ni transpilación.

**Primary Dependencies**: ninguna nueva. Se reutilizan jsPDF 2.x + jspdf-autotable 3.x ya presentes en `vendor/`.

**Storage**: `localStorage`, el mismo objeto de estado de la spec 001 ([data-model.md](../001-presupuestos-pdf/data-model.md)), con un único campo aditivo nuevo: `Presupuesto.estado`.

**Testing**: `node --test` para la lógica pura nueva (valor por defecto de `estado`, trato de presupuestos antiguos sin ese campo, agrupación de clientes y resumen por estado). Resto: validación manual con [quickstart.md](quickstart.md) (Principio IV).

**Target Platform**: igual que la spec 001 — navegadores actuales en móvil (Safari iOS 15+, Chrome Android) y escritorio.

**Project Type**: aplicación web estática de una sola página (sin servidor) — sin cambios.

**Performance Goals**: sin cambios respecto a la spec 001; el rediseño no debe introducir percepción de lentitud (el recálculo de totales sigue siendo inmediato, SC-003 de la spec 001).

**Constraints**: sin backend, sin build, sin dependencias ni carpetas nuevas (nada de `public/` ni `src/`); pantallas utilizables desde 360 px de ancho, incluida la navegación ahora con cinco accesos; el campo `estado` no debe romper presupuestos guardados antes de esta funcionalidad.

**Scale/Scope**: las 4 pantallas de la spec 001 pasan a 6 (se añaden Inicio y Clientes); sigue habiendo un único objeto de estado en `localStorage` para 1 usuario por navegador.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Verificación | Estado |
|---|---|---|
| I. Simplicidad ante todo | Mismo stack, sin librerías de estilos ni frameworks; un único campo de datos nuevo (`estado`), justificado por decisión explícita del usuario (ver Complexity Tracking); la agrupación de clientes y el resumen se calculan al vuelo, sin nuevas estructuras de almacenamiento. | ✅ |
| II. Idioma y mercado | Todos los textos nuevos (Inicio, Clientes, nombres de estado, resumen) en español de España; sin cambios de moneda ni formato. | ✅ |
| III. Cero alcance fantasma | Alcance limitado a lo resuelto en spec.md: página de inicio, navegación común, sección Clientes de solo lectura, campo `estado` con cambio libre (sin flujo obligatorio, sin historial de cambios, sin notificaciones), rediseño visual y del PDF. Nada más. | ✅ |
| IV. Verificable por persona no técnica | Todos los criterios de éxito (SC-001…SC-007) se comprueban usando la app: tocar los accesos de inicio, leer el resumen, cambiar el estado de un presupuesto, mirar la lista y el PDF. | ✅ |
| V. Datos del usuario con respeto | El campo nuevo se rellena eligiendo una opción de una lista cerrada (no se pide ningún dato adicional al usuario); sin claves ni secretos; nada sale del dispositivo. | ✅ |
| Restricción: herramienta web con PDF | El PDF sigue siendo el entregable principal, ahora con la misma imagen visual que la app; su contenido y datos no cambian (spec 001). | ✅ |
| Restricción: sin integraciones externas | Ninguna nueva. | ✅ |

**Resultado (pre-Phase 0)**: PASA. Única extensión: el campo `estado` (justificado abajo, en Complexity Tracking).

**Re-check (post-Phase 1)**: el modelo de datos extendido, los contratos y el quickstart no introducen nada fuera de spec.md ni dependencias nuevas. **PASA**.

## Project Structure

### Documentation (this feature)

```text
specs/002-home-rediseno-visual/
├── plan.md              # Este archivo
├── research.md          # Phase 0: decisiones de diseño visual y de datos
├── data-model.md        # Phase 1: extensión del estado (campo `estado`) y vistas derivadas
├── quickstart.md        # Phase 1: guía de validación manual
├── contracts/
│   └── ui.md            # Pantallas nuevas/ampliadas y contrato visual del PDF
├── checklists/
└── tasks.md             # Phase 2 (/speckit-tasks, no lo crea este comando)
```

### Source Code (repository root)

Se reutiliza, sin añadir carpetas, la misma estructura plana de la spec 001:

```text
index.html               # Añade la ruta de inicio (#/) y el enlace "Clientes" en la navegación
styles.css                # Variables CSS (:root): color, tipografía, espaciado — base de todo el rediseño;
                          #   estilos de Inicio, navegación (5 accesos), etiquetas de estado y Clientes
js/
├── app.js                # Vista de Inicio (resumen + accesos), router ampliado (#/ , #/clientes),
│                         #   selector de estado en el editor, vista Clientes (derivada, solo lectura)
├── calc.js                # Funciones puras nuevas: agrupar clientes por nombre+tipo y calcular
│                         #   el resumen de presupuestos por estado/caducidad (sin DOM, testable)
├── store.js                # estadoInicial()/cargar(): valor por defecto `estado: "Borrador"` y
│                         #   compatibilidad con presupuestos guardados sin este campo
└── pdf.js                # Aplica la paleta y tipografía del rediseño; no cambia contenido ni datos
vendor/                   # Sin cambios
tests/
└── calc.test.js          # Pruebas nuevas: resumen por estado, migración de presupuestos antiguos,
                          #   agrupación de clientes
```

**Structure Decision**: se extiende el mismo proyecto plano de la spec 001; no se crea ninguna carpeta nueva (ni `public/`, ni `src/`), ni se añade ninguna dependencia. Todo el código de producción sigue viviendo en los mismos cuatro módulos de `js/` más `index.html` y `styles.css`.

## Complexity Tracking

> Fill ONLY if Constitution Check has violations that must be justified

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Nuevo campo de datos `Presupuesto.estado` (la spec 001 no lo tenía; Principio I pide el mínimo necesario) | El usuario pidió explícitamente estados visuales Borrador/Enviado/Aceptado/Rechazado y, al plantearle el conflicto con "no tocar datos", eligió (opción A) añadir el campo en vez de limitarse a lo ya existente | Limitarse a "Caducado" (ya existente, sin cambios de datos) no habría cumplido el requisito explícito de los 4 estados que el usuario confirmó querer (spec.md, Clarifications y FR-009/FR-010) |
