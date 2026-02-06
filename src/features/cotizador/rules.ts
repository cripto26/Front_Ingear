import type { SessionUser } from "../../auth/authTypes";

export type ModuleKey = "COTIZADOR" | "ADMINISTRACION" | "LOGISTICA" | "INGENIERIA" | "GERENCIA";

export function canAccessModule(user: SessionUser | null, module: ModuleKey) {
  if (!user) return false;
  if (user.role === "GERENCIA") return true;

  if (module === "COTIZADOR") return user.role === "ADMINISTRACION";
  if (module === "ADMINISTRACION") return user.role === "ADMINISTRACION";
  if (module === "LOGISTICA") return user.role === "LOGISTICA";
  if (module === "INGENIERIA") return user.role === "INGENIERIA";
  if (module === "GERENCIA") return user.role === "GERENCIA";

  return false;
}

export function canViewSensitivePricing(user: SessionUser | null) {
  // Ajusta esto como quieras:
  // - ADMINISTRACION y Gerencia ven costos/descuentos/márgenes
  // - Logística e Ingeniería no los ven
  if (!user) return false;
  return user.role === "GERENCIA" || user.role === "ADMINISTRACION";