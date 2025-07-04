/* eslint-disable react/prop-types */
import { IoIosRemove, IoMdAdd } from "react-icons/io";
import { MdOutlineUpgrade } from "react-icons/md";
import { hasChanges } from "../utils/subscriptionHelpers";

const ChangesSummary = ({
  subscription,
  selectedAssistants,
  selectedPlan,
  selectedComplements,
  changesSummary,
  onProceedToPayment,
  modifying,
  usdToCopRate = 4200, // Rate de fallback
}) => {
  const hasAnyChanges = hasChanges(
    selectedAssistants,
    selectedPlan,
    selectedComplements,
    subscription
  );

  // Calcular total en COP
  const totalCOP = changesSummary?.totalAmount
    ? Math.round(changesSummary.totalAmount * usdToCopRate)
    : 0;

  return (
    <div className="changes-summary">
      <h5 style={{ color: "#009ee3" }}>Resumen de Cambios</h5>

      {!hasAnyChanges ? (
        <div className="no-changes">
          <p className="text-muted">No hay cambios pendientes</p>
        </div>
      ) : (
        <div className="changes-content">
          {changesSummary?.items?.map((item, index) => (
            <div key={index} className="change-item">
              <div className="change-description">
                <span className={`change-type ${item.type}`}>
                  {item.type === "add" ? (
                    <IoMdAdd style={{ fontSize: "25px" }} />
                  ) : item.type === "remove" ? (
                    <IoIosRemove style={{ fontSize: "25px" }} />
                  ) : (
                    <MdOutlineUpgrade style={{ fontSize: "25px" }} />
                  )}
                </span>
                <span>{item.description}</span>
              </div>
              <div className="change-amount">${item.amount.toFixed(2)} USD</div>
            </div>
          ))}

          <hr
            style={{
              margin: "0.75rem 0",
              borderColor: "rgba(0, 158, 227)",
            }}
          />

          {changesSummary?.totalAmount > 0 && (
            <>
              <div className="total-amount">
                <div className="d-flex justify-content-between align-items-center mb-0">
                  <p>Total en dólares:</p>
                  <span className="fw-bold" style={{ color: "#009ee3" }}>
                    ${changesSummary.totalAmount.toFixed(2)} USD
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <p>Total en pesos colombianos:</p>

                  <span className="fw-bold" style={{ color: "#009ee3" }}>
                    ${totalCOP.toLocaleString("es-CO")} COP
                  </span>
                </div>
              </div>
            </>
          )}

          <button
            className="btn-apply-changes"
            onClick={onProceedToPayment}
            disabled={modifying}
          >
            {changesSummary?.totalAmount > 0
              ? "Proceder al Pago"
              : "Aplicar Cambios"}
          </button>

          {changesSummary?.totalAmount > 0 && (
            <div className="changes-notice">
              <span>
                Se procesará el pago adicional de $
                {changesSummary.totalAmount.toFixed(2)} USD
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChangesSummary;
