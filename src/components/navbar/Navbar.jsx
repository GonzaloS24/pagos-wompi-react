import chatea from "../../assets/chatea.png";
import { BiLogOut } from "react-icons/bi";
import useAuth from "../../context/auth/UseAuth";
import { useState } from "react";
import "../../styles/components/Navbar.css";

const Navbar = () => {
  const [activeTab, setActiveTab] = useState("suscripciones");
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          <img src={chatea} alt="ChateaPro" width="150" />
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
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
  );
};

export default Navbar;
