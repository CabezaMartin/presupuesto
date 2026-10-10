import { cargar, guardar, exportarCopia, validarCopia } from "./store.js";
import {
  hoyISO,
  formatFecha,
  fechaValidez,
  estaCaducado,
  formatEuros,
  formatEurosNegativo,
  formatCantidad,
  parseDecimal,
  eurosACentimos,
  calcularTotales,
  siguienteNumero,
  puedeDescargar,
  resumenActividad,
  agruparClientes,
} from "./calc.js";
import { descargarPdf } from "./pdf.js";

let estado = cargar();

const app = document.getElementById("app");
const avisoEl = document.getElementById("aviso");
let avisoTimeoutId = null;

function persistir() {
  const ok = guardar(estado);
  if (!ok) {
    mostrarAviso("No se han podido guardar los datos: el almacenamiento del navegador está lleno.");
  }
  return ok;
}

function mostrarAviso(texto) {
  avisoEl.textContent = texto;
  avisoEl.classList.add("visible");
  if (avisoTimeoutId) clearTimeout(avisoTimeoutId);
  avisoTimeoutId = setTimeout(() => avisoEl.classList.remove("visible"), 4000);
}

function etiquetaEstado(estadoPresupuesto) {
  const valor = estadoPresupuesto ?? "Borrador";
  const clase = "estado-" + valor.toLowerCase();
  return `<span class="etiqueta-estado ${clase}">${valor}</span>`;
}

function escaparHTML(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ---------- Router ----------

function marcarNavActivo(seccion) {
  document.querySelectorAll("nav a").forEach((enlace) => {
    enlace.classList.toggle("activo", enlace.dataset.ruta === seccion);
  });
}

function router() {
  const hash = location.hash.slice(1) || "/";
  const partes = hash.split("/").filter(Boolean);

  if (partes.length === 0) {
    marcarNavActivo("/");
    vistaInicio();
  } else if (partes[0] === "presupuestos" && partes.length === 1) {
    marcarNavActivo("/presupuestos");
    vistaListaPresupuestos();
  } else if (partes[0] === "presupuesto" && partes.length === 2) {
    const presupuesto = estado.presupuestos.find((p) => p.id === partes[1]);
    if (!presupuesto) {
      location.hash = "#/presupuestos";
      return;
    }
    marcarNavActivo("/presupuestos");
    vistaEditorPresupuesto(presupuesto);
  } else if (partes[0] === "clientes" && partes.length === 1) {
    marcarNavActivo("/clientes");
    vistaClientes();
  } else if (partes[0] === "catalogo" && partes.length === 1) {
    marcarNavActivo("/catalogo");
    vistaCatalogo();
  } else if (partes[0] === "perfil" && partes.length === 1) {
    marcarNavActivo("/perfil");
    vistaPerfil();
  } else {
    location.hash = "#/presupuestos";
  }
}

window.addEventListener("hashchange", router);
window.addEventListener("DOMContentLoaded", router);

// ---------- Presupuestos ----------

function crearPresupuesto() {
  const hoy = hoyISO();
  const { numero, contadores } = siguienteNumero(estado.contadores, hoy);
  estado.contadores = contadores;
  const presupuesto = {
    id: crypto.randomUUID(),
    numero,
    fechaEmision: hoy,
    cliente: { nombre: "", tipo: "empresa", nif: "", direccion: "", email: "" },
    lineas: [],
    retencion: { activa: false, porcentaje: 15 },
    notas: "",
    estado: "Borrador",
  };
  estado.presupuestos.push(presupuesto);
  persistir();
  location.hash = "#/presupuesto/" + presupuesto.id;
}

function duplicarPresupuesto(id) {
  const original = estado.presupuestos.find((p) => p.id === id);
  if (!original) return;
  const hoy = hoyISO();
  const { numero, contadores } = siguienteNumero(estado.contadores, hoy);
  estado.contadores = contadores;
  const copia = {
    id: crypto.randomUUID(),
    numero,
    fechaEmision: hoy,
    cliente: structuredClone(original.cliente),
    lineas: structuredClone(original.lineas),
    retencion: structuredClone(original.retencion),
    notas: original.notas,
    estado: "Borrador",
  };
  estado.presupuestos.push(copia);
  persistir();
  location.hash = "#/presupuesto/" + copia.id;
}

function eliminarPresupuesto(id) {
  const presupuesto = estado.presupuestos.find((p) => p.id === id);
  if (!presupuesto) return;
  const confirmado = confirm(
    "¿Eliminar el presupuesto " + presupuesto.numero + "? Esta acción no se puede deshacer."
  );
  if (!confirmado) return;
  estado.presupuestos = estado.presupuestos.filter((p) => p.id !== id);
  persistir();
  vistaListaPresupuestos();
}

function intentarDescargarPdf(presupuesto) {
  const resultado = puedeDescargar(estado.perfil, presupuesto);
  if (!resultado.ok) {
    mostrarAviso(resultado.motivo);
    return;
  }
  descargarPdf(estado.perfil, presupuesto);
}

function ordenarPresupuestos(lista) {
  return [...lista].sort((a, b) => {
    if (a.fechaEmision !== b.fechaEmision) {
      return a.fechaEmision < b.fechaEmision ? 1 : -1;
    }
    const [anioA, nA] = a.numero.split("-").map(Number);
    const [anioB, nB] = b.numero.split("-").map(Number);
    if (anioA !== anioB) return anioB - anioA;
    return nB - nA;
  });
}

function vistaInicio() {
  const resumen = resumenActividad(estado.presupuestos, hoyISO());

  app.innerHTML = `
    <h1>Inicio</h1>

    <div class="resumen-inicio">
      <div class="tarjeta-resumen tarjeta-resumen-total">
        <span class="tarjeta-resumen-numero">${resumen.total}</span>
        <span>Presupuestos en total</span>
      </div>
      <div class="tarjeta-resumen estado-borrador">
        <span class="tarjeta-resumen-numero">${resumen.porEstado.Borrador}</span>
        <span>Borrador</span>
      </div>
      <div class="tarjeta-resumen estado-enviado">
        <span class="tarjeta-resumen-numero">${resumen.porEstado.Enviado}</span>
        <span>Enviado</span>
      </div>
      <div class="tarjeta-resumen estado-aceptado">
        <span class="tarjeta-resumen-numero">${resumen.porEstado.Aceptado}</span>
        <span>Aceptado</span>
      </div>
      <div class="tarjeta-resumen estado-rechazado">
        <span class="tarjeta-resumen-numero">${resumen.porEstado.Rechazado}</span>
        <span>Rechazado</span>
      </div>
      <div class="tarjeta-resumen">
        <span class="tarjeta-resumen-numero">${resumen.caducados}</span>
        <span>Caducados</span>
      </div>
    </div>

    ${resumen.total === 0 ? `
      <p>Todavía no tienes presupuestos.</p>
      <button type="button" id="btn-nuevo-inicio">Nuevo presupuesto</button>
    ` : ""}

    <h2>Ir a</h2>
    <div class="accesos-inicio">
      <a href="#/presupuestos" class="acceso-inicio">Presupuestos</a>
      <a href="#/clientes" class="acceso-inicio">Clientes</a>
      <a href="#/catalogo" class="acceso-inicio">Catálogo</a>
      <a href="#/perfil" class="acceso-inicio">Perfil</a>
    </div>
  `;

  if (resumen.total === 0) {
    document.getElementById("btn-nuevo-inicio").addEventListener("click", crearPresupuesto);
  }
}

function vistaListaPresupuestos() {
  const hoy = hoyISO();
  const lista = ordenarPresupuestos(estado.presupuestos);

  if (lista.length === 0) {
    app.innerHTML = `
      <h1>Presupuestos</h1>
      <p>Todavía no tienes presupuestos</p>
      <button id="btn-nuevo">Nuevo presupuesto</button>
    `;
    document.getElementById("btn-nuevo").addEventListener("click", crearPresupuesto);
    return;
  }

  app.innerHTML = `
    <h1>Presupuestos</h1>
    <button id="btn-nuevo">Nuevo presupuesto</button>
    <div class="lista-presupuestos">
      ${lista
        .map((p) => {
          const totales = calcularTotales(p);
          const caducado = estaCaducado(p.fechaEmision, hoy);
          return `
            <div class="tarjeta-presupuesto">
              <div class="tarjeta-presupuesto-info" data-abrir="${p.id}">
                <strong>${escaparHTML(p.numero)}</strong>
                ${etiquetaEstado(p.estado)}
                ${caducado ? '<span class="etiqueta-caducado">Caducado</span>' : ""}
                <div>${escaparHTML(p.cliente.nombre.trim() || "Sin cliente")}</div>
                <div>${formatFecha(p.fechaEmision)}</div>
                <div class="tarjeta-presupuesto-total">${formatEuros(totales.total)}</div>
              </div>
              <div class="tarjeta-presupuesto-acciones">
                <button class="secundario" data-pdf="${p.id}">Descargar PDF</button>
                <button class="secundario" data-duplicar="${p.id}">Duplicar</button>
                <button class="peligro" data-eliminar="${p.id}">Eliminar</button>
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;

  document.getElementById("btn-nuevo").addEventListener("click", crearPresupuesto);
  app.querySelectorAll("[data-abrir]").forEach((el) => {
    el.addEventListener("click", () => {
      location.hash = "#/presupuesto/" + el.dataset.abrir;
    });
  });
  app.querySelectorAll("[data-pdf]").forEach((el) => {
    el.addEventListener("click", () => {
      intentarDescargarPdf(estado.presupuestos.find((p) => p.id === el.dataset.pdf));
    });
  });
  app.querySelectorAll("[data-duplicar]").forEach((el) => {
    el.addEventListener("click", () => duplicarPresupuesto(el.dataset.duplicar));
  });
  app.querySelectorAll("[data-eliminar]").forEach((el) => {
    el.addEventListener("click", () => eliminarPresupuesto(el.dataset.eliminar));
  });
}

function mostrarSelectorCatalogo(alElegir, alVolver) {
  if (estado.catalogo.length === 0) {
    app.innerHTML = `
      <h1>Añadir del catálogo</h1>
      <p>Tu catálogo está vacío. Añade servicios en Catálogo.</p>
      <button type="button" class="secundario" id="btn-volver-selector">Volver</button>
    `;
  } else {
    app.innerHTML = `
      <h1>Añadir del catálogo</h1>
      <div class="lista-selector-catalogo">
        ${estado.catalogo
          .map(
            (s) => `
          <button type="button" class="fila-servicio-selector" data-id="${s.id}">
            <span>${escaparHTML(s.nombre)}</span>
            <span>${formatEuros(s.precio)}</span>
          </button>`
          )
          .join("")}
      </div>
      <button type="button" class="secundario" id="btn-volver-selector">Volver</button>
    `;
    app.querySelectorAll(".fila-servicio-selector").forEach((boton) => {
      boton.addEventListener("click", () => {
        const servicio = estado.catalogo.find((s) => s.id === boton.dataset.id);
        alElegir(servicio);
        alVolver();
      });
    });
  }
  document.getElementById("btn-volver-selector").addEventListener("click", alVolver);
}

function vistaEditorPresupuesto(presupuesto) {
  const hoy = hoyISO();
  const caducado = estaCaducado(presupuesto.fechaEmision, hoy);

  app.innerHTML = `
    <div class="cabecera-editor">
      <h1>Nº ${escaparHTML(presupuesto.numero)}</h1>
      <span id="contenedor-etiqueta-estado">${etiquetaEstado(presupuesto.estado)}</span>
      ${caducado ? '<span class="etiqueta-caducado">Caducado</span>' : ""}
      <p>Fecha de emisión: ${formatFecha(presupuesto.fechaEmision)}</p>
      <p>Válido hasta: ${formatFecha(fechaValidez(presupuesto.fechaEmision))}</p>
      <label>Estado
        <select id="presupuesto-estado">
          <option value="Borrador">Borrador</option>
          <option value="Enviado">Enviado</option>
          <option value="Aceptado">Aceptado</option>
          <option value="Rechazado">Rechazado</option>
        </select>
      </label>
    </div>

    <section>
      <h2>Cliente</h2>
      <label>Tipo
        <select id="cliente-tipo">
          <option value="empresa">Empresa / autónomo</option>
          <option value="particular">Particular</option>
        </select>
      </label>
      <label><span id="texto-nif">NIF/CIF</span>
        <input type="text" id="cliente-nif">
      </label>
      <label>Nombre o razón social
        <input type="text" id="cliente-nombre">
      </label>
      <label>Dirección
        <textarea id="cliente-direccion"></textarea>
      </label>
      <label>Email
        <input type="email" id="cliente-email">
      </label>
    </section>

    <section>
      <h2>Líneas</h2>
      <div id="lista-lineas"></div>
      <button type="button" class="secundario" id="btn-anadir-catalogo">Añadir del catálogo</button>
      <button type="button" id="btn-anadir-linea">Añadir línea</button>
    </section>

    <section>
      <h2>Retención de IRPF</h2>
      <label><input type="checkbox" id="retencion-activa"> Aplicar retención de IRPF</label>
      <label id="label-retencion-porcentaje" hidden>Porcentaje
        <select id="retencion-porcentaje">
          <option value="15">15 %</option>
          <option value="7">7 %</option>
        </select>
      </label>
      <p id="aviso-particular" class="aviso-particular" hidden>A los clientes particulares no se les aplica retención de IRPF.</p>
    </section>

    <section>
      <h2>Notas / condiciones</h2>
      <textarea id="notas"></textarea>
    </section>

    <div class="desglose-fijo">
      <div class="linea-desglose"><span>Base imponible</span><span id="total-base"></span></div>
      <div class="linea-desglose"><span>IVA (21 %)</span><span id="total-iva"></span></div>
      <div class="linea-desglose" id="fila-retencion" hidden><span id="etiqueta-retencion"></span><span id="total-retencion"></span></div>
      <div class="linea-desglose total"><span>Total</span><span id="total-total"></span></div>
      <button type="button" id="btn-pdf">Descargar PDF</button>
    </div>
  `;

  document.getElementById("presupuesto-estado").value = presupuesto.estado ?? "Borrador";
  document.getElementById("cliente-tipo").value = presupuesto.cliente.tipo;
  document.getElementById("cliente-nif").value = presupuesto.cliente.nif;
  document.getElementById("cliente-nombre").value = presupuesto.cliente.nombre;
  document.getElementById("cliente-direccion").value = presupuesto.cliente.direccion;
  document.getElementById("cliente-email").value = presupuesto.cliente.email;
  document.getElementById("retencion-activa").checked = presupuesto.retencion.activa;
  document.getElementById("retencion-porcentaje").value = String(presupuesto.retencion.porcentaje);
  document.getElementById("notas").value = presupuesto.notas;

  function actualizarAsteriscoNif() {
    document.getElementById("texto-nif").textContent =
      presupuesto.cliente.tipo === "empresa" ? "NIF/CIF *" : "NIF/CIF";
  }
  actualizarAsteriscoNif();

  function actualizarVisibilidadRetencion() {
    document.getElementById("label-retencion-porcentaje").hidden = !presupuesto.retencion.activa;
  }
  actualizarVisibilidadRetencion();

  function actualizarErrorCampo(tarjeta, campo, mensaje) {
    const input = tarjeta.querySelector(`[data-campo="${campo}"]`);
    const mensajeEl = tarjeta.querySelector(`[data-campo-error="${campo}"]`);
    input.classList.toggle("error", Boolean(mensaje));
    mensajeEl.textContent = mensaje || "";
  }

  function actualizarTotales() {
    const totales = calcularTotales(presupuesto);
    document.getElementById("total-base").textContent = formatEuros(totales.base);
    document.getElementById("total-iva").textContent = formatEuros(totales.iva);
    const filaRetencion = document.getElementById("fila-retencion");
    filaRetencion.hidden = !totales.retencionAplicada;
    if (totales.retencionAplicada) {
      document.getElementById("etiqueta-retencion").textContent =
        "Retención IRPF (" + presupuesto.retencion.porcentaje + " %)";
      document.getElementById("total-retencion").textContent = formatEurosNegativo(totales.importeRetencion);
    }
    document.getElementById("total-total").textContent = formatEuros(totales.total);
    document.getElementById("aviso-particular").hidden = !totales.avisoParticular;

    totales.lineas.forEach((lineaCalculada, indice) => {
      const tarjeta = document.querySelector(`.tarjeta-linea[data-indice="${indice}"]`);
      if (!tarjeta) return;
      tarjeta.querySelector(".importe-linea").textContent = formatEuros(lineaCalculada.importe);
      actualizarErrorCampo(tarjeta, "descripcion", lineaCalculada.errores.descripcion);
      actualizarErrorCampo(tarjeta, "cantidad", lineaCalculada.errores.cantidad);
      actualizarErrorCampo(tarjeta, "precio", lineaCalculada.errores.precio);
    });
  }

  function renderLineas() {
    const contenedor = document.getElementById("lista-lineas");
    contenedor.innerHTML = presupuesto.lineas
      .map(
        (linea, indice) => `
        <div class="tarjeta-linea" data-indice="${indice}">
          <label>Descripción
            <input type="text" data-campo="descripcion" value="${escaparHTML(linea.descripcion)}">
          </label>
          <div class="mensaje-error" data-campo-error="descripcion"></div>
          <div class="fila-cantidad-precio">
            <label>Cantidad
              <input type="text" inputmode="decimal" data-campo="cantidad" value="${escaparHTML(formatCantidad(linea.cantidad))}">
            </label>
            <label>Precio unitario (€)
              <input type="text" inputmode="decimal" data-campo="precio" value="${escaparHTML(formatCantidad(linea.precio / 100))}">
            </label>
          </div>
          <div class="mensaje-error" data-campo-error="cantidad"></div>
          <div class="mensaje-error" data-campo-error="precio"></div>
          <div class="importe-linea"></div>
          <button type="button" class="secundario" data-eliminar-linea="${indice}">Eliminar línea</button>
        </div>
      `
      )
      .join("");

    contenedor.querySelectorAll('[data-campo="descripcion"]').forEach((input) => {
      input.addEventListener("input", (e) => {
        const indice = Number(e.target.closest(".tarjeta-linea").dataset.indice);
        presupuesto.lineas[indice].descripcion = e.target.value;
        persistir();
        actualizarTotales();
      });
    });
    contenedor.querySelectorAll('[data-campo="cantidad"]').forEach((input) => {
      input.addEventListener("input", (e) => {
        const indice = Number(e.target.closest(".tarjeta-linea").dataset.indice);
        presupuesto.lineas[indice].cantidad = parseDecimal(e.target.value);
        persistir();
        actualizarTotales();
      });
    });
    contenedor.querySelectorAll('[data-campo="precio"]').forEach((input) => {
      input.addEventListener("input", (e) => {
        const indice = Number(e.target.closest(".tarjeta-linea").dataset.indice);
        presupuesto.lineas[indice].precio = eurosACentimos(parseDecimal(e.target.value));
        persistir();
        actualizarTotales();
      });
    });
    contenedor.querySelectorAll("[data-eliminar-linea]").forEach((boton) => {
      boton.addEventListener("click", () => {
        const indice = Number(boton.dataset.eliminarLinea);
        presupuesto.lineas.splice(indice, 1);
        persistir();
        renderLineas();
      });
    });

    actualizarTotales();
  }

  renderLineas();

  document.getElementById("presupuesto-estado").addEventListener("change", (e) => {
    presupuesto.estado = e.target.value;
    persistir();
    document.getElementById("contenedor-etiqueta-estado").innerHTML = etiquetaEstado(presupuesto.estado);
  });

  document.getElementById("cliente-tipo").addEventListener("change", (e) => {
    presupuesto.cliente.tipo = e.target.value;
    persistir();
    actualizarAsteriscoNif();
    actualizarTotales();
  });
  document.getElementById("cliente-nif").addEventListener("input", (e) => {
    presupuesto.cliente.nif = e.target.value;
    persistir();
  });
  document.getElementById("cliente-nombre").addEventListener("input", (e) => {
    presupuesto.cliente.nombre = e.target.value;
    persistir();
  });
  document.getElementById("cliente-direccion").addEventListener("input", (e) => {
    presupuesto.cliente.direccion = e.target.value;
    persistir();
  });
  document.getElementById("cliente-email").addEventListener("input", (e) => {
    presupuesto.cliente.email = e.target.value;
    persistir();
  });

  document.getElementById("retencion-activa").addEventListener("change", (e) => {
    presupuesto.retencion.activa = e.target.checked;
    persistir();
    actualizarVisibilidadRetencion();
    actualizarTotales();
  });
  document.getElementById("retencion-porcentaje").addEventListener("change", (e) => {
    presupuesto.retencion.porcentaje = Number(e.target.value);
    persistir();
    actualizarTotales();
  });

  document.getElementById("notas").addEventListener("input", (e) => {
    presupuesto.notas = e.target.value;
    persistir();
  });

  document.getElementById("btn-anadir-linea").addEventListener("click", () => {
    presupuesto.lineas.push({ descripcion: "", cantidad: 1, precio: 0 });
    persistir();
    renderLineas();
  });

  document.getElementById("btn-anadir-catalogo").addEventListener("click", () => {
    mostrarSelectorCatalogo(
      (servicio) => {
        presupuesto.lineas.push({ descripcion: servicio.nombre, cantidad: 1, precio: servicio.precio });
        persistir();
      },
      () => vistaEditorPresupuesto(presupuesto)
    );
  });

  document.getElementById("btn-pdf").addEventListener("click", () => {
    intentarDescargarPdf(presupuesto);
  });
}

// ---------- Catálogo ----------

function vistaClientes() {
  app.innerHTML = `<h1>Clientes</h1>`;
}

function vistaCatalogo() {
  app.innerHTML = `
    <h1>Catálogo</h1>
    <button type="button" id="btn-nuevo-servicio">Nuevo servicio</button>
    <div id="lista-catalogo"></div>
  `;
  document.getElementById("btn-nuevo-servicio").addEventListener("click", () => mostrarFormularioServicio(null));
  renderListaCatalogo();
}

function renderListaCatalogo() {
  const contenedor = document.getElementById("lista-catalogo");
  if (estado.catalogo.length === 0) {
    contenedor.innerHTML = "<p>Todavía no tienes servicios en el catálogo.</p>";
    return;
  }
  contenedor.innerHTML = estado.catalogo
    .map(
      (s) => `
      <div class="fila-servicio">
        <div class="fila-servicio-datos">
          <strong>${escaparHTML(s.nombre)}</strong>
          <span>${formatEuros(s.precio)}</span>
        </div>
        <div class="fila-servicio-acciones">
          <button type="button" class="secundario" data-editar="${s.id}">Editar</button>
          <button type="button" class="peligro" data-eliminar="${s.id}">Eliminar</button>
        </div>
      </div>
    `
    )
    .join("");

  contenedor.querySelectorAll("[data-editar]").forEach((boton) => {
    boton.addEventListener("click", () => {
      mostrarFormularioServicio(estado.catalogo.find((s) => s.id === boton.dataset.editar));
    });
  });
  contenedor.querySelectorAll("[data-eliminar]").forEach((boton) => {
    boton.addEventListener("click", () => {
      const servicio = estado.catalogo.find((s) => s.id === boton.dataset.eliminar);
      if (!confirm("¿Eliminar el servicio «" + servicio.nombre + "»?")) return;
      estado.catalogo = estado.catalogo.filter((s) => s.id !== servicio.id);
      persistir();
      renderListaCatalogo();
    });
  });
}

function mostrarFormularioServicio(servicioExistente) {
  const contenedor = document.getElementById("lista-catalogo");
  const formularioHTML = `
    <div class="formulario-servicio">
      <label>Nombre *
        <input type="text" id="servicio-nombre">
      </label>
      <div class="mensaje-error" id="error-servicio-nombre"></div>
      <label>Precio por defecto (€) *
        <input type="text" inputmode="decimal" id="servicio-precio">
      </label>
      <div class="mensaje-error" id="error-servicio-precio"></div>
      <button type="button" id="btn-guardar-servicio">Guardar</button>
      <button type="button" class="secundario" id="btn-cancelar-servicio">Cancelar</button>
    </div>
  `;
  contenedor.insertAdjacentHTML("afterbegin", formularioHTML);
  const inputNombre = document.getElementById("servicio-nombre");
  const inputPrecio = document.getElementById("servicio-precio");
  if (servicioExistente) {
    inputNombre.value = servicioExistente.nombre;
    inputPrecio.value = formatCantidad(servicioExistente.precio / 100);
  }

  document.getElementById("btn-cancelar-servicio").addEventListener("click", renderListaCatalogo);

  document.getElementById("btn-guardar-servicio").addEventListener("click", () => {
    const nombre = inputNombre.value.trim();
    const precioNumero = parseDecimal(inputPrecio.value);
    let valido = true;
    const errorNombre = document.getElementById("error-servicio-nombre");
    const errorPrecio = document.getElementById("error-servicio-precio");

    if (!nombre) {
      errorNombre.textContent = "El nombre es obligatorio.";
      inputNombre.classList.add("error");
      valido = false;
    } else {
      errorNombre.textContent = "";
      inputNombre.classList.remove("error");
    }
    if (Number.isNaN(precioNumero) || precioNumero < 0) {
      errorPrecio.textContent = "Escribe un precio igual o mayor que 0.";
      inputPrecio.classList.add("error");
      valido = false;
    } else {
      errorPrecio.textContent = "";
      inputPrecio.classList.remove("error");
    }
    if (!valido) return;

    const precio = eurosACentimos(precioNumero);
    if (servicioExistente) {
      servicioExistente.nombre = nombre;
      servicioExistente.precio = precio;
    } else {
      estado.catalogo.push({ id: crypto.randomUUID(), nombre, precio });
    }
    persistir();
    renderListaCatalogo();
  });
}

// ---------- Perfil ----------

function vistaPerfil() {
  const perfil = estado.perfil || { nombre: "", nif: "", email: "", telefono: "", direccion: "", logo: null };

  app.innerHTML = `
    <h1>Perfil</h1>
    <label>Nombre o razón social *
      <input type="text" id="perfil-nombre">
    </label>
    <div class="mensaje-error" id="error-perfil-nombre"></div>
    <label>NIF *
      <input type="text" id="perfil-nif">
    </label>
    <div class="mensaje-error" id="error-perfil-nif"></div>
    <label>Email
      <input type="email" id="perfil-email">
    </label>
    <label>Teléfono
      <input type="tel" id="perfil-telefono">
    </label>
    <label>Dirección
      <textarea id="perfil-direccion"></textarea>
    </label>
    <label>Logo
      <input type="file" id="perfil-logo" accept="image/png,image/jpeg">
    </label>
    <div class="mensaje-error" id="error-perfil-logo"></div>
    <div id="vista-previa-logo"></div>
    <button type="button" class="secundario" id="btn-quitar-logo" hidden>Quitar logo</button>
    <button type="button" id="btn-guardar-perfil">Guardar</button>

    <section>
      <h2>Copia de seguridad</h2>
      <button type="button" class="secundario" id="btn-exportar-copia">Descargar copia de seguridad</button>
      <label>Restaurar copia
        <input type="file" id="input-restaurar-copia" accept="application/json,.json">
      </label>
    </section>
  `;

  document.getElementById("perfil-nombre").value = perfil.nombre;
  document.getElementById("perfil-nif").value = perfil.nif;
  document.getElementById("perfil-email").value = perfil.email || "";
  document.getElementById("perfil-telefono").value = perfil.telefono || "";
  document.getElementById("perfil-direccion").value = perfil.direccion || "";

  let logoActual = perfil.logo || null;

  function actualizarVistaPreviaLogo() {
    const contenedor = document.getElementById("vista-previa-logo");
    const btnQuitar = document.getElementById("btn-quitar-logo");
    if (logoActual) {
      contenedor.innerHTML = `<img src="${logoActual}" alt="Logo" class="vista-previa-logo-img">`;
      btnQuitar.hidden = false;
    } else {
      contenedor.innerHTML = "";
      btnQuitar.hidden = true;
    }
  }
  actualizarVistaPreviaLogo();

  document.getElementById("perfil-logo").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const errorEl = document.getElementById("error-perfil-logo");
    if (file.type !== "image/png" && file.type !== "image/jpeg") {
      errorEl.textContent = "El logo debe ser una imagen PNG o JPG.";
      e.target.value = "";
      return;
    }
    errorEl.textContent = "";
    const lector = new FileReader();
    lector.onload = () => {
      const imagen = new Image();
      imagen.onload = () => {
        const maxLado = 600;
        let ancho = imagen.width;
        let alto = imagen.height;
        if (ancho > maxLado || alto > maxLado) {
          if (ancho > alto) {
            alto = Math.round((alto * maxLado) / ancho);
            ancho = maxLado;
          } else {
            ancho = Math.round((ancho * maxLado) / alto);
            alto = maxLado;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = ancho;
        canvas.height = alto;
        canvas.getContext("2d").drawImage(imagen, 0, 0, ancho, alto);
        logoActual = canvas.toDataURL(file.type, 0.9);
        actualizarVistaPreviaLogo();
      };
      imagen.src = lector.result;
    };
    lector.readAsDataURL(file);
  });

  document.getElementById("btn-quitar-logo").addEventListener("click", () => {
    logoActual = null;
    document.getElementById("perfil-logo").value = "";
    actualizarVistaPreviaLogo();
  });

  document.getElementById("btn-guardar-perfil").addEventListener("click", () => {
    const inputNombre = document.getElementById("perfil-nombre");
    const inputNif = document.getElementById("perfil-nif");
    const nombre = inputNombre.value.trim();
    const nif = inputNif.value.trim();
    let valido = true;

    if (!nombre) {
      document.getElementById("error-perfil-nombre").textContent = "Este campo es obligatorio.";
      inputNombre.classList.add("error");
      valido = false;
    } else {
      document.getElementById("error-perfil-nombre").textContent = "";
      inputNombre.classList.remove("error");
    }
    if (!nif) {
      document.getElementById("error-perfil-nif").textContent = "Este campo es obligatorio.";
      inputNif.classList.add("error");
      valido = false;
    } else {
      document.getElementById("error-perfil-nif").textContent = "";
      inputNif.classList.remove("error");
    }
    if (!valido) return;

    estado.perfil = {
      nombre,
      nif,
      email: document.getElementById("perfil-email").value.trim(),
      telefono: document.getElementById("perfil-telefono").value.trim(),
      direccion: document.getElementById("perfil-direccion").value,
      logo: logoActual,
    };
    if (persistir()) mostrarAviso("Perfil guardado.");
  });

  document.getElementById("btn-exportar-copia").addEventListener("click", () => {
    exportarCopia(estado);
  });

  document.getElementById("input-restaurar-copia").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const lector = new FileReader();
    lector.onload = () => {
      const copia = validarCopia(lector.result);
      e.target.value = "";
      if (!copia) {
        mostrarAviso("Este archivo no es una copia de seguridad válida de PresupuestosPro.");
        return;
      }
      if (!confirm("Se sustituirán todos tus datos actuales por los de la copia. ¿Continuar?")) return;
      estado = copia;
      persistir();
      mostrarAviso("Copia restaurada.");
      location.hash = "#/presupuestos";
    };
    lector.readAsText(file);
  });
}
