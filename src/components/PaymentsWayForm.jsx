import { useRef, useEffect, memo } from "react";
import PropTypes from "prop-types";
import "./PaymentsWayForm.css";

// sandbox
// const PAYMENTS_WAY_CONFIG = {
//   MERCHANT_ID: "647",
//   FORM_ID: "542",
//   TERMINAL_ID: "529",
//   COLOR_BASE: "#801c2c",
//   RESPONSE_URL: "https://chateapro.app/",
// };

// production
const PAYMENTS_WAY_CONFIG = {
  MERCHANT_ID: "3192",
  FORM_ID: "3234",
  TERMINAL_ID: "2372",
  COLOR_BASE: "#801c2c",
  RESPONSE_URL: "https://chateapro.app/",
};

const PaymentsWayForm = ({
  amount,
  orderDescription,
  reference,
  enableRecurring,
  onSubmit,
}) => {
  const formRef = useRef(null);

  const formattedAmount = Math.round(amount);

  // Generar número de orden único
  const orderNumber = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const fullDescription = `${orderDescription}${
    enableRecurring ? " (Pago recurrente)" : ""
  }`;

  const additionalData = JSON.stringify({
    reference: reference,
  });

  // Log para debugging
  console.log("PaymentsWayForm - Preparando formulario:", {
    amount: formattedAmount,
    orderDescription: fullDescription,
    reference,
    enableRecurring,
    orderNumber,
  });

  useEffect(() => {
    if (onSubmit) {
      onSubmit();
    }
  }, [onSubmit]);

  return (
    <div className="payments-way-container">
      <form
        ref={formRef}
        method="post"
        action="https://merchant.paymentsway.co/cartaspago/redirect"
        // action="https://merchantpruebas.vepay.com.co/cartaspago/redirect"
        className="payments-way-form"
      >
        <input
          name="merchant_id"
          type="hidden"
          value={PAYMENTS_WAY_CONFIG.MERCHANT_ID}
        />
        <input
          name="form_id"
          type="hidden"
          value={PAYMENTS_WAY_CONFIG.FORM_ID}
        />
        <input
          name="terminal_id"
          type="hidden"
          value={PAYMENTS_WAY_CONFIG.TERMINAL_ID}
        />
        <input name="order_number" type="hidden" value={orderNumber} />
        <input name="amount" type="hidden" value={formattedAmount} />
        <input name="currency" type="hidden" value="cop" />
        <input name="order_description" type="hidden" value={fullDescription} />
        <input
          name="color_base"
          type="hidden"
          value={PAYMENTS_WAY_CONFIG.COLOR_BASE}
        />
        <input
          name="is_recurring"
          type="hidden"
          value={enableRecurring ? "true" : "false"}
        />
        <input
          name="client_email"
          type="hidden"
        />
        <input
          name="client_phone"
          type="hidden"
        />
        <input
          name="client_firstname"
          type="hidden"
        />
        <input
          name="client_lastname"
          type="hidden"
        />
        <input name="client_doctype" type="hidden" value="4" />
        <input
          name="client_numdoc"
          type="hidden"
        />
        <input
          name="response_url"
          type="hidden"
          value={PAYMENTS_WAY_CONFIG.RESPONSE_URL}
        />
        <input name="additional_data" type="hidden" value={additionalData} />
        <button
          type="submit"
          className="btn-primary w-100 d-flex align-items-center justify-content-center py-2"
        >
          <span className="me-2">Paga con Payments Way</span>
        </button>
      </form>
    </div>
  );
};

PaymentsWayForm.propTypes = {
  amount: PropTypes.number.isRequired,
  orderDescription: PropTypes.string.isRequired,
  formData: PropTypes.object.isRequired,
  reference: PropTypes.string.isRequired,
  enableRecurring: PropTypes.bool,
  onSubmit: PropTypes.func,
};

PaymentsWayForm.defaultProps = {
  enableRecurring: false,
  onSubmit: null,
};

export default memo(PaymentsWayForm);
