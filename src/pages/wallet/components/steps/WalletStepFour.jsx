import PropTypes from "prop-types";
import { Button } from "react-bootstrap";

const WalletStepFour = ({
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
  tipoDocumento = "",
  telefono = "",
}) => {
  const hasAssistants = selectedAssistants && selectedAssistants.length > 0;
  const hasComplements = selectedComplements && selectedComplements.length > 0;
  const hasPlan = !isAssistantsOnly && selectedPlan;
  const isAnnual = paymentCalculations?.isAnnual || false;
  const totalAnnualSavings = paymentCalculations?.totalAnnualSavings || 0;

  const getTipoDocumentoText = (tipo) => {
    switch (tipo) {
      case "cedula":
        return "CC";
      case "nit":
        return "NIT";
      case "otro":
        return "OTRO";
      default:
        return tipo.toUpperCase();
    }
  };

  const generatePurchaseSummary = () => {
    let summary = "RESUMEN DEL PLAN:\n\n";

    summary += `Workspace ID: ${paymentData.formData.workspace_id}\n`;

    if (tipoDocumento) {
      summary += `Tipo de documento: ${getTipoDocumentoText(tipoDocumento)}\n`;
    }

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
        Paso 4: Realizar el Pago
      </h5>

      {/* SECCIÓN 1: RESUMEN DEL PLAN */}
      <div className="mb-4">
        <div className="d-flex align-items-center mb-2">
          <span style={{ fontSize: "1.1rem", fontWeight: "600" }}>
            1. Copia este resumen:
          </span>
        </div>

        <div
          style={{
            background: "#fff3cd",
            border: "1px solid #ffc107",
            color: "#856404",
            borderRadius: "8px",
            padding: "1.2rem",
          }}
        >
          <div className="d-flex justify-content-between align-items-start">
            <div className="flex-grow-1 me-3">
              <div
                style={{
                  fontSize: "0.85rem",
                  whiteSpace: "pre-line",
                  lineHeight: "1.4",
                  color: "#495057",
                }}
              >
                {generatePurchaseSummary()}
              </div>
            </div>
            <Button
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

      {/* ADVERTENCIA DE CONVERSIÓN DE MONEDAS */}
      <div
        style={{
          background: "#fff3cd",
          border: "1px solid #ffc107",
          borderRadius: "10px",
          padding: "1.2rem",
          marginBottom: "1.5rem",
          boxShadow: "0 2px 8px rgba(255, 193, 7, 0.2)",
        }}
      >
        <div className="d-flex align-items-start mb-2">
          <span style={{ fontSize: "1.3rem", marginRight: "0.7rem" }}>💱</span>
          <div>
            <strong style={{ color: "#856404", fontSize: "1rem" }}>
              Pagos en otras monedas
            </strong>
            <p
              style={{
                color: "#856404",
                margin: "0.5rem 0 0 0",
                fontSize: "0.9rem",
                lineHeight: "1.5",
              }}
            >
              Para pagos en una moneda diferente a COP o USD, por favor verifica
              el valor equivalente en tu moneda local antes de realizar la
              transferencia. Puedes usar un {" "}
              <a
                href="https://www.google.com/search?q=conversor+de+monedas"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#0066cc",
                  textDecoration: "underline",
                  fontWeight: "600",
                }}
              >
                conversor de monedas
              </a>{" "}
              para calcularlo.
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: DIRECCIÓN DE WALLET */}
      <div className="mb-4">
        <div className="d-flex align-items-center mb-2">
          <span style={{ fontSize: "1.1rem", fontWeight: "600" }}>
            2. Envía el dinero y el resumen del plan a esta dirección:
          </span>
        </div>
        <div
          style={{
            background: "#edf4ff",
            border: "1px solid #009ee3",
            borderRadius: "8px",
            padding: "1.2rem",
          }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div className="flex-grow-1 me-3">
              <small
                className="text-muted d-block mb-1"
                style={{ fontWeight: "500" }}
              >
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

      {/* Recordatorio del tutorial */}
      <div className="alert  text-center">
        <i className="bx bx-bulb me-2"></i>
        Incluye el resumen del plan en la descripción o concepto de tu
        transferencia para una activación inmediata. Si pagas en otra moneda,
        asegúrate de enviar el valor correcto.
      </div>
    </div>
  );
};

WalletStepFour.propTypes = {
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
  tipoDocumento: PropTypes.string,
};

export default WalletStepFour;
