import {
  formatFecha,
  fechaValidez,
  formatCantidad,
  formatEuros,
  formatEurosNegativo,
  calcularTotales,
} from "./calc.js";

// Mismos valores que las variables CSS de styles.css (:root); jsPDF no puede leer CSS.
const COLOR_PRIMARIO = [37, 99, 235]; // --color-primario (#2563eb)
const COLOR_TEXTO = [26, 26, 26]; // --color-texto (#1a1a1a)
const COLOR_TEXTO_SECUNDARIO = [85, 85, 85]; // --color-texto-secundario (#555555)
const COLOR_SUPERFICIE = [255, 255, 255]; // --color-superficie (#ffffff)

export function descargarPdf(perfil, presupuesto) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const margenIzq = 15;
  const anchoPagina = doc.internal.pageSize.getWidth();
  const margenDer = anchoPagina - 15;
  let y = 15;

  let yDatos = y;
  if (perfil.logo) {
    const formato = perfil.logo.startsWith("data:image/png") ? "PNG" : "JPEG";
    try {
      const propiedades = doc.getImageProperties(perfil.logo);
      const alto = 25;
      const ancho = alto * (propiedades.width / propiedades.height);
      doc.addImage(perfil.logo, formato, margenIzq, y, ancho, alto);
      yDatos = y + alto + 4;
    } catch {
      yDatos = y;
    }
  }

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLOR_TEXTO);
  doc.text(perfil.nombre, margenIzq, yDatos);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLOR_TEXTO_SECUNDARIO);
  let yF = yDatos + 5;
  doc.text("NIF: " + perfil.nif, margenIzq, yF);
  if (perfil.direccion) {
    yF += 5;
    doc.text(perfil.direccion, margenIzq, yF);
  }
  if (perfil.email) {
    yF += 5;
    doc.text(perfil.email, margenIzq, yF);
  }
  if (perfil.telefono) {
    yF += 5;
    doc.text(perfil.telefono, margenIzq, yF);
  }

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLOR_PRIMARIO);
  doc.text("PRESUPUESTO", margenDer, 18, { align: "right" });
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLOR_TEXTO_SECUNDARIO);
  doc.text("Nº " + presupuesto.numero, margenDer, 25, { align: "right" });
  doc.text("Fecha de emisión: " + formatFecha(presupuesto.fechaEmision), margenDer, 30, { align: "right" });
  doc.text(
    "Válido hasta: " + formatFecha(fechaValidez(presupuesto.fechaEmision)),
    margenDer,
    35,
    { align: "right" }
  );

  let yCliente = Math.max(yF, 35) + 10;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLOR_TEXTO);
  doc.text("Cliente", margenIzq, yCliente);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLOR_TEXTO_SECUNDARIO);
  yCliente += 6;
  doc.text(presupuesto.cliente.nombre, margenIzq, yCliente);
  if (presupuesto.cliente.nif) {
    yCliente += 5;
    doc.text("NIF/CIF: " + presupuesto.cliente.nif, margenIzq, yCliente);
  }
  if (presupuesto.cliente.direccion) {
    yCliente += 5;
    doc.text(presupuesto.cliente.direccion, margenIzq, yCliente);
  }
  if (presupuesto.cliente.email) {
    yCliente += 5;
    doc.text(presupuesto.cliente.email, margenIzq, yCliente);
  }

  const totales = calcularTotales(presupuesto);
  const filas = presupuesto.lineas.map((linea, i) => [
    linea.descripcion,
    formatCantidad(linea.cantidad),
    formatEuros(linea.precio),
    formatEuros(totales.lineas[i].importe),
  ]);

  doc.autoTable({
    startY: yCliente + 8,
    head: [["Descripción", "Cantidad", "Precio unitario", "Importe"]],
    body: filas,
    styles: { font: "helvetica", fontSize: 10, textColor: COLOR_TEXTO },
    headStyles: { fillColor: COLOR_PRIMARIO, textColor: COLOR_SUPERFICIE },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
    },
  });

  let yDesglose = doc.lastAutoTable.finalY + 10;
  const xEtiqueta = margenDer - 50;

  function filaDesglose(etiqueta, valor, destacado) {
    doc.setFont("helvetica", destacado ? "bold" : "normal");
    doc.setFontSize(destacado ? 13 : 10);
    doc.setTextColor(...(destacado ? COLOR_PRIMARIO : COLOR_TEXTO));
    doc.text(etiqueta, xEtiqueta, yDesglose);
    doc.text(valor, margenDer, yDesglose, { align: "right" });
    yDesglose += destacado ? 8 : 6;
  }

  filaDesglose("Base imponible", formatEuros(totales.base), false);
  filaDesglose("IVA (21 %)", formatEuros(totales.iva), false);
  if (totales.retencionAplicada) {
    filaDesglose(
      "Retención IRPF (" + presupuesto.retencion.porcentaje + " %)",
      formatEurosNegativo(totales.importeRetencion),
      false
    );
  }
  filaDesglose("Total", formatEuros(totales.total), true);

  if (presupuesto.notas && presupuesto.notas.trim()) {
    let yNotas = yDesglose + 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...COLOR_TEXTO);
    doc.text("Notas / condiciones", margenIzq, yNotas);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...COLOR_TEXTO_SECUNDARIO);
    yNotas += 6;
    const lineasNotas = doc.splitTextToSize(presupuesto.notas, anchoPagina - margenIzq * 2);
    doc.text(lineasNotas, margenIzq, yNotas);
  }

  doc.save("Presupuesto-" + presupuesto.numero + ".pdf");
}
