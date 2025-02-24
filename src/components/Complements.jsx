/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import Swal from "sweetalert2";
import { fetchWorkspaceBots } from "../api/wompiConfig";

const Complements = forwardRef(({ onComplementsChange, workspaceId }, ref) => {
  const [selectedComplement, setSelectedComplement] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedComplements, setSelectedComplements] = useState([]);
  const [botsList, setBotsList] = useState([]);
  const [selectedBot, setSelectedBot] = useState("");
  const [loadingBots, setLoadingBots] = useState(false);
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
      setSelectedBot("");
      setBotsList([]);
      onComplementsChange([]);
    },
  }));

  useEffect(() => {
    onComplementsChange(selectedComplements);
  }, [selectedComplements, onComplementsChange]);

  useEffect(() => {
    const loadBots = async () => {
      if (selectedComplement === "webhooks" && workspaceId) {
        setLoadingBots(true);
        try {
          const botsData = await fetchWorkspaceBots(workspaceId);
          setBotsList(botsData);
        } catch (e) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudieron cargar los bots disponibles",
          });
          console.log(e);
        } finally {
          setLoadingBots(false);
        }
      }
    };

    loadBots();
  }, [selectedComplement, workspaceId]);

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

      // Validación específica para webhooks
      if (complement.id === "webhooks") {
        if (!selectedBot) {
          Swal.fire({
            icon: "warning",
            title: "Bot no seleccionado",
            text: "Por favor selecciona un bot para agregar los webhooks",
            confirmButtonColor: "#009ee3",
          });
          return;
        }

        if (botsList.length === 0) {
          Swal.fire({
            icon: "error",
            title: "No hay bots disponibles",
            text: "Este espacio de trabajo no tiene bots disponibles",
            confirmButtonColor: "#009ee3",
          });
          return;
        }
      }

      if (complement.id === "webhooks" && !selectedBot) {
        Swal.fire({
          icon: "warning",
          title: "Selección requerida",
          text: "Por favor selecciona un bot para los webhooks",
        });
        return;
      }

      setSelectedComplements((prevComplements) => {
        // Para webhooks, verificamos si ya existe ese bot específico
        if (complement.id === "webhooks") {
          const existingWebhookForBot = prevComplements.find(
            (c) => c.id === "webhooks" && c.selectedBot.flow_ns === selectedBot
          );

          if (existingWebhookForBot) {
            // Actualizar cantidad para ese bot específico
            return prevComplements.map((comp) => {
              if (
                comp.id === "webhooks" &&
                comp.selectedBot.flow_ns === selectedBot
              ) {
                const newQuantity = comp.quantity + quantity;
                if (!validateQuantity(comp.quantity, quantity)) {
                  return comp;
                }
                return {
                  ...comp,
                  quantity: newQuantity,
                  totalPrice: comp.priceUSD * newQuantity,
                };
              }
              return comp;
            });
          }
        } else {
          const existingComplement = prevComplements.find(
            (c) => c.id === complement.id
          );
          if (existingComplement) {
            return prevComplements.map((comp) => {
              if (comp.id === complement.id) {
                const newQuantity = comp.quantity + quantity;
                if (!validateQuantity(comp.quantity, quantity)) {
                  return comp;
                }
                return {
                  ...comp,
                  quantity: newQuantity,
                  totalPrice: comp.priceUSD * newQuantity,
                };
              }
              return comp;
            });
          }
        }

        // Si no existe, agregar nuevo
        return [
          ...prevComplements,
          {
            ...complement,
            quantity,
            uniqueId: Date.now(),
            totalPrice: complement.priceUSD * quantity,
            selectedBot:
              complement.id === "webhooks"
                ? {
                    flow_ns: selectedBot,
                    name: botsList.find((b) => b.flow_ns === selectedBot)?.name,
                  }
                : null,
          },
        ];
      });

      setSelectedComplement("");
      setSelectedBot("");
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

      <p className="text-muted mb-3">
        Cada complemento tiene un costo adicional de $10 USD
      </p>

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
            {selectedComplement === "webhooks" && (
              <div className="mb-3">
                <label className="form-label text-muted mb-2">
                  Selecciona el Bot
                </label>
                <select
                  className="form-select complement-select mb-3"
                  value={selectedBot}
                  onChange={(e) => setSelectedBot(e.target.value)}
                  aria-label="Seleccionar bot"
                  disabled={loadingBots}
                >
                  <option value="">
                    {loadingBots ? "Cargando bots..." : "Seleccionar bot"}
                  </option>
                  {botsList.length > 0 ? (
                    botsList.map((bot) => (
                      <option key={bot.flow_ns} value={bot.flow_ns}>
                        {bot.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No hay bots disponibles en este espacio
                    </option>
                  )}
                </select>
                {!loadingBots && botsList.length === 0 && (
                  <small className="text-danger">
                    No hay bots disponibles en este espacio de trabajo
                  </small>
                )}
              </div>
            )}

            <div className="quantity-section mb-3">
              <label className="form-label text-muted mb-2">
                Cantidad (Máx. {MAX_QUANTITY})
              </label>
              <div className="quantity-controls d-flex align-items-center gap-3">
                <button
                  className="quantity-btn"
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
                  className="quantity-btn"
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
              className="complemnts-btn"
              onClick={() => {
                if (selectedComplement === "webhooks") {
                  if (botsList.length === 0) {
                    Swal.fire({
                      icon: "error",
                      title: "No hay bots disponibles",
                      text: "Este espacio de trabajo no tiene bots disponibles",
                      confirmButtonColor: "#009ee3",
                    });
                    return;
                  }
                  if (!selectedBot) {
                    Swal.fire({
                      icon: "warning",
                      title: "Bot no seleccionado",
                      text: "Por favor selecciona un bot para agregar los webhooks",
                      confirmButtonColor: "#009ee3",
                    });
                    return;
                  }
                }
                handleAddComplement();
              }}
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
                  {complement.selectedBot && (
                    <small className="d-block text-muted">
                      Bot: {complement.selectedBot.name}
                    </small>
                  )}
                  <small className="d-block text-muted">
                    ${complement.totalPrice} USD
                  </small>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div className="quantity-controls d-flex align-items-center justify-content-center gap-3">
                    <button
                      className="quantity-btn"
                      onClick={() =>
                        updateComplementQuantity(complement.id, -1)
                      }
                      aria-label="Disminuir cantidad"
                    >
                      -
                    </button>
                    <span className="form-control quantity-input--static">
                      {complement.quantity}
                    </span>
                    <button
                      className="quantity-btn"
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
