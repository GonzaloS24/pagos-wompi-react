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
}) => {
  const hasAssistants = selectedAssistants && selectedAssistants.length > 0;
  const hasComplements = selectedComplements && selectedComplements.length > 0;
  const hasPlan = !isAssistantsOnly && selectedPlan;
  const isAnnual = paymentCalculations?.isAnnual || false;
  const totalAnnualSavings = paymentCalculations?.totalAnnualSavings || 0;

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
        Paso 2: Realizar el Pago
      </h5>

      {/* Sección 1: Dirección de Wallet */}
      <div className="mb-4">
        <div className="d-flex align-items-center mb-2">
          <span className="bold">
            1. {String.fromCodePoint(0x1f4b3)} Envía el dinero a esta dirección:
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
            2. {String.fromCodePoint(0x1f4dd)} Incluye este resumen en las notas
            del pago:
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
              onClick={handleCopyPurchaseSummary}
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
          Asegúrate de incluir el resumen completo en las notas cuando realices
          el pago por wallet
          <br />
        </p>
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
};

export default WalletStepTwo;
