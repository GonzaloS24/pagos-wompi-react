import { memo } from "react";
import PropTypes from "prop-types";
import wompiLogo from "../../assets/wompi-logo.png";
import paymentsWayLogo from "../../assets/paymentsway-logo.svg";
import "../../styles/components/PaymentGatewaySelector.css";

const PaymentGatewaySelector = ({
  selectedGateway,
  onChange,
  enableRecurring,
  setEnableRecurring,
  showRecurringOption,
  isRecurringPayment,
}) => {
  const handleRecurringChange = (e) => {
    const isChecked = e.target.checked;
    setEnableRecurring(isChecked);

    // Si se activa el pago recurrente, cambiar automáticamente a Payments Way
    if (isChecked) {
      onChange("paymentsway");
    }
  };

  // Si es pago recurrente, solo mostrar Payments Way
  if (isRecurringPayment) {
    return (
      <div className="payment-gateway-selector mb-3">
        <div className="gateway-selector-header mb-2">
          <span className="gateway-label">Método de pago seleccionado:</span>
        </div>

        <div className="gateway-options">
          <div className="gateway-option selected">
            <img src={paymentsWayLogo} alt="Payments Way" width={100} />
            <span className="gateway-description">
              <span className="recurring-label">Pago Automático Mensual</span>
              <br />
              Solo disponible con Payments Way
            </span>
          </div>
        </div>

        {/* Mostrar opción de pago recurrente activada */}
        <div className="recurring-option mt-2 recurring-active">
          <input
            type="checkbox"
            id="recurringPaymentCheck"
            className="form-check-input"
            checked={enableRecurring}
            onChange={handleRecurringChange}
          />
          <label
            htmlFor="recurringPaymentCheck"
            className="form-check-label ms-2"
          >
            <span>Pago automático mensual habilitado</span>
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-gateway-selector mb-3">
      <div className="gateway-selector-header mb-2">
        <span className="gateway-label">Selecciona tu método de pago:</span>
      </div>

      <div className="gateway-options">
        <div
          className={`gateway-option ${
            selectedGateway === "wompi" ? "selected" : ""
          } ${enableRecurring ? "disabled" : ""}`}
          onClick={() => {
            if (!enableRecurring) {
              onChange("wompi");
            }
          }}
        >
          <img src={wompiLogo} alt="Wompi" width={100} />
          <span className="gateway-description">
            Tarjetas, PSE, <br /> Bancolombia Transfer
            {enableRecurring && (
              <>
                <br />
                <small className="text-muted">
                  (No disponible con pago recurrente)
                </small>
              </>
            )}
          </span>
        </div>

        <div
          className={`gateway-option ${
            selectedGateway === "paymentsway" ? "selected" : ""
          }`}
          onClick={() => onChange("paymentsway")}
        >
          <img src={paymentsWayLogo} alt="Payments Way" width={100} />
          <span className="gateway-description">
            Tarjetas, PSE, <br /> Pagos recurrentes
          </span>
        </div>
      </div>

      {showRecurringOption && (
        <div className="recurring-option mt-2">
          <input
            type="checkbox"
            id="recurringPaymentCheck"
            className="form-check-input"
            checked={enableRecurring}
            onChange={handleRecurringChange}
          />
          <label
            htmlFor="recurringPaymentCheck"
            className="form-check-label ms-2"
          >
            Habilitar pago automático mensual
          </label>
          <i
            className="bx bx-info-circle ms-1"
            title="Los pagos automáticos permiten que se cargue automáticamente tu tarjeta de forma mensual. Solo disponible con Payments Way."
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
  showRecurringOption: PropTypes.bool,
  isRecurringPayment: PropTypes.bool,
};

PaymentGatewaySelector.defaultProps = {
  showRecurringOption: false,
  isRecurringPayment: false,
};

export default memo(PaymentGatewaySelector);
