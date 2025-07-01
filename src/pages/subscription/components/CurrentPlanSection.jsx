/* eslint-disable react/prop-types */
const CurrentPlanSection = ({
  subscription,
  onCancelSubscription,
  modifying,
}) => {
  return (
    <div className="current-plan-section">
      <h5 style={{ color: "#009ee3" }}>Plan Actual</h5>
      <div className="current-plan-info">
        <div className="plan-details">
          <span className="plan-name">{subscription.planName}</span>
          <span className="plan-status">
            Estado:{" "}
            <span className={`status ${subscription.status.toLowerCase()}`}>
              {subscription.status === "ACTIVE"
                ? "Activa"
                : subscription.status}
            </span>
          </span>
          <span className="plan-next-payment">
            Próximo pago: {subscription.nextPaymentDate}
          </span>
          <div className="cancel-section">
            <button
              className="btn-cancel-subscription"
              onClick={onCancelSubscription}
              disabled={modifying}
            >
              Cancelar Suscripción
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentPlanSection;
