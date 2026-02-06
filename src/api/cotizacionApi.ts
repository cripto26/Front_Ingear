import { http } from "../lib/http";

export type Cotizacion = {
  id: number;
  consecutivo: string;
  id_cotizador: number;
  url_cotizacion?: string | null;
  tiempo_entrega?: string | null;
  nombre_cotizacion?: string | null;
  tipo_cotizacion?: string | null;
  etapa_cotizacion?: string | null;
  forma_pago?: string | null;
  total?: string | number | null;
  fecha_creacion: string;
};

/**
 * Nota importante:
 * Tu modelo SQLAlchemy exige id_proyecto en Cotizacion, pero tu schema actual no lo incluye.
 * Mientras lo ajustas en la API, en el front trabajaremos el “borrador” local del cotizador.
 */
export async function listCotizaciones() {
  return http<Cotizacion[]>("/cotizaciones");
}
