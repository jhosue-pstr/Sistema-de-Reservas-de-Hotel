import { Link, useLocation } from "react-router-dom";
import "./Sidebars.css";

const menuItems = [
  {
    path: "/",
    label: "Inicio",
    icons: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        className="bi bi-house-fill"
        viewBox="0 0 16 16"
      >
        <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L8 2.207l6.646 6.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293z" />
        <path d="m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293z" />
      </svg>
    ),
  },
  {
    path: "/clientes",
    label: "Clientes",
    icons: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        className="bi bi-people-fill"
        viewBox="0 0 16 16"
      >
        <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
      </svg>
    ),
  },
  {
    path: "/tipos-habitacion",
    label: "Tipos de Habitación",
    icons: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        className="bi bi-door-open-fill"
        viewBox="0 0 16 16"
      >
        <path d="M1.5 15a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5V14a.5.5 0 0 0-.5-.5H.5a.5.5 0 0 0-.5.5v1zm15 0a.5.5 0 0 0 .5-.5V14a.5.5 0 0 0-.5-.5H.5a.5.5 0 0 0-.5.5v1z"/>
        <path d="M3 7.1a.5.5 0 0 1 .5-.5h2.8a.5.5 0 0 1 0 1H6.7l1.7 2.1a.5.5 0 0 1-.7.6L5.6 9.1a.5.5 0 0 1-.8-.4V7.1a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1.4l.9 1.2a.5.5 0 1 1-.7.6l-2-2.5H3.5a.5.5 0 0 1-.5-.5v-2z"/>
      </svg>
    ),
  },
  {
    path: "/habitaciones",
    label: "Habitaciones",
    icons: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        className="bi bi-house"
        viewBox="0 0 16 16"
      >
        <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z" />
      </svg>
    ),
  },
  {
    path: "/reservas",
    label: "Reservas",
    icons: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        className="bi bi-ticket-fill"
        viewBox="0 0 16 16"
      >
        <path d="M1.5 3A1.5 1.5 0 0 0 0 4.5V6a.5.5 0 0 0 .5.5 1.5 1.5 0 1 1 0 3 .5.5 0 0 0-.5.5v1.5A1.5 1.5 0 0 0 1.5 13h13a1.5 1.5 0 0 0 1.5-1.5V10a.5.5 0 0 0-.5-.5 1.5 1.5 0 0 1 0-3A.5.5 0 0 0 16 6V4.5A1.5 1.5 0 0 0 14.5 3z" />
      </svg>
    ),
  },
  {
    path: "/facturas",
    label: "Facturas",
    icons: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        className="bi bi-currency-dollar"
        viewBox="0 0 16 16"
      >
        <path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <img src="logo" alt="logo" className="logo" />
      <h2 className="sidebar-title">Menu</h2>
      <hr></hr>

      <nav>
        <ul className="sidebar-menu ">
          {menuItems.map((item) => (
            <li
              key={item.path}
              className={`sidebar-item ${location.pathname === item.path ? "active" : ""}`}
            >
              <Link to={item.path}>
                {item.icons} | {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <hr></hr>
      <img src="foto" alt="foto" className="foto" />
    </aside>
  );
}
