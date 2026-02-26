import type React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProductsPage from "./pages/ProductsPage";
import SalesPage from "./pages/SalesPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import MainLayout from "./layouts/MainLayout";
import CatalogsPage from "./pages/catalogsPage";

/**
 * Componente para proteger rutas privadas
 */
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas privadas */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/products"
          element={
            <PrivateRoute>
              <MainLayout>
                <ProductsPage />
              </MainLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/sales"
          element={
            <PrivateRoute>
              <MainLayout>
                <SalesPage />
              </MainLayout>
            </PrivateRoute>
          }
        />

        {/* ✅ NUEVA RUTA: Catálogos */}
        <Route
          path="/catalogs"
          element={
            <PrivateRoute>
              <MainLayout>
                <CatalogsPage />
              </MainLayout>
            </PrivateRoute>
          }
        />

        {/* Default */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}