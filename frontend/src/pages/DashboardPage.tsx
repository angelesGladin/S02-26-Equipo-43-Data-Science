import { useEffect, useMemo, useState } from "react";
import { getDashboardSummary } from "../api/dashboard.api";
import type { DashboardKpis } from "../types/api";
import KpiCardPro from "../components/KpiCardPro";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardKpis | null>(null);
  const [loading, setLoading] = useState(true);

  //  Estados para filtros
  const [range, setRange] = useState<"today" | "last7" | "last30" | "last12">("last30");
  const [category, setCategory] = useState<string>("Todas");

  // Demo datasets 
  const salesByMonth = useMemo(
    () => [
      { m: "Nov", sales: 120, budget: 140 },
      { m: "Dic", sales: 160, budget: 150 },
      { m: "Ene", sales: 180, budget: 170 },
      { m: "Feb", sales: 200, budget: 190 },
    ],
    []
  );

  const load = async () => {
    try {
      setLoading(true);
      const kpis = await getDashboardSummary();
      setData(kpis);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Label humano para el rango (solo UI por ahora)
  const rangeLabel = useMemo(() => {
    switch (range) {
      case "today":
        return "Hoy";
      case "last7":
        return "Últimos 7 días";
      case "last30":
        return "Últimos 30 días";
      case "last12":
        return "Últimos 12 meses";
      default:
        return "Hoy";
    }
  }, [range]);

  // Categorías dinámicas desde la data real (topProductsToday)
  const categoryOptions = useMemo(() => {
    const items = data?.topProductsToday ?? [];
    const set = new Set<string>();

    for (const p of items) {
      set.add(p.category ?? "Sin categoría");
    }

    return ["Todas", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [data]);

  // Filtra el Top 5 
  const filteredTopProducts = useMemo(() => {
    const items = data?.topProductsToday ?? [];
    if (category === "Todas") return items;

    return items.filter((p) => (p.category ?? "Sin categoría") === category);
  }, [data, category]);

  return (
    <div className="page">
      {/* Header */}
      <div className="pageHeader">
        <div className="pageTitle">
          📊 <span>Resumen del Día</span>
        </div>

        <div className="headerActions">
          <button
            className="iconBtn"
            title="Refrescar"
            onClick={load}
            disabled={loading}
          >
            ⟳
          </button>
          <button className="iconBtn" title="Opciones">
            ⋯
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filtersBar">
        <select
          className="select"
          value={range}
          onChange={(e) => setRange(e.target.value as any)}
        >
          <option value="today">Hoy</option>
          <option value="last7">Últimos 7 días</option>
          <option value="last30">Últimos 30 días</option>
          <option value="last12">Últimos 12 meses</option>
        </select>

        <select
          className="select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categoryOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* KPI Row */}
      <div className="kpiRow">
        <KpiCardPro
          label="Ventas Hoy"
          value={loading ? "—" : `$${data?.todaySalesAmount ?? 0}`}
          delta={12.38}
          deltaLabel="vs ayer"
        />
        <KpiCardPro
          label="Tickets Hoy"
          value={loading ? "—" : (data?.todaySalesCount ?? 0)}
          delta={0.6}
          deltaLabel="vs semana pasada"
        />
        <KpiCardPro
          label="Ticket Promedio"
          value={loading ? "—" : `$${(data?.avgTicketToday ?? 0).toFixed(2)}`}
          delta={-1.92}
          deltaLabel="vs mes anterior"
        />
        <KpiCardPro
          label="Productos con Bajo Stock"
          value={loading ? "—" : (data?.lowStockProducts ?? 0)}
          delta={-2.34}
          deltaLabel="vs mes anterior"
        />
      </div>

      {/* Charts row */}
      <div className="grid2">
        {/* Ventas vs Meta  */}
        <div className="card">
          <div className="cardHeader">
            <div>
              <div className="cardTitle">Ventas vs Meta</div>
              <div className="cardSub">Comparación por mes</div>
            </div>
          </div>

          <div className="chartBox">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="m" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  name="Ventas"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="budget"
                  name="Meta"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Productos  */}
        <div className="card">
          <div className="cardHeader">
            <div>
              <div className="cardTitle">Top 5 Productos ({rangeLabel})</div>
              <div className="cardSub">Por cantidad vendida</div>
            </div>
          </div>

          <div style={{ padding: 12 }}>
            {loading ? (
              <div style={{ color: "var(--muted)" }}>Cargando…</div>
            ) : (filteredTopProducts.length ?? 0) === 0 ? (
              <div style={{ color: "var(--muted)" }}>
                No hay datos para este filtro.
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid rgba(0,0,0,0.08)",
                    }}
                  >
                    <th style={{ padding: "10px 6px" }}>Producto</th>
                    <th style={{ padding: "10px 6px" }}>Categoría</th>
                    <th style={{ padding: "10px 6px", textAlign: "right" }}>
                      Qty
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTopProducts.map((p) => (
                    <tr
                      key={p.productId}
                      style={{
                        borderBottom: "1px solid rgba(0,0,0,0.05)",
                      }}
                    >
                      <td style={{ padding: "10px 6px", fontWeight: 700 }}>
                        {p.name}
                      </td>
                      <td style={{ padding: "10px 6px" }}>
                        {p.category ?? "Sin categoría"}
                      </td>
                      <td
                        style={{
                          padding: "10px 6px",
                          textAlign: "right",
                          fontWeight: 800,
                        }}
                      >
                        {p.qtySold}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid2">
        {/* Evolución de Tickets (demo) */}
        <div className="card">
          <div className="cardHeader">
            <div>
              <div className="cardTitle">Evolución de Tickets</div>
              <div className="cardSub">Últimos meses</div>
            </div>
          </div>

          <div className="chartBox">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={salesByMonth.map((x) => ({
                  m: x.m,
                  tickets: Math.round(x.sales / 10),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="m" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="tickets"
                  name="Tickets"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Margen (REAL) */}
        <div className="card">
          <div className="cardHeader">
            <div>
              <div className="cardTitle">Margen Bruto</div>
              <div className="cardSub">Hoy vs Total</div>
            </div>
          </div>

          <div style={{ padding: 12, display: "grid", gap: 10 }}>
            <div
              style={{
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 12,
                padding: 12,
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.7 }}>Hoy</div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>
                ${data?.grossProfitToday ?? 0}
              </div>
            </div>

            <div
              style={{
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 12,
                padding: 12,
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.7 }}>Total</div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>
                ${data?.grossProfitTotal ?? 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}