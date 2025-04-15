import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import chatea from "../../assets/chatea.png";

const TransactionCanceled = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const originalTitle = document.title;
    document.title = "Transacción Cancelada";

    return () => {
      document.title = originalTitle;
    };
  }, []);

  return (
    <div className="container py-4">
      <div className="text-center mb-4">
        <img
          src={chatea}
          alt="Chatea Logo"
          className="chatea-logo"
          style={{ maxWidth: "220px" }}
        />
      </div>

      <div className="confirmation-card confirmation-card p-4 bg-white rounded">
        <div className="text-center mb-4">
          <div className="error-icon-container">
            <i className="bx bx-x-circle error-icon"></i>
          </div>
          <h2 className="confirmation-title">Transacción Cancelada</h2>
          <p style={{ color: "#6c757d" }}>
            El proceso de pago ha sido cancelado
          </p>
        </div>

        <div className="transaction-details">
          <div className="action-buttons">
            <button className="btn-primary" onClick={() => navigate("/")}>
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionCanceled;
