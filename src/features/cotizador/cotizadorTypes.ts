import type { Producto } from "../../api/productoApi";

export type QuoteLine = {
  product: Producto;
  qty: number;
  salePrice: number; // precio de venta (visible para roles permitidos)
};

export type QuoteDraft = {
  customerName: string;
  projectName: string;
  city: string;
  notes: string;
  lines: QuoteLine[];
};
