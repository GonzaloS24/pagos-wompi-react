/* eslint-disable react/prop-types */
import { useState, useEffect, memo } from "react";
import { fetchWorkspaceBots } from "../../../services/api/assistantsApi";
import { PRICING } from "../../../utils/constants";
import Swal from "sweetalert2";

const ComplementsSection = memo(
  ({ 
    subscription, 
    selectedComplements, 
    onComplementsChange, 
    workspaceId,
    addonsWithDiscounts = [] // NUEVO: Recibir addons con discounts
  }) => {
    const [selectedComplement, setSelectedComplement] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [selectedBot, setSelectedBot] = useState("");
    const [botsList, setBotsList] = useState([]);
    const [loadingBots, setLoadingBots] = useState(false);

    // Inicializar los complementos seleccionados con los de la suscripción actual
    useEffect(() => {
      if (
        subscription &&
        subscription.complements &&
        selectedComplements.length === 0
      ) {
        onComplementsChange(subscription.complements);
      }
    }, [subscription, selectedComplements.length, onComplementsChange]);

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
            console.error("Error", e);
          } finally {
            setLoadingBots(false);
          }
        }
      };

      loadBots();
    }, [selectedComplement, workspaceId]);

    const validateQuantity = (currentQuantity, addingQuantity = 0) => {
      const total = currentQuantity + addingQuantity;
      if (total > PRICING.MAX_QUANTITY) {
        Swal.fire({
          icon: "warning",
          title: "Límite alcanzado",
          text: `No puedes agregar más de ${PRICING.MAX_QUANTITY} unidades`,
        });
        return false;
      }
      return true;
    };

    // NUEVO: Obtener addon por ID desde los datos con discounts
    const getAddonById = (id) => {
      return addonsWithDiscounts.find(addon => addon.id === id);
    };

    // NUEVO: Mapear ID numérico a ID string para compatibilidad
    const mapAddonIdToString = (numericId) => {
      const mapping = {
        "1": "bot",
        "2": "member", 
        "3": "webhooks"
      };
      return mapping[numericId] || numericId;
    };

    const handleAddComplement = () => {
      if (selectedComplement) {
        const addon = getAddonById(selectedComplement);
        
        if (!addon) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Complemento no encontrado",
          });
          return;
        }

        const stringId = mapAddonIdToString(addon.id);

        // Validación específica para webhooks
        if (stringId === "webhooks") {
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

        const newComplements = [...selectedComplements];

        // Para webhooks, verificamos si ya existe ese bot específico
        if (stringId === "webhooks") {
          const existingWebhookIndex = newComplements.findIndex(
            (c) => c.id === "webhooks" && c.selectedBot?.flow_ns === selectedBot
          );

          if (existingWebhookIndex !== -1) {
            // Actualizar cantidad para ese bot específico
            const newQuantity =
              newComplements[existingWebhookIndex].quantity + quantity;
            if (
              !validateQuantity(
                newComplements[existingWebhookIndex].quantity,
                quantity
              )
            ) {
              return;
            }
            newComplements[existingWebhookIndex] = {
              ...newComplements[existingWebhookIndex],
              quantity: newQuantity,
              totalPrice: addon.cost * newQuantity,
            };
          } else {
            // Agregar nuevo webhook para este bot
            newComplements.push({
              id: stringId,
              apiId: addon.id, // NUEVO: API ID numérico
              name: addon.name,
              description: "",
              priceUSD: addon.cost,
              cost: addon.cost, // NUEVO: para suscripciones
              discounts: addon.discounts, // NUEVO: incluir discounts
              quantity,
              uniqueId: Date.now(),
              totalPrice: addon.cost * quantity,
              selectedBot: {
                flow_ns: selectedBot,
                name: botsList.find((b) => b.flow_ns === selectedBot)?.name,
              },
            });
          }
        } else {
          // Para otros complementos
          const existingComplementIndex = newComplements.findIndex(
            (c) => c.id === stringId
          );

          if (existingComplementIndex !== -1) {
            const newQuantity =
              newComplements[existingComplementIndex].quantity + quantity;
            if (
              !validateQuantity(
                newComplements[existingComplementIndex].quantity,
                quantity
              )
            ) {
              return;
            }
            newComplements[existingComplementIndex] = {
              ...newComplements[existingComplementIndex],
              quantity: newQuantity,
              totalPrice: addon.cost * newQuantity,
            };
          } else {
            newComplements.push({
              id: stringId,
              apiId: addon.id, // NUEVO: API ID numérico
              name: addon.name,
              description: "",
              priceUSD: addon.cost,
              cost: addon.cost, // NUEVO: para suscripciones
              discounts: addon.discounts, // NUEVO: incluir discounts
              quantity,
              uniqueId: Date.now(),
              totalPrice: addon.cost * quantity,
            });
          }
        }

        onComplementsChange(newComplements);
        setSelectedComplement("");
        setSelectedBot("");
        setQuantity(1);
      }
    };

    const handleQuantityChange = (e) => {
      const value = parseInt(e.target.value);
      if (!isNaN(value) && value >= 1 && value <= PRICING.MAX_QUANTITY) {
        setQuantity(value);
      } else if (value > PRICING.MAX_QUANTITY) {
        Swal.fire({
          icon: "warning",
          title: "Límite alcanzado",
          text: `No puedes agregar más de ${PRICING.MAX_QUANTITY} unidades`,
        });
      }
    };

    const updateComplementQuantity = (
      complementId,
      change,
      selectedBotFlowNs = null
    ) => {
      const newComplements = selectedComplements
        .map((comp) => {
          const isTargetComplement =
            comp.id === complementId &&
            (selectedBotFlowNs
              ? comp.selectedBot?.flow_ns === selectedBotFlowNs
              : !comp.selectedBot);

          if (isTargetComplement) {
            const newQuantity = comp.quantity + change;

            if (newQuantity <= 0) return null;

            if (newQuantity > PRICING.MAX_QUANTITY) {
              Swal.fire({
                icon: "warning",
                title: "Límite alcanzado",
                text: `No puedes agregar más de ${PRICING.MAX_QUANTITY} unidades`,
              });
              return comp;
            }

            return {
              ...comp,
              quantity: newQuantity,
              totalPrice: (comp.cost || comp.priceUSD) * newQuantity,
            };
          }
          return comp;
        })
        .filter(Boolean);

      onComplementsChange(newComplements);
    };

    const groupedComplements = selectedComplements.reduce(
      (groups, complement) => {
        const key = complement.id;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(complement);
        return groups;
      },
      {}
    );

    if (!subscription) return null;

    return (
      <div className="complements-section p-2 bg-white rounded mb-4">
        <h5 style={{ color: "#009ee3" }} className="mb-3">
          Gestionar Complementos
        </h5>

        {/* Agregar nuevo complemento */}
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
            {/* USAR ADDONS CON DISCOUNTS */}
            {addonsWithDiscounts.map((addon) => (
              <option key={addon.id} value={addon.id}>
                {addon.name} (${addon.cost} USD)
                {addon.discounts && addon.discounts.length > 0 && (
                  <span> - Con descuentos disponibles</span>
                )}
              </option>
            ))}
          </select>

          {selectedComplement && (
            <>
              {mapAddonIdToString(selectedComplement) === "webhooks" && (
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
                  Cantidad (Máx. {PRICING.MAX_QUANTITY})
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
                    max={PRICING.MAX_QUANTITY}
                    aria-label="Cantidad de complementos"
                  />
                  <button
                    className="quantity-btn"
                    onClick={() => {
                      if (quantity < PRICING.MAX_QUANTITY) {
                        setQuantity((prev) => prev + 1);
                      } else {
                        Swal.fire({
                          icon: "warning",
                          title: "Límite alcanzado",
                          text: `No puedes agregar más de ${PRICING.MAX_QUANTITY} unidades`,
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
                  if (mapAddonIdToString(selectedComplement) === "webhooks") {
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

        {/* Lista de complementos seleccionados */}
        {Object.keys(groupedComplements).length > 0 && (
          <div className="selected-complements mt-4">
            <h6 className="text-muted mb-3">Complementos Configurados</h6>
            {Object.entries(groupedComplements).map(
              ([complementId, complements]) => (
                <div key={complementId} className="complement-group mb-3">
                  <div className="complement-header">
                    <h6 style={{ color: "#009ee3" }}>
                      {complements[0]?.name || complementId}
                    </h6>
                  </div>

                  {complements.map((complement, index) => {
                    // Determinar el estado del complemento
                    const originalComplement = subscription.complements?.find(
                      (currentComp) =>
                        currentComp.id === complement.id &&
                        (complement.selectedBot
                          ? currentComp.selectedBot?.flow_ns ===
                            complement.selectedBot?.flow_ns
                          : !currentComp.selectedBot)
                    );

                    const isFromCurrentSubscription =
                      Boolean(originalComplement);
                    const originalQuantity = originalComplement?.quantity || 0;
                    const currentQuantity = complement.quantity;

                    // Determinar el tipo de cambio
                    let changeType = "nuevo";
                    let changeDescription = "";

                    if (isFromCurrentSubscription) {
                      if (currentQuantity > originalQuantity) {
                        changeType = "aumento";
                        changeDescription = `+${
                          currentQuantity - originalQuantity
                        }`;
                      } else if (currentQuantity < originalQuantity) {
                        changeType = "disminucion";
                        changeDescription = `-${
                          originalQuantity - currentQuantity
                        }`;
                      } else {
                        changeType = "sin-cambios";
                        changeDescription = "Sin cambios";
                      }
                    }

                    return (
                      <div
                        key={`${complement.id}-${
                          complement.selectedBot?.flow_ns || "default"
                        }-${index}`}
                        className="selected-complement-item mb-2 p-3"
                        style={{
                          background: isFromCurrentSubscription
                            ? "#edf4ff"
                            : "#d4edda",
                          border: `1px solid ${
                            isFromCurrentSubscription
                              ? "rgba(0, 158, 227, 0.2)"
                              : "rgba(40, 167, 69, 0.2)"
                          }`,
                          borderRadius: "8px",
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <span className="fw-medium">{complement.name}</span>
                            {complement.selectedBot && (
                              <small className="d-block text-muted">
                                Bot: {complement.selectedBot.name}
                              </small>
                            )}
                            <small className="d-block text-muted">
                              ${complement.cost || complement.priceUSD} USD c/u
                              {complement.apiId && (
                                <span className="ms-2">(API ID: {complement.apiId})</span>
                              )}
                            </small>
                            {/* NUEVO: Mostrar descuentos disponibles */}
                            {complement.discounts && complement.discounts.length > 0 && (
                              <div className="discounts-info mt-1">
                                {complement.discounts.map((discount, idx) => (
                                  <span key={idx} className="discount-badge me-1">
                                    {discount.type === 'percentage' 
                                      ? `-${discount.value}%` 
                                      : `-$${discount.value}`}
                                  </span>
                                ))}
                              </div>
                            )}
                            {isFromCurrentSubscription && (
                              <small className="d-block text-muted">
                                Original: {originalQuantity} → Actual:{" "}
                                {currentQuantity}{" "}
                                {changeDescription && `(${changeDescription})`}
                              </small>
                            )}
                            <span
                              className="badge mt-1"
                              style={{
                                backgroundColor:
                                  changeType === "nuevo"
                                    ? "#28a745"
                                    : changeType === "aumento"
                                    ? "#ffc107"
                                    : changeType === "disminucion"
                                    ? "#dc3545"
                                    : "#6c757d",
                                color:
                                  changeType === "aumento" ? "#000" : "white",
                              }}
                            >
                              {changeType === "nuevo"
                                ? "Nuevo"
                                : changeType === "aumento"
                                ? `+${currentQuantity - originalQuantity}`
                                : changeType === "disminucion"
                                ? `-${originalQuantity - currentQuantity}`
                                : "Sin cambios"}
                            </span>
                          </div>

                          <div className="d-flex align-items-center gap-2">
                            <div className="quantity-controls d-flex align-items-center justify-content-center gap-3">
                              <button
                                className="quantity-btn"
                                onClick={() =>
                                  updateComplementQuantity(
                                    complement.id,
                                    -1,
                                    complement.selectedBot?.flow_ns
                                  )
                                }
                                aria-label="Disminuir cantidad"
                              >
                                -
                              </button>
                              <span className="quantity-input--static">
                                {complement.quantity}
                              </span>
                              <button
                                className="quantity-btn"
                                onClick={() =>
                                  updateComplementQuantity(
                                    complement.id,
                                    1,
                                    complement.selectedBot?.flow_ns
                                  )
                                }
                                aria-label="Aumentar cantidad"
                              >
                                +
                              </button>
                            </div>

                            <div className="ms-2 text-end">
                              <div className="fw-medium">
                                ${complement.totalPrice} USD
                              </div>
                              <small className="text-muted">Total</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        )}

        {selectedComplements.length === 0 && (
          <div className="text-center text-muted py-4">
            <p>No hay complementos configurados</p>
            <p>
              <small>Usa el selector de arriba para agregar complementos</small>
            </p>
          </div>
        )}
      </div>
    );
  }
);

ComplementsSection.displayName = "ComplementsSection";

export default ComplementsSection;