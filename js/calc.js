// Lógica pura: formato, fechas, cálculos. Sin DOM ni localStorage.

export function formatEuros(centimos) {
  const negativo = centimos < 0;
  const absCentimos = Math.abs(centimos);
  const enteros = Math.floor(absCentimos / 100);
  const decimales = absCentimos % 100;
  const enterosTexto = String(enteros).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const decimalesTexto = String(decimales).padStart(2, "0");
  return (negativo ? "-" : "") + enterosTexto + "," + decimalesTexto + " €";
}

export function formatEurosNegativo(centimos) {
  return "−" + formatEuros(Math.abs(centimos));
}

export function formatCantidad(n) {
  return String(n).replace(".", ",");
}

export function parseDecimal(texto) {
  if (typeof texto !== "string") return NaN;
  const normalizado = texto.trim().replace(",", ".");
  if (normalizado === "") return NaN;
  const numero = Number(normalizado);
  return Number.isNaN(numero) ? NaN : numero;
}

export function eurosACentimos(numero) {
  return Math.round(Number((numero * 100).toPrecision(12)));
}

export function formatFecha(fechaISO) {
  const [anio, mes, dia] = fechaISO.split("-");
  return `${dia}/${mes}/${anio}`;
}

function fechaLocalISO(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

export function hoyISO() {
  return fechaLocalISO(new Date());
}

export function fechaValidez(fechaEmision) {
  const [anio, mes, dia] = fechaEmision.split("-").map(Number);
  return fechaLocalISO(new Date(anio, mes - 1, dia + 30));
}

export function estaCaducado(fechaEmision, hoy) {
  return hoy > fechaValidez(fechaEmision);
}

export function redondear(x) {
  return Math.round(Number(x.toPrecision(12)));
}

export function validarLinea(linea) {
  const errores = {};
  if (typeof linea.descripcion !== "string" || linea.descripcion.trim() === "") {
    errores.descripcion = "Obligatoria.";
  }
  if (typeof linea.cantidad !== "number" || Number.isNaN(linea.cantidad) || linea.cantidad <= 0) {
    errores.cantidad = "La cantidad debe ser mayor que 0.";
  }
  if (typeof linea.precio !== "number" || Number.isNaN(linea.precio) || linea.precio < 0) {
    errores.precio = "El precio no puede ser negativo.";
  }
  return errores;
}

const PORCENTAJE_IVA = 21;

export function calcularTotales(presupuesto) {
  const lineas = presupuesto.lineas.map((linea) => {
    const errores = validarLinea(linea);
    const valida = Object.keys(errores).length === 0;
    const importe = valida ? redondear(linea.cantidad * linea.precio) : 0;
    return { importe, errores, valida };
  });

  const base = lineas.reduce((suma, linea) => suma + (linea.valida ? linea.importe : 0), 0);
  const iva = redondear((base * PORCENTAJE_IVA) / 100);

  const retencionAplicada = presupuesto.retencion.activa && presupuesto.cliente.tipo === "empresa";
  const importeRetencion = retencionAplicada
    ? redondear((base * presupuesto.retencion.porcentaje) / 100)
    : 0;
  const total = base + iva - importeRetencion;
  const avisoParticular = presupuesto.retencion.activa && presupuesto.cliente.tipo === "particular";

  return { lineas, base, iva, retencionAplicada, importeRetencion, total, avisoParticular };
}

export function siguienteNumero(contadores, fechaEmision) {
  const anio = fechaEmision.slice(0, 4);
  const n = (contadores[anio] ?? 0) + 1;
  const numero = anio + "-" + String(n).padStart(3, "0");
  return { numero, contadores: { ...contadores, [anio]: n } };
}

const ESTADOS_PRESUPUESTO = ["Borrador", "Enviado", "Aceptado", "Rechazado"];

export function resumenActividad(presupuestos, hoy) {
  const porEstado = { Borrador: 0, Enviado: 0, Aceptado: 0, Rechazado: 0 };
  let caducados = 0;
  for (const presupuesto of presupuestos) {
    const estadoPresupuesto = ESTADOS_PRESUPUESTO.includes(presupuesto.estado)
      ? presupuesto.estado
      : "Borrador";
    porEstado[estadoPresupuesto]++;
    if (estaCaducado(presupuesto.fechaEmision, hoy)) caducados++;
  }
  return { total: presupuestos.length, porEstado, caducados };
}

export function agruparClientes(presupuestos) {
  const grupos = new Map();
  for (const presupuesto of presupuestos) {
    const cliente = presupuesto.cliente;
    const clave = cliente.nombre.trim().toLowerCase() + "|" + cliente.tipo;
    if (!grupos.has(clave)) {
      grupos.set(clave, {
        nombre: cliente.nombre,
        tipo: cliente.tipo,
        nif: "",
        numPresupuestos: 0,
        _fechaNif: "",
        _numeroNif: "",
      });
    }
    const grupo = grupos.get(clave);
    grupo.numPresupuestos++;
    if (
      cliente.nif &&
      cliente.nif.trim() &&
      (presupuesto.fechaEmision > grupo._fechaNif ||
        (presupuesto.fechaEmision === grupo._fechaNif && presupuesto.numero > grupo._numeroNif))
    ) {
      grupo.nif = cliente.nif;
      grupo._fechaNif = presupuesto.fechaEmision;
      grupo._numeroNif = presupuesto.numero;
    }
  }
  return Array.from(grupos.values()).map(({ nombre, tipo, nif, numPresupuestos }) => ({
    nombre,
    tipo,
    nif,
    numPresupuestos,
  }));
}

export function puedeDescargar(perfil, presupuesto) {
  if (!perfil || !perfil.nombre || !perfil.nombre.trim() || !perfil.nif || !perfil.nif.trim()) {
    return { ok: false, motivo: "Completa tu perfil (nombre y NIF) antes de descargar el PDF." };
  }
  if (!presupuesto.cliente.nombre || !presupuesto.cliente.nombre.trim()) {
    return { ok: false, motivo: "Escribe el nombre del cliente." };
  }
  if (presupuesto.cliente.tipo === "empresa" && (!presupuesto.cliente.nif || !presupuesto.cliente.nif.trim())) {
    return { ok: false, motivo: "Escribe el NIF/CIF del cliente (obligatorio para empresas y autónomos)." };
  }
  if (presupuesto.lineas.length === 0) {
    return { ok: false, motivo: "Añade al menos una línea al presupuesto." };
  }
  const hayLineaInvalida = presupuesto.lineas.some(
    (linea) => Object.keys(validarLinea(linea)).length > 0
  );
  if (hayLineaInvalida) {
    return { ok: false, motivo: "Corrige las líneas marcadas en rojo antes de descargar el PDF." };
  }
  return { ok: true };
}
