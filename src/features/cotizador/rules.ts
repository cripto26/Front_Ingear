import type { SessionUser } from "../../auth/authTypes";

export type ModuleKey =
  | "COTIZADOR"
  | "ADMINISTRACION"
  | "LOGISTICA"
  | "INGENIERIA"
  | "GERENCIA";

/**
 * Reglas de acceso por módulo (para cuando vuelvas a activar roles).
 * Por ahora puedes dejar el Sidebar sin filtrar, pero este archivo debe compilar bien.
 */
export function canAccessModule(user: SessionUser | null, module: ModuleKey) {
  if (!user) return false;

  // Gerencia ve todo
  if (user.role === "GERENCIA") return true;

  // Accesos por rol
  if (module === "COTIZADOR") return user.role === "ADMINISTRACION";
  if (module === "ADMINISTRACION") return user.role === "ADMINISTRACION";
  if (module === "LOGISTICA") return user.role === "LOGISTICA";
  if (module === "INGENIERIA") return user.role === "INGENIERIA";
  if (module === "GERENCIA") return user.role === "GERENCIA";

  return false;
}

/**
 * Controla si puede ver datos sensibles: costos, descuentos, márgenes, etc.
 */
export function canViewSensitivePricing(user: SessionUser | null) {
  if (!user) return false;
  return user.role === "GERENCIA" || user.role === "ADMINISTRACION";
}
