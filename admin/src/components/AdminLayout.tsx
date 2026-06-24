import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/products", label: "Товары" },
  { to: "/sale-points", label: "Точки продаж" },
  { to: "/services", label: "Услуги" },
  { to: "/feedback", label: "Обратная связь" },
  { to: "/applications", label: "Заявки" },
  { to: "/payments", label: "История платежей" },
  { to: "/reviews", label: "Отзывы" },
];

export function AdminLayout() {
  const { logout } = useAuth();

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">ELI Admin</div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link${isActive ? " active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button className="btn btn-secondary sidebar-logout" onClick={logout}>
          Выйти
        </button>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
