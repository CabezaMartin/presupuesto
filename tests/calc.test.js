import test from "node:test";
import assert from "node:assert/strict";
import {
  formatEuros,
  formatEurosNegativo,
  formatCantidad,
  parseDecimal,
  eurosACentimos,
  formatFecha,
  hoyISO,
  fechaValidez,
  estaCaducado,
  redondear,
  validarLinea,
  calcularTotales,
  siguienteNumero,
  puedeDescargar,
  resumenActividad,
  agruparClientes,
} from "../js/calc.js";
import { validarCopia, normalizarPresupuesto } from "../js/store.js";

// ---------- Fase 2: formato y fechas ----------

test("formatEuros formatea importes en céntimos", () => {
  assert.equal(formatEuros(150000), "1.500,00 €");
  assert.equal(formatEuros(50000), "500,00 €");
  assert.equal(formatEuros(10599), "105,99 €");
  assert.equal(formatEuros(123456789), "1.234.567,89 €");
  assert.equal(formatEuros(0), "0,00 €");
});

test("parseDecimal acepta coma o punto", () => {
  assert.equal(parseDecimal("1,5"), 1.5);
  assert.equal(parseDecimal("1.5"), 1.5);
  assert.equal(parseDecimal("33,33"), 33.33);
  assert.ok(Number.isNaN(parseDecimal("abc")));
});

test("formatFecha convierte AAAA-MM-DD a dd/mm/aaaa", () => {
  assert.equal(formatFecha("2026-10-03"), "03/10/2026");
});

test("fechaValidez suma 30 días naturales", () => {
  assert.equal(fechaValidez("2026-10-03"), "2026-11-02");
  assert.equal(fechaValidez("2026-12-15"), "2027-01-14");
});

test("estaCaducado compara con la fecha de validez", () => {
  assert.equal(estaCaducado("2026-09-01", "2026-10-01"), false);
  assert.equal(estaCaducado("2026-09-01", "2026-10-02"), true);
});

// ---------- US1: cálculos y numeración ----------

function presupuestoBase(overrides = {}) {
  return {
    cliente: { nombre: "Acme S.L.", tipo: "empresa", nif: "B1", direccion: "", email: "" },
    lineas: [],
    retencion: { activa: false, porcentaje: 15 },
    notas: "",
    ...overrides,
  };
}

test("calcularTotales: presupuesto empresa con retención 15%", () => {
  const presupuesto = presupuestoBase({
    lineas: [
      { descripcion: "Diseño de página web", cantidad: 1, precio: 150000 },
      { descripcion: "Sesión de fotos de producto", cantidad: 1, precio: 50000 },
    ],
    retencion: { activa: true, porcentaje: 15 },
  });
  const totales = calcularTotales(presupuesto);
  assert.equal(totales.base, 200000);
  assert.equal(totales.iva, 42000);
  assert.equal(totales.importeRetencion, 30000);
  assert.equal(totales.total, 212000);
});

test("calcularTotales: mismas líneas con retención 7%", () => {
  const presupuesto = presupuestoBase({
    lineas: [
      { descripcion: "Diseño de página web", cantidad: 1, precio: 150000 },
      { descripcion: "Sesión de fotos de producto", cantidad: 1, precio: 50000 },
    ],
    retencion: { activa: true, porcentaje: 7 },
  });
  const totales = calcularTotales(presupuesto);
  assert.equal(totales.importeRetencion, 14000);
  assert.equal(totales.total, 228000);
});

test("calcularTotales: retención desactivada", () => {
  const presupuesto = presupuestoBase({
    lineas: [
      { descripcion: "Diseño de página web", cantidad: 1, precio: 150000 },
      { descripcion: "Sesión de fotos de producto", cantidad: 1, precio: 50000 },
    ],
    retencion: { activa: false, porcentaje: 15 },
  });
  const totales = calcularTotales(presupuesto);
  assert.equal(totales.total, 242000);
});

test("calcularTotales: cliente particular con retención activa no la aplica", () => {
  const presupuesto = presupuestoBase({
    cliente: { nombre: "Juan Pérez", tipo: "particular", nif: "", direccion: "", email: "" },
    lineas: [
      { descripcion: "Diseño de página web", cantidad: 1, precio: 150000 },
      { descripcion: "Sesión de fotos de producto", cantidad: 1, precio: 50000 },
    ],
    retencion: { activa: true, porcentaje: 15 },
  });
  const totales = calcularTotales(presupuesto);
  assert.equal(totales.retencionAplicada, false);
  assert.equal(totales.total, 242000);
  assert.equal(totales.avisoParticular, true);
});

test("calcularTotales: redondeo con decimales (3 x 33,33)", () => {
  const presupuesto = presupuestoBase({
    lineas: [{ descripcion: "Servicio", cantidad: 3, precio: 3333 }],
    retencion: { activa: true, porcentaje: 15 },
  });
  const totales = calcularTotales(presupuesto);
  assert.equal(totales.base, 9999);
  assert.equal(totales.iva, 2100);
  assert.equal(totales.importeRetencion, 1500);
  assert.equal(totales.total, 10599);
});

test("calcularTotales: redondeo medio hacia arriba", () => {
  const presupuesto = presupuestoBase({
    lineas: [{ descripcion: "Servicio", cantidad: 1.5, precio: 3333 }],
  });
  const totales = calcularTotales(presupuesto);
  assert.equal(totales.lineas[0].importe, 5000);
});

test("calcularTotales: línea con cantidad 0 no es válida y no suma", () => {
  const presupuesto = presupuestoBase({
    lineas: [{ descripcion: "Servicio", cantidad: 0, precio: 1000 }],
  });
  const totales = calcularTotales(presupuesto);
  assert.equal(totales.lineas[0].valida, false);
  assert.equal(totales.base, 0);
});

test("validarLinea detecta errores por campo", () => {
  assert.ok(validarLinea({ descripcion: "", cantidad: 1, precio: 0 }).descripcion);
  assert.ok(validarLinea({ descripcion: "x", cantidad: 0, precio: 0 }).cantidad);
  assert.ok(validarLinea({ descripcion: "x", cantidad: 1, precio: -1 }).precio);
  assert.deepEqual(validarLinea({ descripcion: "x", cantidad: 1, precio: 0 }), {});
});

test("siguienteNumero genera AAAA-NNN sin mutar la entrada", () => {
  const original = {};
  assert.equal(siguienteNumero(original, "2026-10-03").numero, "2026-001");
  assert.deepEqual(original, {});
  assert.equal(siguienteNumero({ "2026": 1 }, "2026-10-03").numero, "2026-002");

  let contadores = {};
  const numeros = [];
  for (let i = 0; i < 10; i++) {
    const resultado = siguienteNumero(contadores, "2026-10-03");
    numeros.push(resultado.numero);
    contadores = resultado.contadores;
  }
  assert.deepEqual(
    numeros,
    Array.from({ length: 10 }, (_, i) => "2026-" + String(i + 1).padStart(3, "0"))
  );

  assert.equal(siguienteNumero({ "2026": 57 }, "2027-01-02").numero, "2027-001");
  assert.equal(siguienteNumero({ "2026": 999 }, "2026-10-03").numero, "2026-1000");
});

// ---------- US2: puedeDescargar ----------

test("puedeDescargar: perfil incompleto o ausente", () => {
  const presupuesto = presupuestoBase({ lineas: [{ descripcion: "x", cantidad: 1, precio: 100 }] });
  assert.equal(puedeDescargar(null, presupuesto).ok, false);
  assert.equal(puedeDescargar({ nombre: "Laura", nif: "" }, presupuesto).ok, false);
});

test("puedeDescargar: cliente empresa sin NIF falla", () => {
  const perfil = { nombre: "Laura", nif: "123" };
  const presupuesto = presupuestoBase({
    cliente: { nombre: "Acme", tipo: "empresa", nif: "", direccion: "", email: "" },
    lineas: [{ descripcion: "x", cantidad: 1, precio: 100 }],
  });
  assert.equal(puedeDescargar(perfil, presupuesto).ok, false);
});

test("puedeDescargar: cliente particular sin NIF es válido", () => {
  const perfil = { nombre: "Laura", nif: "123" };
  const presupuesto = presupuestoBase({
    cliente: { nombre: "Juan", tipo: "particular", nif: "", direccion: "", email: "" },
    lineas: [{ descripcion: "x", cantidad: 1, precio: 100 }],
  });
  assert.equal(puedeDescargar(perfil, presupuesto).ok, true);
});

test("puedeDescargar: sin líneas o con líneas inválidas falla", () => {
  const perfil = { nombre: "Laura", nif: "123" };
  const sinLineas = presupuestoBase({ lineas: [] });
  assert.equal(puedeDescargar(perfil, sinLineas).ok, false);

  const conLineaInvalida = presupuestoBase({ lineas: [{ descripcion: "x", cantidad: 0, precio: 100 }] });
  assert.equal(puedeDescargar(perfil, conLineaInvalida).ok, false);
});

// ---------- US5: copia de seguridad ----------

test("validarCopia acepta el formato de ejemplo del contrato", () => {
  const copia = {
    app: "presupuestospro",
    version: 1,
    perfil: { nombre: "Laura", nif: "123" },
    catalogo: [],
    presupuestos: [],
    contadores: { "2026": 1 },
  };
  assert.deepEqual(validarCopia(JSON.stringify(copia)), copia);
});

test("validarCopia rechaza texto no JSON", () => {
  assert.equal(validarCopia("esto no es json"), null);
});

test("validarCopia rechaza app distinto", () => {
  const copia = { app: "otra-app", version: 1, catalogo: [], presupuestos: [], contadores: {}, perfil: null };
  assert.equal(validarCopia(JSON.stringify(copia)), null);
});

test("validarCopia rechaza version distinta", () => {
  const copia = { app: "presupuestospro", version: 2, catalogo: [], presupuestos: [], contadores: {}, perfil: null };
  assert.equal(validarCopia(JSON.stringify(copia)), null);
});

test("validarCopia rechaza presupuestos que no son array", () => {
  const copia = { app: "presupuestospro", version: 1, catalogo: [], presupuestos: {}, contadores: {}, perfil: null };
  assert.equal(validarCopia(JSON.stringify(copia)), null);
});

// ---------- 002: resumen de actividad, clientes, estado ----------

function presupuestoConEstado(fechaEmision, estadoPresupuesto, nombreCliente, nif) {
  return {
    fechaEmision,
    estado: estadoPresupuesto,
    numero: fechaEmision.slice(0, 4) + "-001",
    cliente: { nombre: nombreCliente, tipo: "empresa", nif: nif ?? "", direccion: "", email: "" },
  };
}

test("resumenActividad cuenta por estado y los caducados por separado", () => {
  const hoy = "2026-10-10";
  const presupuestos = [
    presupuestoConEstado("2026-10-01", "Borrador", "Acme"),
    presupuestoConEstado("2026-10-01", "Enviado", "Acme"),
    presupuestoConEstado("2026-01-01", "Aceptado", "Acme"), // caducado (> 30 días)
    presupuestoConEstado("2026-01-01", "Rechazado", "Acme"), // caducado
  ];
  const resumen = resumenActividad(presupuestos, hoy);
  assert.equal(resumen.total, 4);
  assert.deepEqual(resumen.porEstado, { Borrador: 1, Enviado: 1, Aceptado: 1, Rechazado: 1 });
  assert.equal(resumen.caducados, 2);
});

test("resumenActividad trata un presupuesto sin estado como Borrador", () => {
  const resumen = resumenActividad([{ fechaEmision: "2026-10-01", cliente: {} }], "2026-10-10");
  assert.equal(resumen.porEstado.Borrador, 1);
});

test("agruparClientes agrupa por nombre y tipo, sin duplicar", () => {
  const presupuestos = [
    presupuestoConEstado("2026-01-01", "Borrador", "Acme S.L.", ""),
    presupuestoConEstado("2026-02-01", "Borrador", "  acme s.l. ", "B12345678"),
    presupuestoConEstado("2026-03-01", "Borrador", "Otro Cliente", "X1"),
  ];
  const clientes = agruparClientes(presupuestos);
  assert.equal(clientes.length, 2);
  const acme = clientes.find((c) => c.nombre.trim().toLowerCase() === "acme s.l.");
  assert.equal(acme.numPresupuestos, 2);
  assert.equal(acme.nif, "B12345678");
});

test("agruparClientes devuelve nif vacío si ningún presupuesto del grupo lo tiene", () => {
  const presupuestos = [presupuestoConEstado("2026-01-01", "Borrador", "Particular", "")];
  const clientes = agruparClientes(presupuestos);
  assert.equal(clientes[0].nif, "");
});

test("normalizarPresupuesto conserva el estado si ya existe y lo pone a Borrador si falta", () => {
  assert.equal(normalizarPresupuesto({ id: "1", estado: "Enviado" }).estado, "Enviado");
  assert.equal(normalizarPresupuesto({ id: "2" }).estado, "Borrador");
});
