/* eslint-disable react/prop-types */
import { useState } from "react";

const PurchaseTypeSelector = ({ onSelect }) => {
  const [selected, setSelected] = useState(null);

  const handleSelect = (type) => {
    setSelected(type);
    onSelect(type);
  };

  return (
    <div className="purchase-options mb-4 text-center">
      <div className="row g-4">
        <div className="col-lg-6">
          <div
            className={`purchase-option p-4 rounded h-100 ${
              selected === "plan" ? "selected-option" : ""
            }`}
            onClick={() => handleSelect("plan")}
            role="button"
          >
            <div className="mb-3">🚀</div>
            <h5 className="mb-2">Plan, Asistentes y Complementos</h5>
            <p className="text-muted small mb-0">
              Elige un plan y agrega asistentes o complementos opcionales.
            </p>
          </div>
        </div>
        <div className="col-lg-6">
          <div
            className={`purchase-option p-4 rounded h-100 ${
              selected === "assistants" ? "selected-option" : ""
            }`}
            onClick={() => handleSelect("assistants")}
            role="button"
          >
            <div className="mb-3">🤖</div>
            <h5 className="mb-2">Asistentes y Complementos</h5>
            <p className="text-muted small mb-0">
              Agrega asistentes o complementos a tu plan actual.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseTypeSelector;
