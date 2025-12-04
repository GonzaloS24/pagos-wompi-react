import PropTypes from "prop-types";
import WalletPaymentSummary from "../WalletPaymentSummary";
import { LATAM_CURRENCIES } from "../../../../services/api/currencyService";

const WalletStepOne = ({
  paymentData,
  selectedPlan,
  selectedAssistants,
  selectedComplements,
  isAssistantsOnly,
  paymentCalculations,
  walletData,
  cedula = "",
  telefono = "",
  tipoDocumento = "",
  selectedCurrency = "",
  currencyRates = null,
  onCurrencyChange,
  errors = {},
}) => {
  return (
    <div>
      <h5 className="text-center mb-3" style={{ color: "#009ee3" }}>
        Paso 1: Revisar tu Compra
      </h5>

      {/* Selector de moneda */}
      <div className="mb-3">
        <label
          className="form-label"
          style={{ fontWeight: "500", color: "#4a5568" }}
        >
          Selecciona el país según la moneda con la que se realizará el pago. *
        </label>
        <select
          className={`form-select ${errors.currency ? "is-invalid" : ""}`}
          value={selectedCurrency}
          onChange={(e) => onCurrencyChange(e.target.value)}
          style={{
            borderRadius: "6px",
            padding: "0.75rem",
            fontSize: "1rem",
            border: errors.currency
              ? "1px solid #dc3545"
              : "1px solid rgba(0, 158, 227, 0.3)",
            background: "#fff",
          }}
        >
          <option value="">Selecciona tu país</option>
          {LATAM_CURRENCIES.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.country} - {currency.name} ({currency.symbol})
            </option>
          ))}
        </select>
        {errors.currency && (
          <div className="invalid-feedback" style={{ display: "block" }}>
            {errors.currency}
          </div>
        )}
      </div>

      {selectedCurrency && (
        <WalletPaymentSummary
          paymentData={paymentData}
          selectedPlan={selectedPlan}
          selectedAssistants={selectedAssistants}
          selectedComplements={selectedComplements}
          isAssistantsOnly={isAssistantsOnly}
          paymentCalculations={paymentCalculations}
          walletData={walletData}
          cedula={cedula}
          telefono={telefono}
          tipoDocumento={tipoDocumento}
          selectedCurrency={selectedCurrency}
          currencyRates={currencyRates}
        />
      )}

      <p className="text-center text-muted">
        Verifica que todos los datos sean correctos antes de continuar.
      </p>
    </div>
  );
};

WalletStepOne.propTypes = {
  paymentData: PropTypes.object.isRequired,
  selectedPlan: PropTypes.object,
  selectedAssistants: PropTypes.array.isRequired,
  selectedComplements: PropTypes.array.isRequired,
  isAssistantsOnly: PropTypes.bool.isRequired,
  paymentCalculations: PropTypes.object,
  walletData: PropTypes.object.isRequired,
  cedula: PropTypes.string,
  telefono: PropTypes.string,
  tipoDocumento: PropTypes.string,
  selectedCurrency: PropTypes.string,
  currencyRates: PropTypes.object,
  onCurrencyChange: PropTypes.func.isRequired,
  errors: PropTypes.object,
};

export default WalletStepOne;
