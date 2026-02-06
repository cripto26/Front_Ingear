import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AuthState, SessionUser, Role } from "./authTypes";
import { findEmpleadoByLogin } from "../api/empleadoApi";

type AuthContextValue = AuthState & {
  login: (payload: { emailOrCedula: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const LS_KEY = "ingear.session.v1";

function inferRoleFromEmpleado(area?: string | null, cargo?: string | null): Role {
  const text = `${area ?? ""} ${cargo ?? ""}`.toLowerCase();

  if (text.includes("gerencia") || text.includes("director") || text.includes("gerente")) return "GERENCIA";
  if (text.includes("administracion") || text.includes("ventas") || text.includes("cotiz")) return "ADMINISTRACION";
  if (text.includes("logistica") || text.includes("logística") || text.includes("despacho")) return "LOGISTICA";
  if (text.includes("ingenieria") || text.includes("ingeniería")) return "INGENIERIA";

  return "OTRO";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, token: null });

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as AuthState;
      setState(parsed);
    } catch {
      localStorage.removeItem(LS_KEY);
    }
  }, []);

  function persist(next: AuthState) {
    setState(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  }

  async function login(payload: { emailOrCedula: string }) {
    // Auth temporal: buscamos el empleado en tu API /empleados y lo “loggeamos”
    // Cuando tengas JWT, aquí cambias por /auth/login
    const empleado = await findEmpleadoByLogin(payload.emailOrCedula);

    const user: SessionUser = {
      id: empleado.id,
      nombre: empleado.nombre,
      email: empleado.email ?? null,
      area: empleado.area ?? null,
      cargo: empleado.cargo ?? null,
      role: inferRoleFromEmpleado(empleado.area, empleado.cargo)
    };

    persist({ user, token: "mock-token" });
  }

  function logout() {
    persist({ user: null, token: null });
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state.user,
      token: state.token,
      login,
      logout
    }),
    [state.user, state.token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}

export type Role =
  | "ADMINISTRACION"
  | "LOGISTICA"
  | "INGENIERIA"
  | "GERENCIA"
  | "OTRO";

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
