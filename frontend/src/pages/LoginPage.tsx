import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth.api";
import "../styles/login-page.css";

export default function LoginPage() {
  const nav = useNavigate();

  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("admin123");
  const [showPass, setShowPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const canSubmit = useMemo(() => {
    return email.trim().length > 3 && password.trim().length > 0 && !loading;
  }, [email, password, loading]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login({ email: email.trim(), password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      nav("/dashboard");
    } catch (err: any) {
      setError(err?.message ?? "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dm-login">
      <div className="dm-login__shell">
        {/* Panel izquierdo (branding) */}
        <section className="dm-login__hero">
          <div className="dm-login__brand">
            <div className="dm-login__logo" aria-hidden="true">
              🛍️
            </div>
            <div>
              <div className="dm-login__brandName">DATAMARK</div>
              <div className="dm-login__brandSub">Retail · Inventario · Ventas</div>
            </div>
          </div>

          <h1 className="dm-login__heroTitle">Gestiona tu tienda con datos.</h1>
          <p className="dm-login__heroText">
            Controla inventario, registra ventas y revisa KPIs en un solo lugar. Enfocado en
            pequeños negocios de ropa y calzado.
          </p>

          <div className="dm-login__bullets">
            <div className="dm-login__bullet">
              <span className="dm-login__dot" aria-hidden="true" />
              <span>Altas rápidas de productos y cuentas B2B</span>
            </div>
            <div className="dm-login__bullet">
              <span className="dm-login__dot" aria-hidden="true" />
              <span>Ventas B2C y B2B con validación de stock</span>
            </div>
            <div className="dm-login__bullet">
              <span className="dm-login__dot" aria-hidden="true" />
              <span>Dashboard con métricas clave</span>
            </div>
          </div>

          <div className="dm-login__footnote">
            Tip: si estás en demo, usa el acceso de abajo.
          </div>
        </section>

        {/* Card derecha (form) */}
        <section className="dm-login__card">
          <div className="dm-login__cardHeader">
            <h2 className="dm-login__title">Iniciar sesión</h2>
            <p className="dm-login__subtitle">Ingresa tus credenciales para continuar.</p>
          </div>

          {error ? (
            <div className="dm-login__error" role="alert">
              <div className="dm-login__errorTitle">No se pudo iniciar sesión</div>
              <div className="dm-login__errorText">{error}</div>
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="dm-login__form">
            <label className="dm-login__label" htmlFor="email">
              Email
            </label>
            <div className="dm-login__field">
              <span className="dm-login__icon" aria-hidden="true">
                ✉️
              </span>
              <input
                id="email"
                className="dm-login__input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@demo.com"
                autoComplete="email"
              />
            </div>

            <label className="dm-login__label" htmlFor="password">
              Password
            </label>
            <div className="dm-login__field">
              <span className="dm-login__icon" aria-hidden="true">
                🔒
              </span>
              <input
                id="password"
                className="dm-login__input"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="dm-login__toggle"
                onClick={() => setShowPass((s) => !s)}
                aria-label={showPass ? "Ocultar password" : "Mostrar password"}
              >
                {showPass ? "Ocultar" : "Ver"}
              </button>
            </div>

            <button className="dm-login__btn" disabled={!canSubmit}>
              {loading ? "Entrando..." : "Entrar"}
            </button>

            <div className="dm-login__hint">
              Demo: <b>admin@demo.com</b> / <b>admin123</b>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}