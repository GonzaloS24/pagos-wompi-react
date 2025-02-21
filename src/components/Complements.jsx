/* eslint-disable react/display-name */

import { useState, forwardRef, useImperativeHandle } from "react";

const Complements = forwardRef((props, ref) => {
  const [selectedComplement, setSelectedComplement] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedComplements, setSelectedComplements] = useState([]);

  const complementsData = [
    {
      id: "bot",
      name: "🤖 1 Bot Adicional 🤖",
      description: "(Permite agregar un nuevo canal como FB, IG o WP)",
    },
    {
      id: "member",
      name: "🙋‍♀️1 Miembro Adicional 🙋‍♀️",
      description: "(Permite agregar un nuevo asesor)",
    },
    {
      id: "webhooks",
      name: "1.000 Webhooks Diarios 🔗",
      description: "",
    },
  ];

  // Exponer método de reset para el componente padre
  useImperativeHandle(ref, () => ({
    reset: () => {
      setSelectedComplement("");
      setQuantity(1);
      setSelectedComplements([]);
    },
  }));

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) {
      setQuantity(value);
    }
  };

  const handleAddComplement = () => {
    if (selectedComplement) {
      const complement = complementsData.find(
        (c) => c.id === selectedComplement
      );
      setSelectedComplements((prev) => [
        ...prev,
        {
          ...complement,
          quantity,
          uniqueId: Date.now(),
        },
      ]);
      setSelectedComplement("");
      setQuantity(1);
    }
  };

  return (
    <div className="complements-section p-2 bg-white rounded mb-4">
      <h5 style={{ color: "#009ee3" }} className="mb-3">
        Agregar complementos
      </h5>

      <div className="mb-3">
        <label className="form-label text-muted mb-2">
          Selecciona un complemento
        </label>
        <select
          className="form-select complement-select mb-3"
          value={selectedComplement}
          onChange={(e) => setSelectedComplement(e.target.value)}
        >
          <option value="">Seleccionar complemento</option>
          {complementsData.map((complement) => (
            <option key={complement.id} value={complement.id}>
              {complement.name} {complement.description}
            </option>
          ))}
        </select>

        {selectedComplement && (
          <>
            <div className="quantity-section mb-3">
              <label className="form-label text-muted mb-2">Cantidad</label>
              <div className="quantity-controls d-flex align-items-center gap-3">
                <button
                  className="btn btn-outline-primary quantity-btn"
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  className="form-control quantity-input"
                  value={quantity}
                  onChange={handleQuantityChange}
                  min="1"
                />
                <button
                  className="btn btn-outline-primary quantity-btn"
                  onClick={handleIncrement}
                >
                  +
                </button>
              </div>
            </div>

            <button
              className="btn btn-primary w-100"
              onClick={handleAddComplement}
              style={{ backgroundColor: "#009ee3", border: "none" }}
            >
              Agregar Complemento
            </button>
          </>
        )}
      </div>

      {selectedComplements.length > 0 && (
        <div className="selected-complements mt-4">
          <h6 className="text-muted mb-3">Complementos Agregados</h6>
          {selectedComplements.map((complement) => (
            <div
              key={complement.uniqueId}
              className="selected-complement-item mb-2 p-2 bg-light rounded"
            >
              <div className="d-flex justify-content-between align-items-center">
                <span>{complement.name}</span>
                <span className="badge bg-primary">x{complement.quantity}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default Complements;
