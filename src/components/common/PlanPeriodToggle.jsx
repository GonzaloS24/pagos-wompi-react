/* eslint-disable react/prop-types */
import { PAYMENT_PERIODS, PRICING } from "../../utils/constants";

const PlanPeriodToggle = ({
  period,
  onPeriodChange,
  selectedPlan,
  disabled = false,
  className = "",
}) => {
  const isAnnual = period === PAYMENT_PERIODS.ANNUAL;

  const handleToggleChange = () => {
    if (disabled) return;
    const newPeriod = isAnnual
      ? PAYMENT_PERIODS.MONTHLY
      : PAYMENT_PERIODS.ANNUAL;
    onPeriodChange(newPeriod);
  };

  // Calcular ahorro si hay un plan seleccionado
  const annualSavings = selectedPlan
    ? selectedPlan.priceUSD *
      PRICING.MONTHS_IN_YEAR *
      (PRICING.ANNUAL_DISCOUNT_PERCENTAGE / 100)
    : 0;

  return (
    <div className={`plan-period-toggle ${className}`}>
      <div className="period-toggle-container">
        <div className="period-toggle-header mb-3">
          <h6 className="period-toggle-title mb-2">
            Selecciona la periodicidad de pago
          </h6>
          {isAnnual && selectedPlan && (
            <div className="annual-savings-badge">
              <i className="bx bx-gift"></i>
              <span>
                ¡Ahorra ${annualSavings.toFixed(2)} USD al año con el plan
                anual!
              </span>
            </div>
          )}
        </div>

        <div className="toggle-switch-container">
          <div className="toggle-options">
            <label
              className={`toggle-option ${!isAnnual ? "active" : ""} ${
                disabled ? "disabled" : ""
              }`}
            >
              <input
                type="radio"
                name="paymentPeriod"
                value={PAYMENT_PERIODS.MONTHLY}
                checked={!isAnnual}
                onChange={handleToggleChange}
                disabled={disabled}
                className="toggle-input"
              />
              <span className="toggle-label">
                <i className="bx bx-calendar"></i>
                Mensual
              </span>
            </label>

            <label
              className={`toggle-option ${isAnnual ? "active" : ""} ${
                disabled ? "disabled" : ""
              }`}
            >
              <input
                type="radio"
                name="paymentPeriod"
                value={PAYMENT_PERIODS.ANNUAL}
                checked={isAnnual}
                onChange={handleToggleChange}
                disabled={disabled}
                className="toggle-input"
              />
              <span className="toggle-label">
                <i className="bx bx-calendar-check"></i>
                Anual
                <span className="discount-badge">
                  -{PRICING.ANNUAL_DISCOUNT_PERCENTAGE}%
                </span>
              </span>
            </label>
          </div>
        </div>

        {isAnnual && (
          <div className="annual-benefits mt-3">
            <div className="benefits-list">
              <div className="benefit-item">
                <i className="bx bx-check-circle"></i>
                <span>Descuento automático del 15% en toda tu compra</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanPeriodToggle;
