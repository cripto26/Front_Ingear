import CotizadorUI from "../features/cotizador/CotizadorUI";

export default function CotizadorPage() {
  return (
    <div>
      <div className="pageHeader">
        <h2>Cotizador</h2>
        <p className="muted">Interfaz base (PWA) conectada a tu API de productos.</p>
      </div>
      <CotizadorUI />
    </div>
  );
}
