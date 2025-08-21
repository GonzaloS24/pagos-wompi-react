/* eslint-disable react/prop-types */
const CurrentPlanSection = ({
  subscription,
  onCancelSubscription,
  onUpdatePayment,
  modifying,
}) => {
  // Función para obtener el texto del tipo de documento
  const getDocumentTypeText = (type) => {
    switch (type) {
      case "cedula":
        return "CC";
      case "nit":
        return "NIT";
      case "otro":
        return "OTRO";
      default:
        return type?.toUpperCase() || "";
    }
  };

  return (
    <div className="current-plan-section">
      <h5 style={{ color: "#009ee3" }}>Plan Actual</h5>
      <div className="current-plan-info">
        <div className="plan-details">
          <span className="plan-name">{subscription.planName}</span>
          <span className="plan-next-payment">
            Correo: {subscription.owner_email}
          </span>
          <span className="plan-next-payment">
            Workspace ID: {subscription.workspaceId}
          </span>

          {/* Mostrar documento si existe */}
          {subscription.document_type && subscription.document_number && (
            <span className="plan-next-payment">
              Documento: {getDocumentTypeText(subscription.document_type)}{" "}
              {subscription.document_number}
            </span>
          )}

          <span className="plan-next-payment">
            Próximo pago: {subscription.nextPaymentDate}
          </span>

          <span className="plan-status">
            Estado:{" "}
            <span className={`status ${subscription.status.toLowerCase()}`}>
              {subscription.status === "ACTIVE"
                ? "Activa"
                : subscription.status}
            </span>
          </span>

          <div className="plan-actions">
            <button
              className="btn-update-payment"
              onClick={onUpdatePayment}
              disabled={modifying}
            >
              Actualizar Metodo de Pago
            </button>

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
    </div>
  );
};

export default CurrentPlanSection;
