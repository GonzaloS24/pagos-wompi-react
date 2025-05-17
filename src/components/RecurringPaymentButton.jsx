/* eslint-disable react/prop-types */
import { getRecurringPlanUrl } from "../api/paymentsWayRecurringConfig";
import "./RecurringPaymentButton.css";

const RecurringPaymentButton = ({ planId, enableRecurring }) => {
  const handleRecurringPayment = () => {
    const url = getRecurringPlanUrl(planId);
    console.log("Intentando abrir URL de pago recurrente:", url);
    if (url) {
      window.location.href = url;
    } else {
      console.error("No se encontró URL para el plan:", planId);
    }
  };

  if (!enableRecurring || !getRecurringPlanUrl(planId)) {
    return null;
  }

  return (
    <div className="recurring-payment-container">
      <button
        className="btn-recurring-payment"
        onClick={handleRecurringPayment}
      >
        Pago Automático Mensual
      </button>
    </div>
  );
};

export default RecurringPaymentButton;
