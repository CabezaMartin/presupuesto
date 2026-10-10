# Quickstart: validar la página de inicio y el rediseño visual

Guía para comprobar, como lo haría una persona no técnica (Principio IV), que esta funcionalidad cumple spec.md sin romper nada de la spec 001.

## Requisitos previos

- Los mismos que la spec 001: un navegador actual, servido con un servidor estático local (los módulos ES no funcionan con doble clic). Ver [quickstart.md de la spec 001](../001-presupuestos-pdf/quickstart.md) para cómo arrancarlo y publicarlo.
- Tener ya datos de la spec 001 (perfil, catálogo, algún presupuesto) ayuda a probar el resumen y la lista de Clientes con contenido real.

## Pruebas automáticas (lógica nueva)

```bash
node --test tests/
```

Resultado esperado: además de las pruebas ya existentes de la spec 001, pasan las nuevas de `resumenActividad`, `agruparClientes` y la normalización de `estado` al cargar.

## Escenarios de validación

Marcar cada uno como ✅/❌.

### 1. Página de inicio (US1)

1. Abrir la URL raíz de la aplicación (sin ningún hash) → aparece **Inicio**, no la lista de presupuestos.
2. Sin presupuestos todavía → el resumen está en cero y hay una invitación a crear el primero.
3. Con varios presupuestos en distintos estados → el resumen muestra el total y cuántos hay en cada estado (Borrador, Enviado, Aceptado, Rechazado) y cuántos caducados.
4. Tocar cada acceso directo (Presupuestos, Clientes, Catálogo, Perfil) → abre esa sección.

### 2. Navegación común (US2)

1. Desde el editor de un presupuesto, desde Clientes, desde Catálogo y desde Perfil, comprobar que la misma barra de navegación (Inicio · Presupuestos · Clientes · Catálogo · Perfil) está siempre visible y marca la sección activa.
2. Recorrer las cinco secciones sin usar el botón "atrás" del navegador en ningún momento.

### 3. Marcar y cambiar el estado (US3)

1. Crear un presupuesto nuevo → su estado es **Borrador**.
2. Cambiarlo a **Enviado** desde el editor → se guarda solo (sin botón "Guardar"); recargar la página → sigue en Enviado.
3. Cambiarlo a **Aceptado** y después a **Borrador** otra vez → la aplicación lo permite sin pedir confirmación ni bloquear nada.
4. Si hay datos de la spec 001 ya guardados antes de esta funcionalidad (sin campo de estado), abrirlos → aparecen como **Borrador**.

### 4. Apariencia visual y estados (US4)

1. Recorrer las cinco secciones → misma tipografía, misma paleta de colores y mismo espaciado en todas.
2. En un presupuesto con desglose (base, IVA, retención, total) → el total se distingue claramente del resto.
3. En la lista de presupuestos, con presupuestos en los 4 estados → cada uno muestra una etiqueta de color distinto.
4. Un presupuesto caducado y, por ejemplo, Aceptado a la vez → se ven ambas etiquetas (Caducado y Aceptado) sin confundirse.

### 5. PDF con la misma imagen (US5)

1. Descargar el PDF de un presupuesto de ejemplo → usa la misma paleta y tipografía que la app.
2. Comprobar que siguen apareciendo todos los datos de la spec 001 (logo, freelancer, cliente, tabla, desglose, notas) con los mismos importes que en pantalla.
3. Comprobar que el PDF no muestra ni "Caducado" ni el estado del presupuesto.

### 6. Ver mis clientes (US6)

1. Crear presupuestos para dos clientes distintos y un tercer presupuesto repitiendo uno de ellos → en **Clientes** aparecen 2 filas (no 3), y la del cliente repetido indica 2 presupuestos.
2. Sin ningún presupuesto todavía → Clientes muestra "Todavía no tienes clientes", sin error.
3. No hay ninguna opción de editar, crear ni borrar un cliente desde esta pantalla.

### 7. Móvil a 360 px (spec 001, ampliado)

1. Con las herramientas de desarrollo del navegador a 360 px de ancho, comprobar que la navegación de 5 accesos y la página de Inicio no producen scroll horizontal ni elementos solapados.
