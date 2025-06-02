import { useRef, useEffect, memo } from "react";
import PropTypes from "prop-types";
import { paymentsWayService } from "../../../services/payments/paymentsWay/paymentsWayService";
import "../../../styles/components/PaymentsWayForm.css";

const PaymentsWayForm = ({
  amount,
  orderDescription,
  reference,
  enableRecurring,
  formData,
  onSubmit,
}) => {
  const formRef = useRef(null);

  useEffect(() => {
    if (onSubmit) {
      onSubmit();
    }
  }, [onSubmit]);

  const formConfig = paymentsWayService.createPaymentForm({
    amount,
    orderDescription,
    reference,
    enableRecurring,
    formData,
  });

  return (
    <div className="payments-way-container">
      <form
        ref={formRef}
        method={formConfig.method}
        action={formConfig.action}
        className="payments-way-form"
      >
        {Object.entries(formConfig.fields).map(([name, value]) => (
          <input key={name} name={name} type="hidden" value={value} />
        ))}

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
