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
  usdToCopRate = 4200,
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

  const hasPayment = changesSummary?.totalAmount > 0;

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

          {hasPayment && (
            <>
              <div className="total-amount">
                <div className="d-flex justify-content-between align-items-center mb-0">
                  <p>Total a pagar:</p>
                  <span className="fw-bold" style={{ color: "#009ee3" }}>
                    ${changesSummary.totalAmount.toFixed(2)} USD
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <p>En pesos colombianos:</p>
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
            {modifying ? "Procesando..." : "Aplicar Cambios"}
          </button>

          {hasPayment && (
            <div className="changes-notice">
              <i
                className="bx bx-credit-card"
                style={{ marginRight: "8px", color: "#009ee3" }}
              ></i>
              <span>
                Se cobrará ${changesSummary.totalAmount.toFixed(2)} USD a tu
                tarjeta registrada
              </span>
            </div>
          )}

          {!hasPayment && hasAnyChanges && (
            <div
              className="changes-notice"
              style={{
                backgroundColor: "#e8f5e9",
                borderColor: "#28a745",
                color: "#155724",
              }}
            >
              <i
                className="bx bx-check-circle"
                style={{ marginRight: "8px", color: "#28a745" }}
              ></i>
              <span>Sin costo adicional</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChangesSummary;
