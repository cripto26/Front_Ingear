// src/features/cotizador/CotizadorUI.tsx
import { useEffect, useMemo, useState } from "react";
import { listProductosAll, type Producto } from "../../api/productoApi";
import { formatCOP } from "../../lib/money";
import { useAuth } from "../../auth/AuthContext";
import { canViewSensitivePricing } from "./rules";

import type { QuoteDraftV2, QuoteLineV2 } from "./cotizadorTypes";
import { buildLineFromProduct, recalcAllLines, calcTotals } from "./calc";
import { generateQuotePdf } from "../../lib/pdf/quotePdf";
import { getDefaultQuoteTemplateDataUrl } from "../../lib/pdf/template";

type TabKey = "VISION_GLOBAL" | "DIRECCION" | "COTIZADOR";

// ✅ Opciones según tus imágenes
const PAYMENT_TERMS = [
  "A Convenir",
  "Anticipado",
  "Anticipo 30% - Restante con Factura a 30 días",
  "Anticipo 50% - Restante con Factura a 30 días",
  "Crédito con Factura 30 días",
  "Crédito con Factura 45 días",
  "Restante 50% previa entrega",
  "Restante con Factura a 45 días",
  "Restante con Factura a 60 días",
  "Anticipo 50% - Restante Previa Entrega",
];

const STAGES = [
  "Borrador",
  "Negociación",
  "Enviado",
  "En Espera",
  "Confirmado",
  "Ganada",
  "Ganada Parcial",
  "Perdido",
  "Cerrado Muerto",
];

const QUOTE_TYPES = ["Normal", "Licitación"];

const DELIVERY_TIMES = [
  "Inmediata",
  "2-3 Días Hábiles",
  "5-8 Días Hábiles",
  "10-15 Días Hábiles",
  "1-2 Semanas",
  "2-3 Semanas",
  "3-4 Semanas",
  "5-6 Semanas",
  "6-8 Semanas",
  "8-10 Semanas",
  "120 Días Calendario",
  "60 Días Calendario",
  "45 Días Calendario",
  "30 Días Calendario",
  "A Convenir",
];

export default function CotizadorUI() {
  const { user } = useAuth();
  const allowSensitive = canViewSensitivePricing(user);

  const [tab, setTab] = useState<TabKey>("COTIZADOR");

  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [codigoInput, setCodigoInput] = useState("");
  const [lineError, setLineError] = useState<string | null>(null);

  const [pdfLoading, setPdfLoading] = useState(false);

  const [draft, setDraft] = useState<QuoteDraftV2>({
    quoteNumber: "",
    title: "",
    account: "",
    advisor: user?.nombre ?? "",

    // ✅ defaults (puedes cambiarlos)
    paymentTerms: "Anticipo 30% - Restante con Factura a 30 días",
    stage: "Borrador",
    quoteType: "Normal",

    projectName: "",
    contactName: "",
    validUntil: "",

    // ✅ ahora será select
    deliveryTime: "",

    opportunity: "",
    notes: "",

    city: "",
    costoTotalDestino: 0,
  });

  const [lines, setLines] = useState<QuoteLineV2[]>([]);

  // ✅ Cargar TODOS los productos (para que el search por codigo_producto funcione en 10k+)
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const data = await listProductosAll();
        setProducts(data);
      } catch (e: any) {
        setErr(e?.message ?? "No se pudo cargar productos");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!draft.advisor?.trim() && user?.nombre) {
      setDraft((d) => ({ ...d, advisor: user.nombre }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.nombre]);

  const computedLines = useMemo(() => {
    return recalcAllLines(lines, draft.costoTotalDestino);
  }, [lines, draft.costoTotalDestino]);

  const totals = useMemo(() => calcTotals(computedLines), [computedLines]);

  function normalizeCode(v: string) {
    return v.trim();
  }

  function findByCodigoProducto(code: string) {
    const cleaned = normalizeCode(code);
    if (!cleaned) return null;

    // exact
    const exact = products.find(
      (p) => String(p.codigo_producto ?? "").trim() === cleaned
    );
    if (exact) return exact;

    // contains / case-insensitive
    const lowered = cleaned.toLowerCase();
    return (
      products.find((p) =>
        String(p.codigo_producto ?? "").toLowerCase().includes(lowered)
      ) ?? null
    );
  }

  function addLineByCodigoProducto() {
    const code = normalizeCode(codigoInput);
    if (!code) return;

    const product = findByCodigoProducto(code);
    if (!product) {
      setLineError(
        `No encontré el producto con código "${code}" en la base de datos. Asegúrate de pegar el valor de la columna codigo_producto (no la referencia).`
      );
      return;
    }

    setLineError(null);

    setLines((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        return prev.map((l) =>
          l.product.id === product.id ? { ...l, qty: l.qty + 1 } : l
        );
      }
      const itemNo = prev.length + 1;
      return [...prev, buildLineFromProduct({ product, itemNo, qty: 1 })];
    });

    setCodigoInput("");
  }

  function updateLine(id: string, patch: Partial<QuoteLineV2>) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function removeLine(id: string) {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }

  function clearAll() {
    setDraft((d) => ({
      ...d,
      quoteNumber: "",
      title: "",
      account: "",
      advisor: user?.nombre ?? "",
      paymentTerms: "Anticipo 30% - Restante con Factura a 30 días",
      stage: "Borrador",
      quoteType: "Normal",
      projectName: "",
      contactName: "",
      validUntil: "",
      deliveryTime: "",
      opportunity: "",
      notes: "",
      city: "",
      costoTotalDestino: 0,
    }));
    setLines([]);
    setCodigoInput("");
    setLineError(null);
    setErr(null);
  }

  async function onGeneratePdf() {
    try {
      setPdfLoading(true);
      setErr(null);

      const templateDataUrl = await getDefaultQuoteTemplateDataUrl();

      await generateQuotePdf({
        draft,
        lines: computedLines,
        totals,
        // ✅ evita error TS si el tipo espera string | undefined
        templateDataUrl: templateDataUrl ?? undefined,
        showSensitive: allowSensitive,
      });
    } catch (e: any) {
      setErr(e?.message ?? "No se pudo generar el PDF");
    } finally {
      setPdfLoading(false);
    }
  }

  function onSave() {
    if (!draft.title.trim()) {
      setErr("El campo Título es obligatorio.");
      return;
    }
    setErr(null);
    alert("OK: luego conectamos este Guardar a tu API.");
  }

  function onCancel() {
    clearAll();
  }

  const showCotizador = tab === "COTIZADOR";
  const showDireccion = tab === "DIRECCION";
  const showVision = tab === "VISION_GLOBAL";

  return (
    <div>
      {/* Header superior */}
      <div
        className="rowLine"
        style={{ justifyContent: "space-between", alignItems: "flex-end" }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>Crear</h1>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <button className="btn" onClick={onSave}>
            GUARDAR
          </button>
          <button className="btn" onClick={onCancel}>
            CANCELAR
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="row" style={{ marginTop: 14, gap: 10, flexWrap: "wrap" }}>
        <button className="chip" onClick={() => setTab("VISION_GLOBAL")}>
          Visión Global
        </button>
        <button className="chip" onClick={() => setTab("DIRECCION")}>
          Información de Dirección
        </button>
        <button className="chip" onClick={() => setTab("COTIZADOR")}>
          Cotizador
        </button>
      </div>

      {loading && <p style={{ marginTop: 12 }}>Cargando productos…</p>}
      {err && <div className="error">{err}</div>}

      {showVision && (
        <div className="module" style={{ marginTop: 14 }}>
          <h3>Visión Global</h3>
          <div className="kv">
            <span>Ítems</span>
            <b>{computedLines.length}</b>

            <span>Subtotal</span>
            <b>{formatCOP(totals.subtotal)}</b>

            <span>IVA</span>
            <b>{formatCOP(totals.iva)}</b>

            <span>Total</span>
            <b>{formatCOP(totals.total)}</b>
          </div>
        </div>
      )}

      {showDireccion && (
        <div className="module" style={{ marginTop: 14 }}>
          <h3>Información de Dirección</h3>
          <div className="formGrid" style={{ marginTop: 10 }}>
            <label>
              Ciudad
              <input
                className="input"
                value={draft.city ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))}
                placeholder="Medellín"
              />
            </label>
          </div>
        </div>
      )}

      {showCotizador && (
        <>
          <div className="module" style={{ marginTop: 14 }}>
            <h3>Datos de la cotización</h3>

            <div className="formGrid" style={{ marginTop: 10 }}>
              <label>
                Número de Cotización
                <input
                  className="input"
                  value={draft.quoteNumber}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, quoteNumber: e.target.value }))
                  }
                  placeholder="Ej: COT-000123"
                />
              </label>

              <label>
                Proyecto
                <input
                  className="input"
                  value={draft.projectName}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, projectName: e.target.value }))
                  }
                  placeholder="Nombre del proyecto"
                />
              </label>

              <label className="span2">
                Título <span style={{ color: "#fb7185" }}>*</span>
                <input
                  className="input"
                  value={draft.title}
                  onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                  placeholder="Título de la cotización"
                />
              </label>

              <label>
                Cuenta
                <input
                  className="input"
                  value={draft.account}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, account: e.target.value }))
                  }
                  placeholder="Cliente / Cuenta"
                />
              </label>

              <label>
                Contacto
                <input
                  className="input"
                  value={draft.contactName}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, contactName: e.target.value }))
                  }
                  placeholder="Nombre del contacto"
                />
              </label>

              <label>
                Asesor
                <input
                  className="input"
                  value={draft.advisor}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, advisor: e.target.value }))
                  }
                  placeholder="Asesor responsable"
                />
              </label>

              <label>
                Válida Hasta <span style={{ color: "#fb7185" }}>*</span>
                <input
                  className="input"
                  type="date"
                  value={draft.validUntil}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, validUntil: e.target.value }))
                  }
                />
              </label>

              {/* ✅ Forma de Pago */}
              <label>
                Forma de Pago
                <select
                  className="input"
                  value={draft.paymentTerms}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, paymentTerms: e.target.value }))
                  }
                >
                  {PAYMENT_TERMS.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </label>

              {/* ✅ Tiempo de Entrega */}
              <label>
                Tiempo de Entrega <span style={{ color: "#fb7185" }}>*</span>
                <select
                  className="input"
                  value={draft.deliveryTime}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, deliveryTime: e.target.value }))
                  }
                >
                  <option value="">(Selecciona)</option>
                  {DELIVERY_TIMES.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </label>

              {/* ✅ Etapa */}
              <label>
                Etapa de Cotización <span style={{ color: "#fb7185" }}>*</span>
                <select
                  className="input"
                  value={draft.stage}
                  onChange={(e) => setDraft((d) => ({ ...d, stage: e.target.value }))}
                >
                  {STAGES.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Oportunidad
                <input
                  className="input"
                  value={draft.opportunity}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, opportunity: e.target.value }))
                  }
                  placeholder="Ej: OPP-00045"
                />
              </label>

              {/* ✅ Tipo Cotización */}
              <label>
                Tipo Cotización <span style={{ color: "#fb7185" }}>*</span>
                <select
                  className="input"
                  value={draft.quoteType}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, quoteType: e.target.value }))
                  }
                >
                  {QUOTE_TYPES.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </label>

              <label className="span2">
                Notas
                <textarea
                  className="input"
                  style={{ minHeight: 120, resize: "vertical" }}
                  value={draft.notes}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, notes: e.target.value }))
                  }
                  placeholder="Notas / condiciones / observaciones"
                />
              </label>

              {allowSensitive && (
                <label>
                  Costo total destino (para transporte)
                  <input
                    className="input"
                    type="number"
                    value={draft.costoTotalDestino}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        costoTotalDestino: Number(e.target.value || 0),
                      }))
                    }
                    placeholder="0"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Agregar ítem por código_producto */}
          <div className="module" style={{ marginTop: 14 }}>
            <div className="rowLine">
              <div>
                <h3>Agregar ítem por código</h3>
                <p>Escribe el <b>codigo_producto</b> (columna codigo_producto en Postgres) y presiona agregar.</p>
              </div>

              <div className="row" style={{ gap: 10 }}>
                <input
                  className="input"
                  value={codigoInput}
                  onChange={(e) => setCodigoInput(e.target.value)}
                  placeholder="codigo_producto (Ej: TL534B-20WW)"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addLineByCodigoProducto();
                  }}
                  style={{ minWidth: 320 }}
                />
                <button className="btn" onClick={addLineByCodigoProducto}>
                  + Agregar
                </button>
              </div>
            </div>

            {lineError && <div className="error">{lineError}</div>}

            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ítem</th>
                    <th>Marca</th>
                    <th>Código</th>
                    <th>Referencia</th>
                    <th>Descripción</th>
                    <th>Qty</th>
                    <th>Vr Unitario</th>
                    <th>Vr Total</th>

                    {allowSensitive && <th>Costo Origen</th>}
                    {allowSensitive && <th>Costo Col</th>}
                    {allowSensitive && <th>Margen (T)</th>}

                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {computedLines.length === 0 ? (
                    <tr>
                      <td colSpan={allowSensitive ? 12 : 9} style={{ color: "var(--muted)" }}>
                        Agrega ítems escribiendo el <b>codigo_producto</b>.
                      </td>
                    </tr>
                  ) : (
                    computedLines.map((l) => (
                      <tr key={l.id}>
                        <td>{l.itemNo}</td>
                        <td>{l.product.marca}</td>
                        <td>{l.product.codigo_producto}</td>
                        <td className="tdWrap">{l.product.referencia}</td>
                        <td className="tdWrap">{l.product.descripcion}</td>

                        <td>
                          <input
                            className="input"
                            type="number"
                            value={l.qty}
                            min={1}
                            onChange={(e) =>
                              updateLine(l.id, { qty: Number(e.target.value || 1) })
                            }
                            style={{ width: 80 }}
                          />
                        </td>

                        <td>{formatCOP(l.vrUnitario)}</td>
                        <td>{formatCOP(l.vrTotal)}</td>

                        {allowSensitive && <td>{formatCOP(l.costoOrigen)}</td>}
                        {allowSensitive && <td>{formatCOP(l.costoCol)}</td>}
                        {allowSensitive && (
                          <td>
                            <input
                              className="input"
                              type="number"
                              step="0.01"
                              value={l.margenFactor}
                              onChange={(e) =>
                                updateLine(l.id, {
                                  margenFactor: Number(e.target.value || 0),
                                })
                              }
                              style={{ width: 90 }}
                            />
                          </td>
                        )}

                        <td>
                          <button className="btn" onClick={() => removeLine(l.id)}>
                            Quitar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <p style={{ marginTop: 8, color: "var(--muted)", fontSize: 12 }}>
              * Columnas comunes visibles para todos. Columnas sensibles solo aparecen si tu rol permite ver costos/márgenes.
            </p>
          </div>

          {/* Resumen */}
          <div className="module" style={{ marginTop: 14 }}>
            <div className="rowLine">
              <div>
                <h3>Resumen</h3>
                <p>Totales calculados.</p>
              </div>

              <div className="row" style={{ gap: 10 }}>
                <button className="btn" onClick={clearAll}>
                  Limpiar
                </button>
                <button className="btn" onClick={onGeneratePdf} disabled={pdfLoading}>
                  {pdfLoading ? "Generando..." : "Generar PDF"}
                </button>
              </div>
            </div>

            <div className="kv">
              <span>Subtotal</span>
              <b>{formatCOP(totals.subtotal)}</b>

              <span>IVA (19%)</span>
              <b>{formatCOP(totals.iva)}</b>

              <span>Total</span>
              <b>{formatCOP(totals.total)}</b>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
