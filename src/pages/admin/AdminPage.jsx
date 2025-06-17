import user from "../../assets/user.png";
import { Container, Modal, Button } from "react-bootstrap";
import {
  BsFillEyeFill,
  BsSearch,
  BsChevronLeft,
  BsChevronRight,
} from "react-icons/bs";
import { MdFreeCancellation } from "react-icons/md";
import { useState } from "react";
import Navbar from "../../components/navbar/Navbar";

const AdminPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  // Datos de ejemplo
  const users = [
    {
      id: 1,
      nombre: "Gonzalo Salazar",
      correo: "gonzalo.salazar@gmail.com",
      idSuscripcion: "65189248-148616336",
      estado: "Activo",
      vencimiento: "15/07/2025",
      cobroMensual: "202.000 COP",
      tipoPlan: "Chatea Pro Advanced",
      metodoPago: "Tarjeta de Crédito ****1234",
      fechaInicio: "15/06/2025",
    },
    {
      id: 2,
      nombre: "Gonzalo Salazar",
      correo: "gonzalo.salazar@gmail.com",
      idSuscripcion: "65189248-148616336",
      estado: "Activo",
      vencimiento: "15/07/2025",
      cobroMensual: "202.000 COP",
      tipoPlan: "Chatea Pro Advanced",
      metodoPago: "Tarjeta de Crédito ****1234",
      fechaInicio: "15/06/2025",
    },
    {
      id: 3,
      nombre: "Gonzalo Salazar",
      correo: "gonzalo.salazar@gmail.com",
      idSuscripcion: "65189248-148616336",
      estado: "Cancelado",
      vencimiento: "15/07/2025",
      cobroMensual: "202.000 COP",
      tipoPlan: "Chatea Pro Advanced",
      metodoPago: "Tarjeta de Crédito ****1234",
      fechaInicio: "15/06/2025",
    },
    {
      id: 4,
      nombre: "Gonzalo Salazar",
      correo: "gonzalo.salazar@gmail.com",
      idSuscripcion: "65189248-148616336",
      estado: "Activo",
      vencimiento: "15/07/2025",
      cobroMensual: "202.000 COP",
      tipoPlan: "Chatea Pro Advanced",
      metodoPago: "Tarjeta de Crédito ****1234",
      fechaInicio: "15/06/2025",
    },
    {
      id: 5,
      nombre: "Gonzalo Salazar",
      correo: "gonzalo.salazar@gmail.com",
      idSuscripcion: "65189248-148616336",
      estado: "Cancelado",
      vencimiento: "15/07/2025",
      cobroMensual: "202.000 COP",
      tipoPlan: "Chatea Pro Advanced",
      metodoPago: "Tarjeta de Crédito ****1234",
      fechaInicio: "15/06/2025",
    },
  ];

  return (
    <>
      <Navbar />

      <Container className="mt-5">
        <h3 className="mb-4 text-muted">Gestión de suscripciones</h3>

        {/* Filtros */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text">
                <BsSearch />
              </span>
              <input
                type="text"
                className="form-control p-2 bg-white"
                placeholder="Buscar por nombre, correo o ID..."
              />
            </div>
          </div>
          <div className="col-md-3">
            <select className="form-select p-2 bg-white">
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          <div className="col-md-1">
            <select className="form-select p-2 bg-white">
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>

        <table className="table align-middle mb-4 bg-white">
          <thead className="bg-light">
            <tr>
              <th>Nombre</th>
              <th>ID Suscripción</th>
              <th>Estado</th>
              <th>Vencimiento</th>
              <th>Cobro mensual</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((userData) => (
              <tr key={userData.id}>
                <td>
                  <div className="d-flex align-items-center">
                    <img
                      src={user}
                      alt=""
                      style={{ width: "45px", height: "45px" }}
                      className="rounded-circle"
                    />
                    <div className="ms-3">
                      <p className="mb-0">{userData.nombre}</p>
                      <p className="text-muted mb-0">{userData.correo}</p>
                    </div>
                  </div>
                </td>
                <td>{userData.idSuscripcion}</td>
                <td>
                  <span
                    className={`status-badge ${
                      userData.estado.toLowerCase() === "cancelado"
                        ? "error"
                        : "success"
                    }`}
                  >
                    {userData.estado}
                  </span>
                </td>
                <td>{userData.vencimiento}</td>
                <td>{userData.cobroMensual}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-warning btn-sm btn-rounded me-2 color-white"
                    onClick={() => handleViewDetails(userData)}
                  >
                    <BsFillEyeFill
                      style={{ fontSize: "20px", color: "white" }}
                    />
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm btn-rounded me-2"
                    onClick={() => {
                      if (
                        window.confirm(
                          "¿Estás seguro de que deseas cancelar esta suscripción?"
                        )
                      ) {
                        alert("Suscripción cancelada");
                      }
                    }}
                  >
                    <MdFreeCancellation style={{ fontSize: "20px" }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Paginación */}
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="text-muted">Mostrando 1 a 6 de 6 resultados</div>
          <nav aria-label="Navegación de páginas">
            <ul className="pagination mb-0">
              <li className="page-item disabled">
                <a
                  className="page-link"
                  href="#"
                  tabIndex="-1"
                  aria-disabled="true"
                >
                  <BsChevronLeft />
                </a>
              </li>
              <li className="page-item active">
                <a
                  className="page-link"
                  href="#"
                  style={{ backgroundColor: "#009ee3", borderColor: "#009ee3" }}
                >
                  1
                </a>
              </li>
              <li className="page-item">
                <a className="page-link" href="#" style={{ color: "#009ee3" }}>
                  2
                </a>
              </li>
              <li className="page-item">
                <a className="page-link" href="#" style={{ color: "#009ee3" }}>
                  3
                </a>
              </li>
              <li className="page-item">
                <span className="page-link">...</span>
              </li>
              <li className="page-item">
                <a className="page-link" href="#" style={{ color: "#009ee3" }}>
                  10
                </a>
              </li>
              <li className="page-item">
                <a className="page-link" href="#" style={{ color: "#009ee3" }}>
                  <BsChevronRight />
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Modal de Detalles */}
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Detalles de Suscripción</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedUser && (
              <>
                <div className="mb-3">
                  <strong>Nombre:</strong> {selectedUser.nombre}
                </div>
                <div className="mb-3">
                  <strong>Correo:</strong> {selectedUser.correo}
                </div>
                <div className="mb-3">
                  <strong>ID Suscripción:</strong> {selectedUser.idSuscripcion}
                </div>
                <div className="mb-3">
                  <strong>Tipo de Plan:</strong> {selectedUser.tipoPlan}
                </div>
                <div className="mb-3">
                  <strong>Estado:</strong>
                  <span className="status-badge success ms-2">
                    {selectedUser.estado}
                  </span>
                </div>
                <div className="mb-3">
                  <strong>Método de Pago:</strong> {selectedUser.metodoPago}
                </div>
                <div className="mb-3">
                  <strong>Cobro Mensual:</strong> {selectedUser.cobroMensual}
                </div>
                <div className="mb-3">
                  <strong>Fecha de Inicio:</strong> {selectedUser.fechaInicio}
                </div>
                <div className="mb-3">
                  <strong>Fecha de Vencimiento:</strong>{" "}
                  {selectedUser.vencimiento}
                </div>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default AdminPage;
