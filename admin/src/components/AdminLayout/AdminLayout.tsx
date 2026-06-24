import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { to: "/", label: "Дашборд" },
  { to: "/products", label: "Товары" },
  { to: "/categories", label: "Категории" },
  { to: "/sale-points", label: "Точки продаж" },
  { to: "/orders", label: "Заказы" },
  { to: "/services", label: "Услуги" },
  { to: "/wholesale", label: "Оптовые цены" },
  { to: "/delivery-zones", label: "Зоны доставки" },
  { to: "/banners", label: "Баннеры" },
  { to: "/partner-applications", label: "Арендодатели" },
  { to: "/cp-requests", label: "Запросы КП" },
  { to: "/applications", label: "Заявки" },
  { to: "/feedback", label: "Обратная связь" },
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
              end={item.to === "/"}
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
