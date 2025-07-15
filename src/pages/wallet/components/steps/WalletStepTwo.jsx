import PropTypes from "prop-types";
import { Button } from "react-bootstrap";

const WalletStepTwo = ({
  walletData,
  paymentData,
  selectedPlan,
  selectedAssistants,
  selectedComplements,
  isAssistantsOnly,
  paymentCalculations,
  copyToClipboard,
  copyPurchaseSummary,
  cedula = "",
  telefono = "",
}) => {
  const hasAssistants = selectedAssistants && selectedAssistants.length > 0;
  const hasComplements = selectedComplements && selectedComplements.length > 0;
  const hasPlan = !isAssistantsOnly && selectedPlan;
  const isAnnual = paymentCalculations?.isAnnual || false;
  const totalAnnualSavings = paymentCalculations?.totalAnnualSavings || 0;

  const generatePurchaseSummary = () => {
    let summary = "RESUMEN DEL PLAN:\n\n";

    summary += `Workspace ID: ${paymentData.formData.workspace_id}\n`;

    // Agregar datos personales si están disponibles
    if (cedula) {
      summary += `Cédula: ${cedula}\n`;
    }
    if (telefono) {
      summary += `Teléfono: ${telefono}\n`;
    }

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

    summary += `Periodicidad: ${isAnnual ? "Anual" : "Mensual"}\n`;

    if (isAnnual && totalAnnualSavings > 0) {
      summary += `Ahorro anual: -$${totalAnnualSavings.toFixed(2)} USD\n`;
    }

    summary += `Total en dólares${
      isAnnual ? " (anual)" : ""
    }: $${walletData.amountUSD.toFixed(2)} USD\n`;

    summary += `Total en pesos colombianos${
      isAnnual ? " (anual)" : ""
    }: ${Math.round(walletData.amount)} COP\n`;

    return summary;
  };

  const handleCopyPurchaseSummary = () => {
    const summary = generatePurchaseSummary();
    copyPurchaseSummary(summary);
  };

  return (
    <div>
      <h5 className="text-center mb-4" style={{ color: "#009ee3" }}>
        Paso 3: Realizar el Pago
      </h5>

      {/* SECCIÓN 1: NOTAS DEL PAGO */}
      <div className="mb-4">
        <div className="d-flex align-items-center mb-2">
          <span
            className="bold"
            style={{ fontSize: "1.1rem", fontWeight: "600" }}
          >
            1. {String.fromCodePoint(0x1f4dd)} Incluye estas notas en tu pago:
          </span>
        </div>

        {/* Mensaje informativo destacado */}
        <div
          style={{
            background: "#e8f5e9",
            border: "1px solid #28a745",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <p
            style={{
              color: "#155724",
              margin: "0",
              fontSize: "0.9rem",
              fontWeight: "400",
            }}
          >
            Si envías las notas, tu plan se activará de forma inmediata. De lo
            contrario, tu solicitud será revisada manualmente, lo que puede
            demorar el proceso.
          </p>
        </div>

        <div
          style={{
            background: "#fef9e7",
            border: "1px solid #ffc107",
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
              variant="warning"
              size="sm"
              onClick={handleCopyPurchaseSummary}
              style={{
                backgroundColor: "#ffc107",
                borderColor: "#ffc107",
                color: "#fff",
                minWidth: "80px",
                fontWeight: "600",
              }}
            >
              📋 Copiar
            </Button>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: DIRECCIÓN DE WALLET */}
      <div className="mb-4">
        <div className="d-flex align-items-center mb-2">
          <span
            className="bold"
            style={{ fontSize: "1.1rem", fontWeight: "600" }}
          >
            2. Envía el dinero y el resumen del plan a esta dirección:
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
                backgroundColor: "#009ee3",
                borderColor: "#009ee3",
                color: "#fff",
                minWidth: "80px",
                fontWeight: "600",
              }}
            >
              📋 Copiar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

WalletStepTwo.propTypes = {
  walletData: PropTypes.object.isRequired,
  paymentData: PropTypes.object.isRequired,
  selectedPlan: PropTypes.object,
  selectedAssistants: PropTypes.array.isRequired,
  selectedComplements: PropTypes.array.isRequired,
  isAssistantsOnly: PropTypes.bool.isRequired,
  paymentCalculations: PropTypes.object,
  copyToClipboard: PropTypes.func.isRequired,
  copyPurchaseSummary: PropTypes.func.isRequired,
  cedula: PropTypes.string,
  telefono: PropTypes.string,
};

export default WalletStepTwo;
