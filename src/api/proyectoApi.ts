import { http } from "../lib/http";

export type Proyecto = {
  id: number;
  nombre: string;
  oportunidad_id?: number | null;
};

export async function listProyectos() {
  return http<Proyecto[]>("/proyectos");
}
