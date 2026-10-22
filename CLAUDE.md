# PresupuestosPro

App web para que freelancers españoles creen presupuestos profesionales (base, IVA 21 %, IRPF, total) y los descarguen en PDF.

## Stack y decisiones vigentes
- Web estática de una sola página: HTML5 + CSS3 + JavaScript ES2020 con módulos ES nativos. Sin backend, sin build, sin TypeScript, sin frameworks.
- Única dependencia: jsPDF 2.x + jspdf-autotable 3.x, copiados en `vendor/` (no CDN).
- Datos: un único objeto JSON en `localStorage`; copia de seguridad como archivo JSON. Logo reducido a ≤ 600 px.
- Diseño mobile first (desde 360 px); sistema visual centralizado en variables CSS (`:root`) en `styles.css`.
- Rutas por hash (`#/`, `#/clientes`, …). Presupuesto con campo `estado` (Borrador/Enviado/Aceptado/Rechazado); los guardados sin él se tratan como Borrador.
- Estructura plana: `index.html`, `styles.css`, `js/{app,calc,store,pdf}.js`, `tests/calc.test.js`. No crear carpetas ni dependencias nuevas.

## Arranque y pruebas
- Local: servidor estático desde la raíz (`python -m http.server 8000` o `npx serve .`); abrir `index.html` con doble clic no funciona por los módulos ES.
- Tests: `npm test` (= `node --test tests/`), solo lógica pura de `js/calc.js`. El resto se valida a mano con `specs/*/quickstart.md`.

## Convenciones
- Todo en español de España (UI, PDF, errores, comentarios) y en euros; formato `1.500,00 €` y fechas `dd/mm/aaaa`.
- Lógica de negocio pura (sin DOM) en `calc.js` y con test; DOM solo en `app.js`.
- Numeración `AAAA-NNN`, validez 30 días, IVA fijo 21 %, IRPF 15 %/7 % solo a empresas/autónomos.
- Metodología Spec Kit: nada se implementa sin spec en `specs/NNN-nombre/`; cero alcance fantasma.
- Sin claves ni secretos en el código.

Las reglas de producto viven en .specify/memory/constitution.md y el estado del producto en specs/README.md

## Spec-kit

* Antes de ejecutar el flujo de `/speckit.specify`, SIEMPRE ejecuta primero el hook `before_specify` (skill `speckit-git-feature`) para crear la rama de la feature, y espera su resultado antes de crear la spec.
* Tras completar `/speckit.specify`, verifica con `git branch --show-current` que estamos en la rama `NNN-nombre-feature` y no en `master`. Si no es así, avísame antes de continuar.
* Al ejecutar `/speckit.plan`, SIEMPRE incluye en `plan.md`, como último paso de la fase final, un paso de mantenimiento: "Actualizar `CLAUDE.md` con las decisiones de diseño y convenciones nuevas de esta feature, una línea por decisión, con referencia a la spec (p. ej. '[003] ...'). No incluyas entradas por incluir, asegúrate siempre de que es información transversal y relevante para el proyecto que pueden aprovechar futuras features."