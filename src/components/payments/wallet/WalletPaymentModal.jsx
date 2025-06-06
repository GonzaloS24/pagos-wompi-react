import { Modal, Button } from "react-bootstrap";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { walletService } from "../../../services/payments/wallet/walletService";
import Swal from "sweetalert2";
import wapp from "../../../assets/whatsapp.png";

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
    let summary = "RESUMEN DEL PLAN:\n\n";

    summary += `Workspace ID: ${paymentData.formData.workspace_id}\n`;

    if (hasPlan) {
      summary += `Plan: ${selectedPlan.name}\n`;
    }

    if (hasAssistants) {
      summary += `Asistentes: ${selectedAssistants.join(", ")}\n`;
    }

    if (hasComplements) {
      summary += `Complementos: ${selectedComplements
        .map((c) => `${c.id} (${c.quantity})`)
        .join(", ")}\n`;
    }

    summary += `Total en dólares: $${walletData.amountUSD.toLocaleString(
      "es-CO"
    )} USD \n`;

    summary += `Total en pesos colombianos: $${walletData.amount.toLocaleString(
      "es-CO"
    )} COP\n`;

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

  const generatePurchaseSummary = () => {
    let summary = "RESUMEN DEL PLAN:\n\n";

    summary += `Workspace ID: ${paymentData.formData.workspace_id}\n`;

    if (hasPlan) {
      summary += `Plan: ${selectedPlan.name}\n`;
    }

    if (hasAssistants) {
      summary += `Asistentes: ${selectedAssistants.join(", ")}\n`;
    }

    if (hasComplements) {
      summary += `Complementos: ${selectedComplements
        .map((c) => `${c.id} (${c.quantity})`)
        .join(", ")}\n`;
    }

    summary += `Total en dólares: $${walletData.amountUSD.toLocaleString(
      "es-CO"
    )} USD \n`;

    summary += `Total en pesos colombianos: $${walletData.amount.toLocaleString(
      "es-CO"
    )} COP\n`;

    return summary;
  };

  const openWhatsAppWithSummary = () => {
    let summary =
      "¡Hola! Te envío el comprobante de pago junto con el resumen de mi compra:\n\n";

    summary += `Workspace ID: ${paymentData.formData.workspace_id}\n`;

    if (hasPlan) {
      summary += `Plan: ${selectedPlan.name}\n`;
    }

    if (hasAssistants) {
      summary += `Asistentes: ${selectedAssistants.join(", ")}\n`;
    }

    if (hasComplements) {
      summary += `Complementos: ${selectedComplements
        .map((c) => `${c.id} (${c.quantity})`)
        .join(", ")}\n`;
    }

    summary += `Total en dólares: $${walletData.amountUSD.toLocaleString(
      "es-CO"
    )} USD \n`;

    summary += `Total en pesos colombianos: $${walletData.amount.toLocaleString(
      "es-CO"
    )} COP\n\n`;

    summary += "¡Gracias!";

    const phoneNumber = walletData.contactWhatsApp.replace(/\D/g, "");
    const encodedMessage = encodeURIComponent(summary);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
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
                  <span>
                    {selectedComplements
                      .map((c) => `${c.id} (${c.quantity})`)
                      .join(", ")}
                  </span>
                </div>
              )}

              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Total en dólares:</span>
                <span className="fw-bold" style={{ color: "#009ee3" }}>
                  ${walletData.amountUSD.toLocaleString("es-CO")} USD
                </span>
              </div>

              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Total en pesos colombianos:</span>
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

            {/* Sección 1: Dirección de Wallet */}
            <div className="mb-4">
              <div className="d-flex align-items-center mb-2">
                <span className="bold">
                  1. {String.fromCodePoint(0x1f4b3)} Envía el dinero a esta
                  dirección:
                </span>
              </div>
              <div
                style={{
                  background: "#edf4ff",
                  border: "1px solid #009ee3",
                  borderRadius: "8px",
                  padding: "1rem",
                  position: "relative",
                }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div className="flex-grow-1 me-3">
                    <small className="text-muted d-block mb-1">
                      Dirección de Wallet:
                    </small>
                    <code
                      style={{
                        fontSize: "0.9rem",
                        color: "#495057",
                        wordBreak: "break-all",
                        background: "transparent",
                        padding: 0,
                      }}
                    >
                      {walletData.walletAddress}
                    </code>
                  </div>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => copyToClipboard(walletData.walletAddress)}
                    style={{
                      borderColor: "#009ee3",
                      color: "#009ee3",
                      minWidth: "80px",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#009ee3";
                      e.target.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "";
                      e.target.style.color = "#009ee3";
                    }}
                  >
                    📋 Copiar
                  </Button>
                </div>
              </div>
            </div>

            {/* Sección 2: Resumen del plan */}
            <div className="mb-4">
              <div className="d-flex align-items-center mb-2">
                <span className="bold">
                  2. {String.fromCodePoint(0x1f4dd)} Incluye este resumen en las
                  notas del pago:
                </span>
              </div>
              <div
                style={{
                  background: "#fef9e7",
                  border: "1px solid #f0c674",
                  borderRadius: "8px",
                  padding: "1rem",
                }}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1 me-3">
                    <div
                      style={{
                        fontSize: "0.85rem",
                        whiteSpace: "pre-line",
                        lineHeight: "1.4",
                        flex: 1,
                      }}
                    >
                      {generatePurchaseSummary()}
                    </div>
                  </div>
                  <Button
                    variant="outline-warning"
                    size="sm"
                    onClick={copyPurchaseSummary}
                    style={{
                      borderColor: "#ffc107",
                      color: "#856404",
                      minWidth: "80px",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "";
                      e.target.style.color = "";
                    }}
                  >
                    📋 Copiar
                  </Button>
                </div>
              </div>
            </div>

            <div
              className="alert alert-info py-3 text-center"
              style={{
                fontSize: "0.9rem",
                color: "#0c5460",
              }}
            >
              <div className="mb-2">
                <strong>{String.fromCodePoint(0x1f4a1)} Importante:</strong>
              </div>
              <p className="mb-0">
                Asegúrate de incluir el resumen completo en las notas cuando
                realices el pago por wallet
                <br />
              </p>
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
                  Envía tu comprobante de pago y resumen de compra a:
                </p>
              </div>

              <div className="mb-3">
                <Button
                  variant="success"
                  onClick={openWhatsAppWithSummary}
                  size="lg"
                  style={{
                    backgroundColor: "#25D366",
                    width: "100%",
                    borderColor: "#25D366",
                    padding: "0.75rem 2rem",
                    fontSize: "1.1rem",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(37, 211, 102, 0.3)",
                  }}
                  className="d-flex align-items-center justify-content-center mx-auto"
                >
                  <img src={wapp} width={30} />
                  ­­ ­Enviar por WhatsApp
                </Button>
                <small className="text-muted d-block mt-2">
                  Se abrirá WhatsApp con el mensaje del resumen de compra
                  pre-cargado
                </small>
              </div>
            </div>

            <div
              className="alert alert-info py-3 text-center"
              style={{ fontSize: "0.9rem" }}
            >
              <div className="mb-2">
                <strong>
                  {String.fromCodePoint(0x1f50d)} Verificación Manual
                </strong>
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
              Confirmar Pago
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
