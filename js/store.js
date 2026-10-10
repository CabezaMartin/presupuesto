// Persistencia en localStorage y copia de seguridad.

import { hoyISO } from "./calc.js";

const CLAVE = "presupuestospro";

export function estadoInicial() {
  return {
    app: "presupuestospro",
    version: 1,
    perfil: null,
    catalogo: [],
    presupuestos: [],
    contadores: {},
  };
}

export function normalizarPresupuesto(presupuesto) {
  return { ...presupuesto, estado: presupuesto.estado ?? "Borrador" };
}

export function cargar() {
  try {
    const texto = localStorage.getItem(CLAVE);
    if (!texto) return estadoInicial();
    const datos = JSON.parse(texto);
    datos.presupuestos = datos.presupuestos.map(normalizarPresupuesto);
    return datos;
  } catch {
    return estadoInicial();
  }
}

export function guardar(estado) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
    return true;
  } catch {
    return false;
  }
}

export function exportarCopia(estado) {
  const blob = new Blob([JSON.stringify(estado, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = "presupuestospro-copia-" + hoyISO() + ".json";
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}

export function validarCopia(texto) {
  let datos;
  try {
    datos = JSON.parse(texto);
  } catch {
    return null;
  }
  if (!datos || typeof datos !== "object") return null;
  if (datos.app !== "presupuestospro") return null;
  if (datos.version !== 1) return null;
  if (!Array.isArray(datos.catalogo)) return null;
  if (!Array.isArray(datos.presupuestos)) return null;
  if (typeof datos.contadores !== "object" || datos.contadores === null || Array.isArray(datos.contadores)) {
    return null;
  }
  if (!(datos.perfil === null || typeof datos.perfil === "object")) return null;
  return datos;
}
