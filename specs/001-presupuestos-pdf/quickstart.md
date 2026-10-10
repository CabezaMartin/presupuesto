# Quickstart: validar PresupuestosPro v0

Guía para arrancar la app y comprobar, como lo haría una persona no técnica (Principio IV), que la funcionalidad cumple la spec.

## Requisitos previos

- Un navegador actual (Chrome, Safari, Edge o Firefox) en el ordenador **y** en un móvil.
- Para ejecutarla en local: cualquier servidor estático (los módulos ES no funcionan abriendo `index.html` con doble clic). Por ejemplo, `python -m http.server 8000` o `npx serve .` desde la raíz del proyecto.
- Opcional, para las pruebas automáticas: Node.js 20 o superior.

## Pruebas automáticas (lógica de cálculo)

```bash
node --test tests/
```

Resultado esperado: todas las pruebas pasan (casos de referencia, redondeo, numeración, validez, formato de importes).

## Publicar online

1. Entrar en https://app.netlify.com/drop.
2. Arrastrar la carpeta del proyecto (la que contiene `index.html`).
3. Abrir la URL que se obtiene, en el ordenador y en el móvil.

## Escenarios de validación (en la URL publicada, mejor en el móvil)

Marcar cada uno como ✅/❌.

### 1. Perfil (US3)
1. Ir a **Perfil**, pulsar Guardar con el nombre vacío → se indica que falta el nombre y no se guarda.
2. Intentar subir un `.gif` o un `.pdf` como logo → se rechaza con un mensaje claro.
3. Rellenar nombre, NIF, email, teléfono, dirección y subir un logo PNG → Guardar. Recargar la página → todo sigue ahí.

### 2. Catálogo (US4)
1. Crear "Diseño de página web" a 1500 y "Sesión de fotos de producto" a 500 → aparecen como 1.500,00 € y 500,00 €.

### 3. Cálculos (US1, SC-002, SC-003)
1. **Nuevo presupuesto** → número `2026-001` (año en curso), fecha de hoy y "Válido hasta" = hoy + 30 días.
2. Cliente empresa/autónomo "Acme S.L.", NIF "B12345678". Añadir las dos líneas desde el catálogo. Activar retención (propone 15 %) → Base **2.000,00 €**, IVA **420,00 €**, Retención **−300,00 €**, Total **2.120,00 €**.
3. Cambiar a 7 % → Retención −140,00 €, Total **2.280,00 €**, sin pulsar ningún botón.
4. Desactivar la retención → Total **2.420,00 €**.
5. Volver a activarla y cambiar el cliente a particular → sin retención, Total **2.420,00 €** y aviso de que a los particulares no se les aplica.
6. En otro presupuesto, una línea a mano: cantidad `3`, precio `33,33` (con coma) → Base 99,99 €, IVA 21,00 €; con empresa y 15 %: Retención −15,00 €, Total **105,99 €**.
7. Poner cantidad `0` en una línea → se marca en rojo y no suma.

### 4. PDF (US2, SC-007)
1. Con el presupuesto del paso 3.2 (15 %), **Descargar PDF** → se descarga `Presupuesto-2026-001.pdf`. Al abrirlo: título PRESUPUESTO, logo, datos del freelancer y del cliente, número, fechas, tabla y los mismos importes que en pantalla. Los acentos, la ñ y el € se ven bien.
2. Escribir "Pago: 50 % al aceptar, 50 % a la entrega" en Notas → aparece al pie del PDF. Vaciar el campo → el PDF ya no tiene sección de notas.
3. Cliente particular → el PDF no tiene fila de retención.
4. Presupuesto sin líneas → no descarga y avisa de que hace falta al menos una línea.
5. Quitar el logo del perfil → el PDF se genera sin logo.
6. Presupuesto con 15 líneas → el PDF cabe en una página A4.
7. Repetir la descarga **en el móvil** (iPhone/Safari y Android/Chrome) → el PDF se descarga o se abre y se puede compartir por email.

### 5. Lista, duplicar, eliminar, persistencia (US5, SC-004, SC-005)
1. La lista muestra número, cliente, fecha y total, el más reciente primero.
2. Crear presupuestos hasta tener 2026-003; eliminar el 2026-003 (pide confirmación) y crear uno nuevo → recibe **2026-004**.
3. **Duplicar** el 2026-001 → nuevo número, fecha de hoy, mismo cliente, líneas, retención y notas; el 2026-001 no cambia.
4. Reabrir un presupuesto, cambiar una línea, descargar el PDF → refleja el cambio y mantiene número y fecha.
5. Cerrar el navegador y volver a abrir la URL → todo sigue igual.

### 6. Copia de seguridad (FR-020a/b)
1. En Perfil, **Descargar copia de seguridad** → se descarga `presupuestospro-copia-AAAA-MM-DD.json`.
2. Abrir la app en otro navegador o dispositivo (vacía) → **Restaurar copia** con ese archivo → pide confirmación → perfil, catálogo y presupuestos aparecen. Crear un presupuesto nuevo → continúa la numeración.
3. Intentar restaurar un archivo cualquiera (p. ej. una foto) → mensaje de copia no válida y los datos no cambian.

### 7. Caducado (FR-019b)
Verificable en la prueba automática de fechas. Manualmente: restaurar una copia con un presupuesto de `fechaEmision` antigua (p. ej. `2026-09-01`) → aparece "Caducado" en la lista y en el editor, se puede editar y descargar, y el PDF muestra sus fechas originales sin la marca.

### 8. Tiempo (SC-001)
Con perfil y catálogo configurados, cronometrar: crear un presupuesto de 3 líneas y descargar el PDF desde el móvil → **menos de 5 minutos**.
