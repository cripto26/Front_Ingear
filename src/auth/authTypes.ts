

export type SessionUser = {
  id: number;
  nombre: string;
  email?: string | null;
  area?: string | null;
  cargo?: string | null;
  role: Role;
};

export type AuthState = {
  user: SessionUser | null;
  token: string | null; // placeholder para futuro JWT
};

export type Role =
  | "ADMINISTRACION"
  | "LOGISTICA"
  | "INGENIERIA"
  | "GERENCIA"
  | "OTRO";
