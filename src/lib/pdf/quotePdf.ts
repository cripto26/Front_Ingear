// src/lib/pdf/quotePdf.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type {
  QuoteDraftV2,
  QuoteLineV2,
  QuoteTotals
} from "../../features/cotizador/cotizadorTypes";
import { formatCOP } from "../money";

type GeneratePdfArgs = {
  draft: QuoteDraftV2;
  lines: QuoteLineV2[];
  totals: QuoteTotals;
  templateDataUrl?: string | null; // plantilla fija en DataURL
  showSensitive: boolean;
};

function safeText(v: unknown) {
  return v == null ? "" : String(v);
}

export function generateQuotePdf({
  draft,
  lines,
  totals,
  templateDataUrl,
  showSensitive
}: GeneratePdfArgs) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const drawTemplate = () => {
    if (!templateDataUrl) return;

    const isPng = templateDataUrl.startsWith("data:image/png");
    const isJpeg =
      templateDataUrl.startsWith("data:image/jpeg") ||
      templateDataUrl.startsWith("data:image/jpg");

    try {
      if (isPng) doc.addImage(templateDataUrl, "PNG", 0, 0, pageW, pageH);
      else if (isJpeg) doc.addImage(templateDataUrl, "JPEG", 0, 0, pageW, pageH);
      else doc.addImage(templateDataUrl, "JPEG", 0, 0, pageW, pageH);
    } catch {
      // si falla, no pinta fondo
    }
  };

  drawTemplate();

  // Zona de texto (arriba) - la dejamos simple y “encima del template”
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const leftX = 44;
  let y = 95;
  const gap = 14;

  const line = (label: string, value: string) => {
    doc.text(`${label}: ${value}`, leftX, y);
    y += gap;
  };

  // Campos como en tu pantalla
  line("Número", safeText(draft.quoteNumber));
  line("Título", safeText(draft.title));
  line("Cuenta", safeText(draft.account));
  line("Asesor", safeText(draft.advisor));
  line("Proyecto", safeText(draft.projectName));
  line("Contacto", safeText(draft.contactName));
  line("Válida hasta", safeText(draft.validUntil));
  line("Forma de pago", safeText(draft.paymentTerms));
  line("Etapa", safeText(draft.stage));
  line("Tipo", safeText(draft.quoteType));
  line("Tiempo entrega", safeText(draft.deliveryTime));
  line("Oportunidad", safeText(draft.opportunity));

  if (draft.notes?.trim()) {
    y += 6;
    doc.text(`Notas: ${safeText(draft.notes)}`, leftX, y);
    y += gap;
  }

  // Tabla
  const columnsCommon = [
    { header: "Ítem", dataKey: "item" },
    { header: "Marca", dataKey: "marca" },
    { header: "Referencia", dataKey: "ref" },
    { header: "Descripción", dataKey: "desc" },
    { header: "Qty", dataKey: "qty" },
    { header: "Vr Unitario", dataKey: "unit" },
    { header: "Vr Total", dataKey: "total" }
  ];

  const columnsSensitive = [
    { header: "Costo Origen", dataKey: "costo_origen" },
    { header: "Costo Col", dataKey: "costo_col" },
    { header: "Margen (T)", dataKey: "margen" }
  ];

  const columns = showSensitive
    ? [...columnsCommon, ...columnsSensitive]
    : columnsCommon;

  const rows = lines.map((l) => {
    const base: any = {
      item: l.itemNo,
      marca: safeText(l.product.marca),
      ref: safeText(l.product.codigo_producto),
      desc: safeText(l.product.descripcion),
      qty: l.qty,
      unit: formatCOP(l.vrUnitario),
      total: formatCOP(l.vrTotal)
    };

    if (showSensitive) {
      base.costo_origen = formatCOP(l.costoOrigen);
      base.costo_col = formatCOP(l.costoCol);
      base.margen = (l.margenFactor ?? 0).toFixed(2);
    }

    return base;
  });

  autoTable(doc, {
    startY: Math.max(y + 20, 200),
    columns,
    body: rows,
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [240, 244, 248], textColor: [20, 24, 28] },
    theme: "grid"
  });

  // Totales (abajo)
  const finalY = (doc as any).lastAutoTable?.finalY ?? 600;
  const boxY = Math.min(finalY + 18, pageH - 170);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);

  doc.text(`Subtotal: ${formatCOP(totals.subtotal)}`, leftX, boxY);
  doc.text(`IVA (19%): ${formatCOP(totals.iva)}`, leftX, boxY + 16);
  doc.text(`Total: ${formatCOP(totals.total)}`, leftX, boxY + 32);

  doc.save(`Cotizacion_${draft.quoteNumber || "SIN_NUMERO"}.pdf`);
}
