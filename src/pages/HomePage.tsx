import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

type QuickModule = {
  to: string;
  area: string;
  title: string;
  desc: string;
  action: string;
};

export default function HomePage() {
  const { user } = useAuth();
  const role = user?.role ?? "SIN_ROL";

  const modules: QuickModule[] = [
    {
      to: "/cotizador",
      area: "COMERCIAL",
      title: "Cotizador",
      desc: "Crear, revisar y enviar cotizaciones. Control de versión y vigencia.",
      action: "Acceder"
    },
    {
      to: "/administracion",
      area: "ADMIN",
      title: "Administración",
      desc: "Parámetros, clientes, empleados, productos y gestión interna.",
      action: "Acceder"
    },
    {
      to: "/logistica",
      area: "LOGÍSTICA",
      title: "Logística",
      desc: "Despachos, guías, estados, transportadora y trazabilidad.",
      action: "Acceder"
    },
    {
      to: "/ingenieria",
      area: "INGENIERÍA",
      title: "Ingeniería",
      desc: "Revisión técnica, listas de materiales, especificaciones y planos.",
      action: "Acceder"
    }
  ];

  return (
    <>
      {/* Card principal con KPIs */}
      <div className="card">
        <h2>Panel general</h2>
        <p className="muted">
          Indicadores rápidos + accesos por módulos (Home estilo dashboard).
        </p>

        <div className="kpis">
          <div className="kpi">
            <div className="tag">
              <span>Cotizaciones hoy</span>
              <span className="pill">+12%</span>
            </div>
            <div className="val">18</div>
            <div className="spark" />
          </div>

          <div className="kpi">
            <div className="tag">
              <span>Pendientes aprobación</span>
              <span className="pill">3</span>
            </div>
            <div className="val">7</div>
            <div
              className="spark"
              style={{
                borderColor: "rgba(251,191,36,0.22)",
                background:
                  "linear-gradient(90deg, rgba(251,191,36,0), rgba(251,191,36,0.22), rgba(251,191,36,0.05))"
              }}
            />
          </div>

          <div className="kpi">
            <div className="tag">
              <span>En despacho</span>
              <span className="pill">2</span>
            </div>
            <div className="val">5</div>
            <div
              className="spark"
              style={{
                borderColor: "rgba(96,165,250,0.22)",
                background:
                  "linear-gradient(90deg, rgba(96,165,250,0), rgba(96,165,250,0.22), rgba(96,165,250,0.05))"
              }}
            />
          </div>

          <div className="kpi">
            <div className="tag">
              <span>Vencen pronto</span>
              <span className="pill">⚠</span>
            </div>
            <div className="val">4</div>
            <div
              className="spark"
              style={{
                borderColor: "rgba(251,113,133,0.22)",
                background:
                  "linear-gradient(90deg, rgba(251,113,133,0), rgba(251,113,133,0.22), rgba(251,113,133,0.05))"
              }}
            />
          </div>
        </div>
      </div>

      {/* Grid: módulos (izquierda) + actividad (derecha) */}
      <div className="grid" style={{ marginTop: 14 }}>
        <div className="card">
          <h2>Módulos</h2>
          <p className="muted">Entradas rápidas según permisos (por ahora: modo libre).</p>

          <div className="modules">
            {modules.map((m) => (
              <Link key={m.to} className="module" to={m.to}>
                <div className="rowLine">
                  <span className="badge">{m.area}</span>
                  <span className="pill">{m.action}</span>
                </div>
                <h3>{m.title}</h3>
                <p>{m.desc}</p>
              </Link>
            ))}
          </div>

          <div className="hint" style={{ marginTop: 12 }}>
            Sesión actual: <span className="strong">{user?.nombre ?? "Invitado"}</span> —{" "}
            <span className="muted">ROL: {role}</span>
          </div>
        </div>

        <div className="card">
          <h2>Actividad</h2>
          <p className="muted">Últimos movimientos (mockup).</p>

          <div className="list">
            <div className="item">
              <div>
                <b>COT-2026-00128</b>
                <span>Enviada al cliente • hace 12 min</span>
              </div>
              <span className="pill">OK</span>
            </div>

            <div className="item">
              <div>
                <b>Proyecto “Centro Comercial”</b>
                <span>Nuevo ítem agregado • hace 1 h</span>
              </div>
              <span className="pill">+</span>
            </div>

            <div className="item">
              <div>
                <b>Despacho #4481</b>
                <span>Actualización de estado • hoy</span>
              </div>
              <span className="pill">⏱</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
