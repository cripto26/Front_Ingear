import { useEffect, useMemo, useState } from "react";
import { listProductos, type Producto } from "../../api/productoApi";
import { formatCOP, toNumber } from "../../lib/money";
import { useAuth } from "../../auth/AuthContext";
import { canViewSensitivePricing } from "./rules";
import type { QuoteDraft, QuoteLine } from "./cotizadorTypes";

function calcSuggestedSale(product: Producto) {
  // Regla inicial (placeholder): venta = costo_ingear * 1.25
  // Ajusta con márgenes reales después
  const base = toNumber(product.costo_ingear);
  if (!base) return 0;
  return base * 1.25;
}

export default function CotizadorUI() {
  const { user } = useAuth();
  const allowSensitive = canViewSensitivePricing(user);

  const [products, setProducts] = useState<Producto[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [draft, setDraft] = useState<QuoteDraft>({
    customerName: "",
    projectName: "",
    city: "",
    notes: "",
    lines: []
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await listProductos();
        setProducts(data);
      } catch (e: any) {
        setErr(e?.message ?? "No se pudo cargar productos");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products.slice(0, 50);
    return products
      .filter((p) => {
        const a = (p.codigo_producto ?? "").toLowerCase();
        const b = (p.marca ?? "").toLowerCase();
        const c = (p.descripcion ?? "").toLowerCase();
        return a.includes(q) || b.includes(q) || c.includes(q);
      })
      .slice(0, 50);
  }, [products, query]);

  function addLine(product: Producto) {
    setDraft((d) => {
      const existing = d.lines.find((l) => l.product.id === product.id);
      if (existing) {
        return {
          ...d,
          lines: d.lines.map((l) =>
            l.product.id === product.id ? { ...l, qty: l.qty + 1 } : l
          )
        };
      }
      const suggested = calcSuggestedSale(product);
      const newLine: QuoteLine = { product, qty: 1, salePrice: suggested };
      return { ...d, lines: [newLine, ...d.lines] };
    });
  }

  function updateQty(productId: number, qty: number) {
    setDraft((d) => ({
      ...d,
      lines: d.lines.map((l) => (l.product.id === productId ? { ...l, qty } : l))
    }));
  }

  function updateSalePrice(productId: number, salePrice: number) {
    setDraft((d) => ({
      ...d,
      lines: d.lines.map((l) => (l.product.id === productId ? { ...l, salePrice } : l))
    }));
  }

  function removeLine(productId: number) {
    setDraft((d) => ({ ...d, lines: d.lines.filter((l) => l.product.id !== productId) }));
  }

  const totals = useMemo(() => {
    const subtotal = draft.lines.reduce((acc, l) => acc + l.qty * (l.salePrice || 0), 0);
    const iva = subtotal * 0.19;
    const total = subtotal + iva;

    // margen aproximado (si tenemos costo_ingear y permisos)
    const cost = draft.lines.reduce((acc, l) => acc + l.qty * toNumber(l.product.costo_ingear), 0);
    const gross = subtotal - cost;
    const marginPct = subtotal ? (gross / subtotal) * 100 : 0;

    return { subtotal, iva, total, cost, gross, marginPct };
  }, [draft.lines]);

  return (
    <div className="grid2">
      <div className="card">
        <h3>Datos de la cotización (borrador)</h3>

        <div className="formGrid">
          <label>
            Cliente
            <input
              value={draft.customerName}
              onChange={(e) => setDraft((d) => ({ ...d, customerName: e.target.value }))}
              placeholder="Razón social"
            />
          </label>

          <label>
            Proyecto
            <input
              value={draft.projectName}
              onChange={(e) => setDraft((d) => ({ ...d, projectName: e.target.value }))}
              placeholder="Nombre del proyecto"
            />
          </label>

          <label>
            Ciudad
            <input
              value={draft.city}
              onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))}
              placeholder="Medellín"
            />
          </label>

          <label className="span2">
            Observaciones
            <textarea
              value={draft.notes}
              onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
              placeholder="Notas internas / condiciones"
              rows={3}
            />
          </label>
        </div>

        <div className="cardSub">
          <h4>Resumen</h4>
          <div className="kv">
            <div>Subtotal</div>
            <div>{formatCOP(totals.subtotal)}</div>

            <div>IVA (19%)</div>
            <div>{formatCOP(totals.iva)}</div>

            <div className="strong">Total</div>
            <div className="strong">{formatCOP(totals.total)}</div>

            {allowSensitive && (
              <>
                <div>Costo (aprox)</div>
                <div>{formatCOP(totals.cost)}</div>

                <div>Utilidad bruta (aprox)</div>
                <div>{formatCOP(totals.gross)}</div>

                <div>Margen (%)</div>
                <div>{totals.marginPct.toFixed(2)}%</div>
              </>
            )}
          </div>
          {!allowSensitive && (
            <div className="hint">
              * Tu rol no permite ver costos/descuentos/márgenes. (Esto se controla por rol.)
            </div>
          )}
        </div>

        <div className="hint">
          Esta pantalla es UI base del cotizador. La creación de cotizaciones en BD la activamos cuando tu
          API tenga `id_proyecto` en el schema de Cotización. :contentReference[oaicite:2]{index=2}
        </div>
      </div>

      <div className="card">
        <h3>Catálogo de productos</h3>

        <div className="row">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por código, marca o descripción..."
          />
          <div className="pill">{products.length} productos</div>
        </div>

        {loading && <p className="muted">Cargando...</p>}
        {err && <div className="error">{err}</div>}

        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Marca</th>
                <th>Descripción</th>
                <th>Inventario</th>
                {allowSensitive && <th>Costo Ingear</th>}
                <th>Agregar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>{p.codigo_producto}</td>
                  <td>{p.marca ?? "-"}</td>
                  <td className="tdWrap">{p.descripcion ?? "-"}</td>
                  <td>{p.cantidad_inventario ?? 0}</td>
                  {allowSensitive && <td>{formatCOP(toNumber(p.costo_ingear))}</td>}
                  <td>
                    <button className="btn" onClick={() => addLine(p)}>
                      + Añadir
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={allowSensitive ? 6 : 5} className="muted">
                    Sin resultados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <h3 style={{ marginTop: 18 }}>Items de cotización</h3>
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cant.</th>
                <th>Precio venta</th>
                {allowSensitive && <th>Costo</th>}
                {allowSensitive && <th>Utilidad</th>}
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {draft.lines.map((l) => {
                const sub = l.qty * (l.salePrice || 0);
                const cost = l.qty * toNumber(l.product.costo_ingear);
                const profit = sub - cost;

                return (
                  <tr key={l.product.id}>
                    <td>
                      <div className="strong">{l.product.codigo_producto}</div>
                      <div className="muted">{l.product.descripcion ?? ""}</div>
                    </td>
                    <td style={{ width: 90 }}>
                      <input
                        type="number"
                        min={1}
                        value={l.qty}
                        onChange={(e) => updateQty(l.product.id, Math.max(1, Number(e.target.value)))}
                      />
                    </td>
                    <td style={{ width: 160 }}>
                      <input
                        type="number"
                        min={0}
                        value={l.salePrice}
                        onChange={(e) => updateSalePrice(l.product.id, Number(e.target.value))}
                      />
                    </td>

                    {allowSensitive && <td>{formatCOP(cost)}</td>}
                    {allowSensitive && <td>{formatCOP(profit)}</td>}

                    <td>{formatCOP(sub)}</td>
                    <td style={{ width: 90 }}>
                      <button className="btnDanger" onClick={() => removeLine(l.product.id)}>
                        Quitar
                      </button>
                    </td>
                  </tr>
                );
              })}

              {draft.lines.length === 0 && (
                <tr>
                  <td colSpan={allowSensitive ? 7 : 5} className="muted">
                    Agrega productos desde el catálogo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="row" style={{ justifyContent: "flex-end", marginTop: 12 }}>
          <button className="btn" onClick={() => setDraft((d) => ({ ...d, lines: [] }))}>
            Limpiar
          </button>
          <button className="btnPrimary" disabled>
            Guardar cotización (pendiente API)
          </button>
        </div>
      </div>
    </div>
  );
}
