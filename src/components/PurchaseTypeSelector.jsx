import { useState } from "react";

/* eslint-disable react/prop-types */
const PurchaseTypeSelector = ({ onSelect }) => {
  const [selected, setSelected] = useState(null);

  const handleSelect = (type) => {
    setSelected(type);
    onSelect(type);
  };

  return (
    <div className="purchase-options mb-4 text-center">
      <h5 style={{ color: "#009ee3" }} className="mb-4">
        ¿Qué deseas adquirir?
      </h5>
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
            <h6 className="mb-2">Plan + Asistentes</h6>
            <p className="text-muted small mb-0">
              Selecciona un plan y agrega asistentes opcionales
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
            <h6 className="mb-2">Solo Asistentes</h6>
            <p className="text-muted small mb-0">
              Agrega asistentes a tu plan actual
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseTypeSelector;
