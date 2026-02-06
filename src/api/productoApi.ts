import { http } from "../lib/http";

export type Producto = {
  id: number;
  codigo_producto: string;
  marca?: string | null;
  descripcion?: string | null;

  // Campos “sensibles” (mostrar según rol)
  costo_instalacion?: string | number | null;
  costo_fabrica?: string | number | null;
  descuento_fabricante?: string | number | null;
  costo_ingear?: string | number | null;

  url_imagen?: string | null;
  url_ficha_tecnica?: string | null;

  moneda?: string | null;
  cantidad_inventario?: number;
};

export async function listProductos() {
  return http<Producto[]>("/productos");
}
