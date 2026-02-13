// D:\Front\src\api\productoApi.ts
import { http } from "../lib/http";

export type Producto = {
  id: number;

  codigo_producto: string | null; // en BD puede venir null
  referencia?: string | null;
  marca?: string | null;
  descripcion?: string | null;

  costo_instalacion?: string | number | null;
  costo_fabrica?: string | number | null;
  descuento_fabricante?: string | number | null;
  pais_origen?: string | null;
  costo_ingear?: string | number | null;

  fecha_creacion_producto?: string | null;

  url_imagen?: string | null;
  url_ficha_tecnica?: string | null;

  peso_kg?: string | number | null;
  valor_inventario?: string | number | null;

  tipo_producto?: string | null;
  subtipo?: string | null;
  moneda?: string | null;
  arancel?: string | number | null;

  cantidad_inventario?: number | null;

  categoria?: string | null;
  volumen?: string | number | null;
};

export async function listProductos(params?: { skip?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.skip !== undefined) qs.set("skip", String(params.skip));
  if (params?.limit !== undefined) qs.set("limit", String(params.limit));

  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return http<Producto[]>(`/productos${suffix}`);
}

// Trae todos los productos paginando (para que el cotizador pueda buscar en los 10k+)
export async function listProductosAll(opts?: { pageSize?: number; max?: number }) {
  const pageSize = opts?.pageSize ?? 2000;  // ajusta si quieres
  const max = opts?.max ?? 100000;

  let skip = 0;
  const all: Producto[] = [];

  while (all.length < max) {
    const page = await listProductos({ skip, limit: pageSize });
    all.push(...page);

    if (page.length < pageSize) break; // ya no hay más
    skip += pageSize;
  }

  return all;
}
