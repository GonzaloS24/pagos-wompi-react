/* eslint-disable react/prop-types */
import CreditCardForm from "../../../components/payments/wompi/CreditCardForm";

const PaymentView = ({ changesSummary, onBack, onSubmit, modifying }) => {
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
                <strong>Total a pagar:</strong>
              </span>
              <span>
                <strong>${changesSummary?.totalAmount?.toFixed(2)} USD</strong>
              </span>
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
