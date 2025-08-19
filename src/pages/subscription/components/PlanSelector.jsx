/* eslint-disable react/prop-types */
const PlanSelector = ({ plans, selectedPlan, onPlanChange }) => {
  return (
    <div className="plan-selector-section">
      <h5 className="mb-3" style={{ color: "#009ee3" }}>
        Cambiar Plan
      </h5>
      <select
        className="form-select"
        value={selectedPlan?.id || ""}
        onChange={(e) => {
          const planId = e.target.value;
          const plan = plans.find((p) => p.id === planId);
          onPlanChange(plan);
        }}
      >
        {plans.map((plan) => (
          <option key={plan.id} value={plan.id}>
            {plan.name} - ${plan.priceUSD} USD/mes
          </option>
        ))}
      </select>
    </div>
  );
};

export default PlanSelector;
