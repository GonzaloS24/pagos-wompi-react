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
        Paso 3: Realizar el Pago
      </h5>

      {/* SECCIÓN 3: ADVERTENCIA Y TUTORIAL */}
      <div className="mb-4">
        {/* <div className="d-flex align-items-center mb-2">
          <span style={{ fontSize: "1.1rem", fontWeight: "600" }}>
            3. Incluye las notas del plan:
          </span>
        </div> */}

        {/* Advertencia mejorada */}
        <div
          style={{
            background: "#fff3cd",
            border: "2px solid #ffc107",
            borderRadius: "8px",
            padding: "1.2rem",
            marginBottom: "1rem",
          }}
        >
          <div className="d-flex align-items-center mb-2">
            <span style={{ fontSize: "1.3rem", marginRight: "0.5rem" }}>
              ⚠️
            </span>
            <strong style={{ color: "#856404", fontSize: "1rem" }}>
              Incluye las notas en tu transferencia
            </strong>
          </div>
          <p style={{ color: "#856404", margin: "0", fontSize: "0.9rem" }}>
            Si incluyes las notas en el campo descripción o concepto de tu
            transferencia, tu plan se activará <strong>inmediatamente</strong>.
            Sin ellas, puede demorar varios días.
          </p>
        </div>

        {/* Botón del tutorial mejorado */}
        <Button
          style={{
            backgroundColor: "#009ee3",
            borderColor: "#009ee3",
            color: "#fff",
            width: "100%",
            padding: "0.75rem 1rem",
            fontWeight: "600",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#007bb8";
            e.target.style.borderColor = "#007bb8";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#009ee3";
            e.target.style.borderColor = "#009ee3";
          }}
        >
          <i className="bx bx-play-circle me-2"></i>
          Ver Tutorial: Cómo incluir las notas
        </Button>
      </div>

      {/* SECCIÓN 1: RESUMEN DEL PLAN - PRIMERO CON COLORES AMARILLOS */}
      <div className="mb-4">
        <div className="d-flex align-items-center mb-2">
          <span style={{ fontSize: "1.1rem", fontWeight: "600" }}>
            1. Copia este resumen:
          </span>
        </div>

        <div
          style={{
            background: "#fef9e7",
            border: "2px solid #ffc107",
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

      {/* SECCIÓN 2: DIRECCIÓN DE WALLET */}
      <div className="mb-4">
        <div className="d-flex align-items-center mb-2">
          <span style={{ fontSize: "1.1rem", fontWeight: "600" }}>
            2. Envía el dinero a esta dirección:
          </span>
        </div>
        <div
          style={{
            background: "#edf4ff",
            border: "2px solid #009ee3",
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
  tipoDocumento: PropTypes.string,
};

export default WalletStepTwo;
