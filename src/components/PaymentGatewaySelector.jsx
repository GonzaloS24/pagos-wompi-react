import PropTypes from "prop-types";
import wompiLogo from "../assets/wompi-logo.png";
import stripeLogo from "../assets/stripe-logo-2.png";

const PaymentGatewaySelector = ({
  selectedGateway,
  onChange,
  enableRecurring,
  setEnableRecurring,
}) => {
  return (
    <div className="payment-gateway-selector mb-3">
      <div className="gateway-selector-header mb-2">
        <span className="gateway-label">Selecciona tu método de pago:</span>
      </div>

      <div className="gateway-options">
        <div
          className={`gateway-option ${
            selectedGateway === "wompi" ? "selected" : ""
          }`}
          onClick={() => {
            onChange("wompi");
            if (enableRecurring) setEnableRecurring(false);
          }}
        >
          <img src={wompiLogo} alt="Wompi" width={100} />
          <span className="gateway-description">
            Tarjetas, PSE, Bancolombia Transfer
          </span>
        </div>

        <div
          className={`gateway-option ${
            selectedGateway === "stripe" ? "selected" : ""
          }`}
          onClick={() => onChange("stripe")}
        >
          <img src={stripeLogo} alt="Stripe" width={70} />
          {/* <br /> */}
          <span className="gateway-description">Tarjetas internacionales</span>
          <span className="recurring-label">Pagos automaticos</span>
        </div>
      </div>

      {selectedGateway === "stripe" && (
        <div className="recurring-option mt-2">
          <input
            type="checkbox"
            id="recurringPaymentCheck"
            className="form-check-input"
            checked={enableRecurring}
            onChange={(e) => setEnableRecurring(e.target.checked)}
          />
          <label
            htmlFor="recurringPaymentCheck"
            className="form-check-label ms-2"
          >
            Habilitar pago automático mensual
          </label>
          <i
            className="bx bx-info-circle ms-1"
            title="Los pagos automáticos permiten que se cargue automáticamente tu tarjeta de forma mensual"
          ></i>
        </div>
      )}
    </div>
  );
};

PaymentGatewaySelector.propTypes = {
  selectedGateway: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  enableRecurring: PropTypes.bool.isRequired,
  setEnableRecurring: PropTypes.func.isRequired,
};

export default PaymentGatewaySelector;
