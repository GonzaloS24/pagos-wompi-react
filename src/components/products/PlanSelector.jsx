import PropTypes from "prop-types";

const PlanSelector = ({
  plans,
  selectedPlan,
  onPlanChange,
  disabled = false,
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
        disabled={disabled}
      >
        <option value="">Seleccionar plan</option>
        {plans.map((plan) => (
          <option key={plan.id} value={plan.id}>
            {plan.name} - {plan.bot_users} usuarios
          </option>
        ))}
      </select>
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
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default PlanSelector;
