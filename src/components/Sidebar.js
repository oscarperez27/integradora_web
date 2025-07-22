import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { MdDashboard, MdSettings, MdPeople } from "react-icons/md";
import { FaBoxes, FaUserCircle } from "react-icons/fa";
import { FiFileText } from "react-icons/fi";
import { GiChart } from "react-icons/gi";
import { RiTeamLine } from "react-icons/ri";
import { BsClipboardCheck } from "react-icons/bs";
import ConfirmModal from "../components/ConfirmModal";
import { isAdmin } from "../utils/auth"; 
import "./Sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
   const admin = isAdmin();

  const handleLogout = () => {
    localStorage.removeItem("auth");
    window.location.href = "/login";
  };

  const menu = [
    { to: "/dashboard", icon: <MdDashboard size={22} />, label: "Dashboard" },
    { to: "/monitoring", icon: <GiChart size={22} />, label: "Monitoreo Ambiental" },
    { to: "/access-control", icon: <MdPeople size={22} />, label: "Gestion de Clientes" },
    { to: "/inventory", icon: <FaBoxes size={22} />, label: "Inventario" },
    { to: "/orders", icon: <BsClipboardCheck size={22} />, label: "Ordenes" },
    ...(admin
      ?[{ to: "/employes", icon: <RiTeamLine size={22} />, label: "Gestion de empleados" },]
      : []),
    { to: "/reports", icon: <FiFileText size={22} />, label: "Reportes" },
    { to: "/profile", icon: <FaUserCircle size={22} />, label: "Perfil Admin" },
    { to: "/configuration", icon: <MdSettings size={22} />, label: "Configuración" },
  ];

  return (
    <>
      {/* Sidebar contenido */}
      <aside className="sidebar">
        {/* Logo y título */}
        <div className="sidebar-logo">
          <img
            src={process.env.PUBLIC_URL + "/assets/Prime_Gym.jpg"}
            alt="Prime Gym"
            className="sidebar-logo-img"
          />
          <span className="sidebar-logo-text">Prime Gym</span>
        </div>

        {/* Menú de navegación */}
        <nav className="sidebar-nav">
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                "sidebar-link" + (isActive ? " active" : "")
              }
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Botón de logout */}
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => setShowLogoutModal(true)}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Modal FUERA del <aside> para evitar estilos heredados */}
      {showLogoutModal && (
        <ConfirmModal
          show={showLogoutModal}
          message="¿Estás seguro que quieres cerrar sesión?"
          onConfirm={() => {
            setShowLogoutModal(false);
            handleLogout();
          }}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
