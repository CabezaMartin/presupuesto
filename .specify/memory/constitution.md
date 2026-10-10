<!--
Sync Impact Report
Version change: (unratified template) → 1.0.0
Modified principles: n/a (initial ratification)
Added principles:
  - I. Simplicidad ante todo
  - II. Idioma y mercado (español de España, euro)
  - III. Cero alcance fantasma
  - IV. Verificable por una persona no técnica
  - V. Datos del usuario con respeto
Added sections:
  - Restricciones del Producto (Versión 1)
  - Flujo de Trabajo y Calidad
  - Governance
Removed sections: none (template placeholders had no prior content)
Templates checked for alignment:
  - .specify/templates/ (spec/plan/tasks templates read this constitution at runtime; no
    changes required here per scope guard — recommend a manual pass to confirm they don't
    contradict Principles I–V)
Follow-up TODOs: none
-->

# PresupuestosPro Constitution

## Core Principles

### I. Simplicidad ante todo

Ante dos soluciones que resuelvan el mismo problema, se elige siempre la más simple. Esto
es una versión 1: no se añade complejidad pensando en necesidades futuras hipotéticas.
Cualquier decisión técnica o de producto debe poder justificarse con la pregunta
"¿es lo mínimo necesario para que esto funcione ahora?".

**Por qué**: la complejidad anticipada es la principal causa de retrasos y de
funcionalidades que nunca se terminan de pulir. Construir para la v1 real, no para
versiones imaginarias, mantiene el producto entregable.

### II. Idioma y mercado

Todo el producto —interfaz, textos, mensajes de error, documentos generados y
comunicaciones— se construye en español de España. La moneda de la aplicación es el
euro (€). No se contemplan otros idiomas ni monedas en esta versión.

**Por qué**: PresupuestosPro está dirigido a freelancers del mercado español; introducir
soporte multi-idioma o multi-moneda antes de tiempo es complejidad que nadie ha pedido
(ver Principio I).

### III. Cero alcance fantasma

NO se implementa ninguna funcionalidad que no esté escrita explícitamente en la
especificación (spec) de la funcionalidad en curso. Si durante el desarrollo surge una
idea nueva, una mejora o un "ya que estamos", se propone para una futura iteración; no se
construye dentro del trabajo actual.

**Por qué**: el alcance fantasma (scope creep) infla el trabajo, retrasa la entrega y
dificulta verificar qué se prometió frente a qué se construyó.

### IV. Verificable por una persona no técnica

Cada criterio de éxito de cada funcionalidad debe poder comprobarse usando la aplicación
—haciendo clic, rellenando formularios, descargando el PDF— sin necesidad de leer código,
logs ni consola. Si un criterio de éxito no se puede verificar así, debe reescribirse
hasta que se pueda.

**Por qué**: garantiza que "terminado" significa que el producto funciona de verdad para
quien lo va a usar, no solo que el código compila o pasa tests internos.

### V. Datos del usuario con respeto

Solo se pide al usuario la información imprescindible para generar el presupuesto (datos
del freelancer, del cliente y de las líneas del presupuesto). No se introducen claves,
tokens ni secretos directamente en el código fuente; deben gestionarse fuera del
repositorio (variables de entorno o mecanismo equivalente).

**Por qué**: minimizar los datos solicitados reduce el riesgo para el usuario y la carga
de mantenimiento; no versionar secretos evita fugas accidentales.

## Restricciones del Producto (Versión 1)

- El producto es una herramienta web cuyo entregable principal es un presupuesto en
  formato PDF, listo para enviar a un cliente.
- El público objetivo son freelancers que operan en España y facturan en euros.
- Cualquier integración externa (pagos, firma electrónica, envío de email, etc.) queda
  fuera de la v1 salvo que se añada explícitamente a una spec.

## Flujo de Trabajo y Calidad

- Ninguna funcionalidad se implementa sin una spec escrita que la describa (Principio III).
- Antes de dar por cerrada una funcionalidad, sus criterios de éxito se verifican
  siguiendo los pasos de la app como lo haría una persona no técnica (Principio IV).
- Las revisiones de código comprueban, como mínimo: que no se ha añadido nada fuera de la
  spec, que no hay textos fuera del español de España, y que no hay claves ni secretos
  hardcodeados.

## Governance

Esta constitución prevalece sobre cualquier otra práctica, plantilla o convención del
proyecto en caso de conflicto.

**Enmiendas**: cualquier cambio a este documento se propone explícitamente, se documenta
en este mismo archivo y se le asigna una nueva versión siguiendo versionado semántico:
- MAJOR: eliminación o redefinición incompatible de un principio existente.
- MINOR: adición de un nuevo principio o sección, o ampliación material de una existente.
- PATCH: aclaraciones, correcciones de redacción o cambios no semánticos.

**Cumplimiento**: cada spec, plan y tarea generada con Spec Kit debe poder justificarse
frente a los cinco principios anteriores. Cualquier desviación debe quedar anotada y
justificada explícitamente en el artefacto correspondiente (spec, plan o tasks), no
asumida en silencio.

**Version**: 1.0.0 | **Ratified**: 2026-09-25 | **Last Amended**: 2026-09-25
