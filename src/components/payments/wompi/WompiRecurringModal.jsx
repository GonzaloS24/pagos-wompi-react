import { Modal } from "react-bootstrap";
import { useState } from "react";
import PropTypes from "prop-types";
import CreditCardForm from "./CreditCardForm";
import { wompiRecurringService } from "../../../services/payments/wompi/wompiRecurringService";
import Swal from "sweetalert2";

const WompiRecurringModal = ({
  show,
  onHide,
  paymentCalculations,
  formData,
}) => {
  const [loading, setLoading] = useState(false);

  const handleCardSubmit = async (cardData) => {
    setLoading(true);

    try {
      console.log("🚀 Iniciando configuración de pago recurrente...");
      const result = await wompiRecurringService.processRecurringPayment(
        cardData,
        paymentCalculations,
        formData
      );

      if (result.success) {
        await Swal.fire({
          icon: "success",
          title: "¡Pago Recurrente Configurado!",
          html: `
            <div style="text-align: left;">
              <p><strong>✅ Tu pago automático mensual ha sido configurado exitosamente.</strong></p>
              <br>
              <p><strong>Detalles:</strong></p>
              <ul style="text-align: left; display: inline-block;">
                <li>💳 Tarjeta registrada: **** **** **** ${cardData.number.slice(
                  -4
                )}</li>
                <li>💰 Monto mensual: ${paymentCalculations.totalUSD.toFixed(
                  2
                )} USD</li>
                <li>📅 Próximo cobro: ${new Date(
                  Date.now() + 30 * 24 * 60 * 60 * 1000
                ).toLocaleDateString()}</li>
                <li>📧 Recibirás notificaciones por email</li>
              </ul>
              <br>
              <p><small>💡 Puedes cancelar en cualquier momento contactando soporte.</small></p>
            </div>
          `,
          confirmButtonText: "Continuar",
          confirmButtonColor: "#009ee3",
          width: "500px",
        });

        onHide();
      } else {
        throw new Error(result.error || "Error procesando el pago");
      }
    } catch (error) {
      console.error("❌ Error processing recurring payment:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.message ||
          "Hubo un problema al configurar tu pago automático. Por favor intenta nuevamente.",
        confirmButtonColor: "#009ee3",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!loading) {
      onHide();
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleCancel}
      size="lg"
      centered
      backdrop={loading ? "static" : true}
      keyboard={!loading}
    >
      <Modal.Header closeButton={!loading}>
        <Modal.Title style={{ color: "#009ee3" }}>
          Configurar Pago Automático
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Resumen del pago */}
        <div
          style={{
            backgroundColor: "#edf4ff",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
            border: "1px solid rgba(0, 158, 227, 0.2)",
          }}
        >
          <h6 style={{ color: "#009ee3", marginBottom: "10px" }}>
            Resumen del Pago Mensual
          </h6>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "5px",
            }}
          >
            <span>Total mensual:</span>
            <span style={{ fontWeight: "bold" }}>
              ${paymentCalculations.totalUSD.toFixed(2)} USD
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "5px",
            }}
          >
            <span>En pesos colombianos:</span>
            <span style={{ fontWeight: "bold" }}>
              ${Math.round(paymentCalculations.priceInCOP).toLocaleString()} COP
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Workspace:</span>
            <span>{formData.workspace_name}</span>
          </div>
        </div>

        {/* Información importante */}
        <div
          style={{
            backgroundColor: "#fff3cd",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
            border: "1px solid #ffeaa7",
          }}
        >
          <h6 style={{ color: "#856404", marginBottom: "10px" }}>
            ⚠️ Información Importante
          </h6>
          <ul style={{ margin: 0, paddingLeft: "20px", color: "#856404" }}>
            <li>Este será un pago automático mensual</li>
            <li>Se cobrará el mismo monto cada mes</li>
            <li>Puedes cancelar en cualquier momento contactando soporte</li>
            <li>Recibirás notificaciones por email de cada cobro</li>
          </ul>
        </div>

        {/* Formulario de tarjeta */}
        <CreditCardForm
          onSubmit={handleCardSubmit}
          loading={loading}
          onCancel={handleCancel}
        />
      </Modal.Body>
    </Modal>
  );
};

WompiRecurringModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  paymentCalculations: PropTypes.object.isRequired,
  formData: PropTypes.object.isRequired,
};

export default WompiRecurringModal;
