# Implementation Plan: Exportar todos los presupuestos en un .zip

**Branch**: `003-exportar-zip` | **Date**: 2026-10-22 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-exportar-zip/spec.md`

## Summary

Añadir en la lista de presupuestos un botón «Exportar todo (.zip)» que descarga `presupuestospro-copia-AAAA-MM-DD.zip` con un PDF por presupuesto (`<número> - <cliente>.pdf`) y la copia de seguridad JSON ya existente. Enfoque técnico: generador de ZIP mínimo propio (método STORE, CRC-32, nombres UTF-8) como función pura en `calc.js`, sin dependencias nuevas; el PDF se obtiene del mismo código de dibujo que la descarga individual (`generarPdf` extraído en `pdf.js`) y el JSON de la misma serialización que la copia de Perfil (`textoCopia` en `store.js`). Exportación de solo lectura sobre una instantánea del estado, con progreso «Preparando presupuesto i de N…» y bloqueo de doble clic. Stack, convenciones y estructura heredados de la spec 001 ([plan.md](../001-presupuestos-pdf/plan.md)) sin cambios.

## Technical Context

**Language/Version**: igual que la spec 001 — JavaScript ES2020 con módulos ES nativos, HTML5, CSS3. Sin TypeScript ni build.

**Primary Dependencies**: ninguna nueva. jsPDF 2.x + jspdf-autotable 3.x de `vendor/` (ya presentes). El .zip se genera con código propio (ver [research.md](research.md) R1). APIs del navegador usadas: `Blob`, `URL.createObjectURL`, `TextEncoder`, `Uint8Array`/`DataView`.

**Storage**: `localStorage`, mismo objeto de estado; **sin cambios de modelo** ([data-model.md](data-model.md)). La exportación solo lee.

**Testing**: `npm test` (`node --test tests/`) para la lógica pura nueva en `calc.js`: `nombreArchivoPdf`, `crc32`, `crearZip`. Resto (botón, progreso, PDF, descarga, restauración): validación manual con [quickstart.md](quickstart.md) (Principio IV).

**Target Platform**: igual que la spec 001 — navegadores actuales de escritorio y móvil (Safari iOS 15+, Chrome Android).

**Project Type**: aplicación web estática de una sola página — sin cambios.

**Performance Goals**: indicación de progreso visible en < 1 s tras pulsar; 50 presupuestos exportados en < 1 min en un ordenador corriente (SC-006).

**Constraints**: sin backend, sin build, sin dependencias ni carpetas nuevas; todo ocurre en el navegador (nada sale del dispositivo); botón usable a 360 px; PDF del .zip idéntico al individual (FR-005); cero escrituras en el estado (FR-008).

**Scale/Scope**: hasta ~200 presupuestos por usuario; 1 botón nuevo en 1 pantalla; 3 funciones puras nuevas + 3 ayudantes por refactorización (`generarPdf`, `textoCopia`, `descargarArchivo`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Verificación | Estado |
|---|---|---|
| I. Simplicidad ante todo | ZIP sin compresión (STORE), sin ZIP64, sin Workers; reutiliza el dibujo del PDF y la serialización de la copia existentes; ninguna dependencia nueva. El generador ZIP propio es la opción más simple compatible con «sin dependencias» (ver Complexity Tracking). | ✅ |
| II. Idioma y mercado | Textos nuevos en español de España: «Exportar todo (.zip)», «Preparando presupuesto i de N…», «No hay presupuestos que exportar.», «No se ha podido crear el archivo .zip. Inténtalo de nuevo.», «Sin cliente». Importes en el PDF sin cambios (€, `1.500,00 €`). | ✅ |
| III. Cero alcance fantasma | Solo lo que pide spec.md. No se implementa: importar el .zip, Excel/CSV, copias automáticas, email/nube, compresión real, barra gráfica, cambios en el PDF individual ni en Perfil. La limitación de R3 (líneas inválidas en borradores) se documenta y no se corrige aquí. | ✅ |
| IV. Verificable por persona no técnica | SC-001…SC-008 se comprueban pulsando el botón, descomprimiendo con doble clic, abriendo PDF y usando «Restaurar copia» ([quickstart.md](quickstart.md)). | ✅ |
| V. Datos del usuario con respeto | No se pide ningún dato nuevo; nada se envía a servidores; sin claves ni secretos. | ✅ |
| Restricción: herramienta web con PDF | El PDF sigue siendo el entregable; el .zip lo agrupa sin alterarlo. | ✅ |
| Restricción: sin integraciones externas | Ninguna. | ✅ |
| CLAUDE.md: estructura plana / única dependencia | Solo se modifican `styles.css`, `js/app.js`, `js/calc.js`, `js/pdf.js`, `js/store.js`, `tests/calc.test.js`. Sin archivos de código ni carpetas nuevas. | ✅ |

**Resultado (pre-Phase 0)**: PASA, sin violaciones. Una decisión a justificar (formato binario escrito a mano) anotada en Complexity Tracking.

**Re-check (post-Phase 1)**: [data-model.md](data-model.md) confirma cero cambios en el modelo guardado; los contratos ([archivo-zip.md](contracts/archivo-zip.md), [ui.md](contracts/ui.md)) solo cubren FR-001…FR-012; [quickstart.md](quickstart.md) verifica cada SC desde la app. **PASA**.

## Project Structure

### Documentation (this feature)

```text
specs/003-exportar-zip/
├── plan.md              # Este archivo
├── research.md          # Phase 0: decisiones R1–R10
├── data-model.md        # Phase 1: sin cambios de modelo; entidades transitorias del .zip
├── quickstart.md        # Phase 1: guía de validación manual
├── contracts/
│   ├── archivo-zip.md   # Estructura del .zip y firmas de las funciones nuevas
│   └── ui.md            # Botón, progreso y avisos en la lista de presupuestos
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks, no lo crea este comando)
```

### Source Code (repository root)

Misma estructura plana de la spec 001; no se crean archivos de código ni carpetas:

```text
index.html               # Sin cambios
styles.css               # Contenedor de botones de cabecera de la lista (ajuste en varias líneas a 360 px)
                         #   y párrafo de progreso, con las variables de :root existentes
js/
├── app.js               # Botón «Exportar todo (.zip)» (también con lista vacía), exportarZip() asíncrona:
│                        #   instantánea, bucle con progreso, crearZip, descarga, avisos y bloqueo `exportando`
├── calc.js              # Puras nuevas: nombreArchivoPdf(), crc32(), crearZip()
├── pdf.js               # Extrae generarPdf() (dibujo actual íntegro); descargarPdf() la reutiliza
└── store.js             # Extrae textoCopia() y descargarArchivo(); exportarCopia() los reutiliza
tests/
└── calc.test.js         # Tests de nombreArchivoPdf, crc32 y crearZip (estructura ZIP leída en el test)
```

**Structure Decision**: aplicación web estática de una sola página con la estructura plana fijada en CLAUDE.md. La lógica binaria del ZIP y la limpieza de nombres van en `calc.js` por ser puras y testables; el DOM solo en `app.js`; la descarga de archivos se centraliza en `store.js`, donde ya vivía.

## Fase final: cierre y mantenimiento

Último paso de la implementación, una vez superada la validación de [quickstart.md](quickstart.md):

1. **Mantenimiento de `CLAUDE.md`**: actualizar `CLAUDE.md` con las decisiones de diseño y convenciones nuevas de esta feature, una línea por decisión, con referencia a la spec (p. ej. `[003] ...`). No incluir entradas por incluir: asegurarse siempre de que es información transversal y relevante para el proyecto que puedan aprovechar futuras features.

## Complexity Tracking

| Decisión | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| Generador ZIP propio (~100 líneas, formato binario) | FR-002 exige un único .zip y CLAUDE.md/constitución prohíben dependencias nuevas | Librería ZIP (JSZip/fflate): dependencia nueva prohibida. `CompressionStream`: no disponible en Safari iOS 15–16.3 y más código. Descargas sueltas: incumplen FR-002. |
| Mostrar el botón también con la lista vacía | US3/FR-009 exigen pulsarlo sin presupuestos y ver el aviso | Ocultarlo con lista vacía haría imposible verificar SC-004. |
