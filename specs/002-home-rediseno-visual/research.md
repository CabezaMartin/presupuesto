# Research: Página de inicio y rediseño visual profesional

**Feature**: `002-home-rediseno-visual` | **Date**: 2026-10-10

Guía de las decisiones: reutilizar el stack de la spec 001 sin dependencias nuevas, simplicidad (Principio I) y que el campo de datos añadido (`estado`) sea el único cambio de esquema.

## R1. Sistema visual centralizado

- **Decision**: todas las variables de diseño (colores, tipografía, espaciado, radios, sombras) se definen como *custom properties* CSS en `:root` al principio de `styles.css` (p. ej. `--color-primario`, `--color-texto`, `--color-fondo`, `--color-borde`, `--fuente-base`, `--espaciado-s/m/l`, `--radio-tarjeta`). El resto de `styles.css` y cualquier color usado en `js/pdf.js` leen esos mismos valores (en el PDF, como constantes JS con los mismos valores RGB/hex, ya que jsPDF no puede leer CSS).
- **Rationale**: es el único mecanismo pedido explícitamente ("paleta... definida en un único lugar") y no requiere ninguna dependencia (ni preprocesador CSS, ni sistema de theming).
- **Alternatives considered**: variables Sass/Less (añadiría un paso de build, prohibido por la spec 001). Librería de componentes/CSS (Bootstrap, Tailwind): dependencia nueva, prohibida por el plan de esta feature.

## R2. Paleta y tipografía concretas

- **Decision**: paleta sobria de un color primario (azul corporativo oscuro, ya usado parcialmente en la spec 001: `#2563eb` se mantiene como acento), un gris oscuro para texto, un gris claro para fondos/bordes, y un color por estado (ver R8). Tipografía: se mantiene la fuente del sistema (`-apple-system, "Segoe UI", Roboto...`) ya usada en la spec 001 para no añadir una fuente web (sin dependencia nueva, sin coste de carga).
- **Rationale**: cumple "profesional y sobria" sin añadir una fuente externa ni una librería de iconos.

## R3. Página de inicio y resumen de actividad

- **Decision**: la ruta raíz (`#/` o ausencia de hash) pinta una vista nueva "Inicio" en `js/app.js`, distinta de la lista de Presupuestos. El resumen (total de presupuestos, número por cada estado, número de caducados) se calcula **al vuelo** a partir de `estado.presupuestos` cada vez que se entra en Inicio, usando una función pura nueva en `js/calc.js` (p. ej. `resumenActividad(presupuestos, hoy)`), sin guardar ningún agregado en `localStorage`.
- **Rationale**: evita desincronización entre el resumen y los datos reales (Principio I: lo mínimo necesario); el volumen de datos (decenas/cientos de presupuestos) hace trivial recalcularlo cada vez.

## R4. Sección "Clientes" (solo lectura)

- **Decision**: una función pura nueva en `js/calc.js` (p. ej. `agruparClientes(presupuestos)`) recorre `presupuestos[].cliente` y agrupa por `nombre.trim().toLowerCase()` + `tipo`; cada grupo expone `nombre`, `tipo`, el `nif` del presupuesto más reciente que lo tenga (puede variar entre presupuestos del mismo cliente; se muestra el último informado) y el número de presupuestos asociados. La vista `#/clientes` en `js/app.js` solo pinta esta lista; no hay formulario de alta ni edición.
- **Rationale**: cumple FR-012 sin crear una entidad ni un almacén nuevo; la clave de agrupación por nombre+tipo es la más simple que evita juntar una "Empresa SL" particular con una empresa homónima por error de tipo, y resuelve el edge case de nombres repetidos ya documentado en spec.md.

## R5. Campo `estado` del presupuesto

- **Decision**: se añade `estado: "Borrador" | "Enviado" | "Aceptado" | "Rechazado"` al objeto Presupuesto (spec 001, [data-model.md](../001-presupuestos-pdf/data-model.md)). `crearPresupuesto()` en `js/app.js` lo inicializa a `"Borrador"`. En `js/store.js`, `cargar()` normaliza cualquier presupuesto sin este campo (datos guardados antes de esta funcionalidad, o restaurados desde una copia de seguridad de la spec 001) asignándole `"Borrador"` al leerlo, sin reescribir nada hasta el siguiente cambio real del usuario. El editor añade un `<select>` para cambiarlo libremente (sin validar transición, según spec.md Assumptions).
- **Rationale**: es el cambio mínimo aditivo que pidió el usuario (opción A); normalizar al cargar (no al guardar) evita tocar datos que el usuario no ha abierto todavía, y mantiene compatible el formato de copia de seguridad: una copia antigua restaurada sigue siendo válida y simplemente se normaliza al leer.

## R6. "Caducado" sigue siendo independiente

- **Decision**: no se toca `estaCaducado()` ni `fechaValidez()` de `js/calc.js` (spec 001). La etiqueta "Caducado" se sigue mostrando junto a (no en vez de) la etiqueta de `estado`.
- **Rationale**: FR-011 y el edge case de spec.md son explícitos: un presupuesto puede estar, por ejemplo, "Aceptado" y "Caducado" a la vez.

## R7. Navegación común con cinco accesos

- **Decision**: la barra de navegación de `index.html` (spec 001: Presupuestos · Catálogo · Perfil) se amplía a Inicio · Presupuestos · Clientes · Catálogo · Perfil. Se mantiene fija abajo en móvil (ya definida en la spec 001); con cinco elementos a 360 px de ancho, cada uno dispone de ~72 px, suficiente para un texto corto o un icono + texto corto sin desbordar (se valida en quickstart.md).
- **Rationale**: cumple FR-004/FR-013 reutilizando el mismo patrón ya probado en la spec 001, sin rediseñar la navegación como menú lateral o superior (más simple, Principio I).

## R8. Color por estado

- **Decision**: cuatro clases CSS (`.estado-borrador`, `.estado-enviado`, `.estado-aceptado`, `.estado-rechazado`), cada una leyendo un color distinto de las variables de R1 (p. ej. gris para Borrador, azul para Enviado, verde para Aceptado, rojo para Rechazado), aplicadas como una etiqueta/"badge" junto al número del presupuesto. "Caducado" conserva su propio estilo ya existente (`.etiqueta-caducado`, fondo rojo claro) para no confundirse visualmente con "Rechazado".
- **Rationale**: son solo 4+1 combinaciones fijas; no hace falta generar colores dinámicamente ni un sistema de theming.

## R9. Rediseño del PDF sin plantilla HTML

- **Decision**: `js/pdf.js` (spec 001) no usa una plantilla HTML — construye el PDF con llamadas directas a jsPDF/autotable. El rediseño visual se aplica cambiando los valores que ya recibe esa API: `doc.setTextColor(...)`, `doc.setFillColor(...)` (cabecera de la tabla, ya usado en spec 001), tamaños de fuente y espaciados, usando las mismas constantes de color que `styles.css` (duplicadas como constantes JS al principio de `pdf.js`, ya que jsPDF no puede leer CSS). No se añade ninguna librería de plantillas ni de maquetado HTML-a-PDF.
- **Rationale**: respeta la restricción explícita del usuario (sin `src/services/plantillas/`, sin dependencias nuevas) y el enfoque ya validado en la spec 001 (R3 de su research.md).

## R10. Pruebas

- **Decision**: automáticas (`tests/calc.test.js`) para las funciones puras nuevas: `resumenActividad`, `agruparClientes`, y la normalización de `estado` al cargar (`js/store.js`). Manuales (quickstart.md) para la navegación, la página de inicio, el cambio de estado desde el editor, el aspecto visual y el PDF.
- **Alternatives considered**: pruebas visuales automatizadas (snapshot/Percy): dependencia nueva, fuera de alcance para una v1 de solo presentación.

## Sin aclaraciones pendientes

Las dos ambigüedades de alcance (sección Clientes, campo de estado) se resolvieron con el usuario el 2026-10-10 y están documentadas en spec.md (Clarifications). No queda ningún NEEDS CLARIFICATION.
