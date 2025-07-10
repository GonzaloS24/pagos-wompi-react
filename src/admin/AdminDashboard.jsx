import { useState } from "react";
import Navbar from "./components/Navbar";
import AdminPage from "./AdminPage";
import SubscriptionsMetrics from "./SubscriptionsMetrics";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("suscripciones");

  const renderCurrentComponent = () => {
    switch (activeTab) {
      case "suscripciones":
        return <AdminPage />;
      case "metricas":
        return <SubscriptionsMetrics />;
      default:
        return <AdminPage />;
    }
  };

  return (
    <div>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main>{renderCurrentComponent()}</main>
    </div>
  );
};

export default AdminDashboard;
