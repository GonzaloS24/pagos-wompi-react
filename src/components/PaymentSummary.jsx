/* eslint-disable react/prop-types */
import { convertUSDtoCOPCents } from "../utils/wompiHelpers";

const PaymentSummary = ({
  selectedPlan,
  usdToCopRate,
  selectedAssistants,
  isAssistantsOnly,
  selectedComplements = [],
}) => {
  const assistantPrice = 20;

  let totalAssistantsPrice;
  let assistantsLabel;

  if (isAssistantsOnly) {
    totalAssistantsPrice = selectedAssistants.length * assistantPrice;
    assistantsLabel = `${selectedAssistants.length} adicional ($${totalAssistantsPrice})`;
  } else {
    // Para la sección de Plan, el primero es gratis
    const freeAssistants = selectedAssistants.length > 0 ? 1 : 0;
    const paidAssistants = Math.max(
      0,
      selectedAssistants.length - freeAssistants
    );
    totalAssistantsPrice = paidAssistants * assistantPrice;

    if (selectedAssistants.length === 0) {
      assistantsLabel = "0 asistentes";
    } else if (selectedAssistants.length === 1) {
      assistantsLabel = "1 asistente (gratis)";
    } else {
      assistantsLabel = `1 gratis + ${paidAssistants} adicional${
        paidAssistants !== 1 ? "es" : ""
      } ($${totalAssistantsPrice})`;
    }
  }

  const planPrice = selectedPlan ? selectedPlan.priceUSD : 0;

  // Calcular el total de complementos
  const totalComplementsPrice = selectedComplements.reduce(
    (total, complement) => total + complement.totalPrice,
    0
  );

  const totalUSD = planPrice + totalAssistantsPrice + totalComplementsPrice;

  return (
    <div
      style={{
        background: "#edf4ff",
        border: "1px solid rgba(0, 158, 227, 0.2)",
      }}
      className="rounded mb-4 p-3"
    >
      <div className="card-body">
        <h5 style={{ color: "#009ee3" }} className="card-title mb-3">
          {isAssistantsOnly ? "Resumen de Asistentes" : "Resumen del Plan"}
        </h5>

        {!isAssistantsOnly && selectedPlan && (
          <>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted">Plan:</span>
              <span className="fw-medium">{selectedPlan.name}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted">Usuarios:</span>
              <span className="fw-medium">
                <i className="bx bxs-user user-icon"></i>
                {selectedPlan.bot_users}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted">Precio plan:</span>
              <span className="fw-medium">${selectedPlan.priceUSD}</span>
            </div>
          </>
        )}

        {selectedAssistants.length > 0 && (
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted">Asistentes:</span>
            <span className="fw-medium">{assistantsLabel}</span>
          </div>
        )}

        {selectedComplements.length > 0 && (
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted">Complementos:</span>
            <span className="fw-medium">${totalComplementsPrice}</span>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="text-muted">Total USD:</span>
          <span className="fw-medium">${totalUSD}</span>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <span className="text-muted">Total COP:</span>
          <span style={{ color: "#009ee3" }} className="fw-bold">
            $
            {Math.round(
              convertUSDtoCOPCents(totalUSD, usdToCopRate) / 100
            ).toLocaleString("es-CO")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;
