import { useEffect, useMemo, useState } from "react";
import { createSale } from "../api/sales.api";
import { getProducts } from "../api/products.api";
import { getAccounts, type Account } from "../api/accounts.api";

import type { Product } from "../types/api";
import "../styles/sales-page.css";

type UiState = "idle" | "loading" | "success" | "error";
type SaleMode = "B2C" | "B2B";

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productQuery, setProductQuery] = useState<string>(""); // SKU
  const [productId, setProductId] = useState<string>("");
  const [qty, setQty] = useState<number>(1);

  const [mode, setMode] = useState<SaleMode>("B2C"); // B2C vs B2B
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountQuery, setAccountQuery] = useState<string>(""); // buscar RUC/DNI
  const [accountId, setAccountId] = useState<string>(""); // ✅ customerId

  const [uiState, setUiState] = useState<UiState>("idle");
  const [message, setMessage] = useState<string>("");

  const [lastSale, setLastSale] = useState<{
    productName: string;
    qty: number;
    total: number;
    at: string;
    mode: SaleMode;
    accountLabel?: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getProducts();
        setProducts(data);

        const first = data?.find((p) => p.isActive) ?? data?.[0];
        if (first) setProductId(first.id);
      } catch (e: any) {
        setUiState("error");
        setMessage(e?.message ?? "No se pudieron cargar los productos.");
      }
    })();
  }, []);

  // ✅ cargar cuentas solo cuando sea B2B
  useEffect(() => {
    (async () => {
      if (mode !== "B2B") return;

      try {
        const data = await getAccounts("B2B");
        setAccounts(data);

        // no autoselecciono cuenta; el usuario decide
        setAccountId("");
      } catch (e: any) {
        setUiState("error");
        setMessage(e?.message ?? "No se pudieron cargar las cuentas B2B.");
      }
    })();
  }, [mode]);

  // ✅ filtrar productos por SKU / nombre
  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    const base = products.filter((p) => p.isActive);

    if (!q) return base;

    return base.filter((p) => {
      const name = (p.name ?? "").toLowerCase();
      const sku = (p.sku ?? "").toLowerCase();
      return name.includes(q) || sku.includes(q);
    });
  }, [products, productQuery]);

  // si el producto seleccionado ya no está en la lista filtrada, no lo rompas
  useEffect(() => {
    if (!productId && filteredProducts.length > 0) {
      setProductId(filteredProducts[0].id);
      return;
    }
    if (productId && filteredProducts.length > 0) {
      const exists = filteredProducts.some((p) => p.id === productId);
      if (!exists) setProductId(filteredProducts[0].id);
    }
  }, [filteredProducts, productId]);

  const selected = useMemo(
    () => products.find((p) => p.id === productId),
    [products, productId]
  );

  const stock = selected?.stock ?? 0;
  const price = Number(selected?.price ?? 0);
  const subtotal = useMemo(() => {
    const q = Number.isFinite(qty) ? qty : 0;
    return Math.max(0, q) * (Number.isFinite(price) ? price : 0);
  }, [qty, price]);

  // ✅ filtrar cuentas por RUC/DNI o nombre empresa
  const filteredAccounts = useMemo(() => {
    const q = accountQuery.trim().toLowerCase();
    if (!q) return accounts;

    return accounts.filter((a) => {
      const doc = (a.documentNumber ?? "").toLowerCase();
      const name = (a.companyName ?? a.fullName ?? "").toLowerCase();
      return doc.includes(q) || name.includes(q);
    });
  }, [accounts, accountQuery]);

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === accountId),
    [accounts, accountId]
  );

  const qtyError = useMemo(() => {
    if (!selected) return "Selecciona un producto.";
    if (!Number.isFinite(qty) || qty <= 0) return "La cantidad debe ser mayor a 0.";
    if (qty > stock) return `No hay stock suficiente (disponible: ${stock}).`;
    return "";
  }, [qty, stock, selected]);

  const accountError = useMemo(() => {
    if (mode !== "B2B") return "";
    if (!accountId) return "Selecciona una cuenta B2B (cliente/empresa).";
    return "";
  }, [mode, accountId]);

  const canSubmit =
    uiState !== "loading" &&
    !!selected &&
    qtyError === "" &&
    accountError === "" &&
    products.length > 0;

  function decQty() {
    setQty((q) => Math.max(1, (Number.isFinite(q) ? q : 1) - 1));
  }
  function incQty() {
    setQty((q) => {
      const current = Number.isFinite(q) ? q : 1;
      if (!selected) return current + 1;
      return Math.min(stock || current + 1, current + 1);
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!canSubmit || !selected) return;

    setUiState("loading");
    try {
      const dto: any = {
        items: [{ productId: selected.id, quantity: qty }],
      };

      // ✅ B2B => manda customerId
      if (mode === "B2B") {
        dto.customerId = accountId;
      }

      // ✅ YA NO mandamos storeId (viene del token)
      await createSale(dto);

      setUiState("success");
      setMessage("✅ Venta registrada correctamente.");

      setLastSale({
        productName: selected.name,
        qty,
        total: subtotal,
        at: new Date().toLocaleString(),
        mode,
        accountLabel:
          mode === "B2B"
            ? `${selectedAccount?.companyName ?? selectedAccount?.fullName ?? "Cuenta"}${
                selectedAccount?.documentNumber ? ` · ${selectedAccount.documentNumber}` : ""
              }`
            : "Mostrador",
      });

      // refresca stock local (UX inmediata)
      setProducts((prev) =>
        prev.map((p) =>
          p.id === selected.id ? { ...p, stock: Math.max(0, p.stock - qty) } : p
        )
      );

      setQty(1);

      window.setTimeout(() => {
        setUiState("idle");
        setMessage("");
      }, 2200);
    } catch (e: any) {
      setUiState("error");
      setMessage(e?.message ?? "❌ Error al registrar la venta.");
    }
  }

  return (
    <div className="dm-page">
      <div className="dm-page__header">
        <div>
          <h1 className="dm-title">Registrar venta</h1>
          <p className="dm-subtitle">
            Elige tipo de venta, busca producto por SKU y confirma.
          </p>
        </div>

        <div className="dm-badge">
          <span className="dm-badge__dot" />
          <span>Auth · multi-tenant</span>
        </div>
      </div>

      <div className="dm-grid">
        {/* FORM CARD */}
        <section className="dm-card">
          <header className="dm-card__header">
            <h2 className="dm-card__title">Nueva venta</h2>
            <span className="dm-card__hint">* Campos requeridos</span>
          </header>

          <form className="dm-form" onSubmit={onSubmit}>
            {/* ✅ Tipo de venta */}
            <div className="dm-field">
              <label className="dm-label">Tipo de venta *</label>
              <div className="dm-toggle">
                <button
                  type="button"
                  className={mode === "B2C" ? "dm-toggle__btn active" : "dm-toggle__btn"}
                  onClick={() => setMode("B2C")}
                  disabled={uiState === "loading"}
                >
                  B2C · Mostrador
                </button>
                <button
                  type="button"
                  className={mode === "B2B" ? "dm-toggle__btn active" : "dm-toggle__btn"}
                  onClick={() => setMode("B2B")}
                  disabled={uiState === "loading"}
                >
                  B2B · Cuenta
                </button>
              </div>
              <p className="dm-muted">
                B2C no requiere cliente. B2B asocia la venta a una empresa.
              </p>
            </div>

            {/* ✅ Cuenta (solo B2B) */}
            {mode === "B2B" ? (
              <div className="dm-field">
                <label className="dm-label">Cuenta / Cliente (B2B) *</label>

                <input
                  className="dm-input"
                  placeholder="Buscar por RUC/DNI o nombre..."
                  value={accountQuery}
                  onChange={(e) => setAccountQuery(e.target.value)}
                  disabled={uiState === "loading"}
                />

                <select
                  className="dm-select"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  disabled={uiState === "loading"}
                >
                  <option value="">Selecciona una cuenta...</option>
                  {filteredAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {(a.companyName ?? a.fullName ?? "Cuenta")}
                      {a.documentNumber ? ` · ${a.documentNumber}` : ""}
                    </option>
                  ))}
                </select>

                {accountError ? <p className="dm-error">{accountError}</p> : null}
              </div>
            ) : null}

            {/* ✅ Buscar producto por SKU */}
            <div className="dm-field">
              <label className="dm-label">Buscar producto (SKU o nombre)</label>
              <input
                className="dm-input"
                placeholder="Ej. TEN-URB-008"
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
                disabled={uiState === "loading"}
              />
            </div>

            {/* Producto */}
            <div className="dm-field">
              <label className="dm-label" htmlFor="product">
                Producto *
              </label>

              <select
                id="product"
                className="dm-select"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                disabled={filteredProducts.length === 0 || uiState === "loading"}
              >
                {filteredProducts.length === 0 ? (
                  <option value="">No hay productos que coincidan...</option>
                ) : (
                  filteredProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku ? `${p.sku} · ` : ""}
                      {p.name} · Stock: {p.stock}
                    </option>
                  ))
                )}
              </select>

              {selected && (
                <div className="dm-chips">
                  <span className="dm-chip">
                    <b>Stock:</b>&nbsp;{stock}
                  </span>
                  <span className="dm-chip">
                    <b>Precio:</b>&nbsp;${price.toFixed(2)}
                  </span>
                  {selected.sku ? (
                    <span className="dm-chip">
                      <b>SKU:</b>&nbsp;{selected.sku}
                    </span>
                  ) : null}
                  {selected.category ? (
                    <span className="dm-chip">
                      <b>Categoría:</b>&nbsp;{selected.category}
                    </span>
                  ) : null}
                </div>
              )}
            </div>

            {/* Cantidad */}
            <div className="dm-field">
              <label className="dm-label" htmlFor="qty">
                Cantidad *
              </label>

              <div className="dm-qty">
                <button
                  type="button"
                  className="dm-qty__btn"
                  onClick={decQty}
                  disabled={uiState === "loading" || qty <= 1}
                  aria-label="Disminuir cantidad"
                >
                  −
                </button>

                <input
                  id="qty"
                  className="dm-input"
                  inputMode="numeric"
                  value={Number.isFinite(qty) ? qty : 1}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    setQty(Number.isFinite(n) ? n : 1);
                  }}
                  disabled={uiState === "loading"}
                />

                <button
                  type="button"
                  className="dm-qty__btn"
                  onClick={incQty}
                  disabled={uiState === "loading" || (!!selected && qty >= stock)}
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>

              {qtyError ? <p className="dm-error">{qtyError}</p> : null}
            </div>

            {/* Summary */}
            <div className="dm-summary">
              <div className="dm-summary__row">
                <span>Subtotal</span>
                <b>${subtotal.toFixed(2)}</b>
              </div>
              <div className="dm-summary__row dm-summary__muted">
                <span>Producto</span>
                <span>{selected?.name ?? "—"}</span>
              </div>
              <div className="dm-summary__row dm-summary__muted">
                <span>Tipo</span>
                <span>{mode === "B2B" ? "B2B (Cuenta)" : "B2C (Mostrador)"}</span>
              </div>
              {mode === "B2B" ? (
                <div className="dm-summary__row dm-summary__muted">
                  <span>Cuenta</span>
                  <span>
                    {selectedAccount
                      ? `${selectedAccount.companyName ?? selectedAccount.fullName ?? "Cuenta"}${
                          selectedAccount.documentNumber
                            ? ` · ${selectedAccount.documentNumber}`
                            : ""
                        }`
                      : "—"}
                  </span>
                </div>
              ) : null}
            </div>

            {message ? (
              <div
                className={[
                  "dm-alert",
                  uiState === "success" ? "dm-alert--success" : "",
                  uiState === "error" ? "dm-alert--error" : "",
                ].join(" ")}
                role="status"
              >
                {message}
              </div>
            ) : null}

            <button className="dm-btn" type="submit" disabled={!canSubmit}>
              {uiState === "loading" ? "Registrando..." : "Crear venta"}
            </button>
          </form>
        </section>

        {/* SIDE CARD */}
        <aside className="dm-card dm-card--side">
          <header className="dm-card__header">
            <h2 className="dm-card__title">Ayuda rápida</h2>
          </header>

          <ul className="dm-list">
            <li>B2C = Mostrador (sin cliente).</li>
            <li>B2B = Cuenta (empresa) asociada a la venta.</li>
            <li>Puedes buscar productos por SKU o nombre.</li>
          </ul>

          <div className="dm-divider" />

          <h3 className="dm-mini-title">Última venta</h3>
          {lastSale ? (
            <div className="dm-last">
              <div className="dm-last__row">
                <span>Tipo</span>
                <b>{lastSale.mode}</b>
              </div>
              <div className="dm-last__row">
                <span>Cuenta</span>
                <b>{lastSale.accountLabel ?? "Mostrador"}</b>
              </div>
              <div className="dm-last__row">
                <span>Producto</span>
                <b>{lastSale.productName}</b>
              </div>
              <div className="dm-last__row">
                <span>Cantidad</span>
                <b>{lastSale.qty}</b>
              </div>
              <div className="dm-last__row">
                <span>Total</span>
                <b>${lastSale.total.toFixed(2)}</b>
              </div>
              <div className="dm-last__time">{lastSale.at}</div>
            </div>
          ) : (
            <p className="dm-muted">Aún no registras ventas en esta sesión.</p>
          )}
        </aside>
      </div>
    </div>
  );
}