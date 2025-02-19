/* eslint-disable react/prop-types */

import { convertUSDtoCOPCents } from "../utils/wompiHelpers";

const PaymentSummary = ({ selectedPlan, usdToCopRate }) => {
  return (
    <div style={{ background: "#edf4ff" }} className=" rounded mb-4">
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
          <span className="text-muted">Precio en USD:</span>
          <span className="fw-medium">${selectedPlan.priceUSD}</span>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <span className="text-muted">Precio en COP:</span>
          <span style={{ color: "#009ee3" }} className="fw-bold">
            $
            {Math.round(
              convertUSDtoCOPCents(selectedPlan.priceUSD, usdToCopRate) / 100
            ).toLocaleString("es-CO")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;
