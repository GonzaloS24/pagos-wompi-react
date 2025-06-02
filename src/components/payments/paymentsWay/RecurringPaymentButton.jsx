/* eslint-disable react/prop-types */
import { paymentsWayService } from "../../../services/payments/paymentsWay/paymentsWayService";
import "../../../styles/components/RecurringPaymentButton.css";

const RecurringPaymentButton = ({ planId, selectedAssistants }) => {
  const additionalAssistants = Math.max(0, selectedAssistants.length - 1);

  const handleRecurringPayment = () => {
    const success = paymentsWayService.redirectToRecurringPayment(
      planId,
      selectedAssistants
    );

    if (!success) {
      console.error("No se pudo procesar el pago recurrente");
    }
  };

  if (!paymentsWayService.hasRecurringSupport(planId, additionalAssistants)) {
    return (
      <div className="recurring-payment-container">
        <button
          className="btn-recurring-payment btn-recurring-disabled"
          disabled
        >
          Configuración No Disponible
        </button>
      </div>
    );
  }

  return (
    <div className="recurring-payment-container">
      <button
        className="btn-recurring-payment"
        onClick={handleRecurringPayment}
      >
        Pago automático mensual
      </button>
    </div>
  );
};

export default RecurringPaymentButton;
