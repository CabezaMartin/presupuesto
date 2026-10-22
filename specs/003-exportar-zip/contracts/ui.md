# Contract: interfaz — botón «Exportar todo (.zip)»

**Requisitos**: FR-001, FR-009, FR-010, FR-011, FR-012

## Pantalla `#/presupuestos` (lista)

- Cabecera de la lista: `Nuevo presupuesto` y, a su lado, **`Exportar todo (.zip)`** (botón de estilo `secundario`). A 360 px ambos son visibles sin desplazamiento horizontal (se colocan en varias líneas si no caben).
- El botón aparece **siempre**, también con la lista vacía (junto a «Todavía no tienes presupuestos»).
- Debajo de los botones, un párrafo de estado (`role="status"`, oculto si no hay exportación en curso).

## Comportamiento

| Situación | Lo que ve el usuario |
|---|---|
| Clic con 0 presupuestos | Aviso (franja `#aviso` existente): **«No hay presupuestos que exportar.»** Ninguna descarga. |
| Clic con N ≥ 1 | El botón se desactiva al instante; el párrafo de estado muestra **«Preparando presupuesto i de N…»** y avanza hasta N. |
| Fin correcto | Se descarga `presupuestospro-copia-AAAA-MM-DD.zip`; el párrafo de estado desaparece y el botón vuelve a estar activo. |
| Error durante la preparación | Aviso **«No se ha podido crear el archivo .zip. Inténtalo de nuevo.»**; ninguna descarga; el párrafo de estado desaparece y el botón vuelve a estar activo. |
| Usuario sale de la lista y vuelve durante la exportación | El botón sigue desactivado hasta que la exportación termine. |

## Sin cambios

- Botones por presupuesto (`Descargar PDF`, `Duplicar`, `Eliminar`), Inicio, Perfil (`Descargar copia de seguridad`, `Restaurar copia`) y el PDF individual (nombre `Presupuesto-<número>.pdf`).
- Ningún dato guardado cambia al exportar.
