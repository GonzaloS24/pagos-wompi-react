import PropTypes from "prop-types";
import { Button } from "react-bootstrap";
import {
  convertUSDToLocalCurrency,
  formatCurrencyAmount,
  LATAM_CURRENCIES,
} from "../../../../services/api/currencyService";

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
  selectedCurrency = "COP",
  currencyRates = null,
}) => {
  const hasAssistants = selectedAssistants && selectedAssistants.length > 0;
  const hasComplements = selectedComplements && selectedComplements.length > 0;
  const hasPlan = !isAssistantsOnly && selectedPlan;
  const isAnnual = paymentCalculations?.isAnnual || false;
  const totalAnnualSavings = paymentCalculations?.totalAnnualSavings || 0;

  // Conversión de moneda
  const convertedAmount = currencyRates
    ? convertUSDToLocalCurrency(
        walletData.amountUSD,
        currencyRates,
        selectedCurrency
      )
    : selectedCurrency === "COP"
    ? walletData.amount
    : walletData.amountUSD;

  const convertedSavings =
    currencyRates && totalAnnualSavings > 0
      ? convertUSDToLocalCurrency(
          totalAnnualSavings,
          currencyRates,
          selectedCurrency
        )
      : totalAnnualSavings;

  const currencyInfo = LATAM_CURRENCIES.find(
    (c) => c.code === selectedCurrency
  );

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
      summary += `Ahorro anual: -${formatCurrencyAmount(
        convertedSavings,
        selectedCurrency
      )}\n`;
    }

    summary += `Total en dólares${
      isAnnual ? " (anual)" : ""
    }: $${walletData.amountUSD.toFixed(2)} USD\n`;

    summary += `Total en ${selectedCurrency}${
      isAnnual ? " (anual)" : ""
    }: ${formatCurrencyAmount(convertedAmount, selectedCurrency)}\n`;

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

      {/* Información de moneda seleccionada */}
      {selectedCurrency && currencyInfo && (
        <div
          style={{
            background: "#edf4ff",
            border: "1px solid rgba(0, 158, 227, 0.2)",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div className="d-flex align-items-center">
            <i
              className="bx bx-world"
              style={{
                fontSize: "1.5rem",
                color: "#009ee3",
                marginRight: "0.75rem",
              }}
            ></i>
            <div>
              <div
                style={{
                  fontWeight: "600",
                  color: "#009ee3",
                  fontSize: "0.95rem",
                }}
              >
                Moneda seleccionada
              </div>
              <div style={{ color: "#4a5568", fontSize: "0.9rem" }}>
                {currencyInfo.country} - {currencyInfo.name}
              </div>
            </div>
          </div>
        </div>
      )}

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
        transferencia para una activación inmediata.
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
  selectedCurrency: PropTypes.string,
  currencyRates: PropTypes.object,
};

export default WalletStepFour;
