import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();

  const role = user?.role ?? "SIN_ROL";
  const name = user?.nombre ?? "Invitado";

  return (
    <header className="topbar">
      <div className="chips">
        <div className="chip">PWA</div>
        <div className="chip">Conectado a API</div>
        <div className="chip">Workspace</div>
      </div>

      <div className="user">
        <div className="uinfo">
          <b>{name}</b>
          <span>ROL: {role}</span>
        </div>

        <div className="avatar" />

        {/* Login sigue disponible (modo local), por si lo necesitas */}
        <Link className="btn" to="/login" style={{ textDecoration: "none" }}>
          Ir a Login
        </Link>

        <button className="btn" onClick={logout} type="button">
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
