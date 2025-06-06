/* eslint-disable react/prop-types */
import { useState } from "react";

const PlanPeriodToggle = ({
  selectedPlan,
  disabled = false,
  className = "",
}) => {
  const [isAnnual, setIsAnnual] = useState(false);

  const handleToggleChange = () => {
    if (disabled) return;
    setIsAnnual(!isAnnual);
  };

  // Cálculo de ahorros (solo visual)
  const annualSavings = selectedPlan
    ? (selectedPlan.priceUSD * 12 * 0.15).toFixed(2)
    : "88.20";

  return (
    <div className={`plan-period-toggle ${className}`}>
      <div className="period-toggle-container">
        <div className="period-toggle-header mb-3">
          <h6 className="period-toggle-title mb-2">
            Selecciona la periodicidad de pago
          </h6>
          {isAnnual && (
            <div className="annual-savings-badge">
              <i className="bx bx-gift"></i>
              <span>
                ¡Ahorra ${annualSavings} USD al año con el plan anual!
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
              onClick={handleToggleChange}
            >
              <input
                type="radio"
                name="paymentPeriod"
                value="monthly"
                checked={!isAnnual}
                onChange={() => {}}
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
              onClick={handleToggleChange}
            >
              <input
                type="radio"
                name="paymentPeriod"
                value="annual"
                checked={isAnnual}
                onChange={() => {}}
                disabled={disabled}
                className="toggle-input"
              />
              <span className="toggle-label">
                <i className="bx bx-calendar-check"></i>
                Anual
                <span className="discount-badge">-15%</span>
              </span>
            </label>
          </div>
        </div>

        {isAnnual && (
          <div className="annual-benefits mt-3">
            <div className="benefits-list">
              <div className="benefit-item">
                <i className="bx bx-check-circle"></i>
                <span>2 meses gratis equivalentes</span>
              </div>
              <div className="benefit-item">
                <i className="bx bx-check-circle"></i>
                <span>Descuento automático del 15%</span>
              </div>
              <div className="benefit-item">
                <i className="bx bx-check-circle"></i>
                <span>Facturación anual simplificada</span>
              </div>
            </div>
          </div>
        )}

        {/* Información de precios cuando está en anual */}
        {isAnnual && selectedPlan && (
          <div className="plan-price-details mt-3">
            <div
              className="price-breakdown p-3 rounded"
              style={{
                background: "#e8f5e9",
                border: "1px solid #4caf50",
              }}
            >
              <h6 className="mb-2" style={{ color: "#2e7d32" }}>
                <i className="bx bx-gift me-2"></i>
                Plan Anual Seleccionado
              </h6>

              <div className="price-details">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted small">Precio mensual:</span>
                  <span className="small">${selectedPlan.priceUSD} USD</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted small">
                    Precio anual sin descuento:
                  </span>
                  <span className="small text-decoration-line-through">
                    ${(selectedPlan.priceUSD * 12).toFixed(2)} USD
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-success fw-medium">
                    Precio anual con descuento:
                  </span>
                  <span className="text-success fw-bold">
                    ${(selectedPlan.priceUSD * 12 * 0.85).toFixed(2)} USD
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-success fw-medium">Tu ahorro:</span>
                  <span className="text-success fw-bold">
                    ${annualSavings} USD
                  </span>
                </div>
                <hr className="my-2" />
                <div className="text-center">
                  <small className="text-success fw-medium">
                    <i className="bx bx-check-circle me-1"></i>
                    Equivale a{" "}
                    {(annualSavings / selectedPlan.priceUSD).toFixed(1)} meses
                    gratis
                  </small>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanPeriodToggle;
