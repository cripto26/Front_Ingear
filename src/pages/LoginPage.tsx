import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [emailOrCedula, setEmailOrCedula] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login({ emailOrCedula });
      nav("/", { replace: true });
    } catch (error: any) {
      setErr(error?.message ?? "Error iniciando sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="center">
      <div className="card" style={{ width: 420 }}>
        <h1>Ingear</h1>
        <p className="muted">Ingresa con email o cédula (modo temporal).</p>

        <form onSubmit={onSubmit} className="form">
          <label>
            Email o Cédula
            <input
              value={emailOrCedula}
              onChange={(e) => setEmailOrCedula(e.target.value)}
              placeholder="usuario@ingear.co o 12345678"
              required
            />
          </label>

          {err && <div className="error">{err}</div>}

          <button className="btnPrimary" disabled={loading}>
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
