import PropTypes from "prop-types";
import { Button } from "react-bootstrap";
import wapp from "../../../../assets/whatsapp.png";

const WalletStepThree = ({
  walletData,
  paymentData,
  selectedPlan,
  selectedAssistants,
  selectedComplements,
  isAssistantsOnly,
  paymentCalculations,
  tipoDocumento = "",
  cedula = "",
  telefono = "",
}) => {
  const hasAssistants = selectedAssistants && selectedAssistants.length > 0;
  const hasComplements = selectedComplements && selectedComplements.length > 0;
  const hasPlan = !isAssistantsOnly && selectedPlan;
  const isAnnual = paymentCalculations?.isAnnual || false;
  const totalAnnualSavings = paymentCalculations?.totalAnnualSavings || 0;

  // Función para obtener el texto del tipo de documento
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

  const generateWhatsAppSummary = () => {
    let summary =
      "¡Hola! Te envío el comprobante de pago junto con el resumen de mi compra:\n\n";

    summary += `Workspace ID: ${paymentData.formData.workspace_id}\n`;

    // Agregar datos personales si están disponibles
    // if (tipoDocumento && cedula) {
    //   summary += `Documento: ${getTipoDocumentoText(
    //     tipoDocumento
    //   )} ${cedula}\n`;
    // }

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
      summary += `Ahorro anual: -${totalAnnualSavings.toFixed(2)} USD\n`;
    }

    summary += `Total en dólares${
      isAnnual ? " (anual)" : ""
    }: ${walletData.amountUSD.toFixed(2)} USD\n`;

    summary += `Total en pesos colombianos${
      isAnnual ? " (anual)" : ""
    }: ${Math.round(walletData.amount)} COP\n\n`;

    summary += "¡Gracias!";

    return summary;
  };

  const openWhatsAppWithSummary = () => {
    const summary = generateWhatsAppSummary();
    const phoneNumber = walletData.contactWhatsApp.replace(/\D/g, "");
    const encodedMessage = encodeURIComponent(summary);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div>
      <h5 className="text-center mb-4" style={{ color: "#009ee3" }}>
        Paso 4: Enviar Comprobante
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
              backgroundColor: "#25d366",
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
            Se abrirá WhatsApp con el mensaje del resumen de compra pre-cargado
          </small>
        </div>
      </div>

      <div
        className="alert alert-info py-3 text-center"
        style={{ fontSize: "0.9rem" }}
      >
        <div className="mb-2">
          <strong>{String.fromCodePoint(0x1f50d)} Verificación Manual</strong>
        </div>
        <p className="mb-0">
          Tu pago será verificado manualmente. Te notificaremos una vez
          confirmado.
        </p>
      </div>
    </div>
  );
};

WalletStepThree.propTypes = {
  walletData: PropTypes.object.isRequired,
  paymentData: PropTypes.object.isRequired,
  selectedPlan: PropTypes.object,
  selectedAssistants: PropTypes.array.isRequired,
  selectedComplements: PropTypes.array.isRequired,
  isAssistantsOnly: PropTypes.bool.isRequired,
  paymentCalculations: PropTypes.object,
  cedula: PropTypes.string,
  telefono: PropTypes.string,
  tipoDocumento: PropTypes.string,
};

export default WalletStepThree;
