/* eslint-disable react/prop-types */

import { convertUSDtoCOPCents } from "../utils/wompiHelpers";

const PaymentSummary = ({ selectedPlan, usdToCopRate, selectedAssistants }) => {
  const assistantPrice = 20;
  const totalAssistantsPrice = selectedAssistants.length * assistantPrice;
  const totalUSD = selectedPlan.priceUSD + totalAssistantsPrice;

  return (
    <div style={{ background: "#edf4ff" }} className="rounded mb-4 p-3">
      <div className="card-body">
        <h5 style={{ color: "#009ee3" }} className="card-title mb-3">
          Resumen del Plan
        </h5>
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
          <span className="text-muted">Precio Base USD:</span>
          <span className="fw-medium">${selectedPlan.priceUSD}</span>
        </div>
        {selectedAssistants.length > 0 && (
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted">
              Asistentes (+${assistantPrice} c/u):
            </span>
            <span className="fw-medium">${totalAssistantsPrice}</span>
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
