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
}) => {
  const hasAnyChanges = hasChanges(
    selectedAssistants,
    selectedPlan,
    selectedComplements,
    subscription
  );

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
              <div className="change-amount">
                {item.amount > 0 ? `$0.00` : "$0.00"}
              </div>
            </div>
          ))}

          {changesSummary?.totalAmount > 0 && (
            <div className="total-amount">
              <p>Total a pagar: $0.00 USD</p>
            </div>
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
        </div>
      )}
    </div>
  );
};

export default ChangesSummary;
