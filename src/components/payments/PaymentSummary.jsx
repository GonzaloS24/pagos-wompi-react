/* eslint-disable react/prop-types */
import { PRICING } from "../../utils/constants";

const PaymentSummary = ({
  selectedPlan,
  usdToCopRate,
  selectedAssistants,
  isAssistantsOnly,
  selectedComplements = [],
  paymentCalculations,
}) => {
  const assistantPrice = PRICING.ASSISTANT_PRICE_USD;
  const isAnnual = paymentCalculations?.isAnnual || false;

  let totalAssistantsPrice;
  let assistantsLabel;

  if (isAssistantsOnly) {
    totalAssistantsPrice = selectedAssistants.length * assistantPrice;
    assistantsLabel = `${selectedAssistants.length} adicional (${totalAssistantsPrice})`;
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

  const totalUSD =
    paymentCalculations?.totalUSD ||
    planPrice + totalAssistantsPrice + totalComplementsPrice;

  // Cálculo del precio en COP
  const totalCOP =
    paymentCalculations?.priceInCOP ||
    (usdToCopRate && usdToCopRate > 0
      ? Math.round(totalUSD * usdToCopRate)
      : totalUSD * 4000);

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

            {/* Mostrar información de periodicidad */}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted">Periodicidad:</span>
              <span className="fw-medium">
                {isAnnual ? (
                  <>
                    Anual
                    <span className="annual-badge ms-2">
                      <i className="bx bx-gift"></i>
                      -15%
                    </span>
                  </>
                ) : (
                  "Mensual"
                )}
              </span>
            </div>

            {/* Precio del plan con comparación si es anual */}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted">
                {isAnnual ? "Plan (anual):" : "Precio plan:"}
              </span>
              <span className={`fw-medium ${isAnnual ? "text-success" : ""}`}>
                {isAnnual && paymentCalculations?.planPriceInfo ? (
                  <>
                    ${paymentCalculations.planPriceInfo.finalPrice.toFixed(2)}{" "}
                    USD
                    <span className="ms-2 text-muted text-decoration-line-through small">
                      ${(selectedPlan.priceUSD * 12).toFixed(2)} USD
                    </span>
                  </>
                ) : (
                  `$${planPrice.toFixed(2)}`
                )}
              </span>
            </div>
          </>
        )}

        {selectedAssistants.length > 0 && (
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted">
              Asistentes{isAnnual && !isAssistantsOnly ? "(anual):" : ":"}
            </span>
            <span className="fw-medium">
              {isAnnual && !isAssistantsOnly
                ? `$${(paymentCalculations.baseAssistantsPrice * 12).toFixed(
                    2
                  )}`
                : assistantsLabel}
            </span>
          </div>
        )}

        {selectedComplements.length > 0 && (
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted">
              Complementos{isAnnual && !isAssistantsOnly ? "(anual):" : ":"}
            </span>
            <span className="fw-medium">
              $
              {isAnnual && !isAssistantsOnly
                ? (totalComplementsPrice * 12).toFixed(2)
                : totalComplementsPrice}
            </span>
          </div>
        )}

        {/* Mostrar ahorro solo si es anual */}
        {isAnnual && paymentCalculations?.totalAnnualSavings > 0 && (
          <div
            className="d-flex justify-content-between align-items-center mb-2"
            style={{
              backgroundColor: "rgba(40, 167, 69, 0.1)",
              padding: "0.5rem",
              borderRadius: "6px",
            }}
          >
            <span className="text-success fw-medium">
              <i className="bx bx-gift me-1"></i>
              Ahorro anual:
            </span>
            <span className="fw-bold text-success">
              -${paymentCalculations.totalAnnualSavings.toFixed(2)}
            </span>
          </div>
        )}

        <hr
          style={{
            margin: "0.75rem 0",
            borderColor: "rgba(0, 158, 227)",
          }}
        />

        {/* Totales */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="text-muted">
            Total en dólares{isAnnual ? "(anual)" : ""}:
          </span>
          <span className="fw-medium">USD ${totalUSD.toFixed(2)}</span>
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <span className="text-muted">
            Total en pesos colombianos{isAnnual ? "(anual)" : ""}:
          </span>
          <span style={{ color: "#009ee3" }} className="fw-bold">
            COP ${totalCOP.toLocaleString("es-CO")}
          </span>
        </div>
        <br />
        <div className="d-flex justify-content-between align-items-center">
          <span className="text-muted">
            <a className="rate-api" target="blank" href="https://www.exchangerate-api.com">
              TRM por Exchange Rate API
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;
