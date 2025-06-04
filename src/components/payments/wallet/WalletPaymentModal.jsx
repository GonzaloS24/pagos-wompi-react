import { Modal, Button } from "react-bootstrap";
import { useEffect, useState } from "react";
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
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const walletData = walletService.createWalletPaymentData(paymentData);

  const hasAssistants = selectedAssistants && selectedAssistants.length > 0;
  const hasComplements = selectedComplements && selectedComplements.length > 0;
  const hasPlan = !isAssistantsOnly && selectedPlan;

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

  useEffect(() => {
    if (show) {
      setCurrentStep(1);
    }
  }, [show]);

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

  const copyPurchaseSummary = () => {
    let summary = "RESUMEN DE COMPRA:\n\n";

    if (hasPlan) {
      summary += `Plan: ${selectedPlan.name}\n`;
    }

    if (hasAssistants) {
      summary += `Asistentes: ${selectedAssistants.join(", ")}\n`;
    }

    if (hasComplements) {
      summary += `Complementos: ${selectedComplements
        .map((c) => c.id)
        .join(", ")}\n`;
    }

    summary += `Total: $${walletData.amount.toLocaleString("es-CO")} COP`;

    navigator.clipboard.writeText(summary).then(() => {
      Swal.fire({
        icon: "success",
        title: "Resumen Copiado",
        text: "Resumen de compra copiado al portapapeles",
        timer: 1500,
        showConfirmButton: false,
      });
    });
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => (
    <div className="d-flex justify-content-center mb-3">
      {[1, 2, 3].map((step) => (
        <div key={step} className="d-flex align-items-center">
          <div
            className={`rounded-circle d-flex align-items-center justify-content-center ${
              step <= currentStep ? "text-white" : "text-muted"
            }`}
            style={{
              width: "30px",
              height: "30px",
              backgroundColor: step <= currentStep ? "#009ee3" : "#e9ecef",
              fontSize: "0.8rem",
              fontWeight: "bold",
            }}
          >
            {step}
          </div>
          {step < 3 && (
            <div
              className="mx-2"
              style={{
                width: "40px",
                height: "2px",
                backgroundColor: step < currentStep ? "#009ee3" : "#e9ecef",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h5 className="text-center mb-3" style={{ color: "#009ee3" }}>
              Paso 1: Revisar tu Compra
            </h5>

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

            <p className="text-center text-muted">
              Verifica que todos los datos sean correctos antes de continuar.
            </p>
          </div>
        );

      case 2:
        return (
          <div>
            <h5 className="text-center mb-4" style={{ color: "#009ee3" }}>
              Paso 2: Realizar el Pago
            </h5>

            <div className="mb-3">
              <p className="mb-2">
                <p>Envía el dinero a esta wallet:</p>
              </p>
              <div
                style={{
                  background: "#edf4ff",
                  padding: "0.55rem",
                  borderRadius: "8px",
                  border: "1px solid #009ee3",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span className="text-truncate me-2">
                  {walletData.walletAddress}
                </span>
                <Button
                  variant="primary"
                  onClick={() => copyToClipboard(walletData.walletAddress)}
                  style={{
                    backgroundColor: "#009ee3",
                    borderColor: "#009ee3",
                    padding: "0.3rem 1rem",
                  }}
                >
                  📋 Copiar
                </Button>
              </div>
            </div>

            <div className="mb-3">
              <p className="mb-2">
                <p>Incluye este resumen en las notas:</p>
              </p>
              <div
                style={{
                  background: "#edf4ff",
                  padding: "0.55rem",
                  borderRadius: "8px",
                  border: "1px solid #009ee3",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span className="text-muted me-2">
                  Resumen de compra completo
                </span>
                <Button
                  variant="primary"
                  onClick={copyPurchaseSummary}
                  style={{
                    backgroundColor: "#009ee3",
                    borderColor: "#009ee3",
                    padding: "0.3rem 1rem",
                  }}
                >
                  📋 Copiar
                </Button>
              </div>
            </div>

            <div
              className="alert alert-warning py-2 text-center"
              style={{ fontSize: "0.9rem" }}
            >
              💡 <strong>Importante:</strong> No olvides incluir el resumen en
              las notas del pago
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h5 className="text-center mb-4" style={{ color: "#009ee3" }}>
              Paso 3: Enviar Comprobante
            </h5>

            <div className="text-center mb-3">
              <div className="mb-3">
                <p className="mb-2">
                  <p>Envía tu comprobante de pago a:</p>
                </p>
                <div
                  style={{
                    background: "#edf4ff",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: "1px solid rgba(0, 158, 227, 0.2)",
                  }}
                >
                  <div
                    className="mb-2"
                    style={{
                      fontSize: "1.1rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    📧{" "}
                    <strong style={{ fontWeight: "400" }}>
                      {walletData.contactEmail}
                    </strong>
                  </div>
                  <div style={{ fontSize: "1.1rem" }}>
                    📱{" "}
                    <strong style={{ fontWeight: "400" }}>
                      {walletData.contactWhatsApp}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="alert alert-info py-3 text-center"
              style={{ fontSize: "0.9rem" }}
            >
              <div className="mb-2">
                <strong>🔍 Verificación Manual</strong>
              </div>
              <p className="mb-0">
                Tu pago será verificado manualmente. Te notificaremos una vez
                confirmado.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ color: "#009ee3" }}>
          Pago por Wallet - Paso {currentStep} de {totalSteps}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {renderStepIndicator()}
        {renderStepContent()}
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between">
        <Button
          variant="outline-secondary"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          ← Anterior
        </Button>

        <div>
          {currentStep < totalSteps ? (
            <Button
              variant="primary"
              onClick={nextStep}
              style={{
                backgroundColor: "#009ee3",
                borderColor: "#009ee3",
                padding: "0.5rem 1.5rem",
              }}
            >
              Siguiente →
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleConfirmPayment}
              style={{
                backgroundColor: "#009ee3",
                borderColor: "#009ee3",
                padding: "0.5rem 1.5rem",
              }}
            >
              ✅ Confirmar Pago
            </Button>
          )}
        </div>
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
