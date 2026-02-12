// src/features/cotizador/cotizadorTypes.ts
import type { Producto } from "../../api/productoApi";

export type QuoteDraftV2 = {
  // === Cabecera / datos generales (como en la imagen) ===
  quoteNumber: string;     // Número de cotización
  title: string;           // Título
  account: string;         // Cuenta
  advisor: string;         // Asesor
  paymentTerms: string;    // Forma de pago
  stage: string;           // Etapa de cotización
  quoteType: string;       // Tipo cotización

  projectName: string;     // Proyecto
  contactName: string;     // Contacto
  validUntil: string;      // Válida hasta (YYYY-MM-DD)
  deliveryTime: string;    // Tiempo de entrega
  opportunity: string;     // Oportunidad
  notes: string;           // Notas

  // Si luego quieres “Información de Dirección”, lo dejamos listo:
  city?: string;

  // === Parámetros globales para fórmulas (Excel) ===
  costoTotalDestino: number; // equivalente a la celda N51 en tu Excel
};

export type QuoteLineV2 = {
  id: string;
  itemNo: number;

  product: Producto;

  qty: number;

  // Editables (si tu API no lo trae, lo puedes digitar)
  volumenCm3: number;   // M
  margenFactor: number; // T (ej: 0.70)

  // Calculados (Excel)
  costoOrigen: number;          // L
  totalVolumen: number;         // N
  costoOrigenTotal: number;     // O
  pesoPct: number;              // P
  costoTransporteGrupo: number; // Q
  costoTransporteUnit: number;  // R
  costoCol: number;             // S
  vrVenta: number;              // U
  vrUnitario: number;           // I
  vrTotal: number;              // J
};

export type QuoteTotals = {
  subtotal: number;
  iva: number;
  total: number;

  // Sensibles (opcionales)
  costoOrigenTotal: number; // SUM(O)
  totalVolumen: number;     // SUM(N)
};
