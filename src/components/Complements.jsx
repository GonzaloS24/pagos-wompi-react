/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import Swal from "sweetalert2";

const Complements = forwardRef(({ onComplementsChange }, ref) => {
  const [selectedComplement, setSelectedComplement] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedComplements, setSelectedComplements] = useState([]);
  const MAX_QUANTITY = 100;

  const complementsData = [
    {
      id: "bot",
      name: "🤖 1 Bot Adicional 🤖",
      description: "(Permite agregar un nuevo canal como FB, IG o WP)",
      priceUSD: 10,
    },
    {
      id: "member",
      name: "🙋‍♀️1 Miembro Adicional 🙋‍♀️",
      description: "(Permite agregar un nuevo asesor)",
      priceUSD: 10,
    },
    {
      id: "webhooks",
      name: "1.000 Webhooks Diarios 🔗",
      description: "",
      priceUSD: 10,
    },
  ];

  useImperativeHandle(ref, () => ({
    reset: () => {
      setSelectedComplement("");
      setQuantity(1);
      setSelectedComplements([]);
      onComplementsChange([]);
    },
  }));

  useEffect(() => {
    onComplementsChange(selectedComplements);
  }, [selectedComplements, onComplementsChange]);

  const validateQuantity = (currentQuantity, addingQuantity = 0) => {
    const total = currentQuantity + addingQuantity;
    if (total > MAX_QUANTITY) {
      Swal.fire({
        icon: "warning",
        title: "Límite alcanzado",
        text: `No puedes agregar más de ${MAX_QUANTITY} unidades`,
      });
      return false;
    }
    return true;
  };

  const handleAddComplement = () => {
    if (selectedComplement) {
      const complement = complementsData.find(
        (c) => c.id === selectedComplement
      );

      setSelectedComplements((prevComplements) => {
        const existingComplement = prevComplements.find(
          (c) => c.id === complement.id
        );

        const existingQuantity = existingComplement
          ? existingComplement.quantity
          : 0;

        if (!validateQuantity(existingQuantity, quantity)) {
          return prevComplements;
        }

        const existingComplementIndex = prevComplements.findIndex(
          (c) => c.id === complement.id
        );

        let newComplements;
        if (existingComplementIndex !== -1) {
          newComplements = prevComplements.map((comp, index) => {
            if (index === existingComplementIndex) {
              return {
                ...comp,
                quantity: comp.quantity + quantity,
                totalPrice: comp.priceUSD * (comp.quantity + quantity),
              };
            }
            return comp;
          });
        } else {
          newComplements = [
            ...prevComplements,
            {
              ...complement,
              quantity,
              uniqueId: Date.now(),
              totalPrice: complement.priceUSD * quantity,
            },
          ];
        }

        return newComplements;
      });

      setSelectedComplement("");
      setQuantity(1);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= MAX_QUANTITY) {
      setQuantity(value);
    } else if (value > MAX_QUANTITY) {
      Swal.fire({
        icon: "warning",
        title: "Límite alcanzado",
        text: `No puedes agregar más de ${MAX_QUANTITY} unidades`,
      });
    }
  };

  const updateComplementQuantity = (complementId, change) => {
    setSelectedComplements((prevComplements) => {
      const newComplements = prevComplements
        .map((comp) => {
          if (comp.id === complementId) {
            const newQuantity = comp.quantity + change;

            if (newQuantity <= 0) return null;

            if (newQuantity > MAX_QUANTITY) {
              Swal.fire({
                icon: "warning",
                title: "Límite alcanzado",
                text: `No puedes agregar más de ${MAX_QUANTITY} unidades`,
              });
              return comp;
            }

            return {
              ...comp,
              quantity: newQuantity,
              totalPrice: comp.priceUSD * newQuantity,
            };
          }
          return comp;
        })
        .filter(Boolean);

      return newComplements;
    });
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
          aria-label="Seleccionar complemento"
        >
          <option value="">Seleccionar complemento</option>
          {complementsData.map((complement) => (
            <option key={complement.id} value={complement.id}>
              {complement.name} {complement.description} (${complement.priceUSD}{" "}
              USD)
            </option>
          ))}
        </select>

        {selectedComplement && (
          <>
            <div className="quantity-section mb-3">
              <label className="form-label text-muted mb-2">
                Cantidad (Máx. {MAX_QUANTITY})
              </label>
              <div className="quantity-controls d-flex align-items-center gap-3">
                <button
                  className="btn btn-outline-primary quantity-btn"
                  onClick={() =>
                    setQuantity((prev) => (prev > 1 ? prev - 1 : 1))
                  }
                  disabled={quantity <= 1}
                  aria-label="Disminuir cantidad"
                >
                  -
                </button>
                <input
                  type="number"
                  className="form-control quantity-input"
                  value={quantity}
                  onChange={handleQuantityChange}
                  min="1"
                  max={MAX_QUANTITY}
                  aria-label="Cantidad de complementos"
                />
                <button
                  className="btn btn-outline-primary quantity-btn"
                  onClick={() => {
                    if (quantity < MAX_QUANTITY) {
                      setQuantity((prev) => prev + 1);
                    } else {
                      Swal.fire({
                        icon: "warning",
                        title: "Límite alcanzado",
                        text: `No puedes agregar más de ${MAX_QUANTITY} unidades`,
                      });
                    }
                  }}
                  aria-label="Aumentar cantidad"
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
                <div>
                  <span>{complement.name}</span>
                  <small className="d-block text-muted">
                    ${complement.totalPrice} USD
                  </small>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div className="quantity-controls d-flex align-items-center gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() =>
                        updateComplementQuantity(complement.id, -1)
                      }
                      aria-label="Disminuir cantidad"
                    >
                      -
                    </button>
                    <span className="badge bg-primary">
                      {complement.quantity}
                    </span>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => updateComplementQuantity(complement.id, 1)}
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default Complements;
