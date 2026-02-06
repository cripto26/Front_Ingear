import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

type LinkItem = { to: string; label: string };

const links: LinkItem[] = [
  { to: "/", label: "Inicio" },
  { to: "/cotizador", label: "Cotizador" },
  { to: "/administracion", label: "Administración" },
  { to: "/logistica", label: "Logística" },
  { to: "/ingenieria", label: "Ingeniería" },
  { to: "/gerencia", label: "Gerencia" }
];

/**
 * En este momento NO estamos aplicando permisos por rol (para enfocarnos en el Cotizador).
 * Luego, cuando retomes login/roles, volvemos a filtrar links por rol/módulo.
 */
export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brandDot" />
        <div>
          <div className="brandName">Ingear</div>
          <div className="brandSub">{user ? `Rol: ${user.role}` : "Modo local"}</div>
        </div>
      </div>

      <nav className="nav">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) => (isActive ? "navItem active" : "navItem")}
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
