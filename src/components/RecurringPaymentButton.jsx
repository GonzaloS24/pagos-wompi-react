/* eslint-disable react/prop-types */
import { getRecurringPlanUrl } from '../api/paymentsWayRecurringConfig';
import './RecurringPaymentButton.css';

const RecurringPaymentButton = ({ planId, enableRecurring }) => {
  const handleRecurringPayment = () => {
    const url = getRecurringPlanUrl(planId);
    console.log('Intentando abrir URL de pago recurrente:', url);
    if (url) {
      window.location.href = url;
    } else {
      console.error('No se encontró URL para el plan:', planId);
    }
  };

  if (!enableRecurring || !getRecurringPlanUrl(planId)) {
    return null;
  }

  return (
    <div className="recurring-payment-container">
      <div className="recurring-payment-info mb-3">
        <div className="alert alert-info">
          <strong>🔄 Pago Recurrente Automático</strong>
          <p className="mb-0 mt-2">
            Tu plan se renovará automáticamente cada mes. Puedes cancelar en cualquier momento desde tu cuenta.
          </p>
        </div>
      </div>
      
      <button
        className="btn-recurring-payment"
        onClick={handleRecurringPayment}
      >
        <i className="bx bx-credit-card"></i>
        Configurar Pago Recurrente Mensual
      </button>
    </div>
  );
};

export default RecurringPaymentButton;