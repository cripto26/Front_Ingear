import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="topbarLeft">
        <div className="topbarTitle">Cotizador</div>
      </div>

      <div className="topbarRight">
        <div className="user">
          <div className="userName">{user?.nombre ?? "Invitado"}</div>
          <div className="userRole">{user?.role ?? "SIN_ROL"}</div>
        </div>

        {/* Dejamos login disponible, pero no es obligatorio */}
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
