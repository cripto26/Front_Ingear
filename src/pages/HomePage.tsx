import { useAuth } from "../auth/AuthContext";

export default function HomePage() {
  const { user } = useAuth();
  return (
    <div className="card">
      <h2>Bienvenido</h2>
      <p className="muted">
        Hola <b>{user?.nombre}</b>. Tu rol es <b>{user?.role}</b>.
      </p>
      <p>
        Este frontend está listo para crecer por módulos: Administracion, Logística, Ingeniería y Gerencia.
      </p>
    </div>
  );
}
