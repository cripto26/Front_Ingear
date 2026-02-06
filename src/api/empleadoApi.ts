import { http } from "../lib/http";

export type Empleado = {
  id: number;
  nombre: string;
  email?: string | null;
  cargo?: string | null;
  area?: string | null;
  estado?: string | null;
  cedula?: string | null;
  telefono?: string | null;
};

export async function listEmpleados() {
  return http<Empleado[]>("/empleados");
}

/**
 * Login temporal:
 * - busca por email o cédula dentro de /empleados
 * - si no existe, error
 */
export async function findEmpleadoByLogin(emailOrCedula: string) {
  const empleados = await listEmpleados();
  const key = emailOrCedula.trim().toLowerCase();

  const found = empleados.find((e) => {
    const email = (e.email ?? "").toLowerCase();
    const ced = (e.cedula ?? "").toLowerCase();
    return email === key || ced === key;
  });

  if (!found) {
    throw new Error("Empleado no encontrado. Verifica email o cédula.");
  }
  return found;
}
