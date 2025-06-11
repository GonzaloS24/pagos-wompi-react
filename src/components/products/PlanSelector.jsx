import PropTypes from "prop-types";
// import PlanPeriodToggle from "../common/PlanPeriodToggle";

const PlanSelector = ({
  plans,
  selectedPlan,
  onPlanChange,
  // paymentPeriod,
  // onPeriodChange,
  planSelectorDisabled = false,
  // periodToggleDisabled = false,
  className = "",
}) => {
  const handlePlanChange = (e) => {
    const plan = plans.find((p) => p.id === e.target.value);
    onPlanChange(plan);
  };

  return (
    <div className={`plan-selector ${className}`}>
      <p style={{ color: "#009ee3" }} className="mb-3">
        Todos los planes incluyen por defecto el Asistente Logístico
        (confirmación, seguimiento y novedad)
      </p>

      <select
        className="form-select form-select-lg mb-3"
        onChange={handlePlanChange}
        value={selectedPlan?.id || ""}
        disabled={planSelectorDisabled}
      >
        <option value="">Seleccionar plan</option>
        {plans.map((plan) => (
          <option key={plan.id} value={plan.id}>
            {plan.name} - {plan.bot_users} usuarios
          </option>
        ))}
      </select>

      {/* {selectedPlan && (
        <PlanPeriodToggle
          period={paymentPeriod}
          onPeriodChange={onPeriodChange}
          selectedPlan={selectedPlan}
          disabled={periodToggleDisabled}
          className="mb-3"
        />
      )} */}
    </div>
  );
};

PlanSelector.propTypes = {
  plans: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      bot_users: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      priceUSD: PropTypes.number.isRequired,
    })
  ).isRequired,
  selectedPlan: PropTypes.object,
  onPlanChange: PropTypes.func.isRequired,
  paymentPeriod: PropTypes.string,
  onPeriodChange: PropTypes.func,
  planSelectorDisabled: PropTypes.bool,
  periodToggleDisabled: PropTypes.bool,
  className: PropTypes.string,
};

export default PlanSelector;
