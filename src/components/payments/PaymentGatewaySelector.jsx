import { memo } from "react";
import PropTypes from "prop-types";
import wompiLogo from "../../assets/wompi-logo.png";
import walletLogo from "../../assets/wallet.png";
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

    // Si se activa el pago recurrente, mantener wompi pero cambiar el comportamiento
    if (isChecked) {
      onChange("wompi");
    }
  };

  // Si es pago recurrente con Wompi, mostrar interfaz especial
  if (isRecurringPayment && selectedGateway === "wompi") {
    return (
      <div className="payment-gateway-selector mb-3">
        <div className="gateway-selector-header mb-2">
          <span className="gateway-label">Método de pago seleccionado:</span>
        </div>

        <div className="gateway-options">
          <div className="gateway-option selected recurring">
            <img src={wompiLogo} alt="Wompi" width={100} />
            <span className="gateway-description">
              <span className="recurring-label">Pago Automático Mensual</span>
              <br />
              Tarjetas de crédito y débito
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
            <span>Pago automático mensual habilitado con Wompi</span>
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
          }`}
          onClick={() => onChange("wompi")}
        >
          <img src={wompiLogo} alt="Wompi" width={100} />
          <span className="gateway-description">
            Tarjetas, PSE, <br /> Bancolombia Transfer
          </span>
        </div>

        <div
          className={`gateway-option ${
            selectedGateway === "wallet" ? "selected" : ""
          }`}
          onClick={() => onChange("wallet")}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              margin: "10px auto",
            }}
          >
            <img src={walletLogo} alt="" />
          </div>
          <span className="gateway-description">
            Pago por Wallet <br /> Manual
          </span>
        </div>
      </div>

      {/* Opción de pago recurrente */}
      {showRecurringOption && (
        <div className="recurring-option mt-2">
          <input
            type="checkbox"
            id="recurringPaymentCheck"
            className="form-check-input recurring-payment-checkbox"
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
            title="Los pagos automáticos permiten que se cargue automáticamente tu tarjeta de forma mensual."
          ></i>
        </div>
      )}

      {/* Información adicional sobre pagos recurrentes */}
      {enableRecurring && selectedGateway === "wompi" && (
        <div className="recurring-alert mt-2">
          <div className="alert-title">🔄 Pago Automático Activado</div>
          <div className="alert-content">
            Se configurará un cobro automático mensual a tu tarjeta. Podrás
            cancelarlo en cualquier momento.
          </div>
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
