import { useEffect, useMemo, useState } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/products.api";
import type { Product } from "../types/api";

import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  type Account,
} from "../api/accounts.api";

import "../styles/catalogs-page.css";

type Tab = "products" | "clients";
type UiState = "idle" | "loading" | "success" | "error";

type CreateProductForm = {
  name: string;
  sku?: string | null;
  barcode?: string | null;
  category: string;
  cost: string;
  price: string;
  stock: number;
  isActive: boolean;
};

type CreateClientForm = {
  name: string; // empresa/razón social
  email?: string | null;
  phone?: string | null;
  documentId?: string | null; // RUC/DNI
};

export default function CatalogsPage() {
  const [tab, setTab] = useState<Tab>("products");
  const [q, setQ] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]); // B2B

  const [loading, setLoading] = useState(true);
  const [uiState, setUiState] = useState<UiState>("idle");
  const [message, setMessage] = useState("");

  // Create modals
  const [openProductModal, setOpenProductModal] = useState(false);
  const [openClientModal, setOpenClientModal] = useState(false);

  // Edit modals
  const [openEditProduct, setOpenEditProduct] = useState(false);
  const [openEditAccount, setOpenEditAccount] = useState(false);

  // Selected for edit/delete
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // Create forms
  const [productForm, setProductForm] = useState<CreateProductForm>({
    name: "",
    sku: null,
    barcode: null,
    category: "",
    cost: "0",
    price: "0",
    stock: 0,
    isActive: true,
  });

  const [clientForm, setClientForm] = useState<CreateClientForm>({
    name: "",
    email: "",
    phone: "",
    documentId: "",
  });

  // Edit forms
  const [editProductForm, setEditProductForm] = useState<CreateProductForm>({
    name: "",
    sku: null,
    barcode: null,
    category: "",
    cost: "0",
    price: "0",
    stock: 0,
    isActive: true,
  });

  const [editAccountForm, setEditAccountForm] = useState<CreateClientForm>({
    name: "",
    email: "",
    phone: "",
    documentId: "",
  });

  async function loadAll() {
    setLoading(true);
    try {
      const p = await getProducts();
      setProducts(p);

      const a = await getAccounts("B2B");
      setAccounts(a);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const filteredProducts = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products;
    return products.filter((p) => {
      return (
        p.name?.toLowerCase().includes(s) ||
        (p.sku ?? "").toLowerCase().includes(s) ||
        (p.barcode ?? "").toLowerCase().includes(s) ||
        (p.category ?? "").toLowerCase().includes(s)
      );
    });
  }, [products, q]);

  const filteredAccounts = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return accounts;
    return accounts.filter((a) => {
      const name = (a.companyName ?? a.fullName ?? "").toLowerCase();
      const email = (a.email ?? "").toLowerCase();
      const phone = (a.phone ?? "").toLowerCase();
      const doc = (a.documentNumber ?? "").toLowerCase();
      return name.includes(s) || email.includes(s) || phone.includes(s) || doc.includes(s);
    });
  }, [accounts, q]);

  function toastSuccess(msg: string) {
    setUiState("success");
    setMessage(msg);
  }

  function toastError(e: any, fallback: string) {
    setUiState("error");
    setMessage(e?.message || fallback);
  }

  // --------------------
  // CREATE PRODUCT
  // --------------------
  async function onCreateProduct() {
    setUiState("loading");
    setMessage("");

    try {
      if (!productForm.name.trim()) throw new Error("Nombre requerido");
      if (!productForm.category.trim()) throw new Error("Categoría requerida");
      if (Number(productForm.price) <= 0) throw new Error("Precio inválido");

      await createProduct({
        name: productForm.name.trim(),
        category: productForm.category.trim(),
        sku: productForm.sku?.trim() ? productForm.sku.trim() : null,
        barcode: productForm.barcode?.trim() ? productForm.barcode.trim() : null,
        cost: String(productForm.cost ?? "0"),
        price: String(productForm.price ?? "0"),
        stock: Number(productForm.stock ?? 0),
        isActive: !!productForm.isActive,
      } as any);

      toastSuccess("Producto creado ✅");
      setOpenProductModal(false);

      setProductForm({
        name: "",
        sku: null,
        barcode: null,
        category: "",
        cost: "0",
        price: "0",
        stock: 0,
        isActive: true,
      });

      await loadAll();
    } catch (e: any) {
      toastError(e, "Error creando producto");
    }
  }

  // --------------------
  // EDIT PRODUCT
  // --------------------
  function openEditProductModal(p: Product) {
    setSelectedProduct(p);
    setEditProductForm({
      name: p.name ?? "",
      sku: p.sku ?? null,
      barcode: (p as any).barcode ?? null,
      category: (p as any).category ?? "",
      cost: String((p as any).cost ?? "0"),
      price: String(p.price ?? "0"),
      stock: Number(p.stock ?? 0),
      isActive: !!p.isActive,
    });
    setOpenEditProduct(true);
  }

  async function onUpdateProduct() {
    if (!selectedProduct) return;

    setUiState("loading");
    setMessage("");

    try {
      if (!editProductForm.name.trim()) throw new Error("Nombre requerido");
      if (!editProductForm.category.trim()) throw new Error("Categoría requerida");
      if (Number(editProductForm.price) <= 0) throw new Error("Precio inválido");

      await updateProduct(selectedProduct.id as any, {
        name: editProductForm.name.trim(),
        category: editProductForm.category.trim(),
        sku: editProductForm.sku?.trim() ? editProductForm.sku.trim() : null,
        barcode: editProductForm.barcode?.trim() ? editProductForm.barcode.trim() : null,
        cost: String(editProductForm.cost ?? "0"),
        price: String(editProductForm.price ?? "0"),
        stock: Number(editProductForm.stock ?? 0),
        isActive: !!editProductForm.isActive,
      } as any);

      toastSuccess("Producto actualizado ✅");
      setOpenEditProduct(false);
      setSelectedProduct(null);
      await loadAll();
    } catch (e: any) {
      toastError(e, "Error actualizando producto");
    }
  }

  async function onDeleteProduct(p: Product) {
    const ok = window.confirm(`¿Eliminar producto "${p.name}"?`);
    if (!ok) return;

    setUiState("loading");
    setMessage("");
    try {
      await deleteProduct(p.id as any);
      toastSuccess("Producto eliminado ✅");
      await loadAll();
    } catch (e: any) {
      toastError(e, "Error eliminando producto");
    }
  }

  // --------------------
  // CREATE ACCOUNT (B2B)
  // --------------------
  async function onCreateClient() {
    setUiState("loading");
    setMessage("");

    try {
      if (!clientForm.name?.trim()) throw new Error("Nombre requerido");

      await createAccount({
        type: "B2B",
        companyName: clientForm.name.trim(),
        documentNumber: clientForm.documentId?.trim() ? clientForm.documentId.trim() : null,
        phone: clientForm.phone?.trim() ? clientForm.phone.trim() : null,
        email: clientForm.email?.trim() ? clientForm.email.trim() : null,
      } as any);

      toastSuccess("Cuenta B2B creada ✅");
      setOpenClientModal(false);

      setClientForm({ name: "", email: "", phone: "", documentId: "" });

      const updated = await getAccounts("B2B");
      setAccounts(updated);
    } catch (e: any) {
      toastError(e, "Error creando cuenta");
    }
  }

  // --------------------
  // EDIT ACCOUNT (B2B)
  // --------------------
  function openEditAccountModal(a: Account) {
    setSelectedAccount(a);
    setEditAccountForm({
      name: a.companyName ?? a.fullName ?? "",
      email: a.email ?? "",
      phone: a.phone ?? "",
      documentId: a.documentNumber ?? "",
    });
    setOpenEditAccount(true);
  }

  async function onUpdateAccount() {
    if (!selectedAccount) return;

    setUiState("loading");
    setMessage("");

    try {
      if (!editAccountForm.name?.trim()) throw new Error("Nombre requerido");

      await updateAccount(selectedAccount.id, {
        type: "B2B",
        companyName: editAccountForm.name.trim(),
        documentNumber: editAccountForm.documentId?.trim()
          ? editAccountForm.documentId.trim()
          : null,
        phone: editAccountForm.phone?.trim() ? editAccountForm.phone.trim() : null,
        email: editAccountForm.email?.trim() ? editAccountForm.email.trim() : null,
      } as any);

      toastSuccess("Cuenta actualizada ✅");
      setOpenEditAccount(false);
      setSelectedAccount(null);

      const updated = await getAccounts("B2B");
      setAccounts(updated);
    } catch (e: any) {
      toastError(e, "Error actualizando cuenta");
    }
  }

  async function onDeleteAccount(a: Account) {
    const name = a.companyName ?? a.fullName ?? "Cuenta";
    const ok = window.confirm(`¿Eliminar "${name}"?`);
    if (!ok) return;

    setUiState("loading");
    setMessage("");

    try {
      await deleteAccount(a.id);
      toastSuccess("Cuenta eliminada ✅");
      const updated = await getAccounts("B2B");
      setAccounts(updated);
    } catch (e: any) {
      toastError(e, "Error eliminando cuenta");
    }
  }

  return (
    <div className="cat-wrap">
      <div className="cat-header">
        <div>
          <h1>Catálogos</h1>
          <p>Productos y cuentas B2B (altas rápidas).</p>
        </div>

        <div className="cat-actions">
          <input
            className="cat-search"
            placeholder={tab === "products" ? "Buscar productos..." : "Buscar cuentas B2B..."}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          {tab === "products" ? (
            <button className="btn primary" onClick={() => setOpenProductModal(true)}>
              + Nuevo producto
            </button>
          ) : (
            <button className="btn primary" onClick={() => setOpenClientModal(true)}>
              + Nueva cuenta B2B
            </button>
          )}
        </div>
      </div>

      <div className="cat-tabs">
        <button className={`tab ${tab === "products" ? "active" : ""}`} onClick={() => setTab("products")}>
          Productos
        </button>
        <button className={`tab ${tab === "clients" ? "active" : ""}`} onClick={() => setTab("clients")}>
          Clientes (B2B)
        </button>
      </div>

      {message ? <div className={`cat-toast ${uiState}`}>{message}</div> : null}

      <div className="cat-card">
        {loading ? (
          <div className="cat-empty">Cargando…</div>
        ) : tab === "products" ? (
          filteredProducts.length === 0 ? (
            <div className="cat-empty">Sin productos. Crea el primero con “Nuevo producto”.</div>
          ) : (
            <table className="cat-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>SKU</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Activo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td className="strong">{p.name}</td>
                    <td>{(p as any).category ?? "-"}</td>
                    <td>{p.sku ?? "-"}</td>
                    <td>${Number(p.price).toFixed(2)}</td>
                    <td>{p.stock}</td>
                    <td>
                      <span className={`pill ${p.isActive ? "ok" : "off"}`}>
                        {p.isActive ? "Sí" : "No"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn" onClick={() => openEditProductModal(p)}>
                          Editar
                        </button>
                        <button className="btn" onClick={() => onDeleteProduct(p)}>
                          Borrar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : accounts.length === 0 ? (
          <div className="cat-empty">Aún no hay cuentas B2B. Crea una con “Nueva cuenta B2B”.</div>
        ) : (
          <table className="cat-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Documento</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((a) => (
                <tr key={a.id}>
                  <td className="strong">{a.companyName ?? a.fullName ?? "-"}</td>
                  <td>{a.email ?? "-"}</td>
                  <td>{a.phone ?? "-"}</td>
                  <td>{a.documentNumber ?? "-"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn" onClick={() => openEditAccountModal(a)}>
                        Editar
                      </button>
                      <button className="btn" onClick={() => onDeleteAccount(a)}>
                        Borrar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* CREATE PRODUCT MODAL */}
      {openProductModal ? (
        <div className="modal-backdrop" onMouseDown={() => setOpenProductModal(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-title">
              <h3>Nuevo producto</h3>
              <button className="icon-btn" onClick={() => setOpenProductModal(false)}>
                ✕
              </button>
            </div>

            <div className="grid">
              <label>
                Nombre*
                <input value={productForm.name} onChange={(e) => setProductForm((s) => ({ ...s, name: e.target.value }))} />
              </label>

              <label>
                Categoría*
                <input
                  value={productForm.category}
                  onChange={(e) => setProductForm((s) => ({ ...s, category: e.target.value }))}
                  placeholder="Ej. Calzado / Ropa / Accesorios"
                />
              </label>

              <label>
                SKU
                <input value={productForm.sku ?? ""} onChange={(e) => setProductForm((s) => ({ ...s, sku: e.target.value }))} />
              </label>

              <label>
                Código de barras
                <input value={productForm.barcode ?? ""} onChange={(e) => setProductForm((s) => ({ ...s, barcode: e.target.value }))} />
              </label>

              <label>
                Costo
                <input type="number" step="0.01" value={productForm.cost} onChange={(e) => setProductForm((s) => ({ ...s, cost: e.target.value }))} />
              </label>

              <label>
                Precio*
                <input type="number" step="0.01" value={productForm.price} onChange={(e) => setProductForm((s) => ({ ...s, price: e.target.value }))} />
              </label>

              <label>
                Stock
                <input type="number" value={productForm.stock} onChange={(e) => setProductForm((s) => ({ ...s, stock: Number(e.target.value) }))} />
              </label>

              <label className="row">
                <input
                  type="checkbox"
                  checked={productForm.isActive}
                  onChange={(e) => setProductForm((s) => ({ ...s, isActive: e.target.checked }))}
                />
                Activo
              </label>
            </div>

            <div className="modal-actions">
              <button className="btn ghost" onClick={() => setOpenProductModal(false)}>
                Cancelar
              </button>
              <button className="btn primary" onClick={onCreateProduct} disabled={uiState === "loading"}>
                Guardar producto
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* CREATE ACCOUNT MODAL */}
      {openClientModal ? (
        <div className="modal-backdrop" onMouseDown={() => setOpenClientModal(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-title">
              <h3>Nueva cuenta B2B</h3>
              <button className="icon-btn" onClick={() => setOpenClientModal(false)}>
                ✕
              </button>
            </div>

            <div className="grid">
              <label>
                Empresa / Razón social*
                <input value={clientForm.name} onChange={(e) => setClientForm((s) => ({ ...s, name: e.target.value }))} />
              </label>

              <label>
                Email
                <input value={clientForm.email ?? ""} onChange={(e) => setClientForm((s) => ({ ...s, email: e.target.value }))} />
              </label>

              <label>
                Teléfono
                <input value={clientForm.phone ?? ""} onChange={(e) => setClientForm((s) => ({ ...s, phone: e.target.value }))} />
              </label>

              <label>
                Documento (RUC/DNI)
                <input value={clientForm.documentId ?? ""} onChange={(e) => setClientForm((s) => ({ ...s, documentId: e.target.value }))} />
              </label>
            </div>

            <div className="modal-actions">
              <button className="btn ghost" onClick={() => setOpenClientModal(false)}>
                Cancelar
              </button>
              <button className="btn primary" onClick={onCreateClient} disabled={uiState === "loading"}>
                Guardar cuenta
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* EDIT PRODUCT MODAL */}
      {openEditProduct ? (
        <div className="modal-backdrop" onMouseDown={() => setOpenEditProduct(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-title">
              <h3>Editar producto</h3>
              <button className="icon-btn" onClick={() => setOpenEditProduct(false)}>
                ✕
              </button>
            </div>

            <div className="grid">
              <label>
                Nombre*
                <input value={editProductForm.name} onChange={(e) => setEditProductForm((s) => ({ ...s, name: e.target.value }))} />
              </label>

              <label>
                Categoría*
                <input value={editProductForm.category} onChange={(e) => setEditProductForm((s) => ({ ...s, category: e.target.value }))} />
              </label>

              <label>
                SKU
                <input value={editProductForm.sku ?? ""} onChange={(e) => setEditProductForm((s) => ({ ...s, sku: e.target.value }))} />
              </label>

              <label>
                Código de barras
                <input value={editProductForm.barcode ?? ""} onChange={(e) => setEditProductForm((s) => ({ ...s, barcode: e.target.value }))} />
              </label>

              <label>
                Costo
                <input type="number" step="0.01" value={editProductForm.cost} onChange={(e) => setEditProductForm((s) => ({ ...s, cost: e.target.value }))} />
              </label>

              <label>
                Precio*
                <input type="number" step="0.01" value={editProductForm.price} onChange={(e) => setEditProductForm((s) => ({ ...s, price: e.target.value }))} />
              </label>

              <label>
                Stock
                <input type="number" value={editProductForm.stock} onChange={(e) => setEditProductForm((s) => ({ ...s, stock: Number(e.target.value) }))} />
              </label>

              <label className="row">
                <input
                  type="checkbox"
                  checked={editProductForm.isActive}
                  onChange={(e) => setEditProductForm((s) => ({ ...s, isActive: e.target.checked }))}
                />
                Activo
              </label>
            </div>

            <div className="modal-actions">
              <button className="btn ghost" onClick={() => setOpenEditProduct(false)}>
                Cancelar
              </button>
              <button className="btn primary" onClick={onUpdateProduct} disabled={uiState === "loading"}>
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* EDIT ACCOUNT MODAL */}
      {openEditAccount ? (
        <div className="modal-backdrop" onMouseDown={() => setOpenEditAccount(false)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-title">
              <h3>Editar cuenta B2B</h3>
              <button className="icon-btn" onClick={() => setOpenEditAccount(false)}>
                ✕
              </button>
            </div>

            <div className="grid">
              <label>
                Empresa / Razón social*
                <input value={editAccountForm.name} onChange={(e) => setEditAccountForm((s) => ({ ...s, name: e.target.value }))} />
              </label>

              <label>
                Email
                <input value={editAccountForm.email ?? ""} onChange={(e) => setEditAccountForm((s) => ({ ...s, email: e.target.value }))} />
              </label>

              <label>
                Teléfono
                <input value={editAccountForm.phone ?? ""} onChange={(e) => setEditAccountForm((s) => ({ ...s, phone: e.target.value }))} />
              </label>

              <label>
                Documento (RUC/DNI)
                <input value={editAccountForm.documentId ?? ""} onChange={(e) => setEditAccountForm((s) => ({ ...s, documentId: e.target.value }))} />
              </label>
            </div>

            <div className="modal-actions">
              <button className="btn ghost" onClick={() => setOpenEditAccount(false)}>
                Cancelar
              </button>
              <button className="btn primary" onClick={onUpdateAccount} disabled={uiState === "loading"}>
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}