/* eslint-disable react/prop-types */
import { useState } from "react";
import chatea from "../../assets/chatea.png";
import { BiLogOut, BiMenu, BiX } from "react-icons/bi";
import useAuth from "../../context/auth/UseAuth";
import "../styles/Navbar.css";

const Navbar = ({ activeTab, setActiveTab }) => {
  const { logout } = useAuth();
  const [showSidebar, setShowSidebar] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    setShowSidebar(false);
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <>
      <nav className="navbar navbar-expand-xl navbar-custom">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            <img src={chatea} alt="ChateaPro" width="150" />
          </a>

          {/* Botón hamburguesa */}
          <button
            className="navbar-mobile-toggle"
            type="button"
            onClick={toggleSidebar}
            aria-label="Toggle navigation"
          >
            <BiMenu size={24} />
          </button>

          {/* Navegación desktop */}
          <div className="navbar-desktop">
            <ul className="navbar-nav navbar-nav-right">
              <li className="nav-item">
                <a
                  className={`nav-link nav-link-custom ${
                    activeTab === "suscripciones" ? "active" : ""
                  }`}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleTabClick("suscripciones");
                  }}
                >
                  Resumen de Suscripciones
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link nav-link-custom ${
                    activeTab === "metricas" ? "active" : ""
                  }`}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleTabClick("metricas");
                  }}
                >
                  Métricas Generales
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link logout-btn"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                >
                  <BiLogOut />
                  Cerrar Sesión
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      {showSidebar && (
        <div
          className="sidebar-overlay"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar móvil */}
      <div className={`mobile-sidebar ${showSidebar ? "open" : ""}`}>
        <div className="sidebar-header">
          <img src={chatea} alt="ChateaPro" width="120" />
          <button
            className="sidebar-close"
            onClick={() => setShowSidebar(false)}
            aria-label="Cerrar menú"
          >
            <BiX size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li>
              <a
                className={`sidebar-link ${
                  activeTab === "suscripciones" ? "active" : ""
                }`}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleTabClick("suscripciones");
                }}
              >
                Resumen de Suscripciones
              </a>
            </li>
            <li>
              <a
                className={`sidebar-link ${
                  activeTab === "metricas" ? "active" : ""
                }`}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleTabClick("metricas");
                }}
              >
                Métricas Generales
              </a>
            </li>
            <li>
              <a
                className="sidebar-link logout"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
              >
                <BiLogOut />
                Cerrar Sesión
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
