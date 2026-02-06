import { http } from "../lib/http";

export type Cliente = {
  id: number;
  razon_social: string;
  nit: string;
  email?: string | null;
  telefono?: string | null;
  ciudad?: string | null;
};

export async function listClientes() {
  return http<Cliente[]>("/clientes");
}
