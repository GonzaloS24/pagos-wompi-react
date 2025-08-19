import "./styles/adminPage.css";
import { Container } from "react-bootstrap";
import { useState } from "react";
import SubscriptionTable from "./components/SubscriptionTable";
import FiltersSection from "./components/FiltersSection";
import Pagination from "./components/Pagination";
import SubscriptionModal from "./components/SubscriptionModal";
import { useSubscriptions } from "./hooks/useSubscriptions";

const AdminPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { data } = useSubscriptions();

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleCancelSubscription = () => {
    if (
      window.confirm("¿Estás seguro de que deseas cancelar esta suscripción?")
    ) {
      alert("Suscripción cancelada");
      setShowModal(false);
    }
  };

  const handleReactivateSubscription = () => {
    if (
      window.confirm("¿Estás seguro de que deseas reactivar esta suscripción?")
    ) {
      alert("Suscripción reactivada");
      setShowModal(false);
    }
  };

  return (
    <div className="admin-page-container">
      <Container className="mt-5 admin-page-content">
        <h3 className="mb-4 text-muted">Gestión de suscripciones</h3>

        <FiltersSection />

        <SubscriptionTable data={data} onViewDetails={handleViewDetails} />

        <Pagination totalItems={data.length} />

        <SubscriptionModal
          show={showModal}
          onHide={handleCloseModal}
          selectedUser={selectedUser}
          onCancelSubscription={handleCancelSubscription}
          onReactivateSubscription={handleReactivateSubscription}
        />
      </Container>
    </div>
  );
};

export default AdminPage;
