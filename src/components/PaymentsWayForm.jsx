import { useRef, useEffect, memo } from "react";
import PropTypes from "prop-types";
import "./PaymentsWayForm.css";

const PAYMENTS_WAY_CONFIG = {
  MERCHANT_ID: "3192",
  FORM_ID: "3263",
  TERMINAL_ID: "2372",
  COLOR_BASE: "#009ee3",
  RESPONSE_URL: window.location.origin + "/transaction-summary",
};

const PaymentsWayForm = ({
  amount,
  orderDescription,
  formData,
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
        <input name="custom_ref" type="hidden" value={reference} />
        <input
          name="is_recurring"
          type="hidden"
          value={enableRecurring ? "true" : "false"}
        />
        <input
          name="client_email"
          type="hidden"
          value={formData.owner_email || ""}
        />
        <input
          name="client_phone"
          type="hidden"
          value={formData.phone_number || ""}
        />
        <input
          name="client_firstname"
          type="hidden"
          value={formData.owner_name.split(" ")[0] || ""}
        />
        <input
          name="client_lastname"
          type="hidden"
          value={formData.owner_name.split(" ").slice(1).join(" ") || ""}
        />
        <input name="client_doctype" type="hidden" value="4" />{" "}
        <input
          name="client_numdoc"
          type="hidden"
          value={formData.workspace_id || ""}
        />
        <input
          name="response_url"
          type="hidden"
          value={PAYMENTS_WAY_CONFIG.RESPONSE_URL}
        />
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
