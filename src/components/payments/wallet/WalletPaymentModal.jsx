import { Modal, Button } from "react-bootstrap";
import PropTypes from "prop-types";
import { walletService } from "../../../services/payments/wallet/walletService";
import Swal from "sweetalert2";

const WalletPaymentModal = ({
  show,
  onHide,
  paymentData,
  selectedPlan,
  selectedAssistants,
  selectedComplements,
  isAssistantsOnly,
}) => {
  const walletData = walletService.createWalletPaymentData(paymentData);

  // Procesar datos para mostrar
  const hasAssistants = selectedAssistants && selectedAssistants.length > 0;
  const hasComplements = selectedComplements && selectedComplements.length > 0;
  const hasPlan = !isAssistantsOnly && selectedPlan;

  console.log("22  >>>>>>>>> ", selectedComplements);

  const handleConfirmPayment = async () => {
    try {
      const result = await walletService.processWalletPayment(walletData);

      if (result.success) {
        onHide();

        await Swal.fire({
          icon: "info",
          title: "Pago en Verificación",
          confirmButtonText: "Entendido",
          confirmButtonColor: "#009ee3",
        });
      }
    } catch (error) {
      console.error("Error processing wallet payment:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al procesar tu solicitud. Por favor intenta nuevamente.",
        confirmButtonColor: "#009ee3",
      });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      Swal.fire({
        icon: "success",
        title: "Copiado",
        text: "Dirección copiada al portapapeles",
        timer: 1500,
        showConfirmButton: false,
      });
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ color: "#009ee3" }}>Pago por Wallet</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Resumen compacto */}
        <div
          style={{
            background: "#edf4ff",
            border: "1px solid rgba(0, 158, 227, 0.2)",
          }}
          className="rounded mb-3 p-3"
        >
          <h6 style={{ color: "#009ee3" }} className="mb-2">
            Resumen del Pago
          </h6>

          {hasPlan && (
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Plan:</span>
              <span>{selectedPlan.name}</span>
            </div>
          )}

          {hasAssistants && (
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Asistentes:</span>
              <span>{selectedAssistants.join(", ")}</span>
            </div>
          )}

          {hasComplements && (
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Complementos:</span>
              <span>{selectedComplements.map((c) => c.id).join(", ")}</span>
            </div>
          )}

          <div className="d-flex justify-content-between mb-1">
            <span className="text-muted">Total:</span>
            <span className="fw-bold" style={{ color: "#009ee3" }}>
              ${walletData.amount.toLocaleString("es-CO")} COP
            </span>
          </div>
        </div>

        {/* Instrucciones compactas */}
        <div className="wallet-instructions">
          <p className="mb-2">
            <p>Instrucciones:</p>
          </p>

          <div className="mb-3">
            <small className="text-muted d-block">
              1. Enviar dinero a la wallet:
            </small>
            <div
              style={{
                background: "#edf4ff",
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid rgba(0, 158, 227, 0.2)",
                fontFamily: "monospace",
                fontSize: "0.85rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span className="text-truncate me-2">
                {walletData.walletAddress}
              </span>
              <Button
                size="sm"
                variant="outline-primary"
                onClick={() => copyToClipboard(walletData.walletAddress)}
                style={{
                  color: "white",
                  backgroundColor: "#009ee3",
                  borderColor: "#009ee3",
                  fontSize: "0.75rem",
                  padding: "0.25rem 0.5rem",
                }}
              >
                Copiar
              </Button>
            </div>
          </div>

          <div className="mb-3">
            <small className="text-muted d-block">
              2. Enviar comprobante de pago a:
            </small>
            <div style={{ fontSize: "0.9rem" }}>
              <div>📧 {walletData.contactEmail}</div>
              <div>📱 {walletData.contactWhatsApp}</div>
            </div>
          </div>

          <div
            className="alert alert-info py-2"
            style={{ fontSize: "0.85rem" }}
          >
            <strong>Nota:</strong> Tu pago será verificado manualmente.
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="outline-primary"
          onClick={handleConfirmPayment}
          style={{
            color: "white",
            padding: "5px !important",
            backgroundColor: "#009ee3",
            borderColor: "#009ee3",
          }}
        >
          Confirmar Pago
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

WalletPaymentModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  paymentData: PropTypes.object.isRequired,
  selectedPlan: PropTypes.object,
  selectedAssistants: PropTypes.array.isRequired,
  selectedComplements: PropTypes.array.isRequired,
  isAssistantsOnly: PropTypes.bool.isRequired,
};

export default WalletPaymentModal;
