import PropTypes from "prop-types";

const WalletPaymentSummary = ({
  //   paymentData,
  selectedPlan,
  selectedAssistants,
  selectedComplements,
  isAssistantsOnly,
  paymentCalculations,
  walletData,
  cedula = "",
  telefono = "",
}) => {
  const hasAssistants = selectedAssistants && selectedAssistants.length > 0;
  const hasComplements = selectedComplements && selectedComplements.length > 0;
  const hasPlan = !isAssistantsOnly && selectedPlan;
  const isAnnual = paymentCalculations?.isAnnual || false;
  const totalAnnualSavings = paymentCalculations?.totalAnnualSavings || 0;

  return (
    <div
      style={{
        background: "#edf4ff",
        border: "1px solid rgba(0, 158, 227, 0.2)",
      }}
      className="rounded mb-3 p-3"
    >
      <h6 style={{ color: "#009ee3" }} className="mb-2">
        Resumen del Pago
      </h6>

      {/* Mostrar datos personales si están disponibles */}
      {(cedula || telefono) && (
        <>
          {cedula && (
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Cédula:</span>
              <span>{cedula}</span>
            </div>
          )}
          {telefono && (
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Teléfono:</span>
              <span>{telefono}</span>
            </div>
          )}
          <hr
            style={{
              margin: "0.5rem 0",
              borderColor: "rgba(0, 158, 227, 0.2)",
            }}
          />
        </>
      )}

      {hasPlan && (
        <>
          <div className="d-flex justify-content-between mb-1">
            <span className="text-muted">Plan:</span>
            <span>{selectedPlan.name}</span>
          </div>

          <div className="d-flex justify-content-between mb-1">
            <span className="text-muted">Periodicidad:</span>
            <span>
              {isAnnual ? (
                <>
                  Anual
                  <span
                    className="ms-2"
                    style={{
                      background: "linear-gradient(135deg, #28a745, #20c997)",
                      color: "white",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "10px",
                      fontSize: "0.7rem",
                      fontWeight: "600",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    <i className="bx bx-gift"></i>
                    -15%
                  </span>
                </>
              ) : (
                "Mensual"
              )}
            </span>
          </div>
        </>
      )}

      {hasAssistants && (
        <div className="d-flex justify-content-between mb-1">
          <span className="text-muted">Asistentes:</span>
          <span>{selectedAssistants.join(", ")}</span>
        </div>
      )}

      {hasComplements && (
        <div className="d-flex justify-content-between mb-1">
          <span className="text-muted">Complementos:</span>
          <span>
            {selectedComplements
              .map((c) => `${c.id} (${c.quantity})`)
              .join(", ")}
          </span>
        </div>
      )}

      {isAnnual && totalAnnualSavings > 0 && (
        <div
          className="d-flex justify-content-between mb-1"
          style={{
            backgroundColor: "rgba(40, 167, 69, 0.1)",
            padding: "0.5rem",
            borderRadius: "6px",
            margin: "0.5rem -0.5rem",
          }}
        >
          <span className="text-success fw-medium">
            <i className="bx bx-gift me-1"></i>
            Ahorro anual:
          </span>
          <span className="fw-bold text-success">
            -${totalAnnualSavings.toFixed(2)} USD
          </span>
        </div>
      )}

      <div className="d-flex justify-content-between mb-1">
        <span className="text-muted">
          Total en dólares{isAnnual ? " (anual)" : ""}:
        </span>
        <span className="fw-bold" style={{ color: "#009ee3" }}>
          ${walletData.amountUSD.toFixed(2)} USD
        </span>
      </div>

      <div className="d-flex justify-content-between mb-1">
        <span className="text-muted">
          Total en pesos colombianos{isAnnual ? " (anual)" : ""}:
        </span>
        <span className="fw-bold" style={{ color: "#009ee3" }}>
          ${Math.round(walletData.amount)} COP
        </span>
      </div>
    </div>
  );
};

WalletPaymentSummary.propTypes = {
  paymentData: PropTypes.object.isRequired,
  selectedPlan: PropTypes.object,
  selectedAssistants: PropTypes.array.isRequired,
  selectedComplements: PropTypes.array.isRequired,
  isAssistantsOnly: PropTypes.bool.isRequired,
  paymentCalculations: PropTypes.object,
  walletData: PropTypes.object.isRequired,
  cedula: PropTypes.string,
  telefono: PropTypes.string,
};

export { WalletPaymentSummary };
export default WalletPaymentSummary;
