import { useEffect, useMemo, useState } from "react";
import { getProducts } from "../api/products.api";
import type { Product } from "../types/api";

import "../styles/products-page.css";

export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // ✅ filtros
  const [skuQuery, setSkuQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getProducts();
      setItems(data);
    } catch (e: any) {
      setError(e?.message ?? "No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // ✅ lista de categorías para el dropdown
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of items) {
      const c = (p.category ?? "").trim();
      if (c) set.add(c);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  // ✅ filas filtradas
  const rows = useMemo(() => {
    const q = skuQuery.trim().toLowerCase();
    return items.filter((p) => {
      const catOk =
        categoryFilter === "ALL"
          ? true
          : (p.category ?? "").trim() === categoryFilter;

      const sku = (p.sku ?? "").trim().toLowerCase();
      const skuOk = q === "" ? true : sku.includes(q);

      return catOk && skuOk;
    });
  }, [items, skuQuery, categoryFilter]);

  return (
    <div className="dm-page">
      <div className="dm-page__header">
        <div>
          <h1 className="dm-title">Productos</h1>
          <p className="dm-subtitle">
            Filtra por categoría y busca por SKU para encontrar productos rápido.
          </p>
        </div>

        <button className="dm-btn dm-btn--ghost" onClick={load} disabled={loading}>
          {loading ? "Cargando..." : "Refrescar"}
        </button>
      </div>

      {/* ✅ barra de filtros */}
      <div className="dm-toolbar">
        <div className="dm-toolbar__group">
          <label className="dm-label" htmlFor="skuSearch">Buscar por SKU</label>
          <input
            id="skuSearch"
            className="dm-input"
            placeholder="Ej. ABC-123"
            value={skuQuery}
            onChange={(e) => setSkuQuery(e.target.value)}
          />
        </div>

        <div className="dm-toolbar__group">
          <label className="dm-label" htmlFor="catFilter">Categoría</label>
          <select
            id="catFilter"
            className="dm-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">Todas</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="dm-toolbar__meta">
          <span className="dm-muted">
            Mostrando <b>{rows.length}</b> de <b>{items.length}</b>
          </span>
          <button
            className="dm-btn dm-btn--ghost"
            onClick={() => {
              setSkuQuery("");
              setCategoryFilter("ALL");
            }}
            disabled={loading || (skuQuery === "" && categoryFilter === "ALL")}
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {error ? <div className="dm-alert dm-alert--error">{error}</div> : null}

      <section className="dm-card">
        <table className="dm-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>SKU</th>
              <th>Precio</th>
              <th>Stock</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 && !loading ? (
              <tr>
                <td colSpan={5} className="dm-empty">
                  No hay resultados con esos filtros.
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id}>
                  <td className="dm-name">
                    <div className="dm-name__main">{p.name}</div>
                  </td>

                  <td>
                    {p.category && p.category.trim() ? (
                      <span className="dm-badgeCell">{p.category}</span>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="dm-mono">{p.sku && p.sku.trim() ? p.sku : "—"}</td>

                  <td className="dm-right dm-mono">
                    {Number.isFinite(p.price) ? `$${p.price.toFixed(2)}` : "—"}
                  </td>

                  <td className="dm-right dm-mono">
                    <span className={p.stock <= 0 ? "dm-pill dm-pill--danger" : "dm-pill"}>
                      {p.stock}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}