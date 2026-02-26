import type React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/layout.css";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const nav = useNavigate();

  const item = (to: string) => (pathname === to ? "navItem active" : "navItem");

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/login", { replace: true });
  }

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandIcon">🛍️</div>
          <div className="brandText">
            <div className="brandName">DATAMARK</div>
            <div className="brandSub">Retail</div>
          </div>
        </div>

        <nav className="nav">
          <Link className={item("/dashboard")} to="/dashboard">
            📊 Dashboard
          </Link>

          <Link className={item("/products")} to="/products">
            📦 Productos
          </Link>

          <Link className={item("/sales")} to="/sales">
            💰 Ventas
          </Link>

          {/* NUEVO */}
          <Link className={item("/catalogs")} to="/catalogs">
            🗂️ Catálogos
          </Link>
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbarTitle">
            SISTEMA DE GESTIÓN EMPRESARIAL
          </div>

          <div className="topbarRight">
            <button className="logoutBtn" onClick={handleLogout}>
              Cerrar sesión
            </button>
            <span className="datePill">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </header>

        <section className="content">{children}</section>
      </main>
    </div>
  );
}