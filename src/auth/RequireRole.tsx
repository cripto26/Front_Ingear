import { Navigate } from "react-router-dom";
import { ENV } from "../config/env";
import { useAuth } from "./AuthContext";
import type { Role } from "./authTypes";

export default function RequireRole({
  roles,
  children
}: {
  roles: Role[];
  children: JSX.Element;
}) {
  // En mock dejamos pasar todo
  if ((ENV.AUTH_MODE ?? "mock") === "mock") return children;

  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  if (!roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}
