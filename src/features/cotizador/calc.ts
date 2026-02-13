// src/features/cotizador/calc.ts
import type { Producto } from "../../api/productoApi";
import type { QuoteLineV2, QuoteTotals } from "./cotizadorTypes";
import { toNumber } from "../../lib/money";

export function getCostoOrigen(product: Producto): number {
  // En tu Excel "COSTO ORIGEN" suele ser costo_fabrica.
  // Si no existe, cae a costo_ingear.
  const cf = toNumber(product.costo_fabrica);
  const ci = toNumber(product.costo_ingear);
  return cf || ci || 0;
}

/**
 * Volumen:
 * - En tu BD existe "volumen" (numeric).
 * - Si viene, lo usamos como volumen base por unidad.
 */
export function getVolumenUnit(product: Producto): number {
  return Math.max(0, toNumber(product.volumen));
}

export function buildLineFromProduct(args: {
  product: Producto;
  itemNo: number;
  qty?: number;
  volumenCm3?: number; // permite override manual
  margenFactor?: number; // default 0.70 como plantilla
}): QuoteLineV2 {
  const qty = Math.max(1, args.qty ?? 1);
  const costoOrigen = getCostoOrigen(args.product);

  // si no mandan volumen manual, usa el del producto
  const baseVolumen = args.volumenCm3 ?? getVolumenUnit(args.product);
  const volumen = Math.max(0, baseVolumen);

  const margenFactor = args.margenFactor ?? 0.7;

  // O y N en tu lógica actual
  const costoOrigenTotal = costoOrigen * qty; // O
  const totalVolumen = volumen * qty; // N

  return {
    id: crypto.randomUUID?.() ?? String(Date.now() + Math.random()),
    itemNo: args.itemNo,
    product: args.product,
    qty,

    volumenCm3: volumen,
    margenFactor,

    costoOrigen, // L
    totalVolumen, // N
    costoOrigenTotal, // O
    pesoPct: 0, // P
    costoTransporteGrupo: 0, // Q
    costoTransporteUnit: 0, // R
    costoCol: 0, // S
    vrVenta: 0, // U
    vrUnitario: 0, // I
    vrTotal: 0 // J
  };
}

export function recalcAllLines(lines: QuoteLineV2[], costoTotalDestino: number): QuoteLineV2[] {
  const sumO = lines.reduce((acc, l) => acc + (l.costoOrigenTotal || 0), 0);

  return lines.map((l) => {
    const costoOrigenTotal = l.costoOrigen * l.qty; // O
    const totalVolumen = l.volumenCm3 * l.qty; // N

    const pesoPct = sumO > 0 ? costoOrigenTotal / sumO : 0; // P
    const costoTransporteGrupo = pesoPct * (costoTotalDestino || 0); // Q
    const costoTransporteUnit = l.qty > 0 ? costoTransporteGrupo / l.qty : 0; // R

    const costoCol = l.costoOrigen + costoTransporteUnit; // S
    const margenFactor = l.margenFactor || 0.7; // T

    // U = S / T (según tu plantilla)
    const vrVenta = margenFactor > 0 ? costoCol / margenFactor : 0;

    const vrUnitario = vrVenta; // I = U
    const vrTotal = l.qty * vrUnitario; // J = H*I

    return {
      ...l,
      costoOrigenTotal,
      totalVolumen,
      pesoPct,
      costoTransporteGrupo,
      costoTransporteUnit,
      costoCol,
      vrVenta,
      vrUnitario,
      vrTotal
    };
  });
}

export function calcTotals(lines: QuoteLineV2[]): QuoteTotals {
  const subtotal = lines.reduce((acc, l) => acc + (l.vrTotal || 0), 0);
  const iva = subtotal * 0.19;
  const total = subtotal + iva;

  const costoOrigenTotal = lines.reduce((acc, l) => acc + (l.costoOrigenTotal || 0), 0);
  const totalVolumen = lines.reduce((acc, l) => acc + (l.totalVolumen || 0), 0);

  return { subtotal, iva, total, costoOrigenTotal, totalVolumen };
}
