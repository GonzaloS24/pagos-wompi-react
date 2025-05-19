/* eslint-disable react/prop-types */
import {
  getRecurringPlanUrl,
  getPlanDescription,
} from "../api/paymentsWayRecurringConfig";
import "./RecurringPaymentButton.css";

const RecurringPaymentButton = ({ planId, selectedAssistants }) => {
  const additionalAssistants = Math.max(0, selectedAssistants.length - 1);

  const handleRecurringPayment = () => {
    const url = getRecurringPlanUrl(planId, additionalAssistants);

    if (url) {
      console.log("Redirigiendo a URL de pago recurrente:", url);
      window.location.href = url;
    } else {
      alert(
        `Lo sentimos, aún no tenemos configurado el pago recurrente para ${getPlanDescription(
          planId,
          selectedAssistants.length
        )}. Por favor, contacta a soporte para más información.`
      );
    }
  };

  if (!getRecurringPlanUrl(planId, additionalAssistants)) {
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
        <i className="bx bx-credit-card"></i>
        Pago automático mensual
      </button>
    </div>
  );
};

export default RecurringPaymentButton;
