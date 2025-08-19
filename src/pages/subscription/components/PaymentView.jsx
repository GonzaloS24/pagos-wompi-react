/* eslint-disable react/prop-types */
import CreditCardForm from "../../../components/payments/wompi/CreditCardForm";

const PaymentView = ({ changesSummary, onBack, onSubmit, modifying, usdToCopRate = 4200 }) => {
  // Calcular total en COP
  const totalCOP = changesSummary?.totalAmount 
    ? Math.round(changesSummary.totalAmount * usdToCopRate)
    : 0;

  return (
    <div className="subscription-payment">
      <div className="payment-header">
        <button className="btn-back" onClick={onBack} disabled={modifying}>
          ← Volver
        </button>
        <h3 style={{ color: "#009ee3" }}>Procesar Pago</h3>
      </div>

      <div className="payment-content">
        <div className="payment-summary">
          <h5>Resumen del Pago</h5>
          <div className="summary-details">
            {changesSummary?.items?.map((item, index) => (
              <div key={index} className="summary-item">
                <span>{item.description}</span>
                <span>${item.amount.toFixed(2)} USD</span>
              </div>
            ))}
            
            <div className="summary-total">
              <span>
                <strong>Total en dólares:</strong>
              </span>
              <span>
                <strong>${changesSummary?.totalAmount?.toFixed(2)} USD</strong>
              </span>
            </div>

            <div className="summary-total">
              <span>
                <strong>Total en pesos colombianos:</strong>
              </span>
              <span>
                <strong>${totalCOP.toLocaleString("es-CO")} COP</strong>
              </span>
            </div>

            <div className="summary-info">
              <small className="text-muted">
                * Este pago será procesado una sola vez
              </small>
            </div>
          </div>
        </div>

        <CreditCardForm
          onSubmit={onSubmit}
          loading={modifying}
          onCancel={onBack}
        />
      </div>
    </div>
  );
};

export default PaymentView;