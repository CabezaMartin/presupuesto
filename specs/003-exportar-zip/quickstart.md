# Quickstart: validar «Exportar todo (.zip)»

**Feature**: `003-exportar-zip` | Detalles en [contracts/archivo-zip.md](contracts/archivo-zip.md) y [contracts/ui.md](contracts/ui.md).

## Requisitos previos

- Servidor estático desde la raíz del proyecto: `python -m http.server 8000` (o `npx serve .`) y abrir `http://localhost:8000`.
- Tests de lógica pura: `npm test` → todos en verde (incluye `nombreArchivoPdf`, `crc32` y `crearZip`).
- Un descompresor: el explorador del sistema (doble clic) basta.

## Datos de prueba

En **Perfil**: nombre «Laura Gómez Diseño», NIF «12345678Z», con logo. Crear estos presupuestos:

| # | Cliente | Tipo | Líneas | Total esperado |
|---|---|---|---|---|
| A (control) | Estudio García (NIF B12345678) | Empresa/autónomo, IRPF 15 % | 1 × 2.500,00 € + 3 × 300,00 € | Base 3.400,00 · IVA 714,00 · IRPF −510,00 · **3.604,00 €** |
| B | `Diseño/Web S.L.` (NIF B87654321) | Empresa, sin IRPF | 1 × 100,00 € | 121,00 € |
| C | *(vacío)* — dejar como Borrador | Particular | ninguna | 0,00 € |

Cambiar el estado de A a «Aceptado» y el de B a «Enviado». Anotar el número que tendría el siguiente presupuesto (p. ej. `2026-004`).

## Escenarios

### 1. Descarga única (SC-001, SC-002 · US1)
1. Ir a **Presupuestos** y pulsar **Exportar todo (.zip)**.
2. ✅ Se descarga un solo archivo `presupuestospro-copia-<fecha de hoy>.zip`.
3. Descomprimirlo con doble clic. ✅ Hay exactamente 4 archivos y ninguna carpeta: 3 PDF + `presupuestospro-copia-<fecha de hoy>.json`.

### 2. Nombres de archivo (SC-005 · FR-006)
✅ Los PDF se llaman `<A> - Estudio García.pdf`, `<B> - Diseño-Web S.L.pdf` y `<C> - Sin cliente.pdf`, con la tilde y la «ñ» bien escritas; los tres se abren sin errores.

### 3. PDF idénticos (SC-003 · US2)
1. En la lista, pulsar **Descargar PDF** en A y en B.
2. Comparar cada uno con su PDF del .zip. ✅ Mismo logo, datos del freelancer y del cliente, número, fechas, líneas, desglose y total. ✅ El de A muestra **3.604,00 €**.

### 4. Solo lectura (SC-007 · FR-008)
✅ Tras exportar, la lista, los estados (A Aceptado, B Enviado, C Borrador), el catálogo y el perfil son iguales; al crear un presupuesto nuevo recibe el número anotado (`2026-004`). Eliminar después ese presupuesto de prueba.

### 5. Restaurar el archivo de datos (SC-008)
1. En **Perfil → Restaurar copia**, elegir el `.json` extraído del .zip y confirmar.
2. ✅ No aparece ningún error y la app muestra los mismos presupuestos, estados, catálogo y perfil.

### 6. Sin presupuestos (SC-004 · US3)
1. En una ventana privada (sin datos), ir a **Presupuestos**. ✅ El botón **Exportar todo (.zip)** está visible.
2. Pulsarlo. ✅ Aviso «No hay presupuestos que exportar.» y no se descarga nada.

### 7. Progreso con muchos presupuestos (SC-006 · US4)
1. Llegar a 50+ presupuestos (p. ej. pulsando **Duplicar** repetidamente sobre A).
2. Pulsar **Exportar todo (.zip)**. ✅ En menos de 1 s aparece «Preparando presupuesto i de N…» y el botón queda desactivado (un segundo clic no hace nada).
3. ✅ En menos de 1 minuto se descarga un único .zip con N PDF + 1 JSON; el mensaje desaparece y el botón vuelve a estar activo.

### 8. Pantalla estrecha (FR-001)
Con la vista móvil del navegador a 360 px de ancho: ✅ el botón se ve entero junto a «Nuevo presupuesto» sin desplazamiento horizontal.
