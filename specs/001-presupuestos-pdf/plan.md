# Implementation Plan: PresupuestosPro v0 — Presupuestos profesionales en PDF

**Branch**: `001-presupuestos-pdf` | **Date**: 2026-10-03 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-presupuestos-pdf/spec.md`

**Directrices del usuario para este plan**: simplicidad ante todo; es una v1 que debe publicarse online enseguida; debe funcionar bien en el móvil.

## Summary

Herramienta web para que un freelancer español cree presupuestos con su marca, con base, IVA 21 %, retención de IRPF (15 %/7 %, solo a empresas/autónomos) y total calculados al momento, numeración AAAA-NNN y validez de 30 días, y los descargue en PDF.

Enfoque técnico: **una web estática sin backend y sin build**. HTML + CSS + JavaScript (módulos ES nativos), datos en `localStorage` del navegador, PDF generado en el navegador con jsPDF (copiado en `vendor/`), diseño *mobile first*. Se publica arrastrando la carpeta a un hosting estático (Netlify Drop o GitHub Pages). Detalle de cada decisión en [research.md](research.md).

## Technical Context

**Language/Version**: JavaScript (ES2020, módulos ES nativos), HTML5, CSS3. Sin TypeScript ni transpilación.

**Primary Dependencies**: jsPDF 2.x + jspdf-autotable 3.x (archivos `.min.js` en `vendor/`). Ninguna otra.

**Storage**: `localStorage` del navegador, una clave con un único objeto JSON ([data-model.md](data-model.md)). Copia de seguridad como archivo JSON local.

**Testing**: `node --test` (runner integrado de Node, sin dependencias) para la lógica de cálculo, numeración, fechas y formato. Resto: validación manual con [quickstart.md](quickstart.md).

**Target Platform**: navegadores actuales en móvil (Safari iOS 15+, Chrome Android) y escritorio (Chrome, Edge, Firefox, Safari).

**Project Type**: aplicación web estática de una sola página (sin servidor).

**Performance Goals**: recálculo visiblemente inmediato al editar (SC-003); generación del PDF en ~1 s para 15 líneas.

**Constraints**: sin backend, sin cuentas, sin secretos; funciona en pantallas desde 360 px de ancho; todo en español de España y euros; logo reducido a ≤ 600 px para no agotar `localStorage`.

**Scale/Scope**: 1 usuario por navegador; decenas o cientos de presupuestos; 4 pantallas (lista, editor, catálogo, perfil).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Verificación | Estado |
|---|---|---|
| I. Simplicidad ante todo | Sin framework, sin build, sin backend, una sola dependencia (jsPDF + su plugin de tablas), un único objeto de estado, rutas por hash. Cada pieza responde a un requisito concreto. | ✅ |
| II. Idioma y mercado | Textos de UI y PDF en español de España; formateador propio para `1.500,00 €` (FR-021) y fechas `dd/mm/aaaa`; IVA fijo 21 %. | ✅ |
| III. Cero alcance fantasma | Solo lo que pide la spec y sus clarificaciones. No se añaden PWA/offline, sincronización, cuentas, envío por email, plantillas de PDF ni validación de formato del NIF. La reducción del logo no es una funcionalidad visible: es el medio técnico para que FR-001/FR-020 funcionen dentro del límite de `localStorage`. | ✅ |
| IV. Verificable por persona no técnica | Todos los criterios de éxito se comprueban en [quickstart.md](quickstart.md) usando la app y abriendo el PDF. Las pruebas automáticas son un apoyo, no sustituyen esa verificación. | ✅ |
| V. Datos del usuario con respeto | Solo se piden los datos de la spec. Nada sale del dispositivo (sin servidor ni analítica). No hay claves ni secretos. | ✅ |
| Restricción: herramienta web con PDF | Web publicada online; entregable principal es el PDF. | ✅ |
| Restricción: sin integraciones externas | Ninguna (jsPDF se sirve con la app, no es un servicio externo). | ✅ |

**Resultado (pre-Phase 0)**: PASA, sin violaciones.

**Re-check (post-Phase 1)**: el modelo de datos, los contratos y el quickstart no introducen nada fuera de la spec ni dependencias nuevas. **PASA**.

## Project Structure

### Documentation (this feature)

```text
specs/001-presupuestos-pdf/
├── plan.md              # Este archivo
├── research.md          # Phase 0: decisiones técnicas
├── data-model.md        # Phase 1: estado, entidades y reglas
├── quickstart.md        # Phase 1: guía de validación y publicación
├── contracts/
│   ├── ui.md            # Pantallas, rutas y contenido del PDF
│   └── backup-file.md   # Formato y validación de la copia de seguridad
├── checklists/
└── tasks.md             # Phase 2 (/speckit-tasks, no lo crea este comando)
```

### Source Code (repository root)

```text
index.html               # Única página: estructura, barra de navegación, carga de scripts
styles.css               # Estilos mobile first
js/
├── app.js               # Arranque, router por hash y pintado de las 4 pantallas
├── calc.js              # Lógica pura: importes, redondeo, IVA, IRPF, numeración, fechas,
│                        #   caducidad, validación de líneas/cliente, formato €/fechas
├── store.js             # Cargar/guardar estado en localStorage, copia de seguridad (exportar/validar/restaurar)
└── pdf.js               # Construcción del PDF con jsPDF
vendor/
├── jspdf.umd.min.js
└── jspdf.plugin.autotable.min.js
tests/
└── calc.test.js         # node --test
```

**Structure Decision**: proyecto único, plano, en la raíz del repositorio. La carpeta entera es lo que se publica. Solo `calc.js` se separa con cuidado (sin DOM) porque concentra las reglas de negocio que deben coincidir al céntimo y es lo que se prueba automáticamente; el resto se mantiene en el mínimo de archivos razonable.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
